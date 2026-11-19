#!/usr/bin/env python3
"""Build road / trail / forest-road layers for the Field Guide map from the USGS National
Transportation Dataset (public domain; roads from U.S. Census TIGER, trails from the
National Digital Trails dataset incl. U.S. Forest Service and NPS trails).

Usage: python3 tools/build-tran.py <work-dir> <out-dir> [STATE ...]
Downloads TRAN_<State>_State_Shape.zip from the USGS TNM staged-products bucket one state
at a time, writes <out-dir>/<XX>.json with simplified, delta-encoded polylines, and deletes
the download to save disk.
"""
import json, os, re, subprocess, sys, zipfile, collections
import shapefile  # pip install pyshp

STATES = {'AL': 'Alabama', 'AR': 'Arkansas', 'FL': 'Florida', 'GA': 'Georgia', 'KY': 'Kentucky', 'LA': 'Louisiana',
          'MS': 'Mississippi', 'NC': 'North_Carolina', 'SC': 'South_Carolina', 'TN': 'Tennessee', 'VA': 'Virginia', 'WV': 'West_Virginia',
          'PA': 'Pennsylvania', 'NJ': 'New_Jersey', 'NY': 'New_York'}
URL = 'https://prd-tnm.s3.amazonaws.com/StagedProducts/Tran/Shape/TRAN_{}_State_Shape.zip'
SCALE = 1e5  # 1e-5 degree ≈ 1.1 m
FS_NAME = re.compile(r'^(forest|fs|fr|nfsr|usfs|fdr)\s*(rd|road|route)?\s*[-#]?\s*\d|forest\s*service|national\s*forest|\b(fs|fsr|nfsr|usfs)\s*(rd|road)?\s*\d', re.I)

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; stack = [(0, len(pts) - 1)]; t2 = tol * tol
    while stack:
        a, b = stack.pop(); x1, y1 = pts[a]; x2, y2 = pts[b]; dx, dy = x2 - x1, y2 - y1; L = dx * dx + dy * dy; mx, idx = 0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            t = ((x - x1) * dx + (y - y1) * dy) / L if L else 0; t = 0 if t < 0 else 1 if t > 1 else t
            ex, ey = x1 + t * dx - x, y1 + t * dy - y; d = ex * ex + ey * ey
            if d > mx: mx, idx = d, i
        if mx > t2 and idx > 0: keep[idx] = True; stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(pts, keep) if k]

def dp_keep(pts, tol, junctions):
    """Simplify but never drop a vertex that is a road/trail junction (needed for routing)."""
    forced = [i for i, (x, y) in enumerate(pts) if i == 0 or i == len(pts) - 1 or (round(x * SCALE), round(y * SCALE)) in junctions]
    out = []
    for a, b in zip(forced, forced[1:]):
        seg = dp(pts[a:b + 1], tol)
        out += seg if not out else seg[1:]
    return out or pts[:1]

def enc(pts):
    out, px, py = [], 0, 0
    for x, y in pts:
        ix, iy = round(x * SCALE), round(y * SCALE); out += [ix - px, iy - py]; px, py = ix, iy
    return out

def chain(lines):
    """Join polylines that share endpoints (TIGER segments are short), greatly reducing size."""
    lines = [l for l in lines if len(l) > 1]
    key = lambda p: (round(p[0], 6), round(p[1], 6))
    ends = collections.defaultdict(list)
    for i, l in enumerate(lines): ends[key(l[0])].append(i); ends[key(l[-1])].append(i)
    used = [False] * len(lines); out = []
    for i in range(len(lines)):
        if used[i]: continue
        used[i] = True; cur = list(lines[i])
        for direction in (0, 1):
            while True:
                k = key(cur[-1]); nxt = None
                for j in ends[k]:
                    if not used[j]: nxt = j; break
                if nxt is None: break
                used[nxt] = True; l = lines[nxt]
                cur += (l[1:] if key(l[0]) == k else l[::-1][1:])
            cur.reverse()
        out.append(cur)
    return out

def parts(shape):
    pts, idx = shape.points, list(shape.parts) + [len(shape.points)]
    return [pts[idx[i]:idx[i + 1]] for i in range(len(idx) - 1)]

