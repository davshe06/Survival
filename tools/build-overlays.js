// Packages the per-state outputs of build-tran.py and the GNIS water/landmark points into app data files.
// Usage: node tools/build-overlays.js <tran-out-dir> <gnis.json>
//   data/se/index.json      state list with bounding boxes and pack sizes
//   data/se/<XX>.json        highways + secondary roads, forest/4WD roads, trails  (bundled, offline)
//   data/packs/local-<XX>.json  every local road in the state (downloaded on demand from the Layers menu)
//   data/water.json          springs, falls, lakes, reservoirs, summits, gaps (USGS GNIS)
const fs = require('fs'), path = require('path');
const [tranDir, gnisFile] = process.argv.slice(2);
const root = path.join(__dirname, '..');
const NAMES = { AL: 'Alabama', AR: 'Arkansas', FL: 'Florida', GA: 'Georgia', KY: 'Kentucky', LA: 'Louisiana', MS: 'Mississippi', NC: 'North Carolina', SC: 'South Carolina', TN: 'Tennessee', VA: 'Virginia', WV: 'West Virginia' };
fs.mkdirSync(path.join(root, 'data/se'), { recursive: true });
fs.mkdirSync(path.join(root, 'data/packs'), { recursive: true });

function bboxOf(lines, bb) {
  for (const [, , c] of lines) { let x = 0, y = 0; for (let i = 0; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; } }
  return bb;
}
const index = { scale: 1e5, built: new Date().toISOString().slice(0, 10), states: [] };
for (const f of fs.readdirSync(tranDir).filter(f => /^[A-Z]{2}\.json$/.test(f)).sort()) {
  const code = f.slice(0, 2); const d = JSON.parse(fs.readFileSync(path.join(tranDir, f)));
  const base = JSON.stringify({ major: d.major, fs: d.fs, trails: d.trails });
  const local = JSON.stringify({ local: d.local });
  fs.writeFileSync(path.join(root, 'data/se', code + '.json'), base);
  fs.writeFileSync(path.join(root, 'data/packs', 'local-' + code + '.json'), local);
  const bb = bboxOf(d.local, bboxOf(d.major, [Infinity, Infinity, -Infinity, -Infinity])).map(v => v / 1e5);
  index.states.push({ code, name: NAMES[code], bbox: bb.map(v => +v.toFixed(3)), base: base.length, local: local.length,
    counts: { major: d.major.length, fs: d.fs.length, trails: d.trails.length, local: d.local.length } });
  console.log(code, (base.length / 1e6).toFixed(2) + ' MB base', (local.length / 1e6).toFixed(1) + ' MB local');
}
fs.writeFileSync(path.join(root, 'data/se/index.json'), JSON.stringify(index));
if (gnisFile) {
  const pts = JSON.parse(fs.readFileSync(gnisFile));
  fs.writeFileSync(path.join(root, 'data/water.json'), JSON.stringify({ scale: 1e4, types: { s: 'Spring', w: 'Well', f: 'Falls', l: 'Lake', r: 'Reservoir', m: 'Summit', g: 'Gap' }, pts }));
  console.log('water/landmark points', pts.length);
}
