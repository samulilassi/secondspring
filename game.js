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
{n:'Vireo Seed Bank',t:'Seed vault co-op',h:95,cr:40,pr:{se:2},d:'Seeds pay 2 Cr each for Soil cards'},
{n:'Meridian Fusion',t:'Fusion grid builders',h:190,cr:38,pr:{fc:2},d:'Fusion Plant cards cost 4 less'},
{n:'Delta Rewilding Trust',t:'Wetland trust',h:175,cr:46,d:'Wetlands you place give +1 Biochar prod'},
{n:'Cairn Heavy Industries',t:'Heavy industry',h:35,cr:34,pr:{re:1},st:{sa:2},d:'Settlements you place give +1 Salvage prod'}];
/* CARD SYNERGIES - shown as symbols in the card's top right corner. They are the only card categories. To add a new one: add a line here and put its icon in ui/syn/<key>.svg.
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
/* CARDS: one card per line:  name | cost | type | synergies | requirement | effects | flavour text
   type: B Build (stays in play), A Active (stays in play: an action, a trigger or a discount), E Event (played once)
   synergies: 0-3 keys from SYN above, separated by spaces
   requirement (optional): co>=8, co<=10 (CO2 track), so>=4, so<=7 (Soil %), we>=2 (Wetlands), syn.science>=3 (Science cards you have played), own.p (you own a Fusion Plant)
   effects, separated by spaces:
     Pse2 production (+2 Seeds every generation)   Gcr3 gain now (Gcr1/t = 1 Credit per tile you own)   Tco Tso Twe track step
     Lf Lw Ls Lp Lc place a Forest / Wetland / Settlement / Fusion Plant / Wildlife Corridor   Lr clear a ruin   D2 draw cards   V2 victory points (V-1 = minus one)
     Qcr5 steal up to 5 from a rival   Xse4 a rival loses up to 4   Zfc1 a rival loses 1 production
     A{sa2:Gcr5} action once per generation (pay left, get right; tok1 = add a token to this card)
     W{play.industry:Gcr2} trigger. play.<synergy> or play.E (you play one), place.f (you place one), any.p (anyone places one), anytrack.co / anytrack.so (anyone lowers CO2 / raises Soil)
     K{industry:2} your cards with that synergy cost less (K{all:1} = every card)
     VS{syn.science:2} game end: 1 VP per 2 Science cards played (VS{f:3}: per 3 Forests you own)   VT2 game end: 1 VP per 2 tokens on this card */
