// SECOND SPRING - local demo (no server). Open with VS Code "Live Server".
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const R={cr:'Credits',sa:'Salvage',re:'Rare Earths',se:'Seeds',fc:'Fusion Cells',bc:'Biochar'};
const LN={f:'Forest',w:'Wetland',s:'Settlement',p:'Fusion Plant',c:'Wildlife Corridor',r:'Clear a Ruin'};
const PC=['#4be07a','#ef5a52','#f0c63c','#4f8cff'];
const SYMS=['<polygon points="0,-7.3 7.3,0 0,7.3 -7.3,0" fill="#39d56b"/>','<polygon points="0,-7 7.5,6 -7.5,6" fill="#f34f52"/>','<circle r="7.2" fill="#f5d343"/>','<rect x="-6.8" y="-6.8" width="13.6" height="13.6" rx="1.4" fill="#4299ff"/>'];
const symG=i=>`<g stroke="#101a14" stroke-width="1.5" stroke-linejoin="round">${SYMS[i]}</g>`,symHTML=(i,px)=>`<svg viewBox="-9 -9 18 18" width="${px}" height="${px}">${symG(i)}</svg>`;
const CORPS=[
{n:'Greenline Reclamation',t:'Reforestation guild',h:130,cr:42,pr:{se:1},d:'Forests you place also give +1 Cr'},
{n:'Ashfall Recycling',t:'Scrap recyclers',h:22,cr:36,st:{sa:4},d:'Clearing Ruins gives +1 extra Salvage'},
{n:'Vireo Seed Bank',t:'Seed vault co-op',h:95,cr:40,pr:{se:2},d:'Seeds pay 2 Cr each for Bio cards'},
{n:'Meridian Fusion',t:'Fusion grid builders',h:190,cr:38,pr:{fc:2},d:'Fusion Plant cards cost 4 less'},
{n:'Delta Rewilding Trust',t:'Wetland trust',h:175,cr:46,d:'Wetlands you place give +1 Biochar prod'},
{n:'Cairn Heavy Industries',t:'Heavy industry',h:35,cr:34,pr:{re:1},st:{sa:2},d:'Settlements you place give +1 Salvage prod'}];
// card format: name|cost|tags|type(E/B/A)|effects  P=production G=gain T=track L=place tile D=draw V=VP A=action(cost/gain)
const CARDS=`Ruin Clearance Crew|6|Ruin|E|Lr Gsa3
Seed Vault Opening|10|Bio|E|Gse5 Tso
Tidal Fusion Reactor|14|Tech|B|Pfc3
Mycorrhizal Network|12|Bio|B|Pse2
Carbon Capture Towers|16|Tech|A|Afc2/Tco
Scrapyard Foundry|9|Ruin|B|Psa2
Rare Earth Reclaimers|11|Tech Ruin|B|Pre2
Floodplain Restoration|15|Wetland|B|Lw Pbc1
Pollinator Swarm|8|Bio|E|Gse4 D1
Biochar Kilns|10|Tech Bio|B|Pbc2 Pfc-1
Nuclear Winter Reversal|24|Science|E|Tco Tco
Greenbelt Charter|18|Settlement|B|Ls Pcr2 V1
Prairie Rewilding Programme|13|Bio|B|Lf Pse1
Salvage Auctions|5|Ruin|E|Gcr6 Gsa2
Aquifer Recharge|17|Wetland Science|B|Lw Pcr1
Solar Farm Grid|11|Tech|B|Pfc2
Enclave Exchange|7|Settlement|A|Asa1/cr2
Soil Microbiome Lab|14|Science Bio|A|Abc4/Tso
Rewilding Drone Fleet|12|Tech Bio|A|Acr1/se2
Old World Archive Dig|6|Ruin Science|E|D2 Gre1
Wildlife Corridor Pact|9|Bio|B|Lc Gcr2
Fusion Plant Prototype|13|Tech|B|Lp Pre1
Peatland Revival|20|Wetland Bio|B|Lw Tco V2
Sealed Enclave Charter|16|Settlement|B|Pcr3 Pse-1
Orchard Terraces|10|Bio|B|Pse1 Pcr1 V1
Terraformer Veterans|7|Science|B|Pcr1 V1
Scrap Metal Rush|3|Ruin|E|Gsa5
Mangrove Barrier|15|Wetland Bio|B|Lw Gse3
High Density Housing|19|Settlement|B|Ls Psa1 V2
Atmospheric Filtration Grid|22|Tech|B|Tco Pcr2
Glacier Regrowth Project|28|Science|E|Tso Tso Lw
Fusion Cell Surplus|4|Tech|E|Gfc6
Compost Network|8|Bio|A|Ase4/bc3
Heavy Machinery Depot|12|Ruin Tech|B|Psa1 Pre1
Earth Day Festival|9|Settlement|E|Gtl
Hydroponic Skyfarm|14|Bio Tech|B|Pse3
Genetic Archive Reboot|26|Science Bio|B|Pse2 Tso V3
Ghost City Rebuild|17|Ruin Settlement|B|Lr Ls Pcr1
Weather Control Network|32|Tech Science|E|Tco Tco Twe
The Great Greening|35|Bio Science|B|Tco Tso Twe V6`.split('\n').map(l=>{const[n,c,t,y,f]=l.split('|');return{n,c:+c,t:t.split(' '),y,f:f.split(' ')}});
const D=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let G,AC,MG,NAME=localStorage.ss_name||'',vol=+(localStorage.ss_vol??.4);const FY=.67,RI={cr:'Cr',sa:'Fe',re:'Re',se:'Sd',fc:'Fc',bc:'C'};

