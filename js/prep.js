/* Storm countdown checklists, Spanish emergency phrases, printable field binder. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $, TOOL_LIST, catById } = window.FG;

  // ======================= Storm countdown checklists =======================
  const STORMS = [
    { id: 'hurricane', icon: '🌀', title: 'Hurricane', art: 'weather/hurricane', phases: [
      ['Early season / 5+ days out', ['Know your evacuation zone (search “[your county] evacuation zone”)', 'Decide where you’d go: friends or a hotel 100+ miles inland, and how', 'Water: 1 gal per person per day for 7+ days', '7+ days of food that needs no cooking; manual can opener', 'Refill prescriptions; get 2 weeks extra if allowed', 'Cash in small bills (ATMs and cards fail without power)', 'Documents, insurance policy, IDs in a waterproof bag; photos on your phone', 'Photograph/video your home and belongings for insurance', 'Test the generator; buy stabilized fuel, oil and heavy extension cords', 'Shutters or pre-cut plywood (5/8″) and hardware ready', 'Trim dead limbs near the house']],
      ['Hurricane watch (≈48 h)', ['Fill vehicle tanks and gas cans', 'Charge every power bank, phone, radio and lantern', 'Bring in or tie down patio furniture, grills, trash cans, toys', 'Freeze water bottles and jugs to keep food cold', 'Turn the fridge and freezer to their coldest settings', 'Fill bathtubs for flushing water (not for drinking)', 'Pets: carrier, leash, 2 weeks of food, vaccination records', 'Check on elderly neighbors and relatives', 'Weather radio on, with fresh batteries']],
      ['Hurricane warning (≈36 h) / evacuating', ['Put up shutters/plywood', 'If ordered to evacuate, LEAVE, and leave early before traffic and winds', 'Text your out-of-town contact the plan and route', 'Unplug electronics; move valuables to upper shelves or a higher floor', 'Turn off propane tanks; turn off water main if leaving', 'Load car: water, food, meds, documents, cash, chargers, go-bags, pet supplies', 'Lock up; take photos of the house as you leave']],
      ['During the storm', ['Stay in an interior room or closet away from windows, on the lowest floor that won’t flood', 'Don’t go out in the eye: winds return suddenly from the other direction', 'Never run a generator indoors, in a garage, or near windows', 'Flooding rising? Go up, not into the attic without an axe or exit']],
      ['After', ['Wait for the all-clear; most deaths happen after the storm', 'Stay out of floodwater (sewage, live wires, snakes, fire ants, hidden holes)', 'Treat every downed line as live; report it', 'Generator 20+ ft from the house; check CO alarms', 'Photograph damage before cleaning up, for insurance', 'Follow boil-water notices', 'Check on neighbors']]
    ] },
    { id: 'tornado', icon: '🌪️', title: 'Tornado', art: 'weather/tornado', phases: [
      ['Before storm season', ['Pick your shelter: basement, or lowest-floor interior room with no windows (closet, bathroom)', 'Mobile home? Know the nearest sturdy building you can reach in a few minutes', 'Turn on Wireless Emergency Alerts; set a weather radio to alert', 'Put shoes, helmets (bike/sports), flashlight and whistle in the shelter']],
      ['Tornado watch (conditions possible)', ['Charge phones; keep them on you', 'Keep shoes on and car keys handy', 'Know where everyone is; bring pets inside', 'Mobile home or RV: go to the sturdy building early']],
      ['Tornado warning (take cover NOW)', ['Into the shelter immediately; don’t stop to look', 'Get as low as possible; cover heads and necks with arms, helmets, a mattress or heavy blankets', 'In a car with no building nearby: buckle up, get below the windows and cover your head, or lie in a ditch lower than the road', 'Never shelter under a highway overpass']],
      ['After', ['Watch for downed lines, broken glass, nails, and gas smell (leave and don’t switch lights on)', 'Wear sturdy shoes and gloves for cleanup', 'Text rather than call so networks stay open', 'Photograph damage for insurance']]
    ] },
    { id: 'flood', icon: '🌊', title: 'Flood / flash flood', art: 'weather/flood', phases: [
      ['Before', ['Know if your home, work or route crosses a flood zone or low water crossing', 'Move valuables and documents up high', 'Clear gutters and storm drains near the home', 'Plan a route to high ground on foot and by car']],
      ['Flood watch / heavy rain', ['Keep vehicle fueled and pointed out of the driveway', 'Move cars to higher ground if your street floods', 'Pack go-bags; charge phones']],
      ['Flash flood warning', ['Go to higher ground NOW; don’t wait to see water', 'Turn around, don’t drown: 6 in of moving water knocks you down; 12 in floats a car', 'Never drive into water over the road, even if others did', 'Trapped in a car with rising water: unbuckle, open the window, get out and onto the roof', 'At night be extra careful; you can’t see road washouts']],
      ['After', ['Don’t return until officials say it’s safe', 'Turn off electricity at the main if water reached outlets (only if you’re dry)', 'Throw out food and medicine that touched floodwater', 'Mold starts in 24–48 h: dry and remove soaked drywall and carpet']]
    ] },
    { id: 'winter', icon: '🧊', title: 'Ice / winter storm', art: 'weather/winter', phases: [
      ['Before', ['Insulate exposed pipes; know where the water main shutoff is', 'Firewood, propane or kerosene with proper indoor-rated heater', 'CO detectors with fresh batteries', 'Extra blankets and sleeping bags; warm hats', 'Car kit: blanket, scraper, sand/kitty litter, jumper cables, snacks']],
      ['Winter storm warning', ['Let faucets drip on outside walls; open sink cabinet doors', 'Fill tanks and cans; charge everything', 'Stay off the roads; bridges and overpasses freeze first', 'Bring pets inside']],
      ['Power goes out', ['Pick one room to heat; close other doors; hang blankets over windows and doors', 'Never use a grill, camp stove or generator indoors', 'Everyone wears hats; layers, and sleep together under blankets', 'Keep fridge closed; put food outside in a cooler if it’s below 40°F']],
      ['After', ['Check pipes for leaks as they thaw', 'Watch for falling ice and limbs; ice-coated lines may be down', 'Check on neighbors, especially the elderly']]
    ] },
    { id: 'outage', icon: '🔌', title: 'Long power outage', art: 'power/generator', phases: [
      ['First hour', ['Check the breaker box; see if neighbors are out too', 'Report the outage to your utility', 'Unplug electronics to avoid surge damage when power returns', 'Keep fridge and freezer closed (fridge ≈4 h, full freezer ≈48 h)']],
      ['First day', ['Use coolers with ice for medicines and food you’ll eat first', 'Set up the generator outdoors (20+ ft from windows); run heavy extension cords', 'Plan meals: eat from fridge first, then freezer, then pantry', 'Conserve phone batteries: low power mode, airplane mode when idle', 'Heat or cold: plan where people will sleep safely']],
      ['Multi-day', ['Rotate fuel; run generator in cycles (e.g. 4 h on / 4 h off)', 'Sanitation plan if water pressure fails (bucket toilet, bags + kitty litter)', 'Water: fill containers; treat if there’s a boil notice', 'Check in on neighbors; share resources and information', 'Keep a written log of food you threw out for insurance']]
    ] }
  ];
  route(/^\/storm$/, () => {
    setTitle('Storm checklists', '#/more');
    const st = store.get('stormChecks', {});
    view.innerHTML = `<p class="small muted">Check things off as you go. Your progress is saved, so you can tick items across several days as a storm approaches.</p>
      <div class="list">${STORMS.map(s => { const all = s.phases.reduce((t, p) => t + p[1].length, 0), done = Object.keys(st[s.id] || {}).length; return `<a class="row" href="#/storm/${s.id}"><span class="i">${s.icon}</span><span class="t"><b>${esc(s.title)}</b><small>${done ? done + ' of ' + all + ' done' : all + ' items'}</small></span><span class="chev">›</span></a>`; }).join('')}</div>`;
  });
  route(/^\/storm\/([\w-]+)$/, m => {
    const s = STORMS.find(x => x.id === m[1]); if (!s) return (location.hash = '#/storm');
    setTitle(s.icon + ' ' + s.title, '#/storm');
    const draw = () => {
      const st = store.get('stormChecks', {}), mine = st[s.id] || {}, all = s.phases.reduce((t, p) => t + p[1].length, 0), done = Object.keys(mine).length;
      view.innerHTML = `<div class="card" style="padding:10px 14px"><div class="progress"><i style="width:${Math.round(done / all * 100)}%"></i></div><div class="small muted" style="margin-top:6px">${done} of ${all} done · <a href="#/a/${s.art}">Full guide ›</a></div></div>
        ${s.phases.map(([ph, items], pi) => `<h2 class="section">${esc(ph)}</h2><div class="card checklist" style="padding:4px 0">${items.map((it, ii) => { const k = pi + '.' + ii; return `<label class="chk"><input type="checkbox" data-k="${k}" ${mine[k] ? 'checked' : ''}><span class="t">${esc(it)}</span></label>`; }).join('')}</div>`).join('')}
        <div class="btnrow"><button class="btn" id="stReset">Reset this list</button><button class="btn" onclick="window.print()">🖨️ Print</button></div>`;
      view.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { const st = store.get('stormChecks', {}); const mm = st[s.id] = st[s.id] || {}; if (c.checked) mm[c.dataset.k] = Date.now(); else delete mm[c.dataset.k]; store.set('stormChecks', st); const y = main.scrollTop; draw(); main.scrollTop = y; });
      $('#stReset').onclick = () => { if (!confirm('Uncheck everything in this list?')) return; const st = store.get('stormChecks', {}); delete st[s.id]; store.set('stormChecks', st); draw(); };
    };
    const main = document.querySelector('main'); draw();
  });

  // ======================= Spanish emergency phrases =======================
  const PHR = [
    ['🆘 Emergency', [['Help!', '¡Ayuda!', 'ah-YOO-dah'], ['Call 911!', '¡Llame al 911!', 'YAH-meh ahl nweh-veh OO-noh OO-noh'], ['There’s been an accident.', 'Hubo un accidente.', 'OO-boh oon ahk-see-DEN-teh'], ['Someone is hurt.', 'Hay una persona herida.', 'eye OO-nah pehr-SOH-nah eh-REE-dah'], ['Fire!', '¡Fuego!', 'FWEH-goh'], ['Get out! Go now!', '¡Salgan! ¡Váyanse ya!', 'SAHL-gahn, VAH-yahn-seh yah'], ['Is anyone trapped?', '¿Hay alguien atrapado?', 'eye AHL-gyen ah-trah-PAH-doh'], ['Stay calm.', 'Mantenga la calma.', 'mahn-TEN-gah lah KAHL-mah'], ['I am here to help you.', 'Estoy aquí para ayudarle.', 'ehs-TOY ah-KEE PAH-rah ah-yoo-DAR-leh'], ['Don’t move.', 'No se mueva.', 'noh seh MWEH-vah']]],
    ['🩺 Medical questions', [['Where does it hurt?', '¿Dónde le duele?', 'DOHN-deh leh DWEH-leh'], ['Can you breathe?', '¿Puede respirar?', 'PWEH-deh rehs-pee-RAR'], ['Are you allergic to anything?', '¿Es alérgico a algo?', 'ehs ah-LEHR-hee-koh ah AHL-goh'], ['Do you take any medicines?', '¿Toma algún medicamento?', 'TOH-mah ahl-GOON meh-dee-kah-MEN-toh'], ['Are you diabetic?', '¿Es diabético?', 'ehs dee-ah-BEH-tee-koh'], ['Are you pregnant?', '¿Está embarazada?', 'ehs-TAH em-bah-rah-SAH-dah'], ['Did you hit your head?', '¿Se golpeó la cabeza?', 'seh gohl-peh-OH lah kah-BEH-sah'], ['Did you lose consciousness?', '¿Perdió el conocimiento?', 'pehr-DYOH el koh-noh-see-MYEN-toh'], ['Show me with one finger.', 'Muéstreme con un dedo.', 'MWEHS-treh-meh kohn oon DEH-doh'], ['Squeeze my hand.', 'Apriete mi mano.', 'ah-PRYEH-teh mee MAH-noh'], ['On a scale of 1 to 10, how much pain?', 'Del 1 al 10, ¿cuánto dolor tiene?', 'del OO-noh ahl dyehs, KWAN-toh doh-LOR TYEH-neh'], ['What is your name?', '¿Cómo se llama?', 'KOH-moh seh YAH-mah'], ['How old are you?', '¿Cuántos años tiene?', 'KWAN-tohs AH-nyohs TYEH-neh'], ['Yes / No', 'Sí / No', 'see / noh']]],
    ['🩹 Telling them what you’ll do', [['I’m going to help you.', 'Le voy a ayudar.', 'leh voy ah ah-yoo-DAR'], ['I’m going to press hard to stop the bleeding.', 'Voy a apretar fuerte para parar la sangre.', 'voy ah ah-preh-TAR FWEHR-teh PAH-rah pah-RAR lah SAHN-greh'], ['This will hurt.', 'Esto le va a doler.', 'EHS-toh leh vah ah doh-LEHR'], ['An ambulance is coming.', 'Viene una ambulancia.', 'VYEH-neh OO-nah ahm-boo-LAHN-syah'], ['Lie down.', 'Acuéstese.', 'ah-KWEHS-teh-seh'], ['Sit down.', 'Siéntese.', 'SYEN-teh-seh'], ['Drink water slowly.', 'Tome agua despacio.', 'TOH-meh AH-gwah dehs-PAH-syoh'], ['Breathe slowly.', 'Respire despacio.', 'rehs-PEE-reh dehs-PAH-syoh']]],
    ['🧭 Directions & needs', [['Where is the hospital?', '¿Dónde está el hospital?', 'DOHN-deh ehs-TAH el ohs-pee-TAHL'], ['Where is there water?', '¿Dónde hay agua?', 'DOHN-deh eye AH-gwah'], ['We need food and water.', 'Necesitamos comida y agua.', 'neh-seh-see-TAH-mohs koh-MEE-dah ee AH-gwah'], ['Is the road open?', '¿Está abierta la carretera?', 'ehs-TAH ah-BYEHR-tah lah kah-reh-TEH-rah'], ['Left / Right / Straight ahead', 'Izquierda / Derecha / Derecho', 'ees-KYEHR-dah / deh-REH-chah / deh-REH-choh'], ['Shelter', 'Refugio', 'reh-FOO-hyoh'], ['Do you have a phone?', '¿Tiene un teléfono?', 'TYEH-neh oon teh-LEH-foh-noh'], ['Do you speak English?', '¿Habla inglés?', 'AH-blah een-GLEHS'], ['Please speak slowly.', 'Hable despacio, por favor.', 'AH-bleh dehs-PAH-syoh, por fah-VOR'], ['Thank you.', 'Gracias.', 'GRAH-syahs']]]
  ];
  TOOL_LIST.push({ id: 'phrases', href: '#/phrases', icon: '🗣️', title: 'Spanish emergency phrases', sum: 'Big‑text phrases to show, with pronunciation and audio', k: 'spanish translate translation language phrases espanol help medical words' });
  route(/^\/phrases$/, () => {
    setTitle('Spanish phrases', '#/more');
    const canSpeak = 'speechSynthesis' in window;
    view.innerHTML = `<p class="small muted">Tap a phrase to show it full‑screen so the other person can read it.${canSpeak ? ' 🔊 plays it aloud using your device’s Spanish voice (works offline on iPhone).' : ''}</p>
      ${PHR.map(([cat, list], ci) => `<h2 class="section">${cat}</h2><div class="list">${list.map(([en, es, pr], i) => `<a class="row" href="#" data-ph="${ci}.${i}"><span class="t"><b>${esc(es)}</b><small>${esc(en)} · <i>${esc(pr)}</i></small></span>${canSpeak ? `<button class="btn" data-say="${ci}.${i}" style="min-height:36px;padding:0 10px" aria-label="Say it">🔊</button>` : ''}</a>`).join('')}</div>`).join('')}`;
    const get = k => { const [a, b] = k.split('.').map(Number); return PHR[a][1][b]; };
    const say = es => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(es.replace(/ \/ /g, ', ')); u.lang = 'es-MX'; const v = speechSynthesis.getVoices().find(v => /^es/i.test(v.lang)); if (v) { u.voice = v; u.lang = v.lang; } u.rate = 0.85; speechSynthesis.speak(u); } catch (e) { } };
    view.querySelectorAll('[data-say]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); say(get(b.dataset.say)[1]); });
    view.querySelectorAll('[data-ph]').forEach(a => a.onclick = e => {
      e.preventDefault(); const [en, es, pr] = get(a.dataset.ph);
      const el = document.createElement('div'); el.className = 'phrasefull';
      el.innerHTML = `<div class="es">${esc(es)}</div><div class="pr">${esc(pr)}</div><div class="en">${esc(en)}</div><div class="btnrow" style="justify-content:center">${canSpeak ? '<button class="btn pri" data-s>🔊 Say it</button>' : ''}<button class="btn" data-x>Close</button></div>`;
      document.body.appendChild(el); el.querySelector('[data-x]').onclick = () => el.remove(); window.addEventListener('hashchange', () => el.remove(), { once: true }); const s = el.querySelector('[data-s]'); if (s) s.onclick = () => say(es);
    });
  });

  // ======================= Printable field binder =======================
  const BINDER_DEFAULT = ['firstaid/assessment', 'firstaid/bleeding', 'firstaid/cpr', 'firstaid/choking', 'firstaid/shock', 'firstaid/burns', 'firstaid/heat', 'firstaid/cold', 'firstaid/allergy', 'wildlife/snakes', 'water/purify', 'water/finding', 'fire/methods', 'shelter/tarp', 'navigation/lost', 'navigation/natural', 'signal/signals', 'signal/radio', 'basics/stranded-car', 'basics/first-72', 'knots/bowline', 'knots/hitches', 'dogs/'];
  route(/^\/binder$/, () => {
    setTitle('Printable field binder', '#/more');
    const sel = new Set(store.get('binderSel', BINDER_DEFAULT));
    const cats = Object.values(catById);
    view.innerHTML = `<div class="box info small">Phones die and get wet. Print the pages you’d want with no power and keep them in a zip bag in the car and your go‑bag. On iPhone: tap <b>Print / Save PDF</b>, then the Share button in the print preview → <i>Save to Files</i> to keep a PDF copy.</div>
      <div class="card"><h3>Your info</h3>
        <label class="chk"><input type="checkbox" data-b="#ice" ${sel.has('#ice') || !store.get('binderSel') ? 'checked' : ''}><span>🆔 Emergency info card</span></label>
        <label class="chk"><input type="checkbox" data-b="#plan" ${sel.has('#plan') || !store.get('binderSel') ? 'checked' : ''}><span>👪 Family emergency plan</span></label>
        <label class="chk"><input type="checkbox" data-b="#flow" ${sel.has('#flow') || !store.get('binderSel') ? 'checked' : ''}><span>🚑 First aid step by step (all flowcharts, as lists)</span></label></div>
      ${cats.map(c => `<details class="grp"><summary><b>${c.icon} ${esc(c.title)}</b> <span class="small muted" data-cnt="${c.id}"></span></summary>
        <label class="chk"><input type="checkbox" data-b="${c.id}/" ${sel.has(c.id + '/') ? 'checked' : ''}><span><b>Whole section</b> (${c.articles.length} articles)</span></label>
        ${c.articles.map(a => `<label class="chk"><input type="checkbox" data-b="${c.id}/${a.id}" ${sel.has(c.id + '/' + a.id) ? 'checked' : ''}><span>${esc(a.title)}</span></label>`).join('')}</details>`).join('')}
      <div class="btnrow" style="position:sticky;bottom:8px"><a class="btn pri" href="#/binder/print">🖨️ Print / Save PDF</a><button class="btn" id="bdReset">Reset to suggested</button></div>`;
    const cnt = () => { const s = store.get('binderSel', BINDER_DEFAULT); cats.forEach(c => { const n = s.includes(c.id + '/') ? c.articles.length : s.filter(k => k.startsWith(c.id + '/') && k !== c.id + '/').length; const el = view.querySelector(`[data-cnt="${c.id}"]`); if (el) el.textContent = n ? n + ' selected' : ''; }); };
    view.querySelectorAll('[data-b]').forEach(c => c.onchange = () => { const s = new Set([...view.querySelectorAll('[data-b]')].filter(x => x.checked).map(x => x.dataset.b)); store.set('binderSel', [...s]); cnt(); });
    if (!store.get('binderSel')) store.set('binderSel', ['#ice', '#plan', '#flow', ...BINDER_DEFAULT]);
    $('#bdReset').onclick = () => { store.set('binderSel', null); window.FG.render(); };
    cnt();
  });
  route(/^\/binder\/print$/, () => {
    setTitle('Field binder', '#/binder');
    const sel = store.get('binderSel', ['#ice', '#plan', '#flow', ...BINDER_DEFAULT]);
    const parts = [];
    if (sel.includes('#ice') && window.FG.iceHTML) parts.push(window.FG.iceHTML());
    if (sel.includes('#plan') && window.FG.planHTML) parts.push(window.FG.planHTML());
    if (sel.includes('#flow')) parts.push(`<section class="binder-sec"><h1>🚑 First aid step by step</h1>${window.FG.FLOW.map(f => `<h2>${f.icon} ${esc(f.title)}</h2>${flowText(f)}`).join('')}</section>`);
    const toc = [];
    Object.values(catById).forEach(c => {
      const arts = sel.includes(c.id + '/') ? c.articles : c.articles.filter(a => sel.includes(c.id + '/' + a.id));
      if (!arts.length) return; toc.push(c.icon + ' ' + c.title + ': ' + arts.map(a => a.title).join(', '));
      parts.push(`<section class="binder-sec"><h1>${c.icon} ${esc(c.title)}</h1>${arts.map(a => `<article class="binder-art"><h2>${esc(a.title)}</h2>${a.body}</article>`).join('')}</section>`);
    });
    view.innerHTML = `<div class="btnrow noprint"><button class="btn pri" id="bdPrint">🖨️ Print / Save PDF</button><a class="btn" href="#/binder">Change pages</a></div>
      <div class="binder"><div class="binder-cover"><h1>Field Guide: printed backup</h1><p>Printed ${new Date().toLocaleDateString()}. Keep dry. Replace yearly.</p><ul class="small">${toc.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>${parts.join('')}</div>`;
    $('#bdPrint').onclick = () => {
      const imgs = [...view.querySelectorAll('img')]; imgs.forEach(i => i.loading = 'eager');
      Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }))).then(() => window.print());
    };
  });
  function flowText(f) { // flatten a flowchart into a printable outline
    const seen = new Set();
    const walk = (id, depth) => {
      if (seen.has(id) || depth > 6) return ''; seen.add(id); const n = f.nodes[id]; if (!n) return '';
      if (n.q) return `<div class="fq"><b>❓ ${n.q}</b><div class="fa"><b>YES →</b>${walk(n.yes, depth + 1)}</div><div class="fa"><b>NO →</b>${walk(n.no, depth + 1)}</div></div>`;
      return `<ul>${n.do.map(x => `<li>${x}</li>`).join('')}</ul>${n.next ? walk(n.next, depth + 1) : ''}`;
    };
    return walk('start', 0);
  }
  TOOL_LIST.push({ id: 'binder', href: '#/binder', icon: '🖨️', title: 'Printable field binder', sum: 'Print or save a PDF of the pages you choose', k: 'print pdf paper backup binder offline copy' });
  TOOL_LIST.push({ id: 'storm', href: '#/storm', icon: '🌀', title: 'Storm checklists', sum: 'Hurricane, tornado, flood, ice storm, power outage', k: 'hurricane tornado flood winter ice storm outage checklist prepare countdown' });
})();