const CARDS=`Ruin Clearance Crew|6|E|recycling||Lr Gsa3|Somebody has to move the rubble.
Seed Vault Opening|10|E|soil||Gse5 Tso|Frozen for decades, hungry for sunlight.
Tidal Fusion Reactor|14|B|power fusioncell||Pfc3|The moon does the heavy lifting.
Mycorrhizal Network|12|B|soil||Pse2|The forest has had wi-fi all along.
Carbon Capture Towers|16|A|engine air||A{fc4:Tco}|Skyscrapers that inhale for a living.
Scrapyard Foundry|9|B|industry recycling||Psa2|One era's junk is the next one's steel.
Rare Earth Reclaimers|14|B|engine recycling||Pre2|Old gadgets, new metals, no mining.
Floodplain Restoration|15|B|wildlife soil||Lw Pbc1|Let the river remember where it lived.
Pollinator Swarm|8|E|wildlife||Gse4 D1|Tiny wings, enormous plans.
Biochar Kilns|8|B|industry soil||Pbc2 Pfc-1|Burn slow, bury carbon, grow better.
Nuclear Winter Reversal|24|E|science air||Tco Tco|The long thaw begins today.
Greenbelt Charter|18|B|settlement||Ls Pcr2 V1|A promise written in grass.
Prairie Rewilding Programme|13|B|wildlife air||Lf Pse1|The bison are on their way back.
Salvage Auctions|5|E|recycling||Gcr6 Gsa2|Going once, going twice, sold for scrap.
Aquifer Recharge|17|B|science||Lw Pcr1|Patience, drop by drop.
Solar Farm Grid|11|B|power||Pfc2|Free power, if you can stand the glare.
Enclave Exchange|7|A|industry||A{sa1:Gcr3}|One survivor's junk is another's currency.
Soil Microbiome Lab|14|A|science soil||A{bc5:Tso}|A billion tiny employees, zero salaries.
Rewilding Drone Fleet|12|A|engine wildlife||A{cr1:Gse2}|Seeds from above, no questions asked.
Old World Archive Dig|6|E|recycling science||D2 Gre1|Turns out they did keep receipts.
Wildlife Corridor Pact|9|B|wildlife||Lc Gcr2|Fences down, paws welcome.
Fusion Plant Prototype|13|B|power engine||Lp Pre1|It works. Mostly.
Peatland Revival|20|B|soil air wildlife||Lw Tco V2|The bog is back, and it brought friends.
Sealed Enclave Charter|16|B|settlement||Ls Pcr2|Closed doors, open ledgers.
Orchard Terraces|10|B|soil||Pse1 Pcr1 V1|Apples grow where the asphalt cracked.
Terraformer Veterans|7|B|||Pcr1 V1|They have seen worse than this swamp.
Scrap Metal Rush|3|E|recycling||Gsa5|Finders keepers, weighers payers.
Mangrove Barrier|15|B|air||Lw Gse3|Roots against the rising tide.
High Density Housing|19|B|settlement industry||Ls Psa1 V2|Cozy is a matter of perspective.
Atmospheric Filtration Grid|22|B|engine air||Tco Pcr2|Breathe in. Thank the machine.
Glacier Regrowth Project|28|E|science soil||Tso Tso Lw|Slow ice, slower paperwork.
Fusion Cell Surplus|4|E|fusioncell||Gfc6|Overstocked and slightly warm.
Compost Network|6|A|soil||A{se2:Gbc3}|Nothing is waste if you wait long enough.
Heavy Machinery Depot|12|B|industry engine recycling||Psa1 Pre1|Beeps loudly, moves mountains.
Earth Day Festival|9|E|||Gcr1/t|Every tile a reason to celebrate.
Hydroponic Skyfarm|14|B|engine||Pse3|Lettuce, but make it vertical.
Genetic Archive Reboot|26|B|science soil||Pse2 Tso V3|Restore from backup. Fingers crossed.
Ghost City Rebuild|17|B|recycling settlement||Lr Ls Pcr1|Cozy is a matter of time.
Weather Control Network|32|E|science engine air||Tco Tco Lw|Rain on request, sun on Sundays.
The Great Greening|35|B|soil air||Tco Tso Lw V6|And then, one morning, everything was green.
Salvage Yard Cranes|8|B|industry||Psa1 Gsa2|Old cranes, new purpose.
Steel Reclamation Mill|15|B|industry||Psa2 V1|Melted down and built back up.
Rolling Mill Restart|13|B|industry||Psa1 Pcr1|It groaned, then it rolled.
Assembly Line Reborn|18|B|industry|syn.industry>=2|Psa1 Pcr2 V1|The conveyor belt remembers.
Workshop Cooperative|6|B|industry||Pcr1 Gsa1|Shared tools, shared profits.
Rivet Foundry|10|B|industry||Psa2|Hot iron, steady hands.
Industrial Commons|26|B|industry|syn.industry>=4|Psa2 Pcr2 V2|A factory owned by everyone.
Machine Shop Annex|5|B|industry||Psa1|One lathe, big ambitions.
Freight Depot Revival|11|B|industry||Pcr2|The trains still know the way.
Tool and Die Works|9|B|industry||Psa1 D1|Precision, salvaged.
Forge Quarter|20|B|industry||Psa3 V1|A whole district that smells of hot metal.
Rail Yard Salvage|14|B|industry recycling||Psa1 Gsa4 Pcr1|Ten thousand tonnes of rusty opportunity.
Cement Kiln Restart|12|B|industry|co>=8|Psa2 Gcr2|Dirty, cheap and only possible early on.
Coal Bunker Conversion|4|B|industry||Psa1 Pfc1 V-1|Not proud of it, but it runs.
Smokestack Refit|16|B|industry air||Psa1 Tco|Same chimney, cleaner breath.
Glassworks Kilns|13|B|industry||Psa1 Pcr1 Gsa2|Sand in, windows out.
Union Hall|10|B|industry|syn.industry>=3|Pcr2 V1|Solidarity, with coffee.
Mega-Press Plant|33|B|industry engine||Psa3 Pre1 V1|It presses whole cars flat. Politely.
Charcoal Retort Yard|14|B|industry soil||Pbc2 Psa1|Wood in, carbon underground.
Scrap-Fed Reactor|12|B|industry fusioncell||Pfc2 Psa1 Pcr-1|Feeds on yesterday.
Concrete Crushers|9|B|industry recycling||Psa1 Gsa3|Rubble in, gravel out.
Geothermal Wellhead|16|B|power industry||Lp Psa1|The planet's own boiler room.
Microgrid Substation|12|B|power industry|own.p|Pcr2 Pfc1|Small grid, big reliability.
Grid Restoration Crews|11|B|power industry|own.p|Pcr1 Psa1 Gsa2|Climbing poles since the collapse.
Turbine Repair Line|17|B|industry engine||Pre1 Psa1 Pcr1|Every blade balanced by hand.
Magnet Recovery Works|14|B|industry engine||Pre2|Pulling metals out of motors.
Precision Lathes|22|B|industry engine|syn.engine>=2|Pre2 V1|Tolerances finer than a hair.
Excavator Fleet|18|B|industry engine||Psa2 Pre1|Big yellow optimism.
Gearbox Rebuilders|12|B|industry engine||Pre1 Gsa3|Teeth, oil and patience.
Automated Sorting Line|24|B|industry engine recycling||Psa2 Pre1 D1|The robots know what goes where.
Exoskeleton Workshop|14|B|industry engine||Pre1 Psa1 Gcr2|Lift a beam, save a back.
Landfill Mining Rig|15|B|industry engine recycling||Psa1 Pre1 Gsa2|The richest mine is the old dump.
Electric Tractor Pool|15|B|engine soil||Pse2 Pcr1|Quiet fields, loud harvests.
Rewound Motors|10|B|engine||Pre1 Pcr1|New copper, old hum.
Battery Swap Network|18|B|engine fusioncell||Pfc2 Pre1|Swap, click, drive.
Hover Seeder Drones|24|B|engine soil|so<=8|Pse2 Tso|They sow where boots can't go.
Wind Pump Array|17|B|engine power||Lp Pcr1|Water up, power out.
Hydrogen Fuel Plant|22|B|engine power|own.p|Pfc2 Pre1 V1|Split water, store sunshine.
Cable Car Lines|12|B|engine||Pcr2|“Roads? Where we’re going, we don’t need roads.”
Orbital Mirror Fragments|45|B|engine air|co<=8|Tco Tco Pre1 V2|A broken satellite, turned into a sunshade.
Remote Sensing Station|11|B|engine science||D2 Pre1|Seeing the whole valley at once.
Seismic Monitoring Grid|13|B|engine science||Pre1 D1|Listening to the ground breathe.
Copper Wire Harvest|12|B|engine recycling||Gre3 Psa1|Kilometres of it, in every wall.
Seed Genome Library|16|B|science soil||Pse2 D1|Every seed indexed, every seed loved.
University Ruins Reopened|19|B|science recycling||Lr D2 Pcr1|Lectures resume in Hall B. Mind the hole.
Climate Observatory|14|B|science air||D1 Pcr1 V1|Measuring the sky's recovery.
Soil Chemistry Institute|22|B|science soil|syn.science>=2|Tso Pbc1 V1|Dirt, studied seriously.
Botanical Archive|9|B|science||D2 V1|Pressed flowers, precise notes.
Fusion Research Campus|26|B|science fusioncell power|syn.science>=2|Pfc3 V1|Clever people, very bright lights.
Grand Ecology Academy|28|B|science|syn.science>=4|D2 VS{syn.science:2}|Where every lesson is outdoors.
Atmospheric Chemistry Lab|20|B|science air|syn.science>=3|Tco D1 V1|Counting molecules, one breath at a time.
Hydrology Survey|10|B|science|we>=2|D2 Pcr1|Mapping every stream back to its source.
Mycology Research Hut|8|B|science soil||Pse1 D1|Mushrooms are smarter than they look.
Gene Bank Consortium|30|B|science|syn.science>=5|Pcr2 D1 V3|“Life, uh, finds a way.”
Bioreactor Prototype|17|B|science fusioncell||Pfc2 D1|Algae in a tube, power in a cell.
Marsh Reclamation|16|B|science||Lw D1|The study said wetland. So, wetland.
Riverside Hydro Dam|19|B|power||Lp Pfc1 Pcr1|The river pays rent now.
Solar Canopy Field|14|B|power||Lp Gfc4|Shade for sheep, power for people.
Reactor Cooling Ponds|18|B|power fusioncell|own.p|Pfc3 Gbc2|Warm water, happy frogs.
Tidal Lagoon Array|24|B|power|we>=3|Lp Pfc2 V1|Twice a day, like clockwork.
Mall Demolition Contract|11|B|recycling industry||Lr Psa1|Last sale: everything must go.
Ruin Gardeners|13|B|recycling soil||Lr Pse1 Gse2|Flowers first, bricks later.
Glass Bottle Exchange|6|B|recycling||Pcr1 Gsa1|Ten bottles, one coin.
Terraced Hillsides|15|B|soil|so>=3|Pse2 V1|Steps of green up every slope.
Earthworm Revival|7|B|soil||Pse1 Gbc2|The real terraformers.
Retention Pond Network|14|B|soil||Lw Pse1|Catch the rain, keep the soil.
Pocket Forests|12|B|air||Lf Gse2|A forest the size of a tennis court.
Urban Canopy Initiative|16|B|air|co<=10|Lf Pcr1|Shade on every street.
Old-Growth Reserve|26|B|air|co<=6|Lf VS{f:3}|Some trees are older than the collapse.
Reed Bed Filters|13|B|air||Lw Gcr2|Plants that clean the water and the air.
Badger Crossing|11|B|wildlife||Lc Gse2|Tunnels under the road, finally.
Elk Migration Route|17|B|wildlife air|co<=9|Lc V1|The herds remember the old paths.
Riverside Hamlet|14|B|settlement||Ls Pse1|Twelve houses and a ferry.
Rail Town Revival|20|B|settlement industry||Ls Psa1 Pcr1|The station clock works again.
Solar Village|18|B|settlement power|own.p|Ls Pcr2|Every roof a power plant.
Scavenger Outpost|9|B|settlement recycling||Ls Gsa3|Built from what was lying around.
Science Commune|19|B|settlement science||Ls D2 V1|Peer review at the dinner table.
Eco-Arcology|42|B|settlement engine air|co<=7|Ls Tco Pcr3 V2|A city that breathes with the forest.
Floating Harbor Town|22|B|settlement|we>=4|Ls Pcr2 V1|Houses that rise with the water.
Great Smelting Complex|55|B|industry engine|syn.industry>=4|Psa4 Pre2 V3|The biggest furnace in the valley, relit.
Valley Reforestation Act|50|B|soil air|co<=10|Lf Lf Tso V2|Two forests, one law, a whole valley of shade.
Continental Seed Network|67|B|soil science|syn.science>=3|Pse4 Tso Tso V4|Every valley sends its seeds to every other.
Scrap Harbour Shipyard|23|B|industry recycling||Psa2 Gsa4 Pcr1|Hulls cut up, hulls welded back.
Sawmill Cooperative|9|B|industry soil||Psa1 Pse1|Only fallen trees, by rule.
Bicycle Factory|12|B|industry air||Pcr2 V1|The quietest traffic jam in history.
Blast Furnace Restart|8|B|industry|co>=10|Psa2 V-1|Loud, filthy and very productive.
River Barge Fleet|16|B|industry engine|we>=2|Pcr2 Pre1|The rivers are roads again.
Pioneer Birch Stands|10|B|||Lf|Birches always arrive first.
Reforestation Bonds|18|B|||Lf Pcr2|Invest in shade.
Memorial Garden|5|B|||V1 Gcr1|For the ones who planted before us.
Community Granary|7|B|||Pse1 Gcr2|Nobody goes hungry this winter.
Salvage Brokerage|10|A|industry||A{sa2:Gcr5}|Scrap bought low, sold high.
Night Shift Foundry|14|A|industry||A{cr4:Gsa3}|The furnace never sleeps.
Scrap Recycling Contracts|8|A|industry recycling||W{play.recycling:Gsa2}|Paid by the tonne.
Industrial Purchasing Office|8|A|industry||K{industry:2}|Bulk orders, bulk discounts.
Foreman's Guild|12|A|industry|syn.industry>=3|W{play.industry:Gcr2}|Every new line needs a foreman.
Robotic Welders|16|A|industry engine||A{re1:Gsa3}|Sparks without sweat.
Smelter Co-op|11|A|industry||A{sa3:Gre2,Gcr1}|Turning scrap into something rare.
Heavy Industry Lobby|10|A|industry|co>=7|K{industry:3} V-1|Friends in high places, smoke in the air.
Carbon Offset Exchange|7|A|industry air||W{anytrack.co:Gcr1}|Every breath of clean air pays a dividend.
Conveyor Logistics Hub|13|A|industry engine||K{industry:1} K{engine:1} Gsa2|Everything arrives on time. Eventually.
Steelworks Union|17|A|industry|syn.industry>=4|W{play.industry:Gsa1,Gcr1}|Strong arms, stronger contracts.
Rail Museum|10|A|industry recycling||A{sa2:tok1} VT2|Every engine restored is a visitor magnet.
Plant Maintenance Guild|10|A|power industry||W{any.p:Gsa2}|Every new plant needs a mechanic.
Trading Post Settlement|17|A|settlement industry||Ls A{sa1:Gcr3}|“Greed, for lack of a better word, is good.”
Autonomous Haulers|16|A|engine industry||A{re1:Gsa2,Gcr1}|They drive themselves to the scrapyard.
Recycled Rail Network|20|A|industry engine|syn.industry>=2|A{:Gsa2} Pcr1|Old tracks, new freight.
Tool Lending Depot|9|A|industry||A{cr1:Gsa1} Gsa2|Return it by Friday, please.
Heavy Haul Contractors|13|A|industry||A{sa3:Gcr8}|If it fits on a truck, it moves.
Furnace Heat Exchange|12|A|industry fusioncell||A{sa2:Gfc5}|Waste heat, captured.
Scrap Metal Sculptors|12|A|industry recycling||A{sa4:tok1} VT1|Art made from the old world's bones.
Industrial Revival Fund|18|A|industry|syn.industry>=5|W{play.industry:D1}|“Was all this legal? Absolutely not.”
Drone Maintenance Bay|9|A|engine||K{engine:2}|Spare rotors on every shelf.
Rare Metal Exchange|9|A|engine||A{re1:Gcr4}|“Nobody knows if a stock is going to go up, down, sideways or in circles.”
Maglev Freight Line|16|A|engine|syn.engine>=2|W{play.engine:Gcr3}|Floating freight, silent and fast.
Mechanic Network|11|A|engine||A{sa3:Gre3}|Ask around. Someone has the part.
Satellite Uplink|14|A|engine science||W{play.science:Gre1}|The old satellites still answer.
Electric Bus Depot|9|A|engine air||W{any.s:Gcr3}|Every new town gets a bus stop.
Laboratory Robotics|14|A|science engine||K{science:2} K{engine:1}|Pipettes that never get tired.
Carbon Vault|16|A|air engine||A{bc2:tok1} VT1|Carbon locked away for a thousand years.
Isotope Separators|15|A|fusioncell engine||A{fc3:Gre2}|Sorting atoms by weight.
Load Balancing Center|15|A|power engine|own.p|A{:Gfc2}|Not a single watt wasted.
Engine Rebuild Bay|20|A|engine|syn.engine>=3|A{re3:tok1} VT1 Pre1|Every rebuilt engine is a trophy.
Field Laboratory|16|A|science||A{:D1}|A tent, a microscope and endless questions.
Peer Review Board|12|A|science|syn.science>=2|K{science:2}|“I’m gonna make him an offer he can’t refuse.”
Seed Testing Plots|11|A|science soil||W{play.soil:Gse2}|Rows and rows of careful experiments.
Weather Station Network|10|A|science air||A{cr4:D2}|Tomorrow: clearing skies.
Research Grants Office|18|A|science|syn.science>=3|W{play.science:Gcr3}|Funding follows curiosity.
Archive Restoration|12|A|science recycling||W{play.recycling:D1}|Every ruin hides a notebook.
Think Tank|25|A|science|syn.science>=4|A{:D1} VS{syn.science:3}|Ideas, on tap.
Memory Archive|10|A|science||W{play.science:tok1} VT2|Remember everything, repeat nothing.
Citizen Science Network|8|A|science||W{play.science:Gcr1} D1|Thousands of volunteers with notebooks.
Long-Term Ecology Plots|14|A|science soil|syn.science>=2|A{:tok1} VT2|The best data takes decades.
Fusion Cell Exchange|8|A|fusioncell||A{fc2:Gcr3}|Charged cells, cash on delivery.
Cold Fusion Kiln|12|A|fusioncell soil||A{fc2:Gbc4}|A kiln that runs on borrowed sunlight.
Plasma Torch Recycler|13|A|fusioncell recycling||A{fc2:Gsa3}|Cuts through anything the old world built.
Fusion Grid Operator|20|A|fusioncell power|own.p|A{fc3:Gcr6}|Selling power to the whole valley.
Fusion Battery Farm|9|A|fusioncell||A{fc4:D2}|Rows of humming batteries.
Power Broker|8|A|power||K{power:3}|Knows every plant manager by name.
Worm Farm Cooperative|8|A|soil|so<=7|A{se1:Gbc2}|Feed the worms, feed the soil.
Soil Restoration Fund|10|A|soil|so>=4|W{anytrack.so:Gcr2}|Every inch of topsoil pays back.
Rotational Grazing|14|A|soil|so>=5|A{se5:Tso}|Move the herd, heal the ground.
Seedling Nursery|14|A|soil||A{:tok1} VT2|A thousand saplings waiting for a home.
Bee Hive Collective|9|A|soil||W{any.f:tok1} VT3|Every new forest means more honey.
Wolf Return Charter|16|A|wildlife||Lc W{place.f:Gcr1}|The wolves came back, and the forests followed.
Museum of the Old World|14|A|recycling||W{play.recycling:tok1} VT1|Exhibit 1: a working toaster.
Storyteller's Circle|5|A|||W{play.E:Gcr1}|Every event becomes a story.
Wishing Well|4|A|||A{cr1:tok1} VT4|A coin for the future.
Community Toolshed|10|A|||K{all:1}|Everything is cheaper when you share.
Spring Rains|5|E|||Gse4 Gcr1|The first warm rain in years.
Lucky Find|2|E|||Gcr4|Someone forgot their wallet in 2041.
Supply Drop|8|E|||Gsa2 Gre1 Gcr3|“Life is like a box of chocolates. You never know what you’re gonna get.”
Barter Fair|4|E|||Gcr2 D1|Swap what you have for what you need.
Night Raid|6|E|||Qcr5|Quick, quiet and rude.
Sabotaged Pipeline|5|E|||Zfc2 Gcr2|Someone loosened the valves.
Bandit Toll|3|E|||Qsa3|Pay up or go around.
Hailstorm|4|E|||Xse5 Gcr1|Bad weather, worse for them.
Brush Fire|6|E|||Xse4 Gbc3|Small fire, big headache.
Windfall Harvest|10|E|||Gse6 Gcr3|More apples than baskets.
Scout Report|4|E|||D2|They found something over the ridge.
Old Bank Vault|9|E|||Gcr13|The vault opened. The money was still good.
Anonymous Donor|0|E|||Gcr2|No name, no strings.
Customs Embargo|7|E|||Zre1 Gcr4|Rare metals are not leaving this valley.
Seed Swap Meet|2|E|||Gse3|Bring a seed, take a seed.
Fuel Cache|5|E|||Gfc5 Gcr1|Sealed drums behind the old garage.
Volunteer Weekend|11|E|||Lf Gcr1|Bring gloves and a shovel.
Scrap Drive|4|E|recycling industry||Gsa4|Everyone brings one broken thing.
Demolition Day|7|E|recycling||Lr Gcr2|Stand back and cover your ears.
Bridge Salvage Teams|9|E|recycling engine||Lr Gre2|Steel cables hold more than bridges.
Factory Fire Sale|6|E|industry||Gsa3 Gcr3|Everything must go, including the doors.
Overtime Push|5|E|industry||Gsa2 D1|Just one more shift.
Rare Earth Strike|8|E|engine||Gre4|A seam of neodymium in the old quarry.
Prototype Unveiling|12|E|engine science||Gre2 D2|It sparked, but in a good way.
Breakthrough Paper|10|E|science|syn.science>=2|D3 V1|Published, peer-reviewed, celebrated.
Carbon Tax Rebate|14|E|air industry|co<=10|Tco Gsa2 Gcr2|Clean air finally pays.
Clean Air Day|18|E|air|co<=6|Tco Tco|You can see the mountains again.
Topsoil Delivery|16|E|soil|so<=5|Tso Gse2|Fresh earth by the truckload.
Fusion Breakthrough|10|E|fusioncell science||Gfc8 D1|Stable at last.
Grid Blackout|6|E|power|own.p|Zfc1 Gfc4|Your lights stay on. Theirs don't.
Salvage Rights Auction|5|E|recycling||Qsa3 Gcr2|The highest bidder takes the scrapyard.`.split('\n').map(l=>{const[n,c,y,s,q,f,fl]=l.split('|');return{n,c:+c,y,s:s.split(' ').filter(Boolean),q,f:f.split(' ').filter(Boolean),fl}});
const D=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let HELPFIRST=null,ME=0,NET=null,BOARD=null,PICKUI=false,RUNNING=false,UNDO=null,LASTCUR,HSORT=0,LASTMOVE=Date.now(); // ME = your seat in the game (0 in solo); NET = online lobby connection
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
err(){tone(130,.2,'sawtooth',.08)},
turn(){[523,784].forEach((f,i)=>tone(f,.45,'sine',.14,0,i*.14));tone(1047,.6,'triangle',.05,0,.28)},
end(){[392,523,659,784,1047].forEach((f,i)=>tone(f,1.1,'triangle',.1,0,i*.16));nz(.6,3000,.05)},gen(){[262,330,392,523].forEach((f,i)=>tone(f,.8,'sine',.1,0,i*.12))}};
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
$('#app').innerHTML=`<div id="stage"><div id="mist"></div><svg id="bd" viewBox="-252 -135 504 275"><defs><pattern id="stp" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="4" height="9" fill="#f6ffbf" opacity=".7"><animate attributeName="x" from="0" to="9" dur="1.1s" repeatCount="indefinite"/></rect></pattern></defs><g id="cells"></g><g id="rises" pointer-events="none"></g><g id="badges" pointer-events="none"></g><g id="fx"></g></svg></div>
<div id="logo"><img src="ui/logo-icon.png" alt="" width="46" height="46" style="width:46px;height:46px;object-fit:contain" onerror="this.outerHTML=LOGO"><span>Second Spring</span></div><div id="top" class="panel"></div><div id="corps"></div>
<div id="cnt"><button id="gear" title="Settings" onclick="setp()"><img src="ui/gear.png" alt="" width="46" height="46" style="width:46px;height:46px;display:block" onerror="this.outerHTML=GEAR"></button></div>
<div id="set" class="panel" hidden></div><div id="tab"></div><div id="ask" hidden></div>
<div id="sec"><h3>The returning world</h3><p id="log"></p></div>
<div id="deck"></div><div id="played" onclick="showPlayed()" title="Your played cards"></div><div id="std"></div><div id="res" class="panel"></div>
<div id="gen"></div><div id="hand" class="panel"></div><div id="foot1">SS—2300</div><div id="foot2">Private table · <span id="pn"></span> players</div>
<div id="lob"></div><div id="modal" hidden></div>`;