/* ---------- SOUND (synthesised, no files needed) ---------- */
function au(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=vol;MG.connect(AC.destination);amb()}AC.resume()}
const tone=(f,d,ty='sine',v=.2,sl=0,t0=0)=>{if(!AC)return;const t=AC.currentTime+t0,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f+sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d)};
const nz=(d,fc,v=.2,t0=0)=>{if(!AC)return;const n=AC.sampleRate*d,b=AC.createBuffer(1,n,AC.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime+t0;s.buffer=b;f.type='lowpass';f.frequency.value=fc;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t)};
function amb(){ // soft wind + low drone + occasional birds
 const n=AC.sampleRate*4,b=AC.createBuffer(1,n,AC.sampleRate),x=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;x[i]=l*3}
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),L=AC.createOscillator(),lg=AC.createGain();
 s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=600;g.gain.value=.12;L.frequency.value=.12;lg.gain.value=.06;
 L.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(MG);s.start();L.start();
 [110,165].forEach(h=>{const o=AC.createOscillator(),q=AC.createGain();o.frequency.value=h;q.gain.value=.012;o.connect(q);q.connect(MG);o.start()});
 (function bird(){if(AC&&vol>0){const f=2200+Math.random()*1200;tone(f,.09,'sine',.03,400);tone(f*1.2,.09,'sine',.03,-300,.12)}setTimeout(bird,3500+Math.random()*6000)})()}
const SFX={w(){tone(420,.3,'sine',.25,-300);nz(.35,1200,.18);tone(700,.15,'sine',.08,-400,.08)},
f(){nz(.35,3000,.14);tone(523,.4,'triangle',.08);tone(659,.4,'triangle',.06,0,.1)},
s(){tone(98,.25,'square',.1);tone(147,.3,'triangle',.12,0,.05)},
p(){tone(180,.4,'sawtooth',.07,500)},c(){nz(.2,2000,.1);tone(587,.25,'triangle',.08)},
r(){nz(.3,500,.25);tone(70,.3,'square',.1)},
card(){[392,494,587,784].forEach((f,i)=>tone(f,.35,'triangle',.09,0,i*.06))},
err(){tone(130,.2,'sawtooth',.08)},gen(){[262,330,392,523].forEach((f,i)=>tone(f,.8,'sine',.1,0,i*.12))}};
const sfx=k=>{if(AC&&SFX[k])SFX[k]()};
function setVol(v){vol=v/100;localStorage.ss_vol=vol;if(MG)MG.gain.value=vol;$('#vl').textContent=v+'%'}

/* ---------- BACKGROUND MOTES ---------- */
const cv=$('#bg'),cx=cv.getContext('2d'),M=Array.from({length:55},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.5,s:Math.random()*.0004+.0001,p:Math.random()*6}));
(function loop(t){if(cv.width!=innerWidth||cv.height!=innerHeight){cv.width=innerWidth;cv.height=innerHeight}cx.clearRect(0,0,cv.width,cv.height);
 for(const m of M){m.y-=m.s;m.x+=Math.sin(t/2000+m.p)*.0003;if(m.y<0)m.y=1;cx.fillStyle=`rgba(220,255,200,${.25+.25*Math.sin(t/700+m.p)})`;cx.beginPath();cx.arc(m.x*cv.width,m.y*cv.height,m.r,0,7);cx.fill()}
 requestAnimationFrame(loop)})(0);

/* ---------- UI SKELETON ---------- */
const GEAR=`<svg viewBox="-16 -16 32 32" width="26" height="26" fill="none" stroke="currentColor"><circle r="12" stroke-width="4" stroke-dasharray="3.14 3.14"/><circle r="9.5" stroke-width="1.5"/><g fill="currentColor" stroke="none">${[0,72,144,216,288].map(a=>`<ellipse rx="3" ry="5.5" cy="-5" transform="rotate(${a})"/>`).join('')}</g></svg>`;
const LOGO=`<svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="15" fill="none" stroke="#b7e08a" stroke-width="3" stroke-dasharray="70 30" stroke-linecap="round" transform="rotate(-60)"/><path d="M0 12V0" stroke="#b7e08a" stroke-width="3"/><path d="M0 0Q-12-2-10-12Q2-10 0 0Z" fill="#b7e08a"/><path d="M0 4Q10 3 9-6Q-1-4 0 4Z" fill="#b7e08a"/></svg>`;
const CBACK=`${LOGO}<b>Second Spring</b>`;
const LEAF=`<svg viewBox="-8 -8 16 16" width="16" height="16"><path d="M-6 5Q-6-6 6-6Q6 5-6 5Z" fill="#b9de8c"/></svg>`,DROP=`<svg viewBox="-8 -8 16 16" width="16" height="16"><path d="M0-7Q6 0 0 6Q-6 0 0-7Z" fill="#7fd0e8"/></svg>`;
$('#app').innerHTML=`<div id="stage"><div id="mist"></div><svg id="bd" viewBox="-252 -158 504 316"><defs><pattern id="stp" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="4" height="9" fill="#f6ffbf" opacity=".7"><animate attributeName="x" from="0" to="9" dur="1.1s" repeatCount="indefinite"/></rect></pattern></defs><g id="cells"></g><g id="fx"></g></svg></div>
<div id="logo">${LOGO}<span>Second Spring</span></div><div id="top" class="panel"></div><div id="corps"></div>
<div id="cnt" class="panel"><b id="pc"></b><button id="gear" title="Settings" onclick="setp()">${GEAR}</button></div>
<div id="set" class="panel" hidden></div><div id="tab"></div><div id="ask" hidden></div>
<div id="sec"><h3>The returning world</h3><p id="log"></p></div>
<div id="deck"></div><div id="played" onclick="showPlayed()" title="Your played cards"></div><div id="std"></div><div id="res" class="panel"></div>
<div id="gen"></div><div id="hand" class="panel"></div><div id="foot1">SS—2300</div><div id="foot2">Private table · <span id="pn"></span> players</div>
<div id="lob"></div><div id="modal" hidden></div>`;

