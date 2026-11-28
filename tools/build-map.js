// Builds data/map-se.js from public-domain Natural Earth (naturalearthdata.com)
// and US Census-derived us-atlas county boundaries.
// Usage: node tools/build-map.js <download-dir>
// download-dir must contain the ne_10m_*.geojson files and us-atlas/topojson-client packages.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const topojson = require(path.resolve(dir, 'topojson-client-3.1.0/package/dist/topojson-client.min.js'));
const BB = { w: -95.2, e: -52.3, s: 23.8, n: 62.9 }; // south-east US + north-east US + eastern Canada (ON, QC, NB, NS, PE, NL)
const SE_FIPS = { '01': 'AL', '05': 'AR', '12': 'FL', '13': 'GA', '21': 'KY', '22': 'LA', '28': 'MS', '37': 'NC', '45': 'SC', '47': 'TN', '51': 'VA', '54': 'WV', '42': 'PA', '34': 'NJ', '36': 'NY', '09': 'CT', '44': 'RI', '25': 'MA', '50': 'VT', '33': 'NH', '23': 'ME', '24': 'MD', '10': 'DE', '11': 'DC' };
const load = f => JSON.parse(fs.readFileSync(path.join(dir, f)));

function inBB(p) { return p[0] > BB.w && p[0] < BB.e && p[1] > BB.s && p[1] < BB.n; }
// split a line into runs of in-bbox points (with one point of overlap so lines reach the edge)
function clipLine(line) {
  const out = []; let cur = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    if (inBB(p)) {
      if (!cur.length && i > 0) cur.push(line[i - 1]);
      cur.push(p);
    } else if (cur.length) { cur.push(p); out.push(cur); cur = []; }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b]; const dx = x2 - x1, dy = y2 - y1; const L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = pts[i]; let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const ex = x1 + t * dx - x, ey = y1 + t * dy - y; const d = ex * ex + ey * ey;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol * tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// encode ring as delta ints at 1e4 precision (~11 m)
function enc(pts) {
  const o = []; let px = 0, py = 0;
  for (const [x, y] of pts) { const ix = Math.round(x * 1e4), iy = Math.round(y * 1e4); o.push(ix - px, iy - py); px = ix; py = iy; }
  return o;
}
function lines(geom) {
  if (!geom) return [];
  if (geom.type === 'LineString') return [geom.coordinates];
  if (geom.type === 'MultiLineString') return geom.coordinates;
  if (geom.type === 'Polygon') return geom.coordinates;
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat();
  return [];
}
function anyIn(geom) { return lines(geom).some(l => l.some(inBB)); }
function polyLayer(feats, tol, nameFn, minPts = 4) {
  const out = [];
  for (const f of feats) {
    if (!f.geometry || !anyIn(f.geometry)) continue;
    const rings = lines(f.geometry).map(r => dp(r, tol)).filter(r => r.length >= minPts).map(enc);
    if (rings.length) out.push({ n: nameFn ? nameFn(f) : undefined, r: rings });
  }
  return out;
}
function lineLayer(feats, tol, propFn) {
  const out = [];
  for (const f of feats) {
    if (!f.geometry) continue;
    const segs = lines(f.geometry).flatMap(clipLine).map(l => dp(l, tol)).filter(l => l.length > 1).map(enc);
    if (segs.length) out.push(Object.assign({ r: segs }, propFn ? propFn(f) : {}));
  }
  return out;
}

const data = { bbox: BB, built: new Date().toISOString().slice(0, 10) };

// States (land) – US states that touch the box
// US states plus neighbouring Canadian provinces (so border crossings have context)
const st = load('ne_10m_admin_1_states_provinces.geojson').features.filter(f => f.properties.adm0_a3 === 'USA' || f.properties.adm0_a3 === 'CAN');
data.states = polyLayer(st, 0.004, f => f.properties.postal);
const CA_LABEL = { ON: [-84.8, 50.2], QC: [-72.3, 51.2], NB: [-66.4, 46.65], NS: [-63.6, 45.1], PE: [-63.25, 46.38], NL: [-61.5, 53.6] };
data.stateLabels = st.filter(f => Object.values(SE_FIPS).includes(f.properties.postal) || (f.properties.adm0_a3 === 'CAN' && CA_LABEL[f.properties.postal])).map(f => {
    const ca = f.properties.adm0_a3 === 'CAN' && CA_LABEL[f.properties.postal];
    return { n: f.properties.name + (ca ? ' (Canada)' : ''), a: f.properties.postal, x: ca ? ca[0] : +f.properties.longitude.toFixed(3), y: ca ? ca[1] : +f.properties.latitude.toFixed(3) }; });

