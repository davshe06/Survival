/* Field tools: compass, GPS readout, coordinate converter, sun/moon, water calc, SOS/Morse, CPR metronome, unit converter, planners. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $, TOOL_LIST } = window.FG;
  const units = () => window.FG.units();

  const TOOLS = [
    { id: 'gps', icon: '📍', title: 'My position', sum: 'GPS coordinates in every format, altitude, speed, accuracy', k: 'gps location coordinates lat long utm mgrs altitude elevation' },
    { id: 'compass', icon: '🧭', title: 'Compass', sum: 'Live heading, bearings, declination', k: 'compass heading north bearing declination magnetic' },
    { id: 'convert', icon: '🔁', title: 'Coordinate converter', sum: 'Lat/long ⇄ DMS ⇄ UTM ⇄ MGRS, distance between points', k: 'coordinate convert utm mgrs dms decimal degrees grid' },
    { id: 'sun', icon: '🌅', title: 'Sun & moon', sum: 'Sunrise, sunset, daylight left, moon phase', k: 'sunrise sunset daylight twilight moon phase dark' },
    { id: 'water', icon: '💧', title: 'Water purification calculator', sum: 'Bleach, iodine, boiling — exact doses', k: 'water purify bleach chlorine iodine dose drops treat' },
    { id: 'sos', icon: '🔦', title: 'SOS light & Morse', sum: 'Screen strobe, SOS, Morse code flasher', k: 'sos signal strobe flashlight morse code rescue light' },
    { id: 'cpr', icon: '❤️', title: 'CPR metronome', sum: '110 beats/min with breath prompts', k: 'cpr metronome compressions heart beat rhythm' },
    { id: 'units', icon: '📏', title: 'Unit converter', sum: 'Length, weight, volume, temperature, area', k: 'convert units temperature celsius fahrenheit gallons liters miles km pounds' },
    { id: 'rations', icon: '🥫', title: 'Water & food planner', sum: 'How much water/food for N people × N days', k: 'ration food water calories planner stockpile storage how much' },
    { id: 'dutch', icon: '🍲', title: 'Dutch oven coals', sum: 'Briquettes on top & bottom for any temp', k: 'dutch oven charcoal briquettes coals temperature baking' },
    { id: 'planting', icon: '🌱', title: 'Planting calendar', sum: 'When to plant each crop from your frost date', k: 'planting calendar garden frost date seeds when to plant southeast' },
    { id: 'battery', icon: '🔋', title: 'Power / solar calculator', sum: 'Battery runtime, solar panel & inverter sizing', k: 'battery solar watt amp hour inverter runtime power generator' },
    { id: 'timer', icon: '⏱️', title: 'Timers', sum: 'Boil timer, tourniquet time log, stopwatch', k: 'timer stopwatch boil tourniquet time' }
  ];
  TOOL_LIST.push(...TOOLS);

  route(/^\/tools$/, () => {
    setTitle('Tools');
    view.innerHTML = `<div class="list">${TOOLS.map(t => `<a class="row" href="#/tools/${t.id}"><span class="i">${t.icon}</span><span class="t"><b>${esc(t.title)}</b><small>${esc(t.sum)}</small></span><span class="chev">›</span></a>`).join('')}</div>`;
  });
  function tool(id, fn) { route(new RegExp('^/tools/' + id + '$'), (m, q) => { const t = TOOLS.find(x => x.id === id); setTitle(t.title, '#/tools'); return fn(q); }); }

  // ---------- shared GPS watcher ----------
  function watchGPS(cb, err) {
    if (!navigator.geolocation) { err && err({ message: 'This device has no location support' }); return () => { }; }
    const id = navigator.geolocation.watchPosition(cb, e => err && err(e), { enableHighAccuracy: true, maximumAge: 0, timeout: 60000 });
    return () => navigator.geolocation.clearWatch(id);
  }
  function gpsErrText(e) {
    if (!e) return '';
    if (e.code === 1) return 'Location permission denied. iPhone/iPad: Settings → Privacy & Security → Location Services → Safari Websites (or this app) → While Using, Precise ON.';
    if (e.code === 2) return 'Position unavailable. Go outside with a clear view of the sky. Wi‑Fi‑only iPads have no GPS chip.';
    if (e.code === 3) return 'Still waiting for a GPS fix… (first fix can take 30–90 s outdoors without internet)';
    return e.message || 'Location error';
  }
  window.FG.watchGPS = watchGPS; window.FG.gpsErrText = gpsErrText;
  const fmtAlt = m => m == null ? '—' : units() === 'met' ? Math.round(m) + ' m' : Math.round(m * 3.28084) + ' ft';
  const fmtSpd = v => v == null || isNaN(v) ? '—' : units() === 'met' ? (v * 3.6).toFixed(1) + ' km/h' : (v * 2.23694).toFixed(1) + ' mph';

  // ---------- GPS ----------
  tool('gps', () => {
    view.innerHTML = `
      <div class="card"><div id="st" class="small muted">Requesting location… allow access when asked.</div>
        <div class="big mono" id="dd" style="margin-top:6px">—</div>
        <dl class="kv" style="margin-top:10px">
          <dt>DMS</dt><dd class="mono" id="dms">—</dd>
          <dt>Deg-min</dt><dd class="mono" id="dm">—</dd>
          <dt>UTM</dt><dd class="mono" id="utm">—</dd>
          <dt>MGRS</dt><dd class="mono" id="mgrs">—</dd>
          <dt>Accuracy</dt><dd id="acc">—</dd>
          <dt>Altitude</dt><dd id="alt">—</dd>
          <dt>Speed</dt><dd id="spd">—</dd>
          <dt>Course</dt><dd id="crs">—</dd>
          <dt>Declination</dt><dd id="dec">—</dd>
          <dt>Fix time</dt><dd id="tm">—</dd>
        </dl>
        <div class="btnrow"><button class="btn pri" id="copy">Copy coordinates</button><button class="btn" id="wp">Save as waypoint</button><a class="btn" href="#/map">Show on map</a></div>
      </div>
      <div class="box info"><b class="lbl">Reading coordinates to rescuers</b>Read decimal degrees slowly digit by digit, e.g. “thirty-three point seven five four one north, eighty-four point three nine two two west.” Say which format you’re using. Text messages often get through when calls fail.</div>`;
    let last = null;
    const stop = watchGPS(p => {
      const c = p.coords; last = c;
      $('#st').textContent = 'GPS fix ✓ (updates live)';
      $('#dd').textContent = c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5);
      $('#dms').textContent = Geo.dms(c.latitude, true) + ' ' + Geo.dms(c.longitude, false);
      $('#dm').textContent = Geo.dm(c.latitude, true) + '  ' + Geo.dm(c.longitude, false);
      $('#utm').textContent = Geo.fmtUTM(c.latitude, c.longitude);
      $('#mgrs').textContent = Geo.toMGRS(c.latitude, c.longitude);
      $('#acc').textContent = '± ' + Geo.fmtDist(c.accuracy, units());
      $('#alt').textContent = fmtAlt(c.altitude) + (c.altitudeAccuracy ? ' (± ' + fmtAlt(c.altitudeAccuracy) + ')' : '');
      $('#spd').textContent = fmtSpd(c.speed);
      $('#crs').textContent = c.heading == null || isNaN(c.heading) ? '—' : Math.round(c.heading) + '° ' + Geo.cardinal(c.heading);
      const d = Geo.declination(c.latitude, c.longitude); $('#dec').textContent = Math.abs(d).toFixed(1) + '° ' + (d < 0 ? 'West' : 'East') + ' (approx.)';
      $('#tm').textContent = new Date(p.timestamp).toLocaleTimeString();
    }, e => { $('#st').textContent = gpsErrText(e); });
    $('#copy').onclick = () => { if (!last) return toast('No fix yet'); const s = last.latitude.toFixed(5) + ', ' + last.longitude.toFixed(5) + ' (' + Geo.toMGRS(last.latitude, last.longitude) + ')'; (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(() => toast('Copied'), () => prompt('Copy:', s)); };
    $('#wp').onclick = () => {
      if (!last) return toast('No fix yet'); const name = prompt('Waypoint name', 'Waypoint ' + new Date().toLocaleString()); if (name == null) return;
      const w = store.get('waypoints', []); w.push({ id: Date.now(), name, lat: last.latitude, lon: last.longitude, alt: last.altitude, t: Date.now(), icon: '📍' }); store.set('waypoints', w); toast('Waypoint saved');
    };
    return stop;
  });

  // ---------- Compass ----------
  tool('compass', () => {
    const s = store.get('compass', { decl: null, mode: 'true', target: '' });
    view.innerHTML = `
      <div class="compass" id="cmp">${compassSVG()}</div>
      <div style="text-align:center"><div class="big mono" id="hd">—</div><div class="muted small" id="hdsub">Tap “Start compass” and allow motion access</div></div>
      <div class="btnrow" style="justify-content:center"><button class="btn pri" id="start">Start compass</button><button class="btn" id="mode"></button></div>
      <div class="card" style="margin-top:14px"><h3>Follow a bearing</h3>
        <div class="two"><div><label class="f">Target bearing (°)</label><input class="inp" id="tgt" inputmode="decimal" placeholder="e.g. 245" value="${esc(s.target)}"></div>
        <div><label class="f">Declination (° , West = negative)</label><input class="inp" id="dcl" inputmode="decimal" placeholder="auto" value="${s.decl == null ? '' : s.decl}"></div></div>
        <p class="small muted" id="dclnote">Leave declination blank to estimate it from GPS. Southeast U.S. is roughly 0° (Louisiana) to 11° West (Virginia).</p>
        <p class="small" id="steer"></p></div>
      <div class="box warn"><b class="lbl">Phone compass accuracy</b>Phone compasses are thrown off by cars, metal, magnets, phone cases with magnets and power lines. Stand 10+ ft from your car. If readings jump, wave the phone in a figure‑8 to recalibrate. Confirm with a real baseplate compass (keep one in your kit) or the sun.</div>`;
    let heading = null, autoDecl = null, mode = s.mode;
    const save = () => store.set('compass', { decl: $('#dcl').value === '' ? null : +$('#dcl').value, mode, target: $('#tgt').value });
    const decl = () => $('#dcl').value !== '' ? +$('#dcl').value : (autoDecl == null ? 0 : autoDecl);
    function draw() {
      $('#mode').textContent = mode === 'true' ? 'Showing TRUE north' : 'Showing MAGNETIC north';
      if (heading == null) return;
      const h = ((mode === 'true' ? heading + decl() : heading) + 360) % 360;
      $('#hd').textContent = Math.round(h) + '° ' + Geo.cardinal(h);
      $('#hdsub').textContent = (mode === 'true' ? 'True (map) bearing' : 'Magnetic bearing') + ' · declination ' + decl().toFixed(1) + '°';
      $('#rose').setAttribute('transform', `rotate(${-h} 100 100)`);
      const t = parseFloat($('#tgt').value);
      const tg = $('#tgtmark');
      if (!isNaN(t)) {
        tg.setAttribute('transform', `rotate(${t} 100 100)`); tg.style.display = '';
        let diff = ((t - h + 540) % 360) - 180;
        $('#steer').innerHTML = Math.abs(diff) < 4 ? '✅ <b>On course</b> — walk straight ahead. Pick a landmark on this line and walk to it.' : (diff > 0 ? '➡️ Turn <b>right</b> ' : '⬅️ Turn <b>left</b> ') + Math.abs(Math.round(diff)) + '°';
      } else { tg.style.display = 'none'; $('#steer').textContent = ''; }
    }
    function onOri(e) {
      let h = null;
      if (e.webkitCompassHeading != null) h = e.webkitCompassHeading; // iOS: magnetic
      else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
      if (h == null) return;
      // screen orientation correction
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      heading = (h + so + 360) % 360; draw();
    }
    let started = false;
    function start() {
      if (started) return;
      const go = () => { started = true; window.addEventListener('deviceorientationabsolute', onOri, true); window.addEventListener('deviceorientation', onOri, true); $('#start').textContent = 'Compass running'; setTimeout(() => { if (heading == null) $('#hdsub').textContent = 'No compass sensor data. Some devices (laptops, some tablets) have no magnetometer.'; }, 3000); };
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(r => r === 'granted' ? go() : toast('Motion access denied — enable in Settings → Safari → Motion & Orientation Access')).catch(() => toast('Tap the button again'));
      } else go();
    }
    $('#start').onclick = start;
    $('#mode').onclick = () => { mode = mode === 'true' ? 'mag' : 'true'; save(); draw(); };
    $('#tgt').oninput = () => { save(); draw(); }; $('#dcl').oninput = () => { save(); draw(); };
    const stopG = watchGPS(p => { autoDecl = Geo.declination(p.coords.latitude, p.coords.longitude); if ($('#dcl').value === '') $('#dclnote').textContent = 'Auto declination from GPS: ' + Math.abs(autoDecl).toFixed(1) + '° ' + (autoDecl < 0 ? 'W' : 'E') + ' (approx.).'; draw(); }, () => { });
    draw();
    return () => { stopG(); window.removeEventListener('deviceorientationabsolute', onOri, true); window.removeEventListener('deviceorientation', onOri, true); };
  });
  function compassSVG() {
    let ticks = '';
    for (let i = 0; i < 360; i += 5) {
      const big = i % 30 === 0, r1 = big ? 80 : 85;
      const a = (i - 90) * Math.PI / 180;
      ticks += `<line x1="${100 + r1 * Math.cos(a)}" y1="${100 + r1 * Math.sin(a)}" x2="${100 + 92 * Math.cos(a)}" y2="${100 + 92 * Math.sin(a)}" stroke="currentColor" stroke-width="${big ? 1.6 : .7}" opacity="${big ? 1 : .6}"/>`;
      if (big && i % 90) ticks += `<text x="${100 + 70 * Math.cos(a)}" y="${100 + 70 * Math.sin(a) + 3}" font-size="8" text-anchor="middle" fill="currentColor" opacity=".8">${i}</text>`;
    }
    const L = (t, deg, col) => { const a = (deg - 90) * Math.PI / 180; return `<text x="${100 + 68 * Math.cos(a)}" y="${100 + 68 * Math.sin(a) + 5}" font-size="15" font-weight="700" text-anchor="middle" fill="${col}">${t}</text>`; };
    return `<svg viewBox="0 0 200 200" style="color:var(--text)">
      <circle cx="100" cy="100" r="96" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>
      <g id="rose">${ticks}${L('N', 0, 'var(--danger)')}${L('E', 90, 'currentColor')}${L('S', 180, 'currentColor')}${L('W', 270, 'currentColor')}
        <g id="tgtmark" style="display:none"><path d="M100 6 L106 18 L94 18Z" fill="var(--accent2)"/></g></g>
      <path d="M100 30 L108 100 L100 92 L92 100Z" fill="var(--danger)"/><path d="M100 170 L108 100 L100 108 L92 100Z" fill="var(--muted)"/>
      <circle cx="100" cy="100" r="5" fill="var(--text)"/>
      <path d="M100 0 L105 10 L95 10Z" fill="var(--accent)"/>
    </svg>`;
  }

  // ---------- Coordinate converter ----------
  tool('convert', () => {
    view.innerHTML = `
      <div class="card"><h3>Convert a coordinate</h3>
        <input class="inp mono" id="ci" placeholder="33.7490, -84.3880  or  16S 741234 3738123  or  16S GC 41234 38123" autocapitalize="characters">
        <div class="btnrow"><button class="btn" id="here">Use my GPS</button></div>
        <dl class="kv" style="margin-top:12px" id="co"></dl></div>
      <div class="card"><h3>Distance &amp; bearing between two points</h3>
        <label class="f">From</label><input class="inp mono" id="p1" placeholder="lat, lon / UTM / MGRS">
        <label class="f">To</label><input class="inp mono" id="p2" placeholder="lat, lon / UTM / MGRS">
        <p id="pd" class="big" style="margin:10px 0 0"></p><p id="pd2" class="small muted"></p></div>
      <div class="card"><h3>Project a point</h3><p class="small muted">Find coordinates of a spot at a given bearing and distance from a known point.</p>
        <label class="f">Start</label><input class="inp mono" id="s1" placeholder="lat, lon">
        <div class="two"><div><label class="f">True bearing °</label><input class="inp" id="s2" inputmode="decimal"></div><div><label class="f">Distance (${units() === 'met' ? 'm' : 'ft'})</label><input class="inp" id="s3" inputmode="decimal"></div></div>
        <p id="so" class="mono" style="margin-top:10px"></p></div>`;
    function out(p) {
      if (!p) { $('#co').innerHTML = '<dt></dt><dd class="muted">Enter a coordinate above.</dd>'; return; }
      $('#co').innerHTML = `<dt>Decimal</dt><dd class="mono">${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</dd><dt>DMS</dt><dd class="mono">${Geo.dms(p.lat, true)} ${Geo.dms(p.lon, false)}</dd><dt>Deg‑min</dt><dd class="mono">${Geo.dm(p.lat, true)} ${Geo.dm(p.lon, false)}</dd><dt>UTM</dt><dd class="mono">${Geo.fmtUTM(p.lat, p.lon)}</dd><dt>MGRS</dt><dd class="mono">${Geo.toMGRS(p.lat, p.lon)}</dd><dt>Map</dt><dd><a href="#/map?lat=${p.lat}&lon=${p.lon}">Show on map ›</a></dd>`;
    }
    $('#ci').oninput = () => out(Geo.parse($('#ci').value)); out(null);
    $('#here').onclick = () => navigator.geolocation && navigator.geolocation.getCurrentPosition(p => { $('#ci').value = p.coords.latitude.toFixed(6) + ', ' + p.coords.longitude.toFixed(6); out({ lat: p.coords.latitude, lon: p.coords.longitude }); }, e => toast(gpsErrText(e)), { enableHighAccuracy: true, timeout: 30000 });
    const dd = () => { const a = Geo.parse($('#p1').value), b = Geo.parse($('#p2').value); if (!a || !b) { $('#pd').textContent = ''; $('#pd2').textContent = ''; return; } const brg = Geo.bearing(a, b); const dc = Geo.declination(a.lat, a.lon); $('#pd').textContent = Geo.fmtDist(Geo.dist(a, b), units()) + ' at ' + Math.round(brg) + '° true'; $('#pd2').textContent = Geo.cardinal(brg) + ' · magnetic ≈ ' + Math.round((brg - dc + 360) % 360) + '° (declination ' + dc.toFixed(1) + '°)'; };
    $('#p1').oninput = dd; $('#p2').oninput = dd;
    const pj = () => { const a = Geo.parse($('#s1').value), b = parseFloat($('#s2').value), d = parseFloat($('#s3').value); if (!a || isNaN(b) || isNaN(d)) { $('#so').textContent = ''; return; } const p = Geo.dest(a, b, units() === 'met' ? d : d / 3.28084); $('#so').innerHTML = p.lat.toFixed(6) + ', ' + p.lon.toFixed(6) + '<br>' + Geo.toMGRS(p.lat, p.lon); };
    ['s1', 's2', 's3'].forEach(i => $('#' + i).oninput = pj);
  });

  // ---------- Sun & Moon ----------
  tool('sun', () => {
    const last = store.get('lastpos', null);
    view.innerHTML = `<div class="card"><div class="two"><div><label class="f">Date</label><input class="inp" type="date" id="dt" value="${new Date().toISOString().slice(0, 10)}"></div><div><label class="f">Location</label><input class="inp mono" id="loc" value="${last ? last.lat.toFixed(4) + ', ' + last.lon.toFixed(4) : '33.749, -84.388'}"></div></div><div class="btnrow"><button class="btn" id="gps">Use my GPS</button></div></div><div id="out"></div>
      <div class="box info"><b class="lbl">No device? Estimate daylight left</b>Hold your hand at arm’s length, fingers together, palm toward you, with the bottom of your little finger on the horizon. Each finger width between the horizon and the sun ≈ 15 minutes of daylight (4 fingers ≈ 1 hour).</div>`;
    function calc() {
      const p = Geo.parse($('#loc').value); if (!p) return;
      const [y, mo, d] = $('#dt').value.split('-').map(Number); const date = new Date(y, mo - 1, d, 12);
      const s = Geo.sunTimes(date, p.lat, p.lon), m = Geo.moon(date); const now = new Date();
      const T = x => x ? x.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—';
      let left = ''; if (s.sunset && now.toDateString() === date.toDateString()) { const ms = s.sunset - now; left = ms > 0 ? `<p class="big">${Math.floor(ms / 36e5)}h ${Math.floor(ms % 36e5 / 6e4)}m of daylight left</p>` : '<p class="big">The sun has set</p>'; }
      $('#out').innerHTML = `<div class="card"><h3>☀️ Sun</h3>${left}<dl class="kv">
        <dt>First light (civil dawn)</dt><dd>${T(s.dawn)}</dd><dt>Sunrise</dt><dd>${T(s.sunrise)}</dd><dt>Solar noon</dt><dd>${T(s.noon)} — shadows point true north</dd><dt>Sunset</dt><dd>${T(s.sunset)}</dd><dt>Last light (civil dusk)</dt><dd>${T(s.dusk)}</dd><dt>Full dark (nautical)</dt><dd>${T(s.nauticalDusk)}</dd><dt>Day length</dt><dd>${s.dayLen ? Math.floor(s.dayLen) + 'h ' + Math.round(s.dayLen % 1 * 60) + 'm' : '—'}</dd></dl>
        <p class="small muted">Times shown in this device’s time zone.</p></div>
        <div class="card"><h3>${m.icon} Moon</h3><dl class="kv"><dt>Phase</dt><dd>${m.name}</dd><dt>Illuminated</dt><dd>${Math.round(m.illum * 100)}%</dd><dt>Age</dt><dd>${m.age.toFixed(1)} days</dd><dt>Next full moon</dt><dd>${m.nextFull.toLocaleDateString()}</dd><dt>Next new moon</dt><dd>${m.nextNew.toLocaleDateString()}</dd></dl>
        <p class="small muted">Full moon = good natural light for night travel. New moon = darkest nights, best for seeing (and hiding) lights.</p></div>`;
    }
    $('#dt').onchange = calc; $('#loc').oninput = calc;
    $('#gps').onclick = () => navigator.geolocation && navigator.geolocation.getCurrentPosition(p => { $('#loc').value = p.coords.latitude.toFixed(4) + ', ' + p.coords.longitude.toFixed(4); store.set('lastpos', { lat: p.coords.latitude, lon: p.coords.longitude }); calc(); }, e => toast(gpsErrText(e)), { enableHighAccuracy: false, timeout: 30000 });
    calc();
  });

  // ---------- Water ----------
  tool('water', () => {
    view.innerHTML = `
      <div class="card"><h3>How much water?</h3>
        <div class="two"><div><label class="f">Amount</label><input class="inp" id="amt" inputmode="decimal" value="1"></div>
        <div><label class="f">Unit</label><select class="inp" id="u"><option value="3.78541">gallons</option><option value="0.946353">quarts</option><option value="1">liters</option><option value="0.5">16.9 oz bottles (0.5 L)</option><option value="208.198">55‑gal drum</option></select></div></div>
        <label class="f">Water looks</label><select class="inp" id="cl"><option value="1">Clear</option><option value="2">Cloudy, colored or very cold</option></select></div>
      <div id="wo"></div>
      <div class="box danger"><b class="lbl">Never</b>Do not use scented, “splash‑less”, color‑safe or additive bleach. Do not treat water contaminated with fuel, chemicals or flood water from industrial areas — chemicals are not removed by boiling or bleach. Distill or find another source.</div>
      <p><a href="#/a/water/purify">Full water purification guide ›</a></p>`;
    function calc() {
      const L = (parseFloat($('#amt').value) || 0) * parseFloat($('#u').value); const gal = L / 3.78541; const mult = +$('#cl').value;
      const drops = (perGal) => { const d = perGal * gal * mult; return d < 1 ? '<1 drop (use 1)' : d < 100 ? Math.ceil(d) + ' drops' : (d / 100 * 5 / 4.93).toFixed(1) + ' tsp (' + Math.ceil(d) + ' drops)'; };
      // EPA: 6% bleach 8 drops/gal; 8.25% bleach 6 drops/gal. 1 tsp ≈ 100 drops (approx. 0.05 mL/drop → 5 mL tsp)
      $('#wo').innerHTML = `<div class="card"><h3>Doses for ${L.toFixed(1)} L (${gal.toFixed(2)} gal)${mult > 1 ? ' — doubled for cloudy water' : ''}</h3>
        <dl class="kv">
          <dt>Bleach 6% (regular)</dt><dd><b>${drops(8)}</b></dd>
          <dt>Bleach 8.25% (concentrated)</dt><dd><b>${drops(6)}</b></dd>
          <dt>Bleach 5.25% (older)</dt><dd><b>${drops(9)}</b></dd>
          <dt>Iodine tincture 2%</dt><dd><b>${drops(20)}</b> (5 drops/qt clear; not for pregnancy, thyroid issues, or >few weeks)</dd>
          <dt>Pool shock (calcium hypochlorite 68–78%)</dt><dd>Make stock: 1 heaping tsp (~¼ oz) in 2 gal water. Then add 1 part stock to 100 parts water (≈ 1 pint stock per 12.5 gal).</dd>
          <dt>Tablets (chlorine dioxide)</dt><dd>Follow the package: usually 1 tablet per 1 L, wait 30 min (4 h for Cryptosporidium).</dd>
        </dl>
        <p><b>Then:</b> stir, wait <b>30 minutes</b>. Water should smell faintly of chlorine. If not, repeat the dose and wait another 15 minutes.</p>
        <p><b>Boiling (most reliable):</b> rolling boil for <b>1 minute</b> (3 minutes above 6,500 ft). <a href="#/tools/timer">Boil timer ›</a></p></div>`;
    }
    ['amt', 'u', 'cl'].forEach(i => $('#' + i).oninput = calc); calc();
  });

  // ---------- SOS / Morse ----------
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
  tool('sos', () => {
    view.innerHTML = `
      <div class="card"><h3>Screen signal</h3><p class="small muted">Turn screen brightness all the way up. At night a phone screen can be seen from over a mile away; a signal mirror in daylight from 10+ miles.</p>
        <div class="btnrow"><button class="btn red" data-m="sos">SOS (… — — — …)</button><button class="btn" data-m="strobe">Strobe</button><button class="btn" data-m="steady">Steady white light</button></div></div>
      <div class="card"><h3>Morse code flasher</h3><input class="inp" id="mt" placeholder="Message, e.g. HELP 2 INJURED" autocapitalize="characters">
        <p class="mono small" id="mc"></p><div class="btnrow"><button class="btn pri" id="mgo">Flash message</button><label class="small" style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="snd"> with sound</label></div></div>
      <div class="card"><h3>Morse alphabet</h3><div class="mono small" style="columns:3;column-gap:16px">${Object.entries(MORSE).map(([k, v]) => `<div><b>${k}</b> ${v.replace(/\./g, '•').replace(/-/g, '—')}</div>`).join('')}</div></div>
      <div class="box info"><b class="lbl">Signal rules of three</b>Three of anything = distress: 3 whistle blasts, 3 fires in a triangle, 3 gunshots, 3 flashes. Repeat every few minutes. <a href="#/a/signal/signals">Signaling guide ›</a></div>`;
    $('#mt').oninput = () => { $('#mc').textContent = toMorse($('#mt').value); };
    view.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { audioUnlock(); runSignal(b.dataset.m); });
    $('#mgo').onclick = () => { audioUnlock(); const t = $('#mt').value.trim(); if (!t) return toast('Type a message'); runSignal('msg', t, $('#snd').checked); };
  });
  function toMorse(t) { return t.toUpperCase().split('').map(c => c === ' ' ? '/' : (MORSE[c] || '')).join(' '); }
  // ---------- shared sound (works on iPhone) ----------
  // iOS only allows sound after a tap, and Web Audio is muted by the ring/silent switch unless the page
  // declares itself a "playback" app (iOS 17+), so every Start button calls audioUnlock() first.
  let audioCtx = null;
  function audioUnlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state !== 'running') audioCtx.resume();
      // play one silent sample inside the tap so iOS fully unlocks output
      const b = audioCtx.createBuffer(1, 1, 22050), src = audioCtx.createBufferSource(); src.buffer = b; src.connect(audioCtx.destination); src.start(0);
    } catch (e) { }
    return audioCtx;
  }
  function tone(freq, ms, vol = 0.9, type = 'square', at = 0) {
    const c = audioCtx; if (!c) return;
    try {
      if (c.state !== 'running') c.resume();
      const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.setValueAtTime(vol, t + ms / 1000 - 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + ms / 1000 + 0.02);
    } catch (e) { }
  }
  function beep(on) { // continuous tone for Morse/SOS and alarms
    try {
      if (!audioCtx) return;
      if (on) { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 750; g.gain.value = .5; o.connect(g); g.connect(audioCtx.destination); o.start(); beep.o = o; }
      else if (beep.o) { beep.o.stop(); beep.o = null; }
    } catch (e) { }
  }
  window.FG.audioUnlock = audioUnlock; window.FG.tone = tone;
  function runSignal(mode, text, sound) {
    const el = document.createElement('div'); el.className = 'strobe'; el.innerHTML = '<button class="btn red" style="font-size:1.1rem">✕ Stop</button>';
    document.body.appendChild(el);
    let wake = null; if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => wake = w).catch(() => { });
    let stopped = false; const timers = [];
    const stop = () => { stopped = true; timers.forEach(clearTimeout); beep(false); el.remove(); if (wake) wake.release(); };
    el.querySelector('button').onclick = stop;
    const unit = 220;
    let seq = [];
    if (mode === 'steady') { el.classList.add('on'); el.querySelector('button').style.cssText += ';position:absolute;bottom:40px'; return; }
    if (mode === 'strobe') seq = [[1, 120], [0, 380]];
    else {
      const code = mode === 'sos' ? '... --- ...' : toMorse(text);
      code.split('').forEach(c => {
        if (c === '.') seq.push([1, unit], [0, unit]); else if (c === '-') seq.push([1, unit * 3], [0, unit]);
        else if (c === ' ') seq.push([0, unit * 2]); else if (c === '/') seq.push([0, unit * 4]);
      });
      seq.push([0, unit * 7]);
    }
    let i = 0;
    const step = () => {
      if (stopped) return; const [on, ms] = seq[i % seq.length]; i++;
      el.classList.toggle('on', !!on); if (sound || mode === 'sos') beep(!!on && (sound || false));
      timers.push(setTimeout(step, ms));
    };
    step();
  }

  // ---------- CPR metronome ----------
  tool('cpr', () => {
    const st = store.get('cpr', { mode: 'hands', sound: true });
    view.innerHTML = `
      <div style="text-align:center;margin:10px 0"><div id="beat" style="width:160px;height:160px;border-radius:50%;margin:0 auto;background:var(--card2);border:3px solid var(--danger);display:flex;align-items:center;justify-content:center;font-size:2.4rem;font-weight:800;transition:background .05s" class="mono">0</div>
      <p class="big" id="phase">Ready</p>
      <div class="btnrow" style="justify-content:center"><button class="btn red" id="go" style="min-width:140px">▶ Start</button>
        <select class="inp" id="mode" style="width:auto"><option value="hands">Hands‑only (no breaths)</option><option value="30">30 compressions : 2 breaths</option></select></div>
      <div class="btnrow" style="justify-content:center"><button class="btn ${st.sound ? 'pri' : ''}" id="snd">${st.sound ? '🔊 Beep on' : '🔇 Beep off'}</button><button class="btn" id="test">Test beep</button></div>
      <p class="small muted" id="tm">Elapsed 0:00</p></div>
      <div class="box info"><b class="lbl">Can't hear it?</b>Turn the volume up with the side buttons. On iPhones older than iOS 17, flip the ring/silent switch to ring. The screen also flashes and the phone vibrates (Android) on every beat.</div>
      <div class="box danger"><b class="lbl">Adult CPR in brief</b>Call 911 (or send someone). Heel of hand on center of chest, other hand on top. Push <b>hard (2–2.4 in / 5–6 cm)</b> and <b>fast (100–120/min)</b> — push down on every beep — and let the chest fully rise. In 30:2 mode, two low tones mean give 2 breaths. Don't stop except to use an AED or when someone takes over. Swap rescuers every 2 min if you can. <a href="#/a/firstaid/cpr">Full CPR guide ›</a> · <a href="#/a/dogs/cpr">Dog CPR ›</a></div>`;
    $('#mode').value = st.mode;
    let sound = st.sound, run = false, n = 0, t0 = 0, timer = null, tick = null, breathPause = 0, wake = null;
    const save = () => store.set('cpr', { mode: $('#mode').value, sound });
    $('#mode').onchange = save;
    $('#snd').onclick = () => { sound = !sound; save(); $('#snd').textContent = sound ? '🔊 Beep on' : '🔇 Beep off'; $('#snd').classList.toggle('pri', sound); if (sound) { audioUnlock(); tone(1000, 70); } };
    $('#test').onclick = () => { audioUnlock(); tone(1000, 70); tone(520, 350, 0.8, 'square', 0.4); };
    const BEAT = 60000 / 110; // 110 compressions per minute
    function beatFn() {
      const b = $('#beat'); if (!b) return;
      if (breathPause > 0) { breathPause--; return; }
      n++;
      if ($('#mode').value === '30') {
        const c = ((n - 1) % 30) + 1; b.textContent = c;
        if (c === 30) { $('#phase').textContent = '🫁 Give 2 breaths'; breathPause = 7; if (sound) { tone(520, 450, 0.8, 'square', 0.55); tone(520, 450, 0.8, 'square', 1.65); } }
        else $('#phase').textContent = c > 25 ? 'Push — breaths coming' : 'Push';
      } else { b.textContent = n; $('#phase').textContent = 'Push hard, push fast'; }
      if (sound) tone(1000, 70);
      b.style.background = 'var(--danger)'; setTimeout(() => { if (b) b.style.background = 'var(--card2)'; }, 110);
      if (navigator.vibrate) navigator.vibrate(40);
    }
    function stop() { run = false; clearInterval(timer); clearInterval(tick); if (wake) { wake.release(); wake = null; } }
    $('#go').onclick = () => {
      if (run) { stop(); $('#go').textContent = '▶ Start'; $('#phase').textContent = 'Stopped'; return; }
      audioUnlock(); // must happen inside the tap for iPhone to allow sound
      run = true; n = 0; breathPause = 0; t0 = Date.now(); $('#go').textContent = '■ Stop';
      beatFn(); timer = setInterval(beatFn, BEAT);
      tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#tm').textContent = 'Elapsed ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + (s && s % 120 < 5 ? ' — switch rescuers if possible' : ''); }, 1000);
      if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => wake = w).catch(() => { });
    };
    return stop;
  });

  // ---------- Units ----------
  const U = {
    Length: { m: 1, cm: .01, mm: .001, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344, 'nautical mi': 1852 },
    Weight: { kg: 1, g: .001, lb: .45359237, oz: .028349523, 'ton (US)': 907.18474 },
    Volume: { L: 1, mL: .001, 'gal (US)': 3.785411784, qt: .946352946, pt: .473176473, cup: .2365882365, 'fl oz': .0295735296, tbsp: .0147867648, tsp: .00492892159, 'cu ft': 28.3168466 },
    Area: { 'm²': 1, 'ft²': .09290304, acre: 4046.8564224, hectare: 10000, 'mi²': 2589988.11 },
    Speed: { 'km/h': 1, mph: 1.609344, knots: 1.852, 'm/s': 3.6 },
    Temperature: { '°F': 'F', '°C': 'C', K: 'K' }
  };
  tool('units', () => {
    view.innerHTML = `<div class="card"><label class="f">Type</label><select class="inp" id="ty">${Object.keys(U).map(k => `<option>${k}</option>`).join('')}</select>
      <label class="f">Value</label><input class="inp" id="v" inputmode="decimal" value="1"><label class="f">From</label><select class="inp" id="fr"></select><div id="uo" style="margin-top:12px"></div></div>
      <div class="card"><h3>Handy equivalents</h3><ul class="small"><li>1 gallon water ≈ 8.34 lb (3.8 kg)</li><li>1 liter water = 1 kg</li><li>1 cubic foot of water ≈ 7.5 gal ≈ 62.4 lb</li><li>Rain: 1 inch on 1,000 sq ft of roof ≈ 600 gallons</li><li>Boiling point drops ~1°F per 500 ft of elevation</li><li>Body temperature 98.6°F = 37°C; hypothermia &lt;95°F (35°C)</li><li>Pace: average adult ≈ 2,000–2,200 steps per mile; ~62–66 double‑paces per 100 m</li></ul></div>`;
    function fill() { const t = $('#ty').value; $('#fr').innerHTML = Object.keys(U[t]).map(k => `<option>${k}</option>`).join(''); calc(); }
    function calc() {
      const t = $('#ty').value, v = parseFloat($('#v').value), f = $('#fr').value; if (isNaN(v)) { $('#uo').innerHTML = ''; return; }
      let rows;
      if (t === 'Temperature') { const c = f === '°C' ? v : f === '°F' ? (v - 32) * 5 / 9 : v - 273.15; rows = [['°F', c * 9 / 5 + 32], ['°C', c], ['K', c + 273.15]]; }
      else { const base = v * U[t][f]; rows = Object.entries(U[t]).map(([k, x]) => [k, base / x]); }
      $('#uo').innerHTML = '<dl class="kv">' + rows.filter(r => r[0] !== f).map(([k, x]) => `<dt>${k}</dt><dd class="mono">${+x.toPrecision(6)}</dd>`).join('') + '</dl>';
    }
    $('#ty').onchange = fill; $('#v').oninput = calc; $('#fr').onchange = calc; fill();
  });

  // ---------- Rations ----------
  tool('rations', () => {
    view.innerHTML = `<div class="card"><div class="two"><div><label class="f">Adults</label><input class="inp" id="ad" inputmode="numeric" value="2"></div><div><label class="f">Children</label><input class="inp" id="ch" inputmode="numeric" value="0"></div>
      <div><label class="f">Pets (dogs)</label><input class="inp" id="pt" inputmode="numeric" value="0"></div><div><label class="f">Days</label><input class="inp" id="dy" inputmode="numeric" value="14"></div></div>
      <label class="f">Conditions</label><select class="inp" id="cn"><option value="1">Mild weather, light activity</option><option value="1.5">Hot Southeast summer or hard work</option><option value="2">Extreme heat + heavy labor</option></select></div><div id="ro"></div>`;
    function calc() {
      const a = +$('#ad').value || 0, c = +$('#ch').value || 0, p = +$('#pt').value || 0, d = +$('#dy').value || 0, k = +$('#cn').value;
      const drink = (a + c * .75) * k * d; const total = (a + c) * 1 * d * (k > 1 ? 1.25 : 1) + p * .5 * d; // gallons incl. cooking/hygiene at 1 gal/person/day baseline per FEMA
      const kcal = (a * 2200 * (k > 1 ? 1.3 : 1) + c * 1600) * d;
      $('#ro').innerHTML = `<div class="card"><h3>You need about</h3><dl class="kv">
        <dt>Water (FEMA minimum)</dt><dd><b>${Math.ceil(total)} gal</b> (${Math.ceil(total * 8.34)} lb) — 1 gal/person/day for drinking + basic sanitation${k > 1 ? ', +25% for heat' : ''}</dd>
        <dt>Drinking alone</dt><dd>${Math.ceil(drink * .5)}–${Math.ceil(drink)} gal</dd>
        <dt>Calories</dt><dd><b>${Math.round(kcal).toLocaleString()} kcal</b></dd>
        <dt>As rice + beans</dt><dd>≈ ${Math.ceil(kcal / 1650)} lb (dry, mixed 2:1)</dd>
        <dt>As MRE/freeze‑dried</dt><dd>≈ ${Math.ceil(kcal / 1200)} MREs or ${Math.ceil(kcal / 400)} 1‑cup servings</dd>
        <dt>As peanut butter</dt><dd>≈ ${Math.ceil(kcal / 2650)} 16‑oz jars (calorie dense!)</dd>
        <dt>Bleach to treat water</dt><dd>≈ ${Math.ceil(total * 8 / 100 * 5)} mL of 6% bleach</dd></dl>
        <p class="small muted">A car can realistically carry 10–20 gallons. Beyond that, carry purification (filter + bleach) and plan around water sources.</p></div>`;
    }
    view.querySelectorAll('input,select').forEach(i => i.oninput = calc); calc();
  });

  // ---------- Dutch oven ----------
  tool('dutch', () => {
    view.innerHTML = `<div class="card"><div class="two"><div><label class="f">Oven size (inches)</label><select class="inp" id="sz">${[8, 10, 12, 14, 16].map(s => `<option ${s === 12 ? 'selected' : ''}>${s}</option>`).join('')}</select></div><div><label class="f">Target °F</label><select class="inp" id="tp">${[300, 325, 350, 375, 400, 425, 450].map(t => `<option ${t === 350 ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
      <label class="f">Cooking</label><select class="inp" id="mo"><option value="bake">Baking (bread, cobbler) — more heat on top</option><option value="roast">Roasting — even</option><option value="stew">Stews/frying — heat on bottom</option></select><div id="do"></div></div>
      <div class="box info"><b class="lbl">Rule of thumb</b>For 350°F, use twice the oven diameter in briquettes (12″ → 24). Each briquette added or removed ≈ ±15–20°F. Rotate the oven ¼ turn clockwise and the lid ¼ turn counter‑clockwise every 15 minutes to avoid hot spots. Wind, cold and humidity mean more coals. Hardwood coals: roughly 1 shovel‑scoop ≈ 4–6 briquettes.</div>`;
    function calc() {
      const s = +$('#sz').value, t = +$('#tp').value, m = $('#mo').value;
      const total = Math.round(s * 2 + (t - 350) / 25 * 2);
      const top = Math.round(total * (m === 'bake' ? .67 : m === 'roast' ? .5 : .25));
      $('#do').innerHTML = `<p class="big" style="margin-top:12px">${total} briquettes</p><p><b>${top}</b> on the lid · <b>${total - top}</b> underneath (in a ring ½″ inside the rim)</p><p class="small muted">Briquettes last ~45–60 min; light fresh ones ~20 min before you need them for long cooks.</p>`;
    }
    ['sz', 'tp', 'mo'].forEach(i => $('#' + i).onchange = calc); calc();
  });

  // ---------- Planting ----------
  const CROPS = [
    // name, weeks rel. to last spring frost [start,end] direct/transplant, fall: weeks before first fall frost [start,end], days to harvest, notes
    ['Sweet potato (slips)', [3, 8], null, '90–120', 'Needs warm soil (65°F+). Huge calorie crop for the South. Cure 10 days warm & humid before storing.'],
    ['Southern peas / cowpeas', [2, 10], [14, 11], '60–90', 'Black‑eyed, crowder, purple hull. Heat & drought tolerant; dry beans store for years.'],
    ['Okra', [2, 8], null, '55–65', 'Loves heat. Pick pods at 3–4 inches every 1–2 days.'],
    ['Collards', [-6, -2], [12, 8], '60–80', 'Sweetens after frost; survives most Southeast winters.'],
    ['Kale', [-6, -2], [12, 8], '55–65', 'Cold hardy; plant fall for winter greens.'],
    ['Mustard & turnip greens', [-6, -2], [10, 6], '35–50', 'Fast; turnips give roots and greens.'],
    ['Cabbage / broccoli (transplants)', [-4, -1], [12, 9], '60–90', 'Fall crops do better in the Southeast than spring.'],
    ['Lettuce & spinach', [-6, -2], [8, 4], '30–50', 'Bolts in heat; best in fall/winter in FL & Gulf coast.'],
    ['Carrots / beets / radishes', [-4, 0], [10, 6], '25–75', 'Direct sow; radishes in ~25 days.'],
    ['Onions (sets / short‑day transplants)', [-8, -4], [16, 12], '100–150', 'Use SHORT‑DAY varieties south of ~35°N (e.g. Granex/Vidalia types). Plant fall in Deep South.'],
    ['Garlic (cloves)', null, [6, 2], '240', 'Plant Oct–Nov, harvest May–June. Softneck types do best in the South.'],
    ['Irish potatoes', [-4, -1], [14, 12], '70–110', 'Plant seed pieces around Feb–Mar in the Deep South. Second crop possible late summer.'],
    ['English peas / snap peas', [-8, -4], [12, 10], '55–70', 'Cool season only.'],
    ['Tomatoes (transplants)', [0, 6], [16, 13], '60–85', 'Heat >90°F stops fruit set—plant early. Choose disease‑resistant (VFN) types.'],
    ['Peppers (transplants)', [1, 6], null, '60–90', 'Hot peppers thrive in Southern heat.'],
    ['Bush & pole beans', [0, 6], [12, 10], '50–65', 'Direct sow after frost. Rattlesnake and Kentucky Wonder do well.'],
    ['Lima / butter beans', [2, 8], null, '65–90', 'Need warm soil; good dried protein.'],
    ['Sweet corn', [0, 6], null, '70–90', 'Plant blocks of 4+ rows for pollination. Field/dent corn stores dry.'],
    ['Squash & zucchini', [0, 6], [12, 10], '45–60', 'Squash vine borer is a pest; try Tromboncino or Seminole pumpkin (vining, resistant).'],
    ['Cucumbers', [0, 6], [12, 10], '50–65', 'Trellis to save space.'],
    ['Watermelon & cantaloupe', [1, 6], null, '75–95', 'Need space and heat.'],
    ['Peanuts', [2, 6], null, '110–150', 'Sandy soil; great protein & oil.'],
    ['Winter squash / Seminole pumpkin', [1, 8], null, '90–120', 'Store for months without refrigeration.'],
    ['Sunflowers', [0, 8], null, '70–100', 'Seeds for food & oil, stalks for kindling.'],
    ['Herbs: basil (warm) / cilantro, dill, parsley (cool)', [-4, 6], [10, 6], '30–70', 'Basil after frost; cilantro bolts in heat — plant fall.']
  ];
  tool('planting', () => {
    const s = store.get('frost', { spring: '', fall: '' });
    view.innerHTML = `<div class="card"><h3>Your frost dates</h3>
      <div class="two"><div><label class="f">Last spring frost</label><input class="inp" type="date" id="sp" value="${s.spring}"></div><div><label class="f">First fall frost</label><input class="inp" type="date" id="fa" value="${s.fall}"></div></div>
      <label class="f">…or pick a region</label><select class="inp" id="rg"><option value="">Choose…</option>
      <option value="02-01|12-15">South Florida (frost rare) — zone 10</option><option value="02-15|12-05">Central FL / Gulf coast — zone 9</option><option value="03-10|11-20">S. GA, S. AL, S. MS, LA, coastal SC — zone 8b</option>
      <option value="03-25|11-05">Atlanta, Birmingham, Columbia, Raleigh — zone 8a/7b</option><option value="04-10|10-25">Nashville, Charlotte foothills, N. GA/AL, AR — zone 7a/7b</option><option value="04-25|10-15">Appalachian mountains, KY, WV, N. VA — zone 6</option></select>
      <p class="small muted">Dates are averages — local frost dates vary with elevation. Ask any farm‑supply store or extension office.</p></div><div id="po"></div>`;
    const y = new Date().getFullYear();
    $('#rg').onchange = () => { const v = $('#rg').value; if (!v) return; const [a, b] = v.split('|'); $('#sp').value = y + '-' + a; $('#fa').value = y + '-' + b; calc(); };
    const fmt = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    function calc() {
      store.set('frost', { spring: $('#sp').value, fall: $('#fa').value });
      if (!$('#sp').value) { $('#po').innerHTML = '<p class="muted">Pick your frost dates to see your planting windows.</p>'; return; }
      const sp = new Date($('#sp').value + 'T12:00'), fa = $('#fa').value ? new Date($('#fa').value + 'T12:00') : null;
      const add = (d, w) => new Date(+d + w * 7 * 864e5); const today = new Date();
      $('#po').innerHTML = `<div class="tbl"><table><tr><th>Crop</th><th>Spring planting</th><th>Fall planting</th><th>Days</th></tr>${CROPS.map(([n, s1, f1, days, note]) => {
        const spr = s1 ? [add(sp, s1[0]), add(sp, s1[1])] : null; const fal = f1 && fa ? [add(fa, -f1[0]), add(fa, -f1[1])] : null;
        const now = w => w && today >= w[0] && today <= w[1];
        return `<tr><td><b>${n}</b>${now(spr) || now(fal) ? ' <span class="pri-badge pri-1" style="background:var(--accent2)">plant now</span>' : ''}<br><span class="small muted">${note}</span></td><td>${spr ? fmt(spr[0]) + '–' + fmt(spr[1]) : '—'}</td><td>${fal ? fmt(fal[0]) + '–' + fmt(fal[1]) : '—'}</td><td>${days}</td></tr>`;
      }).join('')}</table></div><p><a href="#/c/garden">Gardening guide ›</a></p>`;
    }
    $('#sp').onchange = calc; $('#fa').onchange = calc; calc();
  });

  // ---------- Battery / solar ----------
  tool('battery', () => {
    view.innerHTML = `<div class="card"><h3>How long will my battery last?</h3>
      <div class="two"><div><label class="f">Battery capacity</label><input class="inp" id="cap" inputmode="decimal" value="100"></div><div><label class="f">Unit</label><select class="inp" id="cu"><option value="ah12">Ah @ 12 V</option><option value="wh">Wh</option><option value="mah">mAh power bank (3.7 V)</option></select></div></div>
      <label class="f">Battery type</label><select class="inp" id="bt"><option value="0.5">Lead‑acid / AGM (use 50%)</option><option value="0.9">Lithium LiFePO4 (use 90%)</option><option value="0.85">Power bank / Li‑ion (≈85%)</option></select>
      <label class="f">Load (watts)</label><input class="inp" id="ld" inputmode="decimal" value="60">
      <label class="f">Through an inverter (AC)?</label><select class="inp" id="inv"><option value="1">No — DC / USB</option><option value="0.85">Yes — AC inverter (~85% efficient)</option></select>
      <p class="big" id="rt" style="margin-top:12px"></p></div>
      <div class="card"><h3>Solar to recharge it</h3><label class="f">Peak sun hours / day</label><select class="inp" id="psh"><option value="5">Southeast summer (≈5)</option><option value="4" selected>Spring/fall (≈4)</option><option value="3">Winter or cloudy (≈3)</option></select><p id="sol"></p></div>
      <div class="card"><h3>Typical loads</h3><div class="tbl"><table><tr><th>Device</th><th>Watts</th></tr>
      ${[['Phone charging', '5–15'], ['Tablet charging', '10–20'], ['LED lantern', '3–10'], ['12V fan', '10–30'], ['Laptop', '45–90'], ['CPAP (no humidifier)', '30–60'], ['12V compressor fridge (avg)', '15–40'], ['Starlink Mini', '25–40'], ['Ham/GMRS radio (receive / transmit)', '5 / 50+'], ['Full‑size fridge (avg)', '100–200'], ['Microwave', '1,000–1,500'], ['Coffee maker / hair dryer', '800–1,800'], ['Window AC', '500–1,500'], ['Well pump', '750–2,000 (2–3× surge)']].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div></div>`;
    function calc() {
      let cap = parseFloat($('#cap').value) || 0; const u = $('#cu').value;
      const wh = u === 'ah12' ? cap * 12 : u === 'mah' ? cap / 1000 * 3.7 : cap;
      const usable = wh * +$('#bt').value * +$('#inv').value; const ld = parseFloat($('#ld').value) || 0;
      const h = ld ? usable / ld : 0;
      $('#rt').textContent = ld ? `≈ ${h < 1 ? Math.round(h * 60) + ' minutes' : h.toFixed(1) + ' hours'} (${Math.round(usable)} usable Wh)` : '';
      const psh = +$('#psh').value; const need = wh * +$('#bt').value / (psh * 0.75);
      $('#sol').innerHTML = `To refill ${Math.round(wh * +$('#bt').value)} Wh in one day you need about <b>${Math.ceil(need / 10) * 10} W</b> of panels (assuming 75% real‑world efficiency). Use a charge controller between panels and battery (MPPT is best).`;
    }
    view.querySelectorAll('input,select').forEach(i => i.oninput = calc); calc();
  });

  // ---------- Timers ----------
  tool('timer', () => {
    const tq = store.get('tqlog', []);
    view.innerHTML = `<div class="card"><h3>Countdown</h3><div class="big mono" id="cd">0:00</div>
      <div class="btnrow">${[[1, 'Boil 1 min'], [3, 'Boil 3 min (altitude)'], [30, 'Bleach wait 30 min'], [5, '5 min'], [10, '10 min'], [20, '20 min']].map(([m, l]) => `<button class="btn" data-min="${m}">${l}</button>`).join('')}<button class="btn red" id="cx">Stop</button></div></div>
      <div class="card"><h3>Tourniquet / treatment time log</h3><p class="small muted">Write the time a tourniquet was applied on the casualty’s forehead or the tourniquet itself (“TK 14:32”). Logs here are saved.</p>
      <input class="inp" id="tqn" placeholder="Who / what (e.g. TK right thigh)"><div class="btnrow"><button class="btn pri" id="tqa">Log now</button></div><div id="tql"></div></div>
      <div class="card"><h3>Stopwatch</h3><div class="big mono" id="sw">0:00.0</div><div class="btnrow"><button class="btn pri" id="sws">Start / Stop</button><button class="btn" id="swr">Reset</button></div></div>`;
    let end = 0, int = null, wake = null;
    const cdDraw = () => { const ms = Math.max(0, end - Date.now()); $('#cd').textContent = Math.floor(ms / 6e4) + ':' + String(Math.floor(ms % 6e4 / 1e3)).padStart(2, '0'); if (end && ms <= 0) { clearInterval(int); end = 0; toast('⏰ Time is up'); if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]); for (let i = 0; i < 3; i++) setTimeout(() => { beep(true); setTimeout(() => beep(false), 300); }, i * 600); if (wake) wake.release(); } };
    view.querySelectorAll('[data-min]').forEach(b => b.onclick = () => { audioUnlock(); end = Date.now() + b.dataset.min * 6e4; clearInterval(int); int = setInterval(cdDraw, 250); cdDraw(); if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => wake = w).catch(() => { }); });
    $('#cx').onclick = () => { end = 0; clearInterval(int); $('#cd').textContent = '0:00'; };
    const tqDraw = () => { const l = store.get('tqlog', []); $('#tql').innerHTML = l.map(x => `<div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${new Date(x.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> ${new Date(x.t).toLocaleDateString()} — ${esc(x.n)}</div>`).join(''); };
    $('#tqa').onclick = () => { const l = store.get('tqlog', []); l.unshift({ t: Date.now(), n: $('#tqn').value || 'Event' }); store.set('tqlog', l.slice(0, 50)); $('#tqn').value = ''; tqDraw(); };
    tqDraw();
    let sw0 = 0, swAcc = 0, swInt = null;
    $('#sws').onclick = () => { if (swInt) { swAcc += Date.now() - sw0; clearInterval(swInt); swInt = null; } else { sw0 = Date.now(); swInt = setInterval(() => { const ms = swAcc + Date.now() - sw0; $('#sw').textContent = Math.floor(ms / 6e4) + ':' + String(Math.floor(ms % 6e4 / 1e3)).padStart(2, '0') + '.' + Math.floor(ms % 1e3 / 100); }, 100); } };
    $('#swr').onclick = () => { swAcc = 0; sw0 = Date.now(); if (!swInt) $('#sw').textContent = '0:00.0'; };
    return () => { clearInterval(int); clearInterval(swInt); if (wake) wake.release(); };
  });
})();