/* ---------- RULES ---------- */
const nb=c=>D.map(d=>G.map[(c.q+d[0])+','+(c.r+d[1])]).filter(Boolean);
const valid=t=>{const v=G.cells.filter(c=>t=='r'?c.t=='R':!c.t);if(t=='c'){const w=v.filter(c=>nb(c).some(n=>n.t=='f'));if(w.length)return w}return v};
const busy=()=>!G||G.pend.length>0||G.bot||G.over;
const cost=(p,cd)=>Math.max(0,cd.c-(p.c.n[0]=='M'&&cd.f.includes('Lp')?4:0));
const score=p=>p.tr+p.vp+G.cells.reduce((s,c)=>c.o===p.i?s+(c.t=='s'?nb(c).filter(n=>n.t=='f'||n.t=='w').length:c.t=='c'?1:0):0,0);
const over=()=>G.t.co==0&&G.t.so>=14&&G.t.we>=9;
const log=s=>{G.log.unshift(s);G.log.length=Math.min(G.log.length,3)};
const draw=(p,n)=>{const h=p.hand.length;while(n--&&p.deck.length)p.hand.push(p.deck.pop());if(!p.bot&&G&&G.ps[0]===p)deckAnim(p.hand.length-h)};
const canAct=(p,id)=>{const l=CARDS[id].f.find(t=>t[0]=='A').slice(1).split('/')[0];return p.res[l.slice(0,2)]>=+l.slice(2)};
function pay(p,cd,go){let n=cost(p,cd);const u={};const use=(r,v)=>{if(n<=0)return;const k=Math.min(p.res[r],Math.ceil(n/v));u[r]=k;n-=k*v};
 if(cd.t.includes('Ruin'))use('sa',2);if(cd.t.some(t=>t=='Tech'||t=='Science'))use('re',3);if(p.c.n[0]=='V'&&cd.t.includes('Bio'))use('se',2);
 n=Math.max(0,n);if(p.res.cr<n)return false;if(go){for(const r in u)p.res[r]-=u[r];p.res.cr-=n}return true}
function track(p,t){if(t=='co'){if(G.t.co>0){G.t.co--;p.tr++}}else if(G.t[t]<(t=='so'?14:9)){G.t[t]++;p.tr++}}
function q(p,t){if(p.bot){const c=bpick(p,t);if(c)place(p,c,t)}else G.pend.push(t)}
function run(p,f){for(const k of f){const a=k[0],b=k.slice(1);
 if(a=='P')p.pr[b.slice(0,2)]+=+b.slice(2);
 else if(a=='G'){if(b=='tl')p.res.cr+=Math.min(8,G.cells.filter(c=>c.t&&c.o===p.i).length);else p.res[b.slice(0,2)]+=+b.slice(2)}
 else if(a=='T')track(p,b);else if(a=='L')q(p,b);else if(a=='D')draw(p,+b);else if(a=='V')p.vp+=+b}}
function place(p,c,t){const k=p.c.n[0];
 if(t=='r'){c.t=null;p.res.sa+=3+(k=='A'?1:0)}
 else{c.t=t;c.o=p.i;
  if(t=='f'){track(p,'co');if(k=='G')p.res.cr++}
  if(t=='w'){track(p,'we');if(k=='D')p.pr.bc++}
  if(t=='s'&&k=='C')p.pr.sa++;
  if(t=='p')p.pr.fc++}
 fx(c,t);sfx(t);log(`${p.c.n.split(' ')[0]}: ${LN[t]}`);render()}
function play(p,hi){const id=p.hand[hi],cd=CARDS[id];pay(p,cd,1);p.hand.splice(hi,1);if(cd.y!='E')p.tab.push(id);
 log(`${p.c.n.split(' ')[0]} played ${cd.n}`);sfx('card');run(p,cd.f.filter(t=>t[0]!='A'))}
function act(p,id){if(p.used.includes(id)||!canAct(p,id))return;const[l,r]=CARDS[id].f.find(t=>t[0]=='A').slice(1).split('/');
 p.res[l.slice(0,2)]-=+l.slice(2);p.used.push(id);
 if(r[0]=='T')track(p,r.slice(1));else p.res[r.slice(0,2)]+=+r.slice(2);sfx('card')}
const STD={
f:{l:'8 Seeds → Forest',ok:p=>p.res.se>=8,go:p=>{p.res.se-=8;q(p,'f')}},
so:{l:'8 Biochar → +1 Soil',ok:p=>p.res.bc>=8&&G.t.so<14,go:p=>{p.res.bc-=8;track(p,'so')}},
w:{l:'18 Cr → Wetland',ok:p=>p.res.cr>=18,go:p=>{p.res.cr-=18;q(p,'w')}},
r:{l:'3 Cr → Clear Ruin',ok:p=>p.res.cr>=3&&G.cells.some(c=>c.t=='R'),go:p=>{p.res.cr-=3;q(p,'r')}}};

/* ---------- BOTS ---------- */
const W={cr:1.2,sa:.4,re:.7,se:.8,fc:.7,bc:1};
function val(cd){const L=Math.min(7,Math.max(1,13-G.gen));let v=0;
 for(const k of cd.f){const a=k[0],b=k.slice(1),n=+b.slice(2);
  if(a=='P')v+=W[b.slice(0,2)]*n*L*.55;else if(a=='G')v+=b=='tl'?4:W[b.slice(0,2)]*n*.8;
  else if(a=='T')v+=5;else if(a=='L')v+={f:5,w:5,s:4,p:3,c:2.5,r:2}[b];else if(a=='D')v+=+b*1.5;else if(a=='V')v+=+b*3;else v+=3}
 return v}
