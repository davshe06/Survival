#!/usr/bin/env python3
"""Step 2 of the offline address index: turn the per-state TSVs from fetch-addresses.py into compact
data/addr/XX.json packs the app downloads on demand. For each street (per ZIP code), house numbers are kept
only where needed to place any number within ~35 m by interpolation, which shrinks the data ~10x.
Usage: python3 tools/build-addresses.py <tsv-dir> [XX ...]"""
import sys, os, json, math, glob, collections
import pandas as pd
ROOT = os.path.join(os.path.dirname(__file__), '..'); OUT = os.path.join(ROOT, 'data/addr'); os.makedirs(OUT, exist_ok=True)
TOL = 40.0
CA = {'ON', 'QC', 'NB', 'NS', 'PE', 'NL'}
def tidy(s):
    w = str(s).split()
    # fix ALL-CAPS words but keep ordinals (1st) and route numbers as they are
    return ' '.join(x.capitalize() if (x.isupper() and len(x) > 1 and not any(ch.isdigit() for ch in x)) or x.islower() and not any(ch.isdigit() for ch in x) else x for x in w)
def simplify(pts, k):  # pts: [(num, x, y)] sorted by num; keep points needed for <TOL m interpolation error
    n = len(pts)
    if n <= 2: return pts
    keep = [False] * n; keep[0] = keep[-1] = True; stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b - a < 2: continue
        na, xa, ya = pts[a]; nb, xb, yb = pts[b]; span = nb - na; worst, wi = 0, -1
        for i in range(a + 1, b):
            ni, xi, yi = pts[i]; f = (ni - na) / span if span else 0
            d = math.hypot((xa + (xb - xa) * f - xi) * k, (ya + (yb - ya) * f - yi) * 1.1132)
            if d > worst: worst, wi = d, i
        if worst > TOL: keep[wi] = True; stack += [(a, wi), (wi, b)]
    return [p for p, kk in zip(pts, keep) if kk]
def build(code, path):
    df = pd.read_csv(path, sep='\t', header=None, names=['z', 'c', 's', 'n', 'x', 'y'], dtype={'z': str, 'c': str, 's': str}, keep_default_na=False, quoting=3)
    if not len(df): print(code, 'no addresses'); return None
    ca = code in CA
    if ca:  # Canada: postal codes are per block — group streets by the 3-character area code (FSA); keep French lower-case words
        df['z'] = df['z'].str[:3].str.upper()
        fix = lambda v: ' '.join(x.capitalize() if x.isupper() and len(x) > 1 and not any(ch.isdigit() for ch in x) else x for x in str(v).split())
        df['s'] = df['s'].map(fix); df['c'] = df['c'].map(fix)
    else: df['s'] = df['s'].map(tidy); df['c'] = df['c'].map(tidy)
    df = df.drop_duplicates(['z', 's', 'n']).sort_values(['z', 's', 'n'])
    k = 1.1132 * math.cos(math.radians(df['y'].median() / 1e5))
    cities = {}; ccount = collections.Counter(); csum = collections.defaultdict(lambda: [0, 0])
    for c, x, y in zip(df['c'], df['x'], df['y']):
        if c: ccount[c] += 1; s = csum[c]; s[0] += x; s[1] += y
    clist = [[c, round(csum[c][0] / ccount[c]), round(csum[c][1] / ccount[c]), ccount[c]] for c in sorted(ccount, key=lambda c: -ccount[c])]
    cidx = {c[0]: i for i, c in enumerate(clist)}
    streets = []; kept = 0
    for (z, s), g in df.groupby(['z', 's'], sort=False):
        city = g['c'].mode().iat[0] if (g['c'] != '').any() else ''
        allp = list(zip(g['n'].tolist(), g['x'].tolist(), g['y'].tolist()))
        # odd and even numbers are on opposite sides of the street: simplify each side on its own
        pts = sorted(simplify([p for p in allp if p[0] % 2], k) + simplify([p for p in allp if not p[0] % 2], k)); kept += len(pts)
        flat = []; pn = px = py = 0
        for n, x, y in pts: flat += [n - pn, x - px, y - py]; pn, px, py = n, x, y
        streets.append([s, cidx.get(city, -1), z, flat])
    out = {'v': 1, 'state': code, 'n': int(len(df)), 'cities': clist, 'streets': streets,
           'note': ('Canadian addresses from the Statistics Canada Open Database of Addresses via Overture Maps (Open Government Licence – Canada).' if ca else 'U.S. addresses from the USDOT National Address Database via Overture Maps (public domain).') + ' Positions interpolated between kept house numbers.'}
    fn = os.path.join(OUT, code + '.json'); json.dump(out, open(fn, 'w'), separators=(',', ':'), ensure_ascii=False)
    print(code, f'{len(df):,} addresses → {kept:,} points, {len(streets):,} streets, {os.path.getsize(fn) / 1e6:.1f} MB', flush=True)
    return {'code': code, 'n': int(len(df)), 'size': os.path.getsize(fn)}
d = sys.argv[1]; codes = sys.argv[2:] or sorted(os.path.basename(f)[:-4] for f in glob.glob(d + '/*.tsv'))
idx_file = os.path.join(OUT, 'index.json'); idx = json.load(open(idx_file)) if os.path.exists(idx_file) else {}
for c in codes:
    r = build(c, os.path.join(d, c + '.tsv'))
    if r: idx[c] = {'n': r['n'], 'size': r['size']}
    else: idx.pop(c, None)
json.dump(idx, open(idx_file, 'w'), separators=(',', ':'))
