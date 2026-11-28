"""Hospitals, fire/EMS, police, park offices, visitor centres, campgrounds and trailheads for eastern Canadian
provinces from Overture Maps places (CDLA-Permissive-2.0), merged into data/places.json (same format as
build-places.py). Usage: python3 tools/fetch-canada-places.py <ne_10m_admin_1_states_provinces.geojson> [release] [--dry]"""
import sys, json, re, collections
import pyarrow.fs as pfs, pyarrow.dataset as ds, pyarrow.compute as pc
from shapely.geometry import shape, Point
from shapely.prepared import prep

args = [a for a in sys.argv[1:] if not a.startswith('--')]; NE = args[0]; REL = args[1] if len(args) > 1 else '2026-11-18.0'; DRY = '--dry' in sys.argv
PROV = {'ON', 'QC', 'NB', 'NS', 'PE', 'NL'}
W, S, E, N = -95.2, 41.6, -52.5, 62.7
def typ(tax, basic):
    t = (tax or '') + ' ' + (basic or '')
    if re.search(r'animal|veterinar|pet_', t): return None
    if re.search(r'\bhospital|emergency_room|urgent_care', t): return 'h'
    if re.search(r'fire_(department|station)|ambulance|emergency_medical', t): return 'f'
    if re.search(r'police', t): return 'p'
    if re.search(r'ranger_station|park_office|forest_ranger', t): return 'r'
    if re.search(r'visitor_(center|centre|information)|tourist_information', t): return 'v'
    if re.search(r'campground|camp_site|campsite|rv_park', t): return 'c'
    if re.search(r'trailhead|trail_head', t): return 't'
    return None
from shapely.ops import unary_union
AREA = prep(unary_union([shape(f['geometry']) for f in json.load(open(NE))['features'] if f['properties'].get('adm0_a3') == 'CAN' and f['properties'].get('postal') in PROV]))
fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
d = ds.dataset(f'overturemaps-us-west-2/release/{REL}/theme=places/type=place/', filesystem=fs, format='parquet')
flt = (pc.field('bbox', 'xmin') >= W) & (pc.field('bbox', 'xmax') <= E) & (pc.field('bbox', 'ymin') >= S) & (pc.field('bbox', 'ymax') <= N)
pts, cats, seen = [], collections.Counter(), set()
for b in d.to_batches(columns=['names', 'taxonomy', 'basic_category', 'addresses', 'bbox', 'confidence', 'operating_status'], filter=flt, batch_size=100000):
    for nm, tx, bc, ad, bb, cf, op in zip(*(b.column(c).to_pylist() for c in ['names', 'taxonomy', 'basic_category', 'addresses', 'bbox', 'confidence', 'operating_status'])):
        a = (ad or [{}])[0] or {}
        if a.get('country') not in ('CA', None): continue
        if op and op != 'open': continue
        t = typ((tx or {}).get('primary'), bc)
        if not t: continue
        if (cf or 0) < 0.45: continue
        if not AREA.contains(Point(bb['xmin'], bb['ymin'])): continue
        cats[(tx or {}).get('primary')] += 1
        x, y = bb['xmin'], bb['ymin']; key = (t, round(x, 4), round(y, 4))
        if key in seen: continue
        seen.add(key)
        addr = ', '.join(v for v in [(a.get('freeform') or '').strip(), (a.get('locality') or '').strip()] if v)
        pts.append([t, ((nm or {}).get('primary') or '').strip(), round(x * 1e5), round(y * 1e5), addr])
print(len(pts), cats.most_common(40), flush=True)
if not DRY:
    P = json.load(open('data/places.json')); old = {(p[0], round(p[2] / 1e5, 4), round(p[3] / 1e5, 4)) for p in P['pts']}
    P['pts'] += [p for p in pts if (p[0], round(p[2] / 1e5, 4), round(p[3] / 1e5, 4)) not in old]
    json.dump(P, open('data/places.json', 'w'), separators=(',', ':')); print('places now', len(P['pts']))