function bpick(p,t){let best,bs=-9;for(const c of valid(t)){const n=nb(c);let s=Math.random()*1.5;
 if(t=='s')s+=n.filter(x=>x.t=='f'||x.t=='w').length*2;
 else if(t=='f'||t=='w')s+=n.filter(x=>x.t=='s'&&x.o===p.i).length*2.5+n.filter(x=>x.t=='s').length;
 else if(t=='c')s+=n.filter(x=>x.t=='f').length;else if(t=='r')s+=n.filter(x=>!x.t).length*.3;
 if(s>bs){bs=s;best=c}}return best}
async function botTurn(p){const g=G;
 for(let n=0;n<6;n++){const o=[];
  p.hand.forEach((id,hi)=>{const cd=CARDS[id];if(pay(p,cd,0))o.push({v:val(cd)/(1+cost(p,cd)/12),go:()=>play(p,hi)})});
  for(const k in STD)if(STD[k].ok(p)&&!(k=='w'&&p.res.cr<30)&&!(k=='r'&&(p.res.sa>1||p.res.cr<12)))o.push({v:{f:2.4,so:2.6,w:1.1,r:.5}[k],go:()=>{STD[k].go(p)}});
  for(const id of p.tab)if(CARDS[id].y=='A'&&!p.used.includes(id)&&canAct(p,id))o.push({v:CARDS[id].f.find(t=>t[0]=='A').includes('/T')?4:1.5,go:()=>act(p,id)});
  if(!o.length)return;o.sort((a,b)=>b.v-a.v);
  const c=Math.random()<.2&&o[1]?o[1]:o[0];if(c.v<.35)return; // 20% of the time takes 2nd best: beatable
  await sleep(750);if(G!==g)return;c.go();render()}}

/* ---------- GAME FLOW ---------- */
let NB=3;
function mk(i,ci,bot){const c=CORPS[ci],p={i,c,bot,tr:10,vp:0,hand:[],tab:[],used:[],
 res:{cr:c.cr,sa:0,re:0,se:0,fc:0,bc:0,...c.st},pr:{cr:0,sa:0,re:0,se:0,fc:0,bc:0,...c.pr}};
 p.deck=shuf(CARDS.map((_,k)=>k));draw(p,5);return p}
const modal=h=>{const m=$('#modal');m.onclick=null;m.innerHTML=h;m.hidden=false},closeModal=()=>{$('#modal').hidden=true};
const chips=c=>[`<b>${c.cr}</b> Credits`,...Object.entries(c.st||{}).map(([k,v])=>`<b>${v}</b> ${R[k]}`),...Object.entries(c.pr||{}).map(([k,v])=>`<b>+${v}</b> ${R[k]} prod`)].map(x=>`<span>${x}</span>`).join('');
function start(nb,code){au();G={code,nb,gen:1,t:{co:14,so:0,we:0},pend:[],log:[],cells:[],map:{},ps:[],bot:false,over:false,cur:null,offer:shuf([0,1,2,3,4,5]).slice(0,3)};
 for(let r=-4;r<=4;r++)for(let q=Math.max(-4,-r-4);q<=Math.min(4,-r+4);q++){const c={id:G.cells.length,q,r,x:31*1.732*(q+r/2),y:31*1.5*r*FY,t:null};G.cells.push(c);G.map[q+','+r]=c}
 shuf(G.cells).slice(0,8).forEach(c=>c.t='R');
 const poly=(rad,dy=0)=>[0,1,2,3,4,5].map(i=>{const a=Math.PI/180*(60*i-30);return(rad*Math.cos(a)).toFixed(1)+','+(rad*Math.sin(a)*FY+dy).toFixed(1)}).join(' ');
 const P=poly(29.5),P2=poly(26.4,-1.5),PS=poly(31.5);
 $('#cells').innerHTML=`<g id="slabs">`+G.cells.map(c=>`<polygon class="slab" points="${PS}" transform="translate(${c.x.toFixed(1)},${(c.y+5).toFixed(1)})"/>`).join('')+`</g>`+G.cells.map(c=>`<g id="h${c.id}" class="cell" transform="translate(${c.x},${c.y})" onclick="clk(${c.id})"><polygon class="rim" points="${P}"/><polygon class="hx" points="${P2}"/><g class="tl"></g><polygon class="hl" points="${P}" fill="url(#stp)"/><polygon class="hb" points="${P}"/><circle class="tgt" r="5"/></g>`).join('');
 G.cells.forEach(drawCell);$('#lob').hidden=true;$('#set').hidden=true;document.body.className='picking';showPick()}
function showPick(){modal(`<div class="pickp"><h2>Choose your corporation</h2><p>Three charters were offered to you. The other corporations go to your rivals.</p><div class="cards3">${G.offer.map(ci=>{const c=CORPS[ci];return`<div class="cc" style="--h:${c.h}" tabindex="0" onclick="choose(${ci})" onkeydown="if(event.key=='Enter')choose(${ci})">${mono(c)}<div class="ct"><h3>${c.n}</h3><em>${c.t}</em><div class="chips">${chips(c)}</div><p>${c.d}</p></div></div>`}).join('')}</div></div>`)}
function choose(ci){const rest=shuf([0,1,2,3,4,5].filter(i=>i!=ci));G.ps=[mk(0,ci,false),...rest.slice(0,G.nb).map((x,i)=>mk(i+1,x,true))];
 document.body.className='';closeModal();log('Generation 1 begins');sfx('card');render();deckAnim(5)}
