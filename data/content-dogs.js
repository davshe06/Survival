/* Dog first aid. Based on widely published veterinary first-aid guidance (AVMA, American Red Cross Pet First Aid,
   RECOVER veterinary CPR guidelines, ASPCA Animal Poison Control). Not a substitute for a veterinarian. */
(window.GUIDE = window.GUIDE || []).push({
  id: 'dogs', title: 'Dog First Aid', icon: '🐕', color: '#c98a4a',
  blurb: 'Emergencies, heatstroke, snakebite, poisons, CPR for dogs',
  intro: '<b>Get to a veterinarian whenever you can</b> — call ahead so they\'re ready. Save these now: <b>ASPCA Animal Poison Control (888) 426‑4435</b> and <b>Pet Poison Helpline (855) 764‑7661</b> (both 24/7; a consultation fee applies). An injured dog in pain may bite even its owner — protect yourself first.',
  articles: [
    { id: 'basics', title: 'Dog emergency basics & vital signs', icon: '🩺', sum: 'Safe handling, muzzling, normal vitals, when to rush to a vet', tags: ['dog', 'vital signs', 'muzzle', 'temperature', 'heart rate', 'gums', 'emergency', 'pet'], body: `
<h2>Approach safely</h2>
<ul><li>Move slowly, talk calmly, approach from the side. Don't put your face near a hurt dog's face.</li>
<li><b>Muzzle</b> a conscious dog in pain before handling — <b>unless</b> it is vomiting, struggling to breathe, unconscious, or has a mouth/jaw injury, or is a flat‑faced breed (pug, bulldog) that breathes poorly.</li></ul>
<h3>Improvised muzzle</h3><ol class="steps"><li>Use a 3‑ft strip of gauze, a leash, necktie or soft rope. Make a loop.</li><li>Slip the loop over the snout with the knot on top, pull snug.</li><li>Cross the ends under the jaw, bring them behind the ears and tie a quick‑release bow.</li><li>Remove it immediately if the dog vomits or has trouble breathing.</li></ol>
<p>Small dogs: wrap them in a towel or blanket with the head out.</p>
<h2>Normal vital signs (adult dog, at rest)</h2>
<div class="tbl"><table><tr><th>Sign</th><th>Normal</th><th>How to check</th></tr>
<tr><td>Temperature</td><td>101–102.5°F (38.3–39.2°C)</td><td>Rectal thermometer with petroleum jelly, ~1 in deep. <b>Above 104°F or below 99°F = emergency.</b></td></tr>
<tr><td>Heart rate</td><td>Large dogs 60–100/min · small dogs 100–140/min · puppies up to 220</td><td>Hand on the left chest behind the elbow, or femoral pulse inside the upper thigh. Count 15 s × 4.</td></tr>
<tr><td>Breathing</td><td>10–35 breaths/min at rest (panting is higher)</td><td>Watch the chest rise.</td></tr>
<tr><td>Gums</td><td>Moist and pink</td><td>Pale/white = blood loss or shock; blue/gray = no oxygen; bright red = heatstroke or toxin; yellow = liver problem.</td></tr>
<tr><td>Capillary refill</td><td>Under 2 seconds</td><td>Press the gum until it turns white; time how long until pink returns.</td></tr>
<tr><td>Hydration</td><td>Skin snaps back</td><td>Lift the skin between the shoulder blades; slow return or tacky gums = dehydrated.</td></tr></table></div>
<p>Check your own dog's normal numbers when it's healthy and write them in <a href="#/notes">Notes</a>.</p>
<h2>Go to a vet immediately for</h2>
<p>Trouble breathing · pale, blue or gray gums · collapse or can't stand · bleeding that won't stop · swollen hard belly with retching (bloat) · snakebite · known poisoning · seizure over 3 minutes or several in a row · heatstroke · hit by a car (even if it seems fine) · straining to urinate with nothing coming out · eye injury · broken bone · body temperature above 104°F or below 99°F.</p>
<h2>Moving an injured dog</h2><p>Slide it onto a board, door, blanket or tarp used as a stretcher, keeping the spine straight. Support the chest and hindquarters of a small dog. Keep it warm and quiet.</p>` },

    { id: 'bleeding', title: 'Bleeding, wounds & bandaging', icon: '🩸', sum: 'Stop bleeding, clean cuts, paw pads, torn nails', tags: ['dog', 'bleeding', 'wound', 'cut', 'paw pad', 'nail', 'bandage', 'hog cut', 'tourniquet'], body: `
<h2>Severe bleeding</h2><ol class="steps"><li>Muzzle if needed. Press gauze or a clean cloth <b>firmly</b> on the wound for at least 3–5 minutes without lifting to peek. Add more layers on top if it soaks through.</li><li>Wrap firmly with a bandage to hold pressure, and get to a vet.</li><li>Spurting bleeding from a leg that pressure can't stop: a tourniquet (wide strip of cloth with a stick to twist) above the wound, as a last resort — note the time and get to a vet immediately.</li><li>Watch for shock: pale gums, weak fast pulse, cold legs. Keep the dog warm and still.</li></ol>
<h2>Cuts & punctures</h2><ul><li>Clip or part fur around the wound. Flush with lots of clean water or saline (a syringe or squeeze bottle).</li><li>Diluted povidone‑iodine (weak‑tea color) or chlorhexidine is fine. Avoid hydrogen peroxide and alcohol in wounds.</li><li>Bites from other animals and puncture wounds nearly always get infected and often hide deep damage — see a vet, especially for bites on the chest or belly.</li><li>Gaping cuts, wounds longer than ½ inch, or anything showing fat/muscle need stitches within ~6–8 hours.</li><li>Prevent licking with a cone (e‑collar), a T‑shirt or a sock.</li></ul>
<h2>Paw pad cuts</h2><p>Common on glass, oyster shells and sharp rocks. Rinse, press to stop bleeding, then pad with gauze, wrap with roll gauze from the toes up past the wrist/ankle, then self‑adhesive wrap (Vetwrap) — <b>not too tight</b>: you should fit a finger under it. Cover with a sock or bootie; keep dry; change daily. Swelling of the toes means it's too tight.</p>
<h2>Torn or bleeding toenail</h2><p>Press styptic powder, cornstarch or flour into the nail and hold pressure 2–5 minutes. A nail hanging by a thread usually needs a vet to trim.</p>
<h2>Hunting dogs: hog and deer cuts</h2><p>Hog tusk wounds are often much deeper than they look and may enter the chest or belly. Control bleeding, cover wounds, keep the dog still and get to a vet. A chest wound that sucks air: cover it with plastic taped on three sides.</p>` },

    { id: 'cpr', title: 'Dog CPR & choking', icon: '❤️', sum: 'Rescue breathing, chest compressions, clearing the airway', tags: ['dog', 'cpr', 'choking', 'not breathing', 'heimlich', 'rescue breathing', 'drowning'], body: `
<div class="box danger"><b class="lbl">Not breathing, no heartbeat?</b>Check: no chest movement, no heartbeat felt at the left chest behind the elbow, gums gray/blue, pupils wide. Start CPR right away and have someone drive you to the nearest vet. Use the <a href="#/tools/cpr">CPR metronome</a> for rhythm (100–120/min).</div>
<h2>CPR (RECOVER veterinary guidelines)</h2><ol class="steps">
<li>Lay the dog on its <b>right side</b> on a firm surface (barrel‑chested breeds like bulldogs: on its back).</li>
<li><b>Hand position:</b> most dogs — over the widest part of the chest. Narrow, deep‑chested dogs (greyhounds, Dobermans) — directly over the heart (where the elbow touches the chest). Small dogs and cats‑size — wrap one hand around the chest and squeeze with thumb and fingers.</li>
<li><b>Compress</b> ⅓ to ½ the width of the chest, <b>100–120 per minute</b>, letting the chest fully recoil each time. Lock your elbows; push from your shoulders.</li>
<li><b>Breaths:</b> after 30 compressions, close the dog's mouth with your hand, extend the neck so it's in line with the back, and blow into the <b>nose</b> until you see the chest rise — 2 breaths, 1 second each. (With two rescuers: continuous compressions, 1 breath every 6 seconds.)</li>
<li>Check for a heartbeat and breathing every 2 minutes. Switch compressors every 2 minutes if you can.</li></ol>
<p>Survival from cardiac arrest is low even in hospitals; CPR is most likely to work after drowning, choking, electric shock or anesthesia‑type causes. Continue until you reach a vet or 20+ minutes with no response.</p>
<h2>Choking</h2><p>Signs: pawing at the mouth, gagging, distress, blue gums, noisy or no breathing.</p><ol class="steps">
<li>Open the mouth (careful — even a friendly dog may bite). Pull the tongue forward and look. Sweep out a visible object with your fingers or tongs; don't push it deeper. <b>Sticks and balls lodged at the back of the throat</b>: pull forward if you can grip them.</li>
<li><b>Small dog:</b> hold it upside down by the hips with its back against your chest and give 5 sharp back blows between the shoulder blades.</li>
<li><b>Large dog:</b> lift the back legs (wheelbarrow) so the head hangs down, or with the dog standing, put your arms around the belly, make a fist just <b>behind the last rib</b>, and give 5 quick upward‑and‑forward thrusts (dog Heimlich).</li>
<li>Check the mouth again; repeat. If it stops breathing, start CPR and get to a vet.</li></ol>
<h2>Near‑drowning</h2><p>Hold a small dog upside down by the hips for 10–20 seconds to drain water (large dogs: lift the hind legs). Then rescue breaths/CPR as needed. See a vet — pneumonia can follow hours later.</p>` },

    { id: 'heat', title: 'Heatstroke & cold', icon: '🌡️', sum: 'The #1 summer killer of Southeast dogs — cool them fast', tags: ['dog', 'heatstroke', 'heat', 'hyperthermia', 'car', 'hot pavement', 'paw burns', 'hypothermia', 'brachycephalic'], body: `
<div class="box danger"><b class="lbl">Heatstroke signs</b>Heavy panting that won't stop, thick drool, bright red or purple gums, weakness, stumbling, vomiting or bloody diarrhea, confusion, collapse, seizures. Body temperature 104–106°F+. Can kill in under an hour.</div>
<h2>Cool the dog immediately — then go to the vet</h2><ol class="steps">
<li>Move into shade or A/C.</li>
<li>Soak the dog with <b>cool tap water</b> (not ice water — it constricts blood vessels and slows cooling), especially the belly, armpits, groin and paws. Wet towels laid on the dog trap heat — keep them moving or use running water.</li>
<li>Put a fan or car A/C on the wet dog. Evaporation does most of the cooling.</li>
<li>Offer small amounts of cool water; don't force it.</li>
<li>Check rectal temperature every 5 minutes; <b>stop active cooling at 103°F</b> to avoid overshooting into hypothermia.</li>
<li>Drive to a vet with the A/C on even if the dog seems better — heatstroke damages kidneys, the gut and blood clotting over the next 24–72 hours.</li></ol>
<h2>Prevention in the Southeast</h2><ul>
<li><b>Never leave a dog in a parked car.</b> At 85°F outside, a car reaches 120°F in 30 minutes even with windows cracked.</li>
<li>Exercise at dawn and dusk; rest in shade; carry water and a bowl on every outing (dogs need ~1 oz per lb per day, much more in heat).</li>
<li>High‑risk dogs: flat‑faced breeds (bulldogs, pugs, boxers), overweight, old, dark‑coated, heavy‑coated, puppies, and dogs not used to heat.</li>
<li>Hot pavement: if you can't hold the back of your hand on it for 7 seconds, it will burn paws. Walk on grass, use booties.</li>
<li>Cooling vests/bandanas, kiddie pools, and frozen water bottles in the crate help when the power is out.</li></ul>
<h2>Paw pad burns</h2><p>Limping, licking, blisters or peeling pads after hot pavement or sand. Flush with cool water for 10 minutes, then bandage lightly and see a vet.</p>
<h2>Hypothermia & frostbite</h2><p>Shivering, lethargy, slow breathing, temperature below 99°F — common in wet small/short‑coated dogs and after falling in cold water. Dry the dog, wrap in warm blankets, put warm (not hot) water bottles wrapped in towels against the chest and belly, and see a vet. Don't use a hair dryer on high or a heating pad directly on skin.</p>` },

    { id: 'snakebite', title: 'Snakebite & bites/stings', icon: '🐍', sum: 'Copperheads, rattlesnakes, bees, fire ants, toads', tags: ['dog', 'snakebite', 'copperhead', 'rattlesnake', 'cottonmouth', 'bee sting', 'fire ants', 'spider', 'toad', 'cane toad', 'bufo', 'benadryl', 'allergic reaction'], body: `
<h2>Snakebite</h2><p>Dogs are bitten far more often than people — usually on the face or front legs while investigating. Copperheads cause most bites in the Southeast; rattlesnake and cottonmouth bites are more dangerous.</p>
<p><b>Signs:</b> sudden yelp, rapidly increasing swelling, puncture marks (often hidden by fur), bleeding, pain, drooling, weakness, vomiting, collapse; coral snake bites may cause little swelling but delayed paralysis.</p>
<ol class="steps"><li>Back the dog away from the snake; don't try to catch or kill it (a photo from a distance helps the vet).</li><li>Keep the dog as calm and still as possible — <b>carry it</b> if you can.</li><li>Remove the collar if the bite is on the head/neck (swelling can choke). </li><li><b>Go to a vet immediately.</b> Call ahead to ask whether they have antivenom.</li></ol>
<p><b>Do NOT:</b> cut, suck, ice, tourniquet, or give aspirin/ibuprofen. Diphenhydramine (Benadryl) does <b>not</b> treat venom. A rattlesnake vaccine exists for dogs at high risk — ask your vet.</p>
<h2>Bees, wasps & fire ants</h2><ul><li>Scrape out stingers. Cool compress. Watch for face swelling, hives, vomiting, weakness or breathing trouble (allergic reaction) — go to a vet.</li><li>Many vets advise <b>diphenhydramine (plain Benadryl, no decongestant) about 1 mg per lb of body weight</b> for mild allergic reactions — call your vet to confirm the dose for your dog first. Never use products containing xylitol or pseudoephedrine.</li><li>Dogs that bite at a swarm or step in fire ant mounds may get hundreds of stings — rinse off ants with water and go to a vet.</li></ul>
<h2>Toads (cane/Bufo toads in Florida)</h2>${window.FG_PH ? FG_PH('Rhinella marina', 'Cane toad') : ''}<p>Licking or mouthing a toad causes heavy drooling, pawing at the mouth, bright red gums, shaking, seizures and heart rhythm problems within minutes. <b>Wipe the gums, tongue and roof of the mouth with a wet cloth</b>, rinsing the cloth often, for 10 minutes (point the head <i>down</i> so water runs out — don't hose water down the throat). Then go to a vet urgently.</p>
<h2>Spiders & scorpions</h2><p>Black widow bites cause pain, muscle rigidity and tremors; brown recluse causes slow‑healing skin wounds. Keep the dog calm and see a vet.</p>
<h2>Porcupines (mountains)</h2><p>Don't pull quills yourself if there are many — they need sedation. See a vet the same day.</p>` },

    { id: 'poison', title: 'Poisoning: foods, plants & chemicals', icon: '☠️', sum: 'Xylitol, chocolate, grapes, sago palm, algae, rat bait, antifreeze', tags: ['dog', 'poison', 'toxic', 'xylitol', 'chocolate', 'grapes', 'raisins', 'onion', 'sago palm', 'blue-green algae', 'antifreeze', 'rat poison', 'ibuprofen', 'mushroom', 'hydrogen peroxide', 'induce vomiting'], body: `
<div class="box info"><b class="lbl">Call first</b>ASPCA Animal Poison Control <b>(888) 426‑4435</b> · Pet Poison Helpline <b>(855) 764‑7661</b>. Have the package or plant, your dog's weight, how much and when it was eaten. Act fast — many poisons are treatable if caught within an hour or two.</div>
<h2>Deadly or dangerous for dogs</h2>
<div class="tbl"><table><tr><th>Toxin</th><th>Why it matters</th></tr>
<tr><td><b>Xylitol</b> (sugar‑free gum, candy, some peanut butters, toothpaste, vitamins)</td><td>Crashes blood sugar in 15–60 min and can cause liver failure. A few pieces of gum can kill a small dog.</td></tr>
<tr><td><b>Grapes, raisins, currants</b></td><td>Sudden kidney failure; no known "safe" amount.</td></tr>
<tr><td><b>Chocolate & caffeine</b></td><td>Vomiting, racing heart, tremors, seizures. Dark/baking chocolate is far worse than milk chocolate.</td></tr>
<tr><td><b>Onions, garlic, chives</b> (raw, cooked, powdered)</td><td>Destroy red blood cells over several days.</td></tr>
<tr><td><b>Macadamia nuts</b>, alcohol, raw yeast dough</td><td>Weakness, tremors; alcohol and dough cause dangerous intoxication.</td></tr>
<tr><td><b>Human pain relievers</b> — ibuprofen, naproxen, aspirin, acetaminophen</td><td>Stomach ulcers, kidney and liver failure. <b>Never give these to a dog.</b></td></tr>
<tr><td><b>Sago palm</b> (cycad — very common in Southeast landscaping)</td><td>Seeds especially: liver failure; often fatal even with treatment.</td></tr>
<tr><td><b>Blue‑green algae</b> (scummy green/blue water in warm ponds, lakes)</td><td>Can kill within an hour. Keep dogs out of scummy water; rinse immediately with clean water if they swim in it.</td></tr>
<tr><td><b>Rat/mouse bait</b></td><td>Some cause bleeding days later; others cause seizures or kidney failure. Keep the package — the active ingredient decides treatment.</td></tr>
<tr><td><b>Antifreeze</b> (ethylene glycol — sweet taste)</td><td>Kidney failure; antidote works only within hours.</td></tr>
<tr><td><b>Wild mushrooms</b></td><td>Amanita species cause liver failure. Any mushroom eaten = call.</td></tr>
<tr><td>Other plants</td><td>Oleander, azalea/rhododendron, lilies (cats especially), foxglove, castor bean, autumn crocus, yew.</td></tr>
<tr><td>Other chemicals</td><td>Slug bait (metaldehyde), insecticides, fertilizers with bone meal, marijuana edibles, nicotine, ADHD medicines, gasoline.</td></tr></table></div>
${window.FG_PH ? FG_PH('Cycas revoluta', 'Sago palm — deadly to dogs') : ''}
<h2>Inducing vomiting — only when a vet or poison control tells you to</h2><p>Never induce vomiting if the dog swallowed something sharp, caustic (drain cleaner, bleach), or petroleum (gasoline), or if it is already vomiting, drowsy, having seizures, or a flat‑faced breed.</p>
<p>If directed: fresh <b>3% hydrogen peroxide, 1 teaspoon per 5 lb</b> of body weight by mouth (maximum 3 tablespoons), walk the dog around; may repeat once after 15 minutes if no vomiting. Never use salt, ipecac or fingers down the throat. (Never use peroxide in cats.)</p>
<h2>On the skin</h2><p>Chemicals or oils on the coat: wash with dish soap and lots of water (wear gloves); stop the dog licking.</p>` },

    { id: 'injuries', title: 'Fractures, limping, eyes & hit by car', icon: '🦴', sum: 'Splinting, eye injuries, burrs & fishhooks, trauma', tags: ['dog', 'fracture', 'broken leg', 'limping', 'splint', 'hit by car', 'eye', 'fishhook', 'burr', 'foxtail', 'sticker'], body: `
<h2>Hit by a car or a bad fall</h2><p>Even dogs that get up and run can have internal bleeding, collapsed lungs or a ruptured bladder. Muzzle, move on a flat board or blanket, keep warm, and go to a vet right away.</p>
<h2>Suspected broken leg</h2><ul><li>Signs: not bearing weight, leg at an odd angle, swelling, severe pain.</li><li>Lower leg (below the elbow or knee): splint with a rolled magazine, cardboard or sticks padded with cotton/towels, extending past the joints above and below, taped in place. Don't try to straighten the bone.</li><li>Upper leg, hip, or spine injury: don't splint — keep the dog still on a stretcher.</li><li>Open fracture: cover the wound with a clean moist dressing.</li></ul>
<h2>Limping (no obvious break)</h2><p>Check paws and between toes for thorns, sandspurs, burrs, cuts, fire ant stings, or a torn nail. Rest for 24–48 hours with short leash walks. See a vet if the limp lasts more than a day or two, or there's swelling or severe pain. (No human pain medicine.)</p>
<h2>Eyes</h2><ul><li>Flush dirt or sand with lots of saline or clean water.</li><li>Squinting, a cloudy or bulging eye, anything stuck in the eye, or an eye out of its socket (flat‑faced breeds): keep it moist with saline‑soaked gauze, prevent rubbing, and go to a vet immediately.</li></ul>
<h2>Fishhooks</h2><p>In the lip or skin: if the barb is visible, cut it off with wire cutters and back the hook out; otherwise push the point through until the barb exits, cut it, and back out the shank. Swallowed hook or line: <b>don't pull the line</b> — go to a vet.</p>
<h2>Burrs, sandspurs & grass awns</h2><p>Comb out with a fine comb; work oil or cornstarch into mats. Grass seeds (awns) can migrate into ears, nose, eyes and between toes — sudden sneezing, head shaking or a swollen toe means a vet visit.</p>` },

    { id: 'illness', title: 'Bloat, vomiting, seizures & illness', icon: '🤒', sum: 'GDV bloat emergency, GI upset, seizures, dehydration', tags: ['dog', 'bloat', 'gdv', 'vomiting', 'diarrhea', 'seizure', 'dehydration', 'heartworm', 'parvo', 'shock'], body: `
<div class="box danger"><b class="lbl">Bloat (GDV) — minutes matter</b>Deep‑chested dogs (Great Danes, shepherds, labs, standard poodles, boxers) whose stomach twists: <b>retching without bringing anything up</b>, swollen tight belly, restlessness, drooling, pale gums, collapse. Fatal within hours without surgery. Go to an emergency vet immediately — there is no home treatment. Prevent by feeding 2–3 smaller meals and avoiding hard exercise for an hour after eating.</div>
<h2>Vomiting & diarrhea (mild)</h2><ul><li>Adult dog, bright and alert: withhold food 12 hours (not water; not for puppies, tiny breeds or diabetics), then feed small amounts of bland food — boiled plain chicken or lean ground meat with white rice — for 2–3 days.</li><li>Offer small, frequent sips of water. Ice cubes help a nauseous dog drink.</li><li><b>See a vet</b> for: blood in vomit or stool, repeated vomiting, a puppy (parvovirus is deadly), lethargy, belly pain, suspected swallowed object or poison, or illness lasting over 24 hours.</li></ul>
<h2>Seizures</h2><ol class="steps"><li>Move the dog away from stairs, water and furniture. Keep your hands away from its mouth (dogs don't swallow their tongues).</li><li>Time the seizure. Dim lights and keep quiet.</li><li>Afterward the dog may be confused or blind for a while — keep it calm and safe.</li><li><b>Emergency</b> if a seizure lasts more than 3–5 minutes, or several happen close together. Overheating during long seizures is dangerous — cool the paws and belly with water.</li></ol>
<h2>Shock</h2><p>Pale gums, rapid weak pulse, fast breathing, cold legs, weakness after injury or illness. Keep the dog lying down, warm and quiet, and transport to a vet.</p>
<h2>Southeast health threats to prevent</h2><ul><li><b>Heartworm</b> (spread by mosquitoes, extremely common in the South) — year‑round monthly preventive.</li><li><b>Ticks & fleas</b> — Ehrlichia, Rocky Mountain spotted fever, Lyme; check dogs daily after outings and use a vet‑recommended preventive.</li><li><b>Leptospirosis</b> from flood and pond water and wildlife urine — vaccine available.</li><li><b>Parvovirus</b> — vaccinate puppies; deadly in unvaccinated dogs.</li></ul>` },

    { id: 'kit', title: 'Dog first aid kit & disaster plan', icon: '🧰', sum: 'What to pack for your dog in the car and for evacuations', tags: ['dog', 'first aid kit', 'pet kit', 'evacuation', 'disaster', 'pet emergency plan', 'microchip'], body: `
<h2>Dog first aid kit</h2><ul>
<li>Vet and emergency vet phone numbers, poison control numbers, copy of vaccination records, recent photo of your dog</li>
<li>Muzzle (fitted basket or soft) and a spare slip leash</li>
<li>Gauze pads, roll gauze, self‑adhesive wrap (Vetwrap), non‑stick pads, medical tape, cotton balls</li>
<li>Saline wound wash, chlorhexidine or povidone‑iodine solution, 20 mL syringe for flushing</li>
<li>Digital rectal thermometer + petroleum jelly</li>
<li>Styptic powder (or cornstarch), tweezers, tick remover, blunt scissors, nail clippers</li>
<li>3% hydrogen peroxide (only for use when told by a vet/poison control; replace yearly)</li>
<li>Plain diphenhydramine (no xylitol, no decongestants) — confirm dose with your vet</li>
<li>Cone/e‑collar, dog booties, a sock for covering paw bandages</li>
<li>Emergency blanket and a towel; a collapsible bowl and water</li>
<li>Any prescription medicines and heartworm/flea preventive (2 weeks' supply)</li></ul>
<div class="box warn"><b class="lbl">Never give your dog</b>Ibuprofen (Advil), naproxen (Aleve), acetaminophen (Tylenol), aspirin unless prescribed, or anything containing xylitol. Ask a vet before giving any human medicine.</div>
<h2>Disaster & evacuation plan</h2><ul>
<li>Microchip your dog and keep the registration up to date; ID tag with your phone number.</li>
<li>Know which shelters, hotels and family along your evacuation routes accept pets — many public shelters don't.</li>
<li>Pack 1–2 weeks of food (in a sealed container), water, bowls, leash, harness, crate, waste bags and medicines in the car kit (see <a href="#/gear">Gear → Pets</a>).</li>
<li>Leave early — animal rescue during storms is limited. Never leave a dog tied up or crated when evacuating from a flood or fire.</li>
<li>After a storm, keep dogs leashed: familiar landmarks and scents are gone, and debris, downed lines, snakes, fire ants and flood water are everywhere.</li></ul>` }
  ]
});
