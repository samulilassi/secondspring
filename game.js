// SECOND SPRING - local demo (no server). Open with VS Code "Live Server".
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const R={cr:'Credits',sa:'Salvage',re:'Rare mineral',se:'Seeds',fc:'Fusion Cells',bc:'Biochar'};
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
// card format: name|cost|tags|type(E/B/A)|effects|synergies  P=production G=gain T=track L=place tile D=draw V=VP A=action(cost/gain)
// synergies: 0-3 keys from SYN below, separated by spaces (e.g. "industry recycling"); leave the last field empty for none
/* CARD SYNERGIES - shown as symbols in the card's top right corner. To add a new one: add a line here and put its icon in ui/syn/<key>.svg.
   pay:'sa' / v:2 means 1 of that resource pays 2 Credits toward cards with this synergy. */
const SYN={
 industry:  {n:'Industry',pay:'sa',v:2},
 engine:    {n:'Engine',pay:'re',v:3},
 science:   {n:'Science'},
 recycling: {n:'Recycling'},
 power:     {n:'Power'},
 fusioncell:{n:'Fusion Cell'},
 soil:      {n:'Soil'},
 air:       {n:'Clean Air'},
 wildlife:  {n:'Wildlife'},
 settlement:{n:'Settlement'}};
const CARDS=`Ruin Clearance Crew|6|Ruin|E|Lr Gsa3|recycling
Seed Vault Opening|10|Bio|E|Gse5 Tso|soil
Tidal Fusion Reactor|14|Tech|B|Pfc3|power fusioncell
Mycorrhizal Network|12|Bio|B|Pse2|soil
Carbon Capture Towers|16|Tech|A|Afc2/Tco|engine air
Scrapyard Foundry|9|Ruin|B|Psa2|industry recycling
Rare Earth Reclaimers|11|Tech Ruin|B|Pre2|engine recycling
Floodplain Restoration|15|Wetland|B|Lw Pbc1|wildlife soil
Pollinator Swarm|8|Bio|E|Gse4 D1|wildlife
Biochar Kilns|10|Tech Bio|B|Pbc2 Pfc-1|industry soil
Nuclear Winter Reversal|24|Science|E|Tco Tco|science air
Greenbelt Charter|18|Settlement|B|Ls Pcr2 V1|settlement
Prairie Rewilding Programme|13|Bio|B|Lf Pse1|wildlife air
Salvage Auctions|5|Ruin|E|Gcr6 Gsa2|recycling
Aquifer Recharge|17|Wetland Science|B|Lw Pcr1|science
Solar Farm Grid|11|Tech|B|Pfc2|power
Enclave Exchange|7|Settlement|A|Asa1/cr2|settlement
Soil Microbiome Lab|14|Science Bio|A|Abc4/Tso|science soil
Rewilding Drone Fleet|12|Tech Bio|A|Acr1/se2|engine wildlife
Old World Archive Dig|6|Ruin Science|E|D2 Gre1|recycling science
Wildlife Corridor Pact|9|Bio|B|Lc Gcr2|wildlife
Fusion Plant Prototype|13|Tech|B|Lp Pre1|power engine
Peatland Revival|20|Wetland Bio|B|Lw Tco V2|soil air wildlife
Sealed Enclave Charter|16|Settlement|B|Pcr3 Pse-1|settlement
Orchard Terraces|10|Bio|B|Pse1 Pcr1 V1|soil
Terraformer Veterans|7|Science|B|Pcr1 V1|
Scrap Metal Rush|3|Ruin|E|Gsa5|recycling
Mangrove Barrier|15|Wetland Bio|B|Lw Gse3|wildlife
High Density Housing|19|Settlement|B|Ls Psa1 V2|settlement industry
Atmospheric Filtration Grid|22|Tech|B|Tco Pcr2|engine air
Glacier Regrowth Project|28|Science|E|Tso Tso Lw|science soil
Fusion Cell Surplus|4|Tech|E|Gfc6|fusioncell
Compost Network|8|Bio|A|Ase4/bc3|soil
Heavy Machinery Depot|12|Ruin Tech|B|Psa1 Pre1|industry engine recycling
Earth Day Festival|9|Settlement|E|Gtl|settlement
Hydroponic Skyfarm|14|Bio Tech|B|Pse3|engine
Genetic Archive Reboot|26|Science Bio|B|Pse2 Tso V3|science soil
Ghost City Rebuild|17|Ruin Settlement|B|Lr Ls Pcr1|recycling settlement
Weather Control Network|32|Tech Science|E|Tco Tco Twe|science engine air
The Great Greening|35|Bio Science|B|Tco Tso Twe V6|soil air`.split('\n').map(l=>{const[n,c,t,y,f,sy='']=l.split('|');return{n,c:+c,t:t.split(' '),y,f:f.split(' '),s:sy.split(' ').filter(Boolean)}});
const D=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ME=0,NET=null,BOARD=null,PICKUI=false,RUNNING=false; // ME = your seat in the game (0 in solo); NET = online lobby connection
let G,AC,MG,NAME=localStorage.ss_name||'',vol=+(localStorage.ss_vol??.15);const KV=.87,U=.22563,FY=129*U/46.5*KV,RI={cr:'Cr',sa:'Fe',re:'Re',se:'Sd',fc:'Fc',bc:'C'};

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
const CBACK=`<img src="ui/logo-icon.png" alt="" width="50" height="50" style="width:50px;height:50px;object-fit:contain" onerror="this.outerHTML=LOGO"><b>Second Spring</b>`;
const LEAF=`<img src="ui/track-soil.svg" alt="Soil">`,DROP=`<img src="ui/track-wetlands.svg" alt="Wetlands">`;
$('#app').innerHTML=`<div id="stage"><div id="mist"></div><svg id="bd" viewBox="-252 -135 504 275"><defs><pattern id="stp" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="4" height="9" fill="#f6ffbf" opacity=".7"><animate attributeName="x" from="0" to="9" dur="1.1s" repeatCount="indefinite"/></rect></pattern></defs><g id="cells"></g><g id="fx"></g></svg></div>
<div id="logo"><img src="ui/logo-icon.png" alt="" width="46" height="46" style="width:46px;height:46px;object-fit:contain" onerror="this.outerHTML=LOGO"><span>Second Spring</span></div><div id="top" class="panel"></div><div id="corps"></div>
<div id="cnt"><button id="gear" title="Settings" onclick="setp()"><img src="ui/gear.png" alt="" width="46" height="46" style="width:46px;height:46px;display:block" onerror="this.outerHTML=GEAR"></button></div>
<div id="set" class="panel" hidden></div><div id="tab"></div><div id="ask" hidden></div>
<div id="sec"><h3>The returning world</h3><p id="log"></p></div>
<div id="deck"></div><div id="played" onclick="showPlayed()" title="Your played cards"></div><div id="std"></div><div id="res" class="panel"></div>
<div id="gen"></div><div id="hand" class="panel"></div><div id="foot1">SS—2300</div><div id="foot2">Private table · <span id="pn"></span> players</div>
<div id="lob"></div><div id="modal" hidden></div>`;

/* ---------- RULES ---------- */
const nb=c=>D.map(d=>G.map[(c.q+d[0])+','+(c.r+d[1])]).filter(Boolean);
const valid=t=>{const v=G.cells.filter(c=>t=='r'?c.t=='R':!c.t);if(t=='c'){const w=v.filter(c=>nb(c).some(n=>n.t=='f'));if(w.length)return w}return v};
const busy=()=>!G||G.phase!=='play'||G.pend.length>0||G.cur!==ME||G.over;
const cost=(p,cd)=>Math.max(0,cd.c-(p.c.n[0]=='M'&&cd.f.includes('Lp')?4:0));
const score=p=>p.tr+p.vp+G.cells.reduce((s,c)=>c.o===p.i?s+(c.t=='s'?nb(c).filter(n=>n.t=='f'||n.t=='w').length:c.t=='c'?nb(c).filter(n=>n.t=='f'||n.t=='w').length:0):s,0);
const over=()=>G.t.co==0&&G.t.so>=14&&G.t.we>=9;
const log=s=>{G.log.unshift(s);G.log.length=Math.min(G.log.length,3)};
const draw=(p,n)=>{const h=p.hand.length;while(n--&&p.deck.length)p.hand.push(p.deck.pop());if(!p.bot&&G&&G.ps[ME]===p)deckAnim(p.hand.length-h)};
const canAct=(p,id)=>{const l=CARDS[id].f.find(t=>t[0]=='A').slice(1).split('/')[0];return p.res[l.slice(0,2)]>=+l.slice(2)};
function pay(p,cd,go){let n=cost(p,cd);const u={};const use=(r,v)=>{if(n<=0)return;const k=Math.min(p.res[r],Math.ceil(n/v));u[r]=k;n-=k*v};
 for(const k of cd.s){const y=SYN[k];if(y&&y.pay)use(y.pay,y.v)}if(p.c.n[0]=='V'&&cd.t.includes('Bio'))use('se',2);
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
  if(t=='f'){track(p,'co');if(k=='G')p.res.cr++;if(nb(c).some(n=>n.t=='w'))p.res.se+=2}
  if(t=='w'){track(p,'we');if(k=='D')p.pr.bc++}
  if(t=='s'&&k=='C')p.pr.sa++;
  if(t=='p'){p.pr.fc++;if(nb(c).some(n=>n.t=='s'))p.pr.cr++}}
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
function mk(i,ci,bot,name){const c=CORPS[ci],p={i,ci,c,bot,name:name||'',tr:10,vp:0,hand:[],tab:[],used:[],
 res:{cr:c.cr,sa:0,re:0,se:0,fc:0,bc:0,...c.st},pr:{cr:0,sa:0,re:0,se:0,fc:0,bc:0,...c.pr}};
 p.deck=shuf(CARDS.map((_,k)=>k));draw(p,5);return p}
const modal=h=>{const m=$('#modal');m.onclick=null;m.innerHTML=h;m.hidden=false},closeModal=()=>{$('#modal').hidden=true};
const chips=c=>[`<b>${c.cr}</b> Credits`,...Object.entries(c.st||{}).map(([k,v])=>`<b>${v}</b> ${R[k]}`),...Object.entries(c.pr||{}).map(([k,v])=>`<b>+${v}</b> ${R[k]} prod`)].map(x=>`<span>${x}</span>`).join('');
/* names = the people in the game (seats 0,1,...); bots take the seats after them */
function start(nb,code,names){au();names=names&&names.length?names:[myName()];
 G={code,nb,gen:1,t:{co:14,so:0,we:0},pend:[],log:[],cells:[],map:{},ps:[],over:false,cur:null,ti:0,phase:'pick',
  seats:[...names.map(n=>({name:n,bot:false})),...Array.from({length:nb},()=>({name:'',bot:true}))],pick:0,taken:[],offer:shuf([0,1,2,3,4,5]).slice(0,3)};
 for(let r=-4;r<=4;r++)for(let q=Math.max(-4,-r-4);q<=Math.min(4,-r+4);q++){const c={id:G.cells.length,q,r,x:31*1.732*(q+r/2),y:31*1.5*r*FY,t:null};G.cells.push(c);G.map[q+','+r]=c}
 shuf(G.cells).slice(0,8).forEach(c=>c.t='R');
 buildBoard();document.body.className='picking';pickScreen();share()}
function buildBoard(){
 const P=[[0,-91.5],[119,-37.5],[119,37.5],[0,91.5],[-119,37.5],[-119,-37.5]].map(v=>(v[0]*U).toFixed(2)+','+(v[1]*U*KV).toFixed(2)).join(' ');
 if(!document.getElementById('ti-blank'))document.querySelector('#bd defs').insertAdjacentHTML('beforeend',Object.keys(TILEDATA).map(n=>`<image id="ti-${n}" href="${TILEDATA[n]}" x="${TG.x}" y="${TG.y}" width="${TG.w}" height="${TG.h}"/>`).join(''));
 $('#cells').innerHTML=G.cells.map(c=>`<g id="h${c.id}" class="cell" transform="translate(${c.x},${c.y})" onclick="clk(${c.id})"><title></title><polygon class="hx" points="${P}"/><g class="tl"></g><polygon class="hl" points="${P}" fill="url(#stp)"/><polygon class="hb" points="${P}"/></g>`).join('');
 G.cells.forEach(c=>{delete c.dk;drawCell(c)});BOARD=G.code;$('#lob').hidden=true;$('#set').hidden=true}
/* corporation choice: people choose one after another (seat 0 first), then bots get the corporations that are left */
function pickScreen(){PICKUI=true;if(G.pick===ME)showPick();
 else modal(`<div class="pickp"><h2>Choose your corporation</h2><p>Waiting for <b>${esc(G.seats[G.pick].name)}</b> to choose a corporation…</p></div>`)}
function showPick(){modal(`<div class="pickp"><h2>Choose your corporation</h2><p>Three charters were offered to you. The other corporations go to your rivals.</p><div class="cards3">${G.offer.map(ci=>{const c=CORPS[ci];return corpCardHTML(c,ci)}).join('')}</div></div>`)}
function choose(ci){if(!G||G.phase!=='pick'||G.pick!==ME||!G.offer.includes(ci))return;
 const s=G.pick,humans=G.seats.filter(x=>!x.bot).length;G.ps[s]=mk(s,ci,false,G.seats[s].name);G.taken.push(ci);G.pick++;
 if(G.pick<humans){G.offer=shuf([0,1,2,3,4,5].filter(i=>!G.taken.includes(i))).slice(0,3);pickScreen();share();return}
 const rest=shuf([0,1,2,3,4,5].filter(i=>!G.taken.includes(i)));
 for(let i=humans;i<G.seats.length;i++)G.ps[i]=mk(i,rest[i-humans],true);
 G.phase='play';G.ti=0;G.cur=order()[0].i;PICKUI=false;
 document.body.className='';closeModal();log('Generation 1 begins');sfx('card');render();deckAnim(5);runBots()}
