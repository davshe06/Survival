#!/usr/bin/env python3
"""Step 1 of the offline address index: pull U.S. addresses (Overture Maps 'addresses' theme, whose U.S. data comes
from the USDOT National Address Database, public domain) for the mapped states, reading only the Parquet row groups
that overlap the map, and write one TSV per state: zip, city, street, number, lon*1e5, lat*1e5.
Usage: python3 tools/fetch-addresses.py <out-dir> [release]   (needs pyarrow)"""
import pyarrow.parquet as pq, pyarrow.fs as pfs, pyarrow.compute as pc, sys, os, re, json, threading, concurrent.futures as cf
OUT = sys.argv[1]; REL = sys.argv[2] if len(sys.argv) > 2 else '2026-11-18.0'
STATES = set('AL AR FL GA KY LA MS NC SC TN VA WV PA NJ NY CT RI MA VT NH ME MD DE DC'.split())
W, E, S, N = -95.0, -66.8, 24.4, 47.6
fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
base = f'overturemaps-us-west-2/release/{REL}/theme=addresses/type=address/'
files = [f.path for f in fs.get_file_info(pfs.FileSelector(base)) if f.path.endswith('.parquet')]
jobs = []
for p in files:
    md = pq.ParquetFile(p, filesystem=fs).metadata
    names = [md.row_group(0).column(i).path_in_schema for i in range(md.num_columns)]
    ix, iy, ic = names.index('bbox.xmin'), names.index('bbox.ymin'), names.index('country')
    for g in range(md.num_row_groups):
        rg = md.row_group(g); sx = rg.column(ix).statistics; sy = rg.column(iy).statistics; sc = rg.column(ic).statistics
        if not (sx and sy) or sx.max < W or sx.min > E or sy.max < S or sy.min > N: continue
        if sc and sc.has_min_max and (sc.max < 'US' or sc.min > 'US'): continue
        jobs.append((p, g))
os.makedirs(OUT, exist_ok=True)
locks = {s: threading.Lock() for s in STATES}; outs = {s: open(os.path.join(OUT, s + '.tsv'), 'a', encoding='utf-8') for s in STATES}
num = re.compile(r'^(\d{1,6})')
done = [0, 0]
def work(job):
    p, g = job
    for attempt in range(4):
        try:
            t = pq.ParquetFile(p, filesystem=fs).read_row_group(g, columns=['country', 'number', 'street', 'postcode', 'postal_city', 'address_levels', 'bbox']); break
        except Exception as e:
            if attempt == 3: print('fail', p, g, e, flush=True); return
    t = t.filter(pc.equal(t['country'], 'US'))
    buf = {}
    for nb, st, zp, city, lv, bb in zip(*(t[c].to_pylist() for c in ['number', 'street', 'postcode', 'postal_city', 'address_levels', 'bbox'])):
        s = lv[0]['value'] if lv else None
        if s not in STATES or not st or not nb: continue
        m = num.match(nb.strip())
        if not m: continue
        x, y = bb['xmin'], bb['ymin']
        buf.setdefault(s, []).append(f"{(zp or '')[:5]}\t{(city or '').replace(chr(9), ' ')}\t{st.replace(chr(9), ' ')}\t{m.group(1)}\t{round(x * 1e5)}\t{round(y * 1e5)}\n")
    for s, lines in buf.items():
        with locks[s]: outs[s].writelines(lines)
    done[0] += 1; done[1] += sum(len(v) for v in buf.values())
    if done[0] % 100 == 0: print(f'{done[0]}/{len(jobs)} row groups, {done[1]:,} addresses', flush=True)
with cf.ThreadPoolExecutor(12) as ex: list(ex.map(work, jobs))
for f in outs.values(): f.close()
print('done', done[1], flush=True)