/* ---------- RULES ---------- */
const nb=c=>D.map(d=>G.map[(c.q+d[0])+','+(c.r+d[1])]).filter(Boolean);
const valid=t=>{let v=G.cells.filter(c=>t=='r'?c.t=='R':!c.t);if(t=='s')v=v.filter(c=>!nb(c).some(n=>n.t=='s')); // a Settlement can't touch another Settlement
 if(t=='c'){const w=v.filter(c=>nb(c).some(n=>n.t=='f'));if(w.length)return w}return v};
const myTurn=()=>G&&G.phase==='play'&&G.cur===ME&&G.ps[ME]&&!G.ps[ME].bot;
const busy=()=>!G||G.pend.length>0||!myTurn()||G.over||!!(G.ps[ME].draft&&G.ps[ME].draft.length);
/* discounts from your Active cards: K{industry:2} = Industry cards cost 2 less, K{all:1} = every card */
function disc(p,cd){let d=0;for(const id of p.tab||[])for(const t of CARDS[id].f){const m=t.match(/^K\{(\w+):(\d+)\}$/);if(m&&(m[1]=='all'||cd.s.includes(m[1])))d+=+m[2]}return d}
const cost=(p,cd)=>Math.max(0,cd.c-(p.c.n[0]=='M'&&cd.f.includes('Lp')?4:0)-disc(p,cd));
const ownT=(p,t)=>G.cells.filter(c=>c.t==t&&c.o===p.i).length;
/* requirements: track levels (co>=8, so<=7, we>=2), synergy cards already played (syn.science>=3) or owning a Fusion Plant (own.p) */
function reqOk(p,cd){const r=cd.q;if(!r)return true;if(r=='own.p')return ownT(p,'p')>0;const m=r.match(/^(co|so|we|syn\.(\w+))(>=|<=)(\d+)$/);if(!m)return true;
 const v=m[2]?(p.sp&&p.sp[m[2]])||0:G.t[m[1]],n=+m[4];return m[3]=='>='?v>=n:v<=n}
/* a card can be played when its requirement is met, it can be paid for, and every tile it places has a free hex (a ruin card needs a ruin left) */
const canPlay=(p,cd)=>reqOk(p,cd)&&cd.f.every(t=>t[0]!='L'||valid(t[1]).length>0)&&pay(p,cd,0);
const TR0=10; // everyone starts with this terraform rating; only TR gained above it scores victory points
const score=p=>p.tr-TR0+p.vp+cardVP(p)+G.cells.reduce((s,c)=>c.o===p.i?s+(c.t=='s'?nb(c).filter(n=>n.t=='f'||n.t=='w').length:c.t=='c'?nb(c).filter(n=>n.t=='f'||n.t=='w').length:0):s,0);
const over=()=>G.t.co==0&&G.t.so>=14&&G.t.we>=9;
const log=s=>{G.log.unshift(s);G.log.length=Math.min(G.log.length,3)};
/* game-end points printed on cards: VS{syn.science:2} = 1 per 2 Science cards played, VS{f:3} = 1 per 3 Forests owned, VT2 = 1 per 2 tokens on the card */
function cardVP(p){let v=0;for(const id of p.tab)for(const t of CARDS[id].f){let m;
 if(m=t.match(/^VS\{(.+):(\d+)\}$/)){const k=m[1],n=k.startsWith('syn.')?(p.sp[k.slice(4)]||0):ownT(p,k);v+=Math.floor(n/+m[2])}
 else if(m=t.match(/^VT(\d+)$/))v+=Math.floor(((p.tok||{})[id]||0)/+m[1])}return v}
/* the deck: when it runs out, the discard pile (cards not kept from the 5 seen each generation) is shuffled back in */
const deal=()=>{if(!G.deck.length&&G.disc&&G.disc.length){G.deck=shuf(G.disc);G.disc=[];log('The discard pile is shuffled into the deck')}return G.deck.pop()};
const draw=(p,n)=>{const h=p.hand.length;while(n-->0){const c=deal();if(c==null)break;p.hand.push(c)}if(!p.bot&&G&&G.ps[ME]===p)deckAnim(p.hand.length-h)};
/* card actions: A{fc4:Tco} = pay 4 Fusion Cells, lower CO2 by 1. Once per generation */
const aparse=id=>{const t=CARDS[id].f.find(t=>t.startsWith('A{'));if(!t)return null;const[c,g]=t.slice(2,-1).split(':');return{c:c?c.split(','):[],g:g.split(',')}};
const canAct=(p,id)=>{const a=aparse(id);return!!a&&a.c.every(x=>p.res[x.slice(0,2)]>=+x.slice(2))};
function pay(p,cd,go){let n=cost(p,cd);const u={};const use=(r,v)=>{if(n<=0)return;const k=Math.min(p.res[r],Math.ceil(n/v));u[r]=k;n-=k*v};
 for(const k of cd.s){const y=SYN[k];if(y&&y.pay)use(y.pay,y.v)}if(p.c.n[0]=='V'&&cd.s.includes('soil'))use('se',2);
 n=Math.max(0,n);if(p.res.cr<n)return false;if(go){for(const r in u)p.res[r]-=u[r];p.res.cr-=n}return true}
function track(p,t){let m=false;if(t=='co'){if(G.t.co>0){G.t.co--;p.tr++;m=true}}else if(G.t[t]<(t=='so'?14:9)){G.t[t]++;p.tr++;m=true}if(m)fire({k:'track',t},p)}
/* triggers on Active cards: W{play.industry:Gcr2} etc. src = the card that caused it (a card never triggers itself) */
function fire(ev,a,src){for(const q of G.ps){if(!q)continue;for(const id of q.tab){if(id===src)continue;for(const t of CARDS[id].f){if(!t.startsWith('W{'))continue;
 const[w,g]=t.slice(2,-1).split(':'),[k,x]=w.split('.');
 const hit=k=='play'?q===a&&ev.k=='play'&&(x=='E'?ev.cd.y=='E':ev.cd.s.includes(x)):k=='place'?q===a&&ev.k=='place'&&ev.t==x:k=='any'?ev.k=='place'&&ev.t==x:k=='anytrack'?ev.k=='track'&&ev.t==x:false;
 if(hit)run(q,g.split(','),id)}}}}
/* cards that hit a rival: Q steals, X takes resources away, Z takes production away. You choose the rival; bots pick the one with the most */
function rival(p,a,r,n){const rs=G.ps.filter(x=>x&&x!==p);if(!rs.length)return;
 if(p.bot){const t=rs.reduce((b,x)=>(a=='Z'?x.pr[r]:x.res[r])>(a=='Z'?b.pr[r]:b.res[r])?x:b);hitRival(p,a,r,n,t)}else G.pend.push({rv:a,r,n})}
function hitRival(p,a,r,n,t){if(a=='Z')t.pr[r]=Math.max(Math.min(0,t.pr[r]),t.pr[r]-n);else{const k=Math.min(n,t.res[r]);t.res[r]-=k;if(a=='Q')p.res[r]+=k}
 log(`${lname(p)} ${a=='Q'?'stole from':'hit'} ${lname(t)}`)}
function q(p,t){if(p.bot){const c=bpick(p,t);if(c)place(p,c,t)}else G.pend.push(t)}
/* runs effects; id = the card they come from (needed for tokens). Actions, triggers, discounts and game-end points are skipped here */
function run(p,f,id){for(const k of f){const a=k[0],b=k.slice(1);
 if(k.startsWith('tok')){p.tok[id]=(p.tok[id]||0)+ +k.slice(3)}
 else if(a=='P')p.pr[b.slice(0,2)]+=+b.slice(2);
 else if(a=='G'){const m=b.match(/^(\w\w)(-?\d+)(\/t)?$/);p.res[m[1]]+=+m[2]*(m[3]?G.cells.filter(c=>c.t&&c.t!='R'&&c.o===p.i).length:1)}
 else if(a=='T')track(p,b);else if(a=='L')q(p,b);else if(a=='D')draw(p,+b);else if(a=='V'&&/^-?\d+$/.test(b))p.vp+=+b;
 else if(a=='Q'||a=='X'||a=='Z')rival(p,a,b.slice(0,2),+b.slice(2))}}
function place(p,c,t){const k=p.c.n[0];
 if(t=='r'){c.t=null;p.res.sa+=3+(k=='A'?1:0)}
 else{c.t=t;c.o=p.i;
  if(t=='f'){track(p,'co');if(k=='G')p.res.cr++;p.res.se+=2*nb(c).filter(n=>n.t=='w').length}
  if(t=='w'){track(p,'we');if(k=='D')p.pr.bc++}
  if(t=='s'&&k=='C')p.pr.sa++;
  if(t=='p'){p.pr.fc++;if(nb(c).some(n=>n.t=='s'))p.pr.cr++}
  fire({k:'place',t},p)}
 fx(c,t);sfx(t);log(`${lname(p)}: ${LN[t]}`);render()}