function adv(){while(G.pend.length&&!valid(G.pend[0]).length)G.pend.shift();render()}
function clk(i){if(!G||G.bot||G.over||!G.pend.length)return;const c=G.cells[i],t=G.pend[0];if(!valid(t).includes(c))return;G.pend.shift();place(G.ps[0],c,t);adv()}
function uiPlay(i){if(busy())return;const p=G.ps[0];if(!pay(p,CARDS[p.hand[i]],0))return sfx('err');play(p,i);adv()}
function uiAct(id){if(busy())return;act(G.ps[0],id);render()}
function std(k){if(busy())return;const p=G.ps[0];if(STD[k].ok(p)){STD[k].go(p);adv()}else sfx('err')}
async function nextGen(){if(busy())return;const g=G;G.bot=true;render();
 for(const p of G.ps)if(p.bot){G.cur=p.i;render();await botTurn(p);if(G!==g)return}
 G.cur=null;
 for(const p of G.ps){const r=p.res;r.bc+=r.fc;r.fc=0;r.cr+=p.tr+p.pr.cr;for(const k of['sa','re','se','fc','bc'])r[k]=Math.max(0,r[k]+p.pr[k]);p.used=[];draw(p,3)}
 G.gen++;G.bot=false;log(`Generation ${G.gen} begins`);sfx('gen');render();if(over()||G.gen>15)fin()}
function fin(){G.over=true;const r=[...G.ps].sort((a,b)=>score(b)-score(a));
 modal(`<div class="pickp"><h2>${r[0].bot?'The world greens without you':'The spring is yours'}</h2><p>CO₂ ${G.t.co} · Soil ${G.t.so}% · Wetlands ${G.t.we}/9</p><ol class="rank">${r.map(p=>`<li style="--c:${PC[p.i]}">${mono(p.c)}<b>${p.c.n}</b>${p.bot?'':`<small>${esc(myName())}</small>`}<span class="vp"><b>${score(p)}</b> VP</span></li>`).join('')}</ol><button class="pri" onclick="lobby()">Back to lobby</button></div>`)}

