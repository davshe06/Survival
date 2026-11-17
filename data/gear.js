/* Car-fit survival gear checklist (interactive). Priority: 1 = essential, 2 = recommended, 3 = nice to have. */
(function () {
  'use strict';
  const GEAR = [
    { id: 'grab', title: 'Grab-and-go bag (cabin, within reach)', icon: '🎒', note: 'One 25–40 L backpack per person you could carry on foot if you must leave the car.', items: [
      ['Backpack 25–40 L', 1, '1/person', 'Comfortable hip belt'], ['Water: 2–3 L in bottles/bladder', 1, '', ''], ['Water filter (Sawyer Squeeze / LifeStraw)', 1, '', 'Backflush syringe'],
      ['Purification tablets (chlorine dioxide)', 1, '20+', ''], ['Headlamp + spare batteries', 1, '', 'AA/AAA lithium'], ['Lighter ×2, storm matches, ferro rod', 1, '', ''],
      ['Fixed-blade or sturdy folding knife', 1, '', ''], ['Multi-tool', 2, '', ''], ['Emergency bivvy / space blanket', 1, '', 'Bivvy is far better than a flat blanket'],
      ['Rain poncho or jacket', 1, '', ''], ['Change of socks & underwear, warm hat', 1, '', 'Wool socks'], ['3 days of food bars / trail mix / MRE', 1, '', '2,000+ kcal/day'],
      ['IFAK: tourniquet, pressure bandage, gauze', 1, '', 'See first-aid section'], ['Personal meds (7+ days) & copies of prescriptions', 1, '', ''],
      ['Whistle & signal mirror', 1, '', ''], ['Compass (baseplate) & paper map of region', 1, '', 'State DOT or Benchmark atlas'], ['Phone power bank 10–20k mAh + cables', 1, '', ''],
      ['Cash in small bills ($200+)', 1, '', 'ATMs/cards fail in outages'], ['N95 masks', 2, '4', ''], ['Bandana / shemagh', 2, '2', ''], ['Small notebook & pencil', 2, '', ''],
      ['Paracord 50 ft', 1, '', ''], ['Duct tape (wrapped on bottle)', 2, '', ''], ['Bug repellent & sunscreen', 1, '', ''], ['Hand sanitizer & wipes', 2, '', '']
    ]},
    { id: 'docs', title: 'Documents & communication', icon: '📄', note: 'Waterproof pouch in the grab bag; scans on a USB drive and in this phone.', items: [
      ['IDs, passports, birth certificates (copies)', 1, '', ''], ['Insurance (home, car, health) & policy numbers', 1, '', ''], ['Medical info & allergies list, vaccination records', 1, '', ''],
      ['Contact list on paper (phone numbers!)', 1, '', 'You won\'t remember numbers when your phone dies'], ['Property deed / lease, vehicle title', 2, '', ''], ['Bank & account info', 2, '', ''],
      ['Pet records & photos', 2, '', ''], ['Family photos (for reunification)', 2, '', ''], ['Encrypted USB drive with scans', 2, '', ''],
      ['NOAA weather radio (hand-crank/solar)', 1, '', 'Midland ER310, etc.'], ['GMRS/FRS radios (pair+)', 2, '', 'GMRS license $35'], ['CB radio (vehicle)', 3, '', 'Ch 9 / 19'],
      ['PLB or satellite messenger', 2, '', 'ACR ResQLink, inReach'], ['Printed family emergency plan & rally points', 1, '', '']
    ]},
    { id: 'water', title: 'Water (trunk)', icon: '💧', note: '1 gal/person/day. A car realistically holds 10–20 gal. Rotate every 3–6 months; heat degrades cheap bottles.', items: [
      ['Water jugs 5–7 gal (or 2×3.5 gal)', 1, '1–2', 'Scepter/Reliance'], ['Collapsible water containers', 2, '2', 'For refilling'], ['Gravity filter (Sawyer/Platypus)', 2, '', 'Filter for groups'],
      ['Unscented bleach (small bottle) + dropper', 1, '', 'Replace yearly'], ['Metal pot / bottle to boil water', 1, '', 'Stainless, single-wall'], ['Coffee filters (pre-filter)', 3, '', '']
    ]},
    { id: 'food', title: 'Food & cooking (trunk bin)', icon: '🥫', note: 'Choose no-cook foods that tolerate heat. Plan 1–2 weeks for each person.', items: [
      ['Calorie-dense food bars (Datrex/Mainstay 3600)', 1, '1/person', '5-year shelf life, heat tolerant'], ['Peanut butter, nuts, trail mix', 1, '', ''], ['Canned meat/fish/beans (pull-tab)', 1, '', ''],
      ['Instant oats, rice, ramen, instant potatoes', 2, '', ''], ['Freeze-dried meals', 2, '', ''], ['Salt, sugar, spices, bouillon, coffee/tea', 2, '', ''],
      ['Electrolyte packets', 1, '', ''], ['Backpacking stove (butane) + fuel', 1, '', 'Or propane 1-burner'], ['Cook pot with lid, mug, spork, can opener (P-38)', 1, '', ''],
      ['Small cast iron skillet or Dutch oven', 3, '', ''], ['Cooler / 12V fridge', 3, '', ''], ['Trash bags & zip bags', 1, '', ''], ['Biodegradable soap & scrubber', 2, '', '']
    ]},
    { id: 'shelter', title: 'Shelter & sleep', icon: '⛺', note: 'Your car is the primary shelter; these let you sleep outside or in a building without power.', items: [
      ['Tarp 8×10 or 10×12 ft', 1, '', ''], ['Sleeping bag (rated 30–40°F for Southeast)', 1, '1/person', 'Wool blanket alternative'], ['Sleeping pad', 2, '1/person', ''],
      ['Tent (2–4 person)', 2, '', ''], ['Hammock + bug net + straps', 3, '', 'Excellent in Southeast summer'], ['Wool blanket', 2, '', 'Warm even when wet'],
      ['Window bug screens/socks for car', 2, '', ''], ['Car sunshades & window covers', 2, '', ''], ['Stakes, extra cord, small mallet', 2, '', ''], ['Battery fan (USB)', 2, '', 'Life-saver in heat']
    ]},
    { id: 'clothing', title: 'Clothing (per person)', icon: '🧥', note: 'Pack for the worst weather of the season; swap bins spring/fall.', items: [
      ['Sturdy broken-in boots', 1, '', ''], ['Wool/synthetic socks ×3', 1, '', ''], ['Quick-dry pants & long-sleeve shirt', 1, '', 'Permethrin-treated'],
      ['Fleece or insulated jacket', 1, '', ''], ['Rain jacket & pants', 1, '', ''], ['Warm hat & gloves (winter)', 1, '', ''], ['Sun hat & sunglasses', 1, '', ''],
      ['Work gloves (leather)', 1, '', ''], ['Base layer (thermal)', 2, '', ''], ['Sandals / camp shoes', 3, '', '']
    ]},
    { id: 'medical', title: 'Medical (full kit)', icon: '🚑', note: 'See First Aid → Kit & medications for full details.', items: [
      ['Tourniquet (CAT/SOF-T) ×2', 1, '', ''], ['Hemostatic gauze + compressed gauze', 1, '', ''], ['Israeli pressure bandages ×2', 1, '', ''], ['Chest seals (pair)', 2, '', ''],
      ['Trauma shears, gloves, marker', 1, '', ''], ['Bandages, gauze, tape, wound closure strips', 1, '', ''], ['SAM splint, elastic wraps, triangle bandages', 1, '', ''],
      ['Irrigation syringe, tweezers, tick remover', 1, '', ''], ['Antiseptic, antibiotic ointment, burn gel', 1, '', ''], ['OTC meds: pain, allergy, diarrhea, antacid', 1, '', ''],
      ['ORS packets', 1, '', ''], ['Epinephrine if prescribed, inhalers', 1, '', ''], ['Naloxone nasal spray', 2, '', ''], ['Thermometer, pulse oximeter', 2, '', ''],
      ['Moleskin/leukotape (blisters)', 2, '', ''], ['Dental kit (temp filling, clove oil)', 3, '', ''], ['Spare glasses/contacts', 1, '', ''], ['Printed first-aid guide', 3, '', 'This app + paper backup']
    ]},
    { id: 'tools', title: 'Tools & repair', icon: '🧰', note: 'Fits in one small duffel or tool roll.', items: [
      ['Folding saw', 1, '', ''], ['Hatchet or small axe', 2, '', ''], ['Folding shovel', 1, '', ''], ['Basic socket/wrench set, screwdrivers, pliers', 1, '', ''],
      ['Duct tape, electrical tape, zip ties, wire', 1, '', ''], ['Sewing kit, gear repair tape', 2, '', ''], ['Work gloves, safety glasses', 1, '', ''], ['Pry bar / Halligan-type tool', 3, '', ''],
      ['Knife sharpener', 2, '', ''], ['Epoxy putty, superglue', 2, '', ''], ['WD-40 / lubricant', 3, '', ''], ['Shut-off wrench (gas/water)', 2, '', 'Home']
    ]},
    { id: 'vehicle', title: 'Vehicle kit', icon: '🚗', note: 'See Vehicle Repair → Car tool kit.', items: [
      ['Jumper cables or lithium jump pack', 1, '', 'Keep jump pack charged'], ['12V tire inflator + gauge', 1, '', ''], ['Tire plug kit', 1, '', ''], ['Spare tire checked, jack, lug wrench', 1, '', ''],
      ['Fire extinguisher (ABC)', 1, '', ''], ['Window punch + seatbelt cutter (driver reach)', 1, '', ''], ['Reflective triangles / LED flares, vest', 1, '', ''],
      ['Recovery strap (no hooks), traction boards', 2, '', ''], ['Coolant, oil, funnel, rags', 2, '', ''], ['Spare fuses, bulbs, belt', 2, '', ''], ['OBD-II code reader', 2, '', ''],
      ['Gas can (approved) + stabilizer', 2, '', 'Hitch rack if possible'], ['Siphon pump', 3, '', ''], ['Tow rope / chain', 3, '', ''], ['Ice scraper (winter, mountains)', 3, '', '']
    ]},
    { id: 'power', title: 'Power & light', icon: '🔋', note: '', items: [
      ['Portable power station 300–1,000 Wh', 2, '', 'Charges from car & solar'], ['Folding solar panel 60–200 W', 2, '', ''], ['Power banks', 1, '', ''],
      ['Car charger (USB-C/PD) & cables', 1, '', ''], ['LED lantern', 1, '', ''], ['Flashlight (bright) + spare batteries', 1, '', ''], ['Rechargeable AA/AAA + charger', 2, '', ''],
      ['Glow sticks', 3, '', ''], ['Candles (emergency)', 3, '', '']
    ]},
    { id: 'hygiene', title: 'Hygiene & sanitation', icon: '🧻', note: '', items: [
      ['Toilet paper (flattened, in zip bag)', 1, '', ''], ['Trowel for catholes', 2, '', ''], ['5-gal bucket + toilet lid + bags', 2, '', 'Doubles as storage bin'], ['Toothbrush, toothpaste, floss', 1, '', ''],
      ['Wet wipes / baby wipes', 1, '', ''], ['Soap bar & small towel', 1, '', ''], ['Feminine hygiene products', 1, '', ''], ['Diapers/formula if needed', 1, '', ''],
      ['Permethrin spray for clothes', 2, '', ''], ['Garbage bags (heavy)', 1, '', ''], ['Bleach or disinfecting wipes', 2, '', '']
    ]},
    { id: 'nav', title: 'Navigation, info & morale', icon: '🧭', note: '', items: [
      ['This app installed + offline topo areas saved', 1, '', 'See Map → layers'], ['Paper road atlas (Southeast)', 1, '', ''], ['Baseplate compass with declination', 1, '', ''],
      ['Binoculars (small)', 3, '', ''], ['Field guide: edible/medicinal plants', 2, '', ''], ['Pocket first-aid & survival book', 3, '', ''], ['Deck of cards, book, kids\' activities', 2, '', 'Morale matters'],
      ['Pen, permanent marker, notepad', 2, '', '']
    ]},
    { id: 'food-pro', title: 'Food procurement (check state laws)', icon: '🎣', note: '', items: [
      ['Compact fishing kit (hooks, line, sinkers, bobbers)', 2, '', ''], ['Telescoping rod & reel', 3, '', ''], ['Snare wire (emergency only)', 3, '', ''],
      ['Heirloom seed packets (in sealed bag)', 3, '', ''], ['Sprouting seeds + jar lid', 3, '', 'Fresh food anywhere']
    ]},
    { id: 'pets', title: 'Pets', icon: '🐕', note: '', items: [
      ['Pet food (1–2 weeks) & collapsible bowls', 1, '', ''], ['Leash, harness, carrier/crate', 1, '', ''], ['Pet meds & vaccine records', 1, '', ''], ['Waste bags / litter', 2, '', '']
    ]}
  ];
  window.GEAR = GEAR;

  const { route, setTitle, store, esc, toast, view, $ } = window.FG;
  const PRI = { 1: 'Essential', 2: 'Recommended', 3: 'Nice to have' };

  route(/^\/gear$/, (m, q) => {
    setTitle('Car Gear Checklist');
    const filt = q.get('p') || store.get('gearfilter', 'all');
    const checks = store.get('gear', {});
    const custom = store.get('gearcustom', []);
    const all = GEAR.map(g => ({ ...g, items: g.items.concat(custom.filter(c => c.g === g.id).map(c => [c.n, c.p, '', 'Custom', c.id])) }));
    let total = 0, done = 0;
    all.forEach(g => g.items.forEach(it => { if (filt !== 'all' && it[1] > +filt) return; total++; if (checks[g.id + '|' + it[0]]) done++; }));
    const pct = total ? Math.round(done / total * 100) : 0;
    view.innerHTML = `
      <div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><b>${done} of ${total} packed</b><span class="muted small">${pct}%</span></div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="btnrow">${[['all', 'Everything'], ['1', 'Essentials only'], ['2', 'Essential + recommended']].map(([k, l]) => `<button class="btn ${filt === k ? 'pri' : ''}" data-f="${k}">${l}</button>`).join('')}</div></div>
      <div class="box info"><b class="lbl">Packing a car</b>
        <b>Cabin (within reach):</b> grab bags, water bottle, first‑aid kit, window punch, flashlight, phone charger, documents. <b>Trunk/cargo:</b> labeled clear bins (water, food/cooking, shelter, tools), heaviest items low and forward against the seatbacks, with a cargo net or straps — loose items become projectiles in a crash. <b>Roof box / hitch carrier:</b> bulky light items, fuel cans (never inside). Keep the most‑needed bin on top and the spare tire accessible. A compact SUV can fit everything marked “Essential” and most “Recommended” items for 2–3 people with room left for passengers.</div>
      ${all.map(g => {
        const its = g.items.filter(it => filt === 'all' || it[1] <= +filt); if (!its.length) return '';
        const d = its.filter(it => checks[g.id + '|' + it[0]]).length;
        return `<details class="grp" ${store.get('gearopen', {})[g.id] ? 'open' : ''} data-g="${g.id}"><summary><span style="font-size:1.3rem">${g.icon}</span>${esc(g.title)}<span class="cnt">${d}/${its.length}</span></summary>
          ${g.note ? `<p class="small muted" style="margin:0 14px 6px">${esc(g.note)}</p>` : ''}
          <div>${its.map(it => { const k = g.id + '|' + it[0]; return `<label class="chk ${checks[k] ? 'done' : ''}"><input type="checkbox" data-k="${esc(k)}" ${checks[k] ? 'checked' : ''}><span class="t"><b>${esc(it[0])}</b> <span class="pri-badge pri-${it[1]}">${PRI[it[1]]}</span>${it[2] || it[3] ? `<small>${esc([it[2], it[3]].filter(Boolean).join(' · '))}</small>` : ''}</span>${it[4] ? `<button class="btn" style="min-height:32px;padding:0 10px" data-del="${it[4]}">✕</button>` : ''}</label>`; }).join('')}</div>
          <div style="padding:8px 12px 12px"><button class="btn" data-add="${g.id}">＋ Add item</button></div></details>`;
      }).join('')}
      <div class="btnrow"><button class="btn" id="gReset">Uncheck all</button><button class="btn" id="gShare">Copy unpacked list</button></div>
      <p class="small muted">Tip: check expiration dates (food, water, meds, batteries, bleach) every 6 months — e.g. when clocks change for daylight saving.</p>`;
    view.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { store.set('gearfilter', b.dataset.f); window.FG.render(); });
    view.querySelectorAll('input[data-k]').forEach(i => i.onchange = () => { const c = store.get('gear', {}); if (i.checked) c[i.dataset.k] = Date.now(); else delete c[i.dataset.k]; store.set('gear', c); i.closest('.chk').classList.toggle('done', i.checked); updateCounts(); });
    view.querySelectorAll('details[data-g]').forEach(d => d.addEventListener('toggle', () => { const o = store.get('gearopen', {}); o[d.dataset.g] = d.open; store.set('gearopen', o); }));
    view.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
      const n = prompt('Item name'); if (!n) return; const p = +(prompt('Priority: 1 = essential, 2 = recommended, 3 = nice to have', '2') || 2);
      const c = store.get('gearcustom', []); c.push({ id: Date.now(), g: b.dataset.add, n, p: [1, 2, 3].includes(p) ? p : 2 }); store.set('gearcustom', c);
      const o = store.get('gearopen', {}); o[b.dataset.add] = true; store.set('gearopen', o); window.FG.render();
    });
    view.querySelectorAll('[data-del]').forEach(b => b.onclick = e => { e.preventDefault(); store.set('gearcustom', store.get('gearcustom', []).filter(c => c.id != b.dataset.del)); window.FG.render(); });
    $('#gReset').onclick = () => { if (confirm('Uncheck every item?')) { store.set('gear', {}); window.FG.render(); } };
    $('#gShare').onclick = () => {
      const c = store.get('gear', {}); const lines = [];
      all.forEach(g => { const miss = g.items.filter(it => (filt === 'all' || it[1] <= +filt) && !c[g.id + '|' + it[0]]); if (miss.length) { lines.push(g.title.toUpperCase()); miss.forEach(it => lines.push('[ ] ' + it[0])); lines.push(''); } });
      const s = lines.join('\n') || 'Everything is packed!';
      (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(() => toast('Shopping list copied'), () => prompt('Copy:', s));
    };
    function updateCounts() {
      const c = store.get('gear', {}); let t = 0, d = 0;
      view.querySelectorAll('details[data-g]').forEach(det => { const boxes = det.querySelectorAll('input[data-k]'); let dd = 0; boxes.forEach(b => { t++; if (b.checked) { d++; dd++; } }); det.querySelector('.cnt').textContent = dd + '/' + boxes.length; });
      const p = t ? Math.round(d / t * 100) : 0; const card = view.querySelector('.card'); card.querySelector('b').textContent = d + ' of ' + t + ' packed'; card.querySelector('.muted').textContent = p + '%'; card.querySelector('.progress i').style.width = p + '%';
    }
  });
})();