function play(p,hi){const id=p.hand[hi],cd=CARDS[id];pay(p,cd,1);p.hand.splice(hi,1);if(cd.y!='E')p.tab.push(id);
 for(const k of cd.s)p.sp[k]=(p.sp[k]||0)+1; // synergy cards played, for requirements and scoring
 log(`${lname(p)} played ${cd.n}`);sfx('card');run(p,cd.f.filter(t=>!/^([AWK]\{|VS|VT)/.test(t)),id);fire({k:'play',cd},p,id)}
function act(p,id){if(p.used.includes(id)||!canAct(p,id))return;const a=aparse(id);for(const x of a.c)p.res[x.slice(0,2)]-=+x.slice(2);p.used.push(id);run(p,a.g,id);sfx('card')}
const STD={
f:{l:'8 Seeds → Forest',ok:p=>p.res.se>=8,go:p=>{p.res.se-=8;q(p,'f')}},
so:{l:'8 Biochar → +1 Soil',ok:p=>p.res.bc>=8&&G.t.so<14,go:p=>{p.res.bc-=8;track(p,'so')}}};

/* ---------- BOTS ---------- */
const W={cr:1.2,sa:.4,re:.7,se:.8,fc:.7,bc:1};
function val(cd){const L=Math.min(7,Math.max(1,13-G.gen));let v=0;
 for(const k of cd.f){const a=k[0],b=k.slice(1),n=parseInt(b.slice(2));
  if(k.startsWith('A{'))v+=L*.9;else if(k.startsWith('W{'))v+=L*.7;else if(k.startsWith('K{'))v+=parseInt(k.split(':')[1])*(k.includes('all')?1.4:.6)*L*.4;
  else if(k.startsWith('VS'))v+=6;else if(k.startsWith('VT'))v+=3;
  else if(a=='P')v+=W[b.slice(0,2)]*n*L*.55;else if(a=='G')v+=W[b.slice(0,2)]*n*(b.endsWith('/t')?5:1)*.8;
  else if(a=='T')v+=(b=='co'?G.t.co>0:b=='so'?G.t.so<14:G.t.we<9)?5:0;else if(a=='L')v+={f:5,w:5,s:4,p:3,c:2.5,r:2}[b];else if(a=='D')v+=+b*1.5;else if(a=='V')v+=+b*3;
  else if(a=='Q'||a=='X'||a=='Z')v+=W[b.slice(0,2)]*n*(a=='Z'?2:.7)+1;else v+=1}
 return v}
/* a bot keeps the best cards it sees: 5 of 10 at the start, 3 of 5 each generation (p.keep says how many) */
const bv=(p,id)=>val(CARDS[id])/(1+cost(p,CARDS[id])/12);
function botDraft(p){keepDraft(p,[...p.draft].sort((a,b)=>bv(p,b)-bv(p,a)).slice(0,p.keep||3))}
function keepDraft(p,keep){p.hand.push(...keep);G.disc.push(...p.draft.filter(x=>!keep.includes(x)));p.draft=null}
function bpick(p,t){let best,bs=-9;for(const c of valid(t)){const n=nb(c);let s=Math.random()*1.5;
 if(t=='s')s+=n.filter(x=>x.t=='f'||x.t=='w').length*2;
 else if(t=='f'||t=='w')s+=n.filter(x=>x.t=='s'&&x.o===p.i).length*2.5+n.filter(x=>x.t=='s').length;
 else if(t=='c')s+=n.filter(x=>x.t=='f').length;else if(t=='r')s+=n.filter(x=>!x.t).length*.3;
 if(s>bs){bs=s;best=c}}return best}
async function botTurn(p){const g=G;if(p.draft&&p.draft.length)botDraft(p);
 for(let n=0;n<6;n++){const o=[];
  p.hand.forEach((id,hi)=>{const cd=CARDS[id];if(canPlay(p,cd))o.push({v:val(cd)/(1+cost(p,cd)/12),go:()=>play(p,hi)})});
  for(const k in STD)if(STD[k].ok(p)&&!(k=='w'&&p.res.cr<30)&&!(k=='r'&&(p.res.sa>1||p.res.cr<12)))o.push({v:{f:2.4,so:2.6,w:1.1,r:.5}[k],go:()=>{STD[k].go(p)}});
  for(const id of p.tab)if(!p.used.includes(id)&&canAct(p,id)){const g=aparse(id).g.join(','),v=/Tco/.test(g)?(G.t.co>0?4:0):/Tso/.test(g)?(G.t.so<14?4:0):g.includes('tok')?2:1.5;if(v)o.push({v,go:()=>act(p,id)})}
  if(!o.length)return;o.sort((a,b)=>b.v-a.v);
  const c=Math.random()<.2&&o[1]?o[1]:o[0];if(c.v<.35)return; // 20% of the time takes 2nd best: beatable
  await sleep(750);if(G!==g)return;c.go();render()}}

/* ---------- GAME FLOW ---------- */
let NB=3;
function mk(i,ci,bot,name){const c=CORPS[ci],p={i,ci,c,bot,name:name||'',tr:TR0,vp:0,hand:[],tab:[],used:[],tok:{},sp:{},draft:null,
 res:{cr:c.cr,sa:0,re:0,se:0,fc:0,bc:0,...c.st},pr:{cr:0,sa:0,re:0,se:0,fc:0,bc:0,...c.pr}};
 p.draft=[];for(let k=0;k<10;k++){const d=deal();if(d!=null)p.draft.push(d)}p.keep=5;if(bot)botDraft(p);return p} // everyone starts by seeing 10 cards and keeping 5
const modal=h=>{const m=$('#modal');m.onclick=null;m.innerHTML=h;m.hidden=false},closeModal=()=>{$('#modal').hidden=true};
const chips=c=>[`<b>${c.cr}</b> Credits`,...Object.entries(c.st||{}).map(([k,v])=>`<b>${v}</b> ${R[k]}`),...Object.entries(c.pr||{}).map(([k,v])=>`<b>+${v}</b> ${R[k]} prod`)].map(x=>`<span>${x}</span>`).join('');
/* names = the people in the game (seats 0,1,...); bots take the seats after them */
function start(nb,code,names){au();LASTCUR=undefined;UNDO=null;names=names&&names.length?names:[myName()];
 G={code,nb,gen:1,t:{co:14,so:0,we:0},pend:[],log:[],cells:[],map:{},ps:[],deck:shuf(CARDS.map((_,k)=>k)),disc:[],over:false,cur:null,ti:0,phase:'pick',
  seats:[...names.map(n=>({name:n,bot:false})),...Array.from({length:nb},()=>({name:'',bot:true}))],pick:0,taken:[],offer:shuf([0,1,2,3,4,5]).slice(0,3)};
 for(let r=-4;r<=4;r++)for(let q=Math.max(-4,-r-4);q<=Math.min(4,-r+4);q++){const c={id:G.cells.length,q,r,x:HCOL*(q+r/2),y:HROW*r,t:null};G.cells.push(c);G.map[q+','+r]=c}
 shuf(G.cells).slice(0,8).forEach(c=>c.t='R');
 buildBoard();document.body.className='picking';pickScreen();share()}
function buildBoard(){
 const P=hpts(HEX);G.cells.forEach(c=>{c.x=HCOL*(c.q+c.r/2);c.y=HROW*c.r});['cells','rises','badges','fx'].forEach(id=>document.getElementById(id).setAttribute('transform',`scale(${BSC})`));
 if(!document.getElementById('ti-blank'))document.querySelector('#bd defs').insertAdjacentHTML('beforeend',`<clipPath id="hexclip"><polygon points="${hpts(HEX)}"/></clipPath><clipPath id="riseclip"><path clip-rule="evenodd" d="M-400 -400H400V400H-400Z M${HEX.map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' L')}Z"/></clipPath>`+Object.keys(TILEDATA).filter(n=>n!='blank').map(n=>`<image id="ti-${n}" href="tile-art/props/${n}.png" x="${(-150.5*HPS).toFixed(2)}" y="${(-138.5*HPS).toFixed(2)}" width="${(300*HPS).toFixed(2)}" height="${(268*HPS).toFixed(2)}"/>`).join(''));
 $('#rises').innerHTML=G.cells.map(c=>`<g id="r${c.id}" transform="translate(${c.x},${c.y})"></g>`).join('');$('#badges').innerHTML=G.cells.map(c=>`<g id="b${c.id}" transform="translate(${c.x},${c.y})"></g>`).join('');
 $('#cells').innerHTML=G.cells.map(c=>`<g id="h${c.id}" class="cell" transform="translate(${c.x},${c.y})" onclick="clk(${c.id})"><title></title><g class="gr">${groundSVG(c.id)}</g><polygon class="hx" points="${P}"/><g class="tl"></g><polygon class="hl" points="${P}" fill="url(#stp)"/><polygon class="hb" points="${P}"/></g>`).join('');
 G.cells.forEach(c=>{delete c.dk;drawCell(c)});BOARD=G.code;$('#lob').hidden=true;$('#set').hidden=true}
/* corporation choice: people choose one after another (seat 0 first), then bots get the corporations that are left */
function pickScreen(){PICKUI=true;
 if(HELPFIRST!==G.code){HELPFIRST=G.code;help(true);return} // first, show How to play once per game
 if(document.querySelector('#modal:not([hidden]) .help.first'))return; // still reading it: don't cover it
 if(G.pick===ME)showPick();
 else modal(`<div class="pickp"><h2>Choose your corporation</h2><p>Waiting for <b>${esc(G.seats[G.pick].name)}</b> to choose a corporation…</p></div>`)}
function showPick(){modal(`<div class="pickp"><h2>Choose your corporation</h2><p>Three charters were offered to you. The other corporations go to your rivals.</p><div class="cards3">${G.offer.map(ci=>{const c=CORPS[ci];return corpCardHTML(c,ci)}).join('')}</div></div>`)}
function choose(ci){if(!G||G.phase!=='pick'||G.pick!==ME||!G.offer.includes(ci))return;
 const s=G.pick,humans=G.seats.filter(x=>!x.bot).length;G.ps[s]=mk(s,ci,false,G.seats[s].name);G.taken.push(ci);G.pick++;
 if(G.pick<humans){G.offer=shuf([0,1,2,3,4,5].filter(i=>!G.taken.includes(i))).slice(0,3);pickScreen();share();return}
 const rest=shuf([0,1,2,3,4,5].filter(i=>!G.taken.includes(i)));
 for(let i=humans;i<G.seats.length;i++)G.ps[i]=mk(i,rest[i-humans],true);
 G.phase='play';G.ti=0;G.cur=order()[0].i;PICKUI=false;
 document.body.className='';closeModal();log('Generation 1 begins');sfx('card');render();runBots()}
function adv(){while(G.pend.length&&typeof G.pend[0]=='string'&&!valid(G.pend[0]).length)G.pend.shift();render()}
function clk(i){if(!myTurn()||G.over||!G.pend.length)return;const c=G.cells[i],t=G.pend[0];if(typeof t!='string'||!valid(t).includes(c))return;G.pend.shift();UNDO=null;place(G.ps[ME],c,t);adv()}
/* a card that hits a rival: you pick which rival */
function uiRival(i){if(!myTurn()||G.over)return;const it=G.pend[0];if(!it||typeof it=='string'||!G.ps[i]||i===ME)return;G.pend.shift();UNDO=null;hitRival(G.ps[ME],it.rv,it.r,it.n,G.ps[i]);adv()}
/* at the start you see 10 cards and keep 5, each generation you see 5 and keep 3; the rest go to the discard pile */
let DSEL=[];
function draftUI(){const p=G.ps[ME];if(!p.draft||!p.draft.length)return;const need=Math.min(p.keep||3,p.draft.length);DSEL=DSEL.filter(x=>p.draft.includes(x));
 modal(`<div class="drf"><h2>Choose ${need} card${need>1?'s':''} to keep</h2><p>${p.draft.length>need?`The other ${p.draft.length-need} go to the discard pile.`:'Click the cards to keep them.'}</p><div class="pcg">${p.draft.map(id=>`<div class="pcw${DSEL.includes(id)?' sel':''}" onclick="drTog(${id})">${cardHTML(CARDS[id],p,{})}</div>`).join('')}</div><button class="pri" ${DSEL.length==need?'':'disabled'} onclick="drKeep()">Keep ${DSEL.length} / ${need}</button></div>`)}
function drTog(id){const p=G.ps[ME];if(!p.draft)return;const need=Math.min(p.keep||3,p.draft.length);if(DSEL.includes(id))DSEL=DSEL.filter(x=>x!==id);else if(DSEL.length<need)DSEL.push(id);draftUI()}
function drKeep(){const p=G.ps[ME];if(!p.draft||!myTurn())return;const need=Math.min(p.keep||3,p.draft.length);if(DSEL.length!=need)return;keepDraft(p,DSEL);DSEL=[];closeModal();deckAnim(need);render()}
function uiPlay(i,el){if(busy())return;const p=G.ps[ME];if(!canPlay(p,CARDS[p.hand[i]]))return sfx('err');UNDO=null;if(el)playAnim(el);play(p,i);adv()}
/* a played card lifts to the middle of the screen and fades out */
function playAnim(el){const card=el.querySelector('.pc');if(!card||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=card.getBoundingClientRect(),c=card.cloneNode(true);
 c.style.cssText+=`;position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:60;pointer-events:none;--r:0deg;--y:0px`;document.body.append(c);
 const dx=innerWidth/2-r.left-r.width/2,dy=innerHeight*.42-r.top-r.height/2;
 c.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(1.25)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy-30}px) scale(1.3)`,opacity:0}],{duration:900,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>c.remove()}
/* right click on your hand: sort by cost → type → time in hand */
const HSORTS=['time in hand','cost','type','custom']; // 'custom' = the order you dragged your hand into
/* YOUR LAYOUT: which of your 4 Active decks each card is in (top card first) and your custom hand order.
   Saved only in this browser (localStorage), never in the shared game G, so other players never see it. */
let LAY=null; // {k: storage key, d: [[card ids] ×4 decks], h: [card ids in your hand order]}
const layKey=()=>`ss_layout_${G.code||'solo'}_${ME}`;
function laySave(){try{localStorage[LAY.k]=JSON.stringify(LAY)}catch(e){}}
function layoutFix(p){const k=layKey(); // keeps the saved layout in step with the real game
 if(!LAY||LAY.k!==k){LAY=null;try{LAY=JSON.parse(localStorage[k]||'null')}catch(e){}
  if(!LAY||!Array.isArray(LAY.d)||LAY.d.length!==4)LAY={d:[[],[],[],[]],h:[]};if(!Array.isArray(LAY.h))LAY.h=[];LAY.k=k}
 const acts=p.tab.filter(id=>CARDS[id].y=='A'),was=JSON.stringify(LAY);
 LAY.d=LAY.d.map(d=>d.filter(id=>acts.includes(id))); // cards no longer yours are dropped
 acts.forEach(id=>{if(!LAY.d.some(d=>d.includes(id)))LAY.d[0].unshift(id)}); // a newly played Active card goes on top of deck 1
 LAY.h=LAY.h.filter(id=>p.hand.includes(id));p.hand.forEach(id=>{if(!LAY.h.includes(id))LAY.h.push(id)}); // new hand cards go last
 if(JSON.stringify(LAY)!==was)laySave()}
function handOrder(p){const ix=p.hand.map((_,i)=>i),ty={B:0,A:1,E:2};
 if(HSORT==3&&LAY)return LAY.h.map(id=>p.hand.indexOf(id)).filter(i=>i>=0);
 if(HSORT==1)ix.sort((a,b)=>CARDS[p.hand[a]].c-CARDS[p.hand[b]].c||a-b);else if(HSORT==2)ix.sort((a,b)=>ty[CARDS[p.hand[a]].y]-ty[CARDS[p.hand[b]].y]||CARDS[p.hand[a]].c-CARDS[p.hand[b]].c||a-b);return ix}
function cycleSort(e){e.preventDefault();HSORT=(HSORT+1)%4;renderUI();const h=$('#hand .hh');if(h)h.textContent=`Sorted by ${HSORTS[HSORT]} · right click to change`}
function uiAct(id){if(busy())return;UNDO=null;act(G.ps[ME],id);render()}
function std(k){if(busy())return;const p=G.ps[ME];if(STD[k].ok(p)){const snap=ser();STD[k].go(p);UNDO=G.pend.length?snap:null;adv()}else sfx('err')}
/* Undo a standard project until its tile is placed */
function undo(){if(!UNDO||!myTurn())return;G=hydrate(UNDO);UNDO=null;G.cells.forEach(drawCell);render()}
/* turn order rotates: generation 1 starts with player 0 (you), generation 2 with the next player, and so on */
const order=()=>{const n=G.ps.length,s=(G.gen-1)%n;return G.ps.map((_,i)=>G.ps[(s+i)%n])};
const pname=p=>p.bot?p.c.n.split(' ')[0]:p.name||myName();
/* name shown in "The returning world": the player's in-game name, same as on the player panels */
const lname=p=>p.bot?(p.name?esc(p.name)+' (bot)':'Bot '+p.i):esc(p.name||myName());
function income(){for(const p of G.ps){const r=p.res;r.bc+=r.fc;r.fc=0;r.cr+=p.tr+p.pr.cr;for(const k of['sa','re','se','fc','bc'])r[k]=Math.max(0,r[k]+p.pr[k]);p.used=[];
  p.draft=[];for(let i=0;i<5;i++){const c=deal();if(c!=null)p.draft.push(c)}p.keep=3;if(p.bot)botDraft(p)}
 G.gen++;log(`Generation ${G.gen} begins`);sfx('gen')}
/* pass the turn to the next player; after the last one, income arrives and a new generation starts. Returns false when the game ends */
function nextSeat(){G.ti++;
 if(G.ti>=G.ps.length){income();if(over()||G.gen>15){G.cur=null;render();fin();return false}G.ti=0;log(`${lname(order()[0])} starts generation ${G.gen}`)}
 G.cur=order()[G.ti].i;return true}
/* holding the seal ends your turn */
async function nextGen(){if(busy())return;if(!nextSeat())return;render();await runBots()}
/* bots are played by the host's browser (in solo: yours) */
async function runBots(){if(RUNNING||!G||G.over||G.phase!=='play'||(NET&&runnerSeat()!==ME))return;const g=G;RUNNING=true;
 try{while(G===g&&!G.over&&G.ps[G.cur].bot){render();await botTurn(G.ps[G.cur]);if(G!==g)return;if(!nextSeat())return;render()}}finally{RUNNING=false}
 if(G===g&&!G.over&&over())fin()}
function fin(){G.over=true;const r=[...G.ps].sort((a,b)=>score(b)-score(a));share();sfx('end');
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
async function mkRoom(){au();if(NET||JOINING)return;JOINING=true;try{netStart(await api('room',{name:myName(),bots:NB,cid:CID}))}catch(e){$('#lm').innerHTML=`<small>${e.status?esc(e.message):NOSRV}</small>`}finally{JOINING=false}}
async function joinRoom(){au();const c=$('#jc').value.trim().toUpperCase();if(!c||JOINING||(NET&&NET.code===c))return;JOINING=true;
 try{netStart(await api('join',{code:c,name:myName(),cid:CID}))}catch(e){$('#lm').innerHTML=`<small>${e.status?esc(e.message):NOSRV}</small>`}finally{JOINING=false}}
/* CID = this browser tab's id, so pressing Join twice can never take two seats */
const CID=(()=>{try{return sessionStorage.ss_cid||(sessionStorage.ss_cid=Math.random().toString(36).slice(2)+Date.now().toString(36))}catch(e){return Math.random().toString(36).slice(2)}})();let JOINING=false;
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
function share(){if(!NET||NET.status!=='playing'||NET.applying||!G)return;const s=ser();if(s===NET.last)return;NET.last=s;LASTMOVE=Date.now();NET.busy++;const n=NET;
 n.q=n.q.then(async()=>{try{n.v=(await api('state',{code:n.code,token:n.token,base:n.v,state:s})).v}catch(e){if(e.status===409)n.v=0}finally{n.busy--}})}
async function poll(){const n=NET;if(!n)return;
 try{const r=await api(`room?code=${n.code}&token=${encodeURIComponent(n.token)}&v=${n.v}`);if(NET!==n)return;
  n.players=r.players;n.bots=r.bots;if(r.status==='open'){lobbyRoom();return}
  if(r.state&&r.v>n.v&&!n.busy){n.v=r.v;n.status='playing';LASTMOVE=Date.now();applyState(r.state)}
  else if(n.status==='playing')idleCheck()}
 catch(e){if(NET===n&&(e.status===404||e.status===403)){lobby();$('#lm').innerHTML='<small>The lobby has closed.</small>';return}}
 finally{if(NET===n)n.timer=setTimeout(poll,900)}}
/* the first person in seat order who is still playing runs the bots; the next one watches the clock */
const IDLE_MS=6*60*1000; // a player who makes no move for this long is replaced by a bot
const runnerSeat=()=>{const h=G.ps.find(p=>p&&!p.bot);return h?h.i:-1};
function idleCheck(){if(!G||G.phase!=='play'||G.over||G.cur==null||RUNNING)return;const cp=G.ps[G.cur];if(!cp||cp.bot||G.cur===ME||Date.now()-LASTMOVE<IDLE_MS)return;
 const w=G.ps.find(p=>p&&!p.bot&&p.i!==G.cur);if(!w||w.i!==ME)return;
 cp.bot=true;G.pend=[];UNDO=null;log(`${esc(cp.name||'A player')} was away · a bot took over`);render();runBots()}
/* the idle player's own browser shows a countdown for the last minute; it uses its own LASTMOVE clock, which resets at about the same time as the watcher's */
const IDLE_WARN_MS=60*1000; // show the warning when this much time is left
function idleWarn(){let el=$('#idlew');
 const me=G&&G.ps[ME],show=NET&&NET.status==='playing'&&G&&G.phase==='play'&&!G.over&&G.cur===ME&&me&&!me.bot&&G.ps.some(p=>p&&!p.bot&&p.i!==ME),
  left=IDLE_MS-(Date.now()-LASTMOVE);
 if(!show||left>IDLE_WARN_MS){if(el)el.hidden=true;return}
 if(!el){el=document.createElement('div');el.id='idlew';document.body.appendChild(el)}
 const s=Math.ceil(left/1000);
 el.textContent=s>0?`You've been idle · a bot takes over your turn in ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}. Make a move to stay in.`:`You've been idle · a bot is taking over your turn any moment now.`;
 el.hidden=false}
setInterval(idleWarn,500);
function applyState(t){const was=G;NET.applying=true;
 try{G=hydrate(t);if(BOARD!==G.code){au();buildBoard()}else G.cells.forEach(drawCell);NET.last=ser();
  if(G.phase==='pick'){document.body.className='picking';pickScreen();return}
  if(PICKUI){PICKUI=false;closeModal()}document.body.className='';render();
  if(G.over){if(!was||!was.over)fin();return}}
 finally{if(NET)NET.applying=false}
 runBots()}
function setp(){const s=$('#set');s.hidden=!s.hidden;fillSet()}
function fillSet(){$('#set').innerHTML=`<b>Settings</b><label>Music volume <span id="vl">${Math.round(vol*100)}%</span><input type="range" min="0" max="100" value="${Math.round(vol*100)}" oninput="setVol(this.value)"></label><button onclick="help()">How to play</button><button onclick="cardsPage()">Cards</button>${G?`<button onclick="lobby()">Leave to lobby</button><small>Lobby code: ${G.code}</small>`:''}`}
function help(first){$('#set').hidden=true; // first = shown before choosing a corporation
 const I={co:`<span class="il">${tIcon('co')}</span>`,so:`<span class="il">${tIcon('so')}</span>`,we:`<span class="il">${tIcon('we')}</span>`},
 hx=n=>TILEDATA[n]?`<svg class="hxi" viewBox="-34 -32 68 61"><use href="#ti-${n}"/></svg>`:'',
 rc=k=>`<span style="--c:${RCOL[k]}">${resIcon(k)}</span>`,
 row=(ic,t,x,c)=>`<div class="hrw${c?'':' nv'}"><div class="hic">${ic}</div><div><b>${t}</b><span class="ht">${x}</span></div>${c?`<em class="vpc">${c}</em>`:''}</div>`,
 cell=(ic,t,x)=>`<div class="hcl"><div class="hic">${ic}</div><b>${t}</b><span class="ht">${x}</span></div>`,
 step=(n,t,x)=>`<div class="hstp"><i>${n}</i><div><b>${t}</b><span class="ht">${x}</span></div></div>`,
 sec=(t,b,n)=>`<section class="hs"><h3>${t}</h3>${n?`<p class="hn">${n}</p>`:''}${b}</section>`,
 ty=(c,n,x)=>`<span class="hty" style="--t:${c}"><b>${n}</b> ${x}</span>`;
 const goal=sec('The goal',`<div class="hgl"><div class="hg">${tIcon('co')}<b>14 → 0</b><small>CO₂ (tonnes)</small></div><div class="hg">${tIcon('so')}<b>0 → 14%</b><small>Soil</small></div><div class="hg">${tIcon('we')}<b>0 → 9</b><small>Wetlands</small></div></div>`,'Heal the world. Each track step is <b>+1</b> {VP}. The game ends when all three are full or generation 15 ends. <b>Highest score wins.</b>'),
 path=sec('Path to victory',
  step(1,'Build your engine','Play cheap Build cards that add production, the boxed numbers. Income = 10 Credits, +1 for each track step you have made, + Credit production.')
 +step(2,'Turn income into progress','Spend Seeds on Forests, Biochar on Soil, Credits on Wetlands. Each track step is +1 {VP}.')
 +step(3,'Claim the board','Settle beside Forests and Wetlands, and put Wildlife Corridors by Forests. These tiles score as the world greens.')
 +step(4,'Finish ahead','Full tracks end the game. Close it out while you lead, before generation 15 ends.')),
 loop=sec('Each generation',
  step(1,'Act','Play cards, use card Actions and standard projects, in any order. When a tile is due, click a glowing hex.')
 +step(2,'Hold <span class="hnx">Next generation</span>','Your rivals take their turns.')
 +step(3,'Income arrives','Credits = 10, +1 for each track step you have made, + Credit production. Other resources arrive as produced. Fusion Cells turn into Biochar. You see 5 cards and keep 3.')),
 vp=sec('Every way to score {VP}',
  row(I.co,'Track steps',`Every step you move ${I.co}${I.so}${I.we}`,'1 {VP} per step')
 +row(`{VPL:2}`,'Cards with {VP}','A card showing {VP:3} adds 3 once played.','as shown')
 +row(hx('settlement'),'Settlements','Scores for every Forest or Wetland touching it.','1 per neighbour')
 +row(hx('corridor'),'Wildlife Corridors','Score for every Forest or Wetland touching one you own.','1 per neighbour'),'Your score is the sum of these four:'),
 tiles=sec('Tiles',
  row(hx('forest'),'Forest',`${I.co} −1 and +1 {VP}. Forest tile gives 2 ${rc('se')} when placed next to a Wetland.`)
 +row(hx('wetland'),'Wetland',`${I.we} +1 and +1 {VP}.`)
 +row(hx('power'),'Fusion Plant',`${efR('+',1,'fc',1)} a production boost. Next to a Settlement: +1 ${rc('cr')} production too.`)
 +row(hx('settlement'),'Settlement','Gives 1 {VP} for every adjacent Forest or Wetland. Can\'t be placed next to another Settlement.')
 +row(hx('corridor'),'Wildlife Corridor','Gives 1 {VP} for every adjacent Forest or Wetland. Must touch a Forest if a free hex beside one exists.')
 +row(hx('ruin'),'Ruin',`Blocks its hex. Clear it for +3 ${rc('sa')}, then build there.`)),
 res=sec('Resources',
  row(rc('cr'),'Credits','Pay for cards and projects.')
 +row(rc('sa'),'Salvage','Pays 2 each toward Industry cards.')
 +row(rc('re'),'Rare mineral','Pays 3 each toward Engine cards.')
 +row(rc('se'),'Seeds','8 grow a Forest.')
 +row(rc('fc'),'Fusion Cells','Become Biochar when the generation ends.')
 +row(rc('bc'),'Biochar','8 raise Soil by 1.'),'Your corporation bends one rule: hover its panel.'),
 card=sec('Reading a card',
  `<div class="hlg">${cell('<span class="hix">12</span>','Cost','In Credits. Matching resources can pay part.')}${cell(efR('+',2,'cr',1),'Boxed','Production: arrives every generation.')}${cell(`<span style="--c:${RCOL.sa}">${efR('+',3,'sa',0)}</span>`,'Plain','A gain: arrives when you play the card.')}${cell(`<span class="ef"><span class="n">−</span>${tIcon('co')}</span><span class="ef"><span class="n">+</span>${tIcon('so')}</span><span class="ef"><span class="n">+</span>${tIcon('we')}</span>`,'Track step','Moves a track one step: +1 {VP}.')}${cell(`<span class="ef"><span class="n">+2</span>${CARDIC}</span>`,'Draw','Take cards from your deck.')}${cell(`{VPL:2}`,'Victory points','Counted at the end.')}</div>`
 +`<div class="hcl wide"><div class="hic"><span class="ef"><span class="tx">Action</span><span class="n">2</span>${rc('bc')}<span class="tx">→</span><span class="n">+</span>${tIcon('so')}</span></div><b>Action</b><span class="ht">Active cards only. Once per generation, pay the left side to get the right side.</span></div>`
 +`<div class="htys">${ty('#E8871E','Event','played once')}${ty('#4CBB17','Build','stays in play')}${ty('#0047AB','Active','an Action each generation')}</div>`),
 std=sec('Standard projects',`<div class="hsp">${Object.values(STD).map(s=>`<span class="pl">${stdLabel(s.l)}</span>`).join('')}</div>`,'In the resource bar, under Seeds and Biochar. Both move a track (+1 {VP}).');
 modal(`<div class="help${first?' first':''}"><div class="hph"><h2>How to play</h2><p>Second Spring: bring a wrecked world back to life, and finish with the most points.</p><button class="pri" onclick="${first?'helpDone()':'closeModal()'}">Got it</button></div><div class="hpb"><div class="hpc">${goal}${path}${std}</div><div class="hpc">${loop}${vp}</div><div class="hpc">${res}${tiles}</div><div class="hpc">${card}</div></div></div>`.replace(/\{VP(L)?(?::(\w+))?\}/g,(m,l,n)=>`<span class="hvp${l?' lg':''}" title="Victory points">${WREATH}${n?`<span class="hvn">${n}</span>`:''}</span>`));if(!first)dismiss()}
function helpDone(){closeModal();if(G&&G.phase==='pick')pickScreen()}
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
/* ---------- BOARD GEOMETRY: a seamless honeycomb. Ground is drawn in code (clay texture tile-art/clay.jpg, clipped to an exact hexagon);
   the trees, ponds, buildings and ruins are separate pictures in tile-art/props/ drawn on top. ---------- */
const HCOL=53.7,HTOP=HCOL/Math.sqrt(3)*.716,HSIDE=HTOP/2,HROW=1.5*HTOP,HWALL=5,HPS=HCOL/(195*.97),BSC=.8; // column step, half hex height, row step, side wall, prop scale, board scale
const HEX=[[0,-HTOP],[HCOL/2,-HSIDE],[HCOL/2,HSIDE],[0,HTOP],[-HCOL/2,HSIDE],[-HCOL/2,-HSIDE]],hpts=a=>a.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
const hrnd=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x)};
function groundSVG(i){const H=HEX,W=HWALL;let s=`<polygon points="${hpts([H[2],H[3],[0,HTOP+W],[HCOL/2,HSIDE+W]])}" fill="#24615a"/><polygon points="${hpts([H[3],H[4],[-HCOL/2,HSIDE+W],[0,HTOP+W]])}" fill="#2f7a72"/>`;
 const tw=88,th=56,ox=-tw/2+(hrnd(i,1)-.5)*20,oy=-th/2+(hrnd(i,2)-.5)*8;
 s+=`<g clip-path="url(#hexclip)"><image href="tile-art/clay.jpg" x="${ox.toFixed(1)}" y="${oy.toFixed(1)}" width="${tw}" height="${th}" preserveAspectRatio="none"${hrnd(i,3)>.5?' transform="scale(-1,1)"':''}/>`;
 [.10,.07,-.02,-.08,-.05,.04].forEach((l,k)=>{s+=`<polygon points="${hpts([[0,0],H[k],H[(k+1)%6]])}" fill="${l>0?'#fff':'#000'}" fill-opacity="${Math.abs(l)}"/>`});s+='</g>';
 for(let k=0;k<3;k++){const x=(hrnd(i,k+20)-.5)*30,y=(hrnd(i,k+30)-.5)*16,r=1+hrnd(i,k+40)*1.6;s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(2)}" ry="${(r*.6).toFixed(2)}" fill="#8f8f8c"/><ellipse cx="${(x-.3).toFixed(1)}" cy="${(y-.3).toFixed(1)}" rx="${(r*.6).toFixed(2)}" ry="${(r*.35).toFixed(2)}" fill="#b3b3ae"/>`}
 return s+`<polygon points="${hpts(HEX)}" fill="none" stroke="#3a2a1c" stroke-opacity=".45" stroke-width=".7" stroke-linejoin="round"/><polygon points="${hpts(HEX.map(([x,y])=>[x*.965,y*.965]))}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".4" stroke-linejoin="round"/>`}
