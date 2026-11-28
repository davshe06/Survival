"""Fetch traffic signals (OpenStreetMap highway=traffic_signals, via Overture Maps base/infrastructure)
inside the map's coverage box. Writes "lon,lat" lines.
Usage: python3 tools/fetch-signals.py <out.csv> [release]   (needs pyarrow)"""
import sys, pyarrow.fs as pfs, pyarrow.dataset as ds, pyarrow.compute as pc
OUT = sys.argv[1]; REL = sys.argv[2] if len(sys.argv) > 2 else '2026-11-18.0'
W, E, S, N = -95.2, -66.5, 23.8, 47.8
fs = pfs.S3FileSystem(anonymous=True, region='us-west-2')
d = ds.dataset(f'overturemaps-us-west-2/release/{REL}/theme=base/type=infrastructure/', filesystem=fs, format='parquet')
f = (pc.field('bbox', 'xmin') >= W) & (pc.field('bbox', 'xmax') <= E) & (pc.field('bbox', 'ymin') >= S) & (pc.field('bbox', 'ymax') <= N) & (pc.field('class') == 'traffic_signals')
n = 0
with open(OUT, 'w') as o:
    for b in d.to_batches(columns=['bbox', 'class'], filter=f, batch_size=65536):
        bb = b.column('bbox')
        for x0, x1, y0, y1 in zip(pc.struct_field(bb, 'xmin').to_pylist(), pc.struct_field(bb, 'xmax').to_pylist(), pc.struct_field(bb, 'ymin').to_pylist(), pc.struct_field(bb, 'ymax').to_pylist()):
            o.write(f'{(x0 + x1) / 2:.5f},{(y0 + y1) / 2:.5f}\n'); n += 1
        print(n, flush=True)
print('done', n)
