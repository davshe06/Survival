#!/usr/bin/env python3
"""Place US–Canada ports of entry exactly where their road meets the border.
US road data (USGS/TIGER) stops at the international boundary, so each port is snapped to the
end of a road that lies on the Natural Earth US–Canada border line, near the port's listed location.
Usage: python3 tools/build-border.py <ne_10m_admin_0_boundary_lines_land.geojson> <tran-json> [...]
Writes data/border.json."""
import json, math, sys, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
ports = json.load(open(os.path.join(ROOT, 'tools/data/border-ports.json')))
ne = json.load(open(sys.argv[1]))
border = []
for f in ne['features']:
    p = f['properties']
    if {p.get('ADM0_LEFT'), p.get('ADM0_RIGHT')} != {'Canada', 'United States of America'}: continue
    g = f['geometry']; parts = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
    for c in parts:
        border += [(c[i], c[i + 1]) for i in range(len(c) - 1) if max(c[i][0], c[i + 1][0]) > -80 and min(c[i][0], c[i + 1][0]) < -66]
K = 111320.0
def dseg(p, a, b):  # metres from point to segment (local equirectangular)
    cx = math.cos(math.radians(p[1]))
    ax, ay, bx, by, px, py = a[0] * cx, a[1], b[0] * cx, b[1], p[0] * cx, p[1]
    dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
    return math.hypot(ax + t * dx - px, ay + t * dy - py) * K
def dborder(p): return min([dseg(p, a, b) for a, b in border if abs(a[1] - p[1]) < 0.3 and abs(a[0] - p[0]) < 0.6] or [9e9])
lines = []
for fn in sys.argv[2:]:
    d = json.load(open(fn))
    for layer in ('major', 'local', 'fs'):
        for cls, lab, enc in d.get(layer, []):
            x = y = 0; pts = []
            for i in range(0, len(enc), 2): x += enc[i]; y += enc[i + 1]; pts.append((x / 1e5, y / 1e5))
            if max(p[1] for p in pts) < 42.8 and not any(42.8 < p[1] < 43.25 and -79.15 < p[0] < -78.85 for p in pts): continue
            lines.append((layer, lab or '', pts))
def dist(a, lat, lon): return math.hypot((a[0] - lon) * K * math.cos(math.radians(lat)), (a[1] - lat) * K)
out, miss = [], []
for st, name, ca, lat, lon, major, toks in ports:
    best = None
    for layer, lab, pts in lines:
        hit = any(t.lower() in lab.lower() for t in toks)
        R = 6000 if hit else 1500
        for p in pts:
            dd = dist(p, lat, lon)
            if dd > R: continue
            db = dborder(p)
            if db > 3000 and not (lon > -67.18 and dd < 1500): continue  # Natural Earth line stops short of Passamaquoddy Bay
            score = min(db, 3000) + 0.15 * dd - (4000 if hit else 0) - (300 if layer == 'major' else 0)
            if best is None or score < best[0]: best = (score, p, layer, lab, dd, db, hit)
    if not best: miss.append(name); continue
    _, e, layer, lab, dd, db, hit = best
    # keep only pins that are confirmed: on the named road at the border line, a bridge right where listed, or a road at the line close by
    if not ((hit and db <= 1200) or (hit and dd <= 300) or (db <= 500 and dd <= 1500)):
        miss.append(name + f' (best match {dd:.0f} m away, {db:.0f} m from border)'); continue
    out.append({'s': st, 'n': name, 'ca': ca, 'lat': round(e[1], 5), 'lon': round(e[0], 5), 'm': major, 'road': lab})
    print(f'{st} {"✓" if hit else "?"} {name:48s} moved {dd:5.0f} m · {db:5.0f} m from NE line · {layer}:{lab}')
json.dump({'note': 'US–Canada land ports of entry. Locations snapped to USGS/TIGER road ends at the border. Hours change: check cbp.gov.', 'ports': out}, open(os.path.join(ROOT, 'data/border.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'placed;', 'left out:', *miss, sep='\n  ')
