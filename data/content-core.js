/* Core survival content: basics, water, fire, shelter, navigation, signaling, weather & disasters, hygiene, security. */
(window.GUIDE = window.GUIDE || []).push(
{
  id: 'basics', title: 'Survival Basics', icon: '🧠', color: '#d9a441',
  blurb: 'Priorities, mindset, the first hour, stranded in a car',
  articles: [
    { id: 'priorities', title: 'Survival priorities & the Rule of 3s', sum: 'What kills you first — and what to do first', tags: ['priorities', 'rule of 3', 'STOP'], body: `
<div class="box danger"><b class="lbl">The Rule of 3s (approximate)</b>
You can survive about <b>3 minutes</b> without air (or with severe bleeding) · <b>3 hours</b> exposed in harsh weather · <b>3 days</b> without water · <b>3 weeks</b> without food.<br>So the order is: <b>stop bleeding/breathing problems → shelter & temperature → water → food.</b></div>
<h2>S.T.O.P. — the first thing to do</h2>
<ol class="steps">
<li><b>Stop.</b> Sit down. Panic burns energy, water and judgment. Drink some water, eat a snack if you have one.</li>
<li><b>Think.</b> What happened? Is anyone hurt? What's the immediate danger (fire, flood water, traffic, weather, cold)?</li>
<li><b>Observe.</b> Look at your surroundings, your gear, daylight left (<a href="#/tools/sun">Sun tool</a>), weather, water, and your position (<a href="#/tools/gps">GPS</a>).</li>
<li><b>Plan.</b> Decide: stay put or move? Then act on the highest priority first.</li>
</ol>
<h2>Priority checklist</h2>
<ol>
<li><b>Safety now:</b> get away from immediate danger (road traffic, rising water, fire, downed power lines, unstable structures).</li>
<li><b>First aid:</b> major bleeding, airway, breathing, shock. See <a href="#/c/firstaid">First Aid</a>.</li>
<li><b>Shelter / body temperature:</b> In the Southeast summer, <i>heat</i> is the killer — get shade, stop exertion in mid‑day. In winter, wet + wind + 50°F can cause hypothermia.</li>
<li><b>Signal / communicate:</b> let people know where you are. Text 911 if calls fail. Leave a note in your car.</li>
<li><b>Water:</b> find, purify, ration sweat, not water.</li>
<li><b>Fire:</b> warmth, water purification, signaling, morale.</li>
<li><b>Food:</b> lowest priority short‑term. Most people can go weeks.</li>
</ol>
<h2>Stay or go?</h2>
<p><b>Stay</b> if someone knows where you are, you have shelter (your car is a great shelter), you're injured, or it's dark/stormy. Rescuers search for <b>vehicles</b> far more easily than people.</p>
<p><b>Go</b> only if staying is more dangerous (fire, flood, no water), you know exactly where help is and can reach it in daylight, and you leave a note with your plan, route, and time.</p>
<div class="box info"><b class="lbl">Tip</b>Before any trip, tell someone your route and when to call for help if they don't hear from you (a "trip plan"). It's the single biggest factor in rescue time.</div>` },
    { id: 'mindset', title: 'Survival mindset & morale', sum: 'Panic control, decision making, keeping a group together', tags: ['mental', 'panic', 'stress', 'leadership'], body: `
<p>Survivors are rarely the strongest or best‑equipped — they're the ones who stay calm, make small good decisions, and refuse to quit.</p>
<h2>Control panic: tactical breathing</h2>
<ol class="steps"><li>Breathe in through the nose for 4 seconds.</li><li>Hold 4 seconds.</li><li>Breathe out 4 seconds.</li><li>Hold 4 seconds. Repeat 4–6 times.</li></ol>
<h2>Habits that keep people alive</h2>
<ul>
<li><b>Break it down:</b> "Get to that tree. Get water boiling. Make it to sunset." Small wins build momentum.</li>
<li><b>Routines:</b> set times to check water, fire, signal, and eat. Structure fights despair.</li>
<li><b>Accept the situation fast.</b> Denial wastes daylight.</li>
<li><b>Rest before you're exhausted.</b> Fatigue causes injuries and bad choices. Sleep is a survival tool.</li>
<li><b>Keep a log</b> (<a href="#/notes">Notes</a>): times, water used, injuries, decisions.</li>
<li><b>Humor and purpose:</b> think about who you're getting home to.</li>
</ul>
<h2>In a group</h2>
<ul><li>Pick one decision‑maker, but listen to everyone.</li><li>Give everyone a job (water, fire, lookout, cook). Idle people get anxious.</li><li>Watch for withdrawal, irritability or confusion — they can be signs of dehydration, hypothermia, heat illness or low blood sugar, not just stress.</li><li>Share food and water fairly; resentment destroys groups.</li></ul>` },
    { id: 'stranded-car', title: 'Stranded in your vehicle', sum: 'Breakdowns, snow/ice, floods, heat — staying alive with your car', tags: ['car', 'vehicle', 'stranded', 'winter', 'carbon monoxide'], icon: '🚗', body: `
<h2>First moves</h2>
<ol class="steps">
<li>Get the car off the road if possible. Hazard lights on. If you're on a highway shoulder, <b>get out on the side away from traffic and stand behind the guardrail</b> — people are killed on shoulders every year.</li>
<li>Call or text for help. Give mile markers, exits, landmarks, or your <a href="#/tools/gps">GPS coordinates</a>.</li>
<li>Put out reflective triangles / flares 100–300 ft behind the car.</li>
<li>Stay with the vehicle unless help is visible and close, or the car is in danger (fire, flood water).</li>
</ol>
<h2>Cold weather</h2>
<ul>
<li>Run the engine about <b>10 minutes per hour</b> for heat. <b>Clear snow from the tailpipe</b> first and crack a downwind window — carbon monoxide (CO) is odorless and kills sleeping people.</li>
<li>Layer up, cover your head, use blankets, sleeping bag, emergency bivvy. Huddle together.</li>
<li>Move arms and legs to stay warm; don't sweat.</li>
<li>Tie a bright cloth to the antenna; at night, turn on the dome light briefly so rescuers can see you.</li>
<li>Don't eat snow (it chills you); melt it.</li>
</ul>
<h2>Hot weather (the bigger Southeast danger)</h2>
<ul>
<li>A closed car can reach 120–140°F within an hour. Never leave kids or pets inside.</li>
<li>If the car runs, use A/C in cycles to conserve fuel. Otherwise, open all doors/windows, sit in shade <i>outside</i> if it's safe, and put up a sunshade.</li>
<li>Wet a cloth and drape it on your neck; rest during 11 a.m.–4 p.m.</li>
<li>Drink to thirst, sip regularly — don't ration water to the point of heat illness.</li>
</ul>
<h2>Car sinking or in flood water</h2>
<div class="box danger"><b class="lbl">Seatbelt – Window – Children – Out</b>
<ol><li><b>Seatbelt</b> off.</li><li><b>Window</b> down or broken <i>immediately</i> (before water reaches it). Use a window punch on a side window corner — windshields are laminated and won't break.</li><li><b>Children</b> out first, oldest first so they can help.</li><li><b>Out</b> — swim to the surface and away. Don't wait for the car to fill, and don't call 911 until you're out.</li></ol></div>
<p>Never drive into flooded roads: 12 inches of moving water can float a car; 2 feet will sweep away SUVs and trucks. <b>Turn around, don't drown.</b></p>
<h2>Living out of a car short‑term</h2>
<ul><li>Crack windows ¼–½ in for ventilation and condensation; use mesh window socks for bugs.</li><li>Sunshades and blackout covers give privacy.</li><li>A 12V cooler or ice chest plus a portable power station extend comfort a lot.</li><li>Never run a generator, grill or propane heater inside or near the car.</li></ul>` },
    { id: 'first-72', title: 'The first 72 hours of a disaster', sum: 'What to do immediately after a hurricane, outage, or evacuation', tags: ['disaster', 'emergency', 'evacuation', '72 hours', 'power outage'], body: `
<h2>Immediately</h2>
<ul>
<li>Check people for injuries. Check for gas smell (leave, don't flip switches), downed power lines (stay 35+ ft away), fire, structural damage.</li>
<li>Turn off gas only if you smell it or hear a hiss (the utility must turn it back on). Turn off main electrical breaker if there's flooding.</li>
<li>Fill bathtubs, pots and jugs with tap water while it still runs (for flushing/cleaning; treat before drinking if a boil notice is issued).</li>
<li>Text family: "We're OK at ___. Plan is ___." Texts get through when calls don't.</li>
<li>Get a NOAA weather radio / AM‑FM radio on for official information.</li>
</ul>
<h2>Conserve</h2>
<ul>
<li>Phones: low‑power mode, airplane mode when not needed, brightness down. Charge from car (with engine running) or power bank.</li>
<li>Fridge: keep closed. Full freezer stays frozen ~48 h, half‑full ~24 h; fridge ~4 h. Eat perishables first, then freezer, then pantry.</li>
<li>Fuel: keep the car tank above half at all times before storms.</li>
</ul>
<h2>Evacuation</h2>
<ul><li>Know your zone and at least two routes out. Leave early — traffic is the danger.</li><li>Take: meds, documents, cash, phone & chargers, water, food, clothes, pet supplies, the <a href="#/gear">car kit</a>.</li><li>Leave a note on the door saying when you left and where you're going.</li></ul>
<h2>After</h2>
<ul><li>Most post‑hurricane deaths are from <b>carbon monoxide (generators), heat, chainsaw injuries, falls from roofs, electrocution and flood water</b> — not the storm itself.</li><li>Generators: outdoors only, 20+ ft from doors/windows, exhaust pointed away.</li><li>Flood water contains sewage, chemicals, snakes, fire ants, and hidden debris. Avoid it; wash immediately if exposed.</li></ul>` }
  ]
},
{
  id: 'water', title: 'Water', icon: '💧', color: '#5aa9c4',
  blurb: 'Find it, purify it, store it',
  articles: [
    { id: 'needs', title: 'How much water you need', sum: 'Daily needs, dehydration signs, rationing', tags: ['dehydration', 'hydration', 'how much'], body: `
<ul><li><b>Minimum:</b> 1 gallon per person per day (½ gal to drink, ½ for cooking and hygiene).</li><li><b>Hot Southeast summer or hard work:</b> 1.5–2+ gallons per day. You can sweat 1–1.5 quarts per hour.</li><li>Children, nursing mothers and sick people need more. Dogs: about 1 oz per lb of body weight per day.</li></ul>
<h2>Signs of dehydration</h2><p>Thirst, dark yellow urine, headache, fatigue, dizziness, dry mouth → confusion, rapid heart rate, very little urine (danger).</p>
<div class="box warn"><b class="lbl">Ration sweat, not water</b>Drink the water you have when you're thirsty — people have died with water still in their canteens. Instead reduce water loss: rest in shade in the heat of the day, work at dawn/dusk, keep clothes on (loose, light colored), don't smoke or drink alcohol, eat less if water is very short (digestion uses water).</div>
<p>Don't drink urine, seawater or blood — they make dehydration worse. Water from fruits (melons, citrus) counts.</p>
<p>Use the <a href="#/tools/rations">water planner</a> to calculate how much to store.</p>` },
    { id: 'finding', title: 'Finding water in the Southeast', sum: 'Rain, springs, streams, plants, and hidden sources at home', tags: ['find water', 'spring', 'rain', 'transpiration', 'water heater'], body: `
<h2>Hidden water at home or in buildings</h2>
<ul><li><b>Water heater:</b> 30–80 gallons. Turn off power/gas first, open the drain valve at the bottom (open a hot faucet to let air in). First water may have sediment — let it settle.</li><li><b>Toilet tank</b> (not bowl) — fine if no chemical cleaner was used; still purify.</li><li>Pipes: open the highest faucet, then drain from the lowest.</li><li>Ice cubes, canned vegetables/fruit juice, pool water (for washing, or treat — chlorine doesn't remove chemicals; not for drinking long‑term).</li></ul>
<div class="box info"><b class="lbl">Use the map</b>Turn on the <b>💧 Water</b> filter on the <a href="#/map">Map</a> to see thousands of named springs, waterfalls, lakes and ponds, and tap <b>Nearest water</b> for distance and direction to the closest ones.</div>
<h2>In the field</h2>
<ul>
<li>The Southeast is wet — most of the time water is abundant but <b>contaminated</b> (agricultural runoff, livestock, septic, Giardia, E. coli). Always purify.</li>
<li><b>Rain:</b> the cleanest source. Spread a tarp or poncho, funnel into containers. 1 inch of rain on a 10×10 ft tarp ≈ 60 gallons.</li>
<li><b>Springs and seeps:</b> common in Appalachian foothills and limestone regions (north Florida, TN, KY). Look at the base of slopes, cliffs, and where vegetation is unusually green.</li>
<li><b>Streams:</b> moving water is better than stagnant; collect upstream of trails, roads, farms and campsites.</li>
<li><b>Follow</b> animal trails downhill (often converge on water), birds flying low and straight at dawn/dusk, swarms of insects, green lines of trees (sycamores, willows, cypress, tupelo mark water).</li>
<li><b>Dig a seep hole:</b> in a dry creek bed on the outside of a bend, or a few feet from a muddy pond/swamp. Dig 1–2 ft; let water seep in and settle — it's pre‑filtered by sand.</li>
<li><b>Dew:</b> tie absorbent cloth around your ankles and walk through grass at dawn; wring out. Slow but useful.</li>
<li><b>Transpiration bag:</b> tie a clear plastic bag over a leafy (non‑toxic) tree branch in sun; can yield a cup or more per day.</li>
<li><b>Plants:</b> wild grape vines — cut high first then low; the vine drips clear water (don't drink milky or bitter sap).</li>
</ul>
<h2>Coastal</h2><p>Never drink seawater or brackish marsh water untreated — it must be <b>distilled</b>. Dig a hole behind the first sand dune above the high‑tide line; the first water to seep in may be fresh enough (taste a tiny amount — if salty, distill it).</p>` },
    { id: 'purify', title: 'Purifying water', sum: 'Boiling, bleach, iodine, filters, UV, sunlight, distillation', tags: ['purify', 'boil', 'bleach', 'filter', 'iodine', 'sodis', 'distill'], body: `
<div class="box ok"><b class="lbl">Best order of preference</b>1. Boil · 2. Filter + chemical · 3. Chemical alone · 4. Filter alone · 5. UV / sunlight (clear water only). Use the <a href="#/tools/water">water calculator</a> for exact doses.</div>
<h2>Step 0: Pre‑filter</h2><p>Let cloudy water settle, then pour through a bandana, coffee filter, or several layers of cloth. Chemicals and UV work much worse in murky water.</p>
<h2>Boiling</h2><p>Bring to a <b>rolling boil for 1 minute</b> (3 minutes above 6,500 ft — not an issue anywhere in the Southeast except near Mt. Mitchell). Kills all bacteria, viruses and parasites. Let cool covered. Pour between containers to improve taste.</p>
<h2>Bleach (unscented)</h2>
<div class="tbl"><table><tr><th>Water</th><th>6% bleach</th><th>8.25% bleach</th></tr><tr><td>1 quart / liter</td><td>2 drops</td><td>2 drops</td></tr><tr><td>1 gallon</td><td>8 drops (⅛ tsp)</td><td>6 drops</td></tr><tr><td>5 gallons</td><td>40 drops (½ tsp)</td><td>30 drops (⅓ tsp)</td></tr></table></div>
<p>Double for cloudy or very cold water. Stir, wait <b>30 minutes</b>. Should smell slightly of chlorine — if not, repeat and wait 15 more minutes. Bleach loses strength over time (~20% per year) — rotate it. Doesn't reliably kill <i>Cryptosporidium</i>.</p>
<h2>Iodine</h2><p>2% tincture: 5 drops per quart (10 if cloudy), wait 30 min. Tablets: follow package. Not for pregnant women, people with thyroid problems or iodine allergy, or use beyond a few weeks.</p>
<h2>Chlorine dioxide tablets/drops (Aquamira, Katadyn Micropur)</h2><p>Kill bacteria, viruses, Giardia in 30 min and <i>Cryptosporidium</i> in 4 h. Lightweight — keep a pack in every kit.</p>
<h2>Filters</h2><p>Hollow‑fiber filters (Sawyer Squeeze, LifeStraw) and ceramic filters (Berkey‑type, Katadyn) remove bacteria and protozoa (0.1–0.2 micron) but most <b>don't remove viruses</b>. In the U.S., viruses in backcountry water are low risk; near human sewage (flood water) add chemical treatment. Don't let hollow‑fiber filters freeze — it ruins them invisibly. Backflush often.</p>
<h2>SODIS (sunlight)</h2><p>Fill clear PET plastic bottles (2 L or less) with <b>clear</b> water, shake, lay on a dark or reflective surface in full sun for <b>6 hours</b> (2 days if cloudy). Works against bacteria, viruses and Giardia. Last resort but proven.</p>
<h2>Distillation (salt water, chemicals)</h2><p>The only field method that removes salt, heavy metals and many chemicals. Boil water in a pot with the lid upside down; tie a cup under the lid's handle or run a tube from a covered pot into a cooled container. Steam condenses into pure water. Slow — about a cup per hour per pot over a good fire.</p>
<h2>Solar still</h2><p>Dig a hole ~3 ft wide × 2 ft deep in sun, put a container in the center, add green plants/urine/salt water around it, cover with clear plastic sealed with soil, put a small stone in the center so it dips over the container. Yields only ~½–1 cup a day — mostly for distilling undrinkable water, not a primary source.</p>
<div class="box danger"><b class="lbl">Chemical contamination</b>Water with fuel sheen, chemical smell, or from industrial/agricultural flood areas can't be fixed by boiling, bleach or most filters. Activated carbon helps somewhat; distillation is best. Otherwise find another source.</div>` },
    { id: 'storage', title: 'Storing water', sum: 'Containers, rotation, shelf life, car storage', tags: ['storage', 'containers', 'rotate', 'drum'], body: `
<ul><li>Use food‑grade containers: commercial bottled water, 5–7 gal jugs (Reliance, Scepter), 55‑gal blue drums (home), WaterBOB bathtub liners (before storms).</li><li>Never use milk jugs (degrade and leak) or containers that held chemicals.</li><li>Clean containers: wash with soap, rinse, then sanitize with 1 tsp bleach per quart of water, shake, rinse.</li><li>Tap water from a treated municipal supply needs no extra treatment if stored sealed; rotate every 6–12 months. Untreated well water: add 8 drops 6% bleach per gallon.</li><li>Store away from sunlight, heat and chemicals (gasoline fumes penetrate plastic).</li></ul>
<h2>In a car</h2><p>Heat breaks down cheap bottles and can leach chemicals into the taste (generally not dangerous). Use sturdy 5‑gal jugs or 1‑gal containers, rotate every few months, and carry a filter + purification tablets as a backup. 7 gallons weighs ~58 lb — two 3.5‑gal jugs are easier to handle.</p>` }
  ]
},
{
  id: 'fire', title: 'Fire', icon: '🔥', color: '#e2574c',
  blurb: 'Start fire in any weather, fire lays, safety',
  articles: [
    { id: 'basics', title: 'Fire basics: tinder, kindling, fuel', sum: 'The fire triangle and how to build a fire that actually lights', tags: ['fire', 'tinder', 'kindling', 'fire lay', 'teepee', 'log cabin'], body: `
<p>Fire needs <b>heat, fuel and oxygen</b>. Most failed fires don't have enough small, dry material prepared <i>before</i> you strike a spark.</p>
<h2>Gather three piles first</h2>
<div class="tbl"><table><tr><th>Type</th><th>Size</th><th>Amount</th><th>Southeast examples</th></tr>
<tr><td>Tinder</td><td>hair‑thin</td><td>two big handfuls</td><td>dry pine needles, cedar bark shredded, cattail fluff, dead grass, birch bark (mountains), dry Spanish moss (shake out bugs/chiggers), fatwood shavings, cotton balls with Vaseline, dryer lint</td></tr>
<tr><td>Kindling</td><td>pencil‑lead to thumb</td><td>an armload</td><td>dead twigs that <b>snap</b> (if they bend, they're wet), split sticks, feather sticks</td></tr>
<tr><td>Fuel</td><td>wrist and bigger</td><td>2–3× what you think</td><td>dead standing wood (off the ground), split logs. Oak and hickory burn long and hot; pine lights fast but sooty.</td></tr></table></div>
<h2>Fire lays</h2>
<ul><li><b>Teepee:</b> tinder in center, kindling leaned around it. Lights easily, burns fast and hot — good for starting and boiling.</li><li><b>Log cabin:</b> teepee inside a square of crossed sticks. Steady, good coals for cooking.</li><li><b>Lean‑to:</b> push a green stick into the ground at 30°, tinder underneath, lean kindling on it. Good in wind.</li><li><b>Platform:</b> on wet ground or snow, lay a floor of green or dead sticks first.</li><li><b>Star fire:</b> long logs pushed in from the edges as they burn — saves cutting.</li></ul>
<h2>Lighting</h2><ol class="steps"><li>Shield from wind with your body or a log.</li><li>Light the tinder on the upwind side, low.</li><li>Feed the smallest kindling first, slowly; don't smother it.</li><li>Blow gently at the base to feed oxygen.</li><li>Add bigger pieces only when the previous size is burning well.</li></ol>
<h2>Southeast secret weapon: fatwood ("lighter wood", "lighter knot")</h2><p>Resin‑soaked heartwood from old pine stumps and limb joints. Smells strongly of turpentine, looks amber/red and is heavy. Shavings light from a spark even when wet. Look in old dead pine stumps — kick them apart.</p>` },
    { id: 'methods', title: 'Ways to start a fire', sum: 'Lighter, ferro rod, battery, magnifier, bow drill', tags: ['ferro rod', 'bow drill', 'lighter', 'battery steel wool', 'magnifying glass', 'char cloth'], body: `
<p>Carry at least three: a <b>BIC lighter</b>, <b>storm‑proof matches</b> in a waterproof case, and a <b>ferro rod</b>. Primitive methods are a last resort — practice them before you need them.</p>
<h3>Ferro rod</h3><p>Hold the striker still over the tinder and pull the <b>rod back</b> (so you don't knock the tinder apart). Use firm pressure and a sharp 90° spine of a knife or the striker. Works wet. Needs fine tinder (cotton/Vaseline, fatwood dust, cattail fluff).</p>
<h3>Battery + steel wool</h3><p>Touch both terminals of a 9V battery to fine (#0000) steel wool, or bridge AA/flashlight battery ends with a strip. Glows instantly — put it into a tinder bundle and blow.</p>
<h3>Phone/car battery</h3><p>Car battery + jumper cables: touch clamps together briefly onto steel wool or gum wrapper foil over tinder. Big sparks — keep face away and never near the battery itself (hydrogen gas).</p>
<h3>Magnifying glass / lens / clear bottle of water</h3><p>Focus sunlight to the smallest bright dot on dark tinder or char cloth. Eyeglasses for farsightedness work; a clear water bottle or bag of water can work in strong sun.</p>
<h3>Bow drill</h3><ol class="steps"><li>Board and spindle from the same dry, soft, non‑resinous wood: <b>cedar, cypress, basswood, tulip poplar, willow, sycamore roots, yucca</b>.</li><li>Spindle: straight, thumb‑thick, ~8 in long, pointed top, blunt bottom.</li><li>Bow: arm‑length stick with slight curve; cord (paracord, shoelace) loose enough to wrap the spindle once.</li><li>Handhold: a rock with a dimple or hardwood block; lubricate with leaf/skin oil.</li><li>Burn a socket into the board, then cut a V notch to its center. Put a leaf or bark under the notch.</li><li>Steady long strokes, increasing speed and pressure until heavy smoke rolls. Keep going 10–20 more strokes.</li><li>Gently tap the glowing coal onto your tinder bundle, fold and blow softly until it flames.</li></ol>
<h3>Char cloth</h3><p>100% cotton cloth heated in a closed tin with a small hole until smoke stops — catches the faintest spark. See <a href="#/a/make/charcloth">Make char cloth</a>.</p>` },
    { id: 'wet', title: 'Fire in rain and wet conditions', sum: 'Finding dry wood when everything is soaked', tags: ['wet', 'rain', 'damp', 'humid'], body: `
<ul><li>Dead branches still attached to trees ("squaw wood") and dead standing trees are drier than anything on the ground.</li><li>Split wood — the inside of a wet log is often dry. Baton a knife through it.</li><li>Make <b>feather sticks</b>: shave thin curls down a dry split stick, leaving them attached.</li><li>Look under dense evergreens, rock overhangs, inside hollow logs, under fallen trees.</li><li>Fatwood, birch bark (mountains), and cedar inner bark burn when damp.</li><li>Build on a platform of sticks, with a tarp or poncho rigged overhead (high enough not to melt).</li><li>Bring help: Vaseline cotton balls, commercial fire starters, a candle stub (holds a flame for minutes), road flare (lights anything).</li><li>Once burning, stack wet wood around (not on) the fire to dry it.</li></ul>` },
    { id: 'safety', title: 'Fire safety & special fires', sum: 'Dakota fire hole, keeping coals, extinguishing, CO', tags: ['dakota fire hole', 'safety', 'carbon monoxide', 'burn ban'], body: `
<ul><li>Clear a 10‑ft circle down to bare soil. Never under overhanging branches or against tree roots (roots can smolder underground for days).</li><li>Check burn bans — Southeast droughts make wildfires common.</li><li>Keep water/dirt nearby. To put out: <b>drown, stir, drown, feel</b> — it should be cold to touch.</li><li>Never burn charcoal, use grills, heaters or generators inside tents, cars or houses — carbon monoxide kills silently.</li></ul>
<h2>Dakota fire hole</h2><p>Dig a hole 1 ft wide and 1 ft deep; dig a second, smaller air hole 1 ft away upwind and tunnel it into the bottom of the first. Burns hot and efficient with little smoke and light, is hard to see, and holds a pot well. Good in wind.</p>
<h2>Carrying fire</h2><p>Wrap a glowing coal in dry punky wood, fungus (tinder conk, chaga), or dry grass inside a can or bark; it can smolder for hours.</p>
<h2>Reflector</h2><p>Build a wall of green logs or rocks behind your fire to reflect heat toward your shelter.</p>` }
  ]
},
{
  id: 'shelter', title: 'Shelter', icon: '⛺', color: '#7fae5a',
  blurb: 'Stay warm, dry and cool; tarp and natural shelters',
  articles: [
    { id: 'site', title: 'Choosing a campsite', sum: 'Avoid widowmakers, floods, bugs, lightning', tags: ['campsite', 'site selection', 'flood', 'widowmaker'], body: `
<ul>
<li><b>Look up:</b> no dead trees or hanging branches ("widowmakers"). Southeast storms drop them constantly.</li>
<li><b>Look down:</b> not in dry creek beds, ravines or low spots — flash floods and cold air pool there. Avoid fire ant mounds, game trails, and thick brush (snakes, ticks).</li>
<li><b>Water nearby</b> but 200 ft away from it (bugs, flooding, animals, privacy).</li>
<li>Slight rise with natural windbreak in winter; breezy, shaded spot in summer (breeze also reduces mosquitoes).</li>
<li>Avoid lone tall trees, ridgetops and open fields in thunderstorms.</li>
<li>In hurricane/storm conditions, stay away from tall pines (they snap) and coastal surge areas.</li>
</ul>` },
    { id: 'tarp', title: 'Tarp shelters', sum: 'A-frame, lean-to, plow point, hammock setups', tags: ['tarp', 'a-frame', 'lean-to', 'hammock', 'ridgeline'], body: `
<p>An 8×10 or 10×12 ft tarp plus 50 ft of paracord makes the most versatile shelter you can carry.</p>
<h2>Ridgeline</h2><p>Tie a cord tight between two trees about chest height (lower for wind/rain). Use a bowline on one end and a <a href="#/a/knots/truckers">trucker's hitch</a> to tension the other. Throw the tarp over and stake or tie out corners with <a href="#/a/knots/taut-line">taut‑line hitches</a>.</p>
<ul>
<li><b>A‑frame:</b> tarp over the ridgeline, both sides staked low. Best rain protection.</li>
<li><b>Lean‑to:</b> one edge tied to the ridgeline, other edge staked to the ground facing away from wind; fire in front with a reflector. Good in cool dry weather.</li>
<li><b>Plow point / diamond:</b> one corner high on a tree, opposite corner staked, sides staked — quick, wind‑resistant, one‑person.</li>
<li><b>Hammock + tarp:</b> ideal for the Southeast — off the wet ground, away from crawling bugs, and cooler in summer. Use tree‑saver straps and a bug net. In cold weather you need an underquilt or pad (cold air underneath steals heat).</li>
</ul>
<p>Always put a ground sheet (garbage bag, emergency blanket, second tarp) under you; the ground steals heat fast.</p>` },
    { id: 'natural', title: 'Natural shelters', sum: 'Debris hut and lean-to with no gear', tags: ['debris hut', 'natural shelter', 'no gear'], body: `
<h2>Debris hut (cold weather, no gear)</h2>
<ol class="steps"><li>Find a ridgepole ~2 ft longer than you are. Prop one end on a stump, rock or forked stick at hip height; the other end on the ground.</li><li>Lean sticks along both sides close together, making a narrow tent just big enough to lie in.</li><li>Pile leaves, pine needles, grass on top — <b>at least 2–3 ft thick</b> (an arm's length). Thicker = warmer.</li><li>Stuff the inside with a thick bed of dry leaves (6+ in compressed) — insulation under you matters most.</li><li>Pull a pile of leaves into the doorway behind you.</li></ol>
<p>A good debris hut can keep you alive near freezing with no sleeping bag. Takes 2–3 hours — start well before dark.</p>
<h2>Lean‑to with fire</h2><p>Ridgepole across two trees or forked sticks; lean poles from it to the ground; thatch with pine boughs, palmetto fronds (excellent in Florida/coastal areas), or bark, starting at the bottom and overlapping like shingles. Build a long fire 3–4 ft in front with a reflector wall behind it.</p>
<h2>Other quick shelters</h2><ul><li>Under a large fallen tree or rock overhang (check for snakes, wasps, loose rock).</li><li>Your car is the best emergency shelter you have.</li><li>Emergency space blanket + trash bags = a basic waterproof layer.</li></ul>` },
    { id: 'temperature', title: 'Staying warm and staying cool', sum: 'Heat loss, layering, sleeping warm, beating Southeast heat', tags: ['warm', 'cool', 'layers', 'cotton kills', 'insulation', 'heat'], body: `
<h2>Staying warm</h2>
<ul><li><b>"Cotton kills":</b> wet cotton loses all insulation. Wear wool or synthetics in cool/wet weather.</li><li>Layers: base (wicking), mid (fleece/wool), shell (wind/rain).</li><li>Cover your head and neck; stay dry — <b>vent before you sweat</b>.</li><li>Insulate from the ground: pad, leaves, branches, backpack, car floor mats.</li><li>Eat fatty food before sleep; keep a bottle of hot water (sealed Nalgene) in your sleeping bag.</li><li>Do a few sit‑ups before bed; pee before sleeping (your body wastes heat keeping it warm).</li><li>Southeast winters are often 35–50°F and wet — the most dangerous conditions for hypothermia.</li></ul>
<h2>Staying cool</h2>
<ul><li>Shade first. Rest 11 a.m.–4 p.m.; work at dawn and dusk.</li><li>Loose, light‑colored, long‑sleeve clothing; wide‑brim hat.</li><li>Wet clothing/bandana evaporative cooling; soak feet in a creek.</li><li>Sleep in a hammock or off the ground for airflow.</li><li>Dig down — the ground a foot below the surface is cooler.</li><li>Watch for heat exhaustion in everyone. See <a href="#/a/firstaid/heat">Heat illness</a>.</li></ul>` }
  ]
},
{
  id: 'navigation', title: 'Navigation', icon: '🧭', color: '#5aa9c4',
  blurb: 'Map & compass, no-tech direction finding, when lost',
  articles: [
    { id: 'lost', title: 'If you are lost', sum: 'What to do the moment you realize you are lost', tags: ['lost', 'STOP', 'hug a tree', 'children'], body: `
<ol class="steps"><li><b>Stop</b> moving. Most lost people make things worse by walking farther.</li><li>Check your <a href="#/tools/gps">GPS</a> and <a href="#/map">map</a>. Look at your saved waypoints and track — use <b>Back‑track</b> to follow your recorded path.</li><li>Think back: where did you last know your position? How long and which direction have you traveled?</li><li>Climb to a high point (safely) to look for roads, power lines, water, buildings, smoke.</li><li>If you can't confidently find your way: <b>stay put</b>, make yourself visible and audible (3 whistle blasts), build shelter and fire before dark.</li></ol>
<h2>Handrails and backstops</h2><p>If you must move, follow a <b>handrail</b> — a linear feature like a stream (downstream usually leads to roads and people), a road, power line or ridge. Use a <b>baseline</b>: if you know a big road runs north‑south to your east, walk east until you hit it ("aiming off").</p>
<div class="box info"><b class="lbl">Teach kids</b>"Hug a tree": if lost, stay in one place, make noise with a whistle, and answer when people call your name — kids often hide from searchers.</div>` },
    { id: 'map-compass', title: 'Using a map & compass', sum: 'Bearings, declination, triangulation', tags: ['compass', 'map', 'bearing', 'declination', 'triangulation', 'topographic'], body: `
<h2>Parts of a baseplate compass</h2><p>Direction‑of‑travel arrow, rotating bezel (degree ring), orienting arrow and lines (inside the housing), and the magnetic needle (red = north).</p>
<h2>Declination in the Southeast</h2><p>Compass needles point to magnetic north, not true (map) north. The difference is <b>declination</b>. Approximate values (2025–2027; changes slowly):</p>
<div class="tbl"><table><tr><th>Area</th><th>Declination</th></tr><tr><td>Louisiana, Arkansas, W. Mississippi</td><td>0–2° W</td></tr><tr><td>Memphis, Jackson MS</td><td>~1.5–2° W</td></tr><tr><td>Alabama, middle Tennessee, Florida panhandle</td><td>3–4.5° W</td></tr><tr><td>Atlanta, Louisville, Knoxville</td><td>5–6° W</td></tr><tr><td>Miami, Orlando, Jacksonville</td><td>6–7° W</td></tr><tr><td>Charlotte, Charleston SC, Asheville</td><td>7–8° W</td></tr><tr><td>Raleigh, W. Virginia</td><td>8.5–9.5° W</td></tr><tr><td>Richmond, Norfolk VA</td><td>10–11° W</td></tr></table></div>
<p>The <a href="#/tools/compass">Compass tool</a> estimates it from GPS. Topo maps print the declination in the margin.</p>
<p><b>With west declination:</b> map (true) → compass (magnetic): <b>add</b> declination. Compass → map: <b>subtract</b>. Memory aid: "<i>West is best (add), east is least (subtract)</i>" going map‑to‑compass. Easiest: buy a compass with adjustable declination and set it once.</p>
<h2>Take a bearing from the map</h2><ol class="steps"><li>Put the compass edge along the line from where you are to where you want to go, direction arrow pointing to the destination.</li><li>Turn the bezel until its orienting lines align with the map's north–south grid lines (N up).</li><li>Read the bearing at the index line. Adjust for declination.</li><li>Hold the compass flat in front of you, turn your body until the red needle sits inside the orienting arrow ("<b>red in the shed</b>"). Walk where the direction arrow points.</li></ol>
<h2>Walking a bearing</h2><p>Sight along the arrow to a distinct landmark (tree, rock), walk to it, repeat. Count paces to track distance (about 2,000–2,200 steps per mile; count each time your left foot lands ≈ 1,000–1,100 per mile).</p>
<h2>Find your position (triangulation)</h2><ol class="steps"><li>Identify two or three landmarks you can see that are also on the map (peak, tower, lake end).</li><li>Take a bearing to each. Convert to true bearing; add or subtract 180° to get the back‑bearing.</li><li>Draw a line from each landmark on the map along its back‑bearing. You're where the lines cross.</li></ol>` },
    { id: 'natural', title: 'Finding direction without a compass', sum: 'Sun, shadow stick, watch, stars, moon', tags: ['north star', 'shadow stick', 'sun', 'watch method', 'stars', 'polaris', 'orion'], body: `
<h2>The sun</h2><p>Rises roughly east, sets roughly west (more northeast/northwest in summer, southeast/southwest in winter). At solar noon (about 1 p.m. daylight time) it's due south in the Southeast U.S., and your shadow points due north. Get exact solar noon from the <a href="#/tools/sun">Sun tool</a>.</p>
<h2>Shadow stick (most reliable)</h2><ol class="steps"><li>Push a 3‑ft stick upright into flat ground.</li><li>Mark the tip of its shadow with a pebble.</li><li>Wait 15–30 minutes. Mark the new shadow tip.</li><li>A line from the first mark to the second runs <b>west → east</b>. Stand with the first mark on your left and the second on your right: you're facing north.</li></ol>
<h2>Analog watch method</h2><p>Hold the watch flat, point the <b>hour hand</b> at the sun. Halfway between the hour hand and 12 (use <b>1</b> during daylight saving time) is <b>south</b>. Draw a watch face on paper if you only have a digital watch.</p>
<h2>North Star (Polaris)</h2><p>Find the Big Dipper. The two stars at the end of the "cup" point to Polaris, about 5× the distance between them. Polaris sits at the end of the Little Dipper's handle and is due north (within 1°). Its height above the horizon ≈ your latitude (~25–39° in the Southeast). If the Big Dipper is low, use Cassiopeia (the "W") on the opposite side.</p>
<h2>Orion</h2><p>Visible in winter. The top star of Orion's belt (Mintaka) rises almost exactly due east and sets due west. The sword hangs toward the south.</p>
<h2>Moon</h2><p>If the moon rises before the sun has set, the lit side faces west. If it rises after midnight, the lit side faces east. Rough guide only.</p>
<div class="box warn"><b class="lbl">Myths</b>"Moss grows on the north side" is unreliable in the humid Southeast — moss grows wherever it's shady and damp.</div>` },
    { id: 'gps', title: 'GPS, coordinates & reading grid references', sum: 'Lat/long, UTM, MGRS explained; making your phone a GPS', tags: ['gps', 'utm', 'mgrs', 'latitude', 'longitude', 'coordinates'], body: `
<p>Your phone's GPS works with <b>no cell service and no internet</b> — it receives satellite signals directly. You just need a map stored on the device (this app's <a href="#/map">built‑in map</a>, or saved topo tiles).</p>
<h2>Saving battery while navigating</h2><ul><li>Airplane mode with Location Services still on — GPS still works and battery lasts 2–4× longer.</li><li>Lower brightness; open the app only to check position.</li><li>Carry a power bank; cold drains lithium batteries — keep your phone in an inner pocket.</li></ul>
<h2>Coordinate formats</h2>
<ul><li><b>Decimal degrees:</b> 33.74900, −84.38800. Negative longitude = west. 5 decimals ≈ 1 m precision.</li><li><b>Degrees‑minutes‑seconds:</b> 33°44'56.4"N 84°23'16.8"W.</li><li><b>Degrees‑decimal minutes:</b> N33° 44.940' W84° 23.280' (used by marine & aviation).</li><li><b>UTM:</b> 16S 741234E 3737123N — zone, then meters east and north. Great with topo maps: each grid square is 1 km.</li><li><b>MGRS/USNG:</b> 16S GC 41234 37123 — the military/emergency‑services version of UTM. 10 digits = 1 m, 8 = 10 m, 6 = 100 m. Many search & rescue teams use USNG.</li></ul>
<p>Read grids "<b>right, then up</b>" (easting first, then northing). The <a href="#/tools/convert">coordinate converter</a> translates any format.</p>
<h2>Datum</h2><p>This app uses WGS84 (same as all GPS). Older USGS topo maps use NAD27 — positions can differ by up to ~50 m in the Southeast. Check the map margin.</p>` },
    { id: 'terrain', title: 'Reading terrain & topo maps', sum: 'Contour lines, ridges, draws, and route planning', tags: ['topo', 'contour', 'terrain', 'elevation', 'route'], body: `
<ul><li><b>Contour lines</b> connect points of equal elevation. Close together = steep; far apart = gentle.</li><li><b>V's pointing uphill</b> are valleys/streams ("V points to the source"). <b>U's or V's pointing downhill</b> are ridges/spurs.</li><li><b>Concentric circles</b> are hilltops; circles with hash marks are depressions (sinkholes — common in FL, TN, KY).</li><li>Colors on USGS maps: green = vegetation, white = open, blue = water, brown = contours, red/black = roads & structures, purple = updates.</li></ul>
<h2>Route planning</h2><ul><li>Walking speed: ~2–3 mph on trail, 1 mph in thick brush or swamp. Add 1 hour per 1,000 ft of climb (Naismith's rule).</li><li>Southeast specifics: rhododendron/laurel "hells" in Appalachia can be nearly impassable — go around. Swamps and blackwater rivers: travel on high ground at edges; watch for alligators south of ~NC.</li><li>Ridges are easier to walk and navigate than drainages, but more exposed to lightning.</li></ul>
<p>Use the <a href="#/map">Map</a> layer menu to save USGS topo maps of your area while you have internet.</p>` }
  ]
},
{
  id: 'signal', title: 'Signaling & Comms', icon: '📡', color: '#c38bd6',
  blurb: 'Get found: signals, radios, frequencies, phones',
  articles: [
    { id: 'signals', title: 'Signals for rescue', sum: 'Mirror, whistle, fire, ground-to-air codes', tags: ['signal', 'mirror', 'whistle', 'sos', 'ground to air', 'smoke'], body: `
<div class="box info"><b class="lbl">Three is distress</b>3 whistle blasts, 3 fires in a triangle, 3 flashes, 3 gunshots. Repeat at intervals. The reply is 2 signals.</div>
<h2>Signal mirror</h2><ol class="steps"><li>Hold the mirror near your eye; extend your other arm with a "V" made by two fingers.</li><li>Put the target (plane, boat, distant hill) inside the V.</li><li>Tilt the mirror so the sun's spot of light lands on your fingers, then rock it slightly so it flashes across the target.</li></ol><p>Visible 10–20+ miles. Any shiny object works: CD, phone screen, car mirror, foil.</p>
<h2>Fire & smoke</h2><p>Keep a signal fire ready to light in an open area. White smoke (add green leaves, grass) shows on dark forest; black smoke (rubber, oil) shows on light backgrounds. At night, bright flames.</p>
<h2>Ground‑to‑air signals</h2><p>Make symbols at least 10–20 ft long, with high contrast (logs on sand, trenches in grass, bright clothing, rocks):</p>
<div class="tbl"><table><tr><th>Symbol</th><th>Meaning</th></tr><tr><td><b>V</b></td><td>Require assistance</td></tr><tr><td><b>X</b></td><td>Require medical assistance</td></tr><tr><td><b>→</b></td><td>Proceeding in this direction</td></tr><tr><td><b>Y</b> / <b>N</b></td><td>Yes / No</td></tr><tr><td><b>SOS</b></td><td>Distress</td></tr></table></div>
<p>A pilot acknowledges by rocking wings or flashing lights.</p>
<h2>Body signals to aircraft</h2><p>Both arms raised in a Y = "Yes / need help / pick us up". One arm up, one down diagonally (like an N) = "No / don't need help".</p>
<h2>Light</h2><p>Use the <a href="#/tools/sos">SOS light</a>, a flashlight strobe, or car headlights/hazards. At night a light is visible for miles.</p>` },
    { id: 'radio', title: 'Radios & emergency frequencies', sum: 'FRS/GMRS, CB, ham, NOAA weather, marine', tags: ['radio', 'frequency', 'ham', 'gmrs', 'frs', 'cb', 'noaa', 'weather radio', 'marine', 'channel'], body: `
<div class="tbl"><table><tr><th>Service</th><th>Emergency / calling channel</th><th>Notes</th></tr>
<tr><td>NOAA Weather Radio</td><td>162.400–162.550 MHz (7 channels)</td><td>Receive‑only. 24/7 forecasts and alerts. Every kit should have one (hand‑crank/solar models).</td></tr>
<tr><td>FRS (family radios)</td><td>Ch 1 / Ch 3 informal; many use Ch 1</td><td>No license. 0.5–2 W, ~0.5–2 miles real‑world.</td></tr>
<tr><td>GMRS</td><td>Ch 20 (462.675 MHz) — traveler assistance & unofficial emergency; repeaters</td><td>$35 FCC license, no test, covers family, 10 years. Up to 50 W; repeaters reach 20–50+ miles.</td></tr>
<tr><td>CB radio</td><td><b>Ch 9</b> = emergency; Ch 19 = truckers/highway info</td><td>No license. ~1–5 miles; great on highways.</td></tr>
<tr><td>Amateur (ham) 2 m</td><td><b>146.520 MHz</b> national simplex calling</td><td>License required to transmit (Technician exam is easy), but in a true life‑threatening emergency anyone may transmit on any frequency.</td></tr>
<tr><td>Ham 70 cm</td><td>446.000 MHz calling</td><td>Local repeaters give much wider coverage.</td></tr>
<tr><td>Marine VHF</td><td><b>Ch 16</b> (156.800 MHz) distress & calling</td><td>Monitored by the Coast Guard along the coast and Intracoastal Waterway.</td></tr>
<tr><td>AM/FM broadcast</td><td>Local news stations</td><td>Emergency Alert System updates during disasters.</td></tr></table></div>
<h2>Calling for help on a radio</h2><p>"<b>Mayday, Mayday, Mayday</b>" (life‑threatening) or "<b>Pan‑pan</b>" (urgent but not life‑threatening). Then: who you are, where (coordinates/landmarks), what happened, how many people, what you need. Repeat, then listen.</p>
<h2>Range tips</h2><ul><li>Height matters more than power: get to a hilltop, open area, or vehicle roof.</li><li>Use external antennas on vehicles.</li><li>Agree on a family "comms plan": channel, check‑in times (e.g. on the hour for 5 minutes), and a backup channel.</li></ul>` },
    { id: 'phone', title: 'Getting help with a phone', sum: '911 without service, texting, satellite SOS', tags: ['911', 'phone', 'text', 'satellite', 'sos', 'plb'], body: `
<ul>
<li><b>911 works without a SIM or plan</b> on any carrier that has a signal, even if it's not yours.</li>
<li><b>Text 911</b> is available in most Southeast counties. Texts need far less signal than calls.</li>
<li><b>iPhone 14 and newer: Emergency SOS via satellite</b> works with no cell service in the continental U.S. — call 911, and if it fails tap “Emergency Text via Satellite.” Practice with the demo in Settings → Emergency SOS. Many newer Android phones have similar features.</li>
<li>Climb higher or move to open areas for a signal. Try at different times — towers may come back.</li>
<li>Send your coordinates: in this app, <a href="#/tools/gps">My position → Copy</a>, then paste into a text.</li>
<li>Set up Medical ID and emergency contacts in your phone's Health / Emergency settings.</li>
<li>If battery is low: send one text with location, then turn the phone off and check at set times.</li>
</ul>
<h2>Dedicated devices</h2><ul><li><b>PLB (Personal Locator Beacon)</b>: ACR, Ocean Signal. No subscription, sends SOS + GPS to rescue services worldwide. Register it with NOAA (free).</li><li><b>Satellite messengers</b> (Garmin inReach, Zoleo): two‑way texting from anywhere; subscription.</li></ul>` }
  ]
},
{
  id: 'weather', title: 'Weather & Disasters', icon: '🌪️', color: '#8fa3b8',
  blurb: 'Hurricanes, tornadoes, floods, lightning, heat, ice',
  articles: [
    { id: 'hurricane', title: 'Hurricanes & tropical storms', sum: 'Before, during and after — the Southeast\'s biggest threat', tags: ['hurricane', 'tropical storm', 'storm surge', 'evacuation'], body: `
<p>Season: <b>June 1 – November 30</b>, peak mid‑August to mid‑October. Water (storm surge and inland flooding) causes most deaths, not wind.</p>
<h2>Watches & warnings</h2><ul><li><b>Watch:</b> conditions possible within 48 hours — finish preparations.</li><li><b>Warning:</b> conditions expected within 36 hours — evacuate if told to.</li></ul>
<h2>Before</h2><ul><li>Know your evacuation zone. "Run from water, hide from wind."</li><li>Fill gas tanks, propane, prescriptions; get cash.</li><li>Water: 1 gal/person/day for 7–14 days. Fill tubs for flushing.</li><li>Secure or bring in outdoor items; board/shutter windows (tape does nothing).</li><li>Photograph your home and belongings for insurance; put documents in waterproof bags.</li><li>Freeze water jugs to keep food cold longer.</li></ul>
<h2>During</h2><ul><li>Stay in an interior room on the lowest floor that won't flood, away from windows.</li><li>The calm <b>eye</b> can last minutes to an hour — the other side of the storm comes from the opposite direction. Don't go out.</li><li>If water rises, go up — but not into a closed attic without a way out (take an axe/saw to cut through the roof).</li></ul>
<h2>After</h2><ul><li>Avoid flood water and downed lines. Watch for snakes, fire ants (floating rafts), alligators displaced by water.</li><li>Generators outdoors only, 20+ ft from the house.</li><li>Chainsaws: wear chaps, eye/ear protection; watch for spring poles (bent trees under tension).</li><li>Tarp damaged roofs only if safe — falls are a major cause of post‑storm injury.</li><li>Throw out food touched by flood water and refrigerated food above 40°F for 2+ hours.</li></ul>` },
    { id: 'tornado', title: 'Tornadoes', sum: 'Warning signs and where to shelter — home, car, outdoors', tags: ['tornado', 'dixie alley', 'shelter', 'warning signs'], body: `
<p>The Southeast ("Dixie Alley") has many deadly tornadoes because they often come at night, are rain‑wrapped and hard to see, and many people live in mobile homes. Peak: March–May, plus a second season in November–December, and with hurricanes.</p>
<h2>Warning signs</h2><ul><li>Dark, often greenish sky; large hail; a loud roar like a freight train; a low, rotating wall cloud; sudden calm after a storm; debris falling.</li></ul>
<h2>Where to go</h2><ul><li><b>Home:</b> basement or storm shelter; otherwise interior room or closet on the lowest floor, away from windows. Get under something sturdy; cover your head and neck with arms, mattress, or <b>helmets</b> (bike/sports helmets save lives). Wear shoes.</li><li><b>Mobile home:</b> leave — go to a sturdy building or community shelter before the storm arrives. Mobile homes are deadly even when tied down.</li><li><b>In a car:</b> if you can drive away at right angles to the tornado's path, do it. If debris is flying: stay buckled, get head below windows, cover with your arms/coat — or get into a ditch or low area away from the car and cover your head. <b>Never</b> shelter under an overpass.</li><li><b>Outdoors:</b> lie flat in a ditch or low spot, cover your head.</li></ul>` },
    { id: 'flood', title: 'Floods & flash floods', sum: 'Turn around, don\'t drown — and crossing water safely', tags: ['flood', 'flash flood', 'river crossing', 'water crossing'], body: `
<ul><li>Most flood deaths are people in vehicles. <b>6 inches</b> of moving water can knock you down; <b>12 inches</b> floats most cars; <b>2 ft</b> sweeps away SUVs and trucks.</li><li>Roads under water may be washed out underneath.</li><li>Move to higher ground immediately if flash flood warnings are issued or water rises quickly. In mountains (western NC, eastern TN, WV, eastern KY), flash floods can rise 10+ feet in minutes.</li><li>Never camp in creek beds or narrow valleys when rain is possible upstream.</li></ul>
<h2>If you must cross a stream on foot</h2><ol class="steps"><li>Scout for the widest, shallowest section with slower water; avoid just above rapids, logjams or strainers (downed trees).</li><li>Unbuckle your pack hip belt so you can shed it.</li><li>Keep shoes on. Face upstream, use a sturdy stick as a third leg; move one point of contact at a time.</li><li>Groups: link arms in a line parallel to the current, or a huddle.</li><li>If swept away: float on your back, feet downstream and up, steer toward shore at an angle. Never stand up in fast water (foot entrapment).</li></ol>
<p>If water is above your knees and fast, <b>don't cross</b>.</p>` },
    { id: 'lightning', title: 'Thunderstorms & lightning', sum: '30-30 rule, lightning crouch, where to shelter', tags: ['lightning', 'thunderstorm', '30-30', 'storm'], body: `
<p>Florida is the lightning capital of the U.S.; summer afternoon thunderstorms are near daily across the Southeast.</p>
<ul><li><b>"When thunder roars, go indoors."</b> If you hear thunder you're within striking distance (10 miles).</li><li><b>30‑30 rule:</b> count seconds from flash to thunder — under 30 s, take shelter. Wait <b>30 minutes</b> after the last thunder before going out.</li><li>Safe: enclosed buildings with plumbing/wiring, hard‑topped metal vehicles (windows up).</li><li>Not safe: tents, open shelters, picnic pavilions, under lone trees, open fields, water, ridgetops.</li></ul>
<h2>Caught outside</h2><ul><li>Get off high ground and out of water. Avoid tall isolated objects and metal fences.</li><li>Group members spread out 50+ ft apart so one strike can't hit everyone.</li><li>As a last resort if you feel your hair stand up: crouch on the balls of your feet, feet together, head down, hands over ears. Don't lie flat.</li></ul>
<p>Lightning victims don't carry a charge — help them immediately. Start <a href="#/a/firstaid/cpr">CPR</a> if they aren't breathing; many can be saved.</p>` },
    { id: 'heatwave', title: 'Extreme heat', sum: 'Heat index, protecting people and pets without power', tags: ['heat wave', 'heat index', 'no power', 'cooling'], body: `
<p>Heat is the deadliest weather hazard in the U.S. Southeast humidity stops sweat from cooling you — watch the <b>heat index</b>, not just temperature. Heat index above 103°F = danger; above 125°F = extreme danger.</p>
<ul><li>Drink water regularly; eat salty snacks or use electrolyte mix if sweating heavily for hours.</li><li>Without power: cool, wet towels on neck/armpits; spray bottle + fan (even a battery fan); cool showers; spend the hottest hours in the coolest place (basement, shaded north side, a car with A/C running briefly, public cooling centers).</li><li>Block sun on windows during day; open windows at night for cross‑ventilation.</li><li>Check on elderly people, infants, people on medications (diuretics, antipsychotics, beta‑blockers increase risk).</li><li>Pets: shade, water, never in cars. Hot pavement burns paws (if you can't hold your hand on it for 7 seconds, it's too hot).</li></ul>
<p>See <a href="#/a/firstaid/heat">Heat exhaustion & heat stroke</a>.</p>` },
    { id: 'winter', title: 'Ice storms & winter storms', sum: 'Southern ice storms, power outages in the cold', tags: ['ice storm', 'winter', 'snow', 'freezing', 'pipes'], body: `
<p>Southern winter storms are usually ice, not snow — power lines and trees come down for days, and roads are dangerous because few areas have salt trucks.</p>
<ul><li>Stay off the roads. Black ice forms first on bridges and overpasses.</li><li>Pick one room to heat; close doors, hang blankets over doorways and windows, gather everyone in there.</li><li>Safe heat: wood stoves/fireplaces (vented), indoor‑rated propane heaters (Mr. Heater Buddy) with ventilation and a <b>CO alarm</b>. Never use grills, camp stoves, or ovens to heat a home.</li><li>Prevent frozen pipes: drip faucets, open cabinet doors under sinks. If power will be out for days in hard freeze, shut off the main and drain the lines.</li><li>Dress in layers including hats, even indoors; sleep in sleeping bags together.</li></ul>` },
    { id: 'wildfire', title: 'Wildfire & smoke', sum: 'Evacuating, if trapped, smoke protection', tags: ['wildfire', 'forest fire', 'smoke', 'evacuate'], body: `
<p>Southeast wildfires happen in droughts, especially in Florida, Georgia pinelands and the southern Appalachians (Gatlinburg 2016).</p>
<ul><li>Evacuate early when told. Drive with headlights on, windows up, A/C on recirculate.</li><li>If trapped in a car: park in an area clear of vegetation, keep engine running, windows up, lie on the floor covered with a wool blanket or coat. The car will protect you better than running.</li><li>On foot: go to an area with no fuel — a plowed field, road, wide creek, large rock area, or already‑burned ground. Lie face down, cover yourself with soil or a non‑synthetic blanket. Fire moves fastest <b>uphill</b>; don't flee uphill ahead of it.</li><li>Smoke: N95 masks (not cloth) protect your lungs. Stay indoors with windows closed; a box fan with a MERV‑13 filter taped on makes a cheap air purifier.</li></ul>` },
    { id: 'earthquake', title: 'Earthquakes (New Madrid & East TN)', sum: 'Drop, cover, hold on', tags: ['earthquake', 'new madrid'], body: `
<p>The New Madrid seismic zone (where Arkansas, Missouri, Tennessee and Kentucky meet) and the East Tennessee zone can produce damaging quakes; Charleston SC had a major one in 1886.</p>
<ul><li><b>Drop</b> to hands and knees, <b>Cover</b> head and neck under a sturdy table, <b>Hold on</b> until shaking stops. Don't run outside during shaking — falling bricks and glass kill people at exits.</li><li>In bed: stay there, cover your head with a pillow.</li><li>Driving: pull over away from bridges, overpasses, power lines; stay in the car.</li><li>After: expect aftershocks. Check for gas leaks, fires, damaged chimneys. Use the stairs, not elevators.</li></ul>` },
    { id: 'signs', title: 'Reading the weather without a forecast', sum: 'Clouds, wind, animals, and old sayings that work', tags: ['weather signs', 'clouds', 'barometer', 'forecast'], body: `
<ul>
<li><b>"Red sky at night, sailor's delight; red sky in morning, sailors take warning."</b> Weather usually moves west to east; a red sunrise means moisture coming.</li>
<li><b>Cirrus "mares' tails"</b> high and thickening into a milky sheet (cirrostratus, halo around sun/moon) → rain likely within 12–24 hours.</li>
<li><b>Cumulus towering in the morning</b> → afternoon thunderstorms. Anvil‑shaped tops = mature thunderstorm.</li>
<li><b>Wind shifts</b>, sudden temperature drops, and a cool breeze from a storm's direction mean a storm is close.</li>
<li><b>Falling barometric pressure</b> (many phones have a barometer — use a weather app's pressure graph) → worsening weather. A fast drop = strong storm.</li>
<li>Smells get stronger (vegetation, swamp) before rain; sound carries farther; insects and birds go quiet or fly low.</li>
<li>Dew on grass in the morning → generally fair day; no dew → possible rain.</li>
<li>Hurricane signs: long ocean swells arriving days ahead, high thin cirrus streaming from one direction, unusual tides, steadily falling pressure.</li>
</ul>` }
  ]
},
{
  id: 'hygiene', title: 'Hygiene & Sanitation', icon: '🧼', color: '#7fc4b8',
  blurb: 'Staying clean and healthy off-grid',
  articles: [
    { id: 'sanitation', title: 'Toilets, waste and sanitation', sum: 'Bucket toilets, latrines, trash — preventing disease', tags: ['toilet', 'latrine', 'bucket toilet', 'sanitation', 'cathole'], body: `
<p>In long emergencies, disease from poor sanitation kills more people than injuries. Separate waste from water and food, and wash hands.</p>
<h2>Catholes (camping)</h2><p>Dig 6–8 in deep, 200 ft (70 steps) from water, camp and trails. Cover and disguise afterward.</p>
<h2>Two‑bucket toilet (home/long term)</h2><ol class="steps"><li>5‑gallon bucket lined with a heavy trash bag; a toilet seat lid (sold for buckets) or pool noodle split on the rim.</li><li>After each use, cover with a scoop of sawdust, peat moss, dry leaves, kitty litter, or wood ash — this controls odor and flies.</li><li>Pee in a separate container if possible — much less smell. Urine can be diluted 10:1 with water and used as garden fertilizer.</li><li>Tie bags when ⅔ full; bury 2+ ft deep away from water, or store sealed until trash service returns.</li></ol>
<p>If your house toilet has no water, you can still use it by lining the bowl with a bag. Or flush by pouring 1–2 gallons of any water quickly into the bowl (if sewer works).</p>
<h2>Latrine</h2><p>Trench 1 ft wide, 2–3 ft deep, at least 200 ft downhill from water sources and 100 ft from camp. Add soil after each use. Fill in when within 1 ft of the top.</p>
<h2>Trash</h2><p>Burn paper; bury or bag food waste far from camp (animals, flies); keep cans and bottles for reuse.</p>` },
    { id: 'handwashing', title: 'Washing, bathing & laundry', sum: 'Tippy tap, sponge baths, laundry without power', tags: ['handwashing', 'bathing', 'laundry', 'tippy tap', 'soap'], body: `
<ul><li><b>Wash hands</b> with soap for 20 seconds after the toilet and before food — the most effective disease prevention. Hand sanitizer works on clean‑looking hands.</li><li><b>Tippy tap:</b> hang a jug with a small hole near the cap from a stick; a foot pedal string tips it. Saves water and keeps hands off the jug.</li><li><b>Sponge bath:</b> 1–2 quarts of warm water per person: face → armpits → groin → feet, in that order. Baby wipes work too.</li><li><b>Solar shower:</b> black bag or dark jug in the sun for a few hours.</li><li><b>Laundry:</b> 5‑gal bucket with a lid that has a hole for a plunger (or a new toilet plunger) — agitate, rinse, wring, line dry in sun (UV disinfects). Change socks and underwear daily if possible — prevents foot rot, rashes and infections in Southeast humidity.</li><li><b>Teeth:</b> brush daily; a frayed green twig (dogwood, sweetgum, black birch) works as a chewing stick.</li></ul>
<h2>Skin problems in humid heat</h2><ul><li><b>Prickly heat / chafing:</b> keep dry, powder (cornstarch), loose clothes.</li><li><b>Foot care:</b> dry feet and change socks daily; air them out at night. Trench foot can develop after 12+ hours of wet feet.</li><li><b>Fungal rash (jock itch, athlete's foot):</b> antifungal cream, dry clothing.</li></ul>` },
    { id: 'insects', title: 'Insects: mosquitoes, ticks, chiggers', sum: 'Repellents, permethrin, tick checks, chigger tips', tags: ['mosquito', 'tick', 'chigger', 'deet', 'permethrin', 'repellent', 'fire ant'], body: `
<ul><li><b>Repellents:</b> DEET 20–30%, picaridin 20%, or oil of lemon eucalyptus (OLE). Apply to exposed skin.</li><li><b>Permethrin</b> spray on clothing, shoes, hammocks and tents (not skin) kills ticks and chiggers on contact and lasts ~6 washes. The single best tick defense.</li><li>Tuck pants into socks; light‑colored clothes make ticks easy to spot.</li><li><b>Tick check</b> every evening: scalp, behind ears, armpits, waistband, groin, behind knees. Remove with fine tweezers close to the skin, pull straight up steadily. Save the tick in a bag with the date.</li><li><b>Chiggers</b> live in tall grass, Spanish moss, berry patches. Wash with soap and hot water right after exposure; itching starts hours later. Hydrocortisone and antihistamines help. Don't use nail polish — it doesn't help.</li><li><b>Mosquitoes</b> breed in standing water — dump containers around camp. Bed nets matter in swampy areas. Smoke from a fire helps a bit.</li><li><b>Fire ants:</b> look before you sit, kneel or set gear down. If you step in a mound, move away and brush (don't slap) them off.</li></ul>
<p>Tick‑borne illness, fire ant stings: see <a href="#/a/firstaid/bites">Bites & stings</a>.</p>` }
  ]
},
{
  id: 'security', title: 'Safety & Security', icon: '🛡️', color: '#9aa07a',
  blurb: 'Situational awareness, protecting camp & vehicle',
  articles: [
    { id: 'awareness', title: 'Situational awareness', sum: 'Staying safe around people in emergencies', tags: ['security', 'awareness', 'safety', 'gray man'], body: `
<ul><li>Most people in disasters are helpful. A few are not. Avoid crowds and confrontations at gas stations and stores late in an emergency.</li><li><b>Be the "gray man":</b> don't display gear, food, fuel, cash, or weapons. Plain clothes, unmarked bags.</li><li>Travel during daylight, with a full tank, along known routes; tell someone your plan.</li><li>Park facing out for a quick exit. Keep keys on you.</li><li>Trust your gut: if a place or person feels wrong, leave.</li><li>De‑escalate: calm voice, open hands, give space, offer a way out. Things can be replaced; people can't.</li><li>Keep a whistle, flashlight and phone within reach at night.</li></ul>` },
    { id: 'camp', title: 'Securing camp & vehicle', sum: 'Food storage from animals, theft prevention', tags: ['camp security', 'bear', 'food storage', 'theft'], body: `
<ul><li><b>Food:</b> never in your tent. Store in the locked car, a bear canister, or hang 12 ft high and 6 ft out from a trunk 200 ft from camp (black bears are common in the Appalachians, Ozarks, Florida and coastal plains). Raccoons will open coolers.</li><li>Cook and eat 100–200 ft from where you sleep in bear country.</li><li>Hide valuables out of sight in the car; cover gear with a dark blanket.</li><li>Simple alarms: cans with pebbles on a cord around camp; motion‑sensor lights.</li><li>Lock fuel caps; consider a locking gas can.</li></ul>` }
  ]
}
);