function adv(){while(G.pend.length&&!valid(G.pend[0]).length)G.pend.shift();render()}
function clk(i){if(!G||G.phase!=='play'||G.cur!==ME||G.over||!G.pend.length)return;const c=G.cells[i],t=G.pend[0];if(!valid(t).includes(c))return;G.pend.shift();place(G.ps[ME],c,t);adv()}
function uiPlay(i){if(busy())return;const p=G.ps[ME];if(!pay(p,CARDS[p.hand[i]],0))return sfx('err');play(p,i);adv()}
function uiAct(id){if(busy())return;act(G.ps[ME],id);render()}
function std(k){if(busy())return;const p=G.ps[ME];if(STD[k].ok(p)){STD[k].go(p);adv()}else sfx('err')}
/* turn order rotates: generation 1 starts with player 0 (you), generation 2 with the next player, and so on */
const order=()=>{const n=G.ps.length,s=(G.gen-1)%n;return G.ps.map((_,i)=>G.ps[(s+i)%n])};
const pname=p=>p.bot?p.c.n.split(' ')[0]:p.name||myName();
function income(){for(const p of G.ps){const r=p.res;r.bc+=r.fc;r.fc=0;r.cr+=p.tr+p.pr.cr;for(const k of['sa','re','se','fc','bc'])r[k]=Math.max(0,r[k]+p.pr[k]);p.used=[];draw(p,3)}
 G.gen++;log(`Generation ${G.gen} begins`);sfx('gen')}
/* pass the turn to the next player; after the last one, income arrives and a new generation starts. Returns false when the game ends */
function nextSeat(){G.ti++;
 if(G.ti>=G.ps.length){income();if(over()||G.gen>15){G.cur=null;render();fin();return false}G.ti=0;log(`${pname(order()[0])} starts generation ${G.gen}`)}
 G.cur=order()[G.ti].i;return true}
/* holding the seal ends your turn */
async function nextGen(){if(busy())return;if(!nextSeat())return;render();await runBots()}
/* bots are played by the host's browser (in solo: yours) */
async function runBots(){if(RUNNING||!G||G.over||G.phase!=='play'||(NET&&NET.seat!==0))return;const g=G;RUNNING=true;
 try{while(G===g&&!G.over&&G.ps[G.cur].bot){render();await botTurn(G.ps[G.cur]);if(G!==g)return;if(!nextSeat())return;render()}}finally{RUNNING=false}
 if(G===g&&!G.over&&over())fin()}
function fin(){G.over=true;const r=[...G.ps].sort((a,b)=>score(b)-score(a));share();
 modal(`<div class="pickp"><h2>${r[0].i===ME?'The spring is yours':r[0].bot?'The world greens without you':esc(r[0].name)+' takes the spring'}</h2><p>CO₂ ${G.t.co} · Soil ${G.t.so}% · Wetlands ${G.t.we}/9</p><ol class="rank">${r.map(p=>`<li style="--c:${PC[p.i]}">${mono(p.c)}<b>${p.c.n}</b>${p.bot?'':`<small>${esc(p.name||myName())}</small>`}<span class="vp"><b>${score(p)}</b> VP</span></li>`).join('')}</ol><button class="pri" onclick="lobby()">Back to lobby</button></div>`)}

/* ---------- LOBBY (local demo: lobbies are stored in this browser) ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),myName=()=>NAME.trim()||'You';
function setName(v){NAME=v.slice(0,16);try{localStorage.ss_name=NAME}catch(e){}}
function setNb(n){NB=n;document.querySelectorAll('#nbseg button').forEach(b=>b.classList.toggle('on',+b.dataset.n==n))}
const BRAND=`${LOGO.replace('width="40" height="40"','width="56" height="56"')}<div><h1>Second Spring</h1><small>The returning world</small></div>`;
function lobby(){netStop();G=null;BOARD=null;document.body.className='lobby';closeModal();$('#set').hidden=true;$('#lob').hidden=false;
 $('#lob').innerHTML=`<div class="lobp panel"><div class="brand"><img class="blogo" src="ui/logo.png" alt="Second Spring" width="250" style="width:250px;max-width:70%;height:auto;display:block;margin:0 auto" onerror="this.parentNode.innerHTML=BRAND"><small>The returning world</small></div>
 <div class="rowl"><span>Your name</span><input class="nin" id="pname" maxlength="16" placeholder="Player" aria-label="Your name" value="${esc(NAME)}" oninput="setName(this.value)"></div>
 <div class="rowl"><span>Rival bots</span><div class="segb" id="nbseg">${[1,2,3].map(n=>`<button data-n="${n}" onclick="setNb(${n})">${n}</button>`).join('')}</div></div>
 <div class="modes"><section><h2>Solo</h2><p>Restore the world on your own against bot corporations.</p><button class="pri" onclick="start(NB,'SOLO')">Play solo</button></section>
 <section><h2>Lobby</h2><p>Host a lobby and share its code, or join one.</p><button onclick="mkRoom()">Host a lobby</button><div class="join"><input id="jc" maxlength="5" placeholder="CODE" aria-label="Lobby code" onkeydown="if(event.key=='Enter')joinRoom()"><button onclick="joinRoom()">Join</button></div><div id="lm"></div></section></div></div>`;setNb(NB)}
/* ---------- ONLINE LOBBIES (needs server.py) ---------- */
const api=async(path,body)=>{const r=await fetch('api/'+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'Server error'),{status:r.status});return j};
const NOSRV='Online lobbies need the game server. Start it with <b>py server.py</b> in the game folder and open the game from it. Solo works anywhere.';
async function mkRoom(){au();try{netStart(await api('room',{name:myName(),bots:NB}))}catch(e){$('#lm').innerHTML=`<small>${e.status?esc(e.message):NOSRV}</small>`}}
async function joinRoom(){au();const c=$('#jc').value.trim().toUpperCase();if(!c)return;
 try{netStart(await api('join',{code:c,name:myName()}))}catch(e){$('#lm').innerHTML=`<small>${e.status?esc(e.message):NOSRV}</small>`}}
function netStart(r){netStop();NET={code:r.code,token:r.token,seat:r.seat,v:0,status:'open',players:r.players||[],bots:r.bots||0,q:Promise.resolve(),busy:0,last:'',timer:0};ME=r.seat;lobbyRoom();NET.timer=setTimeout(poll,600)}
function netStop(){if(NET)clearTimeout(NET.timer);NET=null;ME=0}
function netLeave(){netStop();lobby()}
function lobbyRoom(){if(!NET||NET.status!=='open'||!$('#lm'))return;const host=NET.seat===0,nb=Math.min(NET.bots,4-NET.players.length);
 $('#lm').innerHTML=`<div class="code"><span>${NET.code}</span><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${NET.code}')">Copy</button></div>
 <small>Players ${NET.players.length}/4: ${NET.players.map((n,i)=>`<b>${esc(n)}</b>${i===NET.seat?' (you)':''}`).join(', ')}${nb?` · plus ${nb} bot${nb>1?'s':''}`:''}</small>
 ${host?`<button class="pri" onclick="hostStart()">Start game</button>`:'<small>Waiting for the host to start…</small>'}<button onclick="netLeave()">Leave lobby</button>`}
function hostStart(){if(!NET||NET.seat!==0||NET.status!=='open')return;clearTimeout(NET.timer);
 start(Math.min(NET.bots,4-NET.players.length),NET.code,NET.players);NET.status='playing';const s=ser();NET.last=s;NET.busy++;
 NET.q=NET.q.then(async()=>{try{NET.v=(await api('start',{code:NET.code,token:NET.token,state:s})).v}catch(e){}finally{if(NET){NET.busy--;NET.timer=setTimeout(poll,900)}}})}
/* the game is saved to the server as text after every move; only the player whose turn it is (or the host, for bots) writes */
const ser=()=>JSON.stringify({...G,map:undefined,cells:G.cells.map(({dk,...c})=>c),ps:G.ps.map(p=>{if(!p)return null;const{c,...r}=p;return r})});
function hydrate(t){const o=JSON.parse(t),old=G&&G.code===o.code?G.cells:null;o.map={};
 o.cells.forEach(c=>{o.map[c.q+','+c.r]=c;if(old&&old[c.id])c.dk=old[c.id].dk});o.ps=o.ps.map(p=>p?Object.assign(p,{c:CORPS[p.ci]}):p);return o}
function share(){if(!NET||NET.status!=='playing'||NET.applying||!G)return;const s=ser();if(s===NET.last)return;NET.last=s;NET.busy++;const n=NET;
 n.q=n.q.then(async()=>{try{n.v=(await api('state',{code:n.code,token:n.token,base:n.v,state:s})).v}catch(e){if(e.status===409)n.v=0}finally{n.busy--}})}
async function poll(){const n=NET;if(!n)return;
 try{const r=await api(`room?code=${n.code}&token=${encodeURIComponent(n.token)}&v=${n.v}`);if(NET!==n)return;
  n.players=r.players;n.bots=r.bots;if(r.status==='open'){lobbyRoom();return}
  if(r.state&&r.v>n.v&&!n.busy){n.v=r.v;n.status='playing';applyState(r.state)}}
 catch(e){if(NET===n&&(e.status===404||e.status===403)){lobby();$('#lm').innerHTML='<small>The lobby has closed.</small>';return}}
 finally{if(NET===n)n.timer=setTimeout(poll,900)}}
function applyState(t){const was=G;NET.applying=true;
 try{G=hydrate(t);if(BOARD!==G.code){au();buildBoard()}else G.cells.forEach(drawCell);NET.last=ser();
  if(G.phase==='pick'){document.body.className='picking';pickScreen();return}
  if(PICKUI){PICKUI=false;closeModal()}document.body.className='';render();
  if(G.over){if(!was||!was.over)fin();return}}
 finally{if(NET)NET.applying=false}
 runBots()}