/* ---------- LOBBY (local demo: lobbies are stored in this browser) ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),myName=()=>NAME.trim()||'You';
function setName(v){NAME=v.slice(0,16);try{localStorage.ss_name=NAME}catch(e){}}
const rooms=()=>JSON.parse(localStorage.ss_rooms||'{}');
function setNb(n){NB=n;document.querySelectorAll('#nbseg button').forEach(b=>b.classList.toggle('on',+b.dataset.n==n))}
function lobby(){G=null;document.body.className='lobby';closeModal();$('#set').hidden=true;$('#lob').hidden=false;
 $('#lob').innerHTML=`<div class="lobp panel"><div class="brand">${LOGO.replace('width="40" height="40"','width="56" height="56"')}<div><h1>Second Spring</h1><small>The returning world</small></div></div>
 <div class="rowl"><span>Your name</span><input class="nin" id="pname" maxlength="16" placeholder="Player" aria-label="Your name" value="${esc(NAME)}" oninput="setName(this.value)"></div>
 <div class="rowl"><span>Rival bots</span><div class="segb" id="nbseg">${[1,2,3].map(n=>`<button data-n="${n}" onclick="setNb(${n})">${n}</button>`).join('')}</div></div>
 <div class="modes"><section><h2>Solo</h2><p>Restore the world on your own against bot corporations.</p><button class="pri" onclick="start(NB,'SOLO')">Play solo</button></section>
 <section><h2>Lobby</h2><p>Host a lobby and share its code, or join one.</p><button onclick="mkRoom()">Host a lobby</button><div class="join"><input id="jc" maxlength="5" placeholder="CODE" aria-label="Lobby code" onkeydown="if(event.key=='Enter')joinRoom()"><button onclick="joinRoom()">Join</button></div><div id="lm"></div></section></div></div>`;setNb(NB)}
function mkRoom(){au();const code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random()*32|0]).join(''),r=rooms();r[code]={nb:NB};localStorage.ss_rooms=JSON.stringify(r);
 $('#lm').innerHTML=`<div class="code"><span>${code}</span><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${code}')">Copy</button></div><button class="pri" onclick="go('${code}')">Start game</button><small>Online players arrive with the server version. For now a code works in this browser.</small>`}
function joinRoom(){au();const c=$('#jc').value.trim().toUpperCase();if(rooms()[c])go(c);else $('#lm').innerHTML='<small>Lobby not found. Check the code and try again.</small>'}
function go(code){start(rooms()[code].nb,code)}
function setp(){const s=$('#set');s.hidden=!s.hidden;fillSet()}
function fillSet(){$('#set').innerHTML=`<b>Settings</b><label>Music volume <span id="vl">${Math.round(vol*100)}%</span><input type="range" min="0" max="100" value="${Math.round(vol*100)}" oninput="setVol(this.value)"></label><button onclick="help()">How to play</button><button onclick="lobby()">Leave to lobby</button><small>Lobby code: ${G?G.code:'-'}</small>`}
function help(){$('#set').hidden=true;modal(`<div class="help"><h2>How to play</h2><p>Bring CO₂ down to 0, Soil up to 14% and Wetlands up to 9 before generation 15 ends. Highest score wins: terraform rating, VP, plus 1 point per Wildlife Corridor and per forest or wetland next to your Settlements.</p><ul><li>Each generation play cards (Credits, with Salvage, Rare Earths or Seeds as discounts on matching cards), use projects and card actions, then press Next generation.</li><li>Rivals then play, and production arrives: Credits = rating + Credit production. Fusion Cells turn into Biochar.</li><li>Forests lower CO₂, Wetlands raise the wetland track, Fusion Plants add Fusion Cell production, and clearing a Ruin pays Salvage.</li><li>When a tile is due, click a glowing hex.</li></ul><button class="pri" onclick="closeModal()">Got it</button></div>`)}
const tgh=()=>$('#hand').classList.toggle('open');

/* ---------- RENDER ---------- */
const pine=(x,b,h,w,c1,c2)=>`<g class="tree"><path d="M${x} ${b-h}L${x-w} ${b}H${x}Z" fill="${c1}"/><path d="M${x} ${b-h}L${x+w} ${b}H${x}Z" fill="${c2}"/><rect x="${x-1}" y="${b}" width="2" height="2.5" fill="#6a4f3d"/></g>`;
const ART={
f:pine(-11,7,16,6,'#4c8a62','#3b7451')+pine(11,8,18,6.5,'#4c8a62','#3b7451')+pine(0,10,24,8,'#5a9b6c','#437f58')+'<polygon points="-18,8 -15,3 -10,3 -8,8" fill="#9bbd6c"/><polygon points="9,10 12,6 17,6 19,10" fill="#8fb26a"/>',
w:'<ellipse cy="2" rx="22" ry="11" fill="#dfe6c8" opacity=".65"/><ellipse cy="2" rx="19" ry="9.2" fill="#5fa6a8"/><ellipse class="rip" cy="2" rx="9" ry="4" fill="#b2e3e2" opacity=".55"/><ellipse cx="-9" cy="4" rx="4" ry="1.8" fill="#8bbf6e"/><ellipse cx="8" cy="0" rx="3.4" ry="1.6" fill="#8bbf6e"/><path d="M-16-2L-17-9M-13-1L-13-8M15-2L16-9" stroke="#6f9a4c" stroke-width="1.5"/>',
s:'<path d="M0-18L11-13L0-8L-11-13Z" fill="#dacfba"/><path d="M-11-13L0-8V8L-11 3Z" fill="#c3b59d"/><path d="M0-8L11-13V3L0 8Z" fill="#a89a85"/><ellipse cx="-4" cy="-13" rx="5" ry="2.2" fill="#6aa27a"/><path d="M-9-7l3 1.2v3l-3-1.2zM-9-1l3 1.2v3l-3-1.2zM3-6.5l3-1.2v3l-3 1.2zM3-.5l3-1.2v3L3 3.7z" fill="#6c7a70"/><path d="M-11-6Q-12 0-10 2M10-9Q11-4 10 0" stroke="#5f9a70" stroke-width="2" fill="none"/>',
p:'<path d="M0-8L12-3L0 2L-12-3Z" fill="#a8745a"/><path d="M-12-3L0 2V10L-12 5Z" fill="#8a5a44"/><path d="M0 2L12-3V5L0 10Z" fill="#74483a"/><rect x="4" y="-17" width="5" height="12" fill="#7a4a38"/><circle class="glow" cx="-4" cy="-1" r="4" fill="#a4ecf2"/><path d="M0-12L-4-3H0L-2 4L4-5H0Z" fill="#d6f7ff"/>',
c:'<path d="M-18 6Q0-12 18 6" stroke="#5c8a5e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-18 6Q0-12 18 6" stroke="#8fc07a" stroke-width="2" fill="none" stroke-dasharray="2 4"/><circle cx="-8" cy="-2" r="3" fill="#cfe5a8"/><circle cx="8" cy="-2" r="3" fill="#cfe5a8"/>',
R:'<polygon points="-15,6 -10,-4 -4,-1 -1,-10 6,-3 11,-6 16,6" fill="#b9a8a0"/><polygon points="-1,-10 6,-3 0,6 -4,-1" fill="#9a8a84"/><rect x="-14" y="-1" width="8" height="3" fill="#8a5a44" transform="rotate(-18 -10 0)"/><rect x="8" y="-4" width="3" height="9" fill="#7a4a38"/>'};
const peb=c=>`<g transform="translate(${c.id%5-2},${c.id%3-1})"><ellipse cx="-7" cy="3" rx="4.2" ry="2.4" fill="#7d7f80"/><ellipse cx="-7.5" cy="2" rx="3" ry="1.5" fill="#a7a9a8"/><ellipse cx="6" cy="-2" rx="3" ry="1.8" fill="#85878a"/><ellipse cx="5.6" cy="-2.7" rx="2" ry="1" fill="#b2b4b2"/><ellipse cx="1" cy="6" rx="2" ry="1.2" fill="#8d8f90"/></g>`;
const badge=o=>`<g transform="translate(0,13) scale(.85)">${symG(o)}</g>`;
function drawCell(c){const k=(c.t||'')+(c.o??'');if(c.dk===k)return;const first=c.dk===undefined;c.dk=k;
 const g=document.getElementById('h'+c.id);g.querySelector('.hx').setAttribute('class','hx '+(c.t||''));g.querySelector('.rim').setAttribute('class','rim '+(c.t||''));
 const who=c.o!=null&&G.ps[c.o]?` · ${G.ps[c.o].c.n}`:'';
 g.querySelector('.tl').innerHTML=c.t?`<g transform="translate(0,-3)"><g class="${first?'':'pop'}"><title>${LN[c.t]}${who}</title>${ART[c.t]}${c.o!=null?badge(c.o):''}</g></g>`:peb(c)}
function mark(){const v=G.pend.length&&!G.bot?valid(G.pend[0]):[];G.cells.forEach(c=>document.getElementById('h'+c.id).classList.toggle('ok',v.includes(c)))}
function fx(c,t){const g=document.createElementNS(NS,'g'),col={w:'#c7ecff',f:'#a5df84',s:'#f3dcae',p:'#b4eeff',c:'#bfe99a',r:'#d3c3b0'}[t];g.setAttribute('transform',`translate(${c.x},${c.y})`);let h='';
 if(t=='w')for(let i=0;i<3;i++)h+=`<circle class="ring" r="6" style="animation-delay:${i*.18}s"/>`;
 for(let i=0;i<9;i++){const a=i/9*6.28,d=24+Math.random()*14,w=t=='w';h+=`<circle class="pt" r="${w?2.5:2}" fill="${col}" style="--dx:${(Math.cos(a)*d).toFixed(1)}px;--dy:${(w?-20-Math.random()*20:Math.sin(a)*d*FY).toFixed(1)}px"/>`}
 g.innerHTML=h;$('#fx').appendChild(g);setTimeout(()=>g.remove(),1300)}
