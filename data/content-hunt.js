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
<tr><td>West Virginia</td><td>WV Division of Natural Resources — wvdnr.gov</td></tr></table></div>
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

      { id: 'game', title: 'Field dressing & butchering game', icon: '🔪', sum: 'Gutting, cooling, cuts of meat, squirrels, rabbits, birds — and food safety', tags: ['hunting', 'squirrel', 'rabbit', 'deer', 'field dressing', 'skinning', 'game', 'butchering', 'hog', 'quartering', 'backstrap', 'tenderloin', 'gutless', 'meat'], body: `
<h2>Field dressing a deer or hog</h2>
${figs(fig(H.fieldDress, 'Three cuts: open the belly from the pelvis to the breastbone, free the vent, and cut the windpipe inside the chest. Then roll the insides out.'))}
<ol class="steps"><li>Make sure it's dead (touch the open eye with a stick from behind). Wear gloves.</li><li>Roll it on its back, uphill end at the head. Pinch up the belly skin and make a small cut just in front of the pelvis.</li><li>Put two fingers in, form a V under the blade, and cut forward to the breastbone, lifting the skin away from the guts so you don't puncture the stomach or intestines.</li><li>Cut around the anus (vent) to free the colon; pull it inside and tie it off.</li><li>Cut the thin diaphragm muscle across the chest, reach up as far as you can, and sever the windpipe and esophagus. Pull everything out and down.</li><li>Prop the cavity open with a stick to cool. Drain blood by rolling it face down for a minute.</li></ol>
<div class="box warn"><b class="lbl">Heat spoils meat fast</b>Get the meat below 40°F within a few hours. In the Southeast that usually means skinning and quartering right away and putting the meat on ice in a cooler (drained, with the meat in bags so it doesn't sit in water). Hanging only works below about 40°F.</div>
<h2>Butchering: where the meat is</h2>
${figs(fig(H.cuts, 'Main cuts of a deer (hogs are the same). The tenderloins lie inside, along the spine under the backstraps.'))}
<p><b>Gutless method</b> (fast in hot weather, no need to open the belly): skin one side from the spine down; remove the front shoulder (no bone joint, just cut behind it), the hindquarter (cut through the ball joint at the hip), and the backstrap along the spine. Flip and repeat. Then reach in behind the last rib to pull out the tenderloins. Neck and rib meat come off last for grinding or stew.</p>
<h2>Squirrel</h2><ol class="steps"><li>Cut through the tail bone from underneath without cutting the skin on top.</li><li>Step on the tail and pull the hind legs up. The skin peels toward the head. Then peel the "pants" off the hind legs.</li><li>Cut off head, feet and tail. Open the belly carefully (don't puncture intestines/bladder), remove guts, rinse.</li></ol>
<h2>Rabbit</h2><p>Wear gloves (tularemia). Pinch the back skin, cut a slit, and pull it apart both ways like a glove. Gut it. <b>Don't eat a rabbit with white spots on the liver</b>; discard it. Rabbit is so lean it can't sustain you alone ("rabbit starvation"), so eat fat from other sources.</p>
<h2>Birds</h2><p>Plucking is easiest after dipping in 150°F water for 30–60 seconds, or just skin them. For doves and ducks, many hunters simply pop out the breast: push thumbs under the breastbone and pull. Remove the crop and guts.</p>
<h2>Eating it safely</h2><div class="tbl"><table><tr><th>Meat</th><th>Cook to</th><th>Why</th></tr>
<tr><td>Wild hog, bear</td><td><b>160°F</b>, no pink</td><td>Trichinella, brucellosis, toxoplasma</td></tr>
<tr><td>Ground venison & any game sausage</td><td>160°F</td><td>Bacteria mixed through the meat</td></tr>
<tr><td>Venison steaks & roasts</td><td>145°F + 3 min rest</td><td>Whole muscle cuts</td></tr>
<tr><td>Rabbit, squirrel, birds</td><td>165°F</td><td>Tularemia, salmonella</td></tr></table></div>
<p><b>Chronic wasting disease</b> is present in deer in AR, TN, MS, VA, KY, NC, LA, AL and spreading. In those areas get your deer tested (free drop‑off stations), and don't eat brain, spinal cord, eyes, spleen or lymph nodes; bone out the meat rather than sawing through the spine. Discard any meat that smells bad or has abscesses or yellow‑green pus. To keep meat without a freezer, see <a href="#/c/preserve">Food preservation</a>.</p>` },

      { id: 'hogs', title: 'Feral hogs: hunting, trapping & safety', icon: '🐗', sum: 'The Southeast’s most available big game — and its dangers and diseases', tags: ['hog', 'feral hog', 'wild boar', 'pig', 'trap', 'corral trap', 'brucellosis', 'pseudorabies', 'hunting', 'nuisance'], body: `
<p>Feral hogs live in every Southeast state, multiply fast (a sow can raise two litters of 4–10 a year), and tear up farms and woods. Many states encourage removing them: on private land with permission, hogs often have <b>no season and no bag limit</b>, and some states allow night hunting with a permit. Rules vary, so check your state's wildlife agency. <b>Moving live hogs is illegal almost everywhere.</b></p>
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
<h2>Cleaning fish</h2>
${figs(fig(H.fillet, 'Filleting: two cuts per side and no bones to fight with.'))}
<ol class="steps"><li>Scale whole fish from tail to head with a knife back, or skin catfish (cut around the head, peel the skin with pliers).</li><li>To gut: cut from the vent to the gills, remove guts and gills.</li><li>Cook thoroughly. Eat within hours in heat, or keep on ice.</li></ol>
<p>Check fish consumption advisories: some rivers and lakes have mercury or PCB warnings. Avoid shellfish from closed or polluted waters.</p>` },

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