function setp(){const s=$('#set');s.hidden=!s.hidden;fillSet()}
function fillSet(){$('#set').innerHTML=`<b>Settings</b><label>Music volume <span id="vl">${Math.round(vol*100)}%</span><input type="range" min="0" max="100" value="${Math.round(vol*100)}" oninput="setVol(this.value)"></label><button onclick="help()">How to play</button><button onclick="lobby()">Leave to lobby</button><small>Lobby code: ${G?G.code:'-'}</small>`}
function help(){$('#set').hidden=true;
 const I={co:`<span class="il">${tIcon('co')}</span>`,so:`<span class="il">${tIcon('so')}</span>`,we:`<span class="il">${tIcon('we')}</span>`},
 hx=n=>TILEDATA[n]?`<svg class="hxi" viewBox="-34 -32 68 61"><use href="#ti-${n}"/></svg>`:'',
 rc=k=>`<span style="--c:${RCOL[k]}">${resIcon(k)}</span>`,
 row=(ic,t,x,c)=>`<div class="hrw${c?'':' nv'}"><div class="hic">${ic}</div><div><b>${t}</b><span class="ht">${x}</span></div>${c?`<em class="vpc">${c}</em>`:''}</div>`,
 cell=(ic,t,x)=>`<div class="hcl"><div class="hic">${ic}</div><b>${t}</b><span class="ht">${x}</span></div>`,
 step=(n,t,x)=>`<div class="hstp"><i>${n}</i><div><b>${t}</b><span class="ht">${x}</span></div></div>`,
 sec=(t,b,n)=>`<section class="hs"><h3>${t}</h3>${n?`<p class="hn">${n}</p>`:''}${b}</section>`,
 ty=(c,n,x)=>`<span class="hty" style="--t:${c}"><b>${n}</b> ${x}</span>`;
 const goal=sec('The goal',`<div class="hgl"><div class="hg">${tIcon('co')}<b>14 → 0</b><small>CO₂ (tonnes)</small></div><div class="hg">${tIcon('so')}<b>0 → 14%</b><small>Soil</small></div><div class="hg">${tIcon('we')}<b>0 → 9</b><small>Wetlands</small></div></div>`,'Heal the world. Each track step is <b>+1</b> {TR} (terraform rating). The game ends when all three are full or generation 15 ends. <b>Highest score wins.</b>'),
 path=sec('Path to victory',
  step(1,'Build your engine','Play cheap Build cards that add production, the boxed numbers. Income = your {TR} + Credit production.')
 +step(2,'Turn income into progress','Spend Seeds on Forests, Biochar on Soil, Credits on Wetlands. Each step is +1 {TR}, and {TR} is {VP}.')
 +step(3,'Claim the board','Settle beside Forests and Wetlands, and put Wildlife Corridors by Forests. These tiles score as the world greens.')
 +step(4,'Finish ahead','Full tracks end the game. Close it out while you lead, before generation 15 ends.')),
 loop=sec('Each generation',
  step(1,'Act','Play cards, use card Actions and standard projects, in any order. When a tile is due, click a glowing hex.')
 +step(2,'Hold <span class="hnx">Next generation</span>','Your rivals take their turns.')
 +step(3,'Income arrives','Credits = {TR} + Credit production. Other resources arrive as produced. Fusion Cells turn into Biochar. You draw 3 cards.')),
 vp=sec('Every way to score {VP}',
  row('<span class="trb">TR</span>','Terraform rating',`Starts at 10. +1 for each step on ${I.co}${I.so}${I.we}`,'1 {VP} per {TR}')
 +row(`{VPL:2}`,'Cards with {VP}','A card showing {VP:3} adds 3 once played.','as shown')
 +row(hx('settlement'),'Settlements','Scores for every Forest or Wetland touching it.','1 per neighbour')
 +row(hx('corridor'),'Wildlife Corridors','Score for every Forest or Wetland touching one you own.','1 per neighbour'),'Your score is the sum of these four:'),
 tiles=sec('Tiles',
  row(hx('forest'),'Forest',`${I.co} −1 and +1 {TR}. Next to a Wetland: +2 ${rc('se')}.`)
 +row(hx('wetland'),'Wetland',`${I.we} +1 and +1 {TR}.`)
 +row(hx('power'),'Fusion Plant',`${efR('+',1,'fc',1)} a production boost. Next to a Settlement: +1 ${rc('cr')} production too.`)
 +row(hx('settlement'),'Settlement','Scores {VP} from its neighbours.')
 +row(hx('corridor'),'Wildlife Corridor','Must touch a Forest if a free hex beside one exists.')
 +row(hx('ruin'),'Ruin',`Blocks its hex. Clear it for +3 ${rc('sa')}, then build there.`)),
 res=sec('Resources',
  row(rc('cr'),'Credits','Pay for cards and projects.')
 +row(rc('sa'),'Salvage','Pays 2 each toward Industry cards.')
 +row(rc('re'),'Rare mineral','Pays 3 each toward Engine cards.')
 +row(rc('se'),'Seeds','8 grow a Forest.')
 +row(rc('fc'),'Fusion Cells','Become Biochar when the generation ends.')
 +row(rc('bc'),'Biochar','8 raise Soil by 1.'),'Your corporation bends one rule: hover its panel.'),
 card=sec('Reading a card',
  `<div class="hlg">${cell('<span class="hix">12</span>','Cost','In Credits. Matching resources can pay part.')}${cell(efR('+',2,'cr',1),'Boxed','Production: arrives every generation.')}${cell(`<span style="--c:${RCOL.sa}">${efR('+',3,'sa',0)}</span>`,'Plain','A gain: arrives when you play the card.')}${cell(`<span class="ef"><span class="n">−</span>${tIcon('co')}</span><span class="ef"><span class="n">+</span>${tIcon('so')}</span><span class="ef"><span class="n">+</span>${tIcon('we')}</span>`,'Track step','Moves a track one step: +1 {TR}.')}${cell(`<span class="ef"><span class="n">+2</span>${CARDIC}</span>`,'Draw','Take cards from your deck.')}${cell(`{VPL:2}`,'Victory points','Counted at the end.')}</div>`
 +`<div class="hcl wide"><div class="hic"><span class="ef"><span class="tx">Action</span><span class="n">2</span>${rc('bc')}<span class="tx">→</span><span class="n">+</span>${tIcon('so')}</span></div><b>Action</b><span class="ht">Active cards only. Once per generation, pay the left side to get the right side.</span></div>`
 +`<div class="htys">${ty('#E8871E','Event','played once')}${ty('#4CBB17','Build','stays in play')}${ty('#0047AB','Active','an Action each generation')}</div>`),
 std=sec('Standard projects',`<div class="hsp">${Object.values(STD).map(s=>`<span class="pl">${stdLabel(s.l)}</span>`).join('')}</div>`,'Always in the bottom bar. Three move a track (+1 {TR}); a Ruin pays Salvage.');
 modal(`<div class="help"><div class="hph"><h2>How to play</h2><p>Second Spring: bring a wrecked world back to life, and finish with the most points.</p><button class="pri" onclick="closeModal()">Got it</button></div><div class="hpb"><div class="hpc">${goal}${path}${std}</div><div class="hpc">${loop}${vp}</div><div class="hpc">${res}${tiles}</div><div class="hpc">${card}</div></div></div>`.replace(/\{TR\}/g,'<span class="htr" title="Terraform rating">TR</span>').replace(/\{VP(L)?(?::(\w+))?\}/g,(m,l,n)=>`<span class="hvp${l?' lg':''}" title="Victory points">${WREATH}${n?`<span class="hvn">${n}</span>`:''}</span>`));dismiss()}
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
const badge=o=>`<g transform="translate(0,${(11*KV).toFixed(1)}) scale(.85)">${symG(o)}</g>`;
const TG={x:-33.85,y:-31.7,w:67.69,h:60.47},TNAME={'':'blank',f:'forest',R:'ruin',p:'power',c:'corridor',w:'wetland',s:'settlement'};
const tileImg=t=>TILEDATA[TNAME[t]]?`<use href="#ti-${TNAME[t]}"/>`:`<image class="ti" href="tiles/${TNAME[t]}.png" x="${TG.x}" y="${TG.y}" width="${TG.w}" height="${TG.h}" onerror="tileFail(this,'${t}')"/>`;
const tileOver=t=>(t=='w'||t=='s')?tileImg(t):tileImg(t);
function tileFail(el,t){console.warn('Tile image not found:',el.getAttribute('href'));if(/blank\.png/.test(el.getAttribute('href'))){el.remove();window.NOTILES=1;document.querySelectorAll('.cell').forEach(g=>g.classList.add('noimg'));return}el.setAttribute('href','tiles/blank.png');if(t&&ART[t]){const g=document.createElementNS(NS,'g');g.setAttribute('transform','translate(0,-3)');g.innerHTML=ART[t];el.after(g)}}
function checkImages(){['tiles/blank','tiles/forest','tiles/power','tiles/corridor','tiles/ruin','ui/gear','ui/logo','ui/logo-icon','ui/generation','ui/pip-on','ui/pip-off','ui/pip-now'].forEach(n=>{const i=new Image();i.onload=()=>console.log('OK     ',n+'.png',i.width+'x'+i.height);i.onerror=()=>console.error('MISSING',n+'.png','(looked for',new URL(n+'.png',location.href).href+')');i.src=n+'.png?'+Date.now()})}
function drawCell(c){const k=(c.t||'')+(c.o??'');if(c.dk===k)return;const first=c.dk===undefined;c.dk=k;
 const g=document.getElementById('h'+c.id);g.querySelector('.hx').setAttribute('class','hx '+(c.t||''));
 const who=c.o!=null&&G.ps[c.o]?` · ${G.ps[c.o].c.n}`:'';
 g.classList.toggle('noimg',!!window.NOTILES);g.querySelector('title').textContent=c.t?LN[c.t]+who:'';
 g.querySelector('.tl').innerHTML=`<g transform="scale(1,${KV})"><g class="${first||!c.t?'':'pop'}">${tileImg(c.t||'')}</g></g>${c.o!=null?badge(c.o):''}`}
function mark(){const v=G.pend.length&&G.cur===ME?valid(G.pend[0]):[];G.cells.forEach(c=>document.getElementById('h'+c.id).classList.toggle('ok',v.includes(c)))}
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
const RIMG={},RFILE={cr:'credits',sa:'salvage',re:'rare-earths',se:'seeds',fc:'fusion-cells',bc:'biochar'},resSlug=k=>RFILE[k];
const resourceImageNames=()=>console.log(Object.keys(R).map(k=>`resources/${resSlug(k)}.png`).join('\n'));
function resIcon(k){const s=resSlug(k),v=RIMG[s];return`<em class="ri${v===1?' img':''}"><span>${RI[k]}</span>${v===0?'':`<img src="resources/${s}.png" alt="" onload="RIMG['${s}']=1;this.parentNode.classList.add('img')" onerror="RIMG['${s}']=0;this.remove()">`}</em>`}
const cardImageNames=()=>console.log(CARDS.map(c=>`cards/${slug(c.n)}.png`).join('\n'));
const CO2SVG='<img src="ui/track-co2.svg" alt="CO₂">';
const TSYM={co:CO2SVG,so:LEAF,we:DROP};
const tIcon=k=>`<span class="ts t-${k}">${TSYM[k]}</span>`;
const CARDIC='<span class="mcard"></span>';
const efR=(sg,n,k,prod)=>`<span class="ef"><span class="n">${sg}${n}</span>${prod?`<span class="pb" style="--c:${RCOL[k]}">${resIcon(k)}</span>`:resIcon(k)}</span>`;
const TFILE={f:'forest',w:'wetland',s:'settlement',p:'power',c:'corridor',r:'ruin'};
function fxHTML(cd){return cd.f.map(t=>{const a=t[0],b=t.slice(1),n=b.slice(2);
 if(a=='P')return efR(n>0?'+':'',n,b.slice(0,2),1);
 if(a=='G')return b=='tl'?`<span class="ef"><span class="n">+1</span>${resIcon('cr')}<span class="tx">per tile you own (max 8)</span></span>`:efR('+',n,b.slice(0,2),0);
 if(a=='T')return`<span class="ef"><span class="n">${b=='co'?'−':'+'}</span>${tIcon(b)}</span>`;
 if(a=='L')return`<span class="ef"><span class="tl"><img src="tile-art/${TFILE[b]}.png" alt=""></span><span class="tx">${(b=='r'?'':'Place ')+LN[b]}</span></span>`;
 if(a=='D')return`<span class="ef"><span class="n">+${b}</span>${CARDIC}</span>`;
 if(a=='V')return`<span class="ef"><span class="n">${b}</span><span class="tx">VP</span></span>`;
 const[l,r]=b.split('/');
 return`<span class="ef"><span class="tx">Action</span><span class="n">${l.slice(2)}</span>${resIcon(l.slice(0,2))}<span class="tx">→</span>${r[0]=='T'?`<span class="n">${r.slice(1)=='co'?'−':'+'}</span>${tIcon(r.slice(1))}`:`<span class="n">+${r.slice(2)}</span>${resIcon(r.slice(0,2))}`}</span>`}).join('')}
/* card design: spine (type + tags), framed arch photo, name plaque, effect panel, description, wreath for VP */
const FLAV={"Ruin Clearance Crew": "Somebody has to move the rubble.","Seed Vault Opening": "Frozen for decades, hungry for sunlight.","Tidal Fusion Reactor": "The moon does the heavy lifting.","Mycorrhizal Network": "The forest has had wi-fi all along.","Carbon Capture Towers": "Skyscrapers that inhale for a living.","Scrapyard Foundry": "One era's junk is the next one's steel.","Rare Earth Reclaimers": "Old gadgets, new metals, no mining.","Floodplain Restoration": "Let the river remember where it lived.","Pollinator Swarm": "Tiny wings, enormous plans.","Biochar Kilns": "Burn slow, bury carbon, grow better.","Nuclear Winter Reversal": "The long thaw begins today.","Greenbelt Charter": "A promise written in grass.","Prairie Rewilding Programme": "The bison are on their way back.","Salvage Auctions": "Going once, going twice, sold for scrap.","Aquifer Recharge": "Patience, drop by drop.","Solar Farm Grid": "Free power, if you can stand the glare.","Enclave Exchange": "One survivor's junk is another's currency.","Soil Microbiome Lab": "A billion tiny employees, zero salaries.","Rewilding Drone Fleet": "Seeds from above, no questions asked.","Old World Archive Dig": "Turns out they did keep receipts.","Wildlife Corridor Pact": "Fences down, paws welcome.","Fusion Plant Prototype": "It works, mostly, on good days.","Peatland Revival": "The bog is back, and it brought friends.","Sealed Enclave Charter": "Closed doors, open ledgers.","Orchard Terraces": "Apples grow where the asphalt cracked.","Terraformer Veterans": "They have seen worse than this swamp.","Scrap Metal Rush": "Finders keepers, weighers payers.","Mangrove Barrier": "Roots against the rising tide.","High Density Housing": "Cozy is a matter of perspective.","Atmospheric Filtration Grid": "Breathe in. Thank the machine.","Glacier Regrowth Project": "Slow ice, slower paperwork.","Fusion Cell Surplus": "Overstocked and slightly warm.","Compost Network": "Nothing is waste if you wait long enough.","Heavy Machinery Depot": "Beeps loudly, moves mountains.","Earth Day Festival": "Everyone plants a tree, then forgets which.","Hydroponic Skyfarm": "Lettuce, but make it vertical.","Genetic Archive Reboot": "Restore from backup. Fingers crossed.","Ghost City Rebuild": "The lights are on again, somewhere.","Weather Control Network": "Today's forecast: whatever we decide.","The Great Greening": "And then, one morning, everything was green."};
const TGI={"Settlement": "<path d=\"M12 3.2 3 11h2.4v9.3h4.6v-5.8h4v5.8h4.6V11H21z\"/>", "Bio": "<path d=\"M5 19C4 11 9 5 20 4c0 10-5.5 15-13 15z\"/>", "Ruin": "<path d=\"M3 20V11h4V7h4V4h4v5h4v4h2v7z\"/>", "Tech": "<circle cx=\"12\" cy=\"12\" r=\"4.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\"/><path d=\"M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M19.2 4.8l-2.4 2.4M7.2 16.8l-2.4 2.4\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" fill=\"none\"/>", "Wetland": "<path d=\"M12 2.8C8.2 8 5.5 11.4 5.5 15a6.5 6.5 0 0 0 13 0C18.5 11.4 15.8 8 12 2.8z\"/>", "Science": "<path d=\"M9 3h6v2h-1v5l5.2 9.1a1.6 1.6 0 0 1-1.4 2.4H6.2a1.6 1.6 0 0 1-1.4-2.4L10 10V5H9z\"/>"};
const WREATH='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M21.77 39.84 L20.49 39.61 L19.23 39.27 L18.01 38.83 L16.82 38.30 L15.68 37.67 L14.60 36.94 L13.57 36.14 L12.62 35.25 L11.74 34.28 L10.95 33.25 L10.24 32.16 L9.62 31.01 L9.10 29.82 L8.67 28.59 L8.35 27.33 L8.13 26.04 L8.02 24.74 L8.01 23.44 L8.11 22.14 L8.31 20.86 L8.62 19.59 L9.03 18.35 L9.54 17.15 L10.14 16.00 L10.84 14.90 L11.62 13.86 L12.49 12.89 L13.43 11.99 L14.45 11.17 L15.52 10.43" fill="none" stroke="#2b2300" stroke-width="1.4" stroke-linecap="round"/><path d="M26.23 39.84 L27.51 39.61 L28.77 39.27 L29.99 38.83 L31.18 38.30 L32.32 37.67 L33.40 36.94 L34.43 36.14 L35.38 35.25 L36.26 34.28 L37.05 33.25 L37.76 32.16 L38.38 31.01 L38.90 29.82 L39.33 28.59 L39.65 27.33 L39.87 26.04 L39.98 24.74 L39.99 23.44 L39.89 22.14 L39.69 20.86 L39.38 19.59 L38.97 18.35 L38.46 17.15 L37.86 16.00 L37.16 14.90 L36.38 13.86 L35.51 12.89 L34.57 11.99 L33.55 11.17 L32.48 10.43" fill="none" stroke="#2b2300" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="21.22" cy="39.76" rx="4.4" ry="2.2" transform="rotate(162.0 21.22 39.76)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="26.78" cy="39.76" rx="4.4" ry="2.2" transform="rotate(-162.0 26.78 39.76)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="15.40" cy="37.49" rx="4.4" ry="2.2" transform="rotate(184.5 15.40 37.49)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="32.60" cy="37.49" rx="4.4" ry="2.2" transform="rotate(-184.5 32.60 37.49)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="10.89" cy="33.18" rx="4.4" ry="2.2" transform="rotate(207.0 10.89 33.18)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="37.11" cy="33.18" rx="4.4" ry="2.2" transform="rotate(-207.0 37.11 33.18)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="8.38" cy="27.46" rx="4.4" ry="2.2" transform="rotate(229.5 8.38 27.46)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="39.62" cy="27.46" rx="4.4" ry="2.2" transform="rotate(-229.5 39.62 27.46)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="8.24" cy="21.22" rx="4.4" ry="2.2" transform="rotate(252.0 8.24 21.22)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="39.76" cy="21.22" rx="4.4" ry="2.2" transform="rotate(-252.0 39.76 21.22)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="10.51" cy="15.40" rx="4.4" ry="2.2" transform="rotate(274.5 10.51 15.40)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="37.49" cy="15.40" rx="4.4" ry="2.2" transform="rotate(-274.5 37.49 15.40)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="14.82" cy="10.89" rx="4.4" ry="2.2" transform="rotate(297.0 14.82 10.89)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="33.18" cy="10.89" rx="4.4" ry="2.2" transform="rotate(-297.0 33.18 10.89)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><circle cx="24" cy="24" r="10.6" fill="#2f3d36" stroke="#2b2300" stroke-width="1.4"/><circle cx="24" cy="24" r="8.6" fill="none" stroke="#E0A81C" stroke-width=".8"/></svg>';
const tagIc=t=>`<span title="${t}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${TGI[t]||''}</svg></span>`;
const synHTML=cd=>cd.s.length?`<span class="ctr">${cd.s.filter(k=>SYN[k]).map(k=>{const y=SYN[k];return`<img src="ui/syn/${k}.svg" alt="${y.n}" title="${y.n}${y.pay?` · 1 ${R[y.pay]} pays ${y.v} Cr toward this card`:''}">`}).join('')}</span>`:'';
function cardHTML(cd,p,o={}){const c=cost(p,cd),s=slug(cd.n),v=cd.f.find(t=>t[0]=='V'),vp=v?v.slice(1):'';
 return`<div class="pc ${cd.y}${vp?' hv':''}${o.no?' no':''}${o.used?' used':''}" style="${o.st||''}"><span class="ix">${c}</span>${synHTML(cd)}<div class="csp"><span class="ctg">${cd.t.map(tagIc).join('')}</span><div class="cty"><b>${{E:'Event',B:'Build',A:'Active'}[cd.y]}</b></div></div><div class="ccl"><div class="art"><div class="cai">${IMGX[s]?'':`<img src="cards/${s}.png" alt="" onerror="IMGX['${s}']=1;this.remove()">`}</div>${o.need?'<em class="cnc">Need Credits</em>':''}</div><div class="cpl"><h4>${cd.n}</h4></div><div class="fx">${fxHTML({...cd,f:cd.f.filter(t=>t[0]!='V')})}</div><div class="cbt"><p class="cds">${FLAV[cd.n]||''}</p>${vp?`<span class="cwv">${WREATH}<b>${vp}</b></span>`:''}</div></div></div>`}