const seg=(n,t)=>Array.from({length:t},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('');
const nm=k=>R[k.slice(0,2)];
function txt(cd){return cd.f.map(t=>{const a=t[0],b=t.slice(1),n=b.slice(2);
 if(a=='P')return`${n>0?'+':''}${n} ${nm(b)} prod`;
 if(a=='G')return b=='tl'?'1 Cr per tile you own (max 8)':`Gain ${n} ${nm(b)}`;
 if(a=='T')return{co:'Lower CO₂ 1',so:'+1 Soil',we:'+1 Wetlands'}[b];
 if(a=='L')return(b=='r'?'':'Place ')+LN[b];
 if(a=='D')return`Draw ${b}`;if(a=='V')return`${b} VP`;
 const[l,r]=b.split('/');return`Action: ${l.slice(2)} ${nm(l)} → ${r[0]=='T'?{co:'CO₂ -1',so:'+1 Soil'}[r.slice(1)]:r.slice(2)+' '+nm(r)}`}).join(' · ')}
const RCOL={cr:'#e3c75f',sa:'#aab3b8',re:'#b9a0dc',se:'#97cc70',fc:'#86dcec',bc:'#a99280'};
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),IMGX={};
const DGX=[0,29,68,105,142,179,221,251,291,329],DGW=[27,37,35,35,35,40,28,38,36,41];
const numHTML=n=>String(n).split('').map(d=>{const k=d==0?9:d-1;return`<i class="dg" style="width:${(DGW[k]/46).toFixed(3)}em;background-position:-${(DGX[k]/46).toFixed(3)}em 0"></i>`}).join('');
const CIMG={};
const corpImageNames=()=>console.log(CORPS.map(c=>`corps/${slug(c.n)}.png`).join('\n'));
function mono(c){const s=slug(c.n),k=CIMG[s];
 return`<span class="mono${k===1?' img':''}" style="--h:${c.h}"><span>${c.n[0]}</span>${k===0?'':`<img src="corps/${s}.png" alt="" onload="CIMG['${s}']=1;this.parentNode.classList.add('img')" onerror="CIMG['${s}']=0;this.remove()">`}</span>`}
const RIMG={},resSlug=k=>slug(R[k]);
const resourceImageNames=()=>console.log(Object.keys(R).map(k=>`resources/${resSlug(k)}.png`).join('\n'));
function resIcon(k){const s=resSlug(k),v=RIMG[s];return`<em class="ri${v===1?' img':''}"><span>${RI[k]}</span>${v===0?'':`<img src="resources/${s}.png" alt="" onload="RIMG['${s}']=1;this.parentNode.classList.add('img')" onerror="RIMG['${s}']=0;this.remove()">`}</em>`}
const cardImageNames=()=>console.log(CARDS.map(c=>`cards/${slug(c.n)}.png`).join('\n'));
function cardHTML(cd,p,o={}){const c=cost(p,cd),s=slug(cd.n);
 return`<div class="pc ${cd.y}${o.no?' no':''}${o.used?' used':''}" style="${o.st||''}"><span class="ix"><span class="nd">${numHTML(c)}</span></span><div class="art">${IMGX[s]?'':`<img src="cards/${s}.png" alt="" onerror="IMGX['${s}']=1;this.remove()">`}</div><h4>${cd.n}</h4><p class="fx">${txt(cd)}</p><div class="ft"><span>${{E:'Event',B:'Build',A:'Active'}[cd.y]} · ${cd.t.join(' ')}</span>${o.need?'<em>Need Credits</em>':''}</div></div>`}
const cardsGrid=p=>p.tab.length?`<div class="pcg">${p.tab.map(id=>`<div class="pcw">${cardHTML(CARDS[id],p,{used:p.used.includes(id)})}</div>`).join('')}</div>`:'<div class="none">No cards played yet.</div>';
function dismiss(){$('#modal').onclick=e=>{if(e.target.id=='modal')closeModal()}}
function showPlayed(){if(!G||!G.ps.length)return;const p=G.ps[0];modal(`<div class="pv" style="--c:${PC[0]}"><div class="pvh"><div><h2>Your played cards</h2><small>${p.tab.length} cards in play</small></div><button style="margin-left:auto" onclick="closeModal()">Close</button></div>${cardsGrid(p)}</div>`);dismiss()}
function viewPlayer(i){if(!G||!G.ps[i])return;const p=G.ps[i];
 modal(`<div class="pv" style="--c:${PC[p.i]}"><div class="pvh">${mono(p.c)}<div><h2>${p.c.n}</h2><small>${p.bot?'Bot':esc(myName())} · ${p.c.t} · TR ${p.tr}</small></div>${symHTML(p.i,26)}<span class="vp"><b>${score(p)}</b> VP</span><button onclick="closeModal()">Close</button></div><div class="pvr">${Object.keys(R).map(k=>`<div class="r" style="--c:${RCOL[k]}">${resIcon(k)}<small>${R[k]}</small><span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i></div>`).join('')}</div><h3>Cards in play · ${p.tab.length}</h3>${cardsGrid(p)}</div>`);dismiss()}