def road_label(d):
    if d.get('interstate'): return 'I-' + d['interstate']
    if d.get('us_route'): return 'US-' + d['us_route']
    if d.get('state_rout'): return 'SR-' + d['state_rout']
    return d.get('name') or ''

def process(code, work, outdir):
    name = STATES[code]; z = os.path.join(work, code + '.zip')
    if not os.path.exists(z):
        subprocess.run(['curl', '-s', '--retry', '4', '--max-time', '1800', '-o', z, URL.format(name)], check=True)
    ex = os.path.join(work, code); os.makedirs(ex, exist_ok=True)
    with zipfile.ZipFile(z) as zf:
        for m in zf.namelist():
            if re.search(r'Trans_(RoadSegment_\d+|RoadSegment|TrailSegment)\.(shp|shx|dbf)$', m): zf.extract(m, ex)
    groups = collections.defaultdict(list)  # (layer, cls, label) -> [polyline]
    stats = collections.Counter()
    for root, _, files in os.walk(ex):
        for f in sorted(files):
            if not f.endswith('.shp'): continue
            r = shapefile.Reader(os.path.join(root, f[:-4]), encoding='utf-8', encodingErrors='replace')
            trail = 'Trail' in f
            for sr in r.iterShapeRecords():
                d = sr.record.as_dict()
                if trail:
                    # keep foot-usable trails; mark motorized (OHV) ones separately
                    hike = d.get('hikerpedes') != 'N'
                    ohv = d.get('ohvover50i') == 'Y' or d.get('ohvisorund') == 'Y' or d.get('motorcycle') == 'Y'
                    lab = (d.get('maplabel') or d.get('name') or '').strip()
                    if d.get('nationaltr'): lab = lab or d['nationaltr']
                    cls = 'o' if (ohv and not hike) else 't'
                    key = ('trails', cls, lab[:40]); stats['trail'] += 1
                else:
                    m = d.get('mtfcc_code'); nm = (d.get('name') or '').strip()
                    fs = bool(FS_NAME.search(nm)) or bool(d.get('federal_la'))
                    if m == 'S1100' or d.get('interstate') or d.get('us_route'): key = ('major', 1, road_label(d)); stats['primary'] += 1
                    elif m == 'S1200' or d.get('state_rout'): key = ('major', 2, road_label(d)); stats['secondary'] += 1
                    elif m == 'S1500' or (fs and m in ('S1400', 'S1740')): key = ('fs', 1 if fs else 2, nm[:40]); stats['forest/4wd'] += 1
                    elif m in ('S1400', 'S1740'): key = ('local', 1 if m == 'S1400' else 2, nm[:40]); stats['local'] += 1
                    elif m == 'S1630': key = ('major', 3, ''); stats['ramp'] += 1  # on/off ramps: interstates only connect through these
                    else: continue  # ramps, service drives, walkways, etc.
                for p in parts(sr.shape): groups[key].append([(x, y) for x, y in p])
    tol = {'major': 0.00012, 'fs': 0.00006, 'trails': 0.00004, 'local': 0.00008}
    # junctions: points where 3+ segment ends meet (TIGER splits roads at every intersection)
    ends = collections.Counter()
    for lines in groups.values():
        for l in lines:
            for x, y in (l[0], l[-1]): ends[(round(x * SCALE), round(y * SCALE))] += 1
    junctions = {k for k, c in ends.items() if c >= 3}
    out = {'major': [], 'fs': [], 'trails': [], 'local': []}
    for (layer, cls, lab), lines in groups.items():
        for l in chain(lines):
            s = dp_keep(l, tol[layer], junctions)
            if len(s) > 1: out[layer].append([cls, lab, enc(s)])
    with open(os.path.join(outdir, code + '.json'), 'w') as fh: json.dump(out, fh, separators=(',', ':'))
    subprocess.run(['rm', '-rf', ex, z])
    print(code, dict(stats), {k: len(v) for k, v in out.items()}, flush=True)

if __name__ == '__main__':
    work, outdir = sys.argv[1], sys.argv[2]; os.makedirs(work, exist_ok=True); os.makedirs(outdir, exist_ok=True)
    for c in (sys.argv[3:] or STATES): process(c, work, outdir)
