"""Turn the Overture road segments from fetch-canada-roads.py into the same per-province layer files that
build-tran.py makes for U.S. states (then package them with build-overlays.js).
  motorway → highway (Hwy-<ref>), trunk → highway (Rte-<ref>), primary/secondary → secondary highway,
  *_link → ramp, tertiary/residential/unclassified → local road, unpaved unclassified → forest/gravel road,
  track → 4WD track, path/bridleway → trail. Vertices shared by two or more roads (intersections) are never
  simplified away, so the router can join roads there.
Usage: python3 tools/build-canada-tran.py <ndjson-dir> <out-dir> [XX ...]"""
import sys, os, json, gzip, collections
sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
bt = import_module('build-tran')  # dp_keep, chain, enc, SCALE
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CODES = sys.argv[3:] or ['ON', 'QC', 'NB', 'NS', 'PE', 'NL']
UNPAVED = {'unpaved', 'gravel', 'dirt', 'compacted', 'fine_gravel', 'ground', 'earth', 'mud', 'sand', 'grass'}
def key_of(c, sub, nm, ref, sf):
    if sub == 'link' and c in ('motorway', 'trunk', 'primary', 'secondary', 'tertiary'): return ('major', 3, '')
    if c == 'motorway': return ('major', 1, ('Hwy-' + ref) if ref else nm)
    if c == 'trunk': return ('major', 1, ('Rte-' + ref) if ref else nm)
    if c in ('primary', 'secondary'): return ('major', 2, ('Rte-' + ref) if ref else nm)
    if c == 'track': return ('fs', 2, nm)
    if c == 'unclassified' and sf in UNPAVED: return ('fs', 1, nm)
    if c in ('tertiary', 'residential', 'living_street', 'unclassified'): return ('local', 1, nm)
    if c == 'service': return ('local', 2, nm)
    if c in ('path', 'bridleway'): return ('trails', 't', nm)
    return None
for code in CODES:
    groups = collections.defaultdict(list); occ = collections.Counter(); stats = collections.Counter()
    with gzip.open(os.path.join(SRC, code + '.ndjson.gz'), 'rt') as fh:
        for line in fh:
            c, sub, nm, ref, sf, pts = json.loads(line)
            k = key_of(c, sub, nm[:40], ref.replace(' ', '')[:12], sf)
            if not k: continue
            stats[k[0]] += 1; groups[k].append([tuple(p) for p in pts])
            for i, (x, y) in enumerate(pts):  # count every vertex: shared vertices are intersections
                occ[(round(x * bt.SCALE), round(y * bt.SCALE))] += 2 if (i == 0 or i == len(pts) - 1) else 1
    junctions = {k for k, n in occ.items() if n >= 2}  # shared by two roads (or a road end) — keep for routing
    del occ
    tol = {'major': 0.00012, 'fs': 0.00006, 'trails': 0.00004, 'local': 0.00008}
    out = {'major': [], 'fs': [], 'trails': [], 'local': []}
    for (layer, cls, lab), lines in groups.items():
        for l in bt.chain(lines):
            s = bt.dp_keep(l, tol[layer], junctions)
            if len(s) > 1: out[layer].append([cls, lab, bt.enc(s)])
    with open(os.path.join(OUT, code + '.json'), 'w') as fh: json.dump(out, fh, separators=(',', ':'))
    print(code, dict(stats), {k: len(v) for k, v in out.items()}, flush=True)
