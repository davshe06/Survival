/* Offline eastern U.S. map (Maine to the Gulf) with GPS, waypoints, navigation, track recording, GPX import/export and optional saved topo tiles. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $ } = window.FG;
  const D2R = Math.PI / 180;
  const TILE_SOURCES = {
    usgs: { name: 'USGS Topo (contours, trails)', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', max: 16, dl: true, attr: 'USGS The National Map' },
    usgsimg: { name: 'USGS Satellite + labels', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', max: 16, dl: true, attr: 'USGS The National Map' },
    osm: { name: 'OpenStreetMap streets (view only)', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', max: 19, dl: false, attr: '© OpenStreetMap contributors' },
    terrain: { name: 'Terrain — contour lines & elevation', url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', max: 12, dl: true, overlay: true, attr: 'Terrain Tiles (AWS Open Data; USGS 3DEP/SRTM)' }
  };
  const TILE_CACHE = 'fg-tiles-v1';

  // ---------- projection ----------
  const mx = lon => (lon + 180) / 360;
  const my = lat => { const s = Math.sin(Math.max(-85, Math.min(85, lat)) * D2R); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
  const ilon = x => x * 360 - 180;
  const ilat = y => { const n = Math.PI - 2 * Math.PI * y; return Math.atan(Math.sinh(n)) / D2R; };

  // ---------- data loading / decoding ----------
  let MD = null, loading = null;
  function loadData() {
    if (MD) return Promise.resolve(MD);
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'data/map-se.js';
      s.onload = () => { MD = decode(window.MAP_DATA); res(MD); }; s.onerror = rej; document.head.appendChild(s);
    });
    return loading;
  }
  function decRing(arr) {
    const out = new Float64Array(arr.length); let x = 0, y = 0; let bx0 = 1, by0 = 1, bx1 = 0, by1 = 0;
    for (let i = 0; i < arr.length; i += 2) {
      x += arr[i]; y += arr[i + 1]; const X = mx(x / 1e4), Y = my(y / 1e4); out[i] = X; out[i + 1] = Y;
      if (X < bx0) bx0 = X; if (X > bx1) bx1 = X; if (Y < by0) by0 = Y; if (Y > by1) by1 = Y;
    }
    out.bb = [bx0, by0, bx1, by1]; return out;
  }
  function decFeat(list) { return list.map(f => { const r = f.r.map(decRing); const bb = r.reduce((b, x) => [Math.min(b[0], x.bb[0]), Math.min(b[1], x.bb[1]), Math.max(b[2], x.bb[2]), Math.max(b[3], x.bb[3])], [1, 1, 0, 0]); return Object.assign({}, f, { r, bb }); }); }
  function decode(d) {
    return {
      states: decFeat(d.states), lakes: decFeat(d.lakes), parks: decFeat(d.parks), urban: decFeat(d.urban),
      coast: decFeat(d.coast), rivers: decFeat(d.rivers), roads: decFeat(d.roads),
      counties: d.counties.map(decRing), countyLabels: d.countyLabels, stateLabels: d.stateLabels, places: d.places, airports: d.airports, bbox: d.bbox
    };
  }

  // ---------- state ----------
  const S = store.get('mapview', { lat: 32.8, lon: -84.5, z: 5.6 });
  let canvas, ctx, W = 0, H = 0, DPR = 1, dirty = true, raf = 0;
  let pos = null, follow = store.get('mapfollow', false), gpsStop = null, heading = null, firstFix = true, gpsErr = null, compBig = store.get('compbig', false), compDisp = 0, hdgSrc = '';
  let tilesOn = store.get('maptiles', ''), tileImgs = new Map();
  let target = store.get('navtarget', null);
  let recording = false, track = store.get('track', []);
  let colors = {};

  function readColors() {
    const cs = getComputedStyle(document.documentElement); const v = n => cs.getPropertyValue(n).trim();
    const theme = document.documentElement.dataset.theme || 'dark';
    const light = theme === 'light';
    colors = light ? {
      water: '#a7cbe0', land: '#efe9da', other: '#e2ddcf', urban: '#e3d6c3', park: '#cfe3bf', state: '#7a6f5c', county: 'rgba(80,70,50,.28)',
      road1: '#c8761a', road2: '#9c8f78', river: '#5d9ec0', text: '#2a2a22', halo: 'rgba(255,253,247,.9)', grid: 'rgba(0,0,0,.12)', me: '#1f6fd6', track: '#d6336c', wp: '#b3261e', nav: '#1f6fd6'
    } : theme === 'red' ? {
      water: '#0a0000', land: '#160000', other: '#100000', urban: '#200000', park: '#1a0000', state: '#a01010', county: 'rgba(160,20,20,.35)',
      road1: '#ff3b30', road2: '#7a1010', river: '#5a0808', text: '#ff453a', halo: 'rgba(0,0,0,.9)', grid: 'rgba(255,0,0,.15)', me: '#ff6b61', track: '#ff3b30', wp: '#ff3b30', nav: '#ff6b61'
    } : {
      water: '#16303d', land: '#252a1f', other: '#1d2119', urban: '#33382b', park: '#24361f', state: '#a59a7a', county: 'rgba(200,190,160,.18)',
      road1: '#d9a441', road2: '#7b7f6c', river: '#3f7896', text: '#e8e6da', halo: 'rgba(18,20,15,.85)', grid: 'rgba(255,255,255,.08)', me: '#4aa3ff', track: '#ff5c8a', wp: '#e2574c', nav: '#4aa3ff'
    };
    colors.font = v('--text') ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'sans-serif';
  }

  // ---------- view ----------
  route(/^\/map$/, (m, q) => {
    setTitle('Map & GPS');
    document.body.classList.add('is-map');
    if (q.get('lat')) { S.lat = +q.get('lat'); S.lon = +q.get('lon'); S.z = Math.max(S.z, 11); target = { lat: S.lat, lon: S.lon, name: 'Pinned point', mode: 'line' }; store.set('navtarget', target); navRoute = null; store.set('navroute', null); }
    view.innerHTML = `
      <div class="mapwrap">
        <canvas id="map"></canvas>
        <div class="mapui tl"><button class="iconbtn" id="mSearch" title="Find a place">🔍</button><button class="iconbtn" id="mLayers" title="Layers & offline maps">🗂️</button></div>
        <div class="mapui tr"><a class="iconbtn" href="#/" title="Close map">✕</a><button class="iconbtn" id="mWps" title="Waypoints">📌</button><button class="iconbtn" id="mCar" title="My car — park here / back to car">🚗</button><button class="iconbtn ${recording ? 'on' : ''}" id="mRec" title="Record track">⏺</button></div>
        <div class="mapui br"><button class="iconbtn mnorth" id="mNorth" title="Map orientation: tap for north-up / heading-up" aria-label="Map orientation" hidden><svg viewBox="0 0 40 40"><path d="M20 4 L27 21 H13Z" fill="#e2574c"/><path d="M20 36 L13 21 H27Z" fill="currentColor" opacity=".55"/><text x="20" y="25" font-size="9" font-weight="800" text-anchor="middle" fill="#fff">N</text></svg></button><button class="iconbtn" id="mZin" title="Zoom in">＋</button><button class="iconbtn" id="mZout" title="Zoom out">－</button><button class="iconbtn ${follow ? 'on' : ''}" id="mLoc" title="Center on my GPS location">◎</button></div>
        ${chipsHTML()}
        <div class="scale" id="mScale"></div>
        <div class="mcomp ${compBig ? 'big' : ''}" id="mComp" role="button" tabindex="0" aria-label="Compass. Tap to make it bigger or smaller.">${compassHTML()}</div>
        <div class="tbt" id="mTbt" hidden></div>
        <div class="hud" id="mHud">Loading map…</div>
        <div class="sheet" id="mSheet" hidden></div>
      </div>`;
    canvas = $('#map'); ctx = canvas.getContext('2d');
    readColors(); resize();
    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);
    const onTheme = () => { readColors(); dirty = true; };
    document.addEventListener('fg-theme', onTheme);
    bindGestures();
    $('#mZin').onclick = () => zoomAt(W / 2, H / 2, 1);
    $('#mZout').onclick = () => zoomAt(W / 2, H / 2, -1);
    $('#mLoc').onclick = () => {
      // like Apple Maps: 1st tap follows you (north up), 2nd tap turns the map with your direction of travel, 3rd back to north up
      if (!follow) { follow = true; if (rotMode === 'free') setRotMode('north'); if (pos) { S.lat = pos.lat; S.lon = pos.lon; if (S.z < 12) S.z = 13; } else toast('Waiting for GPS fix…'); }
      else if (rotMode !== 'heading') { setRotMode('heading'); if (tbt) store.set('navNorthUp', false); toast('Map turns with your direction of travel'); }
      else { setRotMode('north'); if (tbt) store.set('navNorthUp', true); toast('North up'); }
      store.set('mapfollow', follow); dirty = true;
    };
    $('#mNorth').onclick = () => {
      if (rotMode === 'north' && tbt) { setRotMode('heading'); store.set('navNorthUp', false); if (!follow) { follow = true; store.set('mapfollow', true); if (pos) { S.lat = pos.lat; S.lon = pos.lon; } } toast('Heading up'); }
      else { setRotMode('north'); if (tbt) store.set('navNorthUp', true); toast('North up'); }
    };
    bindChips();
    $('#mRec').onclick = toggleRec; $('#mCar').onclick = carSheet;
    if (q.get('car')) setTimeout(carSheet, 300);
    $('#mWps').onclick = showWaypoints;
    $('#mLayers').onclick = showLayers;
    $('#mSearch').onclick = showSearch;
    // Live position from the phone's built-in GPS (iOS Core Location via the browser). Works with no cell signal or internet.
    firstFix = true; gpsErr = null;
    const onGpsErr = e => { gpsErr = e; updateHud(); };
    const startGPS = () => { if (gpsStop) gpsStop(); gpsStop = window.FG.watchGPS(onPos, onGpsErr); };
    if (!bgStop) startGPS(); else { gpsStop = bgStop; bgStop = null; }
    // iOS pauses location when the app is in the background; restart the GPS watch when it comes back.
    const onVis = () => { if (document.visibilityState === 'visible') { firstFix = !pos; startGPS(); } };
    document.addEventListener('visibilitychange', onVis);
    const hudTimer = setInterval(() => { if (pos) updateHud(); }, 5000);
    // Live compass (iPhone magnetometer). Shown as the compass widget and as the direction cone on your dot.
    const onOri = e => {
      let h = null;
      if (e.webkitCompassHeading != null && e.webkitCompassHeading >= 0) h = e.webkitCompassHeading; // iOS, magnetic north
      else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
      if (h == null) return;
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      const decl = pos ? Geo.declination(pos.lat, pos.lon) : 0; // convert magnetic → true north to match the map
      heading = (h + so + decl + 360) % 360; hdgSrc = 'compass'; dirty = true; updCompass();
    };
    window.addEventListener('deviceorientationabsolute', onOri, true); window.addEventListener('deviceorientation', onOri, true);
    const sizeComp = () => { const c = $('#mComp'); if (c) c.style.setProperty('--bigc', Math.round(Math.min(Math.sqrt(0.25 * innerWidth * innerHeight), innerWidth * 0.92, innerHeight * 0.6)) + 'px'); };
    sizeComp(); window.addEventListener('resize', sizeComp);
    $('#mComp').onclick = () => {
      // iOS only lets a page read the compass after the person taps something, so the first tap also asks for access.
      if (hdgSrc !== 'compass' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(r => { if (r !== 'granted') toast('Compass blocked — allow Motion & Orientation access for this app in Settings'); }).catch(() => { });
      }
      compBig = !compBig; store.set('compbig', compBig); $('#mComp').classList.toggle('big', compBig); updCompass();
    };
    updCompass();
    loadData().then(() => { dirty = true; updateHud(); }).catch(() => setHud('Map data failed to load.'));
    let wake = null; if (recording && navigator.wakeLock) navigator.wakeLock.request('screen').then(w => wake = w).catch(() => { });
    loop();
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); document.removeEventListener('fg-theme', onTheme);
      window.removeEventListener('deviceorientation', onOri, true); window.removeEventListener('deviceorientationabsolute', onOri, true); window.removeEventListener('resize', sizeComp);
      document.removeEventListener('visibilitychange', onVis); clearInterval(hudTimer);
      if (gpsStop && !recording) gpsStop(); else if (gpsStop) bgStop = gpsStop;
      gpsStop = null;
      if (wake) wake.release();
      store.set('mapview', S); document.body.classList.remove('is-map');
    };
  });
  let bgStop = null;

  // ---------- live compass widget ----------
  function compassHTML() {
    let t = '';
    for (let i = 0; i < 360; i += 10) {
      const a = (i - 90) * D2R, big = i % 30 === 0, r1 = big ? 78 : 84;
      t += `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(100 + r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + 92 * Math.cos(a)).toFixed(1)}" y2="${(100 + 92 * Math.sin(a)).toFixed(1)}" stroke="currentColor" stroke-width="${big ? 2.4 : 1.2}"/>`;
      if (big && i % 90) t += `<text class="cdeg" x="${(100 + 66 * Math.cos(a)).toFixed(1)}" y="${(100 + 66 * Math.sin(a) + 4).toFixed(1)}" font-size="11" text-anchor="middle" fill="currentColor">${i}</text>`;
    }
    const L = (txt, d, col) => { const a = (d - 90) * D2R; return `<text x="${(100 + 64 * Math.cos(a)).toFixed(1)}" y="${(100 + 64 * Math.sin(a) + 8).toFixed(1)}" font-size="${txt === 'N' ? 26 : 20}" font-weight="800" text-anchor="middle" fill="${col}">${txt}</text>`; };
    return `<div class="crose" id="cRose"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" class="cface"/>${t}${L('N', 0, '#e2574c')}${L('E', 90, 'currentColor')}${L('S', 180, 'currentColor')}${L('W', 270, 'currentColor')}
        <g id="cTgt" style="display:none"><path d="M100 14 L111 40 L100 34 L89 40Z" fill="#4aa3ff" stroke="#fff" stroke-width="1.5"/></g></svg></div>
      <svg class="ctop" viewBox="0 0 200 200"><path d="M100 2 L110 20 L90 20Z" fill="#e2574c"/>
        <text id="cDeg" x="100" y="108" font-size="34" font-weight="800" text-anchor="middle" fill="currentColor">—</text>
        <text id="cSub" x="100" y="130" font-size="12" text-anchor="middle" fill="currentColor" class="cdeg">tap for compass</text></svg>`;
  }
  function updCompass() {
    const rose = $('#cRose'); if (!rose) return;
    if (heading != null) {
      const diff = ((heading - compDisp) % 360 + 540) % 360 - 180; compDisp += diff; // shortest way round, no spinning at 359→0
      rose.style.transform = `rotate(${-compDisp}deg)`;
      $('#cDeg').textContent = Math.round(heading) + '°';
    } else $('#cDeg').textContent = '—';
    let sub = heading == null ? 'tap to start' : Geo.cardinal(heading) + (hdgSrc === 'gps' ? ' (GPS course)' : '');
    const tg = $('#cTgt');
    if (target && pos) {
      const prog = navRoute ? routeProgress() : null, aim = prog ? prog.ahead : target; // follow the route, not the crow-fly line
      const b = Geo.bearing(pos, aim); tg.style.display = ''; tg.setAttribute('transform', `rotate(${b} 100 100)`);
      if (heading != null) { const rel = ((b - heading) % 360 + 540) % 360 - 180; sub = Math.abs(rel) < 8 ? '✓ on course' : (rel > 0 ? 'turn right ' : 'turn left ') + Math.abs(Math.round(rel)) + '°'; }
      sub += ' · ' + Geo.fmtDist(prog ? prog.left : Geo.dist(pos, target), window.FG.units());
    } else tg.style.display = 'none';
    $('#cSub').textContent = sub;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * DPR; canvas.height = H * DPR; dirty = true;
  }
  function loop(t) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(120, Math.max(0, t - (lastT || t))); lastT = t; const k = 1 - Math.exp(-dt / 260);
    // ease the map's rotation toward the direction of travel (shortest way round)
    const tr = rotTarget(); S.b = S.b || 0;
    if (tr != null) { const d = ((tr - S.b) % 360 + 540) % 360 - 180; if (Math.abs(d) > .1) { S.b = (S.b + (Math.abs(d) < .4 ? d : d * k) + 360) % 360; dirty = true; } else if (d) { S.b = (tr + 360) % 360; dirty = true; } }
    // heading-up: put you lower on screen so more of the road ahead is visible
    const oyT = headingUp() ? H * (tbt ? .2 : .14) : 0;
    if (!follow) { if (oy) { oy = 0; dirty = true; } }
    else if (Math.abs(oyT - oy) > .5) { oy += (oyT - oy) * k; dirty = true; } else if (oy !== oyT) { oy = oyT; dirty = true; }
    // glide your position (and the map, when following) between GPS fixes; ~30 fps is plenty
    if (pos && t - lastDrawT > 30) {
      const moving = (tbt && pos.spd > 1) || (dispFrom && performance.now() - dispAt < 850);
      if (moving) { const d = dispPos(performance.now()); if (follow) { S.lat = d.lat; S.lon = d.lon; } dirty = true; }
    }
    if (dirty) { dirty = false; lastDrawT = t; draw(); }
  }
  let lastT = 0, lastTH = null, northDisp = 0;
  // 'north' = north-up, 'heading' = turn the map with your direction of travel (while following GPS), 'free' = rotated by hand
  let rotMode = store.get('maprot', 'north');
  function setRotMode(m) { rotMode = m; store.set('maprot', m); dirty = true; }
  const headingUp = () => rotMode === 'heading' && follow && !!pos;
  function travelHeading() {
    if (!pos) return lastTH;
    const gpsOK = pos.hdg != null && !isNaN(pos.hdg) && pos.hdg >= 0;
    if (tbt) { const dp = dispPos(performance.now()); if (dp && dp.snapped && pos.spd > 1) return lastTH = dp.hdg; } // follow the road, steadier than GPS course
    if (gpsOK && pos.spd > 2) return lastTH = pos.hdg;                       // driving / cycling: GPS course is steady
    if (tbt && navRoute) { const p = routeProgress(); if (p && p.off < 40) { const a = ptAt(navRoute, p.s), b = ptAt(navRoute, p.s + 30); if (Geo.dist(a, b) > 3) return lastTH = Geo.bearing(a, b); } } // stopped on the route: face along it
    if (hdgSrc === 'compass' && heading != null) return lastTH = heading;  // walking / standing: phone compass
    if (gpsOK && pos.spd > .7) return lastTH = pos.hdg;
    return lastTH;
  }
  function rotTarget() { if (rotMode === 'north') return 0; if (headingUp()) return travelHeading(); return null; }
  function updLocBtn() { const b = $('#mLoc'); if (!b) return; b.classList.toggle('on', follow); const hu = rotMode === 'heading' && follow; if (b.classList.contains('hd') !== hu || !b.firstElementChild) b.innerHTML = hu ? '<span class="lochd">➤</span>' : '<span>◎</span>'; b.classList.toggle('hd', hu); b.title = hu ? 'Following — map turns with you (tap for north-up)' : follow ? 'Following — north up (tap to turn the map with you)' : 'Center on my GPS location'; }
  function updNorth() {
    updLocBtn(); const n = $('#mNorth'); if (!n) return;
    const show = Math.abs(((S.b || 0) + 180) % 360 - 180) > .5 || rotMode !== 'north' || tbt;
    n.hidden = !show; if (!show) return;
    northDisp += ((-(S.b || 0) - northDisp) % 360 + 540) % 360 - 180; // unwrapped, so it never spins the long way round
    n.firstElementChild.style.transform = `rotate(${northDisp}deg)`;
    n.classList.toggle('on', headingUp());
  }

  // world size in px at zoom
  const ws = () => 256 * Math.pow(2, S.z);
  // Map rotation: S.b is the compass bearing at the top of the screen (0 = north-up). The map centre (S.lat/S.lon)
  // sits at the pivot (W/2, H/2 + oy); oy pushes your position lower on screen in heading-up mode so you see more road ahead.
  // Geometry is drawn in "unrotated" coordinates under a rotated canvas transform (geoPhase); markers and labels use
  // fully-transformed screen coordinates so they stay upright.
  let rc = 1, rs = 0, oy = 0, geoPhase = false;
  function setRot() { const a = -(S.b || 0) * D2R; rc = Math.cos(a); rs = Math.sin(a); }
  function toScreen(X, Y) {
    const w = ws(), dx = (X - mx(S.lon)) * w, dy = (Y - my(S.lat)) * w;
    if (geoPhase) return [dx + W / 2, dy + H / 2];
    return [W / 2 + dx * rc - dy * rs, H / 2 + oy + dx * rs + dy * rc];
  }
  function toWorld(px, py) {
    const w = ws(), ex = px - W / 2, ey = py - H / 2 - oy;
    return [(ex * rc + ey * rs) / w + mx(S.lon), (-ex * rs + ey * rc) / w + my(S.lat)];
  }
  function geoTransform() { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.translate(W / 2, H / 2 + oy); ctx.rotate(-(S.b || 0) * D2R); ctx.translate(-W / 2, -H / 2); geoPhase = true; }
  function plainTransform() { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); geoPhase = false; }
  function viewBox() { // world bounding box of the (possibly rotated) screen
    const c = [toWorld(0, 0), toWorld(W, 0), toWorld(0, H), toWorld(W, H)];
    return [Math.min(...c.map(p => p[0])), Math.min(...c.map(p => p[1])), Math.max(...c.map(p => p[0])), Math.max(...c.map(p => p[1]))];
  }

  // ---------- drawing ----------
  function pathRing(r, close) {
    const w = ws(), cx = mx(S.lon), cy = my(S.lat), hw = W / 2, hh = H / 2;
    ctx.moveTo((r[0] - cx) * w + hw, (r[1] - cy) * w + hh);
    for (let i = 2; i < r.length; i += 2) ctx.lineTo((r[i] - cx) * w + hw, (r[i + 1] - cy) * w + hh);
    if (close) ctx.closePath();
  }
  function visible(bb, vb) { return !(bb[2] < vb[0] || bb[0] > vb[2] || bb[3] < vb[1] || bb[1] > vb[3]); }
  function draw() {
    setRot(); plainTransform();
    ctx.fillStyle = colors.water; ctx.fillRect(0, 0, W, H);
    const vb = viewBox();
    geoTransform();
    const z = S.z;
    let tilesDrawn = false;
    if (tilesOn) tilesDrawn = drawTiles(vb);
    if (MD && !(tilesDrawn && tilesFull)) {
      // land
      ctx.beginPath(); for (const f of MD.states) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true);
      ctx.fillStyle = colors.land; ctx.fill('evenodd');
      if (z >= 6) { ctx.beginPath(); for (const f of MD.urban) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true); ctx.fillStyle = colors.urban; ctx.fill('evenodd'); }
      ctx.beginPath(); for (const f of MD.parks) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true); ctx.fillStyle = colors.park; ctx.fill('evenodd');
      ctx.beginPath(); for (const f of MD.lakes) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true); ctx.fillStyle = colors.water; ctx.fill('evenodd');
    }
    if (MD) {
      const overlay = tilesDrawn && tilesFull;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (!overlay) {
        // rivers
        ctx.strokeStyle = colors.river;
        for (const k of [2, 1]) {
          if (k === 2 && z < 7) continue;
          ctx.beginPath(); for (const f of MD.rivers) if (f.k === k && visible(f.bb, vb)) for (const r of f.r) pathRing(r);
          ctx.lineWidth = k === 1 ? Math.max(1, (z - 4) * .45) : .9; ctx.stroke();
        }
      }
      // counties
      if (z >= 6.5) { ctx.beginPath(); for (const r of MD.counties) if (visible(r.bb, vb)) pathRing(r); ctx.strokeStyle = colors.county; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]); }
      drawDetail(vb, overlay);
      // states
      ctx.beginPath(); for (const f of MD.states) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true);
      ctx.strokeStyle = colors.state; ctx.lineWidth = z > 8 ? 2 : 1.3; ctx.setLineDash(z > 7 ? [8, 4] : []); ctx.stroke(); ctx.setLineDash([]);
      if (!overlay && !tigerReady(vb)) {
        // roads (coarse, until the detailed state data is loaded)
        if (z >= 6.5) { ctx.beginPath(); for (const f of MD.roads) if (f.k === 2 && visible(f.bb, vb)) for (const r of f.r) pathRing(r); ctx.strokeStyle = colors.road2; ctx.lineWidth = z > 9 ? 1.6 : 1; ctx.stroke(); }
        if (z >= 4.5) { ctx.beginPath(); for (const f of MD.roads) if (f.k === 1 && visible(f.bb, vb)) for (const r of f.r) pathRing(r); ctx.strokeStyle = colors.road1; ctx.lineWidth = z > 9 ? 3 : z > 7 ? 2 : 1.3; ctx.stroke(); }
      }
    }
    plainTransform();
    if (store.get('mapgrid', false)) drawGrid(vb);
    drawSignals(vb);
    const pts = drawPoints(vb); const pls = MD ? drawPlaces(vb) : [];
    drawTrack(); drawNav(); drawWaypoints(); drawMe();
    if (MD) { drawLabels(vb); drawPlaceLabels(pls); drawDetailLabels(vb, pts); drawContourLabels(); }
    drawScale(); updNorth();
  }

  function drawGrid(vb) {
    const z = S.z; const step = z < 6 ? 5 : z < 8 ? 1 : z < 10 ? .5 : z < 12 ? .1 : z < 14 ? .05 : .01;
    const lon0 = Math.floor(ilon(vb[0]) / step) * step, lon1 = ilon(vb[2]); const lat0 = Math.floor(ilat(vb[3]) / step) * step, lat1 = ilat(vb[1]);
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.fillStyle = colors.text; ctx.font = '10px ' + colors.font; ctx.beginPath();
    const seg = (a, b) => { const p = toScreen(a[0], a[1]), q = toScreen(b[0], b[1]); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
    for (let lo = lon0; lo <= lon1; lo += step) seg([mx(lo), vb[1]], [mx(lo), vb[3]]);
    for (let la = lat0; la <= lat1; la += step) seg([vb[0], my(la)], [vb[2], my(la)]);
    ctx.stroke();
    const [, yLab] = toWorld(W / 2, H - 150), [xLab] = toWorld(20, H / 2);
    for (let lo = lon0; lo <= lon1; lo += step) { const [x, y] = toScreen(mx(lo), yLab); ctx.fillText(lo.toFixed(step < .1 ? 2 : 1) + '°', x + 2, y); }
    for (let la = lat0; la <= lat1; la += step) { const [x, y] = toScreen(xLab, my(la)); ctx.fillText(la.toFixed(step < .1 ? 2 : 1) + '°', x, y - 2); }
  }

  const placed = [];
  function label(text, x, y, opt = {}) {
    if (x < -50 || y < -20 || x > W + 50 || y > H + 20) return false;
    ctx.font = (opt.weight || '') + ' ' + (opt.size || 12) + 'px ' + colors.font;
    const w = ctx.measureText(text).width, h = (opt.size || 12);
    const bx = x - (opt.align === 'left' ? -6 : w / 2), by = y - h / 2;
    const rect = [bx - 2, by - 2, bx + w + 2, by + h + 2];
    for (const p of placed) if (!(rect[2] < p[0] || rect[0] > p[2] || rect[3] < p[1] || rect[1] > p[3])) return false;
    placed.push(rect);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = colors.halo; ctx.strokeText(text, bx, y); ctx.fillStyle = opt.color || colors.text; ctx.fillText(text, bx, y);
    return true;
  }
  function drawLabels(vb) {
    placed.length = 0; const z = S.z;
    // waypoint labels first (priority)
    store.get('waypoints', []).forEach(w => { const [x, y] = toScreen(mx(w.lon), my(w.lat)); label(w.name, x, y - 18, { size: 12, weight: '600', color: colors.wp }); });
    if (z < 7.5) MD.stateLabels.forEach(s => { const [x, y] = toScreen(mx(s.x), my(s.y)); label(z < 5.5 ? s.a : s.n.toUpperCase(), x, y, { size: z < 5.5 ? 12 : 13, weight: '700', color: colors.state }); });
    const minPop = z < 5 ? 500000 : z < 6 ? 150000 : z < 7 ? 50000 : z < 8 ? 15000 : 0;
    for (const p of MD.places) {
      if (p.p < minPop) continue;
      const [x, y] = toScreen(mx(p.x), my(p.y)); if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const big = p.p > 250000;
      if (label(p.n, x, y, { size: big ? 13 : 11.5, weight: big ? '600' : '', align: 'left' })) {
        ctx.beginPath(); ctx.arc(x, y, big ? 3.5 : 2.5, 0, 7); ctx.fillStyle = colors.text; ctx.fill(); ctx.strokeStyle = colors.halo; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    if (z >= 8) MD.airports.forEach(a => { const [x, y] = toScreen(mx(a.x), my(a.y)); label('✈ ' + (a.c || a.n), x, y, { size: 10.5 }); });
    if (z >= 7.8) MD.countyLabels.forEach(c => { const [x, y] = toScreen(mx(c.x), my(c.y)); label(c.n + ' Co.', x, y, { size: 10.5, color: colors.state }); });
    if (z >= 7 && !(tilesOn && tilesFull) && !tigerReady(vb)) {
      // road shields: one per named road, at a visible point
      ctx.font = '600 10px ' + colors.font; let n = 0;
      for (const f of MD.roads) {
        if (!f.n || (f.k !== 1 && z < 8.5) || !visible(f.bb, vb)) continue;
        const r = f.r[0]; const mid = Math.floor(r.length / 4) * 2; const [x, y] = toScreen(r[mid], r[mid + 1]);
        if (label(f.n, x, y, { size: 10, weight: '700', color: colors.road1 }) && ++n > 40) break;
      }
      if (z >= 8) for (const f of MD.rivers) { if (!f.n || !visible(f.bb, vb)) continue; const r = f.r[0]; const mid = Math.floor(r.length / 4) * 2; const [x, y] = toScreen(r[mid], r[mid + 1]); label(f.n, x, y, { size: 10, color: colors.river }); }
    }
  }
  function drawMe() {
    if (!pos) return;
    const dp = dispPos(performance.now()); const [x, y] = toScreen(mx(dp.lon), my(dp.lat));
    const mPerPx = 156543.03 * Math.cos(pos.lat * D2R) / Math.pow(2, S.z);
    const r = pos.acc / mPerPx;
    if (r > 8 && !dp.snapped) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = colors.me + '22'; ctx.fill(); ctx.strokeStyle = colors.me + '66'; ctx.lineWidth = 1; ctx.stroke(); }
    let h = heading != null ? heading : (pos.hdg != null && !isNaN(pos.hdg) && pos.spd > .5 ? pos.hdg : null);
    if (dp.snapped) h = dp.hdg; // on the route: point along the road
    if (dp.snapped || (headingUp() && (tbt || pos.spd > 2))) {
      // driving / heading-up: a navigation arrow pointing the way you're travelling
      const a = ((h != null ? h : S.b) - S.b) * D2R;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(11, 11); ctx.lineTo(0, 5); ctx.lineTo(-11, 11); ctx.closePath();
      ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 6; ctx.fillStyle = '#fff'; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = colors.me; ctx.fill(); ctx.restore();
      return;
    }
    if (h != null) { ctx.save(); ctx.translate(x, y); ctx.rotate((h - (S.b || 0)) * D2R); ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(9, -6); ctx.lineTo(-9, -6); ctx.closePath(); ctx.fillStyle = colors.me; ctx.globalAlpha = .7; ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fillStyle = colors.me; ctx.fill();
  }
  function drawWaypoints() {
    for (const w of store.get('waypoints', [])) {
      const [x, y] = toScreen(mx(w.lon), my(w.lat)); if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y - 14, 7, Math.PI * .8, Math.PI * 2.2); ctx.closePath(); ctx.fillStyle = colors.wp; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - 14, 3, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    }
  }
  function drawTrack() {
    const tracks = store.get('tracks', []).filter(t => t.show).map(t => t.pts);
    if (track.length) tracks.push(track);
    ctx.strokeStyle = colors.track; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    for (const t of tracks) { if (t.length < 2) continue; ctx.beginPath(); t.forEach((p, i) => { const [x, y] = toScreen(mx(p[1]), my(p[0])); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
  }
  function drawNav() {
    if (!target) return;
    const [tx, ty] = toScreen(mx(target.lon), my(target.lat));
    ctx.beginPath(); ctx.arc(tx, ty, 11, 0, 7); ctx.strokeStyle = colors.nav; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 16, ty); ctx.lineTo(tx + 16, ty); ctx.moveTo(tx, ty - 16); ctx.lineTo(tx, ty + 16); ctx.lineWidth = 1.5; ctx.stroke();
    if (navRoute) drawRoute();
    else if (pos) { const [x, y] = toScreen(mx(pos.lon), my(pos.lat)); ctx.beginPath(); ctx.setLineDash([8, 6]); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.strokeStyle = colors.nav; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); }
  }
  function drawScale() {
    const lat = S.lat; const mPerPx = 156543.03 * Math.cos(lat * D2R) / Math.pow(2, S.z);
    const imp = window.FG.units() !== 'met';
    const unitM = imp ? 1609.344 : 1000; let target = mPerPx * 100;
    let val, label;
    if (imp && target < 1609.344 / 2) { const ft = target * 3.28084; const nice = niceNum(ft); val = nice / 3.28084; label = nice + ' ft'; }
    else if (!imp && target < 1000) { const nice = niceNum(target); val = nice; label = nice + ' m'; }
    else { const u = target / unitM; const nice = niceNum(u); val = nice * unitM; label = nice + (imp ? ' mi' : ' km'); }
    const el = $('#mScale'); if (el) el.innerHTML = `${label}<i style="width:${Math.round(val / mPerPx)}px"></i>`;
  }
  function niceNum(x) { const p = Math.pow(10, Math.floor(Math.log10(x))); const f = x / p; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; }


  // =====================================================================
  // Detail layers & filter overlays: TIGER roads, local-road packs, trails,
  // forest/4WD roads, water sources (USGS GNIS) and contour lines generated
  // on the device from terrain tiles.
  // =====================================================================
  const LAYERS = Object.assign({ roads: true, water: false, trails: false, forest: false, contours: false, places: false }, store.get('maplayers', {}));
  const PACK_CACHE = 'fg-packs-v1';
  const TERRAIN_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
  let SEIDX = null; const SEDATA = {}, LOCAL = {}, loadingSet = new Set(); let WATER = null, LOCALHAVE = {};
  const GRID = 1024; // world grid cell ≈ 39 km
  function decLines(list, scale, f32) {
    return list.map(([k, n, c]) => {
      const A = f32 ? new Float32Array(c.length) : new Float64Array(c.length); let x = 0, y = 0, b0 = 1, b1 = 1, b2 = 0, b3 = 0;
      for (let i = 0; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; const X = mx(x / scale), Y = my(y / scale); A[i] = X; A[i + 1] = Y; if (X < b0) b0 = X; if (X > b2) b2 = X; if (Y < b1) b1 = Y; if (Y > b3) b3 = Y; }
      return { k, n, r: A, bb: [b0, b1, b2, b3] };
    });
  }
  // Compact form for huge local-road packs: one Float32Array of coordinates + offsets (far less memory than objects)
  function compactLines(list, scale) {
    const n = list.length; let total = 0; for (const l of list) total += l[2].length;
    const xy = new Float32Array(total), off = new Uint32Array(n + 1), bb = new Float32Array(n * 4), k = new Uint8Array(n), names = new Array(n), st = new Uint32Array(n);
    let o = 0;
    for (let f = 0; f < n; f++) {
      const c = list[f][2]; k[f] = list[f][0]; names[f] = list[f][1]; off[f] = o; let x = 0, y = 0, b0 = 1, b1 = 1, b2 = 0, b3 = 0;
      for (let i = 0; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; const X = mx(x / scale), Y = my(y / scale); xy[o++] = X; xy[o++] = Y; if (X < b0) b0 = X; if (X > b2) b2 = X; if (Y < b1) b1 = Y; if (Y > b3) b3 = Y; }
      bb[f * 4] = b0; bb[f * 4 + 1] = b1; bb[f * 4 + 2] = b2; bb[f * 4 + 3] = b3;
    }
    off[n] = o;
    const tmp = new Map();
    for (let f = 0; f < n; f++) for (let gx = Math.floor(bb[f * 4] * GRID); gx <= Math.floor(bb[f * 4 + 2] * GRID); gx++) for (let gy = Math.floor(bb[f * 4 + 1] * GRID); gy <= Math.floor(bb[f * 4 + 3] * GRID); gy++) { const key = gx * 100000 + gy; let a = tmp.get(key); if (!a) tmp.set(key, a = []); a.push(f); }
    const g = new Map(); for (const [key, a] of tmp) g.set(key, Int32Array.from(a));
    return { compact: true, n, xy, off, bb, k, names, st, g };
  }
  function eachVisibleC(c, vb, fn) {
    const s = ++stampN, { bb, st, g } = c;
    for (let gx = Math.floor(vb[0] * GRID); gx <= Math.floor(vb[2] * GRID); gx++) for (let gy = Math.floor(vb[1] * GRID); gy <= Math.floor(vb[3] * GRID); gy++) {
      const a = g.get(gx * 100000 + gy); if (!a) continue;
      for (let j = 0; j < a.length; j++) { const f = a[j]; if (st[f] === s) continue; st[f] = s; if (bb[f * 4 + 2] < vb[0] || bb[f * 4] > vb[2] || bb[f * 4 + 3] < vb[1] || bb[f * 4 + 1] > vb[3]) continue; fn(f); }
    }
  }
  function gridIndex(feats) {
    const g = new Map();
    feats.forEach((f, i) => { for (let gx = Math.floor(f.bb[0] * GRID); gx <= Math.floor(f.bb[2] * GRID); gx++) for (let gy = Math.floor(f.bb[1] * GRID); gy <= Math.floor(f.bb[3] * GRID); gy++) { const key = gx * 100000 + gy; let a = g.get(key); if (!a) g.set(key, a = []); a.push(i); } });
    return { feats, g };
  }
  let stampN = 1;
  function eachVisible(ix, vb, fn) {
    if (!ix) return; const st = ++stampN; const { feats, g } = ix;
    for (let gx = Math.floor(vb[0] * GRID); gx <= Math.floor(vb[2] * GRID); gx++) for (let gy = Math.floor(vb[1] * GRID); gy <= Math.floor(vb[3] * GRID); gy++) {
      const a = g.get(gx * 100000 + gy); if (!a) continue;
      for (const i of a) { const f = feats[i]; if (f._s === st) continue; f._s = st; if (visible(f.bb, vb)) fn(f); }
    }
  }
  function statesInView(vb) {
    if (!SEIDX) return [];
    const w = [ilon(vb[0]), ilat(vb[3]), ilon(vb[2]), ilat(vb[1])];
    return SEIDX.states.filter(s => !(s.bbox[2] < w[0] || s.bbox[0] > w[2] || s.bbox[3] < w[1] || s.bbox[1] > w[3]));
  }
  async function loadJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(url); return r.json(); }
  function ensureDetail(vb) {
    if (!SEIDX) { if (!loadingSet.has('idx')) { loadingSet.add('idx'); loadJSON('data/se/index.json').then(j => { SEIDX = j; dirty = true; refreshLocalHave(); }).catch(() => { }); } return; }
    if (S.z < 7.5) return;
    for (const s of statesInView(vb)) {
      if (!SEDATA[s.code] && !loadingSet.has(s.code)) {
        loadingSet.add(s.code);
        loadJSON('data/se/' + s.code + '.json').then(d => {
          SEDATA[s.code] = { major: gridIndex(decLines(d.major, 1e5)), fs: gridIndex(decLines(d.fs, 1e5)), trails: gridIndex(decLines(d.trails, 1e5)), sig: decSignals(d.sig) }; dirty = true;
          if (navRoute) markLights(navRoute);
        }).catch(() => loadingSet.delete(s.code));
      }
      if (LAYERS.roads && S.z >= 11 && LOCALHAVE[s.code] && !LOCAL[s.code] && !loadingSet.has('L' + s.code)) {
        loadingSet.add('L' + s.code);
        caches.open(PACK_CACHE).then(c => c.match(packURL(s.code))).then(r => r ? r.json() : null).then(d => {
          if (d) { LOCAL[s.code] = compactLines(d.local, 1e5); dirty = true; } else loadingSet.delete('L' + s.code);
        }).catch(() => loadingSet.delete('L' + s.code));
      }
    }
    if ((LAYERS.water || S.z >= 11) && !WATER && !loadingSet.has('water')) {
      loadingSet.add('water');
      loadJSON('data/water.json').then(d => { WATER = d.pts.map(([t, n, x, y]) => ({ t, n, X: mx(x / d.scale), Y: my(y / d.scale), lat: y / d.scale, lon: x / d.scale })); dirty = true; }).catch(() => loadingSet.delete('water'));
    }
  }
  const packURL = code => new URL('data/packs/local-' + code + '.json', location.href).href;
  async function refreshLocalHave() {
    if (!('caches' in window) || !SEIDX) return;
    try { const c = await caches.open(PACK_CACHE); for (const s of SEIDX.states) LOCALHAVE[s.code] = !!(await c.match(packURL(s.code))); } catch (e) { }
    dirty = true;
  }
  function strokeLines(ix, vb, filter, style) {
    ctx.beginPath(); let any = false;
    if (ix && ix.compact) {
      const w = ws(), cx = mx(S.lon), cy = my(S.lat), hw = W / 2, hh = H / 2, { xy, off, k } = ix;
      const minW = 2.5 / w, bbA = ix.bb;
      eachVisibleC(ix, vb, f => { if (filter && !filter({ k: k[f] })) return; if (bbA[f * 4 + 2] - bbA[f * 4] + bbA[f * 4 + 3] - bbA[f * 4 + 1] < minW) return; let i = off[f]; ctx.moveTo((xy[i] - cx) * w + hw, (xy[i + 1] - cy) * w + hh); for (i += 2; i < off[f + 1]; i += 2) ctx.lineTo((xy[i] - cx) * w + hw, (xy[i + 1] - cy) * w + hh); any = true; });
    } else {
      const w = ws(), cx = mx(S.lon), cy = my(S.lat), hw = W / 2, hh = H / 2, minW = 2.5 / w;
      eachVisible(ix, vb, f => {
        if ((filter && !filter(f)) || f.bb[2] - f.bb[0] + f.bb[3] - f.bb[1] < minW) return;
        const r = f.r; let lx = (r[0] - cx) * w + hw, ly = (r[1] - cy) * w + hh; ctx.moveTo(lx, ly);
        for (let i = 2; i < r.length; i += 2) { const x = (r[i] - cx) * w + hw, y = (r[i + 1] - cy) * w + hh; if (i < r.length - 2 && Math.abs(x - lx) + Math.abs(y - ly) < 1.5) continue; ctx.lineTo(x, y); lx = x; ly = y; }
        any = true;
      });
    }
    if (!any) return;
    if (style.halo) { ctx.strokeStyle = colors.halo; ctx.lineWidth = style.w + 2.5; ctx.setLineDash([]); ctx.stroke(); }
    ctx.strokeStyle = style.c; ctx.lineWidth = style.w; ctx.setLineDash(style.dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function overlayColors() {
    const t = document.documentElement.dataset.theme || 'dark';
    if (t === 'red') return { trail: '#ff6b61', ohv: '#d0281f', fs: '#ff453a', four: '#b3221a', water: '#ff6b61', spring: '#ff3b30', contour: 'rgba(255,60,50,.45)', contourIdx: 'rgba(255,60,50,.8)', local: '#7a1010' };
    if (t === 'light') return { trail: '#c2185b', ohv: '#8d4b00', fs: '#d26a00', four: '#9c6b2f', water: '#0a7fd1', spring: '#0066cc', contour: 'rgba(140,90,40,.32)', contourIdx: 'rgba(120,70,25,.7)', local: '#b9ae98' };
    return { trail: '#ff5ea8', ohv: '#ff9e3d', fs: '#ffb347', four: '#c9a26b', water: '#4cc3ff', spring: '#5fd0ff', contour: 'rgba(214,170,120,.26)', contourIdx: 'rgba(230,185,130,.6)', local: '#5c6152' };
  }
  // Called from draw() after counties and before state borders
  function drawDetail(vb, overlay) {
    ensureDetail(vb);
    const z = S.z, oc = overlayColors(), sts = statesInView(vb).map(s => SEDATA[s.code]).filter(Boolean);
    if (LAYERS.contours && z >= 11.5) drawContours(vb, oc);
    if (LAYERS.roads && z >= 11) for (const s of statesInView(vb)) if (LOCAL[s.code]) strokeLines(LOCAL[s.code], vb, f => z >= 13 || f.k === 1, { c: oc.local, w: z >= 14 ? 2 : 1 });
    if (LAYERS.forest && z >= 8.5) { const near = z >= 11.5; for (const d of sts) { if (z >= 10.5) strokeLines(d.fs, vb, f => f.k === 2, { c: oc.four, w: z >= 12 ? 2.4 : 1.6, dash: near ? [5, 4] : null, halo: near }); strokeLines(d.fs, vb, f => f.k === 1, { c: oc.fs, w: z >= 12 ? 3 : 2, dash: near ? [8, 4] : null, halo: near }); } }
    if (!overlay && z >= 8 && sts.length) for (const d of sts) { if (z >= 12.5) strokeLines(d.major, vb, f => f.k === 3, { c: colors.road2, w: 1.4 }); strokeLines(d.major, vb, f => f.k === 2, { c: colors.road2, w: z > 11 ? 2.4 : z > 9 ? 1.6 : 1 }); strokeLines(d.major, vb, f => f.k === 1, { c: colors.road1, w: z > 11 ? 3.6 : z > 9 ? 2.6 : 2 }); }
    if (LAYERS.trails && z >= 8.5) { const near = z >= 11.5; for (const d of sts) { strokeLines(d.trails, vb, f => f.k === 'o', { c: oc.ohv, w: z >= 12 ? 2.6 : 1.6, dash: near ? [3, 3] : null, halo: near }); strokeLines(d.trails, vb, f => f.k === 't', { c: oc.trail, w: z >= 12 ? 3 : 1.8, dash: near ? [6, 3] : null, halo: near }); } }
    if (LAYERS.water && MD) { // highlight rivers & lakes from the base map
      ctx.beginPath(); for (const f of MD.rivers) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r);
      ctx.strokeStyle = oc.water; ctx.lineWidth = Math.max(1.5, (z - 4) * .55); ctx.stroke();
      ctx.beginPath(); for (const f of MD.lakes) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true);
      ctx.strokeStyle = oc.water; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  // tiger roads replace the coarse Natural Earth roads once loaded
  function tigerReady(vb) { return S.z >= 8 && statesInView(vb).length > 0 && statesInView(vb).every(s => SEDATA[s.code]); }
  // ---------- traffic signals (OpenStreetMap, via Overture Maps) ----------
  function decSignals(a) {
    if (!a || !a.length) return null; const n = a.length / 2, X = new Float64Array(n), Y = new Float64Array(n), g = new Map(); let x = 0, y = 0;
    for (let i = 0; i < n; i++) { x += a[i * 2]; y += a[i * 2 + 1]; X[i] = mx(x / 1e5); Y[i] = my(y / 1e5); const k = Math.floor(X[i] * 4096) * 100000 + Math.floor(Y[i] * 4096); let l = g.get(k); if (!l) g.set(k, l = []); l.push(i); }
    return { X, Y, g };
  }
  function eachSignal(vb, fn) {
    for (const code in SEDATA) { const sg = SEDATA[code].sig; if (!sg) continue;
      for (let gx = Math.floor(vb[0] * 4096); gx <= Math.floor(vb[2] * 4096); gx++) for (let gy = Math.floor(vb[1] * 4096); gy <= Math.floor(vb[3] * 4096); gy++) {
        const l = sg.g.get(gx * 100000 + gy); if (l) for (const i of l) { const X = sg.X[i], Y = sg.Y[i]; if (X >= vb[0] && X <= vb[2] && Y >= vb[1] && Y <= vb[3]) fn(X, Y); }
      } }
  }
  function nearSignal(p, m) {
    const X = mx(p.lon), Y = my(p.lat), r = m / (40075016 * Math.cos(p.lat * D2R)); let hit = false;
    eachSignal([X - r, Y - r, X + r, Y + r], () => { hit = true; }); return hit;
  }
  function drawSignals(vb) {
    if (S.z < 14 || !LAYERS.roads) return;
    const big = S.z >= 16, w = big ? 9 : 7, h = big ? 21 : 16, r = big ? 2.6 : 2, n = []; let cnt = 0;
    eachSignal(vb, (X, Y) => { if (cnt++ < 600) n.push(toScreen(X, Y)); });
    for (const [x, y] of n) {
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 2.5) : ctx.rect(x - w / 2, y - h / 2, w, h);
      ctx.fillStyle = '#1c1c1c'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#fff'; ctx.stroke();
      [['#ff3b30', -1], ['#ffcc00', 0], ['#34c759', 1]].forEach(([c, k]) => { ctx.beginPath(); ctx.arc(x, y + k * (h / 3.3), r, 0, 7); ctx.fillStyle = c; ctx.fill(); });
    }
  }
  function drawPoints(vb) {
    if (!WATER) return; const z = S.z, oc = overlayColors(); const out = [];
    for (const p of WATER) {
      if (p.X < vb[0] || p.X > vb[2] || p.Y < vb[1] || p.Y > vb[3]) continue;
      const isWater = 'swf'.includes(p.t), isLake = 'lr'.includes(p.t);
      if (isWater && !(LAYERS.water && z >= 8)) continue;
      if (isLake && !((LAYERS.water && z >= 10.5) || z >= 13)) continue;
      if (!isWater && !isLake && z < 12.5) continue;
      const [x, y] = toScreen(p.X, p.Y);
      if (isWater) {
        ctx.beginPath(); ctx.arc(x, y, z >= 11 ? 6 : 4.5, 0, 7); ctx.fillStyle = oc.spring; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        if (p.t === 'f') { ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 3.5, 2, 7); }
      } else if (isLake) { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = oc.water; ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4.5, y + 3.5); ctx.lineTo(x - 4.5, y + 3.5); ctx.closePath(); ctx.fillStyle = p.t === 'm' ? colors.text : colors.state; ctx.fill(); }
      out.push([p, x, y, isWater]);
    }
    return out;
  }
  function drawDetailLabels(vb, pts) {
    const z = S.z, oc = overlayColors();
    if (pts) for (const [p, x, y, isWater] of pts) if (z >= (isWater ? 10.5 : 'lr'.includes(p.t) ? 12 : 13)) label(p.n, x, y + 12, { size: 11, color: isWater || 'lr'.includes(p.t) ? oc.water : colors.text, weight: isWater ? '600' : '' });
    if (z < 12) return;
    const sts = statesInView(vb).map(s => SEDATA[s.code]).filter(Boolean); let n = 0;
    const lab = (ix, col, filter) => eachVisible(ix, vb, f => { if (!f.n || n > 60 || (filter && !filter(f))) return; const r = f.r, m = Math.floor(r.length / 4) * 2; const [x, y] = toScreen(r[m], r[m + 1]); if (label(f.n, x, y, { size: 10.5, weight: '600', color: col })) n++; });
    for (const d of sts) { if (LAYERS.trails) lab(d.trails, oc.trail); if (LAYERS.forest) lab(d.fs, oc.fs); lab(d.major, colors.road1); }
    if (LAYERS.roads && z >= 14.5) for (const s of statesInView(vb)) { const c = LOCAL[s.code]; if (!c) continue; let m2 = 0; eachVisibleC(c, vb, f => { const nm = c.names[f]; if (!nm || m2 > 40) return; const a = c.off[f], b2 = c.off[f + 1], mid = a + Math.floor((b2 - a) / 4) * 2; const [x, y] = toScreen(c.xy[mid], c.xy[mid + 1]); if (label(nm, x, y, { size: 10, color: colors.text })) m2++; }); }
  }
  function hitPoint(x, y) {
    if (!WATER) return null; let best = null, bd = 16;
    const [x0, y0, x1, y1] = viewBox();
    for (const p of WATER) { if (p.X < x0 || p.X > x1 || p.Y < y0 || p.Y > y1) continue; const [sx, sy] = toScreen(p.X, p.Y); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  const PT_NAMES = { s: 'Spring', w: 'Well', f: 'Waterfall', l: 'Lake', r: 'Reservoir / pond', m: 'Summit', g: 'Gap / pass' };
  function showPoint(p) {
    const u = window.FG.units(); const water = 'swflr'.includes(p.t);
    openSheet(`<h3 style="margin:0 0 6px">${water ? '💧' : '⛰️'} ${esc(p.n)}</h3><div class="small muted">${PT_NAMES[p.t]} · USGS place name</div>
      <div class="mono" style="margin-top:6px">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div>
      ${pos ? `<p><b>${Geo.fmtDist(Geo.dist(pos, p), u)}</b> at ${Math.round(Geo.bearing(pos, p))}° ${Geo.cardinal(Geo.bearing(pos, p))}</p>` : ''}
      <p class="small" id="ptElev"></p>
      ${water ? `<div class="box warn small"><b class="lbl">Treat before drinking</b>Springs can still carry bacteria and parasites, and some may be dry or on private land. Filter and/or boil. <a href="#/a/water/purify">How to purify ›</a></div>` : ''}
      <div class="btnrow"><button class="btn pri" id="ptGo">Navigate here</button><button class="btn" id="ptSave">Save as waypoint</button></div>`);
    $('#ptGo').onclick = () => chooseNav({ lat: p.lat, lon: p.lon, name: p.n });
    $('#ptSave').onclick = () => { const w = store.get('waypoints', []); w.push({ id: Date.now(), name: p.n, icon: water ? '💧' : '🗻', lat: p.lat, lon: p.lon, t: Date.now() }); store.set('waypoints', w); toast('Saved'); closeSheet(); dirty = true; };
    elevationAt(p.lat, p.lon).then(e => { const el = $('#ptElev'); if (el && e != null) el.textContent = 'Elevation ≈ ' + fmtElev(e); });
  }
  function nearestWater() {
    const from = pos || { lat: S.lat, lon: S.lon }; const u = window.FG.units();
    if (!WATER) { toast('Loading water data…'); ensureDetail([0, 0, 1, 1]); return; }
    const list = WATER.filter(p => 'swflr'.includes(p.t)).map(p => [Geo.dist(from, p), p]).sort((a, b) => a[0] - b[0]).slice(0, 15);
    openSheet(`<h3 style="margin:0">💧 Nearest water sources</h3><p class="small muted">From ${pos ? 'your GPS position' : 'the map center'}. Springs and falls first matter most; ponds and reservoirs are often stagnant — always purify.</p>
      <div class="list">${list.map(([d, p], i) => `<a class="row" href="#" data-np="${i}"><span class="i">${'sf'.includes(p.t) ? '💧' : '🌊'}</span><span class="t"><b>${esc(p.n)}</b><small>${PT_NAMES[p.t]} · ${Geo.fmtDist(d, u)} · ${Math.round(Geo.bearing(from, p))}° ${Geo.cardinal(Geo.bearing(from, p))}</small></span><span class="chev">›</span></a>`).join('')}</div>`);
    document.querySelectorAll('[data-np]').forEach(a => a.onclick = e => { e.preventDefault(); const p = list[+a.dataset.np][1]; S.lat = p.lat; S.lon = p.lon; if (S.z < 13) S.z = 13; follow = false; const b = $('#mLoc'); if (b) b.classList.remove('on'); dirty = true; showPoint(p); });
  }


  // ---------- Places: hospitals, fire/EMS, police, ranger stations, campgrounds, trailheads (+ imported repeaters) ----------
  let PLACES = null;
  const PL_ICON = { h: ['H', '#e2574c'], f: ['F', '#ff8a3d'], p: ['P', '#4a7bd4'], r: ['R', '#3f9a4a'], v: ['i', '#2a9fb0'], c: ['⛺', '#7a8f3a'], t: ['T', '#a0703c'], x: ['📡', '#8e44ff'], b: ['🛂', '#c2185b'] };
  const PL_NAME = { h: 'Hospital', f: 'Fire / EMS station', p: 'Police / sheriff', r: 'Ranger station / park office', v: 'Visitor center', c: 'Campground / recreation area', t: 'Trailhead', x: 'Radio repeater', b: 'Border crossing to Canada' };
  function ensurePlaces() {
    if (PLACES || loadingSet.has('places')) return;
    loadingSet.add('places');
    loadJSON('data/places.json').then(d => {
      PLACES = d.pts.map(([t, n, x, y, a]) => ({ t, n, a, lat: y / d.scale, lon: x / d.scale, X: mx(x / d.scale), Y: my(y / d.scale) }));
      addRepeaterPlaces(); dirty = true;
      loadJSON('data/border.json').then(b => { // US–Canada ports of entry, listed first so they're never hidden by decluttering
        PLACES = b.ports.map(o => ({ t: 'b', n: o.n, a: '→ ' + o.ca, ca: o.ca, road: o.road, major: o.m, st: o.s, lat: o.lat, lon: o.lon, X: mx(o.lon), Y: my(o.lat) })).concat(PLACES); dirty = true;
      }).catch(() => { });
    }).catch(() => loadingSet.delete('places'));
  }
  function addRepeaterPlaces() {
    if (!PLACES) return; PLACES = PLACES.filter(p => p.t !== 'x');
    for (const r of store.get('repeaters', [])) if (r.lat != null) PLACES.push({ t: 'x', n: r.f + ' ' + (r.o || '') + (r.t ? ' PL ' + r.t : ''), a: [r.c, r.l].filter(Boolean).join(' · '), lat: r.lat, lon: r.lon, X: mx(r.lon), Y: my(r.lat) });
  }
  function drawPlaces(vb) {
    if (!LAYERS.places) return []; ensurePlaces(); if (!PLACES) return [];
    if (PLACES._rv !== window.FG.repeatersVer) { PLACES._rv = window.FG.repeatersVer; addRepeaterPlaces(); PLACES._rv = window.FG.repeatersVer; }
    const z = S.z, out = [], cell = z < 8 ? 36 : z < 11 ? 24 : 0, used = new Set(); // declutter when zoomed out
    for (const p of PLACES) {
      if (p.X < vb[0] || p.X > vb[2] || p.Y < vb[1] || p.Y > vb[3]) continue;
      if (z < 9 && p.t !== 'h' && p.t !== 'b') continue; if (z < 10.5 && 'ctvx'.includes(p.t)) continue;
      const [x, y] = toScreen(p.X, p.Y), [ch, col] = PL_ICON[p.t], r = p.t === 'h' || p.t === 'b' ? 9 : 7.5;
      if (cell) { const key = Math.floor(x / cell) + ',' + Math.floor(y / cell); if (used.has(key)) continue; used.add(key); }
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - r, y - r, r * 2, r * 2, 3) : ctx.rect(x - r, y - r, r * 2, r * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + (r * 1.3) + 'px ' + colors.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, x, y + 0.5); ctx.textAlign = 'left';
      out.push([p, x, y]);
    }
    placesDrawn = out; return out;
  }
  function drawPlaceLabels(list) { if (S.z < 12) return; for (const [p, x, y] of list) label(p.n, x, y + 15, { size: 10.5, color: PL_ICON[p.t][1], weight: '600' }); }
  let placesDrawn = [];
  function hitPlace(x, y) {
    if (!LAYERS.places || !PLACES) return null; let best = null, bd = 16;
    for (const [p] of placesDrawn) { const [sx, sy] = toScreen(p.X, p.Y); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function showPlace(p) {
    const u = window.FG.units();
    openSheet(`<h3 style="margin:0 0 4px">${esc(p.n)}</h3><div class="small muted">${PL_NAME[p.t]}${p.a ? ' · ' + esc(p.a) : ''}</div>
      ${pos ? `<p><b>${Geo.fmtDist(Geo.dist(pos, p), u)}</b> at ${Math.round(Geo.bearing(pos, p))}° ${Geo.cardinal(Geo.bearing(pos, p))}</p>` : ''}
      ${p.t === 'b' ? `<p class="small">${p.major ? '🕐 Major crossing, normally open 24 hours. ' : '🕐 Smaller crossing: may close at night or on holidays. '}Check hours and wait times at cbp.gov (U.S.) and cbsa-asfc.gc.ca (Canada) before you go.</p><p class="small muted">Location from U.S. road data where the road meets the border (within a few hundred yards). <a href="#/a/navigation/canada">Crossing into Canada: documents, firearms, pets ›</a></p>` : ''}
      ${p.t === 'h' ? '<div class="box warn small">Call 911 first if you can — an ambulance can start treatment on the way. Not every hospital has a full emergency department; this list comes from USGS public data.</div>' : ''}
      <div class="btnrow"><button class="btn pri" id="plGo">Navigate here</button><button class="btn" id="plSave">Save as waypoint</button></div>`);
    $('#plGo').onclick = () => chooseNav({ lat: p.lat, lon: p.lon, name: p.n });
    $('#plSave').onclick = () => { const w = store.get('waypoints', []); w.push({ id: Date.now(), name: p.n, icon: p.t === 'h' ? '🏥' : '📍', lat: p.lat, lon: p.lon, t: Date.now() }); store.set('waypoints', w); toast('Saved'); closeSheet(); dirty = true; };
  }
  function nearestPlaces() {
    ensurePlaces(); if (!PLACES) { toast('Loading places…'); setTimeout(nearestPlaces, 800); return; }
    const from = pos || { lat: S.lat, lon: S.lon }, u = window.FG.units();
    const groups = ['h', 'f', 'p', 'r', 'c', 't', 'x'].map(t => [t, PLACES.filter(p => p.t === t).map(p => [Geo.dist(from, p), p]).sort((a, b) => a[0] - b[0]).slice(0, t === 'h' ? 5 : 3)]).filter(([, l]) => l.length);
    const flat = [];
    openSheet(`<h3 style="margin:0">🏥 Nearest help & places</h3><p class="small muted">From ${pos ? 'your GPS position' : 'the map center'}.</p>
      ${groups.map(([t, l]) => `<h3>${t === 'b' ? 'Border crossings to Canada' : PL_NAME[t] + 's'}</h3><div class="list">${l.map(([d, p]) => { flat.push(p); return `<a class="row" href="#" data-pl="${flat.length - 1}"><span class="i" style="color:${PL_ICON[t][1]}">■</span><span class="t"><b>${esc(p.n)}</b><small>${Geo.fmtDist(d, u)} · ${Math.round(Geo.bearing(from, p))}° ${Geo.cardinal(Geo.bearing(from, p))}${p.a ? ' · ' + esc(p.a) : ''}</small></span><span class="chev">›</span></a>`; }).join('')}</div>`).join('')}`);
    document.querySelectorAll('[data-pl]').forEach(a => a.onclick = e => { e.preventDefault(); const p = flat[+a.dataset.pl]; S.lat = p.lat; S.lon = p.lon; if (S.z < 13) S.z = 13; follow = false; const b = $('#mLoc'); if (b) b.classList.remove('on'); dirty = true; showPlace(p); });
  }

  // ---------- elevation profile for a route (from terrain tiles) ----------
  async function routeProfile(r) {
    const n = r.X.length, total = r.cum[n - 1]; const N = Math.min(120, Math.max(20, Math.round(total / 150)));
    const samples = []; let j = 0;
    for (let k = 0; k <= N; k++) { const d = total * k / N; while (j < n - 2 && r.cum[j + 1] < d) j++; samples.push([d, r.coords[j * 2], r.coords[j * 2 + 1]]); }
    const el = await Promise.all(samples.map(([, la, lo]) => elevationAt(la, lo)));
    if (el.filter(v => v != null).length < samples.length * 0.8) return null;
    let up = 0, down = 0, prev = null; const pts = [];
    samples.forEach(([d], i) => { const e = el[i]; if (e == null) return; if (prev != null) { const dd = e - prev; if (dd > 0) up += dd; else down -= dd; } prev = e; pts.push([d, e]); });
    return { pts, up, down, min: Math.min(...pts.map(p => p[1])), max: Math.max(...pts.map(p => p[1])) };
  }
  function profileSVG(pr, total) {
    const lo = pr.min, hi = Math.max(pr.max, lo + 10), X = d => d / total * 320, Y = e => 95 - (e - lo) / (hi - lo) * 80;
    const path = pr.pts.map(([d, e], i) => (i ? 'L' : 'M') + X(d).toFixed(1) + ',' + Y(e).toFixed(1)).join('');
    return `<svg viewBox="0 0 320 110" style="width:100%;height:auto;margin-top:4px"><path d="${path}L320,100L0,100Z" fill="var(--info-bg)"/><path d="${path}" fill="none" stroke="var(--info-line)" stroke-width="2"/>
      <text x="2" y="10" font-size="9" fill="currentColor">${fmtElev(hi)}</text><text x="2" y="108" font-size="9" fill="currentColor">${fmtElev(lo)}</text></svg>`;
  }

  // ---------- contours from terrain tiles (computed on the device) ----------
  const terr = new Map(), contourCache = new Map();
  function fmtElev(m) { return window.FG.units() === 'met' ? Math.round(m) + ' m' : Math.round(m * 3.28084).toLocaleString() + ' ft'; }
  function terrTile(z, x, y, cb) {
    const key = z + '/' + x + '/' + y; let t = terr.get(key);
    if (t) { if (t.elev) return t.elev; if (cb && t.cbs) t.cbs.push(cb); return null; }
    t = { cbs: cb ? [cb] : [] }; terr.set(key, t);
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
        const px = g.getImageData(0, 0, 256, 256).data; const e = new Float32Array(65536);
        for (let i = 0; i < 65536; i++) e[i] = px[i * 4] * 256 + px[i * 4 + 1] + px[i * 4 + 2] / 256 - 32768;
        t.elev = e; t.cbs.forEach(f => f(e)); t.cbs = null; dirty = true;
      } catch (err) { t.failed = true; }
      if (terr.size > 300) { const k = terr.keys().next().value; if (k !== key) terr.delete(k); }
    };
    img.onerror = () => { t.failed = true; setTimeout(() => terr.delete(key), 30000); };
    img.src = TERRAIN_URL.replace('{z}', z).replace('{x}', x).replace('{y}', y);
    return null;
  }
  function elevationAt(lat, lon) {
    return new Promise(res => {
      const z = 12, n = 4096, fx = mx(lon) * n, fy = my(lat) * n, x = Math.floor(fx), y = Math.floor(fy);
      const pick = e => res(e[Math.min(255, Math.floor((fy - y) * 256)) * 256 + Math.min(255, Math.floor((fx - x) * 256))]);
      const e = terrTile(z, x, y, pick); if (e) pick(e);
      setTimeout(() => res(null), 8000);
    });
  }
  // marching squares on a 256×256 elevation grid → segments in world coords
  function buildContours(z, tx, ty, e, stepM) {
    const n = Math.pow(2, z), segs = [], idx = []; const W0 = tx / n, H0 = ty / n, px = 1 / (256 * n);
    const P = (i, j) => [W0 + (i + .5) * px, H0 + (j + .5) * px];
    for (let j = 0; j < 255; j++) for (let i = 0; i < 255; i++) {
      const a = e[j * 256 + i], b = e[j * 256 + i + 1], c = e[(j + 1) * 256 + i + 1], d = e[(j + 1) * 256 + i];
      const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
      for (let L = Math.ceil(lo / stepM) * stepM; L < hi; L += stepM) {
        const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0); if (k === 0 || k === 15) continue;
        const tp = () => { const t = (L - a) / (b - a); const p = P(i + t, j); return p; }, rt = () => { const t = (L - b) / (c - b); return P(i + 1, j + t); };
        const bt = () => { const t = (L - d) / (c - d); return P(i + t, j + 1); }, lf = () => { const t = (L - a) / (d - a); return P(i, j + t); };
        let pr;
        switch (k) { case 1: case 14: pr = [lf(), bt()]; break; case 2: case 13: pr = [bt(), rt()]; break; case 3: case 12: pr = [lf(), rt()]; break; case 4: case 11: pr = [tp(), rt()]; break;
          case 6: case 9: pr = [tp(), bt()]; break; case 7: case 8: pr = [lf(), tp()]; break; case 5: pr = [lf(), tp(), bt(), rt()]; break; case 10: pr = [lf(), bt(), tp(), rt()]; break; }
        const out = Math.round(L / stepM) % 5 === 0 ? idx : segs;
        for (let q = 0; q < pr.length; q += 2) out.push(pr[q][0], pr[q][1], pr[q + 1][0], pr[q + 1][1], L);
      }
    }
    return { segs: new Float32Array(segs), idx: new Float32Array(idx) };
  }
  function contourStep() { const met = window.FG.units() === 'met'; const z = S.z; return met ? (z >= 14 ? 10 : z >= 12.5 ? 20 : 50) : (z >= 14 ? 40 / 3.28084 : z >= 12.5 ? 100 / 3.28084 : 200 / 3.28084); }
  function drawContours(vb, oc) {
    const z = Math.min(12, Math.max(10, Math.floor(S.z))), n = Math.pow(2, z), step = contourStep();
    const strokeSet = (arr, col, w) => {
      if (!arr.length) return; ctx.beginPath();
      for (let i = 0; i < arr.length; i += 5) { const [x1, y1] = toScreen(arr[i], arr[i + 1]); const [x2, y2] = toScreen(arr[i + 2], arr[i + 3]); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    };
    let missing = 0, labels = [];
    for (let tx = Math.floor(vb[0] * n); tx <= Math.floor(vb[2] * n); tx++) for (let ty = Math.floor(vb[1] * n); ty <= Math.floor(vb[3] * n); ty++) {
      const key = z + '/' + tx + '/' + ty + '/' + step.toFixed(2); let c = contourCache.get(key);
      if (!c) { const e = terrTile(z, tx, ty); if (!e) { missing++; continue; } c = buildContours(z, tx, ty, e, step); contourCache.set(key, c); if (contourCache.size > 120) contourCache.delete(contourCache.keys().next().value); }
      strokeSet(c.segs, oc.contour, 1); strokeSet(c.idx, oc.contourIdx, 1.6);
      for (let i = 0, k = 0; i < c.idx.length && k < 3; i += 5 * 97, k++) labels.push([c.idx[i], c.idx[i + 1], c.idx[i + 4]]);
    }
    contourLabels = labels; contourMissing = missing;
  }
  let contourLabels = [], contourMissing = 0;
  function drawContourLabels() {
    if (!LAYERS.contours || S.z < 11.5) return; const oc = overlayColors(); const met = window.FG.units() === 'met';
    for (const [X, Y, L] of contourLabels) { const [x, y] = toScreen(X, Y); label(met ? Math.round(L) + '' : Math.round(L * 3.28084 / 10) * 10 + '', x, y, { size: 10, color: oc.contourIdx }); }
  }

  // ---------- filter chips ----------
  const CHIPS = [['places', '🏥', 'Places'], ['roads', '🛣️', 'Roads'], ['water', '💧', 'Water'], ['trails', '🥾', 'Trails'], ['forest', '🌲', 'Forest rds'], ['contours', '⛰️', 'Contours']];
  function chipsHTML() { return `<div class="mchips" id="mChips">${CHIPS.map(([k, i, l]) => `<button class="chip ${LAYERS[k] ? 'on' : ''}" data-ly="${k}">${i} ${l}</button>`).join('')}<button class="chip ${LAYERS.water ? '' : 'hidden'}" id="mNearW">🔎 Nearest water</button><button class="chip ${LAYERS.places ? '' : 'hidden'}" id="mNearP">🔎 Nearest help</button></div>`; }
  function bindChips() {
    document.querySelectorAll('[data-ly]').forEach(b => b.onclick = () => {
      const k = b.dataset.ly; LAYERS[k] = !LAYERS[k]; store.set('maplayers', LAYERS); b.classList.toggle('on', LAYERS[k]); dirty = true;
      const nw = $('#mNearW'); if (nw) nw.classList.toggle('hidden', !LAYERS.water);
      const np = $('#mNearP'); if (np) np.classList.toggle('hidden', !LAYERS.places);
      if (!LAYERS[k]) return;
      const z = S.z, hints = {
        water: z < 8 ? 'Zoom in to see springs and waterfalls (blue dots)' : 'Blue dots = springs & falls. Tap one for distance and directions.',
        trails: z < 8.5 ? 'Zoom in to see hiking trails (pink dashes)' : 'Pink dashes = hiking trails, orange = OHV/motorized trails',
        forest: z < 8.5 ? 'Zoom in to see forest service & 4WD roads' : 'Orange dashes = forest service roads, tan = 4WD/unpaved tracks',
        contours: navigator.onLine ? (z < 11.5 ? 'Zoom in to see contour lines' : 'Contour lines are drawn from terrain data. Save terrain for offline in Layers ›') : 'Contours need saved terrain data for this area — download it in Layers while online',
        places: 'H = hospital, F = fire/EMS, P = police, R = ranger station, 🛂 = border crossing to Canada; campgrounds & trailheads when zoomed in. Tap “Nearest help”.',
        roads: 'Highways & secondary roads are built in. For every local road, download your state in Layers ›'
      };
      toast(hints[k]);
    });
    $('#mNearW').onclick = nearestWater; $('#mNearP').onclick = nearestPlaces;
  }


  // =====================================================================
  // Navigation: straight line, drive (roads only) or walk (roads + trails), computed offline in a worker.
  // =====================================================================
  let navRoute = store.get('navroute', null); // {mode, coords:[lat,lon,...], kinds, total, time, steps, X, Y, cum}
  let routeWorker = null, routeReq = 0, offRouteCount = 0, lastReroute = 0, routing = false;
  const MODE_INFO = { line: ['📏', 'Straight line'], car: ['🚗', 'Drive'], foot: ['🥾', 'Walk / hike'] };
  // ---------- turn-by-turn ----------
  let tbt = store.get('tbt', false), voiceOn = store.get('tbtVoice', true), said = {}, tbtWake = null, lastSpeak = 0;
  const lowerFirst = t => t.charAt(0).toLowerCase() + t.slice(1);
  function spoken(t) { // read road names the way people say them
    return t.replace(/\bI-(\d+)((?:[,/]\d+)*)/g, (m, a, b) => 'Interstate ' + a + (b ? ' and ' + b.slice(1).split(/[,/]/).join(' and ') : ''))
      .replace(/\bUS-(?:Bus,|Byp,|Alt,)?(\d+)(?:[,/][\w]+)*/g, 'U.S. $1').replace(/\bSR-(\d+)(?:[,/][\w]+)*/g, 'State Route $1')
      .replace(/\bSt\b/g, 'Street').replace(/\bRd\b/g, 'Road').replace(/\bAve\b/g, 'Avenue').replace(/\bDr\b/g, 'Drive').replace(/\bBlvd\b/g, 'Boulevard')
      .replace(/\bHwy\b/g, 'Highway').replace(/\bLn\b/g, 'Lane').replace(/\bPkwy\b/g, 'Parkway').replace(/\bCt\b/g, 'Court').replace(/\bCir\b/g, 'Circle').replace(/\bTrl\b/g, 'Trail').replace(/\bPl\b/g, 'Place');
  }
  // ---------- voice: the phone's own voice when it works, otherwise a voice built into the app (works with no signal) ----------
  let ttsW = null, ttsReq = 0, ttsAudio = null, phoneVoiceOK = null; const ttsCbs = new Map();
  const voiceEngine = () => store.get('voiceEngine', 'auto'); // 'auto' | 'phone' | 'builtin'
  function ttsWorker() {
    if (!ttsW) { ttsW = new Worker('js/tts-worker.js'); ttsW.onmessage = e => { const cb = ttsCbs.get(e.data.id); ttsCbs.delete(e.data.id); if (cb) cb(e.data); }; ttsW.onerror = () => { ttsW = null; }; }
    return ttsW;
  }
  function audioEl() { if (!ttsAudio) { ttsAudio = new Audio(); ttsAudio.setAttribute('playsinline', ''); ttsAudio.preload = 'auto'; } return ttsAudio; }
  function silentWav() { const b = new ArrayBuffer(44 + 800), v = new DataView(b), w = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0))); w(0, 'RIFF'); v.setUint32(4, 36 + 800, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, 800, true); return URL.createObjectURL(new Blob([b], { type: 'audio/wav' })); }
  // iPhone only lets a page play sound after a tap: call this from a tap so later prompts can play by themselves
  function unlockAudio() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { } // play even with the ring/silent switch on silent
    try { const a = audioEl(); a.src = silentWav(); const pr = a.play(); if (pr) pr.catch(() => { }); } catch (e) { }
    try { ttsWorker().postMessage({ id: -1, text: 'ok' }); } catch (e) { } // warm up the built-in voice
    try { speechSynthesis.getVoices(); } catch (e) { }
  }
  function speakBuiltin(text) {
    let w; try { w = ttsWorker(); } catch (e) { return; }
    const id = ++ttsReq;
    ttsCbs.set(id, d => {
      if (d.error || !d.wav || id !== ttsReq) return; // a newer prompt replaced this one
      const a = audioEl(); if (a._url) URL.revokeObjectURL(a._url);
      a._url = URL.createObjectURL(new Blob([d.wav], { type: 'audio/wav' })); a.src = a._url; const pr = a.play(); if (pr) pr.catch(() => { });
    });
    w.postMessage({ id, text });
  }
  function phoneVoice() {
    let vs = []; try { vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang)); } catch (e) { }
    const local = vs.filter(v => v.localService !== false), pick = n => local.find(v => v.name.indexOf(n) >= 0); // on-device voices only
    return pick('Samantha') || pick('Alex') || pick('Ava') || local.find(v => v.default) || local[0] || null;
  }
  function stopSpeech() { try { speechSynthesis.cancel(); } catch (e) { } try { if (ttsAudio) ttsAudio.pause(); } catch (e) { } ttsReq++; }
  function speak(t, force) {
    if (!voiceOn && !force) return;
    const text = spoken(t), eng = voiceEngine(); lastSpeak = Date.now();
    const canPhone = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
    // auto: with no signal the phone's voice can stay silent, so use the built-in one; also switch if the phone's voice fails
    if (!canPhone || eng === 'builtin' || (eng === 'auto' && (phoneVoiceOK === false || navigator.onLine === false))) { stopSpeech(); return speakBuiltin(text); }
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; const v = phoneVoice(); if (v) u.voice = v; u.rate = 1;
      let started = false, fell = false; const fall = () => { if (started || fell || eng !== 'auto') return; fell = true; phoneVoiceOK = false; speakBuiltin(text); };
      u.onstart = () => { started = true; phoneVoiceOK = true; };
      u.onerror = ev => { if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) return; fall(); };
      stopSpeech(); speechSynthesis.speak(u);
      if (eng === 'auto') setTimeout(() => { let busy = false; try { busy = speechSynthesis.speaking; } catch (e) { } if (!started && !busy) fall(); }, 1600);
    } catch (e) { speakBuiltin(text); }
  }
  function sayDist(m) { // natural spoken distance
    if (window.FG.units() === 'met') return m < 950 ? (Math.round(m / 50) * 50 || 50) + ' meters' : (Math.round(m / 100) / 10) + ' kilometers';
    const mi = m / 1609.34; if (mi < 0.15) return (Math.max(1, Math.round(m * 3.28084 / 100)) * 100) + ' feet';
    if (mi < 0.35) return 'a quarter mile'; if (mi < 0.65) return 'half a mile'; if (mi < 0.85) return 'three quarters of a mile';
    if (mi < 1.25) return '1 mile'; return (Math.round(mi * 2) / 2) + ' miles';
  }
  function showDist(m) { if (window.FG.units() === 'met') return m < 950 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1) + ' km'; const ft = m * 3.28084; return ft < 1000 ? Math.round(ft / 10) * 10 + ' ft' : (m / 1609.34).toFixed(m < 16093 ? 1 : 0) + ' mi'; }
  function arrowSVG(m) {
    if (!m) return '';
    if (m.type === 'finish' || m.type === 'arrive') return '<div class="tbt-flag">🏁</div>';
    let a = m.type === 'start' || m.type === 'straight' ? 0 : m.type === 'merge' || m.type === 'ramp' ? (m.angle < 0 ? -40 : 40) : Math.max(-150, Math.min(150, m.angle));
    if (m.type === 'uturn') { const L = m.angle < 0; return `<svg viewBox="0 0 64 64" class="tbt-arrow"><path d="M${L ? 42 : 22} 60 V28 a10 10 0 0 0 ${L ? -20 : 20} 0 V40" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M${L ? 12 : 32} 38 l10 14 l10 -14z" fill="currentColor"/></svg>`; }
    const r = a * Math.PI / 180, ex = 32 + 20 * Math.sin(r), ey = 30 - 20 * Math.cos(r), hx = Math.sin(r), hy = -Math.cos(r);
    const tip = [ex + hx * 12, ey + hy * 12], l = [ex - hy * 9, ey + hx * 9], rr = [ex + hy * 9, ey - hx * 9];
    return `<svg viewBox="0 0 64 64" class="tbt-arrow"><path d="M32 60 V30 L${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M${tip.map(v => v.toFixed(1)).join(' ')} L${l.map(v => v.toFixed(1)).join(' ')} L${rr.map(v => v.toFixed(1)).join(' ')}z" fill="currentColor"/></svg>`;
  }
  function startTbt() {
    if (!navRoute) return; tbt = true; store.set('tbt', true); said = {};
    follow = true; store.set('mapfollow', true); const b = $('#mLoc'); if (b) b.classList.add('on');
    setRotMode(store.get('navNorthUp', false) ? 'north' : 'heading'); // map turns with the road, like a car GPS
    if (pos) { S.lat = pos.lat; S.lon = pos.lon; } S.z = 16;
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => tbtWake = w).catch(() => { });
    unlockAudio();
    const p = routeProgress(), m0 = navRoute.man && navRoute.man[0];
    speak((m0 ? m0.text + '. ' : '') + (p && p.man && p.man !== m0 ? 'Then in ' + sayDist(p.manDist) + ', ' + lowerFirst(p.man.text) : ''), false);
    closeSheet(); dirty = true; updateHud();
  }
  function stopTbt() { if (tbt && rotMode === 'heading') setRotMode('north'); tbt = false; store.set('tbt', false); if (tbtWake) { tbtWake.release().catch(() => { }); tbtWake = null; } const el = $('#mTbt'); if (el) el.hidden = true; document.body.classList.remove('tbt-on'); }
  function updateTbt(p) {
    const el = $('#mTbt'); if (!el) return;
    if (!tbt || !navRoute || !p) { el.hidden = true; document.body.classList.remove('tbt-on'); return; }
    el.hidden = false; document.body.classList.add('tbt-on');
    const m = p.man, d = Math.max(0, p.manDist), v = pos && pos.spd > 1 ? pos.spd : 13, off = p.off > offLimit() || routing;
    // spoken prompts: far, closer, and at the turn
    if (m && !off) {
      const k = m.at + ':' + m.type, far = Math.max(700, v * 45), mid = Math.max(160, v * 12), now = Math.max(35, v * 4);
      const then = p.manNext && p.manNext.d - m.d < 200 && p.manNext.type !== 'finish' ? ', then ' + lowerFirst(sayMan(p.manNext)) : '';
      const fin = m.type === 'finish', finTxt = /^Your destination|, straight/.test(m.text) ? m.text : 'You have arrived at your destination';
      if (d <= now && !said[k + 'n']) { said[k + 'n'] = said[k + 'm'] = said[k + 'f'] = 1; if (fin) said.arrived = 1; speak(fin ? (finTxt.startsWith('Your') ? 'You have arrived. ' + finTxt : finTxt) : sayMan(m) + then); }
      else if (d <= mid && d > now && !said[k + 'm']) { said[k + 'm'] = said[k + 'f'] = 1; speak('In ' + sayDist(d) + ', ' + (fin ? (finTxt.startsWith('Your') ? lowerFirst(finTxt) : 'your destination is ahead') : lowerFirst(sayMan(m))) + then); }
      else if (d <= far && d > mid * 1.5 && !said[k + 'f'] && m.type !== 'straight' && m.type !== 'finish') { said[k + 'f'] = 1; speak('In ' + sayDist(d) + ', ' + lowerFirst(sayMan(m))); }
    }
    const u = window.FG.units(), eta = new Date(Date.now() + p.eta * 1000);
    el.innerHTML = off ? `<div class="tbt-main tbt-off"><div class="tbt-icon">⚠️</div><div><div class="tbt-dist">${routing && p.off <= offLimit() ? 'Rerouting' : 'Off route'}</div><div class="tbt-text">${routing ? 'Finding a new route from here…' : 'Rerouting… keep driving safely'}</div></div></div>`
      : `<div class="tbt-main"><div class="tbt-icon">${arrowSVG(m)}</div><div class="tbt-body"><div class="tbt-dist">${m && m.type !== 'finish' ? showDist(d) : showDist(p.left)}</div><div class="tbt-text">${m && m.light ? '<span class="tbt-light" title="At the traffic light">🚦</span> ' : ''}${esc(m ? m.text : 'Continue')}</div></div></div>
        ${p.manNext && m && m.type !== 'finish' ? `<div class="tbt-next">Then ${arrowSVG(p.manNext).replace('tbt-arrow', 'tbt-arrow sm')} ${esc(p.manNext.text)}</div>` : ''}`;
    el.innerHTML += `<div class="tbt-bar"><span><b>${eta.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</b> arrival · ${Geo.fmtDist(p.left, u)} · ${fmtTime(p.eta)}</span><span><button class="btn" id="tbtVoice" aria-label="Voice on or off">${voiceOn ? '🔊' : '🔇'}</button><button class="btn" id="tbtRoute" aria-label="Change route">🔀</button><button class="btn" id="tbtList">☰</button><button class="btn red" id="tbtEnd">✕ End</button></span></div>`;
    $('#tbtVoice').onclick = () => { voiceOn = !voiceOn; store.set('tbtVoice', voiceOn); unlockAudio(); if (!voiceOn) stopSpeech(); else speak('Voice guidance on', true); updateHud(); };
    $('#tbtList').onclick = () => showRouteSummary(false);
    $('#tbtRoute').onclick = showRouteOptions;
    $('#tbtEnd').onclick = () => endNav();
    if (pos && follow) { S.z = v > 24 ? 14.6 : v > 13 ? 15.4 : 16.3; }
  }
  function prepRoute(r) {
    if (!r) return null;
    const n = r.coords.length / 2; r.X = new Float64Array(n); r.Y = new Float64Array(n); r.cum = new Float64Array(n);
    for (let i = 0; i < n; i++) { r.X[i] = mx(r.coords[i * 2 + 1]); r.Y[i] = my(r.coords[i * 2]); if (i) r.cum[i] = r.cum[i - 1] + Geo.dist({ lat: r.coords[i * 2 - 2], lon: r.coords[i * 2 - 1] }, { lat: r.coords[i * 2], lon: r.coords[i * 2 + 1] }); }
    r.man = buildManeuvers(r); markLights(r);
    return r;
  }
  // ---------- turn-by-turn maneuvers from the route geometry ----------
  const isHwy = n => /^(I-|US-|SR-|Ramp)/.test(n || '');
  function ptAt(r, d) { // point on the route at distance d along it
    const c = r.cum, n = c.length; d = Math.max(0, Math.min(c[n - 1], d));
    let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
    const f = c[hi] > c[lo] ? (d - c[lo]) / (c[hi] - c[lo]) : 0;
    return { lat: r.coords[lo * 2] + (r.coords[hi * 2] - r.coords[lo * 2]) * f, lon: r.coords[lo * 2 + 1] + (r.coords[hi * 2 + 1] - r.coords[lo * 2 + 1]) * f };
  }
  // "At the traffic light, turn left onto …" when the turn is at a signal
  const sayMan = m => m.light && /^(turn|slight|sharp|uturn|straight)$/.test(m.type) ? 'At the traffic light, ' + lowerFirst(m.text) : m.text;
  function markLights(r) {
    if (!r || !r.man || r.mode !== 'car') return;
    for (const m of r.man) if (!m.light && m.type !== 'start' && m.type !== 'finish') { const p = { lat: r.coords[m.at * 2], lon: r.coords[m.at * 2 + 1] }; if (nearSignal(p, 35)) m.light = true; }
  }
  function buildManeuvers(r) {
    const st = r.steps || [], out = [], road = n => !n || /^Unnamed/.test(n) ? '' : n.replace(/^(I|US|SR)-([\w]+(?:,[\w]+)+)$/, (m, a, b) => a + '-' + b.split(',').join('/')).replace(/^US-(Bus|Byp|Alt)\/(\d+)/, 'US-$2 $1');
    for (let i = 0; i < st.length; i++) {
      const s = st[i], d0 = r.cum[s.at], nm = road(s.name), next = st[i + 1];
      if (i === 0) { out.push({ at: s.at, d: d0, type: 'start', angle: 0, name: nm, text: s.kind === 'off' ? 'Drive to the road' : nm ? 'Head out on ' + nm : 'Start driving' }); continue; }
      const b1 = Geo.bearing(ptAt(r, d0 - 30), ptAt(r, d0)), b2 = Geo.bearing(ptAt(r, d0), ptAt(r, d0 + 30));
      const a = ((b2 - b1 + 540) % 360) - 180, side = a < 0 ? 'left' : 'right', abs = Math.abs(a), prev = st[i - 1].name;
      let type, text;
      if (s.kind === 'off' && i === st.length - 1 && r.mode === 'car' && s.dist < 400) { // short hop from the road to the address: say which side it's on
        const n = r.cum.length, dest = { lat: r.coords[n * 2 - 2], lon: r.coords[n * 2 - 1] }, rel = ((Geo.bearing(ptAt(r, d0), dest) - b1 + 540) % 360) - 180;
        out.push({ at: s.at, d: d0, type: 'finish', angle: 0, name: '', text: Math.abs(rel) < 25 || Math.abs(rel) > 155 ? 'Arrive at your destination, straight ahead' : 'Your destination is on the ' + (rel < 0 ? 'left' : 'right') });
        return out;
      }
      if (s.kind === 'off') { type = 'arrive'; text = 'Leave the road and continue to the destination'; }
      else if (s.name === 'Ramp') { const to = next && road(next.name); type = abs < 20 ? 'ramp' : 'ramp'; text = (/^I-|^US-/.test(prev) ? 'Take the exit' : 'Take the ramp') + (abs >= 8 ? ' on the ' + side : '') + (to ? ' toward ' + to : ''); }
      else if (prev === 'Ramp' && isHwy(nm)) { type = 'merge'; text = 'Merge onto ' + nm; }
      else if (abs < 25) { type = 'straight'; text = nm ? 'Continue onto ' + nm : 'Continue straight'; }
      else if (abs < 60) { type = 'slight'; text = 'Bear ' + side + (nm ? ' onto ' + nm : ''); }
      else if (abs < 135) { type = 'turn'; text = 'Turn ' + side + (nm ? ' onto ' + nm : ''); }
      else if (abs < 165) { type = 'sharp'; text = 'Make a sharp ' + side + (nm ? ' onto ' + nm : ''); }
      else { type = 'uturn'; text = 'Make a U-turn' + (nm ? ' onto ' + nm : ''); }
      out.push({ at: s.at, d: d0, type, angle: type === 'straight' ? 0 : a, name: nm, text });
    }
    const n = r.cum.length; out.push({ at: n - 1, d: r.cum[n - 1], type: 'finish', angle: 0, name: '', text: 'Arrive at your destination' });
    return out;
  }
  navRoute = prepRoute(navRoute);
  function fmtTime(s) { s = Math.round(s / 60); return s < 60 ? s + ' min' : Math.floor(s / 60) + ' h ' + (s % 60) + ' min'; }
  function statesFor(a, b) {
    if (!SEIDX) return [];
    const pad = 0.15, w = [Math.min(a.lon, b.lon) - pad, Math.min(a.lat, b.lat) - pad, Math.max(a.lon, b.lon) + pad, Math.max(a.lat, b.lat) + pad];
    return SEIDX.states.filter(s => !(s.bbox[2] < w[0] || s.bbox[0] > w[2] || s.bbox[3] < w[1] || s.bbox[1] > w[3])).map(s => s.code);
  }
  let routePref = store.get('routePref', 'fast'); // 'fast' = highways allowed, 'back' = back roads
  function computeRoute(mode, from, dest, opt = {}) {
    if (!routeWorker) routeWorker = new Worker('js/router.js');
    const id = ++routeReq;
    return new Promise((res, rej) => {
      const states = statesFor(from, dest);
      if (!states.length) return rej(new Error('Routing works inside the ' + SEIDX.states.length + ' states covered by the map'));
      routeWorker.onmessage = e => { if (e.data.id !== id) return; e.data.ok ? res(e.data) : rej(new Error(e.data.error)); };
      routeWorker.onerror = e => rej(new Error('Route engine failed to start' + (e.message ? ': ' + e.message : '')));
      const hdg = mode === 'car' && from.spd > 3 && from.hdg != null && !isNaN(from.hdg) ? from.hdg : null; // moving: prefer carrying straight on over a U-turn
      routeWorker.postMessage({ id, mode, from: { lat: from.lat, lon: from.lon }, to: { lat: dest.lat, lon: dest.lon }, states, packBase: new URL('data/packs/', location.href).href, pref: mode === 'car' ? (opt.pref || routePref) : 'fast', avoid: opt.avoid || null, hdg });
    });
  }
  // Ask how to get there
  function chooseNav(dest) {
    const u = window.FG.units(), from = pos;
    const d = from ? Geo.dist(from, dest) : null;
    openSheet(`<h3 style="margin:0 0 4px">Navigate to ${esc(dest.name)}</h3>
      <p class="small muted">${from ? Geo.fmtDist(d, u) + ' away in a straight line, ' + Math.round(Geo.bearing(from, dest)) + '° ' + Geo.cardinal(Geo.bearing(from, dest)) : 'Waiting for your GPS position — routes start from where you are.'}</p>
      <div class="list">
        <a class="row" href="#" data-nm="line"><span class="i">📏</span><span class="t"><b>Straight line</b><small>Compass bearing and distance, cross‑country</small></span><span class="chev">›</span></a>
        <a class="row" href="#" data-nm="car"><span class="i">🚗</span><span class="t"><b>Drive — roads only</b><small>${routePref === 'back' ? 'Back roads — avoids interstates and big highways' : 'Fastest route on highways, local and forest service roads'} (you can switch any time)</small></span><span class="chev">›</span></a>
        <a class="row" href="#" data-nm="foot"><span class="i">🥾</span><span class="t"><b>Walk / hike — roads &amp; trails</b><small>Fastest on foot using any mix of trails, roads and forest roads</small></span><span class="chev">›</span></a>
      </div>
      <p class="small" id="navMsg"></p>`);
    document.querySelectorAll('[data-nm]').forEach(a => a.onclick = async e => {
      e.preventDefault(); const mode = a.dataset.nm;
      if (mode === 'line') { setNav(dest, null); closeSheet(); return; }
      if (!pos) return toast('Waiting for a GPS fix — go outside and try again in a moment');
      if (routing) return; routing = true;
      $('#navMsg').innerHTML = '⏳ Finding the ' + (mode === 'car' ? (routePref === 'back' ? 'back-roads driving' : 'fastest driving') : 'fastest walking') + ' route offline…';
      try {
        const r = await computeRoute(mode, pos, dest); r.mode = mode; routing = false;
        setNav(dest, r); showRouteSummary(true);
      } catch (err) { routing = false; const m = $('#navMsg'); if (m) m.innerHTML = '⚠️ ' + esc(err.message) + '<br><a href="#" id="navLine">Use a straight line instead ›</a>'; const l = $('#navLine'); if (l) l.onclick = ev => { ev.preventDefault(); setNav(dest, null); closeSheet(); }; }
    });
  }
  function setNav(dest, r) {
    target = { lat: dest.lat, lon: dest.lon, name: dest.name, mode: r ? r.mode : 'line' }; store.set('navtarget', target);
    navRoute = prepRoute(r); offRouteCount = 0;
    store.set('navroute', r ? { mode: r.mode, coords: r.coords, kinds: r.kinds, total: r.total, time: r.time, steps: r.steps, byKind: r.byKind, haveLocal: r.haveLocal, pref: r.pref, avoid: r.avoid } : null);
    if (navRoute && tbt) { said = {}; if (r.announce) announceNew(r.announce); else if (!r.quiet) speak('Route updated'); }
    else if (navRoute) { // overview: fit the whole route on screen
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0; for (let i = 0; i < navRoute.X.length; i++) { x0 = Math.min(x0, navRoute.X[i]); x1 = Math.max(x1, navRoute.X[i]); y0 = Math.min(y0, navRoute.Y[i]); y1 = Math.max(y1, navRoute.Y[i]); }
      S.lon = ilon((x0 + x1) / 2); S.lat = ilat((y0 + y1) / 2);
      S.z = Math.max(4, Math.min(16, Math.log2(Math.min(W / Math.max(x1 - x0, 1e-9), (H * 0.55) / Math.max(y1 - y0, 1e-9)) / 256) - 0.3));
      follow = false; store.set('mapfollow', false); const b = $('#mLoc'); if (b) b.classList.remove('on');
    }
    dirty = true; updateHud();
  }
  function endNav() { stopTbt(); target = null; navRoute = null; store.set('navtarget', null); store.set('navroute', null); dirty = true; updateHud(); closeSheet(); toast('Navigation ended'); }
  let progCache = null;
  function routeProgress() {
    if (!navRoute || !pos) return null;
    if (progCache && progCache.t === pos.t && progCache.r === navRoute) return progCache.p;
    const X = mx(pos.lon), Y = my(pos.lat), n = navRoute.X.length; let best = 0, bd = Infinity, bt = 0;
    const scan = (a, b) => { for (let i = Math.max(0, a); i < Math.min(n - 1, b); i++) { const x1 = navRoute.X[i], y1 = navRoute.Y[i], dx = navRoute.X[i + 1] - x1, dy = navRoute.Y[i + 1] - y1, L = dx * dx + dy * dy; let t = L ? ((X - x1) * dx + (Y - y1) * dy) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = x1 + t * dx - X, ey = y1 + t * dy - Y, d = ex * ex + ey * ey; if (d < bd) { bd = d; best = i; bt = t; } } };
    const prev = navRoute.lastIdx;
    if (prev != null) scan(prev - 20, prev + 600); // stay on the stretch we were following (routes can pass near themselves)
    const near = prev != null && Math.sqrt(bd) * 40075016 * Math.cos(pos.lat * Math.PI / 180) < 80;
    if (!near) { bd = Infinity; scan(0, n); }
    if (n < 2) best = 0;
    navRoute.lastIdx = best;
    const sAlong = navRoute.cum[best] + bt * ((navRoute.cum[best + 1] || navRoute.cum[best]) - navRoute.cum[best]);
    const snap = ptAt(navRoute, sAlong), off = Geo.dist(pos, snap);
    const left = navRoute.total ? Math.max(0, navRoute.cum[n - 1] - sAlong) : 0;
    const frac = navRoute.cum[n - 1] ? left / navRoute.cum[n - 1] : 0;
    let step = null; for (const s of navRoute.steps) if (s.at <= best) step = s; const next = navRoute.steps.find(s => s.at > best);
    // a point ~60 m ahead on the route, for the compass arrow
    let ahead = n - 1; for (let i = best; i < n; i++) if (navRoute.cum[i] - navRoute.cum[best] > 60) { ahead = i; break; }
    const mi = navRoute.man ? navRoute.man.findIndex(m => m.d > sAlong + 5) : -1;
    const res = { idx: best, s: sAlong, off, left: left + Math.min(off, 50), eta: navRoute.time * frac, step, next, ahead: { lat: navRoute.coords[ahead * 2], lon: navRoute.coords[ahead * 2 + 1] }, man: mi >= 0 ? navRoute.man[mi] : null, manNext: mi >= 0 ? navRoute.man[mi + 1] : null, manDist: mi >= 0 ? navRoute.man[mi].d - sAlong : 0 };
    progCache = { t: pos.t, r: navRoute, p: res }; return res;
  }
  function checkOffRoute() {
    if (!navRoute || !pos || routing) return;
    const p = routeProgress(); if (!p) return;
    if (Geo.dist(pos, target) < (navRoute.mode === 'car' ? 45 : 30)) { if (tbt && !said.arrived) speak(/^-?\d+\.\d+, *-?\d+\.\d+$/.test(target.name) ? 'You have arrived at your destination' : 'You have arrived at ' + target.name); toast('🏁 You have arrived at ' + target.name); endNav(); return; }
    // missed a turn: two GPS fixes clearly off the line → reroute straight away from where you are, the way you're heading
    const limit = offLimit();
    offRouteCount = p.off > limit ? offRouteCount + 1 : 0;
    if (offRouteCount >= 2 && Date.now() - lastReroute > 8000) {
      lastReroute = Date.now(); offRouteCount = 0; if (tbt) speak('Rerouting'); else toast('Off route — finding a new route…');
      reroute({}, () => 'New route').catch(() => { });
    }
  }
  function announceNew(pre) { // "New route. In 400 feet, turn right onto Oak St"
    const q = routeProgress(), m = q && q.man;
    if (m && m.type !== 'start') { said[m.at + ':' + m.type + 'f'] = 1; if (q.manDist < Math.max(160, (pos.spd || 13) * 12) * 1.2) said[m.at + ':' + m.type + 'm'] = 1; speak(pre + '. In ' + sayDist(Math.max(0, q.manDist)) + ', ' + lowerFirst(sayMan(m))); }
    else speak(pre + (m ? '. ' + m.text : ''));
  }
  const offLimit = () => navRoute.mode === 'car' ? Math.max(45, Math.min(pos.acc || 0, 60) * 1.4) : Math.max(40, Math.min(pos.acc || 0, 60) * 1.4);
  // New route from where you are now, keeping the road preference and any detours already chosen
  function reroute(opt, announce) {
    if (!navRoute || !pos || !target || routing) return Promise.resolve(null);
    const mode = navRoute.mode, pref = opt.pref || navRoute.pref || routePref;
    let avoid = opt.avoid !== undefined ? opt.avoid : (navRoute.avoid || null);
    if (opt.addAvoid) avoid = (avoid || []).concat(opt.addAvoid);
    if (avoid && avoid.length > 6000) avoid = avoid.slice(-6000);
    routing = true; updateHud();
    return computeRoute(mode, pos, target, { pref, avoid }).then(r => {
      r.mode = mode; r.pref = pref; r.avoid = avoid; r.quiet = true; routing = false; if (announce) r.announce = announce(r); setNav(target, r); return r;
    }).catch(e => { routing = false; updateHud(); throw e; });
  }
  // the stretch of the current route ahead of you, as router node coordinates (for "avoid the road ahead")
  function routeAhead(fromM, toM) {
    const p = routeProgress(); if (!p) return null; const out = [], c = navRoute.cum;
    for (let i = 0; i < c.length; i++) { if (c[i] < p.s + fromM) continue; if (c[i] > p.s + toM) break; out.push(Math.round(navRoute.coords[i * 2 + 1] * 1e5), Math.round(navRoute.coords[i * 2] * 1e5)); }
    return out.length >= 4 ? out : null;
  }
  // Route options while driving: switch highways ⇄ back roads, or detour around trouble ahead
  function showRouteOptions() {
    if (!navRoute || navRoute.mode !== 'car') return;
    const u = window.FG.units(), p = routeProgress(), cur = navRoute.pref || routePref, nAv = navRoute.avoid ? navRoute.avoid.length / 2 : 0;
    const road = p ? ([p.step, p.next].find(x => x && x.kind === 'road' && x.name && !/^Unnamed|^Ramp$/.test(x.name)) || { name: 'the road ahead' }).name : 'the road ahead', aheadM = Math.min(8000, Math.max(2000, (p ? p.left : 0) * .4));
    openSheet(`<h3 style="margin:0 0 4px">Change route</h3>
      <p class="small muted">Now: ${cur === 'back' ? '🌾 back roads' : '🛣️ fastest'} · ${p ? fmtTime(p.eta) + ' · ' + Geo.fmtDist(p.left, u) : ''} to go${nAv ? ' · avoiding a stretch of road' : ''}</p>
      <div class="list wrap">
        <a class="row ${cur === 'fast' ? 'sel' : ''}" href="#" data-ro="fast"><span class="i">🛣️</span><span class="t"><b>Fastest route ${cur === 'fast' ? '✓' : ''}</b><small>Interstates and major highways allowed</small></span><span class="chev">›</span></a>
        <a class="row ${cur === 'back' ? 'sel' : ''}" href="#" data-ro="back"><span class="i">🌾</span><span class="t"><b>Back roads ${cur === 'back' ? '✓' : ''}</b><small>Stays off interstates and big US highways — state routes and county roads</small></span><span class="chev">›</span></a>
        <a class="row" href="#" data-ro="avoid"><span class="i">🚧</span><span class="t"><b>Avoid the road ahead</b><small>Traffic, accident or closure — detour around the next ${Geo.fmtDist(aheadM, u)} of ${esc(road === 'the road ahead' ? 'your route' : road)}</small></span><span class="chev">›</span></a>
        ${nAv ? `<a class="row" href="#" data-ro="clear"><span class="i">↩️</span><span class="t"><b>Clear detours</b><small>Allow the roads you chose to avoid again</small></span><span class="chev">›</span></a>` : ''}
      </div>
      <p class="small" id="roMsg"></p>
      <h3 style="margin:14px 0 6px">Voice</h3>
      <div class="seg">${[['auto', 'Automatic'], ['phone', 'Phone voice'], ['builtin', 'Built-in']].map(([k, l]) => `<button class="btn ${voiceEngine() === k ? 'pri' : ''}" data-ve="${k}">${l}</button>`).join('')}<button class="btn" id="veTest">🔊 Test</button></div>
      <p class="small muted" style="margin:6px 0 0">Built-in voice is part of the app and always works with no signal. Automatic uses the iPhone's voice when it can and switches to the built-in one when you're offline.</p>
      <div class="box small muted" style="margin-top:8px">Missed a turn? You don't need to do anything — the route recalculates by itself a few seconds after you leave it.</div>
      <div class="btnrow"><button class="btn" id="roClose">Close</button></div>`);
    $('#roClose').onclick = closeSheet;
    document.querySelectorAll('[data-ve]').forEach(b => b.onclick = () => { store.set('voiceEngine', b.dataset.ve); phoneVoiceOK = null; unlockAudio(); document.querySelectorAll('[data-ve]').forEach(x => x.classList.toggle('pri', x === b)); speak(b.dataset.ve === 'builtin' ? 'Built-in voice. In 500 feet, turn left onto Main Street' : 'In 500 feet, turn left onto Main Street', true); });
    $('#veTest').onclick = () => { unlockAudio(); speak('In half a mile, at the traffic light, turn right onto Oak Street', true); };
    document.querySelectorAll('[data-ro]').forEach(a => a.onclick = e => {
      e.preventDefault(); const k = a.dataset.ro; if (routing) return;
      if (!pos) return toast('Waiting for a GPS fix');
      const before = p ? p.eta : navRoute.time; let opt = {}, label = '';
      if (k === 'fast' || k === 'back') { if (k === cur) return closeSheet(); routePref = k; store.set('routePref', k); opt = { pref: k }; label = k === 'back' ? 'Taking back roads' : 'Taking the fastest route'; }
      else if (k === 'avoid') { const av = routeAhead(150, aheadM); if (!av) return toast('Nothing ahead to avoid'); opt = { addAvoid: av }; label = 'Detouring around ' + spoken(road); }
      else { opt = { avoid: null }; label = 'Detours cleared'; }
      $('#roMsg').innerHTML = '⏳ Working out a new route…';
      const diffOf = r => { const d = Math.round((r.time - before) / 60); return Math.abs(d) < 1 ? 'about the same time' : Math.abs(d) + (Math.abs(d) === 1 ? ' minute ' : ' minutes ') + (d > 0 ? 'longer' : 'faster'); };
      reroute(opt, r => label + ', ' + diffOf(r)).then(r => {
        if (!r) return; closeSheet();
        toast((k === 'back' ? '🌾 ' : k === 'fast' ? '🛣️ ' : k === 'avoid' ? '🚧 ' : '↩️ ') + label + '. ' + fmtTime(r.time) + ', ' + diffOf(r) + '.');
      }).catch(err => { const m = $('#roMsg'); if (m) m.innerHTML = '⚠️ ' + esc(err.message); });
    });
  }
  function showRouteSummary(fresh) {
    if (!navRoute || !target) return;
    const u = window.FG.units(), p = routeProgress();
    const kindName = ['🛣️ road', '🥾 trail', '🌲 forest road', '🧭 cross‑country'];
    const parts = navRoute.byKind ? [['road', 0], ['trail', 1], ['forest', 2], ['off', 3]].filter(([k]) => navRoute.byKind[k] > 20).map(([k, i]) => kindName[i] + ' ' + Geo.fmtDist(navRoute.byKind[k], u)).join(' · ') : '';
    openSheet(`<h3 style="margin:0 0 4px">${MODE_INFO[navRoute.mode][0]} ${MODE_INFO[navRoute.mode][1]} to ${esc(target.name)}</h3>
      <p class="big" style="margin:6px 0">${Geo.fmtDist(p ? p.left : navRoute.total, u)} · ${fmtTime(p ? p.eta : navRoute.time)}</p>
      <p class="small muted">${parts}${navRoute.mode === 'car' && !navRoute.haveLocal ? '<br>⚠️ Local roads for this area aren’t downloaded, so the route only uses highways and forest roads near the ends. Download your state in Layers 🗂️ for better routes.' : ''}</p>
      ${fresh && navRoute.mode === 'car' ? `<div class="box info" style="margin-top:6px"><b>Turn-by-turn directions?</b><br><span class="small">Follows you by GPS, shows each turn in large print and reads it aloud. Keeps the screen on.</span>
        <div class="btnrow"><button class="btn pri" id="rsTbt">🧭 Yes, start turn-by-turn</button><button class="btn" id="rsGo">No, just show the route</button></div></div>` : ''}
      ${navRoute.mode === 'car' ? `<div class="seg" style="margin:8px 0"><button class="btn ${(navRoute.pref || routePref) === 'fast' ? 'pri' : ''}" data-rp="fast">🛣️ Fastest</button><button class="btn ${(navRoute.pref || routePref) === 'back' ? 'pri' : ''}" data-rp="back">🌾 Back roads</button>${tbt ? '<button class="btn" id="rsOpts">🚧 Detour…</button>' : ''}</div>` : ''}
      <div id="rsProf" class="small muted">⛰️ Checking elevation…</div>
      <h3>Directions</h3>
      <div class="list">${navRoute.mode === 'car' && navRoute.man ? navRoute.man.slice(0, -1).map((m, i) => `<div class="row"><span class="i tbt-li">${arrowSVG(m)}</span><span class="t"><b>${esc(m.text)}</b><small>then go ${Geo.fmtDist(navRoute.steps[i] ? navRoute.steps[i].dist : 0, u)}</small></span></div>`).join('') : navRoute.steps.map((s, i) => `<div class="row"><span class="i">${i === 0 ? '🚩' : '↪️'}</span><span class="t"><b>${esc(s.name)}</b><small>${kindName[['road', 'trail', 'forest', 'off'].indexOf(s.kind)]} · ${Geo.fmtDist(s.dist, u)}</small></span></div>`).join('')}<div class="row"><span class="i">🏁</span><span class="t"><b>${esc(target.name)}</b></span></div></div>
      <div class="box warn small" style="margin-top:10px">Routes are calculated offline from public map data. Roads and trails can be closed, washed out, gated or on private land — use judgment and obey closures.</div>
      ${fresh && navRoute.mode === 'car' ? `<div class="btnrow"><button class="btn red" id="rsEnd">✕ End navigation</button></div>`
      : `<div class="btnrow"><button class="btn pri" id="rsGo">${fresh ? '▶ Start' : 'Close'}</button>${navRoute.mode === 'car' && !tbt ? '<button class="btn" id="rsTbt">🧭 Turn-by-turn</button>' : ''}<button class="btn red" id="rsEnd">✕ End navigation</button></div>`}`);
    const tb = $('#rsTbt'); if (tb) tb.onclick = () => { if (!pos) return toast('Waiting for a GPS fix'); startTbt(); };
    $('#rsGo').onclick = () => {
      closeSheet();
      if (fresh && pos) { S.lat = pos.lat; S.lon = pos.lon; S.z = navRoute.mode === 'car' ? 14 : 15; follow = true; store.set('mapfollow', true); const b = $('#mLoc'); if (b) b.classList.add('on'); dirty = true; }
    };
    $('#rsEnd').onclick = endNav;
    const ro = $('#rsOpts'); if (ro) ro.onclick = showRouteOptions;
    document.querySelectorAll('[data-rp]').forEach(b => b.onclick = () => {
      const k = b.dataset.rp; if (k === (navRoute.pref || routePref) || routing) return;
      if (!pos) return toast('Waiting for a GPS fix');
      routePref = k; store.set('routePref', k); b.textContent = '⏳ ' + b.textContent;
      const before = navRoute.time;
      reroute({ pref: k }).then(r => { if (!r) return; const d = Math.round((r.time - before) / 60); toast((k === 'back' ? '🌾 Back roads: ' : '🛣️ Fastest: ') + fmtTime(r.time) + (Math.abs(d) >= 1 ? ' (' + (d > 0 ? '+' : '−') + Math.abs(d) + ' min)' : '')); showRouteSummary(fresh); })
        .catch(err => toast('⚠️ ' + err.message));
    });
    const r = navRoute;
    (r.profile ? Promise.resolve(r.profile) : routeProfile(r)).then(pr => {
      const el = $('#rsProf'); if (!el) return;
      if (!pr) { el.innerHTML = '⛰️ Elevation profile needs terrain data for this area — save “Terrain” for offline in Layers 🗂️ (or view while online).'; return; }
      r.profile = pr;
      if (r.mode === 'foot' && !r.climbAdded) { r.climbAdded = true; r.time += pr.up / 600 * 3600; const st = store.get('navroute', null); if (st) { st.time = r.time; store.set('navroute', st); } updateHud(); }
      const met = window.FG.units() === 'met', f = v => met ? Math.round(v) + ' m' : Math.round(v * 3.28084).toLocaleString() + ' ft';
      el.innerHTML = `<b>⛰️ Climb ↑ ${f(pr.up)} · descent ↓ ${f(pr.down)}</b> · high point ${f(pr.max)}${r.mode === 'foot' ? ` · walking time incl. climbing ≈ <b>${fmtTime(r.time)}</b>` : ''}` + profileSVG(pr, r.cum[r.cum.length - 1]);
    });
  }
  function drawRoute() {
    if (!navRoute) return;
    geoTransform();
    const w = ws(), cx = mx(S.lon), cy = my(S.lat), hw = W / 2, hh = H / 2, n = navRoute.X.length;
    const seg = (from, to, col, width, dash) => { ctx.beginPath(); ctx.moveTo((navRoute.X[from] - cx) * w + hw, (navRoute.Y[from] - cy) * w + hh); for (let i = from + 1; i <= to; i++) ctx.lineTo((navRoute.X[i] - cx) * w + hw, (navRoute.Y[i] - cy) * w + hh); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    seg(0, n - 1, '#fff', 9);
    // colour by kind: road = blue, trail = purple, forest road = teal, cross-country = dashed
    let start = 0;
    for (let i = 1; i <= n - 1; i++) {
      const k = navRoute.kinds[i - 1], nk = i < n - 1 ? navRoute.kinds[i] : -1;
      if (nk !== k) { seg(start, i, k === 1 ? '#8e44ff' : k === 2 ? '#0fb5a6' : colors.nav, 5.5, k === 3 ? [7, 6] : null); start = i; }
    }
    plainTransform();
  }

  // ---------- raster tiles (optional; cached for offline) ----------
  let tilesFull = false;
  function tileURL(src, z, x, y) { return TILE_SOURCES[src].url.replace('{z}', z).replace('{x}', x).replace('{y}', y); }
  function drawTiles(vb) {
    const src = TILE_SOURCES[tilesOn]; if (!src) return false;
    let tz = Math.min(src.max, Math.max(1, Math.round(S.z))); const n = Math.pow(2, tz);
    const tx0 = Math.floor(vb[0] * n), tx1 = Math.floor(vb[2] * n), ty0 = Math.floor(vb[1] * n), ty1 = Math.floor(vb[3] * n);
    const size = ws() / n, pad = S.b ? 1 : .5; let all = true, any = false;
    for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) {
      const [sx, sy] = toScreen(tx / n, ty / n);
      const img = getTile(tilesOn, tz, tx, ty);
      if (img && img.complete && img.naturalWidth) { ctx.drawImage(img, sx, sy, size + pad, size + pad); any = true; }
      else {
        all = false;
        // fallback: scaled parent tile
        for (let pz = tz - 1, k = 2; pz >= Math.max(1, tz - 5); pz--, k *= 2) {
          const p = tileImgs.get(tilesOn + '/' + pz + '/' + Math.floor(tx / k) + '/' + Math.floor(ty / k));
          if (p && p.complete && p.naturalWidth) { const sw = 256 / k; ctx.drawImage(p, (tx % k) * sw, (ty % k) * sw, sw, sw, sx, sy, size + pad, size + pad); any = true; break; }
        }
      }
    }
    tilesFull = all;
    return any;
  }
  function getTile(src, z, x, y) {
    const key = src + '/' + z + '/' + x + '/' + y; let img = tileImgs.get(key);
    if (!img) {
      img = new Image(); img.onload = () => { dirty = true; }; img.onerror = () => { img.failed = true; };
      img.src = tileURL(src, z, x, y); tileImgs.set(key, img);
      if (tileImgs.size > 600) { const k = tileImgs.keys().next().value; tileImgs.delete(k); }
    }
    return img.failed ? null : img;
  }
  async function downloadArea(src, maxZ, onProg) {
    const [x0, y0, x1, y1] = viewBox();
    const list = [];
    maxZ = Math.min(maxZ, TILE_SOURCES[src].max);
    for (let z = Math.max(TILE_SOURCES[src].overlay ? 10 : 1, Math.floor(S.z) - 4); z <= maxZ; z++) {
      const n = Math.pow(2, z);
      for (let x = Math.floor(x0 * n); x <= Math.floor(x1 * n); x++) for (let y = Math.floor(y0 * n); y <= Math.floor(y1 * n); y++) list.push(tileURL(src, z, x, y));
    }
    if (list.length > 6000) return { error: 'That is ' + list.length + ' tiles. Zoom in or lower the max detail (limit 6,000 per download).' };
    const cache = await caches.open(TILE_CACHE); let done = 0, fail = 0, i = 0;
    async function worker() {
      while (i < list.length) {
        const u = list[i++];
        try {
          if (await cache.match(u)) { done++; onProg(done, list.length, fail); continue; }
          let r; try { r = await fetch(u, { mode: 'cors' }); } catch (e) { r = await fetch(u, { mode: 'no-cors' }); }
          if (r.ok || r.type === 'opaque') await cache.put(u, r); else fail++;
        } catch (e) { fail++; }
        done++; onProg(done, list.length, fail);
      }
    }
    await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
    const saved = store.get('savedAreas', []); saved.push({ src, z: maxZ, lat: S.lat, lon: S.lon, zoom: S.z, n: list.length, d: Date.now() }); store.set('savedAreas', saved);
    return { n: list.length, fail };
  }

  // ---------- GPS ----------
  // ---------- GPS clean-up: drop bad fixes, smooth jitter when slow, and glide smoothly between fixes ----------
  let kf = null, dispFrom = null, dispAt = 0, sDisp = null, lastDrawT = 0;
  function cleanFix(c, t) {
    const acc = Math.max(3, c.accuracy || 50), raw = { lat: c.latitude, lon: c.longitude };
    if (!kf || t - kf.t > 60000 || t < kf.t) { kf = { lat: raw.lat, lon: raw.lon, v: acc * acc, t, bad: 0 }; return { lat: raw.lat, lon: raw.lon, acc }; }
    const dt = Math.max(0.05, (t - kf.t) / 1000), d = Geo.dist(kf, raw), sd = Math.sqrt(kf.v);
    // reject jumps no vehicle could make, and fixes far worse than the ones we've been getting (cell/Wi-Fi guesses)
    if ((d / dt > 85 && d > 2 * (acc + sd)) || (acc > 65 && acc > sd * 3 && dt < 20)) { if (++kf.bad < 4) return null; }
    kf.bad = 0;
    const spd = c.speed != null && c.speed >= 0 ? c.speed : d / dt;
    if (spd > 3) { kf = { lat: raw.lat, lon: raw.lon, v: acc * acc, t, bad: 0 }; return { lat: raw.lat, lon: raw.lon, acc }; } // moving: GPS is steady, don't lag behind
    kf.v += dt * 1.5 * 1.5; const k = kf.v / (kf.v + acc * acc); // walking/standing: average out the wander
    kf.lat += (raw.lat - kf.lat) * k; kf.lon += (raw.lon - kf.lon) * k; kf.v *= (1 - k); kf.t = t;
    return { lat: kf.lat, lon: kf.lon, acc: Math.min(acc, Math.sqrt(kf.v) * 1.2 + 2) };
  }
  // where to draw you: on the road during car navigation (like a car GPS), and moving smoothly between fixes
  let dMemo = null, dMemoT = -1;
  function dispPos(now) { // memoised per frame so the smoothing doesn't depend on how often it's asked
    if (!pos) return null;
    if (dMemo && now - dMemoT < 12 && dMemo.t === pos.t) return dMemo;
    const d = dispCalc(now); d.t = pos.t; dMemo = d; dMemoT = now; return d;
  }
  function dispCalc(now) {
    if (tbt && navRoute && navRoute.mode === 'car') {
      const p = routeProgress();
      if (p && p.off < Math.max(25, Math.min(pos.acc || 0, 45))) {
        const v = pos.spd > 1 ? pos.spd : 0, sPred = p.s + v * Math.min(1.5, Math.max(0, (Date.now() - pos.t) / 1000));
        if (sDisp == null || Math.abs(sDisp - sPred) > 80) sDisp = sPred; else sDisp += (sPred - sDisp) * 0.18;
        const q = ptAt(navRoute, sDisp); q.snapped = true; q.hdg = Geo.bearing(q, ptAt(navRoute, sDisp + 25)); return q;
      }
    }
    sDisp = null;
    const f = Math.min(1, (now - dispAt) / 800);
    if (!dispFrom || f >= 1) return { lat: pos.lat, lon: pos.lon };
    const e = f * (2 - f); return { lat: dispFrom.lat + (pos.lat - dispFrom.lat) * e, lon: dispFrom.lon + (pos.lon - dispFrom.lon) * e };
  }
  function onPos(p) {
    const c = p.coords, cf = cleanFix(c, p.timestamp || Date.now());
    if (!cf) return; // ignored an obviously bad fix
    const now = performance.now(), prevDisp = pos ? dispPos(now) : null; dMemo = null;
    pos = { lat: cf.lat, lon: cf.lon, acc: cf.acc, rawAcc: c.accuracy, alt: c.altitude, spd: c.speed, hdg: c.heading, t: p.timestamp || Date.now() };
    dispFrom = prevDisp && Geo.dist(prevDisp, pos) < 300 ? prevDisp : null; dispAt = now;
    store.set('lastpos', { lat: pos.lat, lon: pos.lon });
    gpsErr = null;
    if (firstFix) {
      // First GPS fix after opening the map: jump to where you are and follow you.
      firstFix = false; follow = true; store.set('mapfollow', true); if (S.z < 12) S.z = 13;
      const b = $('#mLoc'); if (b) b.classList.add('on');
    }
    if (follow && !dispFrom) { S.lat = pos.lat; S.lon = pos.lon; }
    checkOffRoute();
    if (hdgSrc !== 'compass' && pos.hdg != null && !isNaN(pos.hdg) && pos.spd > 0.7) { heading = pos.hdg; hdgSrc = 'gps'; }
    updCompass();
    if (recording && c.accuracy < 60) {
      const last = track[track.length - 1];
      if (!last || Geo.dist({ lat: last[0], lon: last[1] }, pos) > Math.max(8, c.accuracy / 2)) { track.push([+pos.lat.toFixed(6), +pos.lon.toFixed(6), pos.alt == null ? null : Math.round(pos.alt), Date.now()]); store.set('track', track); }
    }
    dirty = true; updateHud();
  }
  function setHud(h) { const el = $('#mHud'); if (el) el.innerHTML = h; }
  function updateHud() {
    updCompass();
    const u = window.FG.units();
    let h = '';
    if (pos) {
      const age = (Date.now() - pos.t) / 1000, a = pos.acc;
      const q = age > 30 ? ['⚪', 'GPS signal lost — last fix ' + Math.round(age) + ' s ago'] : a <= 10 ? ['🟢', 'GPS · strong fix'] : a <= 30 ? ['🟢', 'GPS · good fix'] : a <= 100 ? ['🟡', 'GPS · fair — move to open sky'] : ['🟠', 'Rough location — waiting for satellites'];
      h += `<div class="small">${q[0]} ${q[1]}</div>`;
      h += `<div class="mono"><b>${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}</b> ±${Geo.fmtDist(pos.acc, u)}</div><div class="mono small muted">${Geo.toMGRS(pos.lat, pos.lon)}${pos.alt != null ? ' · alt ' + (u === 'met' ? Math.round(pos.alt) + ' m' : Math.round(pos.alt * 3.28084) + ' ft') : ''}${pos.spd > .3 ? ' · ' + (u === 'met' ? (pos.spd * 3.6).toFixed(1) + ' km/h' : (pos.spd * 2.237).toFixed(1) + ' mph') : ''}</div>`;
      if (target && navRoute && tbt) { updateTbt(routeProgress()); h = ''; }
      else if (target && navRoute) {
        const p = routeProgress();
        h += `<div class="navbox"><div class="navrow"><span>${MODE_INFO[navRoute.mode][0]} <b>${esc(target.name)}</b> · ${Geo.fmtDist(p.left, u)} · ${fmtTime(p.eta)}</span><button class="btn red navend" id="navEnd">✕ End</button></div>
          <div class="small">${p.off > (navRoute.mode === 'car' ? 120 : 70) ? '⚠️ Off route — head back to the colored line (rerouting…)' : p.next ? 'Now: ' + esc(p.step ? p.step.name : '') + ' · next: <b>' + esc(p.next.name) + '</b> in ' + Geo.fmtDist(Math.max(0, navRoute.cum[p.next.at] - navRoute.cum[p.idx]), u) : 'Continue to the destination'} · <a href="#" id="navSteps">directions</a>${navRoute.mode === 'car' ? ' · <a href="#" id="navTbt">🧭 turn-by-turn</a>' : ''}</div></div>`;
      } else if (target) { const d = Geo.dist(pos, target), b = Geo.bearing(pos, target); const dc = Geo.declination(pos.lat, pos.lon); h += `<div class="navbox"><div class="navrow"><span>📏 <b>${esc(target.name)}</b>: ${Geo.fmtDist(d, u)} · ${Math.round(b)}° true (${Math.round((b - dc + 360) % 360)}° mag) ${Geo.cardinal(b)}</span><button class="btn red navend" id="navEnd">✕ End</button></div></div>`; }
    } else {
      h += gpsErr && gpsErr.code !== 3 ? '<span class="muted">' + esc(window.FG.gpsErrText(gpsErr)) + '</span>'
        : '<span class="muted">📡 Getting a fix from your phone\'s GPS… go outside with a clear view of the sky (first fix can take up to a minute with no internet). Long‑press the map to drop a waypoint.</span>';
      if (target) h += `<div class="navbox"><div class="navrow"><span>${navRoute ? MODE_INFO[navRoute.mode][0] : '📏'} <b>${esc(target.name)}</b></span><button class="btn red navend" id="navEnd">✕ End</button></div></div>`;
    }
    if (recording) h += `<div class="small" style="color:${colors.track}">⏺ Recording track · ${track.length} pts · ${Geo.fmtDist(trackLen(track), u)} — keep app open &amp; screen on</div>`;
    setHud(h);
    const ne = $('#navEnd'); if (ne) ne.onclick = e => { e.preventDefault(); endNav(); };
    const ns = $('#navSteps'); if (ns) ns.onclick = e => { e.preventDefault(); showRouteSummary(false); };
    const nt = $('#navTbt'); if (nt) nt.onclick = e => { e.preventDefault(); startTbt(); };
    if (!(tbt && target && navRoute && pos)) updateTbt(null);
    const hud = $('#mHud'); if (hud) hud.hidden = !!(tbt && target && navRoute && pos && !recording);
  }
  function trackLen(t) { let s = 0; for (let i = 1; i < t.length; i++) s += Geo.dist({ lat: t[i - 1][0], lon: t[i - 1][1] }, { lat: t[i][0], lon: t[i][1] }); return s; }

  // ---------- my car: park here / back to car ----------
  function carSheet() {
    const u = window.FG.units(), car = store.get('waypoints', []).find(w => w.car);
    openSheet(`<h3 style="margin:0 0 6px">🚗 My car</h3>${car ? `<p>${pos ? `<b>${Geo.fmtDist(Geo.dist(pos, car), u)}</b> away · ${Math.round(Geo.bearing(pos, car))}° ${Geo.cardinal(Geo.bearing(pos, car))}` : 'Waiting for a GPS fix…'}<br><span class="small muted">Parked ${new Date(car.t).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span></p>` : '<p class="small muted">Save where you parked before you walk away. One tap guides you back later, with no cell signal needed.</p>'}
      ${car ? '' : `<label class="small" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="carRec" ${recording ? 'checked disabled' : 'checked'}> Also record my trail (⏺) so I can back‑track the exact way</label>`}
      <div class="btnrow">${car ? '<button class="btn pri" id="carGo">Back to car</button><button class="btn" id="carShow">Show on map</button>' : ''}<button class="btn ${car ? '' : 'pri'}" id="carHere">${car ? 'Move pin here' : '🅿️ Park here'}</button>${car ? '<button class="btn" id="carDel">Clear</button>' : ''}</div>`);
    const set = () => {
      if (!pos) return toast('Waiting for GPS — step outside for a clear view of the sky');
      const w = store.get('waypoints', []).filter(x => !x.car); w.push({ id: Date.now(), car: true, name: 'My car', icon: '🚗', lat: pos.lat, lon: pos.lon, t: Date.now() });
      store.set('waypoints', w); const r = $('#carRec'); if (r && r.checked && !recording) toggleRec(); toast('Car location saved'); closeSheet(); dirty = true;
    };
    $('#carHere').onclick = () => { if (car && !confirm('Move the car pin to where you are now?')) return; set(); };
    if (car) {
      $('#carGo').onclick = () => { closeSheet(); chooseNav({ lat: car.lat, lon: car.lon, name: 'My car' }); };
      $('#carShow').onclick = () => { S.lat = car.lat; S.lon = car.lon; S.z = Math.max(S.z, 15); follow = false; closeSheet(); dirty = true; };
      $('#carDel').onclick = () => { store.set('waypoints', store.get('waypoints', []).filter(x => !x.car)); toast('Car pin cleared'); closeSheet(); dirty = true; };
    }
  }

  function toggleRec() {
    if (!recording) {
      if (track.length && !confirm('Start a new track? The current unsaved track (' + track.length + ' points) will be saved to your track list first.')) return;
      if (track.length) saveTrack();
      recording = true; track = []; store.set('track', track); toast('Recording — keep the app open with the screen on');
      if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => { });
    } else {
      recording = false; if (track.length > 1) saveTrack(); else toast('Track too short — not saved');
      if (bgStop) { bgStop(); bgStop = null; }
    }
    $('#mRec').classList.toggle('on', recording); updateHud(); dirty = true;
  }
  function saveTrack(name) {
    const t = store.get('tracks', []);
    t.unshift({ id: Date.now(), name: name || 'Track ' + new Date(track[0] ? track[0][3] : Date.now()).toLocaleString(), pts: track, show: true, len: trackLen(track) });
    store.set('tracks', t); track = []; store.set('track', track); toast('Track saved');
  }

  // ---------- gestures ----------
  function bindGestures() {
    const ptrs = new Map(); let lastDist = 0, lastMid = null, pressT = null, moved = false, lastTap = 0, downAt = null, lastAng = null, twist = 0, twisting = false;
    const ang = p => Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]) / D2R;
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false; downAt = [e.clientX, e.clientY];
      if (ptrs.size === 1) {
        clearTimeout(pressT); pressT = setTimeout(() => { if (!moved && ptrs.size === 1) longPress(e.clientX, e.clientY); }, 650);
      } else { clearTimeout(pressT); const p = [...ptrs.values()]; lastDist = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); lastMid = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2]; lastAng = ang(p); twist = 0; twisting = false; }
    });
    canvas.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8) { moved = true; clearTimeout(pressT); }
      if (ptrs.size === 1 && moved) { pan(e.clientX - prev[0], e.clientY - prev[1]); }
      else if (ptrs.size === 2) {
        const p = [...ptrs.values()]; const d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); const mid = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2];
        if (lastMid) pan(mid[0] - lastMid[0], mid[1] - lastMid[1]);
        if (lastDist) zoomAt(mid[0] - canvas.getBoundingClientRect().left, mid[1] - canvas.getBoundingClientRect().top, Math.log2(d / lastDist), true);
        // two-finger twist rotates the map (after a small dead zone so pinching doesn't spin it)
        const a = ang(p);
        if (lastAng != null) {
          const da = ((a - lastAng) % 360 + 540) % 360 - 180; twist += da;
          if (!twisting && Math.abs(twist) > 14) { twisting = true; setRotMode('free'); }
          if (twisting) { const r = canvas.getBoundingClientRect(), px = mid[0] - r.left, py = mid[1] - r.top, before = toWorld(px, py); S.b = ((S.b || 0) - da + 360) % 360; setRot(); if (!follow) { const after = toWorld(px, py); S.lon = ilon(mx(S.lon) + before[0] - after[0]); S.lat = ilat(my(S.lat) + before[1] - after[1]); } dirty = true; }
        }
        lastDist = d; lastMid = mid; lastAng = a;
      }
    });
    const up = e => {
      clearTimeout(pressT); ptrs.delete(e.pointerId); if (ptrs.size < 2) { lastDist = 0; lastMid = null; lastAng = null; }
      if (!moved && e.type === 'pointerup') {
        const now = Date.now();
        if (now - lastTap < 300) { const r = canvas.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 1); lastTap = 0; }
        else { lastTap = now; tapAt(e.clientX, e.clientY); }
      }
      store.set('mapview', S);
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, -e.deltaY / 300, true); }, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  function pan(dx, dy) {
    if (Math.abs(dx) + Math.abs(dy) < .5) return; // pinching / twisting in place shouldn't stop following
    if (follow) {
      // keep the view exactly where it is while the pivot moves back to the middle of the screen
      if (oy) { const [cX, cY] = toWorld(W / 2, H / 2); S.lon = ilon(cX); S.lat = ilat(cY); oy = 0; }
      follow = false; store.set('mapfollow', false); updLocBtn();
    }
    const w = ws(), ux = dx * rc + dy * rs, uy = -dx * rs + dy * rc; let X = mx(S.lon) - ux / w, Y = my(S.lat) - uy / w; Y = Math.max(0.01, Math.min(.99, Y));
    S.lon = ilon(X); S.lat = ilat(Y); dirty = true;
  }
  function zoomAt(px, py, dz, smooth) {
    const before = toWorld(px, py); S.z = Math.max(3, Math.min(18, S.z + dz));
    const after = toWorld(px, py); if (!follow) { S.lon = ilon(mx(S.lon) + before[0] - after[0]); S.lat = ilat(my(S.lat) + before[1] - after[1]); }
    dirty = true; store.set('mapview', S);
  }
  function tapAt(cx, cy) {
    const r = canvas.getBoundingClientRect(); const x = cx - r.left, y = cy - r.top;
    const wps = store.get('waypoints', []);
    for (const w of wps) { const [sx, sy] = toScreen(mx(w.lon), my(w.lat)); if (Math.hypot(sx - x, sy - 14 - y) < 18) return showWaypoint(w); }
    const pl = hitPlace(x, y); if (pl) return showPlace(pl);
    const p = hitPoint(x, y); if (p && ((LAYERS.water && 'swflr'.includes(p.t)) || S.z >= 11.5)) return showPoint(p);
  }
  function longPress(cx, cy) {
    const r = canvas.getBoundingClientRect(); const [X, Y] = toWorld(cx - r.left, cy - r.top);
    const p = { lat: ilat(Y), lon: ilon(X) };
    if (navigator.vibrate) navigator.vibrate(30);
    openSheet(`<h3 style="margin:0 0 6px">Dropped pin</h3><div class="mono">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div><div class="mono small muted">${Geo.toMGRS(p.lat, p.lon)}</div>
      ${pos ? `<p>${Geo.fmtDist(Geo.dist(pos, p), window.FG.units())} at ${Math.round(Geo.bearing(pos, p))}° from you</p>` : ''}
      <p class="small" id="pinElev"></p>
      <label class="f">Name</label><input class="inp" id="wpn" value="Waypoint ${store.get('waypoints', []).length + 1}">
      <label class="f">Type</label><select class="inp" id="wpi">${WP_ICONS.map(([i, n]) => `<option value="${i}">${i} ${n}</option>`).join('')}</select>
      <div class="btnrow"><button class="btn pri" id="wps">Save waypoint</button><button class="btn" id="wpg">Navigate here</button><button class="btn" id="wpx">Cancel</button></div>`);
    $('#wps').onclick = () => { const w = store.get('waypoints', []); w.push({ id: Date.now(), name: $('#wpn').value || 'Waypoint', icon: $('#wpi').value, lat: p.lat, lon: p.lon, t: Date.now() }); store.set('waypoints', w); closeSheet(); dirty = true; toast('Waypoint saved'); };
    $('#wpg').onclick = () => chooseNav({ lat: p.lat, lon: p.lon, name: $('#wpn').value || 'Pin' });
    $('#wpx').onclick = closeSheet;
    elevationAt(p.lat, p.lon).then(e => { const el = $('#pinElev'); if (el && e != null) el.textContent = 'Elevation ≈ ' + fmtElev(e) + ' (terrain data)'; });
  }
  const WP_ICONS = [['📍', 'General'], ['🚗', 'Vehicle / parking'], ['⛺', 'Camp'], ['💧', 'Water source'], ['🏠', 'Home / shelter'], ['⛽', 'Fuel'], ['🍎', 'Food / forage'], ['🎣', 'Fishing'], ['🏥', 'Medical'], ['⚠️', 'Hazard'], ['🤝', 'Rally point'], ['🗻', 'Lookout']];

  function openSheet(html) { const s = $('#mSheet'); s.innerHTML = `<div style="display:flex;justify-content:flex-end"><button class="iconbtn" id="shx" style="min-width:36px;height:36px">✕</button></div>` + html; s.hidden = false; $('#shx').onclick = closeSheet; }
  function closeSheet() { const s = $('#mSheet'); if (s) s.hidden = true; }

  function showWaypoint(w) {
    const u = window.FG.units();
    openSheet(`<h3 style="margin:0 0 6px">${esc(w.icon || '📍')} ${esc(w.name)}</h3><div class="mono">${w.lat.toFixed(5)}, ${w.lon.toFixed(5)}</div><div class="mono small muted">${Geo.toMGRS(w.lat, w.lon)} · ${Geo.fmtUTM(w.lat, w.lon)}</div>
      ${pos ? `<p><b>${Geo.fmtDist(Geo.dist(pos, w), u)}</b> at ${Math.round(Geo.bearing(pos, w))}° true ${Geo.cardinal(Geo.bearing(pos, w))}</p>` : ''}
      <p class="small muted">Saved ${new Date(w.t).toLocaleString()}</p>
      <div class="btnrow"><button class="btn pri" id="wgo">Navigate here</button><button class="btn" id="wren">Rename</button><button class="btn red" id="wdel">Delete</button></div>`);
    $('#wgo').onclick = () => chooseNav({ lat: w.lat, lon: w.lon, name: w.name });
    $('#wren').onclick = () => { const n = prompt('Name', w.name); if (!n) return; const a = store.get('waypoints', []); const x = a.find(q => q.id === w.id); if (x) x.name = n; store.set('waypoints', a); closeSheet(); dirty = true; };
    $('#wdel').onclick = () => { if (!confirm('Delete ' + w.name + '?')) return; store.set('waypoints', store.get('waypoints', []).filter(q => q.id !== w.id)); closeSheet(); dirty = true; };
  }

  function showWaypoints() {
    const u = window.FG.units(); const wps = store.get('waypoints', []); const trs = store.get('tracks', []);
    const sorted = pos ? wps.slice().sort((a, b) => Geo.dist(pos, a) - Geo.dist(pos, b)) : wps.slice().reverse();
    openSheet(`<h3 style="margin:0">Waypoints (${wps.length})</h3><p class="small muted">Long‑press the map to add one. Tap a pin to navigate to it.</p>
      <div class="btnrow"><button class="btn pri" id="addHere">＋ Mark my location</button></div>
      <div class="list" style="margin-top:10px">${sorted.map(w => `<a class="row" href="#" data-w="${w.id}"><span class="i">${esc(w.icon || '📍')}</span><span class="t"><b>${esc(w.name)}</b><small>${pos ? Geo.fmtDist(Geo.dist(pos, w), u) + ' · ' + Math.round(Geo.bearing(pos, w)) + '° ' + Geo.cardinal(Geo.bearing(pos, w)) : w.lat.toFixed(4) + ', ' + w.lon.toFixed(4)}</small></span><span class="chev">›</span></a>`).join('') || '<p class="muted">None yet.</p>'}</div>
      <h3>Tracks (${trs.length})</h3>
      <div class="list">${trs.map(t => `<div class="row"><span class="t"><b>${esc(t.name)}</b><small>${Geo.fmtDist(t.len || 0, u)} · ${t.pts.length} pts</small></span><button class="btn" data-ts="${t.id}">${t.show ? 'Hide' : 'Show'}</button><button class="btn" data-tf="${t.id}">Back‑track</button><button class="btn" data-td="${t.id}">✕</button></div>`).join('') || '<p class="muted">Tap ⏺ to record your path (breadcrumbs) so you can find your way back.</p>'}</div>
      <h3>Import / export</h3><div class="btnrow"><button class="btn" id="gpxOut">Export GPX</button><label class="btn">Import GPX<input type="file" id="gpxIn" accept=".gpx,application/gpx+xml,application/xml,text/xml" hidden></label></div>
      <p class="small muted">GPX works with Garmin, Gaia GPS, CalTopo, OnX and most GPS apps.</p>`);
    document.querySelectorAll('[data-w]').forEach(a => a.onclick = e => { e.preventDefault(); const w = wps.find(x => x.id == a.dataset.w); S.lat = w.lat; S.lon = w.lon; if (S.z < 13) S.z = 14; follow = false; dirty = true; showWaypoint(w); });
    document.querySelectorAll('[data-ts]').forEach(b => b.onclick = () => { const t = store.get('tracks', []); const x = t.find(q => q.id == b.dataset.ts); x.show = !x.show; store.set('tracks', t); dirty = true; showWaypoints(); });
    document.querySelectorAll('[data-td]').forEach(b => b.onclick = () => { if (!confirm('Delete track?')) return; store.set('tracks', store.get('tracks', []).filter(q => q.id != b.dataset.td)); dirty = true; showWaypoints(); });
    document.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => { const x = store.get('tracks', []).find(q => q.id == b.dataset.tf); const p = x.pts[0]; setNav({ lat: p[0], lon: p[1], name: 'Start of ' + x.name }, null); x.show = true; closeSheet(); dirty = true; updateHud(); toast('Follow the pink line back to the start'); });
    $('#addHere').onclick = () => {
      if (!pos) return toast('No GPS fix yet'); const n = prompt('Name this spot', 'Marked ' + new Date().toLocaleTimeString()); if (n == null) return;
      const w = store.get('waypoints', []); w.push({ id: Date.now(), name: n, icon: '📍', lat: pos.lat, lon: pos.lon, alt: pos.alt, t: Date.now() }); store.set('waypoints', w); dirty = true; showWaypoints();
    };
    $('#gpxOut').onclick = exportGPX; $('#gpxIn').onchange = importGPX;
  }
  function xmlEsc(s) { return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); }
  function exportGPX() {
    const wps = store.get('waypoints', []), trs = store.get('tracks', []);
    const all = track.length ? trs.concat([{ name: 'Current track', pts: track }]) : trs;
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Field Guide" xmlns="http://www.topografix.com/GPX/1/1">\n` +
      wps.map(w => `<wpt lat="${w.lat}" lon="${w.lon}">${w.alt != null ? `<ele>${w.alt}</ele>` : ''}<time>${new Date(w.t).toISOString()}</time><name>${xmlEsc(w.name)}</name></wpt>`).join('\n') + '\n' +
      all.map(t => `<trk><name>${xmlEsc(t.name)}</name><trkseg>${t.pts.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}">${p[2] != null ? `<ele>${p[2]}</ele>` : ''}${p[3] ? `<time>${new Date(p[3]).toISOString()}</time>` : ''}</trkpt>`).join('')}</trkseg></trk>`).join('\n') + '\n</gpx>';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' })); a.download = 'field-guide-' + new Date().toISOString().slice(0, 10) + '.gpx'; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000);
  }
  function importGPX(e) {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => {
      try {
        const doc = new DOMParser().parseFromString(r.result, 'application/xml');
        const w = store.get('waypoints', []); let nw = 0, nt = 0;
        doc.querySelectorAll('wpt').forEach(p => { w.push({ id: Date.now() + Math.random(), name: (p.querySelector('name') || {}).textContent || 'Imported', icon: '📍', lat: +p.getAttribute('lat'), lon: +p.getAttribute('lon'), t: Date.now() }); nw++; });
        store.set('waypoints', w);
        const trs = store.get('tracks', []);
        doc.querySelectorAll('trk, rte').forEach(t => { const pts = [...t.querySelectorAll('trkpt, rtept')].map(p => [+p.getAttribute('lat'), +p.getAttribute('lon'), p.querySelector('ele') ? +p.querySelector('ele').textContent : null, 0]); if (pts.length > 1) { trs.unshift({ id: Date.now() + Math.random(), name: (t.querySelector('name') || {}).textContent || 'Imported track', pts, show: true, len: trackLen(pts) }); nt++; } });
        store.set('tracks', trs); dirty = true; toast(`Imported ${nw} waypoints, ${nt} tracks`); showWaypoints();
      } catch (err) { toast('Could not read that GPX file'); }
    };
    r.readAsText(f);
  }

  function showLayers() {
    const saved = store.get('savedAreas', []);
    openSheet(`<h3 style="margin:0 0 6px">Map layers</h3>
      <p class="small muted">The built‑in map of the eastern U.S. from Maine to the Gulf, plus border crossings into Canada (states, counties, cities, highways, rivers, lakes, parks) is always available offline. Detailed topo maps can be added for areas you choose while you have internet.</p>
      <label class="f">Detailed background (needs saved tiles or internet)</label>
      <select class="inp" id="lyr"><option value="">None — built‑in offline map only</option>${Object.entries(TILE_SOURCES).filter(([, v]) => !v.overlay).map(([k, v]) => `<option value="${k}" ${tilesOn === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select>
      <label class="chk" style="padding-left:0"><input type="checkbox" id="grd" ${store.get('mapgrid', false) ? 'checked' : ''}><span class="t"><b>Lat/long grid</b></span></label>
      <h3>Local roads & street addresses (offline, by state)</h3>
      <p class="small muted">Highways, state & county roads, forest service roads and hiking trails are built in. Every residential and back road, and the street addresses you can search for (🔍), are separate downloads per state. Get both for the states you drive in.</p>
      <div class="list" id="packList">${(SEIDX ? SEIDX.states : []).map(st => { const A = ADDRIDX && ADDRIDX[st.code]; return `<div class="row" style="flex-wrap:wrap"><span class="t"><b>${esc(st.name)}</b><small>🛣️ local roads ${(st.local / 1e6).toFixed(0)} MB ${LOCALHAVE[st.code] ? '✅' : ''}${A ? ` · 🏠 ${A.n.toLocaleString()} addresses ${(A.size / 1e6).toFixed(0)} MB ${ADDRHAVE[st.code] ? '✅' : ''}` : ' · 🏠 no address data for this state'}</small></span>
        ${LOCALHAVE[st.code] ? `<button class="btn" data-pdel="${st.code}">Delete roads</button>` : `<button class="btn pri" data-pget="${st.code}">Roads</button>`}${A ? (ADDRHAVE[st.code] ? `<button class="btn" data-adel="${st.code}">Delete addresses</button>` : `<button class="btn pri" data-aget="${st.code}">Addresses</button>`) : ''}</div>`; }).join('') || '<p class="muted small">Loading state list…</p>'}</div>
      <p class="small" id="packProg"></p>
      <h3>Save topo maps & terrain for offline use</h3>
      <ol class="small"><li>While online, pan/zoom so the area you need fills the screen.</li><li>Choose how much detail and tap Download.</li><li>Repeat for each area (home, bug‑out route, destination).</li></ol>
      <div class="two"><div><label class="f">Map</label><select class="inp" id="dls">${Object.entries(TILE_SOURCES).filter(([, v]) => v.dl).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}</select></div>
      <div><label class="f">Max detail</label><select class="inp" id="dlz">${[[12, '12 — county roads'], [13, '13 — towns'], [14, '14 — trails & contours'], [15, '15 — very detailed'], [16, '16 — max (small areas only)']].map(([z, l]) => `<option value="${z}" ${z === 14 ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
      <p class="small" id="dlEst"></p>
      <div class="btnrow"><button class="btn pri" id="dlGo">Download this area</button><button class="btn" id="dlClear">Delete saved tiles</button></div>
      <p class="small" id="dlProg"></p>
      ${saved.length ? `<h3>Saved areas</h3><div class="list">${saved.map((a, i) => `<a class="row" href="#" data-sa="${i}"><span class="t"><b>${esc(TILE_SOURCES[a.src] ? TILE_SOURCES[a.src].name : a.src)}</b><small>${a.lat.toFixed(3)}, ${a.lon.toFixed(3)} · zoom ≤${a.z} · ${a.n} tiles · ${new Date(a.d).toLocaleDateString()}</small></span><span class="chev">›</span></a>`).join('')}</div>` : ''}
      <p class="small muted">Contour lines are calculated on your phone from terrain data — choose “Terrain” above and download the area to use contours and elevation offline. Roads & trails: USGS National Transportation Dataset (U.S. Census TIGER, U.S. Forest Service, NPS). Springs, falls, lakes & peaks: USGS GNIS. Map tiles: USGS The National Map (public domain). OpenStreetMap tiles are shown only while online / as you view them (© OpenStreetMap contributors). Built‑in map: Natural Earth, U.S. Census.</p>`);
    $('#lyr').onchange = () => { tilesOn = $('#lyr').value; store.set('maptiles', tilesOn); dirty = true; };
    $('#grd').onchange = () => { store.set('mapgrid', $('#grd').checked); dirty = true; };
    const est = () => { const [x0, y0, x1, y1] = viewBox(); let n = 0; for (let z = Math.max(1, Math.floor(S.z) - 4); z <= +$('#dlz').value; z++) { const k = Math.pow(2, z); n += (Math.floor(x1 * k) - Math.floor(x0 * k) + 1) * (Math.floor(y1 * k) - Math.floor(y0 * k) + 1); } $('#dlEst').textContent = `≈ ${n.toLocaleString()} tiles, ~${Math.round(n * 0.025)} MB. ${n > 6000 ? '⚠️ Too many — zoom in first.' : ''}`; };
    $('#dlz').onchange = est; est();
    $('#dlGo').onclick = async () => {
      if (!navigator.onLine) return toast('You need internet to download maps');
      if (!('caches' in window)) return toast('Offline storage not supported here');
      $('#dlGo').disabled = true;
      const r = await downloadArea($('#dls').value, +$('#dlz').value, (d, n, f) => { const el = $('#dlProg'); if (el) el.innerHTML = `<div class="progress"><i style="width:${(d / n * 100).toFixed(1)}%"></i></div>${d} / ${n}${f ? ' · ' + f + ' failed' : ''}`; });
      const b = $('#dlGo'); if (b) b.disabled = false;
      if (r.error) return toast(r.error);
      toast(`Saved ${r.n - r.fail} tiles for offline use`); tilesOn = $('#dls').value; store.set('maptiles', tilesOn); dirty = true;
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    };
    document.querySelectorAll('[data-pget]').forEach(b => b.onclick = async () => {
      const code = b.dataset.pget; if (!navigator.onLine) return toast('Connect to the internet to download');
      b.disabled = true; $('#packProg').textContent = 'Downloading ' + code + ' roads…';
      try { const r = await fetch(packURL(code), { cache: 'reload' }); if (!r.ok) throw 0; const c = await caches.open(PACK_CACHE); await c.put(packURL(code), r); LOCALHAVE[code] = true; loadingSet.delete('L' + code); if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); toast('Saved local roads for ' + code); dirty = true; showLayers(); }
      catch (e) { b.disabled = false; $('#packProg').textContent = 'Download failed — try again with a better connection.'; }
    });
    document.querySelectorAll('[data-aget]').forEach(b => b.onclick = async () => { b.disabled = true; $('#packProg').textContent = 'Downloading ' + b.dataset.aget + ' addresses…'; if (await addrDownload(b.dataset.aget)) { toast('Saved addresses for ' + b.dataset.aget); showLayers(); } else { b.disabled = false; $('#packProg').textContent = 'Download failed — try again with a better connection.'; } });
    document.querySelectorAll('[data-adel]').forEach(b => b.onclick = async () => { const code = b.dataset.adel; if (!confirm('Delete saved addresses for ' + code + '?')) return; const c = await caches.open(PACK_CACHE); await c.delete(addrURL(code)); ADDRHAVE[code] = false; delete ADDR[code]; showLayers(); });
    if (!ADDRIDX) addrInit().then(() => { if ($('#packList')) showLayers(); });
    document.querySelectorAll('[data-pdel]').forEach(b => b.onclick = async () => { const code = b.dataset.pdel; if (!confirm('Delete saved local roads for ' + code + '?')) return; const c = await caches.open(PACK_CACHE); await c.delete(packURL(code)); LOCALHAVE[code] = false; delete LOCAL[code]; loadingSet.delete('L' + code); dirty = true; showLayers(); });
    if (!SEIDX) setTimeout(() => { if (SEIDX && $('#packList')) showLayers(); }, 1500);
    $('#dlClear').onclick = async () => { if (!confirm('Delete all saved map tiles?')) return; await caches.delete(TILE_CACHE); store.set('savedAreas', []); toast('Deleted'); showLayers(); };
    document.querySelectorAll('[data-sa]').forEach(a => a.onclick = e => { e.preventDefault(); const s = saved[+a.dataset.sa]; S.lat = s.lat; S.lon = s.lon; S.z = s.zoom; tilesOn = s.src; store.set('maptiles', tilesOn); follow = false; dirty = true; closeSheet(); });
  }

  // ---------- offline street addresses (downloaded per state) ----------
  const addrURL = c => new URL('data/addr/' + c + '.json', location.href).href;
  let ADDRIDX = null; const ADDR = {}, ADDRHAVE = {};
  const ABBR = { street: 'st', road: 'rd', avenue: 'ave', av: 'ave', drive: 'dr', lane: 'ln', court: 'ct', boulevard: 'blvd', highway: 'hwy', parkway: 'pkwy', circle: 'cir', place: 'pl', terrace: 'ter', trail: 'trl', north: 'n', south: 's', east: 'e', west: 'w', northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw', mount: 'mt', saint: 'st', fort: 'ft', point: 'pt', square: 'sq', expressway: 'expy', freeway: 'fwy', turnpike: 'tpke', alley: 'aly', crossing: 'xing', route: 'rte', county: 'co', extension: 'ext', heights: 'hts', junction: 'jct', center: 'ctr', creek: 'crk', ridge: 'rdg', valley: 'vly', estates: 'est', loop: 'loop', pike: 'pike', row: 'row', run: 'run' };
  const SUFFIX = new Set(['st', 'rd', 'ave', 'dr', 'ln', 'ct', 'blvd', 'hwy', 'pkwy', 'cir', 'pl', 'ter', 'trl', 'way', 'sq', 'expy', 'fwy', 'tpke', 'aly', 'xing', 'loop', 'pike', 'row', 'run']);
  const normSt = t => String(t).toLowerCase().replace(/[.,#'’]/g, ' ').split(/\s+/).filter(Boolean).map(w => ABBR[w] || w).join(' ');
  const baseKey = k => { const w = k.split(' '); return w.length > 1 && SUFFIX.has(w[w.length - 1]) ? w.slice(0, -1).join(' ') : k; };
  const STNAME = { AL: 'alabama', AR: 'arkansas', FL: 'florida', GA: 'georgia', KY: 'kentucky', LA: 'louisiana', MS: 'mississippi', NC: 'north carolina', SC: 'south carolina', TN: 'tennessee', VA: 'virginia', WV: 'west virginia', PA: 'pennsylvania', NJ: 'new jersey', NY: 'new york', CT: 'connecticut', RI: 'rhode island', MA: 'massachusetts', VT: 'vermont', NH: 'new hampshire', ME: 'maine', MD: 'maryland', DE: 'delaware', DC: 'district of columbia' };
  async function addrInit() {
    if (ADDRIDX) return ADDRIDX;
    try { ADDRIDX = await loadJSON('data/addr/index.json'); } catch (e) { ADDRIDX = {}; }
    try { const c = await caches.open(PACK_CACHE); for (const k of Object.keys(ADDRIDX)) ADDRHAVE[k] = !!(await c.match(addrURL(k))); } catch (e) { }
    return ADDRIDX;
  }
  async function addrLoad(code) {
    if (ADDR[code]) return ADDR[code];
    const c = await caches.open(PACK_CACHE), r = await c.match(addrURL(code)); if (!r) return null;
    const d = await r.json(); d.byKey = new Map(); d.byBase = new Map(); d.cityN = d.cities.map(c => c[0].toLowerCase());
    d.streets.forEach((st, i) => { const k = normSt(st[0]), b = baseKey(k); (d.byKey.get(k) || d.byKey.set(k, []).get(k)).push(i); if (b !== k) (d.byBase.get(b) || d.byBase.set(b, []).get(b)).push(i); });
    return ADDR[code] = d;
  }
  async function addrDownload(code, btn) {
    if (!navigator.onLine) { toast('Connect to the internet to download'); return false; }
    try { const r = await fetch(addrURL(code), { cache: 'reload' }); if (!r.ok) throw 0; const c = await caches.open(PACK_CACHE); await c.put(addrURL(code), r); ADDRHAVE[code] = true; if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); return true; }
    catch (e) { toast('Address download failed — try again with a better connection'); return false; }
  }
  const DIRS = new Set(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']);
  const prettySt = t => t.split(' ').map(w => DIRS.has(w.toLowerCase()) ? w.toUpperCase() : /^\d+(st|nd|rd|th)$/i.test(w) ? w.toLowerCase() : /^(us|sr|cr|fm|i)-?\d/i.test(w) ? w.toUpperCase() : w).join(' ');
  function streetPts(flat) { const o = []; let n = 0, x = 0, y = 0; for (let i = 0; i < flat.length; i += 3) { n += flat[i]; x += flat[i + 1]; y += flat[i + 2]; o.push([n, x / 1e5, y / 1e5]); } return o; }
  function placeNumber(pts, N) { // interpolate a house number along the street (same side of the street when possible)
    const side = pts.filter(p => p[0] % 2 === N % 2), use = side.length >= 2 || (side.length === 1 && side[0][0] === N) ? side : pts;
    if (N < use[0][0] || N > use[use.length - 1][0]) { const e = N < use[0][0] ? use[0] : use[use.length - 1]; return { lon: e[1], lat: e[2], exact: false, off: Math.abs(N - e[0]) }; }
    for (let i = 0; i < use.length; i++) { if (use[i][0] === N) return { lon: use[i][1], lat: use[i][2], exact: true, off: 0 }; if (use[i][0] > N) { const a = use[i - 1], b = use[i], f = (N - a[0]) / (b[0] - a[0]); return { lon: a[1] + (b[1] - a[1]) * f, lat: a[2] + (b[2] - a[2]) * f, exact: true, off: 0 }; } }
    const e = use[use.length - 1]; return { lon: e[1], lat: e[2], exact: true, off: 0 };
  }
  async function geocode(q) {
    await addrInit();
    const have = Object.keys(ADDRHAVE).filter(k => ADDRHAVE[k]); if (!have.length) return { none: true };
    let s = q.trim().replace(/\b(apt|apartment|unit|suite|ste|lot|#)\s*\w+/gi, ' ');
    const m = s.match(/^(\d{1,6})[a-z]?\s+(.+)$/i), N = m ? +m[1] : null, rest = (m ? m[2] : s).toLowerCase();
    const toks = rest.split(/[\s,]+/).filter(Boolean), zip = toks.find(t => /^\d{5}$/.test(t));
    let states = have.filter(c => toks.includes(c.toLowerCase()) || rest.includes(STNAME[c]));
    if (!states.length) states = have;
    const out = [];
    for (const code of states) {
      const d = await addrLoad(code); if (!d) continue;
      for (let j = toks.length; j >= 1; j--) {
        const key = normSt(toks.slice(0, j).join(' ')); if (!key) continue;
        const ids = (d.byKey.get(key) || []).concat(d.byBase.get(key) || []); if (!ids.length) continue;
        const cityWords = toks.slice(j).filter(t => t !== zip && t !== code.toLowerCase() && !STNAME[code].split(' ').includes(t)).join(' ');
        for (const i of ids) {
          const [name, ci, z, flat] = d.streets[i], city = ci >= 0 ? d.cities[ci][0] : '';
          let score = 0; if (zip) { if (z === zip) score += 5; else continue; }
          if (cityWords) { if (city.toLowerCase().includes(cityWords) || cityWords.includes(city.toLowerCase())) score += 4; else score -= 3; }
          const pts = streetPts(flat); let loc;
          if (N != null) { loc = placeNumber(pts, N); if (!loc.exact && loc.off > 200) continue; if (loc.exact) score += 3; }
          else { const mid = pts[pts.length >> 1]; loc = { lon: mid[1], lat: mid[2], exact: true }; }
          out.push({ n: (N != null ? N + ' ' : '') + prettySt(name), s: [city, code + (z ? ' ' + z : '')].filter(Boolean).join(', ') + (N != null && !loc.exact ? ' · near the end of the numbered range' : ''), x: loc.lon, y: loc.lat, z: 17, pin: 1, score, nav: true });
        }
        break;
      }
      if (N == null && toks.length) { const cq = rest.replace(/,.*$/, '').trim(); d.cityN.forEach((c, i) => { if (c.startsWith(cq)) out.push({ n: d.cities[i][0], s: code + ' · town (' + d.cities[i][3].toLocaleString() + ' addresses)', x: d.cities[i][1] / 1e5, y: d.cities[i][2] / 1e5, z: 13, score: c === cq ? 2 : 1 }); }); }
    }
    if (pos) out.forEach(r => r.dist = Geo.dist(pos, { lat: r.y, lon: r.x }));
    out.sort((a, b) => b.score - a.score || (a.dist || 0) - (b.dist || 0));
    return { res: out.slice(0, 25), states };
  }

  function showSearch() {
    openSheet(`<h3 style="margin:0 0 6px">Find an address or place</h3><input class="inp" id="ps" placeholder="123 Main St, Athens GA · a town · coordinates" autocomplete="off" autocapitalize="words" enterkeyhint="search"><div id="pa" class="small" style="margin-top:6px"></div><div id="pr" class="list" style="margin-top:6px"></div>`);
    const inp = $('#ps'); inp.focus(); let tmr = null, seq = 0;
    addrInit().then(() => hint(''));
    function hint(q) {
      const el = $('#pa'); if (!el) return;
      const have = Object.keys(ADDRHAVE).filter(k => ADDRHAVE[k]);
      const here = pos || { lat: S.lat, lon: S.lon }, st = SEIDX && SEIDX.states.find(s => here.lon >= s.bbox[0] && here.lon <= s.bbox[2] && here.lat >= s.bbox[1] && here.lat <= s.bbox[3] && ADDRIDX && ADDRIDX[s.code] && !ADDRHAVE[s.code]);
      el.innerHTML = (have.length ? `🏠 Street addresses saved for ${have.join(', ')}. ` : '🏠 To find street addresses with no signal, save your state’s addresses first. ') + (st ? `<button class="btn" id="paGet" style="min-height:32px">Save ${esc(st.name)} addresses (${(ADDRIDX[st.code].size / 1e6).toFixed(0)} MB)</button>` : '') + ' <a href="#" id="paMore">Other states</a>';
      const b = $('#paGet'); if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'Downloading…'; if (await addrDownload(st.code)) { toast('Saved addresses for ' + st.name); hint(q); run(); } else b.disabled = false; };
      $('#paMore').onclick = e => { e.preventDefault(); showLayers(); };
    }
    async function run() {
      const raw = inp.value.trim(), q = raw.toLowerCase(), out = $('#pr'), my = ++seq; if (q.length < 2 || !MD) { out.innerHTML = ''; return; }
      const c = Geo.parse(raw);
      let res = [];
      if (c) res.push({ n: 'Go to coordinates', s: c.lat.toFixed(5) + ', ' + c.lon.toFixed(5), x: c.lon, y: c.lat, z: 13, pin: 1 });
      const g = !c && q.length >= 3 ? await geocode(raw) : {}; if (my !== seq) return;
      if (g.res) res = res.concat(g.res);
      if (!/^\d+\s/.test(q)) {
        MD.places.forEach(p => { if (p.n.toLowerCase().includes(q.split(',')[0])) res.push({ n: p.n, s: p.s + ' · pop ' + (p.p || 0).toLocaleString(), x: p.x, y: p.y, z: 11 }); });
        MD.countyLabels.forEach(p => { if ((p.n + ' county').toLowerCase().includes(q)) res.push({ n: p.n + ' County', s: p.s, x: p.x, y: p.y, z: 9.5 }); });
        MD.airports.forEach(p => { if ((p.n + ' ' + p.c).toLowerCase().includes(q)) res.push({ n: '✈ ' + p.n, s: p.c, x: p.x, y: p.y, z: 12 }); });
        store.get('waypoints', []).forEach(w => { if (w.name.toLowerCase().includes(q)) res.push({ n: '📌 ' + w.name, s: 'Waypoint', x: w.lon, y: w.lat, z: 14, pin: 1 }); });
      }
      res = res.slice(0, 30); const u = window.FG.units();
      out.innerHTML = res.map((r, i) => `<a class="row" href="#" data-i="${i}"><span class="i">${r.nav ? '🏠' : r.pin ? '📍' : '🗺️'}</span><span class="t"><b>${esc(r.n)}</b><small>${esc(r.s)}${pos ? ' · ' + Geo.fmtDist(Geo.dist(pos, { lat: r.y, lon: r.x }), u) : ''}</small></span><span class="chev">${r.pin ? 'Go ›' : '›'}</span></a>`).join('')
        || (/^\d+\s/.test(q) ? `<p class="muted">${g.none ? 'No street addresses saved yet. Save your state above, then try again.' : `No match in the saved addresses (${(g.states || []).join(', ')}). Try the street name the way it’s signed, add the town or ZIP code, or check the spelling.`}</p>` : '<p class="muted">No match. The built‑in map has ~400 cities and towns, every county and major airports; saved addresses add every town with a street address.</p>');
      out.querySelectorAll('[data-i]').forEach(a => a.onclick = e => { e.preventDefault(); const r = res[+a.dataset.i]; S.lat = r.y; S.lon = r.x; S.z = r.z; follow = false; $('#mLoc').classList.remove('on'); dirty = true; closeSheet(); if (r.pin) chooseNav({ lat: r.y, lon: r.x, name: r.nav ? r.n + (r.s ? ', ' + r.s.split(' · ')[0] : '') : r.s }); });
    }
    inp.oninput = () => { clearTimeout(tmr); tmr = setTimeout(run, 250); };
    inp.onkeydown = e => { if (e.key === 'Enter') { clearTimeout(tmr); run(); } };
  }

})();
