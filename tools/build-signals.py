"""Add traffic signals to the per-state map data (data/se/XX.json -> "sig").
Input: "lon,lat" lines from tools/fetch-signals.py. Signals mapped once per approach at the same
intersection are merged (within ~30 m). Stored as delta-encoded integers in 1e-5 degrees.
Usage: python3 tools/build-signals.py signals.csv"""
import sys, json, re, math
from shapely.geometry import Polygon, Point
from shapely.strtree import STRtree
from shapely.ops import unary_union
src = open('data/map-se.js').read(); MD = json.loads(src[src.index('{'):src.rindex('}') + 1])
codes = [s['code'] for s in json.load(open('data/se/index.json'))['states']]
polys, names = [], []
for f in MD['states']:
    if f['n'] not in codes: continue
    rings = []
    for r in f['r']:
        x = y = 0; pts = []
        for i in range(0, len(r), 2): x += r[i]; y += r[i + 1]; pts.append((x / 1e4, y / 1e4))
        if len(pts) > 2: rings.append(Polygon(pts).buffer(0))
    polys.append(unary_union(rings)); names.append(f['n'])
tree = STRtree(polys)
pts = [tuple(map(float, l.split(','))) for l in open(sys.argv[1]) if l.strip()]
# merge signals at the same intersection
CELL = 0.0004; grid = {}; kept = []
for lon, lat in pts:
    gx, gy = int(lon / CELL), int(lat / CELL); k = math.cos(math.radians(lat)); hit = None
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for j in grid.get((gx + dx, gy + dy), ()):
                a = kept[j]
                if math.hypot((a[0] / a[2] - lon) * k, a[1] / a[2] - lat) * 111320 < 30: hit = j; break
            if hit is not None: break
        if hit is not None: break
    if hit is None: grid.setdefault((gx, gy), []).append(len(kept)); kept.append([lon, lat, 1])
    else: a = kept[hit]; a[0] += lon; a[1] += lat; a[2] += 1
by = {c: [] for c in codes}; miss = 0
for sx, sy, n in kept:
    p = Point(sx / n, sy / n); c = None
    for i in tree.query(p):
        if polys[i].contains(p): c = names[i]; break
    if c is None:
        i = tree.query_nearest(p, max_distance=0.03)
        if len(i): c = names[i[0]]
    if c is None: miss += 1; continue
    by[c].append((round(sx / n * 1e5), round(sy / n * 1e5)))
print(len(pts), 'points ->', len(kept), 'intersections;', miss, 'outside the covered states')
for c in codes:
    a = sorted(by[c], key=lambda p: (p[1] // 2000, p[0]))
    flat, px, py = [], 0, 0
    for x, y in a: flat += [x - px, y - py]; px, py = x, y
    fn = f'data/se/{c}.json'; d = json.load(open(fn)); d['sig'] = flat
    json.dump(d, open(fn, 'w'), separators=(',', ':'))
    print(c, len(a))
