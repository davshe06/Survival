#!/usr/bin/env python3
"""Build data/places.json (hospitals, fire/EMS, police, ranger stations, visitor centers, campgrounds,
trailheads) from the USGS National Structures Dataset (public domain), one state at a time.
Usage: python3 tools/build-places.py <work-dir> <out-file>"""
import json, os, subprocess, sys, zipfile, shapefile
STATES = ['Alabama', 'Arkansas', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Mississippi', 'North_Carolina', 'South_Carolina', 'Tennessee', 'Virginia', 'West_Virginia']
URL = 'https://prd-tnm.s3.amazonaws.com/StagedProducts/Struct/Shape/STRUCT_{}_State_Shape.zip'
KEEP = {80012: 'h', 74026: 'f', 74001: 'f', 74034: 'p', 83033: 'r', 83023: 'r', 82048: 'v', 82008: 'c', 82040: 'c', 82047: 't'}
work, out = sys.argv[1], sys.argv[2]; os.makedirs(work, exist_ok=True); pts = []; seen = set()
for st in STATES:
    z = os.path.join(work, st + '.zip')
    subprocess.run(['curl', '-s', '--retry', '4', '-o', z, URL.format(st)], check=True)
    with zipfile.ZipFile(z) as zf:
        for m in zf.namelist():
            if '/Struct_Point.' in m: zf.extract(m, work)
    r = shapefile.Reader(os.path.join(work, 'Shape', 'Struct_Point'), encoding='utf-8', encodingErrors='replace')
    n = 0
    for sr in r.iterShapeRecords():
        d = sr.record.as_dict(); t = KEEP.get(d['fcode'])
        if not t or not sr.shape.points: continue
        x, y = sr.shape.points[0]; key = (t, round(x, 4), round(y, 4))
        if key in seen: continue
        seen.add(key); n += 1
        name = ' '.join((d['name'] or '').split()).title() if (d['name'] or '').isupper() else ' '.join((d['name'] or '').split())
        addr = ', '.join(v for v in [(d.get('address') or '').strip(), (d.get('city') or '').strip()] if v)
        pts.append([t, name, round(x * 1e5), round(y * 1e5), addr])
    os.remove(z); print(st, n, flush=True)
json.dump({'scale': 1e5, 'types': {'h': 'Hospital', 'f': 'Fire / EMS station', 'p': 'Police / sheriff', 'r': 'Ranger station / park office', 'v': 'Visitor center', 'c': 'Campground / recreation area', 't': 'Trailhead'}, 'pts': pts},
          open(out, 'w'), separators=(',', ':'))
print('total', len(pts), os.path.getsize(out))
