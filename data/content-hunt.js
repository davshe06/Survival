/* Fishing, Hunting & Trapping: illustrated with the diagrams in data/hunt-figs.js. */
(function () {
  const H = window.FG_HUNT || { figs: () => '', fig: () => '' };
  const { figs, fig } = H;
  (window.GUIDE = window.GUIDE || []).push({
    id: 'hunt', title: 'Fishing, Hunting & Trapping', icon: '🎣', color: '#6b8f9e',
    blurb: 'Catching, tracking and processing fish and game',
    intro: 'Fishing and hunting are regulated by each state (licenses, seasons, limits, legal methods). Many survival techniques, such as snares, trotlines, fish traps and night hunting, are illegal except in a true life‑threatening emergency. Know your state\'s rules.',
    articles: [
      { id: 'regs', title: 'Hunting, fishing & foraging rules by state', icon: '📜', sum: 'Licenses, seasons and who to ask — rules change every year', tags: ['license', 'regulations', 'seasons', 'wildlife agency', 'dnr', 'fishing license', 'hunting license', 'foraging rules', 'public land'], body: `
<div class="box warn"><b class="lbl">Check before you hunt, fish or gather</b>Seasons, bag limits, legal methods and license rules change every year and differ by state, county and property. This app does not list them so it never shows outdated rules. Look them up (and save the PDF regulations digest to your phone's Files app) before a trip.</div>
<div class="tbl"><table><tr><th>State</th><th>Wildlife agency (licenses & regulations)</th></tr>
<tr><td>Alabama</td><td>Alabama DCNR Wildlife & Freshwater Fisheries — outdooralabama.com</td></tr>
<tr><td>Arkansas</td><td>Arkansas Game & Fish Commission — agfc.com</td></tr>
<tr><td>Florida</td><td>Florida Fish & Wildlife Conservation Commission — myfwc.com</td></tr>
<tr><td>Georgia</td><td>Georgia DNR Wildlife Resources Division — georgiawildlife.com</td></tr>
<tr><td>Kentucky</td><td>Kentucky Dept. of Fish & Wildlife Resources — fw.ky.gov</td></tr>
<tr><td>Louisiana</td><td>Louisiana Dept. of Wildlife & Fisheries — wlf.louisiana.gov</td></tr>
<tr><td>Mississippi</td><td>Mississippi Dept. of Wildlife, Fisheries & Parks — mdwfp.com</td></tr>
<tr><td>North Carolina</td><td>NC Wildlife Resources Commission — ncwildlife.gov</td></tr>
<tr><td>South Carolina</td><td>SC Dept. of Natural Resources — dnr.sc.gov</td></tr>
<tr><td>Tennessee</td><td>Tennessee Wildlife Resources Agency — tn.gov/twra</td></tr>
<tr><td>Virginia</td><td>Virginia Dept. of Wildlife Resources — dwr.virginia.gov</td></tr>
<tr><td>West Virginia</td><td>WV Division of Natural Resources — wvdnr.gov</td></tr>
<tr><td>Pennsylvania</td><td>PA Game Commission (hunting & trapping) — pgc.pa.gov · PA Fish & Boat Commission (fishing & boating) — fishandboat.com</td></tr>
<tr><td>New Jersey</td><td>NJ Division of Fish & Wildlife — dep.nj.gov/njfw</td></tr>
<tr><td>New York</td><td>NYS Dept. of Environmental Conservation — dec.ny.gov</td></tr></table></div>
<p>Most states sell licenses online and through their own free phone apps — buy before you go and keep a screenshot. Saltwater fishing often needs a separate license or free registry.</p>
<h2>General rules of thumb</h2>
<ul><li><b>Private land:</b> you need the landowner's permission to hunt, fish, trap or forage. Purple paint marks on trees/posts mean "No trespassing" in most Southeast states.</li>
<li><b>National forests:</b> small amounts of berries, nuts and mushrooms for personal use are generally allowed; commercial gathering, digging plants (ginseng, ramps) and cutting live trees need a permit. Check the forest's rules.</li>
<li><b>National parks:</b> most plant and animal gathering is prohibited; some parks allow limited fruit/nut picking for personal use. Hunting is generally not allowed in national parks.</li>
<li><b>Wildlife Management Areas:</b> often need a WMA permit/stamp in addition to a license, and have their own dates.</li>
<li><b>Protected species:</b> e.g. gopher tortoises, many turtles, ginseng without a permit, and migratory birds outside seasons are protected.</li>
<li><b>True emergencies:</b> in a genuine life‑threatening situation, survival comes first — but document what you did and report it afterwards.</li></ul>` },

      { id: 'hunting', title: 'Hunting basics & shot placement', icon: '🎯', sum: 'Safety, which gun and load for which game, where to aim, tracking a hit animal', tags: ['hunting', 'shot placement', 'vitals', 'deer', 'hog', 'squirrel', 'rifle', 'shotgun', 'caliber', 'gauge', 'blood trail', 'tracking', 'tree stand', 'blaze orange', 'hunter safety'], body: `
<div class="box danger"><b class="lbl">Four rules of firearm safety</b><ol style="margin:0;padding-left:20px"><li>Treat every gun as if it is loaded.</li><li>Never point the muzzle at anything you aren't willing to destroy.</li><li>Keep your finger off the trigger until your sights are on the target.</li><li>Be sure of your target and what is beyond it. A rifle bullet can travel 2+ miles.</li></ol></div>
<ul><li><b>Blaze orange:</b> required during deer gun seasons in most Southeast states (cap and/or vest). Wear it anyway whenever others are hunting.</li><li><b>Tree stands cause more hunting injuries than guns.</b> Wear a full‑body harness, connected from the moment you leave the ground, and haul your unloaded gun up with a rope.</li><li><b>Hunter education:</b> most states require a course for anyone born after a set date. Many are online.</li></ul>
<h2>Which gun & load for which game</h2>
<div class="tbl"><table><tr><th>Game</th><th>Good choices</th><th>Aim</th></tr>
<tr><td>Squirrel</td><td>.22 LR rifle; or 20/12 ga with #6 shot</td><td>Head with a .22; body with shot</td></tr>
<tr><td>Rabbit</td><td>20/12 ga #4–6 shot; .22 LR when sitting</td><td>Head/chest</td></tr>
<tr><td>Dove, quail</td><td>20/12 ga #7½–8</td><td>Swing through, lead the bird</td></tr>
<tr><td>Ducks/geese</td><td>12 ga <b>non‑toxic (steel) shot only</b>: federal law. Steel #2–4 for ducks</td><td>Head & front half, under 40 yd</td></tr>
<tr><td>Turkey</td><td>12/20 ga turkey loads (#4–6 lead or #7–9 tungsten)</td><td>Head & neck, under 40 yd</td></tr>
<tr><td>Deer</td><td>Centerfire rifle .243 or larger (.270, .308, .30‑06, 6.5 Creedmoor…), shotgun slug, muzzleloader, or bow. Rimfire .22 is illegal for deer.</td><td>Heart‑lung (diagram)</td></tr>
<tr><td>Feral hog</td><td>Same as deer; heavier bullets for big boars</td><td>Low on the front shoulder</td></tr></table></div>
<p class="small muted">Many states restrict calibers, buckshot, magazine size or rifles in certain counties. Check your state's rules.</p>
<h2>Where to aim</h2>
${figs(fig(H.deerVitals, '<b>Deer:</b> wait for a broadside or quartering‑away angle. Heart and lungs sit just behind the front leg, low. Skip head and neck shots: they are small targets and easy to wound.'), fig(H.hogVitals, '<b>Hog:</b> the vitals are lower and farther forward than a deer’s, tucked behind thick shoulder gristle. Aim on the front‑leg crease, a third up.'))}
<h2>How to hunt</h2>
<ul><li><b>When:</b> the first and last 2 hours of daylight. Deer move most at dawn and dusk, and around the full moon at midday. Squirrels feed mornings in oaks and hickories when nuts drop.</li><li><b>Wind:</b> always keep the wind in your face or across you. A deer's nose is its best defense.</li><li><b>Stand hunting:</b> sit still near food (acorns, crop edges, persimmons), water, or trails between bedding and food. Movement gives you away more than sound.</li><li><b>Still‑hunting:</b> a few slow steps, then stop and look for a minute. Walk on the shady side; scan for pieces of an animal (an ear, a leg, a horizontal back) rather than the whole.</li><li><b>Read sign:</b> fresh tracks, droppings, rubs and scrapes tell you where animals move. See <a href="#/a/hunt/tracks">Animal tracks & sign</a>.</li></ul>
<h2>After the shot</h2>
<ol class="steps"><li>Watch where the animal runs and mark (with your phone's map) where it stood and where you last saw it.</li><li><b>Wait</b> before following. Heart/lung hit: 30 minutes. Liver hit (dark red blood): 3–4 hours. Gut hit (greenish, food in the blood, foul smell): 8–12 hours or it will run and you'll lose it.</li><li>Pink, frothy blood with bubbles = lung hit. Bright red = muscle or heart. Mark blood with flagging tape every few yards so you can see the line of travel.</li><li>Approach from behind and above. Touch the eye with a stick; if it blinks, be ready to shoot again.</li></ol>` },

      { id: 'game', title: 'Field dressing & butchering game', icon: '🔪', sum: 'Gutting, skinning, cooling, cuts of meat, and food safety', tags: ['hunting', 'deer', 'field dressing', 'skinning', 'game', 'butchering', 'hog', 'quartering', 'backstrap', 'tenderloin', 'gutless', 'meat'], body: `
<h2>Field dressing a deer or hog</h2>
${figs(fig(H.fieldDress, 'Three cuts: open the belly from the pelvis to the breastbone, free the vent, and cut the windpipe inside the chest. Then roll the insides out.'))}
<ol class="steps"><li>Make sure it's dead (touch the open eye with a stick from behind). Wear gloves.</li><li>Roll it on its back, uphill end at the head. Pinch up the belly skin and make a small cut just in front of the pelvis.</li><li>Put two fingers in, form a V under the blade, and cut forward to the breastbone, lifting the skin away from the guts so you don't puncture the stomach or intestines.</li><li>Cut around the anus (vent) to free the colon; pull it inside and tie it off.</li><li>Cut the thin diaphragm muscle across the chest, reach up as far as you can, and sever the windpipe and esophagus. Pull everything out and down.</li><li>Prop the cavity open with a stick to cool. Drain blood by rolling it face down for a minute.</li></ol>
<div class="box warn"><b class="lbl">Heat spoils meat fast</b>Get the meat below 40°F within a few hours. In the Southeast that usually means skinning and quartering right away and putting the meat on ice in a cooler (drained, with the meat in bags so it doesn't sit in water). Hanging only works below about 40°F.</div>
<h2>Butchering: where the meat is</h2>
${figs(fig(H.cuts, 'Main cuts of a deer (hogs are the same). The tenderloins lie inside, along the spine under the backstraps.'))}
<p><b>Gutless method</b> (fast in hot weather, no need to open the belly): skin one side from the spine down; remove the front shoulder (no bone joint, just cut behind it), the hindquarter (cut through the ball joint at the hip), and the backstrap along the spine. Flip and repeat. Then reach in behind the last rib to pull out the tenderloins. Neck and rib meat come off last for grinding or stew.</p>
<h2>Skinning a deer or hog</h2>
${figs(fig(H.hang, 'Hang the carcass by the hind legs from a gambrel (or a stout stick through the hocks) and pull the hide down.'))}
<ol class="steps"><li>Cut a ring through the skin just below each hock, then slit down the inside of each hind leg to the belly cut.</li><li>Peel the hide down off the hams, using short knife strokes against the hide (not the meat) where it sticks.</li><li>Cut off the tail at the base. Keep pulling the hide down over the back and shoulders; slit the front legs the same way.</li><li>Cut off the head and the hide together at the neck. Saw or snap off the lower legs at the knees.</li><li>Keep hair off the meat: wipe it with a damp cloth, and rinse only if you'll dry it right away.</li></ol>
<p>Squirrels, rabbits and birds: see <a href="#/a/hunt/small-game">Cleaning small game & birds</a>. Cooking, jerky and preserving: see <a href="#/a/hunt/meat-prep">Cooking & preserving wild game</a>.</p>
<h2>Eating it safely</h2><div class="tbl"><table><tr><th>Meat</th><th>Cook to</th><th>Why</th></tr>
<tr><td>Wild hog, bear</td><td><b>160°F</b>, no pink</td><td>Trichinella, brucellosis, toxoplasma</td></tr>
<tr><td>Ground venison & any game sausage</td><td>160°F</td><td>Bacteria mixed through the meat</td></tr>
<tr><td>Venison steaks & roasts</td><td>145°F + 3 min rest</td><td>Whole muscle cuts</td></tr>
<tr><td>Rabbit, squirrel, birds</td><td>165°F</td><td>Tularemia, salmonella</td></tr></table></div>
<p><b>Chronic wasting disease</b> is present in deer in PA, AR, TN, MS, VA, KY, NC, LA, AL and spreading. In those areas get your deer tested (free drop‑off stations), and don't eat brain, spinal cord, eyes, spleen or lymph nodes; bone out the meat rather than sawing through the spine. Discard any meat that smells bad or has abscesses or yellow‑green pus. To keep meat without a freezer, see <a href="#/c/preserve">Food preservation</a>.</p>` },

      { id: 'small-game', title: 'Cleaning small game & birds', icon: '🐿️', sum: 'Squirrel, rabbit, doves, ducks, frogs, raccoon & opossum', tags: ['squirrel', 'rabbit', 'skinning', 'dove', 'quail', 'duck', 'turkey', 'plucking', 'frog legs', 'raccoon', 'opossum', 'small game', 'cleaning'], body: `
<p>Wear gloves when you can, keep the meat clean and cool, and get small game cleaned within an hour or two in warm weather.</p>
<h2>Squirrel</h2>
${figs(fig(H.squirrel, 'The “step on the tail” method skins a squirrel in about a minute.'))}
<ol class="steps"><li>Lay the squirrel on its belly. Cut through the tail bone from underneath, leaving the skin on top of the tail attached.</li><li>Cut a short slit along the back skin on each side of the tail.</li><li>Step on the tail and pull the hind legs straight up. The skin peels off toward the head like a sweater.</li><li>Pull the remaining “pants” off the hind legs. Cut off the head and feet at the joints.</li><li>Open the belly from the pelvis to the ribs without cutting the guts; pull them out with the heart and lungs. Keep the heart and liver if they look clean.</li></ol>
<h2>Rabbit</h2>
${figs(fig(H.rabbit, 'Rabbit skin is thin and tears easily, which makes it quick to skin.'))}
<ul><li>After skinning, cut off the head and feet, then open the belly and remove the guts.</li><li><b>Check the liver:</b> white or yellow spots mean tularemia. Bury the whole rabbit and wash up.</li><li>Rabbit is very lean. Cook it with fat (bacon, lard, oil) and don't live on rabbit alone.</li></ul>
<h2>Birds</h2>
${figs(fig(H.breast, 'Breasting out a dove or duck takes seconds. Legs and thighs are worth keeping on bigger birds.'))}
<ul><li><b>Plucking</b> (keeps the skin and fat, best for ducks and turkey roasting): dip the bird in 150°F water for 30–60 seconds, then rub the feathers off. Singe leftover down over a flame.</li><li><b>Turkey:</b> breast it out like a dove, then skin and cut off the legs and thighs (slow‑cook them; they're tough). Remove the crop at the base of the neck.</li><li>Draw (gut) whole birds through a cut below the breastbone. Keep the heart, liver and gizzard (split the gizzard and peel off the lining).</li></ul>
<h2>Frogs</h2><p>Cut the bullfrog in half at the waist; keep the hind legs. Cut through the skin around the waist and pull it off the legs with pliers like a pair of pants. Cut off the feet. Fry or grill.</p>
<h2>Raccoon & opossum</h2><ul><li>Both are edible, fatty and best slow‑cooked (stew, roast with sweet potatoes). Cook to 165°F.</li><li>Raccoons have small scent glands (kernels) under the front legs, along the spine and inside the thighs. Cut them out without cutting into them.</li><li>Wear gloves: raccoon roundworm eggs and rabies. Never eat an animal that acted sick.</li></ul>` },

      { id: 'meat-prep', title: 'Cooking & preserving wild game', icon: '🥩', sum: 'Tender cooking, jerky, smoking, salting, grinding, using the whole animal', tags: ['jerky', 'smoking meat', 'venison', 'cooking game', 'curing', 'salt', 'grinding', 'sausage', 'lard', 'tough meat', 'preserve meat', 'drying'], body: `
<h2>Cooking for tenderness</h2><div class="tbl"><table><tr><th>Cut</th><th>How</th></tr>
<tr><td>Backstrap, tenderloin</td><td>Hot and fast: sear in a hot skillet or over coals to 145°F (still pink), rest 3 minutes. Overcooked venison turns dry and livery.</td></tr>
<tr><td>Hams (hindquarters)</td><td>Steaks across the grain, or roast low and slow.</td></tr>
<tr><td>Shoulders, neck, shanks</td><td>Braise or stew 3–4 hours (Dutch oven, low heat) until it falls apart, or pressure‑cook ~45 min.</td></tr>
<tr><td>Trim, scraps</td><td>Grind with 10–20% pork fat or hog fat for burgers and sausage.</td></tr>
<tr><td>Wild hog, bear</td><td>Always to 160°F. Slow‑cooking works best.</td></tr></table></div>
<p>Game is very lean: cook it with fat, and marinate tough cuts (salt + acid like vinegar or buttermilk) for a few hours. Trim off silver skin and fat on venison, which tastes waxy. Hog fat is good.</p>
<h2>Jerky (dried meat)</h2>
${figs(fig(H.rack, 'With no electricity, thin strips dry over a low smoky fire in a day or two. The smoke also keeps flies off.'))}
<ol class="steps"><li>Use lean meat only (fat goes rancid). Partly freeze it, then slice ⅛–¼ in thick along the grain.</li><li>Soak 6–24 hours in salt brine (¼ cup salt per quart of water) with pepper, garlic or soy sauce if you have them.</li><li><b>Heat first:</b> USDA advises heating strips to 160°F (a few minutes in boiling brine, or a hot oven) before drying, to kill germs that drying alone may not.</li><li>Dry until it bends and cracks but doesn't snap: 4–8 hours in a 150°F oven or dehydrator, or 1–2 days on a smoky rack.</li><li>Store in a dry, airtight container. Lasts 1–2 months at room temperature, longer cold.</li></ol>
<h2>Other ways to keep meat without a freezer</h2><ul><li><b>Smoking:</b> hot smoking (cooking it through at 160°F+) keeps meat a few days; long cold smoking plus salt and drying keeps it for weeks.</li><li><b>Salting:</b> pack meat in salt (or a strong brine) for days, then dry. Soak in fresh water before cooking.</li><li><b>Canning:</b> pressure canning only, never water bath, for meat. See <a href="#/c/preserve">Food preservation</a>.</li><li><b>Cool weather:</b> below 40°F, meat can hang (age) for days, which also makes it more tender.</li></ul>
<h2>Use the whole animal</h2><ul><li><b>Heart and liver:</b> slice and fry the first night (check the liver for spots or flukes).</li><li><b>Bones:</b> roast, then simmer 12–24 hours for broth.</li><li><b>Hog fat:</b> render into lard: cut fat into cubes, heat slowly with a splash of water until the fat melts out; strain. Keeps months in a cool, dark place.</li><li><b>Hides:</b> salt heavily and roll if you want to tan them later.</li></ul>` },
      { id: 'hogs', title: 'Feral hogs: hunting, trapping & safety', icon: '🐗', sum: 'The Southeast’s most available big game — and its dangers and diseases', tags: ['hog', 'feral hog', 'wild boar', 'pig', 'trap', 'corral trap', 'brucellosis', 'pseudorabies', 'hunting', 'nuisance'], body: `
<p>Feral hogs live in every Southeast state, multiply fast (a sow can raise two litters of 4–10 a year), and tear up farms and woods. Many states encourage removing them: on private land with permission, hogs often have <b>no season and no bag limit</b>, and some states allow night hunting with a permit. Rules vary, so check your state's wildlife agency. <b>Moving live hogs is illegal almost everywhere.</b></p>
<div class="box info">In <b>Pennsylvania, New Jersey and New York</b> feral hogs are rare and targeted by eradication programs. Report sightings to the state wildlife agency rather than hunting them. New York prohibits hunting them, because shooting scatters the group and makes it harder for trapping crews to remove them all.</div>
<div class="box danger"><b class="lbl">Dangers</b><ul style="margin:0"><li>Boars have razor‑sharp tusks; sows defend piglets. Give groups room, and have a tree or vehicle to get onto if one charges.</li><li><b>Brucellosis</b> passes to people through blood and fluids: wear gloves and eye protection when field dressing; cover cuts.</li><li><b>Pseudorabies</b> is harmless to people but kills dogs. <b>Never feed raw hog meat or scraps to dogs</b> or let them eat a carcass.</li><li>Cook hog meat to 160°F (trichinella, toxoplasma).</li></ul></div>
${figs(fig(H.hogVitals, 'Aim low on the front shoulder crease. A hog shot too far back may run a long way into thick cover.'), fig(H.hogTrap, 'A corral trap catches the whole group. Pre‑bait for days with the gate tied open so wary adults get used to it.'))}
<h2>Hunting hogs</h2><ul><li>Look for rooting (ground plowed up like a tiller went through), muddy wallows, rubbed trees near wallows with mud on them, and trails through thick cover near water.</li><li>Hogs have a great nose and poor eyesight: play the wind even more carefully than for deer.</li><li>They are most active at night and in the first and last light, especially in summer heat.</li><li>Use deer‑class rifles; for big boars choose heavier, tougher bullets.</li></ul>
<h2>Trapping hogs</h2><p>Corral traps (hog panels and T‑posts with a drop or saloon gate) are legal and widely used in most Southeast states, sometimes with a free permit; some states have rules on trap checks and what you may do with captured hogs. Bait with soured or fermented shelled corn. Check traps every day. Small box traps catch only one or two hogs and educate the rest.</p>
<h2>Processing</h2><p>Skin hogs rather than scalding. Smaller sows and young hogs (under ~120 lb) taste best; big boars can have a strong "boar taint" smell. Grind or slow‑cook tougher meat, or make sausage. Follow the field dressing steps in <a href="#/a/hunt/game">Field dressing & butchering</a>.</p>` },

      { id: 'fishing', title: 'Fishing for food', sum: 'Rigs, bait, where fish hold, passive lines, cleaning', tags: ['fishing', 'bait', 'hook', 'catfish', 'bream', 'bluegill', 'trotline', 'limb line', 'jug line', 'crawfish', 'rig', 'bobber', 'fillet', 'frog gigging'], body: `
<p>Fishing is the most reliable wild protein in the water‑rich Southeast. Bream (bluegill, sunfish), catfish, bass and crappie are everywhere. On the coast, look for redfish, speckled trout, croaker and whiting.</p>
<h2>Minimal kit</h2><p>Hooks (size 6–8 for bream, 1/0–3/0 for catfish/bass), 8–15 lb line, split shot sinkers, a few egg sinkers and swivels, bobbers, soft plastic worms, a spinner or two. A handline wrapped on a can or bottle works without a rod. Tie on hooks with an <a href="#/a/knots/fishing">improved clinch or Palomar knot</a>.</p>
<h2>Three rigs that catch most fish</h2>
${figs(fig(H.rigs, '<b>Bobber rig:</b> worm or cricket 2–4 ft under a float. <b>Bottom rig:</b> sliding sinker on the bottom with cut bait for catfish. <b>Limb line:</b> tied to an overhanging branch; the branch sets the hook.'))}
<h2>Bait</h2><ul><li>Earthworms (dig in moist soil, under logs), crickets, grasshoppers, grubs (rotten logs).</li><li>Catfish: chicken liver, cut fish, shrimp, hot dogs, stink bait.</li><li>Small pieces of the first fish you catch (eyes, guts, strips of belly).</li><li>Coast: shrimp, fiddler crabs, cut mullet, sand fleas (mole crabs) dug in the surf.</li></ul>
<h2>Where fish hold</h2>
${figs(fig(H.holds, 'Fish sit where food drifts to them and they can rest out of the current: below riffles, in deep pools, along undercut banks, behind rocks and around fallen trees.'))}
<ul><li>Early morning and evening, overcast days and before storms are best. Catfish feed well at night.</li><li>In summer heat fish go deep or into shade; in winter they hold in the deepest, slowest water.</li></ul>
<h2>Passive fishing (check legality)</h2>
${figs(fig(H.lines, 'A trotline fishes many hooks while you do other work. Limb lines and jug lines (a baited line under a floating jug) work the same way.'))}
<p>Most states require your name or license number on unattended lines and limit how many hooks you can set and how often you must check them. Some waters ban them entirely.</p>
<h2>Crawfish & frogs</h2><ul><li><b>Crawfish:</b> in ditches and creeks; catch by hand at night with a light, or with a baited trap (see <a href="#/a/hunt/traps">bottle trap</a>). Boil until red.</li><li><b>Bullfrogs:</b> gig or grab them at night with a light along pond edges (needs a fishing or hunting license in most states, with seasons in some). Eat the legs, skinned and cooked.</li></ul>
<h2>More</h2><ul><li><a href="#/a/hunt/fish-id">What you caught: fish & shellfish ID</a></li><li><a href="#/a/hunt/fishing-gear">No tackle? Improvised hooks, line and spears</a></li><li><a href="#/a/hunt/saltwater">Coast: surf fishing, crabbing, shrimp, oysters</a></li><li><a href="#/a/hunt/clean-fish">Cleaning, cooking & preserving fish</a></li></ul>
<p>Check fish consumption advisories: some rivers and lakes have mercury or PCB warnings. Avoid shellfish from closed or polluted waters.</p>` },

      { id: 'fish-id', title: 'Fish & shellfish of the Southeast', icon: '🐟', sum: 'Identify what you caught — and which ones not to eat', tags: ['fish identification', 'bluegill', 'bream', 'bass', 'crappie', 'catfish', 'redfish', 'trout', 'flounder', 'sheepshead', 'mullet', 'gar', 'puffer', 'lionfish', 'stingray', 'crab', 'crawfish', 'shrimp', 'oyster'], body: `
<p>Size limits, bag limits and seasons apply to most of these. Check your state's rules: <a href="#/a/hunt/regs">wildlife agencies</a>.</p>
<h2>Freshwater</h2>
<h3>Bluegill (bream)</h3>${window.FG_PH ? FG_PH('Lepomis macrochirus', 'Bluegill') : ''}<p>Dark spot on the gill flap. Ponds, lakes, slow rivers everywhere. Worms or crickets under a bobber. Excellent fried whole after scaling.</p>
<h3>Redear sunfish (shellcracker)</h3>${window.FG_PH ? FG_PH('Lepomis microlophus', 'Redear sunfish') : ''}<p>Red or orange edge on the gill flap. Feeds on snails along the bottom: fish worms on the bottom near beds in spring.</p>
<h3>Largemouth bass</h3>${window.FG_PH ? FG_PH('Micropterus salmoides', 'Largemouth bass') : ''}<p>Jaw reaches past the eye. Around cover: logs, docks, weeds. Plastic worms, spinners, live shiners. Smaller bass eat best; big ones carry more mercury.</p>
<h3>Crappie</h3>${window.FG_PH ? FG_PH('Pomoxis nigromaculatus', 'Black crappie') : ''}<p>Speckled, paper‑thin mouth. Schools around brush piles and bridge pilings; minnows or tiny jigs. Spring spawn brings them shallow. Some of the best‑eating fish there is.</p>
<h3>Channel catfish</h3>${window.FG_PH ? FG_PH('Ictalurus punctatus', 'Channel catfish') : ''}<p>Forked tail, often with small dark spots. Rivers, lakes, ponds. Chicken liver, cut bait, worms, stink bait, especially at night.</p>
<h3>Blue catfish</h3>${window.FG_PH ? FG_PH('Ictalurus furcatus', 'Blue catfish') : ''}<p>Forked tail, slate‑blue, straight‑edged anal fin. Big rivers and reservoirs; can top 50 lb. Fresh cut shad or skipjack on the bottom.</p>
<h3>Flathead catfish</h3>${window.FG_PH ? FG_PH('Pylodictis olivaris', 'Flathead catfish') : ''}<p>Square tail, flat head, lower jaw sticks out. Eats live fish around deep wood cover. Excellent meat.</p>
<h3>Bullhead</h3>${window.FG_PH ? FG_PH('Ameiurus natalis', 'Yellow bullhead') : ''}<p>Small catfish with a square tail. Muddy ponds and ditches; bites anything on the bottom. Good eating if skinned and the dark fat trimmed.</p>
<h3>Striped bass</h3>${window.FG_PH ? FG_PH('Morone saxatilis', 'Striped bass') : ''}<p>Silver with dark stripes. Big reservoirs and coastal rivers; chase schools of shad.</p>
<h3>Chain pickerel</h3>${window.FG_PH ? FG_PH('Esox niger', 'Chain pickerel') : ''}<p>Long, chain pattern, sharp teeth. Weedy, blackwater creeks and swamps. Many small Y‑bones: score the fillets deeply every ¼ inch and fry hard so the bones soften.</p>
<h3>Trout</h3>${window.FG_PH ? FG_PH('Oncorhynchus mykiss', 'Rainbow trout') : ''}<p>Cold mountain streams of the Appalachians (rainbow, brown, native brook trout). Separate trout regulations, stamps and catch‑and‑release waters are common.</p>
<h3>Bowfin (mudfish)</h3>${window.FG_PH ? FG_PH('Amia calva', 'Bowfin') : ''}<p>Long fin along the back, breathes air in swamps. Edible if cleaned and cooked fresh (soft meat; doesn't keep well).</p>
<h3>Alligator gar</h3>${window.FG_PH ? FG_PH('Atractosteus spatula', 'Alligator gar') : ''}<p>Huge, armored, long snout. Meat is edible, but <b>gar eggs (roe) are poisonous to people</b>. Never eat them. Harvest is restricted in several states.</p>
<h2>Saltwater</h2>
<h3>Red drum (redfish)</h3>${window.FG_PH ? FG_PH('Sciaenops ocellatus', 'Red drum') : ''}<p>Black spot (or several) near the tail. Marsh creeks, oyster bars and surf; shrimp, crabs, mullet. Strict slot limits.</p>
<h3>Spotted seatrout (speckled trout)</h3>${window.FG_PH ? FG_PH('Cynoscion nebulosus', 'Spotted seatrout') : ''}<p>Spotted back, two fang‑like teeth, soft mouth. Grass flats and marsh edges; live shrimp under a float.</p>
<h3>Atlantic croaker</h3>${window.FG_PH ? FG_PH('Micropogonias undulatus', 'Atlantic croaker') : ''}<p>Makes a croaking sound. Piers and channels in summer; shrimp on a bottom rig. Easy to catch, good fried.</p>
<h3>Southern flounder</h3>${window.FG_PH ? FG_PH('Paralichthys lethostigma', 'Southern flounder') : ''}<p>Flat, both eyes on one side. Lies on sandy bottoms near inlets; minnows or mud minnows on the bottom, or gigged at night where legal.</p>
<h3>Sheepshead</h3>${window.FG_PH ? FG_PH('Archosargus probatocephalus', 'Sheepshead') : ''}<p>Black bars, human‑like teeth. Around pilings, jetties and oyster bars; fiddler crabs or barnacles. Excellent white meat; tough to clean (spines).</p>
<h3>Striped mullet</h3>${window.FG_PH ? FG_PH('Mugil cephalus', 'Striped mullet') : ''}<p>Schools that jump. Eats algae, so rarely bites a hook; catch with a cast net. Great fried or smoked; also the best cut bait.</p>
<h3>Bluefish</h3>${window.FG_PH ? FG_PH('Pomatomus saltatrix', 'Bluefish') : ''}<p>Razor teeth: never hand‑land one by the mouth. Oily: bleed and ice right away, eat within a day or smoke it.</p>
<h2>Careful: dangerous or not to eat</h2>
<div class="box danger"><h3 style="margin-top:0">Puffers: don't eat</h3>${window.FG_PH ? FG_PH('Sphoeroides nephelus', 'Southern puffer') : ''}<p>Puffer fish can carry deadly toxins (saxitoxin in Florida waters, where harvest is banned in some areas). Release them.</p></div>
<h3>Lionfish</h3>${window.FG_PH ? FG_PH('Pterois volitans', 'Lionfish') : ''}<p>Invasive on reefs; <b>venomous spines</b> (painful, not usually deadly: soak a sting in water as hot as you can stand, 30–90 min). The meat is safe and excellent once the spines are cut off with scissors.</p>
<h3>Stingrays</h3>${window.FG_PH ? FG_PH('Hypanus sabinus', 'Atlantic stingray') : ''}<p>Shuffle your feet when wading so they swim off. A barb wound: hot‑water soak like above, clean well, and see a doctor (infection, broken barb).</p>
<p><b>Ciguatera:</b> big barracuda and large reef predators (amberjack, grouper) from southern reefs can carry a toxin that cooking doesn't destroy. Avoid big barracuda entirely.</p>
<h2>Shellfish</h2>
<h3>Blue crab</h3>${window.FG_PH ? FG_PH('Callinectes sapidus', 'Blue crab') : ''}<p>Tidal creeks, docks, marshes. Release egg‑bearing females ("sponge" crabs), and follow size limits. <a href="#/a/hunt/saltwater">How to catch</a>.</p>
<h3>Crawfish</h3>${window.FG_PH ? FG_PH('Procambarus clarkii', 'Red swamp crawfish') : ''}<p>Ditches, rice fields, swamps. Trap or catch by hand; purge in clean water and boil.</p>
<h3>Shrimp</h3>${window.FG_PH ? FG_PH('Litopenaeus setiferus', 'White shrimp') : ''}<p>Tidal creeks and sounds; cast net on a falling tide. Recreational shrimping rules and baiting seasons vary.</p>
<h3>Oysters</h3>${window.FG_PH ? FG_PH('Crassostrea virginica', 'Eastern oyster') : ''}<div class="box warn">Take shellfish only from areas your state lists as <b>open</b> (closures follow rain, sewage spills and red tide). Raw oysters can carry <i>Vibrio vulnificus</i>, which kills people with liver disease or weak immune systems: cook them.</div>` },

      { id: 'fishing-gear', title: 'Improvised & emergency fishing', icon: '🪝', sum: 'Hooks from pins, thorns and can tabs; line; spears; fishing without tackle', tags: ['improvised hook', 'gorge hook', 'safety pin', 'fishing line', 'paracord', 'spear', 'gig', 'handline', 'survival fishing', 'no tackle'], body: `
<p>A few hooks and 50 yards of line weigh nothing: keep a small fishing kit in every go‑bag and the car. When you have nothing, these work.</p>
<h2>Hooks</h2>
${figs(fig(H.impHooks, 'Four hooks from things you may already have.'))}
<ul><li><b>Gorge:</b> a 1–1½ in sliver of hard wood or bone, pointed at both ends, line tied at the middle. Bait it lengthwise; let the fish swallow it, then pull so it turns crosswise.</li><li><b>Safety pin:</b> open it, bend it into a J, and file or rub the point sharp on a rock. Barbless, so keep tension on the line.</li><li><b>Thorns:</b> hawthorn, greenbrier or locust thorns lashed to a twig at an angle.</li><li><b>Can tab, paper clip, fish hook from wire:</b> bend, sharpen, and tie off the eye well.</li></ul>
<h2>Line</h2><ul><li>Paracord: pull out the 7 inner strands. Each holds 30+ lb.</li><li>Dental floss, unraveled nylon or polyester thread, fishing line from a broken trimmer spool.</li><li>Plant fiber: twist yucca, dogbane or inner bark into two‑ply cord (see <a href="#/a/make/cordage">Cordage</a>).</li><li>A handline: wrap line around a can, bottle or stick. Cast by swinging the bait, or let it drift in current.</li></ul>
<h2>Bait & lures from nothing</h2><ul><li>Worms, grubs, insects, crawfish tails, and pieces of the first fish.</li><li>Shiny lure: a bit of foil, a can lid or a bright cloth on the hook, jigged near the bottom.</li><li>Fish feed at the edges of light: a lantern over water at night draws baitfish (legal in most places with a hook and line).</li></ul>
<h2>Spearing & gigging</h2>
${figs(fig(H.gig, 'A four‑prong gig from a straight sapling. Prongs spread wide make up for misses.'))}
<p>Stalk the shallows slowly, keep your shadow behind you, and push the gig down onto the fish against the bottom. Spearing and gigging fish is legal only for certain species and waters (often frogs, flounder, and rough fish like gar or carp). Check your state.</p>
<h2>Other ways</h2><ul><li><b>Minnow seine</b> from a T‑shirt or mosquito net stretched between two sticks, swept toward the bank.</li><li><b>Bottle trap</b> for minnows and crawfish: see <a href="#/a/hunt/traps">Traps & snares</a>.</li><li><b>Set lines</b> (limb lines, trotlines) fish for you overnight: see <a href="#/a/hunt/fishing">Fishing for food</a>.</li><li><b>Never</b> use poisons, chemicals, explosives or electricity to take fish. Illegal, dangerous, and it kills everything downstream.</li></ul>` },

      { id: 'saltwater', title: 'Coast: surf, crabs, shrimp & oysters', icon: '🦀', sum: 'Surf and pier rigs, crabbing, cast nets, tides, wading safety', tags: ['surf fishing', 'pier', 'crabbing', 'blue crab', 'cast net', 'shrimp', 'mullet', 'oysters', 'clams', 'saltwater', 'tides', 'stingray shuffle'], body: `
<p>Most Southeast states require a saltwater fishing license or a free registry number, even from the beach. Piers often have their own license.</p>
<h2>Surf & pier fishing</h2>
${figs(fig(H.surfRig, 'Two hooks off the main line above a pyramid sinker that grips the sand.'))}
<ul><li>Fish the troughs (darker water) just past the first breaking waves and the edges of sandbars.</li><li>Best bait: fresh shrimp, sand fleas (mole crabs) dug from wet sand where waves wash back, cut mullet.</li><li>Moving water feeds fish: the 2 hours around high tide and the start of the falling tide are best. Check the <a href="#/tools/tides">tide tool</a>.</li></ul>
<h2>Crabbing</h2>
${figs(fig(H.crab, 'Handline crabbing: a chicken neck on a string, pulled in so slowly the crab never lets go.'))}
<ol class="steps"><li>Tie a chicken neck or fish head to a string with a weight. Drop it off a dock or bank into 3–8 ft of water.</li><li>When the line moves or feels heavy, pull in very slowly, hand over hand.</li><li>When you see the crab, slip a dip net under it from below and scoop.</li><li>Keep crabs alive in a cooler with a damp towel (not in water) until cooking. Cook only crabs that are alive.</li></ol>
<p>Crab traps and pots work while you fish; most states limit recreational traps and require buoys marked with your name.</p>
<h2>Cast net (shrimp, mullet, bait)</h2><ol class="steps"><li>Loop the hand line around your wrist; coil it in your throwing hand along with the top of the net.</li><li>Hold a section of the lead line in your teeth or other hand, draping the rest.</li><li>Rotate your body and release, letting go of the lead line last, so the net opens into a circle.</li><li>Let it sink, then pull the line to close it. Practice on a lawn first.</li></ol>
<p>Throw for shrimp in tidal creeks on a falling tide at dusk or night, and on schools of mullet you see flipping.</p>
<h2>Oysters & clams</h2><ul><li>Only from <b>open, approved</b> harvest areas (states publish maps; areas close after heavy rain, sewage spills or red tide).</li><li>Clams: feel with your feet in mud flats at low tide, or look for keyhole‑shaped holes.</li><li>Cook shellfish: raw oysters can carry deadly <i>Vibrio</i>.</li></ul>
<h2>Wading safety</h2><ul><li>Do the <b>stingray shuffle</b>: slide your feet instead of stepping.</li><li>Wear shoes: oyster shells cut deep and get infected.</li><li>Watch for rip currents, fast incoming tides on flats, and sharks feeding at dawn, dusk and near fish‑cleaning stations. See <a href="#/a/wildlife/water-hazards">Water & coastal hazards</a>.</li></ul>` },

      { id: 'clean-fish', title: 'Cleaning, cooking & preserving fish', icon: '🔪', sum: 'Bleeding, scaling, gutting, filleting, skinning catfish, crabs, shrimp; cooking & smoking', tags: ['clean fish', 'fillet', 'scale', 'gut fish', 'skin catfish', 'bleed fish', 'clean crab', 'shrimp', 'crawfish boil', 'smoked fish', 'fried fish', 'fish safety', 'scombroid'], body: `
<h2>1. Bleed and chill it right away</h2>
${figs(fig(H.bleed, 'Bleeding takes seconds and is the biggest difference in taste.'))}
<p>Keep fish alive on a stringer or in a live well, or bleed and put them on ice. Ice slurry (ice plus a little water) chills fastest. In Southeast heat a dead fish left in the sun spoils in an hour or two.</p>
<h2>2. Panfish: scale and gut</h2>
${figs(fig(H.gut, 'For bream, crappie and small fish cooked whole.'))}
<ol class="steps"><li>Scale from tail to head on both sides (outdoors, it's messy). A spoon or the back of a knife works.</li><li>Cut off the head just behind the gill plates, angling toward the tail.</li><li>Slit from the vent to the throat and pull out the guts. Scrape out the dark blood line along the backbone with a thumbnail.</li><li>Rinse. Cook whole: the meat lifts off the bones easily.</li></ol>
<h2>3. Fillet and skin</h2>
${figs(fig(H.fillet, 'Two cuts per side.'), fig(H.skinFillet, 'Then take the skin off each fillet.'))}
<p>Feel for rib bones along the belly of each fillet and slice them off in one thin piece. Bass, crappie, redfish, trout and flounder all fillet well. (Flounder: cut down the center line and fillet each side as two pieces, top and bottom.)</p>
<h2>4. Catfish</h2>
${figs(fig(H.catfish, 'Catfish have no scales; skin them instead.'))}
<ol class="steps"><li>Hold the head with a rag or nail it to a board through the skull (a classic catfish board).</li><li>Cut through the skin just behind the head and around the pectoral fins, and along the back.</li><li>Grip the skin with pliers and pull it toward the tail in one piece.</li><li>Fillet, or cut off the head, gut, and cut into steaks. Trim any yellow fat and the red/dark meat along the side for milder taste.</li></ol>
<h2>Crabs, shrimp & crawfish</h2>
${figs(fig(H.crabClean, 'Clean a crab before or after cooking.'), fig(H.shrimp, 'Peel and devein shrimp.'))}
<ul><li><b>Crabs:</b> boil or steam live crabs 15–20 minutes until bright orange, then clean as shown and pick the meat. Or clean them live first (quicker to cook, less mess).</li><li><b>Crawfish:</b> rinse and soak in clean water 15–30 minutes to purge mud. Throw out dead ones. Boil 3–5 minutes with salt and seasoning, then let them soak 20–30 minutes. Twist off the tail, peel, and pinch the tail end to pull out the vein.</li></ul>
<h2>Cooking fish in camp</h2>
${figs(fig(H.stickCook, 'No pan needed: cook a whole gutted fish on a forked stick beside the coals.'))}
<ul><li><b>Fried:</b> dredge in seasoned cornmeal and fry in 350°F oil until golden, 3–5 minutes. Classic for bream, catfish and crappie.</li><li><b>Foil packet:</b> fillet with a little fat, salt and any wild onion on hot coals, 10–15 minutes.</li><li><b>Stew:</b> heads, frames and scraps simmered make broth for a fish stew or chowder.</li><li>Fish is done when it turns opaque and flakes apart (145°F).</li></ul>
<h2>Keeping fish without ice</h2>
${figs(fig(H.rack, 'Split fish or thin fillets dry and smoke on a rack over a slow, smoky fire.'))}
<ul><li><b>Smoking:</b> brine fillets 2–8 hours (1 cup salt per gallon of water), then smoke over a low fire. Hot‑smoked fish (cooked through) keeps a few days; fish smoked and dried hard over 1–2 days keeps a couple of weeks if kept dry.</li><li><b>Salt fish:</b> split, pack in salt for several days, then dry in sun and wind until stiff. Soak overnight before cooking.</li><li>Oily fish (mullet, bluefish, mackerel) smoke best and spoil fastest fresh.</li></ul>
<div class="box warn"><b class="lbl">Fish safety</b><ul style="margin:0"><li><b>Scombroid:</b> tuna, mackerel, bluefish and mahi left warm build up histamine (flushing, headache, rash within an hour). Cooking doesn't fix it. Chill them fast.</li><li>Cook freshwater fish fully (parasites). Don't eat fish found dead.</li><li>Follow state fish consumption advisories for mercury and PCBs, especially for children and pregnant women.</li><li>Don't eat puffers, gar roe or big barracuda: see <a href="#/a/hunt/fish-id">Fish ID</a>.</li></ul></div>` },
      { id: 'traps', title: 'Traps & snares', icon: '🪤', sum: 'Snares, figure-4 deadfall, squirrel pole, bottle trap, fish weir — and legal options', tags: ['trap', 'snare', 'trapping', 'deadfall', 'figure 4', 'emergency food', 'pole snare', 'fish trap', 'weir', 'cage trap', 'bottle trap'], body: `
<div class="box warn"><b class="lbl">Legal note</b>Snares, deadfalls and fish weirs are illegal for most people outside licensed trapping seasons, and can catch pets or protected animals. Use them only in genuine life‑or‑death situations. Legal year‑round options: commercial cage (live) traps for nuisance animals where your state allows, minnow traps with a fishing license, and hog corral traps.</div>
<h2>Trapping principles</h2><ul><li>Traps work while you rest, so set many (10+) because most catch nothing.</li><li>Set on active trails: tracks, droppings, chewed plants, burrows, and natural funnels (between rocks, under logs, along stream banks). See <a href="#/a/hunt/tracks">Animal tracks & sign</a>.</li><li>Disturb the spot as little as possible; mask your scent with mud or smoke.</li><li>Check at dawn and dusk. A trapped animal can bite, scratch or spray; approach carefully and dispatch it quickly.</li><li>Never set snares or deadfalls where children, pets or other people walk.</li></ul>
<h2>Trail snare</h2>
${figs(fig(H.snare, 'A loop of thin wire or strong cord across a trail, anchored to something solid. The animal’s own push closes it.'), fig(H.poleSnare, 'Squirrel pole: several small loops along a pole leaned against a busy tree can catch more than one squirrel.'))}
<ul><li>Rabbit loop: about fist‑size, bottom 3–4 in off the ground. Squirrel: 2–3 in.</li><li>Use a small wire eye or a slip knot so the loop closes freely but doesn't reopen.</li><li>Brush or twigs on both sides funnel the animal into the loop without it noticing.</li></ul>
<h2>Figure‑4 deadfall</h2>
${figs(fig(H.fig4, 'Three notched sticks hold up a heavy rock or log. When the bait stick moves, the sticks fall apart and the weight drops.'))}
<ol class="steps"><li>Upright: a stick with a flat top and a square notch halfway down, pushed into the ground.</li><li>Diagonal: rests on the top of the upright, with its upper end holding up the rock and a notch at its lower end.</li><li>Bait stick: catches the notch on the upright and holds the diagonal's lower end; the bait goes on the long end under the rock.</li><li>Practice the notches until the set stands on its own but falls with a light touch. Keep hands and face out from under the rock while setting it.</li></ol>
<h2>Fish & crawfish traps</h2>
${figs(fig(H.bottle, 'Bottle funnel trap: often legal as a minnow trap with a fishing license (check limits).'), fig(H.weir, 'Stone weir: an emergency method. Banned in nearly all public waters.'))}` },

      { id: 'insects', title: 'Insects & other emergency protein', sum: 'Grasshoppers, grubs, crawfish, frogs, snails', tags: ['insects', 'grasshopper', 'grubs', 'termites', 'frogs', 'snails', 'emergency protein'], body: `
<ul><li><b>Grasshoppers, crickets, katydids:</b> remove legs and wings, roast or fry. Always cook (parasites).</li><li><b>Grubs and beetle larvae</b> (in rotten logs): cook.</li><li><b>Termites and ants</b> (not fire ants): roast.</li><li><b>Earthworms:</b> soak in water to purge dirt, then cook.</li><li><b>Crawfish:</b> boil until red and shells are hard.</li><li><b>Frogs:</b> bullfrog legs — skin and cook. Avoid toads (warty skin, toxic glands).</li><li><b>Snails:</b> cook thoroughly (rat lungworm parasite in the South — never eat raw snails or slugs).</li></ul>
<p>Avoid: caterpillars (many toxic/stinging), brightly colored insects, anything that stings or smells foul, flies, ticks, mosquitoes, and dead insects you didn't kill.</p>` }
    ]
  });
})();