const TG={x:-33.85,y:-31.7,w:67.69,h:60.47},TNAME={'':'blank',f:'forest',R:'ruin',p:'power',c:'corridor',w:'wetland',s:'settlement'};
const tileImg=t=>TILEDATA[TNAME[t]]?`<use href="#ti-${TNAME[t]}"/>`:`<image class="ti" href="tiles/${TNAME[t]}.png" x="${TG.x}" y="${TG.y}" width="${TG.w}" height="${TG.h}" onerror="tileFail(this,'${t}')"/>`;
const tileOver=t=>(t=='w'||t=='s')?tileImg(t):tileImg(t);
function tileFail(el,t){console.warn('Tile image not found:',el.getAttribute('href'));if(/blank\.png/.test(el.getAttribute('href'))){el.remove();window.NOTILES=1;document.querySelectorAll('.cell').forEach(g=>g.classList.add('noimg'));return}el.setAttribute('href','tiles/blank.png');if(t&&ART[t]){const g=document.createElementNS(NS,'g');g.setAttribute('transform','translate(0,-3)');g.innerHTML=ART[t];el.after(g)}}
function checkImages(){['tiles/blank','tiles/forest','tiles/power','tiles/corridor','tiles/ruin','ui/gear','ui/logo','ui/logo-icon','ui/generation','ui/pip-on','ui/pip-off','ui/pip-now'].forEach(n=>{const i=new Image();i.onload=()=>console.log('OK     ',n+'.png',i.width+'x'+i.height);i.onerror=()=>console.error('MISSING',n+'.png','(looked for',new URL(n+'.png',location.href).href+')');i.src=n+'.png?'+Date.now()})}
function drawCell(c){const k=(c.t||'')+(c.o??'');if(c.dk===k)return;const first=c.dk===undefined;c.dk=k;
 const g=document.getElementById('h'+c.id);g.querySelector('.hx').setAttribute('class','hx '+(c.t||''));
 const who=c.o!=null&&G.ps[c.o]?` · ${G.ps[c.o].c.n}`:'';
 g.classList.toggle('noimg',!!window.NOTILES);g.querySelector('title').textContent=c.t?LN[c.t]+who:'';
 /* a placed tile is drawn in two parts: its surface inside the hexagon (with the grid line on top), and the parts that rise above it
    (trees, reeds, ruin walls) in a layer above every tile, so no grid line or neighbouring tile ever cuts through them */
 const pc=first?'':' class="popf"',u=c.t?`<use href="#ti-${TNAME[c.t]}"`:'';
 g.querySelector('.tl').innerHTML=c.t?`<g${pc}>${u} clip-path="url(#hexclip)"/></g><polygon points="${hpts(HEX)}" fill="none" stroke="#3a2a1c" stroke-opacity=".45" stroke-width=".7" stroke-linejoin="round"/>`:'';
 const rz=document.getElementById('r'+c.id),bz=document.getElementById('b'+c.id);
 if(rz)rz.innerHTML=c.t?`<g${pc}>${u} clip-path="url(#riseclip)"/></g>`:'';if(bz)bz.innerHTML=c.o!=null?badge(c.o):''}
