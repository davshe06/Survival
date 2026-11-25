/* Extra tools: text my location, emergency info card, supplies tracker with expirations, family emergency plan,
   tide predictions, radio repeaters (user-imported), backup reminder. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $, TOOL_LIST } = window.FG;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const smsHref = (num, body) => 'sms:' + (num || '') + (isIOS ? '&' : '?') + 'body=' + encodeURIComponent(body);
  const telHref = num => 'tel:' + String(num || '').replace(/[^\d+]/g, '');
  const getPos = (opts = {}) => new Promise((res, rej) => navigator.geolocation ? navigator.geolocation.getCurrentPosition(res, rej, Object.assign({ enableHighAccuracy: true, timeout: 30000, maximumAge: 15000 }, opts)) : rej(new Error('No GPS')));
  const units = () => window.FG.units();

  TOOL_LIST.unshift(
    { id: 'share', icon: '📲', title: 'Text my location', sum: 'Send your GPS position by text to 911 or a contact', k: 'sos text sms share location 911 help send coordinates' },
    { id: 'tides', icon: '🌊', title: 'Tides', sum: 'High & low tides for 2,100+ coastal stations, Virginia to the Gulf plus NJ & NY (offline)', k: 'tide tides high low coast beach marsh ocean water level' },
    { id: 'radio', icon: '📻', title: 'Radio & repeaters', sum: 'Emergency frequencies + your imported repeater list', k: 'radio repeater ham gmrs frs frequency chirp repeaterbook' }
  );

  // ======================= Text my location =======================
  route(/^\/tools\/share$/, () => {
    setTitle('Text my location', '#/tools');
    const ice = store.get('ice', {}); const contacts = (ice.contacts || []).filter(c => c.phone);
    view.innerHTML = `
      <div class="card"><div id="shSt" class="small muted">Getting your GPS position…</div><div class="big mono" id="shPos" style="margin-top:6px">—</div><div class="small mono muted" id="shMgrs"></div>
        <label class="f" for="shMsg">Message</label>
        <select class="inp" id="shKind"><option value="help">I need help</option><option value="ok">I'm OK — here is where I am</option><option value="med">Medical emergency</option><option value="custom">Custom…</option></select>
        <textarea class="inp" id="shExtra" rows="2" placeholder="Optional: what happened, how many people, injuries" style="margin-top:8px"></textarea></div>
      <div class="list" id="shBtns"></div>
      <div class="box info small"><b class="lbl">Why text?</b>Texts need far less signal than calls and keep retrying. Text‑to‑911 works in most counties — if it isn't available you'll get a bounce‑back message, so call instead. iPhone 14 and newer can also text 911 by satellite with no service (Settings → Emergency SOS).</div>
      <p class="small muted">Add contacts in your <a href="#/ice">Emergency info card</a> to text them with one tap.</p>`;
    let pos = null;
    const body = () => {
      const k = $('#shKind').value, extra = $('#shExtra').value.trim();
      const head = { help: 'I NEED HELP.', ok: "I'm OK.", med: 'MEDICAL EMERGENCY.', custom: '' }[k];
      if (!pos) return (head + ' (GPS not available yet) ' + extra).trim();
      const c = pos.coords, la = c.latitude.toFixed(5), lo = c.longitude.toFixed(5);
      return `${head} My location: ${la}, ${lo} (±${Math.round(c.accuracy)} m) · MGRS ${Geo.toMGRS(c.latitude, c.longitude)} · ${new Date(pos.timestamp).toLocaleString()}${extra ? ' · ' + extra : ''} · Map: https://maps.apple.com/?ll=${la},${lo}&q=${la},${lo}`.trim();
    };
    const draw = () => {
      $('#shBtns').innerHTML = `<a class="row" href="${smsHref('911', body())}"><span class="i">🚨</span><span class="t"><b>Text 911</b><small>Opens Messages with your location filled in</small></span><span class="chev">›</span></a>` +
        contacts.map(c => `<a class="row" href="${smsHref(c.phone, body())}"><span class="i">💬</span><span class="t"><b>Text ${esc(c.name || c.phone)}</b><small>${esc(c.rel || '')} ${esc(c.phone)}</small></span><span class="chev">›</span></a>`).join('') +
        `<a class="row" href="${smsHref('', body())}"><span class="i">✉️</span><span class="t"><b>Text someone else</b><small>Choose the recipient in Messages</small></span><span class="chev">›</span></a>` +
        (navigator.share ? `<a class="row" href="#" id="shShare"><span class="i">📤</span><span class="t"><b>Share another way</b><small>WhatsApp, email, AirDrop…</small></span><span class="chev">›</span></a>` : '') +
        `<a class="row" href="#" id="shCopy"><span class="i">📋</span><span class="t"><b>Copy message</b><small>Paste it anywhere</small></span><span class="chev">›</span></a>`;
      const sh = $('#shShare'); if (sh) sh.onclick = e => { e.preventDefault(); navigator.share({ text: body() }).catch(() => { }); };
      $('#shCopy').onclick = e => { e.preventDefault(); (navigator.clipboard ? navigator.clipboard.writeText(body()) : Promise.reject()).then(() => toast('Copied'), () => prompt('Copy:', body())); };
    };
    $('#shKind').onchange = draw; $('#shExtra').oninput = draw; draw();
    const id = navigator.geolocation ? navigator.geolocation.watchPosition(p => {
      pos = p; const c = p.coords; $('#shSt').textContent = 'GPS fix ✓ ±' + Geo.fmtDist(c.accuracy, units());
      $('#shPos').textContent = c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5); $('#shMgrs').textContent = Geo.toMGRS(c.latitude, c.longitude); draw();
    }, e => { $('#shSt').textContent = window.FG.gpsErrText(e); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 60000 }) : null;
    return () => { if (id != null) navigator.geolocation.clearWatch(id); };
  });

  // ======================= Emergency info card =======================
  const ICE_FIELDS = [['name', 'Full name'], ['dob', 'Date of birth'], ['blood', 'Blood type'], ['allergies', 'Allergies', 1], ['meds', 'Medications & doses', 1], ['conditions', 'Medical conditions', 1], ['devices', 'Implants / devices (pacemaker, insulin pump…)'], ['doctor', 'Doctor & phone'], ['insurance', 'Insurance (company, member #)'], ['notes', 'Other notes (organ donor, language, religious wishes)', 1]];
  route(/^\/ice$/, (m, q) => {
    setTitle('Emergency info', '#/more');
    const ice = store.get('ice', { contacts: [{}, {}, {}] }); while ((ice.contacts || []).length < 3) (ice.contacts = ice.contacts || []).push({});
    const has = ice.name || ice.allergies || ice.meds || ice.contacts.some(c => c.phone);
    if (q.get('edit') || !has) {
      view.innerHTML = `<div class="box info small">This card is stored only on this device. Also fill in <b>Medical ID</b> on your iPhone (Health app → profile → Medical ID, turn on <i>Show When Locked</i>) so responders can see it without unlocking your phone.</div>
        <div class="card">${ICE_FIELDS.map(([k, l, big]) => `<label class="f" for="ice_${k}">${l}</label>${big ? `<textarea class="inp" id="ice_${k}" rows="2">${esc(ice[k] || '')}</textarea>` : `<input class="inp" id="ice_${k}" value="${esc(ice[k] || '')}">`}`).join('')}</div>
        <div class="card"><h3>Emergency contacts</h3>${ice.contacts.map((c, i) => `<div class="two"><div><label class="f">Name</label><input class="inp" id="icn${i}" value="${esc(c.name || '')}"></div><div><label class="f">Phone</label><input class="inp" id="icp${i}" type="tel" value="${esc(c.phone || '')}"></div></div><label class="f">Relationship</label><input class="inp" id="icr${i}" value="${esc(c.rel || '')}">`).join('<hr style="border:0;border-top:1px solid var(--line);margin:12px 0">')}</div>
        <div class="btnrow"><button class="btn pri" id="iceSave">Save card</button>${has ? '<a class="btn" href="#/ice">Cancel</a>' : ''}</div>`;
      $('#iceSave').onclick = () => {
        const n = { contacts: [] }; ICE_FIELDS.forEach(([k]) => n[k] = $('#ice_' + k).value.trim());
        for (let i = 0; i < 3; i++) n.contacts.push({ name: $('#icn' + i).value.trim(), phone: $('#icp' + i).value.trim(), rel: $('#icr' + i).value.trim() });
        store.set('ice', n); toast('Saved'); if (location.hash === '#/ice') window.FG.render(); else location.hash = '#/ice';
      };
      return;
    }
    view.innerHTML = `<div class="ice"><div class="icehead">⚕️ EMERGENCY INFORMATION</div>
      <div class="icebody"><div class="big">${esc(ice.name || '')}</div>${ice.dob ? `<div>Born ${esc(ice.dob)}</div>` : ''}
      <dl class="kv" style="margin-top:10px">${ICE_FIELDS.slice(2).filter(([k]) => ice[k]).map(([k, l]) => `<dt>${l}</dt><dd style="white-space:pre-wrap"><b>${esc(ice[k])}</b></dd>`).join('')}</dl></div></div>
      <h2 class="section">Emergency contacts</h2><div class="list">${ice.contacts.filter(c => c.phone).map(c => `<a class="row" href="${telHref(c.phone)}"><span class="i">📞</span><span class="t"><b>${esc(c.name || c.phone)}</b><small>${esc(c.rel || '')} · ${esc(c.phone)}</small></span><span class="chev">Call</span></a>`).join('') || '<p class="muted">No contacts yet.</p>'}</div>
      <div class="btnrow"><a class="btn" href="#/ice?edit=1">✏️ Edit</a><a class="btn" href="#/tools/share">📲 Text my location</a><button class="btn" onclick="window.print()">🖨️ Print</button></div>`;
  });

  // printable versions for the field binder
  window.FG.iceHTML = () => { const ice = store.get('ice', {}); if (!ice.name && !ice.allergies && !(ice.contacts || []).some(c => c.phone)) return ''; return `<section class="binder-sec"><div class="ice"><div class="icehead">⚕️ EMERGENCY INFORMATION</div><div class="icebody"><div class="big">${esc(ice.name || '')}</div>${ice.dob ? `<div>Born ${esc(ice.dob)}</div>` : ''}<dl class="kv" style="margin-top:10px">${ICE_FIELDS.slice(2).filter(([k]) => ice[k]).map(([k, l]) => `<dt>${l}</dt><dd style="white-space:pre-wrap"><b>${esc(ice[k])}</b></dd>`).join('')}${(ice.contacts || []).filter(c => c.phone).map(c => `<dt>Contact${c.rel ? ' (' + esc(c.rel) + ')' : ''}</dt><dd><b>${esc(c.name || '')} ${esc(c.phone)}</b></dd>`).join('')}</dl></div></div></section>`; };
  window.FG.planHTML = () => { const p = store.get('plan', {}); const rows = PLAN.filter(([k]) => (p[k] || '').trim()); return rows.length ? `<section class="binder-sec"><h1>👪 Family emergency plan</h1><dl class="kv">${rows.map(([k, l]) => `<dt>${esc(l)}</dt><dd style="white-space:pre-wrap">${esc(p[k])}${p[k + '_ll'] ? `<br><span class="small">GPS ${p[k + '_ll'][0].toFixed(5)}, ${p[k + '_ll'][1].toFixed(5)}</span>` : ''}</dd>`).join('')}</dl></section>` : ''; };

  // ======================= Supplies tracker =======================
  const SUP_PRESETS = [['💧 Water (gallons)', 'Water', 'gal', 6], ['🥫 Canned food', 'Food', 'cans', 24], ['🍫 Food bars', 'Food', 'bars', 12], ['💊 Prescription meds', 'Medical', 'days', 0], ['🩹 First aid kit', 'Medical', 'kit', 6], ['🔋 Batteries', 'Power', 'pack', 60], ['🧴 Bleach', 'Water', 'bottle', 12], ['⛽ Gas (stabilized)', 'Fuel', 'gal', 12], ['🔥 Propane', 'Fuel', 'tank', 0], ['🧯 Fire extinguisher', 'Safety', 'unit', 60], ['🐕 Pet food', 'Pets', 'bag', 12], ['🍼 Baby supplies', 'Family', 'pack', 12]];
  const daysTo = d => d ? Math.floor((new Date(d + 'T12:00') - new Date()) / 864e5) : null;
  function supStatus(s) { const d = daysTo(s.exp); if (d == null) return ['', '']; if (d < 0) return ['pri-1', 'Expired']; if (d <= 30) return ['pri-2', d + ' days']; if (d <= 90) return ['pri-3', Math.round(d / 7) + ' wks']; return ['', new Date(s.exp + 'T12:00').toLocaleDateString([], { month: 'short', year: 'numeric' })]; }
  window.FG.suppliesAlert = () => store.get('supplies', []).filter(s => { const d = daysTo(s.exp); return d != null && d <= 30; }).length;
  route(/^\/supplies$/, () => {
    setTitle('Supplies & expiration', '#/more');
    const draw = () => {
      const list = store.get('supplies', []).slice().sort((a, b) => (a.exp || '9999') < (b.exp || '9999') ? -1 : 1);
      const bad = list.filter(s => { const d = daysTo(s.exp); return d != null && d < 0; }).length, soon = list.filter(s => { const d = daysTo(s.exp); return d != null && d >= 0 && d <= 30; }).length;
      view.innerHTML = `${bad || soon ? `<div class="box ${bad ? 'danger' : 'warn'}">${bad ? `<b>${bad} expired</b> ` : ''}${soon ? `<b>${soon} expiring within 30 days</b>` : ''} — replace or rotate them into everyday use.</div>` : ''}
        <div class="card"><h3>Add item</h3><div class="btnrow">${SUP_PRESETS.map((p, i) => `<button class="btn" data-pre="${i}" style="min-height:36px">${p[0]}</button>`).join('')}</div>
          <label class="f">Item</label><input class="inp" id="suN" placeholder="e.g. Water jugs">
          <div class="two"><div><label class="f">Quantity</label><input class="inp" id="suQ" inputmode="decimal"></div><div><label class="f">Unit</label><input class="inp" id="suU" placeholder="gal, cans, days…"></div></div>
          <div class="two"><div><label class="f">Expires / replace by</label><input class="inp" type="date" id="suE"></div><div><label class="f">Where</label><select class="inp" id="suW"><option>Car</option><option>Home</option><option>Go‑bag</option><option>Other</option></select></div></div>
          <input type="hidden" id="suC"><div class="btnrow"><button class="btn pri" id="suAdd">Add</button></div></div>
        <div class="list">${list.map(s => { const [c, t] = supStatus(s); return `<div class="row"><span class="t"><b>${esc(s.n)}</b><small>${esc([s.q && s.q + ' ' + (s.u || ''), s.w].filter(Boolean).join(' · '))}</small></span>${t ? `<span class="pri-badge ${c}" style="white-space:nowrap">${t}</span>` : ''}<button class="btn" data-ren="${s.id}" style="min-height:34px;padding:0 10px" title="Replaced — set a new date">↻</button><button class="btn" data-del="${s.id}" style="min-height:34px;padding:0 10px">✕</button></div>`; }).join('') || '<p class="muted">Track water, food, medicine, batteries, bleach and fuel with their expiration dates. You\'ll see a warning on the home screen 30 days before anything expires.</p>'}</div>
        <p class="small muted">Typical shelf life: bottled water 1–2 yrs (rotate in heat) · bleach ~1 yr · canned food 2–5 yrs · alkaline batteries 5–10 yrs · gas without stabilizer 3–6 months, with stabilizer 1–2 yrs.</p>`;
      view.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => { const p = SUP_PRESETS[+b.dataset.pre]; $('#suN').value = p[0].replace(/^\S+\s/, ''); $('#suU').value = p[2]; $('#suC').value = p[1]; if (p[3]) { const d = new Date(); d.setMonth(d.getMonth() + p[3]); $('#suE').value = d.toISOString().slice(0, 10); } $('#suQ').focus(); });
      $('#suAdd').onclick = () => { const n = $('#suN').value.trim(); if (!n) return toast('Enter an item'); const a = store.get('supplies', []); a.push({ id: Date.now(), n, q: $('#suQ').value, u: $('#suU').value, exp: $('#suE').value, w: $('#suW').value, c: $('#suC').value }); store.set('supplies', a); draw(); };
      view.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Delete this item?')) return; store.set('supplies', store.get('supplies', []).filter(s => s.id != b.dataset.del)); draw(); });
      view.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => { const a = store.get('supplies', []); const s = a.find(x => x.id == b.dataset.ren); const d = prompt('New expiration date (YYYY-MM-DD)', s.exp || new Date().toISOString().slice(0, 10)); if (!d) return; s.exp = d; store.set('supplies', a); draw(); });
    };
    draw();
  });

  // ======================= Family emergency plan =======================
  const PLAN = [['household', 'Household members (name, phone, school/work, medical needs)', 3], ['outoftown', 'Out‑of‑town contact everyone checks in with (name & phone)', 1], ['meet1', 'Meeting place 1 — right outside home (e.g. mailbox, neighbor’s oak tree)', 1, 1], ['meet2', 'Meeting place 2 — in the neighborhood if you can’t get home', 1, 1], ['meet3', 'Meeting place 3 — out of town / evacuation destination', 1, 1], ['routes', 'Evacuation routes (primary and backup, avoid flood‑prone roads)', 2], ['kids', 'Kids: who picks up from school/daycare, school’s emergency plan', 2], ['pets', 'Pets: carrier, food, pet‑friendly shelters or hotels', 2], ['shutoffs', 'Utility shutoffs: where are the water main, gas valve, breaker panel?', 2], ['radio', 'Radio plan: channel, check‑in times (e.g. GMRS 20 on the hour)', 1], ['numbers', 'Other numbers: doctor, vet, insurance, utilities, landlord', 2], ['docs', 'Where are important documents & go‑bags kept?', 1]];
  route(/^\/plan$/, () => {
    setTitle('Family emergency plan', '#/more');
    const p = store.get('plan', {});
    view.innerHTML = `<div class="box info small">Fill this in together, then print a copy for each family member and the car. Practice the meeting places once a year. <a href="#/a/basics/first-72">First 72 hours ›</a></div>
      <div class="card" id="planCard">${PLAN.map(([k, l, rows, place]) => `<label class="f" for="pl_${k}">${l}</label><textarea class="inp" id="pl_${k}" rows="${rows}">${esc(p[k] || '')}</textarea>${place ? `<div class="btnrow" style="margin-top:4px"><button class="btn" data-here="${k}" style="min-height:34px">📍 Use my location</button>${p[k + '_ll'] ? `<span class="small muted">Saved on map: ${p[k + '_ll'][0].toFixed(5)}, ${p[k + '_ll'][1].toFixed(5)}</span>` : ''}</div>` : ''}`).join('')}</div>
      <div class="btnrow"><button class="btn pri" id="plSave">Save plan</button><button class="btn" onclick="window.print()">🖨️ Print</button></div>
      <p class="small muted">Meeting places with a location are also added to the map as 🤝 waypoints.</p>`;
    const save = () => { const n = store.get('plan', {}); PLAN.forEach(([k]) => n[k] = $('#pl_' + k).value); store.set('plan', n); };
    view.querySelectorAll('[data-here]').forEach(b => b.onclick = async () => {
      try {
        const g = await getPos(); const k = b.dataset.here; save(); const n = store.get('plan', {}); n[k + '_ll'] = [g.coords.latitude, g.coords.longitude]; store.set('plan', n);
        const w = store.get('waypoints', []).filter(x => x.planKey !== k); w.push({ id: Date.now(), planKey: k, name: '🤝 ' + ((n[k] || '').split('\n')[0].slice(0, 40) || 'Meeting place'), icon: '🤝', lat: g.coords.latitude, lon: g.coords.longitude, t: Date.now() });
        store.set('waypoints', w); toast('Saved as a map waypoint'); window.FG.render();
      } catch (e) { toast(window.FG.gpsErrText(e) || 'No GPS fix'); }
    });
    $('#plSave').onclick = () => { save(); toast('Plan saved'); };
    return save; // auto-save when leaving the page
  });

  // ======================= Tides =======================
  let TIDES = null, tideLib = null;
  async function loadTides() {
    if (!TIDES) TIDES = await (await fetch('data/tides.json')).json();
    if (!tideLib) tideLib = await import(new URL('js/vendor/tide-predictor.mjs', location.href).href);
    return TIDES;
  }
  function predict(st, start, end) {
    const ref = TIDES.refs[st.r]; const cons = ref.h.map(([name, amplitude, phase]) => ({ name, amplitude, phase }));
    const P = tideLib.createTidePredictor(cons, { offset: ref.msl || 0 });
    const shift = st.o ? Math.max(Math.abs(st.o.th), Math.abs(st.o.tl)) * 60e3 : 0;
    let ex = P.getExtremesPrediction({ start: new Date(+start - shift - 864e5 / 2), end: new Date(+end + shift + 864e5 / 2) });
    if (st.o) ex = ex.map(e => { const hi = e.high; const t = new Date(+new Date(e.time) + (hi ? st.o.th : st.o.tl) * 60e3); const m = hi ? st.o.hh : st.o.hl; return Object.assign({}, e, { time: t, level: st.o.ht === 'ratio' ? e.level * m : e.level + m }); });
    ex = ex.map(e => Object.assign({}, e, { time: new Date(e.time) })).filter(e => e.time >= start && e.time <= end);
    const curve = st.o ? null : P.getTimelinePrediction({ start, end, timeFidelity: 600 }).map(p => [new Date(p.time), p.level]);
    return { ex, curve };
  }
  const ftm = m => units() === 'met' ? m.toFixed(2) + ' m' : (m * 3.28084).toFixed(1) + ' ft';
  route(/^\/tools\/tides$/, (m, q) => {
    setTitle('Tides', '#/tools');
    view.innerHTML = '<p class="muted">Loading tide stations…</p>';
    let alive = true;
    loadTides().then(async () => {
      if (!alive) return;
      let here = store.get('lastpos', null);
      try { const g = await getPos({ timeout: 8000, enableHighAccuracy: false, maximumAge: 600000 }); here = { lat: g.coords.latitude, lon: g.coords.longitude }; } catch (e) { }
      if (!alive) return;
      const sts = TIDES.stations.map(s => [here ? Geo.dist(here, s) : 0, s]).sort((a, b) => a[0] - b[0]);
      const pick = q.get('s') ? TIDES.stations.find(s => s.id === q.get('s')) : sts[0][1];
      const day0 = new Date(); day0.setHours(0, 0, 0, 0); const end = new Date(+day0 + 4 * 864e5);
      const { ex, curve } = predict(pick, day0, end);
      const now = new Date(), next = ex.find(e => e.time > now);
      const byDay = {}; ex.forEach(e => { const k = e.time.toDateString(); (byDay[k] = byDay[k] || []).push(e); });
      let svg = '';
      if (curve) {
        const today = curve.filter(([t]) => t < new Date(+day0 + 864e5)); const lv = today.map(c => c[1]); const lo = Math.min(...lv), hi = Math.max(...lv);
        const X = t => (t - day0) / 864e5 * 320, Y = v => 110 - (v - lo) / Math.max(hi - lo, 0.01) * 90;
        svg = `<svg viewBox="0 0 320 130" style="width:100%;height:auto"><path d="M${today.map(([t, v]) => X(t).toFixed(1) + ',' + Y(v).toFixed(1)).join('L')}" fill="none" stroke="var(--info-line)" stroke-width="2.5"/>
          <line x1="${X(now)}" x2="${X(now)}" y1="10" y2="115" stroke="var(--danger)" stroke-dasharray="3 3"/>${[0, 6, 12, 18].map(h => `<text x="${h / 24 * 320 + 2}" y="127" font-size="9" fill="currentColor" opacity=".7">${h === 0 ? '12a' : h === 12 ? '12p' : h > 12 ? h - 12 + 'p' : h + 'a'}</text>`).join('')}</svg>`;
      }
      const T = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      view.innerHTML = `<div class="card"><h3 style="margin-bottom:2px">🌊 ${esc(pick.n)}</h3><div class="small muted">${esc(pick.st)} · ${pick.lat.toFixed(3)}, ${pick.lon.toFixed(3)}${here ? ' · ' + Geo.fmtDist(Geo.dist(here, pick), units()) + ' away' : ''}${pick.o ? ' · predicted from a nearby reference station' : ''}</div>
        ${next ? `<p class="big" style="margin:8px 0 2px">${next.high ? '⬆️ Rising' : '⬇️ Falling'} — next ${next.high ? 'high' : 'low'} at ${T(next.time)}</p>` : ''}${svg}</div>
        ${Object.entries(byDay).map(([d, list]) => `<div class="card"><h3>${new Date(d).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</h3><dl class="kv">${list.map(e => `<dt>${e.high ? '⬆️ High' : '⬇️ Low'}</dt><dd><b>${T(e.time)}</b> · ${ftm(e.level)}</dd>`).join('')}</dl></div>`).join('')}
        <div class="box warn small">Predictions from NOAA harmonic data, heights above mean lower low water (MLLW). Not for navigation — wind, storms and river flow change real water levels. Times in this device's time zone.</div>
        <h2 class="section">Other nearby stations</h2><div class="list">${sts.slice(0, 12).map(([d, s]) => `<a class="row" href="#/tools/tides?s=${encodeURIComponent(s.id)}"><span class="t"><b>${esc(s.n)}</b><small>${esc(s.st)}${here ? ' · ' + Geo.fmtDist(d, units()) : ''}</small></span><span class="chev">›</span></a>`).join('')}</div>`;
    }).catch(e => { view.innerHTML = `<p class="muted">Tide data couldn't load: ${esc(e.message)}</p>`; });
    return () => { alive = false; };
  });

  // ======================= Radio & repeaters =======================
  const FREQS = [['NOAA Weather Radio', '162.400–162.550 MHz', 'Receive only, 7 channels'], ['GMRS travel/emergency', 'Ch 20 · 462.675 MHz', 'GMRS license'], ['FRS/GMRS informal calling', 'Ch 1 · 462.5625 MHz', ''], ['CB emergency', 'Ch 9 · 27.065 MHz', 'Ch 19 = highway info'], ['2 m national simplex calling', '146.520 MHz FM', 'Ham license'], ['70 cm national simplex calling', '446.000 MHz FM', 'Ham license'], ['Marine VHF distress', 'Ch 16 · 156.800 MHz', 'Coast Guard monitored'], ['MURS', '151.820–154.600 MHz (5 ch)', 'No license, 2 W']];
  function parseCSV(text) {
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) { const c = text[i]; if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; } else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; } else f += c; }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim()));
  }
  function importRepeaters(text) {
    const rows = parseCSV(text); if (rows.length < 2) throw new Error('No rows found');
    const h = rows[0].map(x => x.trim().toLowerCase()); const col = (...names) => h.findIndex(x => names.some(n => x === n || x.replace(/[^a-z]/g, '') === n.replace(/[^a-z]/g, '')));
    const iF = col('frequency', 'output freq', 'output frequency', 'freq'), iIn = col('input freq', 'input frequency'), iOff = col('offset'), iDup = col('duplex'), iTone = col('pl', 'ctcss', 'tone', 'uplink tone', 'rtonefreq', 'pl/ctcss'),
      iCall = col('call', 'callsign', 'name'), iLoc = col('location', 'nearest city', 'city', 'comment'), iLat = col('lat', 'latitude'), iLon = col('long', 'lon', 'longitude', 'lng'), iUse = col('use', 'status');
    if (iF < 0) throw new Error('Could not find a Frequency column');
    const out = [];
    for (const r of rows.slice(1)) {
      const fq = parseFloat(r[iF]); if (!fq) continue;
      let off = ''; if (iIn >= 0 && parseFloat(r[iIn])) { const d = parseFloat(r[iIn]) - fq; off = (d > 0 ? '+' : '') + d.toFixed(3); } else if (iOff >= 0 && parseFloat(r[iOff])) off = (iDup >= 0 && r[iDup] === '-' ? '-' : '+') + parseFloat(r[iOff]).toFixed(3);
      const lat = iLat >= 0 ? parseFloat(r[iLat]) : NaN, lon = iLon >= 0 ? parseFloat(r[iLon]) : NaN;
      out.push({ f: fq.toFixed(4), o: off, t: iTone >= 0 ? r[iTone] : '', c: iCall >= 0 ? r[iCall] : '', l: iLoc >= 0 ? r[iLoc] : '', u: iUse >= 0 ? r[iUse] : '', lat: isFinite(lat) ? lat : null, lon: isFinite(lon) ? lon : null });
    }
    if (!out.length) throw new Error('No repeaters found in that file');
    return out;
  }
  route(/^\/tools\/radio$/, () => {
    setTitle('Radio & repeaters', '#/tools');
    const draw = async () => {
      const reps = store.get('repeaters', []); let here = store.get('lastpos', null);
      const list = reps.map(r => [here && r.lat != null ? Geo.dist(here, r) : null, r]).sort((a, b) => (a[0] ?? 1e12) - (b[0] ?? 1e12));
      view.innerHTML = `<div class="card"><h3>Emergency & calling frequencies</h3><dl class="kv">${FREQS.map(([n, f, s]) => `<dt>${n}</dt><dd><b class="mono">${f}</b>${s ? ' <span class="small muted">' + s + '</span>' : ''}</dd>`).join('')}</dl><p class="small"><a href="#/a/signal/radio">Radio guide ›</a></p></div>
        <div class="card"><h3>Your repeater list (${reps.length})</h3>
          <p class="small muted">Repeater directories can't be bundled, so export your own while online: <b>RepeaterBook</b> (repeaterbook.com → search your state → Export → CSV) or a <b>CHIRP</b> CSV from your radio programming. Then import it here — it's stored on this device and repeaters with coordinates appear on the map under 🏥 Places.</p>
          <div class="btnrow"><label class="btn pri">Import CSV<input type="file" id="rpIn" accept=".csv,text/csv" hidden></label>${reps.length ? '<button class="btn" id="rpClr">Clear list</button>' : ''}</div></div>
        <div class="list">${list.slice(0, 200).map(([d, r]) => `<div class="row"><span class="i">📡</span><span class="t"><b class="mono">${esc(r.f)} ${esc(r.o)}${r.t ? ' · PL ' + esc(r.t) : ''}</b><small>${esc([r.c, r.l, r.u].filter(Boolean).join(' · '))}${d != null ? ' · ' + Geo.fmtDist(d, units()) : ''}</small></span></div>`).join('')}</div>`;
      $('#rpIn').onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const r = importRepeaters(rd.result); store.set('repeaters', r); toast('Imported ' + r.length + ' repeaters'); window.FG.repeatersVer = Date.now(); draw(); } catch (err) { toast(err.message); } }; rd.readAsText(f); };
      const c = $('#rpClr'); if (c) c.onclick = () => { if (confirm('Clear the imported repeater list?')) { store.set('repeaters', []); window.FG.repeatersVer = Date.now(); draw(); } };
    };
    draw();
  });

  // ======================= Backup reminder =======================
  window.FG.backupDue = () => {
    const last = store.get('lastBackup', 0); const snoozed = store.get('backupSnooze', 0);
    const hasData = store.get('waypoints', []).length || store.get('notes', []).length || store.get('supplies', []).length || store.get('ice', null) || store.get('plan', null);
    return hasData && Date.now() - Math.max(last, snoozed) > 30 * 864e5;
  };
})();