// Counties from us-atlas topojson
const topo = load('us-atlas-3.0.1/package/counties-10m.json');
const geoms = topo.objects.counties.geometries.filter(g => SE_FIPS[String(g.id).padStart(5, '0').slice(0, 2)]);
const mesh = topojson.mesh(topo, { type: 'GeometryCollection', geometries: geoms }, (a, b) => a !== b);
data.counties = mesh.coordinates.map(l => dp(l, 0.002)).filter(l => l.length > 1).map(enc);
data.countyLabels = geoms.map(g => {
  const f = topojson.feature(topo, g); const pts = lines(f.geometry).flat();
  let x = 0, y = 0; pts.forEach(p => { x += p[0]; y += p[1]; });
  return { n: g.properties.name, s: SE_FIPS[String(g.id).padStart(5, '0').slice(0, 2)], x: +(x / pts.length).toFixed(3), y: +(y / pts.length).toFixed(3) };
});

data.coast = lineLayer(load('ne_10m_coastline.geojson').features, 0.002);
data.lakes = polyLayer([...load('ne_10m_lakes.geojson').features, ...load('ne_10m_lakes_north_america.geojson').features], 0.002, f => f.properties.name || undefined);
const rivNames = f => ({ n: f.properties.name || undefined, k: f.properties.scalerank <= 6 ? 1 : 2 });
data.rivers = lineLayer([...load('ne_10m_rivers_lake_centerlines.geojson').features, ...load('ne_10m_rivers_north_america.geojson').features].filter(f => f.properties.featurecla !== 'Lake Centerline'), 0.002, rivNames);
const roads = load('ne_10m_roads.geojson').features.filter(f => (f.properties.sov_a3 === 'USA' || f.properties.sov_a3 === 'CAN') && f.properties.type !== 'Ferry Route');
data.roads = lineLayer(roads, 0.0015, f => {
  const p = f.properties; const k = p.expressway === 1 || p.type === 'Major Highway' ? 1 : 2;
  let n = p.name ? String(p.name) : undefined;
  if (n && p.prefix) n = p.prefix + '-' + n; else if (n && p.label) n = p.label;
  return { k, n };
});
data.parks = polyLayer(load('ne_10m_parks_and_protected_lands_area.geojson').features, 0.002, f => f.properties.name || f.properties.unit_name);
data.urban = polyLayer(load('ne_10m_urban_areas.geojson').features, 0.003, null);
data.places = load('ne_10m_populated_places.geojson').features.filter(f => (f.properties.ADM0_A3 === 'USA' || f.properties.ADM0_A3 === 'CAN') && inBB([f.properties.LONGITUDE, f.properties.LATITUDE]))
  .map(f => ({ n: f.properties.NAME, s: f.properties.ADM1NAME, p: f.properties.POP_MAX, x: +f.properties.LONGITUDE.toFixed(4), y: +f.properties.LATITUDE.toFixed(4) }))
  .sort((a, b) => b.p - a.p);
data.airports = load('ne_10m_airports.geojson').features.filter(f => f.geometry && inBB(f.geometry.coordinates))
  .map(f => ({ n: f.properties.name, c: f.properties.iata_code, x: +f.geometry.coordinates[0].toFixed(4), y: +f.geometry.coordinates[1].toFixed(4) }));

const out = '/* Generated by tools/build-map.js. Data: Natural Earth (public domain), US Census via us-atlas (ISC). */\nwindow.MAP_DATA=' + JSON.stringify(data) + ';\n';
fs.writeFileSync(path.join(__dirname, '../data/map-se.js'), out);
for (const k of Object.keys(data)) if (Array.isArray(data[k])) console.log(k, data[k].length, (JSON.stringify(data[k]).length / 1024).toFixed(0) + 'KB');
console.log('total', (out.length / 1024 / 1024).toFixed(2), 'MB');
