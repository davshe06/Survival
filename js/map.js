/* Offline Southeast map with GPS, waypoints, navigation, track recording, GPX import/export and optional saved topo tiles. */
(function () {
  'use strict';
  const { route, setTitle, store, esc, toast, view, $ } = window.FG;
  const D2R = Math.PI / 180;
  const TILE_SOURCES = {
    usgs: { name: 'USGS Topo (contours, trails)', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', max: 16, dl: true, attr: 'USGS The National Map' },
    usgsimg: { name: 'USGS Satellite + labels', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', max: 16, dl: true, attr: 'USGS The National Map' },
    osm: { name: 'OpenStreetMap streets (view only)', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', max: 19, dl: false, attr: '© OpenStreetMap contributors' }
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
    if (q.get('lat')) { S.lat = +q.get('lat'); S.lon = +q.get('lon'); S.z = Math.max(S.z, 11); target = { lat: S.lat, lon: S.lon, name: 'Pinned point' }; store.set('navtarget', target); }
    view.innerHTML = `
      <div class="mapwrap">
        <canvas id="map"></canvas>
        <div class="mapui tl"><button class="iconbtn" id="mSearch" title="Find a place">🔍</button><button class="iconbtn" id="mLayers" title="Layers & offline maps">🗂️</button></div>
        <div class="mapui tr"><a class="iconbtn" href="#/" title="Close map">✕</a><button class="iconbtn" id="mWps" title="Waypoints">📌</button><button class="iconbtn ${recording ? 'on' : ''}" id="mRec" title="Record track">⏺</button></div>
        <div class="mapui br"><button class="iconbtn" id="mZin" title="Zoom in">＋</button><button class="iconbtn" id="mZout" title="Zoom out">－</button><button class="iconbtn ${follow ? 'on' : ''}" id="mLoc" title="Center on my GPS location">◎</button></div>
        <div class="scale" id="mScale"></div>
        <div class="mcomp ${compBig ? 'big' : ''}" id="mComp" role="button" tabindex="0" aria-label="Compass. Tap to make it bigger or smaller.">${compassHTML()}</div>
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
      if (pos) { follow = !follow; if (follow) { S.lat = pos.lat; S.lon = pos.lon; if (S.z < 12) S.z = 13; } }
      else { follow = true; toast('Waiting for GPS fix…'); }
      store.set('mapfollow', follow); $('#mLoc').classList.toggle('on', follow); dirty = true;
    };
    $('#mRec').onclick = toggleRec;
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
      const b = Geo.bearing(pos, target); tg.style.display = ''; tg.setAttribute('transform', `rotate(${b} 100 100)`);
      if (heading != null) { const rel = ((b - heading) % 360 + 540) % 360 - 180; sub = Math.abs(rel) < 8 ? '✓ on course' : (rel > 0 ? 'turn right ' : 'turn left ') + Math.abs(Math.round(rel)) + '°'; }
      sub += ' · ' + Geo.fmtDist(Geo.dist(pos, target), window.FG.units());
    } else tg.style.display = 'none';
    $('#cSub').textContent = sub;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * DPR; canvas.height = H * DPR; dirty = true;
  }
  function loop() { raf = requestAnimationFrame(loop); if (dirty) { dirty = false; draw(); } }

  // world size in px at zoom
  const ws = () => 256 * Math.pow(2, S.z);
  function toScreen(X, Y) { const w = ws(); return [(X - mx(S.lon)) * w + W / 2, (Y - my(S.lat)) * w + H / 2]; }
  function toWorld(px, py) { const w = ws(); return [(px - W / 2) / w + mx(S.lon), (py - H / 2) / w + my(S.lat)]; }

  // ---------- drawing ----------
  function pathRing(r, close) {
    const w = ws(), cx = mx(S.lon), cy = my(S.lat), hw = W / 2, hh = H / 2;
    ctx.moveTo((r[0] - cx) * w + hw, (r[1] - cy) * w + hh);
    for (let i = 2; i < r.length; i += 2) ctx.lineTo((r[i] - cx) * w + hw, (r[i + 1] - cy) * w + hh);
    if (close) ctx.closePath();
  }
  function visible(bb, vb) { return !(bb[2] < vb[0] || bb[0] > vb[2] || bb[3] < vb[1] || bb[1] > vb[3]); }
  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = colors.water; ctx.fillRect(0, 0, W, H);
    const [x0, y0] = toWorld(0, 0), [x1, y1] = toWorld(W, H); const vb = [x0, y0, x1, y1];
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
      // states
      ctx.beginPath(); for (const f of MD.states) if (visible(f.bb, vb)) for (const r of f.r) pathRing(r, true);
      ctx.strokeStyle = colors.state; ctx.lineWidth = z > 8 ? 2 : 1.3; ctx.setLineDash(z > 7 ? [8, 4] : []); ctx.stroke(); ctx.setLineDash([]);
      if (!overlay) {
        // roads
        if (z >= 6.5) { ctx.beginPath(); for (const f of MD.roads) if (f.k === 2 && visible(f.bb, vb)) for (const r of f.r) pathRing(r); ctx.strokeStyle = colors.road2; ctx.lineWidth = z > 9 ? 1.6 : 1; ctx.stroke(); }
        if (z >= 4.5) { ctx.beginPath(); for (const f of MD.roads) if (f.k === 1 && visible(f.bb, vb)) for (const r of f.r) pathRing(r); ctx.strokeStyle = colors.road1; ctx.lineWidth = z > 9 ? 3 : z > 7 ? 2 : 1.3; ctx.stroke(); }
      }
    }
    if (store.get('mapgrid', false)) drawGrid(vb);
    drawTrack(); drawNav(); drawWaypoints(); drawMe();
    if (MD) drawLabels(vb);
    drawScale();
  }

  function drawGrid(vb) {
    const z = S.z; const step = z < 6 ? 5 : z < 8 ? 1 : z < 10 ? .5 : z < 12 ? .1 : z < 14 ? .05 : .01;
    const lon0 = Math.floor(ilon(vb[0]) / step) * step, lon1 = ilon(vb[2]); const lat0 = Math.floor(ilat(vb[3]) / step) * step, lat1 = ilat(vb[1]);
    ctx.strokeStyle = colors.grid; ctx.lineWidth = 1; ctx.fillStyle = colors.text; ctx.font = '10px ' + colors.font; ctx.beginPath();
    for (let lo = lon0; lo <= lon1; lo += step) { const [x] = toScreen(mx(lo), 0); ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let la = lat0; la <= lat1; la += step) { const [, y] = toScreen(0, my(la)); ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    for (let lo = lon0; lo <= lon1; lo += step) { const [x] = toScreen(mx(lo), 0); ctx.fillText(lo.toFixed(step < .1 ? 2 : 1) + '°', x + 2, H - 150); }
    for (let la = lat0; la <= lat1; la += step) { const [, y] = toScreen(0, my(la)); ctx.fillText(la.toFixed(step < .1 ? 2 : 1) + '°', 4, y - 2); }
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
    if (z >= 7 && !(tilesOn && tilesFull)) {
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
    const [x, y] = toScreen(mx(pos.lon), my(pos.lat));
    const mPerPx = 156543.03 * Math.cos(pos.lat * D2R) / Math.pow(2, S.z);
    const r = pos.acc / mPerPx;
    if (r > 8) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = colors.me + '22'; ctx.fill(); ctx.strokeStyle = colors.me + '66'; ctx.lineWidth = 1; ctx.stroke(); }
    const h = heading != null ? heading : (pos.hdg != null && !isNaN(pos.hdg) && pos.spd > .5 ? pos.hdg : null);
    if (h != null) { ctx.save(); ctx.translate(x, y); ctx.rotate(h * D2R); ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(9, -6); ctx.lineTo(-9, -6); ctx.closePath(); ctx.fillStyle = colors.me; ctx.globalAlpha = .7; ctx.fill(); ctx.restore(); }
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
    if (pos) { const [x, y] = toScreen(mx(pos.lon), my(pos.lat)); ctx.beginPath(); ctx.setLineDash([8, 6]); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.strokeStyle = colors.nav; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); }
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

  // ---------- raster tiles (optional; cached for offline) ----------
  let tilesFull = false;
  function tileURL(src, z, x, y) { return TILE_SOURCES[src].url.replace('{z}', z).replace('{x}', x).replace('{y}', y); }
  function drawTiles(vb) {
    const src = TILE_SOURCES[tilesOn]; if (!src) return false;
    let tz = Math.min(src.max, Math.max(1, Math.round(S.z))); const n = Math.pow(2, tz);
    const tx0 = Math.floor(vb[0] * n), tx1 = Math.floor(vb[2] * n), ty0 = Math.floor(vb[1] * n), ty1 = Math.floor(vb[3] * n);
    const size = ws() / n; let all = true, any = false;
    for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) {
      const [sx, sy] = toScreen(tx / n, ty / n);
      const img = getTile(tilesOn, tz, tx, ty);
      if (img && img.complete && img.naturalWidth) { ctx.drawImage(img, sx, sy, size + .5, size + .5); any = true; }
      else {
        all = false;
        // fallback: scaled parent tile
        for (let pz = tz - 1, k = 2; pz >= Math.max(1, tz - 5); pz--, k *= 2) {
          const p = tileImgs.get(tilesOn + '/' + pz + '/' + Math.floor(tx / k) + '/' + Math.floor(ty / k));
          if (p && p.complete && p.naturalWidth) { const sw = 256 / k; ctx.drawImage(p, (tx % k) * sw, (ty % k) * sw, sw, sw, sx, sy, size + .5, size + .5); any = true; break; }
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
    const [x0, y0] = toWorld(0, 0), [x1, y1] = toWorld(W, H);
    const list = [];
    for (let z = Math.max(1, Math.floor(S.z) - 4); z <= maxZ; z++) {
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
  function onPos(p) {
    const c = p.coords; pos = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, alt: c.altitude, spd: c.speed, hdg: c.heading, t: p.timestamp };
    store.set('lastpos', { lat: pos.lat, lon: pos.lon });
    gpsErr = null;
    if (firstFix) {
      // First GPS fix after opening the map: jump to where you are and follow you.
      firstFix = false; follow = true; store.set('mapfollow', true); if (S.z < 12) S.z = 13;
      const b = $('#mLoc'); if (b) b.classList.add('on');
    }
    if (follow) { S.lat = pos.lat; S.lon = pos.lon; }
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
      if (target) { const d = Geo.dist(pos, target), b = Geo.bearing(pos, target); const dc = Geo.declination(pos.lat, pos.lon); h += `<div style="margin-top:4px">➜ <b>${esc(target.name)}</b>: ${Geo.fmtDist(d, u)} · ${Math.round(b)}° true (${Math.round((b - dc + 360) % 360)}° mag) ${Geo.cardinal(b)} <a href="#" id="navClear" class="small">clear</a></div>`; }
    } else {
      h += gpsErr && gpsErr.code !== 3 ? '<span class="muted">' + esc(window.FG.gpsErrText(gpsErr)) + '</span>'
        : '<span class="muted">📡 Getting a fix from your phone\'s GPS… go outside with a clear view of the sky (first fix can take up to a minute with no internet). Long‑press the map to drop a waypoint.</span>';
      if (target) h += `<div>➜ ${esc(target.name)} <a href="#" id="navClear" class="small">clear</a></div>`;
    }
    if (recording) h += `<div class="small" style="color:${colors.track}">⏺ Recording track · ${track.length} pts · ${Geo.fmtDist(trackLen(track), u)} — keep app open &amp; screen on</div>`;
    setHud(h);
    const nc = $('#navClear'); if (nc) nc.onclick = e => { e.preventDefault(); target = null; store.set('navtarget', null); dirty = true; updateHud(); };
  }
  function trackLen(t) { let s = 0; for (let i = 1; i < t.length; i++) s += Geo.dist({ lat: t[i - 1][0], lon: t[i - 1][1] }, { lat: t[i][0], lon: t[i][1] }); return s; }

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
    const ptrs = new Map(); let lastDist = 0, lastMid = null, pressT = null, moved = false, lastTap = 0, downAt = null;
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false; downAt = [e.clientX, e.clientY];
      if (ptrs.size === 1) {
        clearTimeout(pressT); pressT = setTimeout(() => { if (!moved && ptrs.size === 1) longPress(e.clientX, e.clientY); }, 650);
      } else { clearTimeout(pressT); const p = [...ptrs.values()]; lastDist = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); lastMid = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2]; }
    });
    canvas.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8) { moved = true; clearTimeout(pressT); }
      if (ptrs.size === 1 && moved) { pan(e.clientX - prev[0], e.clientY - prev[1]); }
      else if (ptrs.size === 2) {
        const p = [...ptrs.values()]; const d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); const mid = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2];
        if (lastMid) pan(mid[0] - lastMid[0], mid[1] - lastMid[1]);
        if (lastDist) zoomAt(mid[0] - canvas.getBoundingClientRect().left, mid[1] - canvas.getBoundingClientRect().top, Math.log2(d / lastDist), true);
        lastDist = d; lastMid = mid;
      }
    });
    const up = e => {
      clearTimeout(pressT); ptrs.delete(e.pointerId); if (ptrs.size < 2) { lastDist = 0; lastMid = null; }
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
    if (follow) { follow = false; store.set('mapfollow', false); const b = $('#mLoc'); if (b) b.classList.remove('on'); }
    const w = ws(); let X = mx(S.lon) - dx / w, Y = my(S.lat) - dy / w; Y = Math.max(0.01, Math.min(.99, Y));
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
  }
  function longPress(cx, cy) {
    const r = canvas.getBoundingClientRect(); const [X, Y] = toWorld(cx - r.left, cy - r.top);
    const p = { lat: ilat(Y), lon: ilon(X) };
    if (navigator.vibrate) navigator.vibrate(30);
    openSheet(`<h3 style="margin:0 0 6px">Dropped pin</h3><div class="mono">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div><div class="mono small muted">${Geo.toMGRS(p.lat, p.lon)}</div>
      ${pos ? `<p>${Geo.fmtDist(Geo.dist(pos, p), window.FG.units())} at ${Math.round(Geo.bearing(pos, p))}° from you</p>` : ''}
      <label class="f">Name</label><input class="inp" id="wpn" value="Waypoint ${store.get('waypoints', []).length + 1}">
      <label class="f">Type</label><select class="inp" id="wpi">${WP_ICONS.map(([i, n]) => `<option value="${i}">${i} ${n}</option>`).join('')}</select>
      <div class="btnrow"><button class="btn pri" id="wps">Save waypoint</button><button class="btn" id="wpg">Navigate here</button><button class="btn" id="wpx">Cancel</button></div>`);
    $('#wps').onclick = () => { const w = store.get('waypoints', []); w.push({ id: Date.now(), name: $('#wpn').value || 'Waypoint', icon: $('#wpi').value, lat: p.lat, lon: p.lon, t: Date.now() }); store.set('waypoints', w); closeSheet(); dirty = true; toast('Waypoint saved'); };
    $('#wpg').onclick = () => { target = { lat: p.lat, lon: p.lon, name: $('#wpn').value || 'Pin' }; store.set('navtarget', target); closeSheet(); dirty = true; updateHud(); };
    $('#wpx').onclick = closeSheet;
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
    $('#wgo').onclick = () => { target = { lat: w.lat, lon: w.lon, name: w.name }; store.set('navtarget', target); closeSheet(); dirty = true; updateHud(); };
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
    document.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => { const x = store.get('tracks', []).find(q => q.id == b.dataset.tf); const p = x.pts[0]; target = { lat: p[0], lon: p[1], name: 'Start of ' + x.name }; store.set('navtarget', target); x.show = true; closeSheet(); dirty = true; updateHud(); toast('Follow the pink line back to the start'); });
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
      <p class="small muted">The built‑in Southeast map (states, counties, cities, highways, rivers, lakes, parks) is always available offline. Detailed topo maps can be added for areas you choose while you have internet.</p>
      <label class="f">Detailed background (needs saved tiles or internet)</label>
      <select class="inp" id="lyr"><option value="">None — built‑in offline map only</option>${Object.entries(TILE_SOURCES).map(([k, v]) => `<option value="${k}" ${tilesOn === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select>
      <label class="chk" style="padding-left:0"><input type="checkbox" id="grd" ${store.get('mapgrid', false) ? 'checked' : ''}><span class="t"><b>Lat/long grid</b></span></label>
      <h3>Save topo maps for offline use</h3>
      <ol class="small"><li>While online, pan/zoom so the area you need fills the screen.</li><li>Choose how much detail and tap Download.</li><li>Repeat for each area (home, bug‑out route, destination).</li></ol>
      <div class="two"><div><label class="f">Map</label><select class="inp" id="dls">${Object.entries(TILE_SOURCES).filter(([, v]) => v.dl).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}</select></div>
      <div><label class="f">Max detail</label><select class="inp" id="dlz">${[[12, '12 — county roads'], [13, '13 — towns'], [14, '14 — trails & contours'], [15, '15 — very detailed'], [16, '16 — max (small areas only)']].map(([z, l]) => `<option value="${z}" ${z === 14 ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
      <p class="small" id="dlEst"></p>
      <div class="btnrow"><button class="btn pri" id="dlGo">Download this area</button><button class="btn" id="dlClear">Delete saved tiles</button></div>
      <p class="small" id="dlProg"></p>
      ${saved.length ? `<h3>Saved areas</h3><div class="list">${saved.map((a, i) => `<a class="row" href="#" data-sa="${i}"><span class="t"><b>${esc(TILE_SOURCES[a.src] ? TILE_SOURCES[a.src].name : a.src)}</b><small>${a.lat.toFixed(3)}, ${a.lon.toFixed(3)} · zoom ≤${a.z} · ${a.n} tiles · ${new Date(a.d).toLocaleDateString()}</small></span><span class="chev">›</span></a>`).join('')}</div>` : ''}
      <p class="small muted">Map tiles: USGS The National Map (public domain). OpenStreetMap tiles are shown only while online / as you view them (© OpenStreetMap contributors). Built‑in map: Natural Earth, U.S. Census.</p>`);
    $('#lyr').onchange = () => { tilesOn = $('#lyr').value; store.set('maptiles', tilesOn); dirty = true; };
    $('#grd').onchange = () => { store.set('mapgrid', $('#grd').checked); dirty = true; };
    const est = () => { const [x0, y0] = toWorld(0, 0), [x1, y1] = toWorld(W, H); let n = 0; for (let z = Math.max(1, Math.floor(S.z) - 4); z <= +$('#dlz').value; z++) { const k = Math.pow(2, z); n += (Math.floor(x1 * k) - Math.floor(x0 * k) + 1) * (Math.floor(y1 * k) - Math.floor(y0 * k) + 1); } $('#dlEst').textContent = `≈ ${n.toLocaleString()} tiles, ~${Math.round(n * 0.025)} MB. ${n > 6000 ? '⚠️ Too many — zoom in first.' : ''}`; };
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
    $('#dlClear').onclick = async () => { if (!confirm('Delete all saved map tiles?')) return; await caches.delete(TILE_CACHE); store.set('savedAreas', []); toast('Deleted'); showLayers(); };
    document.querySelectorAll('[data-sa]').forEach(a => a.onclick = e => { e.preventDefault(); const s = saved[+a.dataset.sa]; S.lat = s.lat; S.lon = s.lon; S.z = s.zoom; tilesOn = s.src; store.set('maptiles', tilesOn); follow = false; dirty = true; closeSheet(); });
  }

  function showSearch() {
    openSheet(`<h3 style="margin:0 0 6px">Find a place</h3><input class="inp" id="ps" placeholder="City, county, or coordinates" autocomplete="off"><div id="pr" class="list" style="margin-top:10px"></div>`);
    const inp = $('#ps'); inp.focus();
    inp.oninput = () => {
      const q = inp.value.trim().toLowerCase(); const out = $('#pr'); if (q.length < 2 || !MD) { out.innerHTML = ''; return; }
      const c = Geo.parse(inp.value);
      let res = [];
      if (c) res.push({ n: 'Go to coordinates', s: c.lat.toFixed(5) + ', ' + c.lon.toFixed(5), x: c.lon, y: c.lat, z: 13, pin: 1 });
      MD.places.forEach(p => { if (p.n.toLowerCase().includes(q)) res.push({ n: p.n, s: p.s + ' · pop ' + (p.p || 0).toLocaleString(), x: p.x, y: p.y, z: 11 }); });
      MD.countyLabels.forEach(p => { if ((p.n + ' county').toLowerCase().includes(q)) res.push({ n: p.n + ' County', s: p.s, x: p.x, y: p.y, z: 9.5 }); });
      MD.airports.forEach(p => { if ((p.n + ' ' + p.c).toLowerCase().includes(q)) res.push({ n: '✈ ' + p.n, s: p.c, x: p.x, y: p.y, z: 12 }); });
      store.get('waypoints', []).forEach(w => { if (w.name.toLowerCase().includes(q)) res.push({ n: '📌 ' + w.name, s: 'Waypoint', x: w.lon, y: w.lat, z: 14 }); });
      res = res.slice(0, 30);
      out.innerHTML = res.map((r, i) => `<a class="row" href="#" data-i="${i}"><span class="t"><b>${esc(r.n)}</b><small>${esc(r.s)}</small></span><span class="chev">›</span></a>`).join('') || '<p class="muted">No match in the built‑in map (it includes ~240 cities/towns, every county, and major airports).</p>';
      out.querySelectorAll('[data-i]').forEach(a => a.onclick = e => { e.preventDefault(); const r = res[+a.dataset.i]; S.lat = r.y; S.lon = r.x; S.z = r.z; follow = false; $('#mLoc').classList.remove('on'); if (r.pin) { target = { lat: r.y, lon: r.x, name: r.s }; store.set('navtarget', target); updateHud(); } dirty = true; closeSheet(); });
    };
  }
})();