/* best places: a Forest next to a Wetland or your own Wildlife Corridor; a Corridor touching a Wetland or 2+ Forests. If there are none, every legal place glows */
function best(t,v){const n=c=>nb(c),f=t=='f'?v.filter(c=>n(c).some(x=>x.t=='w'||(x.t=='c'&&x.o===ME))):t=='c'?v.filter(c=>n(c).filter(x=>x.t=='f'||x.t=='w').length>=2):v;return f.length?f:v}
function mark(){const v=typeof G.pend[0]=='string'&&myTurn()?valid(G.pend[0]):[],bv=v.length?best(G.pend[0],v):[];G.cells.forEach(c=>{const e=document.getElementById('h'+c.id);e.classList.toggle('ok',bv.includes(c));e.classList.toggle('ok2',v.includes(c)&&!bv.includes(c))})}
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
/* icon=true uses the logo without its name text (corps/<name>-icon.png) */
function mono(c,icon){const s=slug(c.n)+(icon?'-icon':''),k=CIMG[s];
 return`<span class="mono${k===1?' img':''}${icon?' ico':''}" style="--h:${c.h}"><span>${c.n[0]}</span>${k===0?'':`<img src="corps/${s}.png" alt="" onload="CIMG['${s}']=1;this.parentNode.classList.add('img')" onerror="CIMG['${s}']=0;this.remove()">`}</span>`}
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
const synIc=k=>`<img class="syi" src="ui/syn/${k}.svg" alt="${SYN[k]?SYN[k].n:k}" title="${SYN[k]?SYN[k].n:k}">`;
const tileIc=t=>`<span class="tl"><img src="tile-art/${TFILE[t]}.png" alt="${LN[t]}" title="${LN[t]}"></span>`;
const TKN='<span class="tkn" title="Token on this card"></span>';
/* one effect as card symbols */
function fx1(t){const a=t[0],b=t.slice(1);let m;
 if(t.startsWith('tok'))return`<span class="ef"><span class="n">+${t.slice(3)}</span>${TKN}</span>`;
 if(a=='P'){const n=b.slice(2);return efR(n>0?'+':'',n,b.slice(0,2),1)}
 if(a=='G'){m=b.match(/^(\w\w)(-?\d+)(\/t)?$/);return m[3]?`<span class="ef"><span class="n">+${m[2]}</span>${resIcon(m[1])}<span class="tx">per tile you own</span></span>`:efR('+',m[2],m[1],0)}
 if(a=='T')return`<span class="ef"><span class="n">${b=='co'?'−':'+'}</span>${tIcon(b)}</span>`;
 if(a=='L')return`<span class="ef">${tileIc(b)}<span class="tx">${(b=='r'?'':'Place ')+LN[b]}</span></span>`;
 if(a=='D')return`<span class="ef"><span class="n">+${b}</span>${CARDIC}</span>`;
 if(a=='V'&&/^-?\d+$/.test(b))return`<span class="ef"><span class="n">${b}</span><span class="tx">VP</span></span>`;
 if(a=='Q'||a=='X')return`<span class="ef"><span class="tx">${a=='Q'?'Steal from a rival':'A rival loses'}</span><span class="n">${b.slice(2)}</span>${resIcon(b.slice(0,2))}</span>`;
 if(a=='Z')return`<span class="ef"><span class="tx">A rival loses</span><span class="n">−${b.slice(2)}</span><span class="pb" style="--c:${RCOL[b.slice(0,2)]}">${resIcon(b.slice(0,2))}</span></span>`;
 if(t.startsWith('A{')){const[c,g]=t.slice(2,-1).split(':');return`<span class="ef"><span class="tx">Action</span>${c?c.split(',').map(x=>`<span class="n">${x.slice(2)}</span>${resIcon(x.slice(0,2))}`).join(''):''}<span class="tx">→</span>${g.split(',').map(fx1).join('')}</span>`}
 if(t.startsWith('W{')){const[w,g]=t.slice(2,-1).split(':'),[k,x]=w.split('.');
  const l=k=='play'?(x=='E'?'<span class="tx">When you play an Event</span>':`<span class="tx">When you play</span>${synIc(x)}`):k=='place'?`<span class="tx">When you place</span>${tileIc(x)}`:k=='any'?`<span class="tx">When anyone places</span>${tileIc(x)}`:`<span class="tx">When anyone ${x=='co'?'lowers':'raises'}</span>${tIcon(x)}`;
  return`<span class="ef">${l}<span class="tx">:</span>${g.split(',').map(fx1).join('')}</span>`}
 if(m=t.match(/^K\{(\w+):(\d+)\}$/))return`<span class="ef">${m[1]=='all'?'<span class="tx">All your cards</span>':`${synIc(m[1])}<span class="tx">cards</span>`}<span class="tx">cost</span><span class="n">−${m[2]}</span></span>`;
 if(m=t.match(/^VS\{(.+):(\d+)\}$/))return`<span class="ef"><span class="tx">Game end</span><span class="n">1</span><span class="tx">VP per</span><span class="n">${m[2]}</span>${m[1].startsWith('syn.')?synIc(m[1].slice(4))+'<span class="tx">played</span>':tileIc(m[1])}</span>`;
 if(m=t.match(/^VT(\d+)$/))return`<span class="ef"><span class="tx">Game end</span><span class="n">1</span><span class="tx">VP per</span>${m[1]>1?`<span class="n">${m[1]}</span>`:''}${TKN}</span>`;
 return''}
function fxHTML(cd){return cd.f.map(fx1).join('')}
/* requirement shown on the card picture; red when you don't meet it */
function reqHTML(cd){const r=cd.q;if(!r)return'';if(r=='own.p')return`<span class="tx">Own a</span>${tileIc('p')}`;const m=r.match(/^(co|so|we|syn\.(\w+))(>=|<=)(\d+)$/);if(!m)return'';
 if(m[2])return`<span class="n">${m[4]}</span>${synIc(m[2])}<span class="tx">played</span>`;return`${tIcon(m[1])}<span class="tx">${m[3]=='>='?'min':'max'}</span><span class="n">${m[4]}${m[1]=='so'?'%':''}</span>`}
function reqTxt(cd){const r=cd.q;if(!r)return'';if(r=='own.p')return'Requires: you own a Fusion Plant';const m=r.match(/^(co|so|we|syn\.(\w+))(>=|<=)(\d+)$/);if(!m)return'';
 if(m[2])return`Requires: ${m[4]} ${SYN[m[2]].n} cards played`;const nm={co:'CO₂',so:'Soil',we:'Wetlands'}[m[1]];return`Requires: ${nm} ${m[4]}${m[1]=='so'?'%':''} or ${m[3]=='>='?'more':'less'}`}
/* card design: spine (type + tags), framed arch photo, name plaque, effect panel, description, wreath for VP */
const WREATH='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M21.77 39.84 L20.49 39.61 L19.23 39.27 L18.01 38.83 L16.82 38.30 L15.68 37.67 L14.60 36.94 L13.57 36.14 L12.62 35.25 L11.74 34.28 L10.95 33.25 L10.24 32.16 L9.62 31.01 L9.10 29.82 L8.67 28.59 L8.35 27.33 L8.13 26.04 L8.02 24.74 L8.01 23.44 L8.11 22.14 L8.31 20.86 L8.62 19.59 L9.03 18.35 L9.54 17.15 L10.14 16.00 L10.84 14.90 L11.62 13.86 L12.49 12.89 L13.43 11.99 L14.45 11.17 L15.52 10.43" fill="none" stroke="#2b2300" stroke-width="1.4" stroke-linecap="round"/><path d="M26.23 39.84 L27.51 39.61 L28.77 39.27 L29.99 38.83 L31.18 38.30 L32.32 37.67 L33.40 36.94 L34.43 36.14 L35.38 35.25 L36.26 34.28 L37.05 33.25 L37.76 32.16 L38.38 31.01 L38.90 29.82 L39.33 28.59 L39.65 27.33 L39.87 26.04 L39.98 24.74 L39.99 23.44 L39.89 22.14 L39.69 20.86 L39.38 19.59 L38.97 18.35 L38.46 17.15 L37.86 16.00 L37.16 14.90 L36.38 13.86 L35.51 12.89 L34.57 11.99 L33.55 11.17 L32.48 10.43" fill="none" stroke="#2b2300" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="21.22" cy="39.76" rx="4.4" ry="2.2" transform="rotate(162.0 21.22 39.76)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="26.78" cy="39.76" rx="4.4" ry="2.2" transform="rotate(-162.0 26.78 39.76)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="15.40" cy="37.49" rx="4.4" ry="2.2" transform="rotate(184.5 15.40 37.49)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="32.60" cy="37.49" rx="4.4" ry="2.2" transform="rotate(-184.5 32.60 37.49)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="10.89" cy="33.18" rx="4.4" ry="2.2" transform="rotate(207.0 10.89 33.18)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="37.11" cy="33.18" rx="4.4" ry="2.2" transform="rotate(-207.0 37.11 33.18)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="8.38" cy="27.46" rx="4.4" ry="2.2" transform="rotate(229.5 8.38 27.46)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="39.62" cy="27.46" rx="4.4" ry="2.2" transform="rotate(-229.5 39.62 27.46)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="8.24" cy="21.22" rx="4.4" ry="2.2" transform="rotate(252.0 8.24 21.22)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="39.76" cy="21.22" rx="4.4" ry="2.2" transform="rotate(-252.0 39.76 21.22)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="10.51" cy="15.40" rx="4.4" ry="2.2" transform="rotate(274.5 10.51 15.40)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="37.49" cy="15.40" rx="4.4" ry="2.2" transform="rotate(-274.5 37.49 15.40)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="14.82" cy="10.89" rx="4.4" ry="2.2" transform="rotate(297.0 14.82 10.89)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><ellipse cx="33.18" cy="10.89" rx="4.4" ry="2.2" transform="rotate(-297.0 33.18 10.89)" fill="#D9AE2A" stroke="#2b2300" stroke-width=".7"/><circle cx="24" cy="24" r="10.6" fill="#2f3d36" stroke="#2b2300" stroke-width="1.4"/><circle cx="24" cy="24" r="8.6" fill="none" stroke="#E0A81C" stroke-width=".8"/></svg>';
const synHTML=cd=>cd.s.length?`<span class="ctr">${cd.s.filter(k=>SYN[k]).map(k=>{const y=SYN[k];return`<img src="ui/syn/${k}.svg" alt="${y.n}" title="${y.n}${y.pay?` · 1 ${R[y.pay]} pays ${y.v} Cr toward this card`:''}">`}).join('')}</span>`:'';
/* CARD BACKGROUNDS: each card shows its own spot from one of the scene pictures (ui/card-bg-1.jpg ...), picked from its name so a card always looks the same.
   To add or swap scenes: put the pictures in ui/ and list them here. */