function render(){if(!G||!G.ps.length)return;const p=G.ps[0],b=busy();
 const sgm=(n,t,c)=>Array.from({length:t},(_,i)=>`<i class="${i<n?'on':''}${c&&i==n&&n<t?' mk':''}"></i>`).join('');
 $('#top').innerHTML=`<div class="gt" title="Lower CO₂ to 0"><div class="gh"><span class="tl2">CO₂</span><b>${G.t.co}</b><span class="arr">→</span><em>0</em></div><div class="sg cg">${sgm(14-G.t.co,14,1)}</div><div class="gl"><span>14</span><span>0 = GOAL</span></div></div><div class="gt h" title="Raise Soil to 14%"><span class="gi">${LEAF}</span><div class="col"><div class="sg so">${sgm(G.t.so,14)}</div><span class="gv">${G.t.so}%</span></div></div><div class="gt h" title="Place 9 wetlands"><span class="gi">${DROP}</span><div class="col"><div class="sg we">${sgm(G.t.we,9)}</div><span class="gv">${G.t.we}/9</span></div></div>`;
 $('#pc').textContent=`0${G.ps.length} PLAYERS`;$('#pn').textContent='0'+G.ps.length;
 $('#corps').innerHTML=G.ps.map(x=>`<div class="co${x.i?'':' me'}${G.cur===x.i?' act':''}" style="--c:${PC[x.i]};--h:${x.c.h}" title="${x.c.d}" onclick="viewPlayer(${x.i})">${mono(x.c)}<b class="nm">${x.c.n.split(' ')[0]}</b><span class="bd2">${symHTML(x.i,20)}</span><small class="sub">${x.bot?(G.cur===x.i?'Bot · playing…':'Bot'):esc(myName())+' · active'}</small><small class="ab">${x.c.t} · TR ${x.tr}</small><span class="vp"><b>${score(x)}</b> VP</span></div>`).join('');
 $('#res').innerHTML=Object.keys(R).map(k=>`<div class="r" style="--c:${RCOL[k]}">${resIcon(k)}<small>${R[k]}</small><span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i></div>`).join('');
 $('#std').innerHTML=Object.entries(STD).map(([k,s])=>`<button class="${k=='f'||k=='so'?'rdy':''}" ${!b&&s.ok(p)?'':'disabled'} onclick="std('${k}')">${s.l}</button>`).join('');
 $('#gen').innerHTML=`<div class="gp"><small>Generation</small><b class="gn">${String(G.gen).padStart(2,'0')}</b><small>of 15</small></div><button class="nx" ${b?'disabled':''} onclick="nextGen()">${G.bot?'Rivals playing…':G.pend.length?'Place your tile first':'Next generation →'}</button>`;
 $('#deck').innerHTML=`<div class="pile">${p.deck.length?Array.from({length:Math.min(5,Math.ceil(p.deck.length/6))},()=>`<div class="cb">${CBACK}</div>`).join(''):'<div class="cb empty"></div>'}</div><small>${p.deck.length} cards</small>`;
 $('#played').innerHTML=`<div class="pile">${p.tab.length?Array.from({length:Math.min(4,p.tab.length)},()=>'<div class="cb pl"><b>Played</b></div>').join('').replace(/<b>Played<\/b><\/div>$/,'<b>Played</b><span class="pn">'+p.tab.length+'</span></div>'):'<div class="cb empty"></div>'}</div><small>${p.tab.length} played</small>`;
 $('#log').innerHTML=G.log.join('<br>');
 const a=$('#ask');a.hidden=!G.pend.length||G.bot;a.textContent=G.pend.length?`Place: ${LN[G.pend[0]]} · click a glowing hex`:'';
 const acts=p.tab.filter(id=>CARDS[id].y=='A').reverse(),k=acts.length,SH2=12*14.6,off=k>1?Math.max(40,Math.min(84,(Math.max(300,innerHeight-380)-SH2)/(k-1))):0;
 $('#tab').innerHTML=`<small>In play · ${p.tab.length} cards</small>`+(k?`<div class="stk" style="width:120px;height:${Math.round(SH2+(k-1)*off)}px">${acts.map((id,j)=>{const cd=CARDS[id],used=p.used.includes(id),dis=used||b||!canAct(p,id);return`<div class="stkw" style="--u:12px;top:${Math.round(j*off)}px;z-index:${k-j};--off:${Math.round(off)}px">${cardHTML(cd,p,{used,no:dis&&!used})}<button class="hit${j?'':' full'}" ${dis?'disabled':''} onclick="uiAct(${id})" title="${cd.n}"></button></div>`}).join('')}</div>`:'<p>Active cards you play stack up here.</p>');
 const hn=p.hand.length,avail=Math.min(innerWidth*.9-40,1060),hm=hn>1?Math.min(8,(avail-hn*150)/(hn-1)):0,mid=(hn-1)/2,tilt=Math.min(3.4,22/Math.max(hn,1));
 $('#hand').innerHTML=`<div class="hh" onclick="tgh()">${hn} CARDS · HOVER TO REVEAL</div><div class="cs">${p.hand.map((id,i)=>{const cd=CARDS[id],ok=!b&&pay(p,cd,0),d=i-mid;return`<div class="pcw" style="--u:15px;margin-left:${i?hm:0}px" onclick="uiPlay(${i})">${cardHTML(cd,p,{no:!ok,need:!b&&!ok,st:`--r:${(d*tilt).toFixed(1)}deg;--y:${Math.round(d*d*1.4)}px`})}</div>`}).join('')}</div>`;
 G.cells.forEach(drawCell);mark()}
function deckAnim(n){const pile=document.querySelector('#deck .pile');if(!pile||!(n>0))return;const r=pile.getBoundingClientRect(),tx=innerWidth/2,ty=innerHeight-80;
 pile.animate([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:240,iterations:Math.min(n,5)});
 for(let i=0;i<n;i++){const d=document.createElement('div');d.className='cb fly';d.innerHTML=CBACK;d.style.left=r.left+'px';d.style.top=r.top+'px';document.body.appendChild(d);
  const dx=tx-r.left-46+(i-(n-1)/2)*44,dy=ty-r.top-64;
  d.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.55-70}px) rotate(${(i-n/2)*7}deg)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(.9)`,opacity:0}],{duration:700,delay:i*140,easing:'cubic-bezier(.3,.7,.3,1)',fill:'backwards'}).onfinish=()=>d.remove()}}
document.addEventListener('pointerdown',au,{once:true});
lobby();