const cardsGrid=(p,ids=p.tab)=>ids.length?`<div class="pcg">${ids.map(id=>`<div class="pcw">${cardHTML(CARDS[id],p,{used:p.used.includes(id)})}</div>`).join('')}</div>`:'<div class="none">No cards played yet.</div>';
function dismiss(){$('#modal').onclick=e=>{if(e.target.id=='modal')closeModal()}}
function showPlayed(){if(!G||!G.ps.length)return;const p=G.ps[ME],ids=p.tab.filter(id=>CARDS[id].y!='A');modal(`<div class="pv" style="--c:${PC[ME]}"><div class="pvh"><div><h2>Your played cards</h2><small>${ids.length} cards</small></div><button style="margin-left:auto" onclick="closeModal()">Close</button></div>${cardsGrid(p,ids)}</div>`);dismiss()}
function viewPlayer(i){if(!G||!G.ps[i])return;const p=G.ps[i];
 modal(`<div class="pv" style="--c:${PC[p.i]}"><div class="pvh">${mono(p.c)}<div><h2>${p.c.n}</h2><small>${p.bot?'Bot':esc(p.name||myName())} · ${p.c.t} · TR ${p.tr}</small></div>${symHTML(p.i,26)}<span class="vp"><b>${score(p)}</b> VP</span><button onclick="closeModal()">Close</button></div><div class="pvr">${Object.keys(R).map(k=>`<div class="r" style="--c:${RCOL[k]}">${resIcon(k)}<span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i></div>`).join('')}</div><h3>Cards in play · ${p.tab.length}</h3>${cardsGrid(p)}</div>`);dismiss()}
const STDRES={Seeds:'se',Biochar:'bc',Cr:'cr'};
function stdLabel(l){const m=l.match(/^(\d+) (\w+) → (.*)$/);if(!m||!STDRES[m[2]])return l;return`<span class="sn">${m[1]}</span>${resIcon(STDRES[m[2]])}<span class="sa">→</span><span>${m[3]}</span>`}
function render(){renderUI();share()}
function renderUI(){if(!G||G.phase!=='play'||!G.ps.length)return;const p=G.ps[ME],b=busy();
 const sgm=(n,t)=>Array.from({length:t},(_,i)=>`<i class="${i<n?'on':i==n?'nxt':''}"></i>`).join(''),
 ck='<svg class="ck" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#b9de8c"/><path d="M3.8 7.3l2.2 2.2 4.2-4.6" stroke="#14260f" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 arc=(c,ic,nm,tip,v,u,g,lit,t,nx,done)=>{let lv='';for(let i=0;i<t;i++){const d=180+(i+.5)*180/t,a=d*Math.PI/180;lv+=`<g class="glf${i<lit?' on':''}${i===nx?' nx':''}" transform="translate(${(85+68*Math.cos(a)).toFixed(1)} ${(88+68*Math.sin(a)).toFixed(1)}) rotate(${(d+90).toFixed(1)})"><polygon class="l1" points="0,-7.5 -4.6,0 0,7.5"/><polygon class="l2" points="0,-7.5 4.6,0 0,7.5"/></g>`}
  return`<div class="ga ${c}${done?' done':''}" title="${tip}"><svg viewBox="0 0 170 104" aria-hidden="true"><path class="rim" d="M12 92 A73 73 0 0 1 158 92"/>${lv}<path class="dn" d="M22 92 A63 63 0 0 1 148 92"/></svg><div class="gac"><div class="gar"><span class="gai">${ic}</span><b class="gav">${v}${u?`<small>${u}</small>`:''}</b>${done?ck:''}</div><span class="tn">${nm}</span><span class="gag">${g}</span></div></div>`};
 $('#top').innerHTML=arc('k-co',CO2SVG,'CO₂ in the air','Lower CO₂ to 0',G.t.co,'T','empties to 0',G.t.co,14,G.t.co-1,G.t.co<=0)+arc('k-so',LEAF,'Soil','Raise Soil to 14%',G.t.so,'%','goal 14%',G.t.so,14,G.t.so,G.t.so>=14)+arc('k-we',DROP,'Wetlands','Place 9 wetlands',G.t.we,'','goal 9',G.t.we,9,G.t.we,G.t.we>=9);
 $('#pn').textContent='0'+G.ps.length;
 const cs=$('#corps');if(cs.children.length!=G.ps.length)cs.innerHTML=G.ps.map(()=>'<div class="co"></div>').join('');
 G.ps.forEach((x,i)=>{const e=cs.children[i],on=!G.over&&G.cur===x.i;
  e.className=`co${x.i===ME?' me':''}${G.cur===x.i?' act':''}${on?' out':''}`;e.style.cssText=`--c:${PC[x.i]};--h:${x.c.h}`;e.title=x.c.d;e.onclick=()=>viewPlayer(x.i);
  e.innerHTML=`${mono(x.c)}<span class="nm"><b>${x.bot?'Bot '+x.i:esc(x.name||myName())}</b>${x.i!==ME&&G.cur===x.i?'<i>playing…</i>':''}</span><span class="vp"><b>${score(x)}</b> VP</span><small class="sub">${symHTML(x.i,13)}${x.c.n}</small>`});
 $('#res').innerHTML=Object.keys(R).map(k=>`<div class="r" style="--c:${RCOL[k]}">${resIcon(k)}<span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i></div>`).join('');
 $('#std').innerHTML=Object.entries(STD).map(([k,s])=>`<button class="${k=='f'||k=='so'?'rdy':''}" ${!b&&s.ok(p)?'':'disabled'} onclick="std('${k}')">${stdLabel(s.l)}</button>`).join('');
 genUpdate(b);
 $('#deck').innerHTML=`<div class="pile">${p.deck.length?Array.from({length:Math.min(5,Math.ceil(p.deck.length/6))},()=>`<div class="cb">${CBACK}</div>`).join(''):'<div class="cb empty"></div>'}</div><small>${p.deck.length} cards</small>`;
 const pl=p.tab.filter(id=>CARDS[id].y!='A').length;
 $('#played').innerHTML=`<div class="pile">${pl?Array.from({length:Math.min(4,pl)},()=>'<div class="cb pl"><b>Played</b></div>').join('').replace(/<b>Played<\/b><\/div>$/,'<b>Played</b><span class="pn">'+pl+'</span></div>'):'<div class="cb empty"></div>'}</div><small>${pl} played</small>`;
 $('#log').innerHTML=G.log.join('<br>');
 const a=$('#ask');a.hidden=!G.pend.length||G.cur!==ME;a.textContent=G.pend.length?`Place: ${LN[G.pend[0]]} · click a glowing hex`:'';
 const acts=p.tab.filter(id=>CARDS[id].y=='A').reverse(),k=acts.length,SH2=13.8*14.6,off=k>1?Math.max(40,Math.min(84,(Math.max(300,innerHeight-380)-SH2)/(k-1))):0;
 $('#tab').innerHTML=(k?`<div class="stk" style="width:138px;height:${Math.round(SH2+(k-1)*off)}px">${acts.map((id,j)=>{const cd=CARDS[id],used=p.used.includes(id),dis=used||b||!canAct(p,id);return`<div class="stkw" style="--u:13.8px;top:${Math.round(j*off)}px;z-index:${k-j};--off:${Math.round(off)}px">${cardHTML(cd,p,{used,no:dis&&!used})}<button class="hit${j?'':' full'}" ${dis?'disabled':''} onclick="uiAct(${id})" title="${cd.n}"></button></div>`}).join('')}</div>`:'');
 const hn=p.hand.length,avail=Math.min(innerWidth*.9-40,1060),hm=hn>1?Math.min(8,(avail-hn*172.5)/(hn-1)):0,mid=(hn-1)/2,tilt=Math.min(3.4,22/Math.max(hn,1));
 $('#hand').innerHTML=`<div class="hh" onclick="tgh()">${hn} CARDS · HOVER TO REVEAL</div><div class="cs">${p.hand.map((id,i)=>{const cd=CARDS[id],ok=!b&&pay(p,cd,0),d=i-mid;return`<div class="pcw" style="--u:17.25px;margin-left:${i?hm:0}px" onclick="uiPlay(${i})">${cardHTML(cd,p,{no:!ok,need:!b&&!ok,st:`--r:${(d*tilt).toFixed(1)}deg;--y:${Math.round(d*d*1.4)}px`})}</div>`}).join('')}</div>`;
 G.cells.forEach(drawCell);mark()}