const CARD_SCENES=['ui/card-bg-1.jpg','ui/card-bg-2.jpg','ui/card-bg-3.jpg'];
function cardBg(n){let h=7;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;return`--cbg:url(${CARD_SCENES[h%CARD_SCENES.length]});--cbx:${(h>>3)%101}%;--cby:${(h>>11)%101}%;`}
function cardHTML(cd,p,o={}){const c=cost(p,cd),s=slug(cd.n),v=cd.f.find(t=>/^V-?\d+$/.test(t)),vp=v?v.slice(1):'',rq=cd.q?`<em class="crq${G&&p.tab&&!reqOk(p,cd)?' bad':''}" title="${reqTxt(cd)}">${reqHTML(cd)}</em>`:'';
 const cx=cd.f.reduce((n,t)=>n+(/^V-?\d+$/.test(t)?0:/^([AWK]\{|VS|VT|[QXZ])/.test(t)?3:1),0); // long effect text gets smaller type so it fits
 return`<div class="pc ${cd.y}${vp?' hv':''}${cx>=6?' lf2':cx>=4?' lf':''}${o.no?' no':''}${o.used?' used':''}" style="${cardBg(cd.n)}${o.st||''}"><span class="ix">${c}</span>${synHTML(cd)}<div class="csp"><div class="cty"><b>${{E:'Event',B:'Build',A:'Active'}[cd.y]}</b></div></div><div class="ccl"><div class="art"><div class="cai">${IMGX[s]?'':`<img src="cards/${s}.png" alt="" onerror="IMGX['${s}']=1;this.remove()">`}</div>${rq}${o.tok?`<em class="ctk" title="Tokens on this card">${TKN}<b>${o.tok}</b></em>`:''}${o.need?'<em class="cnc">Need Credits</em>':''}</div><div class="cpl"><h4>${cd.n}</h4></div><div class="fx">${fxHTML({...cd,f:cd.f.filter(t=>!/^V-?\d+$/.test(t))})}</div><div class="cbt"><p class="cds">${esc(cd.fl||'')}</p>${vp?`<span class="cwv">${WREATH}<b>${vp}</b></span>`:''}</div></div></div>`}
const cardsGrid=(p,ids=p.tab)=>ids.length?`<div class="pcg">${ids.map(id=>`<div class="pcw">${cardHTML(CARDS[id],p,{used:p.used.includes(id),tok:(p.tok||{})[id]})}</div>`).join('')}</div>`:'<div class="none">No cards played yet.</div>';
function dismiss(){$('#modal').onclick=e=>{if(e.target.id=='modal')closeModal()}}
/* filter bar for the played-cards views (player profile, your played cards). It looks like the Cards page bar,
   but keeps its own filters in PF, so the Cards page filters (CF) are not changed. PFV redraws the view that is open. */
let PF={s:new Set(),y:new Set()},PFV=null;
const PF_TY={B:'Build',A:'Active',E:'Event'},PF_TC={B:'#4CBB17',A:'#0047AB',E:'#FF5F1F'};
const pfShown=ids=>ids.filter(id=>{const cd=CARDS[id];return(!PF.y.size||PF.y.has(cd.y))&&[...PF.s].every(k=>cd.s.includes(k))});
function pfBar(ids){if(!ids.length)return'';const sy=Object.keys(SYN).filter(k=>ids.some(id=>CARDS[id].s.includes(k))); // only symbols on this player's cards
 return`<div class="cpf">${sy.length?`<div class="cpr">${sy.map(k=>`<button class="cpb${PF.s.has(k)?' on':''}" title="${SYN[k].n}" onclick="pfTog('s','${k}')"><img src="ui/syn/${k}.svg" alt=""><span>${SYN[k].n}</span></button>`).join('')}</div>`:''}
 <div class="cpr">${Object.keys(PF_TY).map(k=>`<button class="cpb ty${PF.y.has(k)?' on':''}" style="--tc:${PF_TC[k]}" onclick="pfTog('y','${k}')"><i></i><span>${PF_TY[k]}</span></button>`).join('')}${PF.s.size||PF.y.size?'<button class="cpb clr" onclick="pfTog()">Clear filters</button>':''}</div></div>`}
const pfGrid=(p,ids)=>{const sh=pfShown(ids);return ids.length&&!sh.length?'<div class="none">No card has all of these.</div>':cardsGrid(p,sh)};
function pfTog(g,k){if(g)PF[g].has(k)?PF[g].delete(k):PF[g].add(k);else PF={s:new Set(),y:new Set()};
 const sc=document.querySelector('.pv')?.scrollTop;if(PFV)PFV();const e=document.querySelector('.pv');if(e&&sc)e.scrollTop=sc}
function showPlayed(keep){if(!G||!G.ps.length)return;if(!keep)PF={s:new Set(),y:new Set()};PFV=()=>showPlayed(1);const p=G.ps[ME],ids=p.tab.filter(id=>CARDS[id].y!='A');modal(`<div class="pv" style="--c:${PC[ME]}"><div class="pvh"><div><h2>Your played cards</h2><small>${ids.length} cards</small></div><button style="margin-left:auto" onclick="closeModal()">Close</button></div>${pfBar(ids)}${pfGrid(p,ids)}</div>`);dismiss()}
/* ---------- CARDS PAGE (Settings → Cards): every card in the game, with filter buttons for synergies and card types ---------- */
let CF={s:new Set(),y:new Set()};
function cardsPage(){$('#set').hidden=true;const P0={c:{n:''}},TY={B:'Build',A:'Active',E:'Event'},TC={B:'#4CBB17',A:'#0047AB',E:'#FF5F1F'};
 const list=CARDS.filter(cd=>(!CF.y.size||CF.y.has(cd.y))&&[...CF.s].every(k=>cd.s.includes(k)));
 modal(`<div class="cpg"><div class="cph"><h2>Cards <small>${list.length} of ${CARDS.length}</small></h2><button onclick="closeModal()">Close</button></div>
 <div class="cpf"><div class="cpr">${Object.keys(SYN).map(k=>`<button class="cpb${CF.s.has(k)?' on':''}" title="${SYN[k].n}" onclick="cfTog('s','${k}')"><img src="ui/syn/${k}.svg" alt=""><span>${SYN[k].n}</span></button>`).join('')}</div>
 <div class="cpr">${Object.keys(TY).map(k=>`<button class="cpb ty${CF.y.has(k)?' on':''}" style="--tc:${TC[k]}" onclick="cfTog('y','${k}')"><i></i><span>${TY[k]}</span></button>`).join('')}${CF.s.size||CF.y.size?'<button class="cpb clr" onclick="CF={s:new Set(),y:new Set()};cardsPage()">Clear filters</button>':''}</div></div>
 <div class="pcg">${list.length?list.map(cd=>`<div class="pcw">${cardHTML(cd,P0)}</div>`).join(''):'<div class="none">No card has all of these.</div>'}</div></div>`);dismiss()}
function cfTog(g,k){CF[g].has(k)?CF[g].delete(k):CF[g].add(k);const sc=document.querySelector('.cpg')?.scrollTop;cardsPage();const e=document.querySelector('.cpg');if(e&&sc)e.scrollTop=sc}
function viewPlayer(i,keep){if(!G||!G.ps[i])return;const p=G.ps[i];if(!keep)PF={s:new Set(),y:new Set()};PFV=()=>viewPlayer(i,1);
 modal(`<div class="pv" style="--c:${PC[p.i]}"><div class="pvh">${mono(p.c)}<div><h2>${p.c.n}</h2><small>${p.bot?'Bot':esc(p.name||myName())} · ${p.c.t} · TR ${p.tr}</small></div>${symHTML(p.i,26)}<span class="vp cvp" title="Victory points">${WREATH}<b>${score(p)}</b></span><button onclick="closeModal()">Close</button></div><div class="pvtop"><div class="pvcorp">${corpCardHTML(p.c,p.ci,true)}</div><div class="pvr">${Object.keys(R).map(k=>`<div class="r" style="--c:${RCOL[k]}">${resIcon(k)}<span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i></div>`).join('')}</div></div><h3>Cards in play · ${p.tab.length}</h3>${pfBar(p.tab)}${pfGrid(p,p.tab)}</div>`);dismiss()}
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
 const cs=$('#corps');if(cs.querySelectorAll(':scope>.co').length!=G.ps.length)cs.innerHTML=G.ps.map(()=>'<div class="co"><span class="coin"></span></div>').join('')+'<div id="mycorp" title="Your corporation"></div>';
 const mc=$('#mycorp');if(mc&&mc.dataset.ci!=String(p.ci)){mc.dataset.ci=p.ci;mc.innerHTML=corpCardHTML(p.c,p.ci,true)}
 requestAnimationFrame(fitCorp);setTimeout(fitCorp,400);
 const st=G.over?null:order()[0].i; // who starts this generation: they get the first player seal
 G.ps.forEach((x,i)=>{const e=cs.children[i],on=!G.over&&G.cur===x.i;
  e.className=`co${x.i===ME?' me':''}${G.cur===x.i?' act':''}${on?' out':''}`;e.style.cssText=`--c:${PC[x.i]};--h:${x.c.h}`;e.title=x.c.d;e.onclick=()=>viewPlayer(x.i);
  e.firstElementChild.innerHTML=`${mono(x.c,1)}<span class="nm"><b>${x.bot?(x.name?esc(x.name)+' (bot)':'Bot '+x.i):esc(x.name||myName())}</b>${x.i!==ME&&G.cur===x.i?'<i>playing…</i>':''}</span><span class="vp cvp" title="Victory points">${WREATH}<b>${score(x)}</b></span><small class="sub">${symHTML(x.i,13)}${x.c.n}</small>`;
  /* first player seal: sits on the slip of whoever starts the generation and moves on each generation, like a dealer button.
     It is its own element next to the slip's content, so it is only created when it arrives and keeps turning between renders */
  let fs=e.querySelector(':scope>.fps');
  if(x.i===st&&!fs){fs=document.createElement('span');fs.className='fps arrive';fs.setAttribute('role','img');fs.innerHTML=SEAL_MARK;e.append(fs)}
  else if(x.i!==st&&fs){fs.remove();fs=null}
  if(fs){fs.title=`Starts generation ${G.gen}`;fs.setAttribute('aria-label',fs.title)}});
 /* resource bar: Seeds and Biochar carry their standard project; Salvage and Rare mineral show what they pay for */
 const EQ='<svg class="eq" viewBox="0 0 16 14" aria-hidden="true"><path d="M1 2.5H15L13.6 5.5H2.4Z" fill="#d3efab"/><path d="M1 2.5H8V5.5H2.4Z" fill="#f2fbe4"/><path d="M1 8.5H15L13.6 11.5H2.4Z" fill="#9fcf68"/><path d="M1 8.5H8V11.5H2.4Z" fill="#d3efab"/></svg>';
 const RX={sa:`<em class="rx" title="1 Salvage pays 2 Credits toward Industry cards"><b>2</b><img src="resources/credits.png" alt="Cr">${EQ}<img src="ui/syn/industry.svg" alt="Industry"></em>`,
  re:`<em class="rx" title="1 Rare mineral pays 3 Credits toward Engine cards"><b>3</b><img src="resources/credits.png" alt="Cr">${EQ}<img src="ui/syn/engine.svg" alt="Engine"></em>`,
  se:`<button class="rp${!b&&STD.f.ok(p)?' rdy':''}" ${!b&&STD.f.ok(p)?'':'disabled'} onclick="std('f')" title="Standard project: 8 Seeds → place a Forest"><b>8</b><img src="resources/${RFILE.se}.png" alt="Seeds"><svg class="ar" viewBox="0 0 14 12" aria-hidden="true"><path d="M1 4.5H8V1.5L13 6L8 10.5V7.5H1Z" fill="currentColor"/></svg><img class="tile" src="tile-art/forest.png" alt="Forest"></button>`,
  bc:`<button class="rp${!b&&STD.so.ok(p)?' rdy':''}" ${!b&&STD.so.ok(p)?'':'disabled'} onclick="std('so')" title="Standard project: 8 Biochar → raise Soil by 1"><b>8</b><img src="resources/${RFILE.bc}.png" alt="Biochar"><svg class="ar" viewBox="0 0 14 12" aria-hidden="true"><path d="M1 4.5H8V1.5L13 6L8 10.5V7.5H1Z" fill="currentColor"/></svg><b>+1</b><img src="ui/track-soil.svg" alt="Soil"></button>`};
 $('#res').innerHTML=Object.keys(R).map(k=>`<div class="r${RX[k]?' rxr':''}" style="--c:${RCOL[k]}">${resIcon(k)}<span>${p.res[k]}</span><i>+${k=='cr'?p.tr+p.pr.cr:p.pr[k]}</i>${RX[k]||''}</div>`).join('');
 $('#std').innerHTML='';
 genUpdate(b);
 $('#deck').innerHTML=`<div class="pile">${G.deck.length?Array.from({length:Math.min(5,Math.ceil(G.deck.length/6))},()=>`<div class="cb">${CBACK}</div>`).join(''):'<div class="cb empty"></div>'}</div><small>${G.deck.length} cards left</small>`;
 const pl=p.tab.filter(id=>CARDS[id].y!='A').length;
 $('#played').innerHTML=`<div class="pile">${pl?Array.from({length:Math.min(4,pl)},()=>'<div class="cb pl"><b>Played</b></div>').join('').replace(/<b>Played<\/b><\/div>$/,'<b>Played</b><span class="pn">'+pl+'</span></div>'):'<div class="cb empty"></div>'}</div><small>${pl} played</small>`;
 $('#log').innerHTML=G.log.join('<br>');
 const a=$('#ask'),p0=G.pend[0];a.hidden=!G.pend.length||!myTurn();a.innerHTML=!G.pend.length?'':typeof p0=='string'?`Place: ${LN[p0]} · glowing hexes are the best spots, any outlined hex works${UNDO?'<button class="undo" onclick="undo()">Undo</button>':''}`
  :`${{Q:'Steal up to',X:'A rival loses up to',Z:'A rival loses'}[p0.rv]} ${p0.n} ${R[p0.r]}${p0.rv=='Z'?' production':''} · choose the rival:${G.ps.filter(x=>x&&x.i!==ME).map(x=>`<button class="undo" onclick="uiRival(${x.i})">${esc(pname(x))}</button>`).join('')}`;
 if(G.cur===ME&&LASTCUR!==undefined&&LASTCUR!==ME&&myTurn())sfx('turn');LASTCUR=G.cur;
 /* your Active cards: 4 decks in a 2×2 square; each deck stacks like the old single pile (top card first). Order comes from LAY */
 layoutFix(p);const SH2=13.8*14.6,AH=(Math.max(300,innerHeight-380)-10)/2, // 2 rows of decks share the height the old pile had
 deck=(acts,n)=>{const k=acts.length,off=k>1?Math.max(40,Math.min(84,(AH-SH2)/(k-1))):0;
  return`<div class="stk${k?'':' empty'}" data-deck="${n}" data-off="${Math.round(off)}" style="width:138px;height:${Math.round(SH2+(k?k-1:0)*off)}px">${acts.map((id,j)=>{const cd=CARDS[id],ha=!!aparse(id),used=ha&&p.used.includes(id),dis=!ha||used||b||!canAct(p,id);return`<div class="stkw" data-id="${id}" style="--u:13.8px;top:${Math.round(j*off)}px;z-index:${k-j};--off:${Math.round(off)}px">${cardHTML(cd,p,{used,no:ha&&dis&&!used,tok:p.tok[id]})}<button class="hit${j?'':' full'}" ${dis?'disabled':''} onclick="uiAct(${id})" title="${cd.n}"></button></div>`}).join('')}</div>`};
 $('#tab').innerHTML=LAY.d.some(d=>d.length)?`<div class="decks">${LAY.d.map(deck).join('')}</div>`:'';
 const hn=p.hand.length,avail=Math.min(innerWidth*.9-40,1060),hm=hn>1?Math.min(8,(avail-hn*172.5)/(hn-1)):0,mid=(hn-1)/2,tilt=Math.min(3.4,22/Math.max(hn,1));
 $('#hand').oncontextmenu=cycleSort;$('#hand').innerHTML=`<div class="hh" onclick="tgh()">${hn} CARDS · HOVER TO REVEAL</div><div class="cs">${handOrder(p).map((i,j)=>{const id=p.hand[i],cd=CARDS[id],ok=!b&&canPlay(p,cd),d=j-mid;return`<div class="pcw" data-hi="${id}" style="--u:17.25px;margin-left:${j?hm:0}px" onclick="uiPlay(${i},this)">${cardHTML(cd,p,{no:!ok,need:!b&&!pay(p,cd,0),st:`--r:${(d*tilt).toFixed(1)}deg;--y:${Math.round(d*d*1.4)}px`})}</div>`}).join('')}</div>`;
 G.cells.forEach(drawCell);mark();
 if(myTurn()&&p.draft&&p.draft.length&&!G.over&&!document.querySelector('#modal:not([hidden]) .drf'))draftUI()}
