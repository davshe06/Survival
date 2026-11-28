"""Fetch roads, tracks and trails for eastern Canadian provinces from Overture Maps (transportation/segment,
mostly OpenStreetMap, ODbL) and split them by province (Natural Earth boundaries).
Writes <out>/<XX>.ndjson.gz lines: [class, subclass, name, ref, surface, [[lon,lat],...]].
Usage: python3 tools/fetch-canada-roads.py <ne_10m_admin_1_states_provinces.geojson> <out-dir> [release]"""
import sys, os, json, gzip
import pyarrow.fs as pfs, pyarrow.dataset as ds, pyarrow.compute as pc
from shapely.geometry import shape, Point
from shapely.prepared import prep
from shapely import wkb
NE, OUT = sys.argv[1], sys.argv[2]; REL = sys.argv[3] if len(sys.argv) > 3 else '2026-11-18.0'
PROV = ['ON', 'QC', 'NB', 'NS', 'PE', 'NL']
os.makedirs(OUT, exist_ok=True)
polys = {}
for f in json.load(open(NE))['features']:
    p = f['properties']
    if p.get('adm0_a3') == 'CAN' and p.get('postal') in PROV: polys[p['postal']] = shape(f['geometry']).buffer(0.01)
pp = {k: prep(v) for k, v in polys.items()}
bb = [min(v.bounds[0] for v in polys.values()), min(v.bounds[1] for v in polys.values()), max(v.bounds[2] for v in polys.values()), max(v.bounds[3] for v in polys.values())]
print('box', bb, flush=True)
fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
d = ds.dataset(f'overturemaps-us-west-2/release/{REL}/theme=transportation/type=segment/', filesystem=fs, format='parquet')
KEEP = {'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential', 'living_street', 'unclassified', 'service', 'track', 'path', 'bridleway', 'cycleway', 'footway'}
flt = (pc.field('bbox', 'xmin') >= bb[0]) & (pc.field('bbox', 'xmax') <= bb[2]) & (pc.field('bbox', 'ymin') >= bb[1]) & (pc.field('bbox', 'ymax') <= bb[3]) & (pc.field('subtype') == 'road')
outs = {k: gzip.open(os.path.join(OUT, k + '.ndjson.gz'), 'wt') for k in PROV}; n = {k: 0 for k in PROV}; seen = 0
for b in d.to_batches(columns=['geometry', 'class', 'subclass', 'names', 'routes', 'road_surface', 'bbox'], filter=flt, batch_size=50000):
    cls = b.column('class').to_pylist(); sub = b.column('subclass').to_pylist(); geo = b.column('geometry').to_pylist()
    names = b.column('names').to_pylist(); routes = b.column('routes').to_pylist(); surf = b.column('road_surface').to_pylist()
    bbx = b.column('bbox').to_pylist()
    for i in range(len(cls)):
        seen += 1
        c = cls[i]
        if c not in KEEP: continue
        if c == 'footway' and sub[i] in ('sidewalk', 'crosswalk'): continue
        if c == 'service' and sub[i] in ('driveway', 'parking_aisle', 'drive_through'): continue
        x = (bbx[i]['xmin'] + bbx[i]['xmax']) / 2; y = (bbx[i]['ymin'] + bbx[i]['ymax']) / 2; pt = Point(x, y); prov = None
        for k, p in pp.items():
            if p.contains(pt): prov = k; break
        if not prov: continue
        g = wkb.loads(geo[i]); coords = [[round(a, 6), round(b2, 6)] for a, b2 in g.coords]
        nm = (names[i] or {}).get('primary') or ''
        ref = ''
        for r in routes[i] or []:
            if r.get('ref'): ref = r['ref']; break
        sf = (surf[i] or [{}])[0].get('value') if surf[i] else ''
        outs[prov].write(json.dumps([c, sub[i] or '', nm[:60], ref[:20], sf or '', coords], separators=(',', ':')) + '\n'); n[prov] += 1
    print(seen, n, flush=True)
for f in outs.values(): f.close()
print('done', n)