function deckAnim(n){const pile=document.querySelector('#deck .pile');if(!pile||!(n>0))return;const r=pile.getBoundingClientRect(),tx=innerWidth/2,ty=innerHeight-80;
 pile.animate([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:240,iterations:Math.min(n,5)});
 for(let i=0;i<n;i++){const d=document.createElement('div');d.className='cb fly';d.innerHTML=CBACK;d.style.left=r.left+'px';d.style.top=r.top+'px';document.body.appendChild(d);
  const dx=tx-r.left-53+(i-(n-1)/2)*44,dy=ty-r.top-74;
  d.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.55-70}px) rotate(${(i-n/2)*7}deg)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(.9)`,opacity:0}],{duration:700,delay:i*140,easing:'cubic-bezier(.3,.7,.3,1)',fill:'backwards'}).onfinish=()=>d.remove()}}
/* ---------- GENERATION WHEEL + NEXT GENERATION SEAL (bottom right) ---------- */
const HOLD_MS=1100; // how long the seal must be held down, in milliseconds, before the next generation starts
const WHEEL_SVG=`<svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="63.6" fill="#0c1814"/><circle cx="64" cy="64" r="60.2" fill="#13271f"/><polygon points="57.31,0.35 70.69,0.35 70.29,4.13 57.71,4.13" fill="#cdc4ae"/><polygon points="70.69,0.35 83.78,3.13 82.6,6.75 70.29,4.13" fill="#cdc4ae"/><polygon points="83.78,3.13 96,8.57 94.1,11.87 82.6,6.75" fill="#cdc4ae"/><polygon points="96,8.57 106.82,16.44 104.28,19.26 94.1,11.87" fill="#cdc4ae"/><polygon points="106.82,16.44 115.78,26.38 112.7,28.62 104.28,19.26" fill="#a39a88"/><polygon points="115.78,26.38 122.47,37.97 119,39.51 112.7,28.62" fill="#a39a88"/><polygon points="122.47,37.97 126.6,50.69 122.88,51.48 119,39.51" fill="#a39a88"/><polygon points="126.6,50.69 128,64 124.2,64 122.88,51.48" fill="#7b7262"/><polygon points="128,64 126.6,77.31 122.88,76.52 124.2,64" fill="#7b7262"/><polygon points="126.6,77.31 122.47,90.03 119,88.49 122.88,76.52" fill="#7b7262"/><polygon points="122.47,90.03 115.78,101.62 112.7,99.38 119,88.49" fill="#7b7262"/><polygon points="115.78,101.62 106.82,111.56 104.28,108.74 112.7,99.38" fill="#7b7262"/><polygon points="106.82,111.56 96,119.43 94.1,116.13 104.28,108.74" fill="#7b7262"/><polygon points="96,119.43 83.78,124.87 82.6,121.25 94.1,116.13" fill="#7b7262"/><polygon points="83.78,124.87 70.69,127.65 70.29,123.87 82.6,121.25" fill="#7b7262"/><polygon points="70.69,127.65 57.31,127.65 57.71,123.87 70.29,123.87" fill="#7b7262"/><polygon points="57.31,127.65 44.22,124.87 45.4,121.25 57.71,123.87" fill="#7b7262"/><polygon points="44.22,124.87 32,119.43 33.9,116.13 45.4,121.25" fill="#7b7262"/><polygon points="32,119.43 21.18,111.56 23.72,108.74 33.9,116.13" fill="#7b7262"/><polygon points="21.18,111.56 12.22,101.62 15.3,99.38 23.72,108.74" fill="#a39a88"/><polygon points="12.22,101.62 5.53,90.03 9,88.49 15.3,99.38" fill="#a39a88"/><polygon points="5.53,90.03 1.4,77.31 5.12,76.52 9,88.49" fill="#a39a88"/><polygon points="1.4,77.31 0,64 3.8,64 5.12,76.52" fill="#cdc4ae"/><polygon points="0,64 1.4,50.69 5.12,51.48 3.8,64" fill="#cdc4ae"/><polygon points="1.4,50.69 5.53,37.97 9,39.51 5.12,51.48" fill="#cdc4ae"/><polygon points="5.53,37.97 12.22,26.38 15.3,28.62 9,39.51" fill="#cdc4ae"/><polygon points="12.22,26.38 21.18,16.44 23.72,19.26 15.3,28.62" fill="#cdc4ae"/><polygon points="21.18,16.44 32,8.57 33.9,11.87 23.72,19.26" fill="#cdc4ae"/><polygon points="32,8.57 44.22,3.13 45.4,6.75 33.9,11.87" fill="#cdc4ae"/><polygon points="44.22,3.13 57.31,0.35 57.71,4.13 45.4,6.75" fill="#cdc4ae"/><circle cx="64" cy="64" r="40.4" fill="#0a1613"/><path class="slot s-c" data-k="1" d="M47.57 6.71 A59.6 59.6 0 0 1 80.43 6.71 L76.18 21.51 A44.2 44.2 0 0 0 51.82 21.51 Z"/><path class="slot s-u" data-k="2" d="M72.29 4.98 A59.6 59.6 0 0 1 102.31 18.34 L92.41 30.14 A44.2 44.2 0 0 0 70.15 20.23 Z"/><path class="slot s-u" data-k="3" d="M95.58 13.46 A59.6 59.6 0 0 1 117.57 37.87 L103.73 44.62 A44.2 44.2 0 0 0 87.42 26.52 Z"/><path class="slot s-u" data-k="4" d="M113.41 30.67 A59.6 59.6 0 0 1 123.56 61.92 L108.17 62.46 A44.2 44.2 0 0 0 100.64 39.28 Z"/><path class="slot s-u" data-k="5" d="M122.69 53.65 A59.6 59.6 0 0 1 119.26 86.33 L104.98 80.56 A44.2 44.2 0 0 0 107.53 56.32 Z"/><path class="slot s-u" data-k="6" d="M121.83 78.42 A59.6 59.6 0 0 1 105.4 106.87 L94.7 95.79 A44.2 44.2 0 0 0 106.89 74.69 Z"/><path class="slot s-u" data-k="7" d="M110.97 100.69 A59.6 59.6 0 0 1 84.38 120.01 L79.12 105.53 A44.2 44.2 0 0 0 98.83 91.21 Z"/><path class="slot s-u" data-k="8" d="M91.98 116.62 A59.6 59.6 0 0 1 59.84 123.45 L60.92 108.09 A44.2 44.2 0 0 0 84.75 103.03 Z"/><path class="slot s-u" data-k="9" d="M68.16 123.45 A59.6 59.6 0 0 1 36.02 116.62 L43.25 103.03 A44.2 44.2 0 0 0 67.08 108.09 Z"/><path class="slot s-u" data-k="10" d="M43.62 120.01 A59.6 59.6 0 0 1 17.03 100.69 L29.17 91.21 A44.2 44.2 0 0 0 48.88 105.53 Z"/><path class="slot s-u" data-k="11" d="M22.6 106.87 A59.6 59.6 0 0 1 6.17 78.42 L21.11 74.69 A44.2 44.2 0 0 0 33.3 95.79 Z"/><path class="slot s-u" data-k="12" d="M8.74 86.33 A59.6 59.6 0 0 1 5.31 53.65 L20.47 56.32 A44.2 44.2 0 0 0 23.02 80.56 Z"/><path class="slot s-u" data-k="13" d="M4.44 61.92 A59.6 59.6 0 0 1 14.59 30.67 L27.36 39.28 A44.2 44.2 0 0 0 19.83 62.46 Z"/><path class="slot s-u" data-k="14" d="M10.43 37.87 A59.6 59.6 0 0 1 32.42 13.46 L40.58 26.52 A44.2 44.2 0 0 0 24.27 44.62 Z"/><path class="slot s-u" data-k="15" d="M25.69 18.34 A59.6 59.6 0 0 1 55.71 4.98 L57.85 20.23 A44.2 44.2 0 0 0 35.59 30.14 Z"/><g class="lf s-c" data-k="1" style="transform-origin:56.52px 16.79px"><g class="gu"><polygon points="56.52,16.79 61.98,16.44 60.96,14.05" fill="#496555"/><polygon points="61.98,16.44 66.7,12.47 60.96,14.05" fill="#496555"/><polygon points="56.52,16.79 60.96,14.05 59.95,11.65" fill="#678771"/><polygon points="60.96,14.05 66.7,12.47 59.95,11.65" fill="#678771"/></g><g class="gp"><polygon points="51.89,18.79 64.65,17.2 62.91,11.77" fill="#4f8446"/><polygon points="64.65,17.2 78.39,10.29 62.91,11.77" fill="#4f8446"/><polygon points="51.89,18.79 62.91,11.77 61.17,6.35" fill="#bfe08c"/><polygon points="62.91,11.77 78.39,10.29 61.17,6.35" fill="#bfe08c"/></g><g class="gc"><polygon points="51.32,19.78 65.4,17.89 63.25,11.54" fill="#86b45d"/><polygon points="65.4,17.89 80.55,9.87 63.25,11.54" fill="#86b45d"/><polygon points="51.32,19.78 63.25,11.54 61.1,5.2" fill="#eaf8c4"/><polygon points="63.25,11.54 80.55,9.87 61.1,5.2" fill="#eaf8c4"/></g></g><g class="lf s-u" data-k="2" style="transform-origin:76.37px 17.83px"><g class="gu"><polygon points="76.37,17.83 81.5,19.73 81.54,17.13" fill="#496555"/><polygon points="81.5,19.73 87.43,18.02 81.54,17.13" fill="#496555"/><polygon points="76.37,17.83 81.54,17.13 81.59,14.53" fill="#678771"/><polygon points="81.54,17.13 87.43,18.02 81.59,14.53" fill="#678771"/></g><g class="gp"><polygon points="71.32,17.78 83.63,21.51 84.24,15.84" fill="#4f8446"/><polygon points="83.63,21.51 98.99,20.79 84.24,15.84" fill="#4f8446"/><polygon points="71.32,17.78 84.24,15.84 84.86,10.18" fill="#bfe08c"/><polygon points="84.24,15.84 98.99,20.79 84.86,10.18" fill="#bfe08c"/></g><g class="gc"><polygon points="70.4,18.45 84.04,22.44 84.65,15.77" fill="#86b45d"/><polygon points="84.04,22.44 101.13,21.28 84.65,15.77" fill="#86b45d"/><polygon points="70.4,18.45 84.65,15.77 85.27,9.1" fill="#eaf8c4"/><polygon points="84.65,15.77 101.13,21.28 85.27,9.1" fill="#eaf8c4"/></g></g><g class="lf s-u" data-k="3" style="transform-origin:94.08px 26.85px"><g class="gu"><polygon points="94.08,26.85 97.99,30.67 99.09,28.32" fill="#5c7b67"/><polygon points="97.99,30.67 104.1,31.53 99.09,28.32" fill="#496555"/><polygon points="94.08,26.85 99.09,28.32 100.19,25.96" fill="#678771"/><polygon points="99.09,28.32 104.1,31.53 100.19,25.96" fill="#5c7b67"/></g><g class="gp"><polygon points="89.49,24.75 99.21,33.17 102.08,28.24" fill="#8cbc5e"/><polygon points="99.21,33.17 113.54,38.76 102.08,28.24" fill="#4f8446"/><polygon points="89.49,24.75 102.08,28.24 104.95,23.32" fill="#bfe08c"/><polygon points="102.08,28.24 113.54,38.76 104.95,23.32" fill="#8cbc5e"/></g><g class="gc"><polygon points="88.38,24.99 99.21,34.19 102.48,28.34" fill="#c3e68e"/><polygon points="99.21,34.19 115.3,40.08 102.48,28.34" fill="#86b45d"/><polygon points="88.38,24.99 102.48,28.34 105.76,22.5" fill="#eaf8c4"/><polygon points="102.48,28.34 115.3,40.08 105.76,22.5" fill="#c3e68e"/></g></g><g class="lf s-u" data-k="4" style="transform-origin:106.59px 42.3px"><g class="gu"><polygon points="106.59,42.3 108.61,47.38 110.57,45.68" fill="#5c7b67"/><polygon points="108.61,47.38 113.84,50.64 110.57,45.68" fill="#496555"/><polygon points="106.59,42.3 110.57,45.68 112.53,43.97" fill="#678771"/><polygon points="110.57,45.68 113.84,50.64 112.53,43.97" fill="#496555"/></g><g class="gp"><polygon points="103.25,38.51 108.71,50.15 113.33,46.82" fill="#8cbc5e"/><polygon points="108.71,50.15 119.52,61.09 113.33,46.82" fill="#8cbc5e"/><polygon points="103.25,38.51 113.33,46.82 117.96,43.49" fill="#bfe08c"/><polygon points="113.33,46.82 119.52,61.09 117.96,43.49" fill="#4f8446"/></g><g class="gc"><polygon points="102.14,38.28 108.29,51.08 113.66,47.08" fill="#c3e68e"/><polygon points="108.29,51.08 120.59,63.01 113.66,47.08" fill="#c3e68e"/><polygon points="102.14,38.28 113.66,47.08 119.03,43.07" fill="#eaf8c4"/><polygon points="113.66,47.08 120.59,63.01 119.03,43.07" fill="#86b45d"/></g></g><g class="lf s-u" data-k="5" style="transform-origin:111.73px 61.5px"><g class="gu"><polygon points="111.73,61.5 111.51,66.96 114,66.2" fill="#678771"/><polygon points="111.51,66.96 114.96,72.07 114,66.2" fill="#5c7b67"/><polygon points="111.73,61.5 114,66.2 116.48,65.44" fill="#5c7b67"/><polygon points="114,66.2 114.96,72.07 116.48,65.44" fill="#496555"/></g><g class="gp"><polygon points="110.22,56.68 110.47,69.53 116.05,68.37" fill="#bfe08c"/><polygon points="110.47,69.53 115.91,83.93 116.05,68.37" fill="#8cbc5e"/><polygon points="110.22,56.68 116.05,68.37 121.63,67.21" fill="#8cbc5e"/><polygon points="116.05,68.37 115.91,83.93 121.63,67.21" fill="#4f8446"/></g><g class="gc"><polygon points="109.3,56.01 109.71,70.21 116.25,68.74" fill="#eaf8c4"/><polygon points="109.71,70.21 116.1,86.12 116.25,68.74" fill="#c3e68e"/><polygon points="109.3,56.01 116.25,68.74 122.78,67.26" fill="#c3e68e"/><polygon points="116.25,68.74 116.1,86.12 122.78,67.26" fill="#86b45d"/></g></g><g class="lf s-u" data-k="6" style="transform-origin:108.63px 81.13px"><g class="gu"><polygon points="108.63,81.13 106.2,86.03 108.78,86.35" fill="#678771"/><polygon points="106.2,86.03 107.28,92.1 108.78,86.35" fill="#678771"/><polygon points="108.63,81.13 108.78,86.35 111.36,86.66" fill="#5c7b67"/><polygon points="108.78,86.35 107.28,92.1 111.36,86.66" fill="#496555"/></g><g class="gp"><polygon points="109.21,76.11 104.2,87.96 109.78,89.17" fill="#bfe08c"/><polygon points="104.2,87.96 103.32,103.32 109.78,89.17" fill="#bfe08c"/><polygon points="109.21,76.11 109.78,89.17 115.35,90.37" fill="#8cbc5e"/><polygon points="109.78,89.17 103.32,103.32 115.35,90.37" fill="#4f8446"/></g><g class="gc"><polygon points="108.63,75.13 103.23,88.27 109.81,89.58" fill="#eaf8c4"/><polygon points="103.23,88.27 102.6,105.39 109.81,89.58" fill="#eaf8c4"/><polygon points="108.63,75.13 109.81,89.58 116.38,90.89" fill="#c3e68e"/><polygon points="109.81,89.58 102.6,105.39 116.38,90.89" fill="#86b45d"/></g></g><g class="lf s-u" data-k="7" style="transform-origin:97.8px 97.8px"><g class="gu"><polygon points="97.8,97.8 93.59,101.29 95.82,102.63" fill="#678771"/><polygon points="93.59,101.29 92.1,107.28 95.82,102.63" fill="#678771"/><polygon points="97.8,97.8 95.82,102.63 98.05,103.97" fill="#496555"/><polygon points="95.82,102.63 92.1,107.28 98.05,103.97" fill="#496555"/></g><g class="gp"><polygon points="100.37,93.45 90.98,102.24 95.58,105.61" fill="#bfe08c"/><polygon points="90.98,102.24 83.93,115.91 95.58,105.61" fill="#bfe08c"/><polygon points="100.37,93.45 95.58,105.61 100.18,108.98" fill="#4f8446"/><polygon points="95.58,105.61 83.93,115.91 100.18,108.98" fill="#4f8446"/></g><g class="gc"><polygon points="100.25,92.32 89.97,102.13 95.44,106" fill="#eaf8c4"/><polygon points="89.97,102.13 82.43,117.52 95.44,106" fill="#eaf8c4"/><polygon points="100.25,92.32 95.44,106 100.91,109.87" fill="#86b45d"/><polygon points="95.44,106 82.43,117.52 100.91,109.87" fill="#86b45d"/></g></g><g class="lf s-u" data-k="8" style="transform-origin:81.13px 108.63px"><g class="gu"><polygon points="81.13,108.63 75.87,110.1 77.36,112.23" fill="#678771"/><polygon points="75.87,110.1 72.07,114.96 77.36,112.23" fill="#678771"/><polygon points="81.13,108.63 77.36,112.23 78.85,114.36" fill="#496555"/><polygon points="77.36,112.23 72.07,114.96 78.85,114.36" fill="#496555"/></g><g class="gp"><polygon points="85.25,105.7 73.1,109.91 75.93,114.86" fill="#bfe08c"/><polygon points="73.1,109.91 61.09,119.52 75.93,114.86" fill="#bfe08c"/><polygon points="85.25,105.7 75.93,114.86 78.76,119.8" fill="#4f8446"/><polygon points="75.93,114.86 61.09,119.52 78.76,119.8" fill="#4f8446"/></g><g class="gc"><polygon points="85.6,104.62 72.22,109.4 75.64,115.16" fill="#eaf8c4"/><polygon points="72.22,109.4 59.07,120.38 75.64,115.16" fill="#eaf8c4"/><polygon points="85.6,104.62 75.64,115.16 79.06,120.91" fill="#86b45d"/><polygon points="75.64,115.16 59.07,120.38 79.06,120.91" fill="#86b45d"/></g></g><g class="lf s-u" data-k="9" style="transform-origin:61.5px 111.73px"><g class="gu"><polygon points="61.5,111.73 56.09,110.94 56.59,113.49" fill="#678771"/><polygon points="56.09,110.94 50.64,113.84 56.59,113.49" fill="#678771"/><polygon points="61.5,111.73 56.59,113.49 57.08,116.04" fill="#496555"/><polygon points="56.59,113.49 50.64,113.84 57.08,116.04" fill="#496555"/></g><g class="gp"><polygon points="66.45,110.74 53.64,109.64 54.21,115.31" fill="#bfe08c"/><polygon points="53.64,109.64 38.76,113.54 54.21,115.31" fill="#bfe08c"/><polygon points="66.45,110.74 54.21,115.31 54.79,120.98" fill="#4f8446"/><polygon points="54.21,115.31 38.76,113.54 54.79,120.98" fill="#4f8446"/></g><g class="gc"><polygon points="67.21,109.89 53.04,108.81 53.83,115.47" fill="#eaf8c4"/><polygon points="53.04,108.81 36.56,113.5 53.83,115.47" fill="#eaf8c4"/><polygon points="67.21,109.89 53.83,115.47 54.61,122.12" fill="#86b45d"/><polygon points="53.83,115.47 36.56,113.5 54.61,122.12" fill="#86b45d"/></g></g><g class="lf s-u" data-k="10" style="transform-origin:42.3px 106.59px"><g class="gu"><polygon points="42.3,106.59 37.68,103.66 37.1,106.2" fill="#678771"/><polygon points="37.68,103.66 31.53,104.1 37.1,106.2" fill="#678771"/><polygon points="42.3,106.59 37.1,106.2 36.51,108.73" fill="#496555"/><polygon points="37.1,106.2 31.53,104.1 36.51,108.73" fill="#5c7b67"/></g><g class="gp"><polygon points="47.23,107.69 35.97,101.48 34.19,106.89" fill="#bfe08c"/><polygon points="35.97,101.48 20.79,98.99 34.19,106.89" fill="#bfe08c"/><polygon points="47.23,107.69 34.19,106.89 32.41,112.31" fill="#4f8446"/><polygon points="34.19,106.89 20.79,98.99 32.41,112.31" fill="#8cbc5e"/></g><g class="gc"><polygon points="48.27,107.23 35.76,100.48 33.77,106.88" fill="#eaf8c4"/><polygon points="35.76,100.48 18.8,98.06 33.77,106.88" fill="#eaf8c4"/><polygon points="48.27,107.23 33.77,106.88 31.78,113.28" fill="#86b45d"/><polygon points="33.77,106.88 18.8,98.06 31.78,113.28" fill="#c3e68e"/></g></g><g class="lf s-u" data-k="11" style="transform-origin:26.85px 94.08px"><g class="gu"><polygon points="26.85,94.08 23.82,89.53 22.26,91.61" fill="#5c7b67"/><polygon points="23.82,89.53 18.02,87.43 22.26,91.61" fill="#678771"/><polygon points="26.85,94.08 22.26,91.61 20.69,93.68" fill="#496555"/><polygon points="22.26,91.61 18.02,87.43 20.69,93.68" fill="#5c7b67"/></g><g class="gp"><polygon points="30.91,97.09 23.15,86.84 19.32,91.06" fill="#8cbc5e"/><polygon points="23.15,86.84 10.29,78.39 19.32,91.06" fill="#bfe08c"/><polygon points="30.91,97.09 19.32,91.06 15.49,95.28" fill="#4f8446"/><polygon points="19.32,91.06 10.29,78.39 15.49,95.28" fill="#8cbc5e"/></g><g class="gc"><polygon points="32.05,97.09 23.37,85.84 18.95,90.88" fill="#c3e68e"/><polygon points="23.37,85.84 8.85,76.73 18.95,90.88" fill="#eaf8c4"/><polygon points="32.05,97.09 18.95,90.88 14.53,95.91" fill="#86b45d"/><polygon points="18.95,90.88 8.85,76.73 14.53,95.91" fill="#c3e68e"/></g></g><g class="lf s-u" data-k="12" style="transform-origin:17.83px 76.37px"><g class="gu"><polygon points="17.83,76.37 16.91,70.98 14.64,72.24" fill="#496555"/><polygon points="16.91,70.98 12.47,66.7 14.64,72.24" fill="#5c7b67"/><polygon points="17.83,76.37 14.64,72.24 12.37,73.5" fill="#496555"/><polygon points="14.64,72.24 12.47,66.7 12.37,73.5" fill="#678771"/></g><g class="gp"><polygon points="20.31,80.77 17.39,68.25 12.17,70.55" fill="#4f8446"/><polygon points="17.39,68.25 9.08,55.3 12.17,70.55" fill="#8cbc5e"/><polygon points="20.31,80.77 12.17,70.55 6.96,72.85" fill="#4f8446"/><polygon points="12.17,70.55 9.08,55.3 6.96,72.85" fill="#bfe08c"/></g><g class="gc"><polygon points="21.35,81.23 17.99,67.43 11.91,70.23" fill="#86b45d"/><polygon points="17.99,67.43 8.44,53.2 11.91,70.23" fill="#c3e68e"/><polygon points="21.35,81.23 11.91,70.23 5.82,73.03" fill="#86b45d"/><polygon points="11.91,70.23 8.44,53.2 5.82,73.03" fill="#eaf8c4"/></g></g><g class="lf s-u" data-k="13" style="transform-origin:16.79px 56.52px"><g class="gu"><polygon points="16.79,56.52 18.14,51.23 15.55,51.45" fill="#496555"/><polygon points="18.14,51.23 15.83,45.51 15.55,51.45" fill="#5c7b67"/><polygon points="16.79,56.52 15.55,51.45 12.96,51.68" fill="#5c7b67"/><polygon points="15.55,51.45 15.83,45.51 12.96,51.68" fill="#678771"/></g><g class="gp"><polygon points="17.26,61.55 19.69,48.92 13.99,48.9" fill="#4f8446"/><polygon points="19.69,48.92 17.37,33.72 13.99,48.9" fill="#4f8446"/><polygon points="17.26,61.55 13.99,48.9 8.29,48.88" fill="#8cbc5e"/><polygon points="13.99,48.9 17.37,33.72 8.29,48.88" fill="#bfe08c"/></g><g class="gc"><polygon points="18.03,62.39 20.58,48.42 13.88,48.5" fill="#86b45d"/><polygon points="20.58,48.42 17.64,31.54 13.88,48.5" fill="#86b45d"/><polygon points="18.03,62.39 13.88,48.5 7.18,48.59" fill="#c3e68e"/><polygon points="13.88,48.5 17.64,31.54 7.18,48.59" fill="#eaf8c4"/></g></g><g class="lf s-u" data-k="14" style="transform-origin:23.91px 37.97px"><g class="gu"><polygon points="23.91,37.97 27.3,33.68 24.85,32.83" fill="#496555"/><polygon points="27.3,33.68 27.51,27.51 24.85,32.83" fill="#496555"/><polygon points="23.91,37.97 24.85,32.83 22.39,31.99" fill="#678771"/><polygon points="24.85,32.83 27.51,27.51 22.39,31.99" fill="#678771"/></g><g class="gp"><polygon points="22.3,42.75 29.66,32.21 24.46,29.87" fill="#4f8446"/><polygon points="29.66,32.21 33.72,17.37 24.46,29.87" fill="#4f8446"/><polygon points="22.3,42.75 24.46,29.87 19.26,27.53" fill="#bfe08c"/><polygon points="24.46,29.87 33.72,17.37 19.26,27.53" fill="#bfe08c"/></g><g class="gc"><polygon points="22.66,43.83 30.67,32.1 24.51,29.46" fill="#86b45d"/><polygon points="30.67,32.1 34.85,15.48 24.51,29.46" fill="#86b45d"/><polygon points="22.66,43.83 24.51,29.46 18.36,26.81" fill="#eaf8c4"/><polygon points="24.51,29.46 34.85,15.48 18.36,26.81" fill="#eaf8c4"/></g></g><g class="lf s-u" data-k="15" style="transform-origin:37.97px 23.91px"><g class="gu"><polygon points="37.97,23.91 42.81,21.38 40.91,19.6" fill="#496555"/><polygon points="42.81,21.38 45.51,15.83 40.91,19.6" fill="#496555"/><polygon points="37.97,23.91 40.91,19.6 39.01,17.83" fill="#678771"/><polygon points="40.91,19.6 45.51,15.83 39.01,17.83" fill="#678771"/></g><g class="gp"><polygon points="34.55,27.63 45.56,20.98 41.76,16.73" fill="#4f8446"/><polygon points="45.56,20.98 55.3,9.08 41.76,16.73" fill="#4f8446"/><polygon points="34.55,27.63 41.76,16.73 37.96,12.48" fill="#bfe08c"/><polygon points="41.76,16.73 55.3,9.08 37.96,12.48" fill="#bfe08c"/></g><g class="gc"><polygon points="34.43,28.76 46.52,21.3 41.98,16.38" fill="#86b45d"/><polygon points="46.52,21.3 57.1,7.82 41.98,16.38" fill="#86b45d"/><polygon points="34.43,28.76 41.98,16.38 37.43,11.46" fill="#eaf8c4"/><polygon points="41.98,16.38 57.1,7.82 37.43,11.46" fill="#eaf8c4"/></g></g><circle class="gring" cx="64" cy="64" r="40.9"/><path id="arc8" d="M36.28 49.26 A31.4 31.4 0 0 1 91.72 49.26" fill="none"/><text class="lab"><textPath href="#arc8" startOffset="50%" text-anchor="middle">GENERATION</textPath></text><text class="wnm" x="64" y="76.6" text-anchor="middle"><tspan class="d1 lz">0</tspan><tspan class="d2">1</tspan></text><text class="of" x="64" y="95" text-anchor="middle"><tspan class="ofw">of</tspan> <tspan class="of15">15</tspan></text></svg>`;
const SEAL_HTML=`<svg class="under" viewBox="0 0 164 152" aria-hidden="true" focusable="false"><circle class="ring-o" cx="82" cy="64" r="64"/><polygon class="ring-o" points="0,118 164,118 157,131 164,144 0,144 7,131"/><circle class="ring-i" cx="82" cy="64" r="64"/><polygon class="ring-i" points="0,118 164,118 157,131 164,144 0,144 7,131"/><circle class="shd" cx="85" cy="68" r="62.6"/><polygon class="shd" points="3,122 167,122 160,135 167,148 3,148 10,135"/></svg><svg class="rib" viewBox="0 0 164 31" aria-hidden="true" focusable="false"><polygon class="rb-u" points="0,26 164,26 157,17 164,29 0,29 7,17"/><polygon class="rb" points="0,0 164,0 157,13 164,26 0,26 7,13"/><polygon class="rb-hl" points="0,0 164,0 164,1.6 0,1.6"/><g transform="scale(1.18)"><path class="orn" d="M12.5 14.5A6 6 0 0 1 18.5 8.5A6 6 0 0 1 12.5 14.5Z"/><path class="orn" d="M120.5 14.5A6 6 0 0 0 126.5 8.5A6 6 0 0 0 120.5 14.5Z"/></g></svg><svg class="seal" viewBox="0 0 148 112" aria-hidden="true" focusable="false">
<g class="rays"><polygon class="r1" points="74.00,1.50 66.68,11.22 74.00,11.70"/><polygon class="r2" points="74.00,1.50 74.00,11.70 81.32,11.22"/><polygon class="r1" points="90.26,8.74 81.32,11.22 87.89,14.46"/><polygon class="r3" points="90.26,8.74 87.89,14.46 94.83,16.82"/><polygon class="r1" points="106.88,15.12 94.83,16.82 99.67,22.33"/><polygon class="r3" points="106.88,15.12 99.67,22.33 105.18,27.17"/><polygon class="r1" points="113.26,31.74 105.18,27.17 107.54,34.11"/><polygon class="r3" points="113.26,31.74 107.54,34.11 110.78,40.68"/><polygon class="r1" points="120.50,48.00 110.78,40.68 110.30,48.00"/><polygon class="r3" points="120.50,48.00 110.30,48.00 110.78,55.32"/><polygon class="r2" points="113.26,64.26 110.78,55.32 107.54,61.89"/><polygon class="r3" points="113.26,64.26 107.54,61.89 105.18,68.83"/><polygon class="r2" points="106.88,80.88 105.18,68.83 99.67,73.67"/><polygon class="r3" points="106.88,80.88 99.67,73.67 94.83,79.18"/><polygon class="r3" points="90.26,87.26 94.83,79.18 87.89,81.54"/><polygon class="r2" points="90.26,87.26 87.89,81.54 81.32,84.78"/><polygon class="r3" points="74.00,94.50 81.32,84.78 74.00,84.30"/><polygon class="r2" points="74.00,94.50 74.00,84.30 66.68,84.78"/><polygon class="r3" points="57.74,87.26 66.68,84.78 60.11,81.54"/><polygon class="r1" points="57.74,87.26 60.11,81.54 53.17,79.18"/><polygon class="r3" points="41.12,80.88 53.17,79.18 48.33,73.67"/><polygon class="r1" points="41.12,80.88 48.33,73.67 42.82,68.83"/><polygon class="r3" points="34.74,64.26 42.82,68.83 40.46,61.89"/><polygon class="r1" points="34.74,64.26 40.46,61.89 37.22,55.32"/><polygon class="r3" points="27.50,48.00 37.22,55.32 37.70,48.00"/><polygon class="r1" points="27.50,48.00 37.70,48.00 37.22,40.68"/><polygon class="r2" points="34.74,31.74 37.22,40.68 40.46,34.11"/><polygon class="r1" points="34.74,31.74 40.46,34.11 42.82,27.17"/><polygon class="r1" points="41.12,15.12 42.82,27.17 48.33,22.33"/><polygon class="r1" points="41.12,15.12 48.33,22.33 53.17,16.82"/><polygon class="r1" points="57.74,8.74 53.17,16.82 60.11,14.46"/><polygon class="r2" points="57.74,8.74 60.11,14.46 66.68,11.22"/></g>
<circle class="disc-o" cx="74" cy="48" r="37.5"/>
<path class="bez-l" d="M48.54,73.46A36.0 36.0 0 0 1 99.46,22.54"/><path class="bez-d" d="M99.46,22.54A36.0 36.0 0 0 1 48.54,73.46"/>
<circle class="disc" cx="74" cy="48" r="34.1"/>
<circle class="track" cx="74" cy="48" r="28.5"/>
<path class="spin" d="M53.85,27.85A28.5 28.5 0 0 1 94.15,68.15A28.5 28.5 0 0 1 53.85,27.85" pathLength="360"/>
<path class="fill" d="M53.85,27.85A28.5 28.5 0 0 1 94.15,68.15A28.5 28.5 0 0 1 53.85,27.85" pathLength="360"/>
<g class="head"><g transform="translate(74 19.5)"><polygon class="hd1" points="-4,-6 7,0 -4,0"/><polygon class="hd2" points="-4,6 7,0 -4,0"/></g></g>
<circle class="core" cx="74" cy="48" r="21.5"/>
<path class="core-d" d="M58.80,63.20A21.5 21.5 0 0 1 89.20,32.80"/>
<g class="sprout">
 <polygon class="s-stem1" points="72.6,61 74,61 74,50 72.6,50"/><polygon class="s-stem2" points="74,61 75.4,61 75.4,50 74,50"/>
 <polygon class="s-l1" points="74,51 59.5,40.5 68.5,41.5"/><polygon class="s-l2" points="74,51 65,50.5 59.5,40.5"/>
 <polygon class="s-l1" points="74,50 78,40 90.5,35.5"/><polygon class="s-l2" points="74,50 90.5,35.5 86,47"/>