/* the first player seal (design A1): sun rays around a sprout, the same look as the Next generation seal */
const SEAL_MARK='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="21" cy="22" r="18" fill="#0e1c1961"/><g class="fp-rays"><polygon points="20.00,1.00 22.54,7.25 17.46,7.25" fill="#f3ecd8"/><polygon points="27.27,2.45 27.22,9.19 22.54,7.25" fill="#cbbd97"/><polygon points="33.44,6.56 30.81,12.78 27.22,9.19" fill="#f3ecd8"/><polygon points="37.55,12.73 32.75,17.46 30.81,12.78" fill="#cbbd97"/><polygon points="39.00,20.00 32.75,22.54 32.75,17.46" fill="#f3ecd8"/><polygon points="37.55,27.27 30.81,27.22 32.75,22.54" fill="#cbbd97"/><polygon points="33.44,33.44 27.22,30.81 30.81,27.22" fill="#f3ecd8"/><polygon points="27.27,37.55 22.54,32.75 27.22,30.81" fill="#cbbd97"/><polygon points="20.00,39.00 17.46,32.75 22.54,32.75" fill="#f3ecd8"/><polygon points="12.73,37.55 12.78,30.81 17.46,32.75" fill="#cbbd97"/><polygon points="6.56,33.44 9.19,27.22 12.78,30.81" fill="#f3ecd8"/><polygon points="2.45,27.27 7.25,22.54 9.19,27.22" fill="#cbbd97"/><polygon points="1.00,20.00 7.25,17.46 7.25,22.54" fill="#f3ecd8"/><polygon points="2.45,12.73 9.19,12.78 7.25,17.46" fill="#cbbd97"/><polygon points="6.56,6.56 12.78,9.19 9.19,12.78" fill="#f3ecd8"/><polygon points="12.73,2.45 17.46,7.25 12.78,9.19" fill="#cbbd97"/></g><circle cx="20" cy="20" r="13.6" fill="#244a3e"/><path d="M10.4 29.6A13.6 13.6 0 0 1 29.6 10.4" fill="none" stroke="#6aa88c" stroke-width="1.4"/><circle cx="20" cy="20" r="11.6" fill="#1b372f"/><circle cx="20" cy="20" r="9" fill="none" stroke="#b9de8c" stroke-width="1.1" stroke-opacity=".55"/><g class="fp-spr"><polygon points="19.4,27 20.6,27 20.6,21 19.4,21" fill="#8cc152"/><polygon points="20,22 12.6,16.2 17.2,16.6" fill="#d3efab"/><polygon points="20,22 15.4,21.6 12.6,16.2" fill="#9fcf68"/><polygon points="20,21.4 22.2,16 28.6,13.8" fill="#d3efab"/><polygon points="20,21.4 28.6,13.8 26.2,19.8" fill="#9fcf68"/></g></svg>';
/* your corporation card fills the space between the player panels and the deck (hidden if there is too little room) */
function fitCorp(){const mc=$('#mycorp'),dk=$('#deck');if(!mc||!dk)return;mc.style.setProperty('--cu','0px');
 const u=Math.min(.6875,(dk.getBoundingClientRect().top-mc.getBoundingClientRect().top-16)/360);mc.classList.toggle('tight',u<.42);mc.style.setProperty('--cu',Math.max(u,0)+'px')}
addEventListener('resize',()=>requestAnimationFrame(fitCorp));
/* the picture keeps half of the card; on cards with a lot of effects the flavour line shrinks to one line or hides */
function fitCds(){document.querySelectorAll('.pc .cds:not([data-fit])').forEach(d=>{const b=d.parentNode;if(!b.offsetParent||!b.clientHeight)return;d.dataset.fit=1;
 if(d.offsetHeight>b.clientHeight-2){d.classList.add('one');if(d.offsetHeight>b.clientHeight-2)d.classList.replace('one','off')}})}
new MutationObserver(()=>requestAnimationFrame(fitCds)).observe(document.body,{childList:true,subtree:true});
function deckAnim(n){const pile=document.querySelector('#deck .pile');if(!pile||!(n>0))return;const r=pile.getBoundingClientRect(),tx=innerWidth/2,ty=innerHeight-80;
 pile.animate([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],{duration:240,iterations:Math.min(n,5)});
 for(let i=0;i<n;i++){const d=document.createElement('div');d.className='cb fly';d.innerHTML=CBACK;d.style.left=r.left+'px';d.style.top=r.top+'px';document.body.appendChild(d);
  const dx=tx-r.left-53+(i-(n-1)/2)*44,dy=ty-r.top-74;
  d.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.55-70}px) rotate(${(i-n/2)*7}deg)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(.9)`,opacity:0}],{duration:700,delay:i*140,easing:'cubic-bezier(.3,.7,.3,1)',fill:'backwards'}).onfinish=()=>d.remove()}}
/* ---------- GENERATION WHEEL + NEXT GENERATION SEAL (bottom right) ---------- */
const HOLD_MS=489; // how long the seal must be held down, in milliseconds, before the next generation starts
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
 const sl=g.querySelector('.sl');sl.dataset.state=!myTurn()?'wait':G.pend.length?'tile':'ready';sl.disabled=!!b;
 sl.querySelector('.lbl.ready').textContent=NET?'End turn':'Next generation';sl.querySelector('.lbl.tile').textContent=G.pend.length&&typeof G.pend[0]!='string'?'Choose a rival first':'Place your tile first';sl.title=NET?'Hold to end your turn':'Hold to start the next generation';
 if(b)holdStop();else if(!HOLD)holdClear(sl)}
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#gen .sl');if(!b||e.button||b.disabled)return;e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}holdStart(b)});
['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,holdStop));
/* DRAG TO REARRANGE your Active decks and your hand (pointer events). A press only becomes a drag after moving 6 px,
   so a normal click still uses the card. After a drag, the click the browser sends on release is swallowed. */
let DRAG=null,NOCLICK=false;
function dropAt(d,x,y){if(d.hand){const h=$('#hand .cs');if(!h)return null;const r=h.getBoundingClientRect();if(x<r.left-60||x>r.right+60||y<r.top-60||y>r.bottom+40)return null;
  const cs=[...h.querySelectorAll('.pcw')].filter(c=>c.dataset.hi!=d.id).map(c=>c.getBoundingClientRect()),ix=cs.filter(c=>c.left+c.width/2<x).length;
  return{ix,mx:ix<cs.length?cs[ix].left-3:cs.length?cs[cs.length-1].right+1:r.left,my:r.top,mw:4,mh:r.height}}
 let best=null,bd=80;document.querySelectorAll('#tab .stk').forEach(s=>{const r=s.getBoundingClientRect(),dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom-120),dd=Math.hypot(dx,dy);if(dd<bd){bd=dd;best={s,r}}});
 if(!best)return null;const n=+best.s.dataset.deck,off=+best.s.dataset.off,k=LAY.d[n].filter(id=>id!==d.id).length,r=best.r;
 const ix=Math.max(0,Math.min(k,off?Math.round((y-r.top)/off):y<r.top+r.height/2?0:k));
 return{n,ix,mx:r.left,my:Math.min(r.bottom,off?r.top+ix*off:ix?r.bottom:r.top)-2,mw:r.width,mh:4}}
function dragEnd(d){if(d.c)d.c.remove();d.el.classList.remove('dragging');const m=$('#dropm');if(m)m.hidden=true}
document.addEventListener('pointerdown',e=>{if(e.button||!G||!LAY)return;const t=e.target.closest&&e.target.closest('#tab .stkw .hit,#hand .cs .pcw');if(!t)return;
 const w=t.closest('.stkw')||t;DRAG={el:w,hand:!!w.dataset.hi,id:+(w.dataset.hi||w.dataset.id),x:e.clientX,y:e.clientY,on:false}});
document.addEventListener('pointermove',e=>{const d=DRAG;if(!d||d.esc)return;
 if(!d.on){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)return;d.on=true;const r=d.el.getBoundingClientRect();d.dx=d.x-r.left;d.dy=d.y-r.top;
  d.c=d.el.cloneNode(true);d.c.classList.add('dragc');d.c.style.cssText+=`;width:${r.width}px;height:${r.height}px;margin:0`;document.body.append(d.c);d.el.classList.add('dragging')}
 d.c.style.left=e.clientX-d.dx+'px';d.c.style.top=e.clientY-d.dy+'px';
 let m=$('#dropm');if(!m){m=document.createElement('div');m.id='dropm';document.body.append(m)}
 const t=dropAt(d,e.clientX,e.clientY);m.hidden=!t;if(t)m.style.cssText=`left:${t.mx}px;top:${t.my}px;width:${t.mw}px;height:${t.mh}px`});
document.addEventListener('pointerup',e=>{const d=DRAG;DRAG=null;if(!d||!d.on)return;NOCLICK=true;setTimeout(()=>NOCLICK=false,0);if(d.esc)return;dragEnd(d);
 const t=dropAt(d,e.clientX,e.clientY),p=G&&G.ps[ME];if(!t||!p)return;
 if(d.hand){const ids=handOrder(p).map(i=>p.hand[i]).filter(id=>id!==d.id);ids.splice(t.ix,0,d.id);LAY.h=ids;HSORT=3}
 else{LAY.d.forEach(a=>{const i=a.indexOf(d.id);if(i>=0)a.splice(i,1)});LAY.d[t.n].splice(t.ix,0,d.id)}
 laySave();renderUI();if(d.hand){const h=$('#hand .hh');if(h)h.textContent=`Sorted by ${HSORTS[HSORT]} · right click to change`}});
document.addEventListener('pointercancel',()=>{if(DRAG&&DRAG.on)dragEnd(DRAG);DRAG=null});
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&DRAG){if(DRAG.on){dragEnd(DRAG);DRAG.esc=true}else DRAG=null}}); // cancelled: the card goes back, release does nothing
document.addEventListener('click',e=>{if(NOCLICK){NOCLICK=false;e.stopPropagation();e.preventDefault()}},true); // a drag never uses or plays the card
document.addEventListener('dragstart',e=>{if(e.target.closest&&e.target.closest('#tab,#hand'))e.preventDefault()}); // stop the browser's own picture-dragging
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
function corpCardHTML(c,ci,still){const s=slug(c.n),st=Object.entries(c.st||{}),pr=Object.entries(c.pr||{}),
 parts=[c.cr+' Cr',...st.map(([k,v])=>v+' '+R[k]),...pr.map(([k,v])=>'+'+v+' '+R[k]+' production')],
 line='(Start with '+(parts.length==1?parts[0]:parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1])+'.)',
 figs=`<span class="fig credits">${cRes('cr','')}<span class="n">${c.cr}</span></span>`+st.map(([k,v])=>`<span class="fig stock">${cRes(k,'')}<span class="n">${v}</span></span>`).join('')+pr.map(([k,v])=>`<span class="fig prod">${cPbox(k)}<span class="n">+${v}</span></span>`).join('');
 return`<article class="corp-card" style="--h:${c.h};--bgx:${CORP_SLICE[ci%6]}%${c.bg?`;--corp-bg:url(${c.bg})`:''}" ${still?`aria-label="${c.n}"`:`tabindex="0" role="button" aria-label="Choose ${c.n}" onclick="choose(${ci})" onkeydown="if(event.key=='Enter')choose(${ci})"`}>
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