</g>
<g class="hexg"><polygon class="x-t" points="-8,-3 -4,-9 4,-9 8,-3 4,3 -4,3" transform="translate(74 46)"/><polygon class="x-l" points="-8,-3 -4,3 -4,8 -8,2" transform="translate(74 46)"/><polygon class="x-f" points="-4,3 4,3 4,8 -4,8" transform="translate(74 46)"/><polygon class="x-r" points="4,3 8,-3 8,2 4,8" transform="translate(74 46)"/></g>
</svg><span class="lbl ready">Next generation</span><span class="lbl wait">Rivals playing…</span><span class="lbl tile">Place your tile first</span>`;
let HOLD=null;
function wheelSet(r,n){if(+r.dataset.n===n)return;const first=!r.dataset.n;r.dataset.n=n;r.setAttribute('aria-label','Generation '+n+' of 15');r.title='Generation '+n+' of 15';r.classList.toggle('fin',n===15);
 r.querySelectorAll('[data-k]').forEach(el=>{const k=+el.dataset.k;el.classList.remove('s-p','s-c','s-u');el.classList.add(k<n?'s-p':k===n?'s-c':'s-u')});
 const d1=r.querySelector('.d1'),d2=r.querySelector('.d2');d1.textContent=n<10?'0':String(Math.floor(n/10));d1.classList.toggle('lz',n<10);d2.textContent=n%10;
 if(!first){r.classList.remove('tick');void r.getBoundingClientRect();r.classList.add('tick')}}
function holdPaint(b,p){b.querySelector('.fill').style.strokeDasharray=`${45+315*p} 360`;b.querySelector('.head').style.transform=`rotate(${315*p}deg)`;b.querySelector('.rays').style.transform=`rotate(${22.5*p}deg)`}
function holdClear(b){['.fill','.head','.rays'].forEach(s=>{const e=b.querySelector(s);e.style.strokeDasharray=e.style.transform=''})}
function holdStop(){if(!HOLD)return;cancelAnimationFrame(HOLD.raf);const b=HOLD.b;HOLD=null;b.classList.remove('holding');holdClear(b)}
function holdStart(b){if(HOLD||b.disabled)return;HOLD={b,t0:performance.now(),raf:0};b.classList.add('holding');
 const step=now=>{if(!HOLD||!HOLD.b.isConnected||HOLD.b.disabled)return holdStop();const p=Math.min(1,(now-HOLD.t0)/HOLD_MS);holdPaint(HOLD.b,p);
  if(p>=1){const x=HOLD.b;HOLD=null;x.classList.remove('holding');nextGen();return}HOLD.raf=requestAnimationFrame(step)};
 HOLD.raf=requestAnimationFrame(step)}
function genUpdate(b){const g=$('#gen');
 if(!g.firstElementChild)g.innerHTML=`<div class="wh" role="img">${WHEEL_SVG}</div><button class="sl" type="button" data-state="ready" title="Hold to start the next generation">${SEAL_HTML}</button>`;
 wheelSet(g.querySelector('.wh'),G.gen);
 const sl=g.querySelector('.sl');sl.dataset.state=G.cur!==ME?'wait':G.pend.length?'tile':'ready';sl.disabled=!!b;
 sl.querySelector('.lbl.ready').textContent=NET?'End turn':'Next generation';sl.title=NET?'Hold to end your turn':'Hold to start the next generation';
 if(b)holdStop();else if(!HOLD)holdClear(sl)}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#gen .sl');if(!b||e.button||b.disabled)return;e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}holdStart(b)});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,holdStop));
document.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('#gen .sl');if(b&&(e.key==' '||e.key=='Enter')){e.preventDefault();if(!e.repeat)holdStart(b)}});
document.addEventListener('keyup',e=>{if(e.key==' '||e.key=='Enter')holdStop()});
window.addEventListener('blur',holdStop);

/* ---------- CORPORATION CARDS (pick screen) ---------- */
const CORP_SLICE=[8,70,34,96,52,18]; // which slice of the card picture each corporation shows (percent across the picture)
const cRes=(k,cls='cri')=>`<img class="${cls}" src="resources/${RFILE[k]}.png" alt="">`;
const cPbox=k=>`<span class="pbox" style="--rc:${RCOL[k]}">${cRes(k,'')}</span>`;
const cTile=(t,badge)=>`<span class="tile"><img src="tile-art/${t}.png" alt="">${badge?'<svg class="badge" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="var(--badge-green)" stroke="var(--card-paper-light)" stroke-width="2"/><path d="M7 12.4 L10.6 16 L17.2 8.6" fill="none" stroke="var(--badge-green-ink)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</span>`;
const cColon='<svg class="op colon" viewBox="0 0 14 38" aria-hidden="true"><g><path d="M7 4 L13 11 L7 18 Z" fill="var(--hue-dark)"/><path d="M7 4 L1 11 L7 18 Z" fill="var(--hue-light)"/><path d="M7 20 L13 27 L7 34 Z" fill="var(--hue-dark)"/><path d="M7 20 L1 27 L7 34 Z" fill="var(--hue-light)"/></g></svg>';
const cEq='<svg class="op eq" viewBox="0 0 16 34" aria-hidden="true"><path d="M2 11 H14 L12.5 15.5 H3.5 Z" fill="var(--hue-dark)"/><path d="M2 20 H14 L12.5 24.5 H3.5 Z" fill="var(--hue-dark)"/><path d="M2 11 H8 L7 15.5 H3.5 Z" fill="var(--hue-light)"/><path d="M2 20 H8 L7 24.5 H3.5 Z" fill="var(--hue-light)"/></svg>';
const cBio='<svg class="biocard" viewBox="0 0 30 42" aria-hidden="true"><rect x="1" y="1" width="28" height="40" rx="4.5" fill="var(--card-plate)" stroke="var(--card-outline)" stroke-width="1.6"/><path d="M1 5.5 a4.5 4.5 0 0 1 4.5 -4.5 H9 V41 H5.5 a4.5 4.5 0 0 1 -4.5 -4.5 Z" fill="var(--type-build)"/><g transform="translate(1.5 1)"><path d="M13 31 L13.8 18.5 L24 11 L26.5 12 L25 23 Z" fill="#6aa04a"/><path d="M13 31 L13.8 18.5 L24 11 L26.5 12 Z" fill="#b7dd8a"/><path d="M13 31 L17.5 22" stroke="#4c7f3a" stroke-width="1.2" stroke-linecap="round"/></g></svg>';
const cRew=(k,n)=>`<span class="rew">${cPbox(k)}<span class="n">+${n}</span></span>`;
const CDIAG={'greenline-reclamation':()=>cTile('forest')+cColon+`<span class="rew">${cRes('cr')}<span class="n">+1</span></span>`,
 'ashfall-recycling':()=>cTile('ruin',1)+cColon+`<span class="rew">${cRes('sa')}<span class="n">+1</span></span>`,
 'vireo-seed-bank':()=>cBio+cColon+cRes('se')+cEq+`<span class="rew vi">${cRes('cr')}<span class="n">2</span></span>`,
 'meridian-fusion':()=>cTile('power')+cColon+'<span class="rew"><span class="costbox"><span class="n">-4</span></span></span>',
 'delta-rewilding-trust':()=>cTile('wetland')+cColon+cRew('bc',1),
 'cairn-heavy-industries':()=>cTile('settlement')+cColon+cRew('sa',1)};
const cNum=t=>esc(t).replace(/[+-]?\d+/g,m=>`<span class="n">${m}</span>`);
function corpCardHTML(c,ci){const s=slug(c.n),st=Object.entries(c.st||{}),pr=Object.entries(c.pr||{}),
 parts=[c.cr+' Cr',...st.map(([k,v])=>v+' '+R[k]),...pr.map(([k,v])=>'+'+v+' '+R[k]+' production')],
 line='(Start with '+(parts.length==1?parts[0]:parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1])+'.)',
 figs=`<span class="fig credits">${cRes('cr','')}<span class="n">${c.cr}</span></span>`+st.map(([k,v])=>`<span class="fig stock">${cRes(k,'')}<span class="n">${v}</span></span>`).join('')+pr.map(([k,v])=>`<span class="fig prod">${cPbox(k)}<span class="n">+${v}</span></span>`).join('');
 return`<article class="corp-card" style="--h:${c.h};--bgx:${CORP_SLICE[ci%6]}%${c.bg?`;--corp-bg:url(${c.bg})`:''}" tabindex="0" role="button" aria-label="Choose ${c.n}" onclick="choose(${ci})" onkeydown="if(event.key=='Enter')choose(${ci})">
<div class="sheet"></div><div class="band-lit"></div><div class="rules"></div>
<div class="tab"><svg viewBox="0 0 214 33" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 H214 L203.5 24.5 Q200.5 32 192 32 H22 Q13.5 32 10.5 24.5 Z" fill="var(--hue-light)" stroke="var(--card-outline)" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 1.8 H207 L199 22 Q197 28.5 190 28.5 H24 Q17 28.5 15 22 Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.1"/></svg><span>CORPORATION</span></div>
<div class="seal"><svg viewBox="0 0 56 56" aria-hidden="true"><path d="M54.30,28.00 L54.11,28.68 L53.57,29.34 L52.77,29.95 L51.85,30.51 L50.95,31.02 L50.22,31.52 L49.78,32.04 L49.66,32.60 L49.88,33.25 L50.36,33.99 L50.99,34.81 L51.63,35.68 L52.14,36.55 L52.38,37.36 L52.30,38.06 L51.86,38.62 L51.11,39.02 L50.14,39.28 L49.07,39.44 L48.05,39.58 L47.19,39.76 L46.57,40.06 L46.25,40.54 L46.20,41.23 L46.37,42.09 L46.64,43.09 L46.90,44.14 L47.03,45.13 L46.95,45.98 L46.60,46.60 L45.98,46.95 L45.13,47.03 L44.14,46.90 L43.09,46.64 L42.09,46.37 L41.23,46.20 L40.54,46.25 L40.06,46.57 L39.76,47.19 L39.58,48.05 L39.44,49.07 L39.28,50.14 L39.02,51.11 L38.62,51.86 L38.06,52.30 L37.36,52.38 L36.55,52.14 L35.68,51.63 L34.81,50.99 L33.99,50.36 L33.25,49.88 L32.60,49.66 L32.04,49.78 L31.52,50.22 L31.02,50.95 L30.51,51.85 L29.95,52.77 L29.34,53.57 L28.68,54.11 L28.00,54.30 L27.32,54.11 L26.66,53.57 L26.05,52.77 L25.49,51.85 L24.98,50.95 L24.48,50.22 L23.96,49.78 L23.40,49.66 L22.75,49.88 L22.01,50.36 L21.19,50.99 L20.32,51.63 L19.45,52.14 L18.64,52.38 L17.94,52.30 L17.38,51.86 L16.98,51.11 L16.72,50.14 L16.56,49.07 L16.43,48.05 L16.24,47.19 L15.94,46.57 L15.46,46.25 L14.77,46.20 L13.91,46.37 L12.91,46.64 L11.86,46.90 L10.87,47.03 L10.02,46.95 L9.40,46.60 L9.05,45.98 L8.97,45.13 L9.10,44.14 L9.36,43.09 L9.63,42.09 L9.80,41.23 L9.75,40.54 L9.43,40.06 L8.81,39.76 L7.95,39.58 L6.93,39.44 L5.86,39.28 L4.89,39.02 L4.14,38.62 L3.70,38.06 L3.62,37.36 L3.86,36.55 L4.37,35.68 L5.01,34.81 L5.64,33.99 L6.12,33.25 L6.34,32.60 L6.22,32.04 L5.78,31.52 L5.05,31.02 L4.15,30.51 L3.23,29.95 L2.43,29.34 L1.89,28.68 L1.70,28.00 L1.89,27.32 L2.43,26.66 L3.23,26.05 L4.15,25.49 L5.05,24.98 L5.78,24.48 L6.22,23.96 L6.34,23.40 L6.12,22.75 L5.64,22.01 L5.01,21.19 L4.37,20.32 L3.86,19.45 L3.62,18.64 L3.70,17.94 L4.14,17.38 L4.89,16.98 L5.86,16.72 L6.93,16.56 L7.95,16.43 L8.81,16.24 L9.43,15.94 L9.75,15.46 L9.80,14.77 L9.63,13.91 L9.36,12.91 L9.10,11.86 L8.97,10.87 L9.05,10.02 L9.40,9.40 L10.02,9.05 L10.87,8.97 L11.86,9.10 L12.91,9.36 L13.91,9.63 L14.77,9.80 L15.46,9.75 L15.94,9.43 L16.24,8.81 L16.42,7.95 L16.56,6.93 L16.72,5.86 L16.98,4.89 L17.38,4.14 L17.94,3.70 L18.64,3.62 L19.45,3.86 L20.32,4.37 L21.19,5.01 L22.01,5.64 L22.75,6.12 L23.40,6.34 L23.96,6.22 L24.48,5.78 L24.98,5.05 L25.49,4.15 L26.05,3.23 L26.66,2.43 L27.32,1.89 L28.00,1.70 L28.68,1.89 L29.34,2.43 L29.95,3.23 L30.51,4.15 L31.02,5.05 L31.52,5.78 L32.04,6.22 L32.60,6.34 L33.25,6.12 L33.99,5.64 L34.81,5.01 L35.68,4.37 L36.55,3.86 L37.36,3.62 L38.06,3.70 L38.62,4.14 L39.02,4.89 L39.28,5.86 L39.44,6.93 L39.58,7.95 L39.76,8.81 L40.06,9.43 L40.54,9.75 L41.23,9.80 L42.09,9.63 L43.09,9.36 L44.14,9.10 L45.13,8.97 L45.98,9.05 L46.60,9.40 L46.95,10.02 L47.03,10.87 L46.90,11.86 L46.64,12.91 L46.37,13.91 L46.20,14.77 L46.25,15.46 L46.57,15.94 L47.19,16.24 L48.05,16.43 L49.07,16.56 L50.14,16.72 L51.11,16.98 L51.86,17.38 L52.30,17.94 L52.38,18.64 L52.14,19.45 L51.63,20.32 L50.99,21.19 L50.36,22.01 L49.88,22.75 L49.66,23.40 L49.78,23.96 L50.22,24.48 L50.95,24.98 L51.85,25.49 L52.77,26.05 L53.57,26.66 L54.11,27.32 Z" transform="translate(1.2 1.6)" fill="var(--hue-ink)" opacity=".42"/><path d="M54.30,28.00 L54.11,28.68 L53.57,29.34 L52.77,29.95 L51.85,30.51 L50.95,31.02 L50.22,31.52 L49.78,32.04 L49.66,32.60 L49.88,33.25 L50.36,33.99 L50.99,34.81 L51.63,35.68 L52.14,36.55 L52.38,37.36 L52.30,38.06 L51.86,38.62 L51.11,39.02 L50.14,39.28 L49.07,39.44 L48.05,39.58 L47.19,39.76 L46.57,40.06 L46.25,40.54 L46.20,41.23 L46.37,42.09 L46.64,43.09 L46.90,44.14 L47.03,45.13 L46.95,45.98 L46.60,46.60 L45.98,46.95 L45.13,47.03 L44.14,46.90 L43.09,46.64 L42.09,46.37 L41.23,46.20 L40.54,46.25 L40.06,46.57 L39.76,47.19 L39.58,48.05 L39.44,49.07 L39.28,50.14 L39.02,51.11 L38.62,51.86 L38.06,52.30 L37.36,52.38 L36.55,52.14 L35.68,51.63 L34.81,50.99 L33.99,50.36 L33.25,49.88 L32.60,49.66 L32.04,49.78 L31.52,50.22 L31.02,50.95 L30.51,51.85 L29.95,52.77 L29.34,53.57 L28.68,54.11 L28.00,54.30 L27.32,54.11 L26.66,53.57 L26.05,52.77 L25.49,51.85 L24.98,50.95 L24.48,50.22 L23.96,49.78 L23.40,49.66 L22.75,49.88 L22.01,50.36 L21.19,50.99 L20.32,51.63 L19.45,52.14 L18.64,52.38 L17.94,52.30 L17.38,51.86 L16.98,51.11 L16.72,50.14 L16.56,49.07 L16.43,48.05 L16.24,47.19 L15.94,46.57 L15.46,46.25 L14.77,46.20 L13.91,46.37 L12.91,46.64 L11.86,46.90 L10.87,47.03 L10.02,46.95 L9.40,46.60 L9.05,45.98 L8.97,45.13 L9.10,44.14 L9.36,43.09 L9.63,42.09 L9.80,41.23 L9.75,40.54 L9.43,40.06 L8.81,39.76 L7.95,39.58 L6.93,39.44 L5.86,39.28 L4.89,39.02 L4.14,38.62 L3.70,38.06 L3.62,37.36 L3.86,36.55 L4.37,35.68 L5.01,34.81 L5.64,33.99 L6.12,33.25 L6.34,32.60 L6.22,32.04 L5.78,31.52 L5.05,31.02 L4.15,30.51 L3.23,29.95 L2.43,29.34 L1.89,28.68 L1.70,28.00 L1.89,27.32 L2.43,26.66 L3.23,26.05 L4.15,25.49 L5.05,24.98 L5.78,24.48 L6.22,23.96 L6.34,23.40 L6.12,22.75 L5.64,22.01 L5.01,21.19 L4.37,20.32 L3.86,19.45 L3.62,18.64 L3.70,17.94 L4.14,17.38 L4.89,16.98 L5.86,16.72 L6.93,16.56 L7.95,16.43 L8.81,16.24 L9.43,15.94 L9.75,15.46 L9.80,14.77 L9.63,13.91 L9.36,12.91 L9.10,11.86 L8.97,10.87 L9.05,10.02 L9.40,9.40 L10.02,9.05 L10.87,8.97 L11.86,9.10 L12.91,9.36 L13.91,9.63 L14.77,9.80 L15.46,9.75 L15.94,9.43 L16.24,8.81 L16.42,7.95 L16.56,6.93 L16.72,5.86 L16.98,4.89 L17.38,4.14 L17.94,3.70 L18.64,3.62 L19.45,3.86 L20.32,4.37 L21.19,5.01 L22.01,5.64 L22.75,6.12 L23.40,6.34 L23.96,6.22 L24.48,5.78 L24.98,5.05 L25.49,4.15 L26.05,3.23 L26.66,2.43 L27.32,1.89 L28.00,1.70 L28.68,1.89 L29.34,2.43 L29.95,3.23 L30.51,4.15 L31.02,5.05 L31.52,5.78 L32.04,6.22 L32.60,6.34 L33.25,6.12 L33.99,5.64 L34.81,5.01 L35.68,4.37 L36.55,3.86 L37.36,3.62 L38.06,3.70 L38.62,4.14 L39.02,4.89 L39.28,5.86 L39.44,6.93 L39.58,7.95 L39.76,8.81 L40.06,9.43 L40.54,9.75 L41.23,9.80 L42.09,9.63 L43.09,9.36 L44.14,9.10 L45.13,8.97 L45.98,9.05 L46.60,9.40 L46.95,10.02 L47.03,10.87 L46.90,11.86 L46.64,12.91 L46.37,13.91 L46.20,14.77 L46.25,15.46 L46.57,15.94 L47.19,16.24 L48.05,16.43 L49.07,16.56 L50.14,16.72 L51.11,16.98 L51.86,17.38 L52.30,17.94 L52.38,18.64 L52.14,19.45 L51.63,20.32 L50.99,21.19 L50.36,22.01 L49.88,22.75 L49.66,23.40 L49.78,23.96 L50.22,24.48 L50.95,24.98 L51.85,25.49 L52.77,26.05 L53.57,26.66 L54.11,27.32 Z" fill="var(--hue-dark)"/><path d="M9.40,46.60 L9.05,45.98 L8.97,45.13 L9.10,44.14 L9.36,43.09 L9.63,42.09 L9.80,41.23 L9.75,40.54 L9.43,40.06 L8.81,39.76 L7.95,39.58 L6.93,39.44 L5.86,39.28 L4.89,39.02 L4.14,38.62 L3.70,38.06 L3.62,37.36 L3.86,36.55 L4.37,35.68 L5.01,34.81 L5.64,33.99 L6.12,33.25 L6.34,32.60 L6.22,32.04 L5.78,31.52 L5.05,31.02 L4.15,30.51 L3.23,29.95 L2.43,29.34 L1.89,28.68 L1.70,28.00 L1.89,27.32 L2.43,26.66 L3.23,26.05 L4.15,25.49 L5.05,24.98 L5.78,24.48 L6.22,23.96 L6.34,23.40 L6.12,22.75 L5.64,22.01 L5.01,21.19 L4.37,20.32 L3.86,19.45 L3.62,18.64 L3.70,17.94 L4.14,17.38 L4.89,16.98 L5.86,16.72 L6.93,16.56 L7.95,16.43 L8.81,16.24 L9.43,15.94 L9.75,15.46 L9.80,14.77 L9.63,13.91 L9.36,12.91 L9.10,11.86 L8.97,10.87 L9.05,10.02 L9.40,9.40 L10.02,9.05 L10.87,8.97 L11.86,9.10 L12.91,9.36 L13.91,9.63 L14.77,9.80 L15.46,9.75 L15.94,9.43 L16.24,8.81 L16.42,7.95 L16.56,6.93 L16.72,5.86 L16.98,4.89 L17.38,4.14 L17.94,3.70 L18.64,3.62 L19.45,3.86 L20.32,4.37 L21.19,5.01 L22.01,5.64 L22.75,6.12 L23.40,6.34 L23.96,6.22 L24.48,5.78 L24.98,5.05 L25.49,4.15 L26.05,3.23 L26.66,2.43 L27.32,1.89 L28.00,1.70 L28.68,1.89 L29.34,2.43 L29.95,3.23 L30.51,4.15 L31.02,5.05 L31.52,5.78 L32.04,6.22 L32.60,6.34 L33.25,6.12 L33.99,5.64 L34.81,5.01 L35.68,4.37 L36.55,3.86 L37.36,3.62 L38.06,3.70 L38.62,4.14 L39.02,4.89 L39.28,5.86 L39.44,6.93 L39.58,7.95 L39.76,8.81 L40.06,9.43 L40.54,9.75 L41.23,9.80 L42.09,9.63 L43.09,9.36 L44.14,9.10 L45.13,8.97 L45.98,9.05 L46.60,9.40 Z" fill="var(--hue-mid)"/><circle cx="28" cy="28" r="19.4" fill="none" stroke="var(--hue-light)" stroke-width="1.7"/><circle cx="28" cy="28" r="16.4" fill="var(--card-paper-light)"/></svg><img class="mark" src="ui/logo-icon.png" alt=""></div>
<div class="plate"><div class="emblem"><img src="corps/${s}.png" alt="" onerror="this.remove()"></div><div class="who"><h3 class="name">${esc(c.n)}</h3></div></div>
<div class="start"><div class="figs">${figs}</div><p class="start-line">${cNum(line)}</p></div>
<section class="effect"><div class="ribbon">EFFECT</div><div class="stage"><div class="dgm">${CDIAG[s]?CDIAG[s]():''}</div></div><div class="effect-wrap"><p class="effect-line">(${cNum(c.d)})</p></div></section>
<div class="orn"><i></i><b></b><i></i></div><p class="lore">${esc(CORP_LORE[s]||'')}</p></article>`}
const CORP_LORE={'greenline-reclamation':'Started with one truck and a thousand saplings. Still plants first and files the paperwork later.','ashfall-recycling':'Nothing is rubble if somebody will pay for it. Ashfall pays, then sorts the pile by weight.','vireo-seed-bank':'Their vault outlived the city above it. Small seeds keep long promises, and Vireo keeps the receipts.','meridian-fusion':'Bottled sunlight, sold by the hour. The grid hums the same tune it did before the fall.','delta-rewilding-trust':'Water remembers where it used to go. The Trust just stops digging in its way.','cairn-heavy-industries':'They stack what the old world dropped. Every settlement starts with one heavy stone.'};

document.addEventListener('pointerdown',au,{once:true});
lobby();

/* ---------- TILE ART: image files in tile-art/ (loaded now, so the board never flashes empty) ---------- */
const TILEDATA={blank:'tile-art/blank.png',forest:'tile-art/forest.png',power:'tile-art/power.png',corridor:'tile-art/corridor.png',ruin:'tile-art/ruin.png',wetland:'tile-art/wetland.png',settlement:'tile-art/settlement.png'};
Object.values(TILEDATA).forEach(u=>{new Image().src=u});
