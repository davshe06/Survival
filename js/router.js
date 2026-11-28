/* Offline route finder (runs in a Web Worker).
   Builds a road/trail graph from the app's map data around the start and destination, then finds the fastest path with A*.
   Modes: 'car' = roads only (no trails, no 4WD tracks); 'foot' = roads + trails + forest/4WD roads (no interstates). */
'use strict';
const SCALE = 1e5, D2R = Math.PI / 180;
const cache = new Map();           // state code -> decoded {major, fs, trails, local}
let packBase = null;

self.onmessage = async e => {
  const m = e.data;
  try {
    packBase = m.packBase;
    const r = await findRoute(m);
    self.postMessage(Object.assign({ id: m.id, ok: true }, r));
  } catch (err) { self.postMessage({ id: m.id, ok: false, error: String(err && err.message || err) }); }
};

// ---------- data ----------
function decode(list, layer) {
  return list.map(([k, n, c]) => {
    const pts = new Int32Array(c.length); let x = 0, y = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < c.length; i += 2) { x += c[i]; y += c[i + 1]; pts[i] = x; pts[i + 1] = y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { layer, k, n, pts, bb: [x0, y0, x1, y1] };
  });
}
async function loadState(code) {
  let s = cache.get(code);
  if (!s) {
    const r = await fetch(new URL('../data/se/' + code + '.json', self.location.href)); if (!r.ok) throw new Error('Map data for ' + code + ' is not available offline');
    const d = await r.json(); s = { major: decode(d.major, 'major'), fs: decode(d.fs, 'fs'), trails: decode(d.trails, 'trails'), local: null };
    cache.set(code, s);
  }
  if (!s.local && packBase && self.caches) {
    try { const c = await caches.open('fg-packs-v1'); const r = await c.match(packBase + 'local-' + code + '.json'); if (r) s.local = decode((await r.json()).local, 'local'); } catch (e) { }
  }
  return s;
}

// ---------- costs ----------
function speedKmh(mode, f) {
  if (mode === 'car') {
    if (f.layer === 'major') return f.k === 1 ? (/^I-/.test(f.n) ? 105 : 80) : f.k === 3 ? 50 : 65;
    if (f.layer === 'local') return f.k === 1 ? 40 : 25;
    if (f.layer === 'fs') return f.k === 1 ? 30 : 0;   // forest service roads yes, 4WD tracks no
    return 0;                                           // no trails
  }
  // on foot
  if (f.layer === 'major' && (/^I-/.test(f.n) || f.k === 3)) return 0; // no walking on interstates or their ramps
  if (f.layer === 'trails') return 4;
  return 5;
}
// 'back' = back roads: interstates and big US highways cost a lot more, so state routes and county roads win
function prefFactor(pref, f) {
  if (pref !== 'back' || f.layer !== 'major') return 1;
  if (f.k === 3) return 3;                    // ramps (only interstates/freeways have them)
  if (f.k === 1) return /^I-/.test(f.n) ? 4 : 1.8;
  return 1;
}
const OFFROAD_KMH = 2;   // walking cross-country to reach the nearest road/trail
const BUSHWHACK_KMH = 0.6; // long cross-country shortcuts (thick brush, steep terrain) — only when trails don't connect

// ---------- geometry ----------
let LATK = 1; // metres per 1e-5 degree of longitude at this latitude
const metresPerUnitY = 1.11195; // metres per 1e-5 degree latitude
function dist(ax, ay, bx, by) { const dx = (bx - ax) * LATK, dy = (by - ay) * metresPerUnitY; return Math.sqrt(dx * dx + dy * dy); }

// ---------- binary heap ----------
class Heap {
  constructor() { this.k = []; this.v = []; }
  push(key, val) { const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val); while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; } k[i] = key; v[i] = val; }
  pop() { const k = this.k, v = this.v, top = v[0], lk = k.pop(), lv = v.pop(); const n = k.length; if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && k[c + 1] < k[c]) c++; if (k[c] >= lk) break; k[i] = k[c]; v[i] = v[c]; i = c; } k[i] = lk; v[i] = lv; } return top; }
  get size() { return this.k.length; }
}

async function findRoute({ mode, from, to, states, pref, avoid, hdg }) {
  const fx = Math.round(from.lon * SCALE), fy = Math.round(from.lat * SCALE), tx = Math.round(to.lon * SCALE), ty = Math.round(to.lat * SCALE);
  LATK = 1.11195 * Math.cos(((from.lat + to.lat) / 2) * D2R);
  const straight = dist(fx, fy, tx, ty);
  // search area: box around both points, padded
  const pad = Math.max(3000, straight * 0.3);                // metres
  const padX = pad / LATK, padY = pad / metresPerUnitY;
  const box = [Math.min(fx, tx) - padX, Math.min(fy, ty) - padY, Math.max(fx, tx) + padX, Math.max(fy, ty) + padY];
  // for long drives, only use local roads near the two ends
  // (back roads: use the whole local network on medium trips, and a wider area around both ends on long ones)
  const nearEnds = mode === 'car' && straight > (pref === 'back' ? 60000 : 40000) ? (pref === 'back' ? 15000 : 8000) : Infinity;
  const nearBox = (x, y) => [x - nearEnds / LATK, y - nearEnds / metresPerUnitY, x + nearEnds / LATK, y + nearEnds / metresPerUnitY];
  const endBoxes = [nearBox(fx, fy), nearBox(tx, ty)];
  const hit = (bb, b) => !(bb[2] < b[0] || bb[0] > b[2] || bb[3] < b[1] || bb[1] > b[3]);

  // ---- build graph: every vertex is a node, shared coordinates join roads at intersections ----
  const idOf = new Map(); const nx = [], ny = [];
  const eA = [], eB = [], eCost = [], eLen = [], eAttr = [];
  const attrs = []; // [layer, name]
  const node = (x, y) => { const key = (x + 2e7) * 1e7 + y; let id = idOf.get(key); if (id === undefined) { id = nx.length; idOf.set(key, id); nx.push(x); ny.push(y); } return id; };
  let haveLocal = true, lines = 0; const lineEnds = [];
  for (const code of states) {
    const s = await loadState(code);
    if (!s.local) haveLocal = false;
    const layers = [s.major, s.fs, mode === 'foot' ? s.trails : [], s.local || []];
    for (const list of layers) for (const f of list) {
      const sp = speedKmh(mode, f); if (!sp) continue;
      if (!hit(f.bb, box)) continue;
      if (f.layer === 'local' && nearEnds !== Infinity && !endBoxes.some(b => hit(f.bb, b))) continue;
      const ai = attrs.length; attrs.push([f.layer, f.n, f.k, prefFactor(pref, f)]); lines++;
      const p = f.pts; let prev = node(p[0], p[1]);
      if (mode === 'foot' && f.layer === 'trails') lineEnds.push(prev, node(p[p.length - 2], p[p.length - 1]));
      for (let i = 2; i < p.length; i += 2) {
        const cur = node(p[i], p[i + 1]); if (cur === prev) continue;
        const L = dist(p[i - 2], p[i - 1], p[i], p[i + 1]);
        eA.push(prev); eB.push(cur); eLen.push(L); eCost.push(L / (sp / 3.6) * prefFactor(pref, f)); eAttr.push(ai); prev = cur;
      }
    }
  }
  if (!nx.length) throw new Error(mode === 'car' ? 'No roads found in this area' : 'No roads or trails found in this area');
  const N = nx.length, avoided = new Set();
  // detour: stay off a stretch of road (traffic, accident, closure). avoid = flat [x, y, ...] in 1e-5 degrees
  if (avoid && avoid.length) {
    const bad = new Uint8Array(N); let nb = 0;
    for (let i = 0; i < avoid.length; i += 2) { const id = idOf.get((avoid[i] + 2e7) * 1e7 + avoid[i + 1]); if (id !== undefined) { bad[id] = 1; nb++; } }
    if (nb) for (let e = 0; e < eA.length; e++) if (bad[eA[e]] && bad[eB[e]]) { eCost[e] *= 12; avoided.add(e); }
  }

  // ---- spatial grid of nodes (~50 m cells) ----
  const CELL = 45; // units of 1e-5 deg ≈ 50 m (lat)
  const grid = new Map(); const gk = (cx, cy) => cx * 100000 + cy;
  for (let i = 0; i < N; i++) { const k = gk(Math.floor(nx[i] / CELL), Math.floor(ny[i] / CELL)); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(i); }
  const nearest = (x, y, maxM, limit, skip) => {
    const r = Math.ceil(maxM / (CELL * metresPerUnitY)) + 1, cx = Math.floor(x / CELL), cy = Math.floor(y / CELL), out = [];
    for (let gx = cx - r; gx <= cx + r; gx++) for (let gy = cy - r; gy <= cy + r; gy++) { const a = grid.get(gk(gx, gy)); if (!a) continue; for (const i of a) { if (skip && skip(i)) continue; const d = dist(x, y, nx[i], ny[i]); if (d <= maxM) out.push([d, i]); } }
    out.sort((p, q) => p[0] - q[0]); return out.slice(0, limit);
  };

  // ---- degree, then join dead ends to anything close (fixes small gaps, trailheads near roads, state lines) ----
  const deg = new Uint16Array(N); for (let i = 0; i < eA.length; i++) { deg[eA[i]]++; deg[eB[i]]++; }
  const snapM = mode === 'car' ? 20 : 100, offAttr = attrs.length; attrs.push(['off', '', 0]);
  const E0 = eA.length;
  // index edges on the grid so a dead end can join the nearest point ALONG another road/trail (T-junctions)
  const eGrid = new Map();
  if (mode === 'foot') for (let e = 0; e < E0; e++) {
    const a = eA[e], b = eB[e];
    for (let gx = Math.floor(Math.min(nx[a], nx[b]) / CELL); gx <= Math.floor(Math.max(nx[a], nx[b]) / CELL); gx++)
      for (let gy = Math.floor(Math.min(ny[a], ny[b]) / CELL); gy <= Math.floor(Math.max(ny[a], ny[b]) / CELL); gy++) { const k = gk(gx, gy); let l = eGrid.get(k); if (!l) eGrid.set(k, l = []); l.push(e); }
  }
  const nearestEdge = (i, maxM) => {
    const x = nx[i], y = ny[i], cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); let best = null;
    for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const l = eGrid.get(gk(gx, gy)); if (!l) continue;
      for (const e of l) {
        const a = eA[e], b = eB[e]; if (a === i || b === i || eCost[e] === Infinity) continue;
        const ax = nx[a] * LATK, ay = ny[a] * metresPerUnitY, bx = nx[b] * LATK, by = ny[b] * metresPerUnitY, px = x * LATK, py = y * metresPerUnitY;
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; let t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
        const qx = ax + t * dx, qy = ay + t * dy, d = Math.hypot(px - qx, py - qy);
        if (d <= maxM && (!best || d < best.d)) best = { e, t, d };
      }
    }
    return best;
  };
  const addEdge = (a, b, L, cost, attr) => { eA.push(a); eB.push(b); eLen.push(L); eCost.push(cost); eAttr.push(attr); };
  // walking: link trails to any road/trail they cross (crossings often have no shared point in the data)
  if (mode === 'foot') {
    const seen = new Set(), cross = (p1, p2, p3, p4) => {
      const d = (nx[p2] - nx[p1]) * (ny[p4] - ny[p3]) - (ny[p2] - ny[p1]) * (nx[p4] - nx[p3]); if (!d) return false;
      const t = ((nx[p3] - nx[p1]) * (ny[p4] - ny[p3]) - (ny[p3] - ny[p1]) * (nx[p4] - nx[p3])) / d, u = ((nx[p3] - nx[p1]) * (ny[p2] - ny[p1]) - (ny[p3] - ny[p1]) * (nx[p2] - nx[p1])) / d;
      return t > 0 && t < 1 && u > 0 && u < 1;
    };
    for (let e = 0; e < E0; e++) {
      if (attrs[eAttr[e]][0] !== 'trails') continue;
      const a = eA[e], b = eB[e];
      for (let gx = Math.floor(Math.min(nx[a], nx[b]) / CELL); gx <= Math.floor(Math.max(nx[a], nx[b]) / CELL); gx++)
        for (let gy = Math.floor(Math.min(ny[a], ny[b]) / CELL); gy <= Math.floor(Math.max(ny[a], ny[b]) / CELL); gy++) {
          const l = eGrid.get(gk(gx, gy)); if (!l) continue;
          for (const f of l) {
            if (f === e || eAttr[f] === eAttr[e]) continue;
            const c = eA[f], d = eB[f]; if (c === a || c === b || d === a || d === b) continue;
            const key = e < f ? e * 1e7 + f : f * 1e7 + e; if (seen.has(key)) continue; seen.add(key);
            if (!cross(a, b, c, d)) continue;
            let best = null; for (const p of [a, b]) for (const q of [c, d]) { const L = dist(nx[p], ny[p], nx[q], ny[q]); if (!best || L < best[0]) best = [L, p, q]; }
            addEdge(best[1], best[2], best[0], best[0] / (4 / 3.6), offAttr);
          }
        }
    }
  }
  // candidates: dead ends, plus (walking) every trail endpoint — trailheads usually sit near a road or parking lot
  const cand = new Set(); for (let i = 0; i < N; i++) if (deg[i] === 1) cand.add(i); for (const i of lineEnds) cand.add(i);
  for (const i of cand) {
    if (mode === 'car') { for (const [d, j] of nearest(nx[i], ny[i], snapM, 2, j => j === i)) if (d >= 0.5) addEdge(i, j, d, d / (15 / 3.6), offAttr); continue; }
    const hitE = nearestEdge(i, snapM);
    if (!hitE || hitE.d < 0.5) continue;
    const { e, t, d } = hitE, a = eA[e], b = eB[e];
    let j;
    if (t < 0.02 || eLen[e] * t < 3) j = a; else if (t > 0.98 || eLen[e] * (1 - t) < 3) j = b;
    else { // split the edge at the closest point
      j = nx.length; nx.push(Math.round(nx[a] + (nx[b] - nx[a]) * t)); ny.push(Math.round(ny[a] + (ny[b] - ny[a]) * t));
      addEdge(a, j, eLen[e] * t, eCost[e] * t, eAttr[e]); addEdge(j, b, eLen[e] * (1 - t), eCost[e] * (1 - t), eAttr[e]);
      eCost[e] = Infinity; // retire the original edge
    }
    addEdge(i, j, d, d / ((mode === 'car' ? 15 : OFFROAD_KMH + 1) / 3.6), offAttr);
  }
  // ---- start / end: connect to nearby network nodes cross-country ----
  const S = nx.length, T = nx.length + 1; nx.push(fx, tx); ny.push(fy, ty);
  const attach = (x, y) => { for (const lim of [300, 1000, 3000, 8000]) { const c = nearest(x, y, lim, 16); if (c.length) return c; } return []; };
  const sc = attach(fx, fy), tc = attach(tx, ty);
  if (!sc.length) throw new Error('No ' + (mode === 'car' ? 'roads' : 'roads or trails') + ' within 8 km of your start');
  if (!tc.length) throw new Error('No ' + (mode === 'car' ? 'roads' : 'roads or trails') + ' within 8 km of the destination');
  const offKmh = OFFROAD_KMH;
  // driving and rerouting: prefer carrying on the way you're heading over turning round (≈ a minute for a U-turn)
  const behind = j => { if (hdg == null || mode !== 'car') return 0; const b = Math.atan2((nx[j] - fx) * LATK, (ny[j] - fy) * metresPerUnitY) / D2R, d = Math.abs(((b - hdg) % 360 + 540) % 360 - 180); return d > 100 && dist(fx, fy, nx[j], ny[j]) > 12 ? 60 : 0; };
  for (const [d, j] of sc) { eA.push(S); eB.push(j); eLen.push(d); eCost.push(d / (offKmh / 3.6) + behind(j)); eAttr.push(offAttr); }
  for (const [d, j] of tc) { eA.push(j); eB.push(T); eLen.push(d); eCost.push(d / (offKmh / 3.6)); eAttr.push(offAttr); }
  // direct cross-country option for very short trips
  if (straight < 1500) { eA.push(S); eB.push(T); eLen.push(straight); eCost.push(straight / (offKmh / 3.6)); eAttr.push(offAttr); }

  // ---- adjacency (CSR, both directions except start/end links) ----
  const NN = nx.length, M = eA.length; const cnt = new Uint32Array(NN + 1);
  for (let i = 0; i < M; i++) { if (eCost[i] === Infinity) continue; cnt[eA[i] + 1]++; if (eB[i] !== T && eA[i] !== S) cnt[eB[i] + 1]++; }
  for (let i = 0; i < NN; i++) cnt[i + 1] += cnt[i];
  const adjTo = new Int32Array(cnt[NN]), adjE = new Int32Array(cnt[NN]), fill = cnt.slice(0, NN);
  for (let i = 0; i < M; i++) { if (eCost[i] === Infinity) continue; adjTo[fill[eA[i]]] = eB[i]; adjE[fill[eA[i]]++] = i; if (eB[i] !== T && eA[i] !== S) { adjTo[fill[eB[i]]] = eA[i]; adjE[fill[eB[i]]++] = i; } }

  // ---- A* (time-based) ----
  let vmax = 0; for (let i = 0; i < E0; i++) { if (eCost[i] === Infinity) continue; const v = eLen[i] / Math.max(eCost[i], 1e-6); if (v > vmax) vmax = v; } vmax = Math.max(vmax, offKmh / 3.6);
  const g = new Float64Array(NN).fill(Infinity), prevE = new Int32Array(NN).fill(-1), done = new Uint8Array(NN);
  const h = i => dist(nx[i], ny[i], tx, ty) / vmax;
  const heap = new Heap(); g[S] = 0; heap.push(h(S), S); let visited = 0;
  while (heap.size) {
    const u = heap.pop(); if (done[u]) continue; done[u] = 1; visited++;
    if (u === T) break;
    for (let p = cnt[u]; p < cnt[u + 1]; p++) {
      const v = adjTo[p], e = adjE[p], ng = g[u] + eCost[e];
      if (ng < g[v]) { g[v] = ng; prevE[v] = e; heap.push(ng + h(v), v); }
    }
    // walking: you can always strike out cross-country from any reached point if the network doesn't connect
    if (mode === 'foot' && u !== S) { const d = dist(nx[u], ny[u], tx, ty), ng = g[u] + d / (BUSHWHACK_KMH / 3.6); if (ng < g[T]) { g[T] = ng; prevE[T] = -2 - u; heap.push(ng, T); } }
  }
  if (!done[T]) throw new Error(mode === 'car' ? 'No connected road route found. Download local roads for this state (Layers 🗂️), or try Walk.' : 'No route found.');

  // ---- path ----
  const pathN = [T], pathE = []; let cur = T;
  while (cur !== S) {
    let e = prevE[cur];
    if (e <= -2) { const from = -2 - e, d = dist(nx[from], ny[from], nx[cur], ny[cur]); e = eA.length; eA.push(from); eB.push(cur); eLen.push(d); eCost.push(d / (offKmh / 3.6)); eAttr.push(offAttr); }
    pathE.push(e); cur = eA[e] === cur ? eB[e] : eA[e]; pathN.push(cur);
  }
  pathN.reverse(); pathE.reverse();
  // intersections along the route (3+ roads meet), and forks where another road leaves close to our direction.
  // The app turns these into "turn left", "keep right", etc. — so small turns aren't missed when the road name doesn't change.
  const jx = [];
  const brg = (a, b) => Math.atan2((nx[b] - nx[a]) * LATK, (ny[b] - ny[a]) * metresPerUnitY) / D2R;
  const ang = (a, b) => ((a - b) % 360 + 540) % 360 - 180;
  for (let i = 1; i < pathN.length - 1; i++) {
    const u = pathN[i], pv = pathN[i - 1], nxN = pathN[i + 1]; if (u >= S) continue;
    const nb = new Set(); for (let p = cnt[u]; p < cnt[u + 1]; p++) { const v = adjTo[p]; if (v !== u && v < S) nb.add(v); }
    if (nb.size < 3) continue;
    const bo = brg(u, nxN), bi = brg(pv, u); let fork = 0, best = 99;
    for (const w of nb) {
      if (w === pv || w === nxN) continue; const bw = brg(u, w);
      if (Math.abs(ang(bw, bi)) < 80 && Math.abs(ang(bo, bw)) < 50 && Math.abs(ang(bo, bw)) < best) { best = Math.abs(ang(bo, bw)); fork = ang(bo, bw) > 0 ? 2 : 1; } // 1 = keep left, 2 = keep right
    }
    jx.push(i, fork);
  }
  const coords = [], kinds = []; let total = 0, time = 0; const byKind = { road: 0, trail: 0, forest: 0, off: 0 };
  const steps = [];
  for (let i = 0; i < pathN.length; i++) {
    const n = pathN[i]; coords.push(ny[n] / SCALE, nx[n] / SCALE);
    if (i < pathE.length) {
      const e = pathE[i], [layer, rawName, kk] = attrs[eAttr[e]]; if (i === 0 && eA[e] === S) time -= behind(eB[e]); const name = layer === 'major' && kk === 3 ? 'Ramp' : rawName;
      const kind = layer === 'trails' ? 'trail' : layer === 'off' ? 'off' : layer === 'fs' ? 'forest' : 'road';
      kinds.push(kind === 'road' ? 0 : kind === 'trail' ? 1 : kind === 'forest' ? 2 : 3);
      total += eLen[e]; time += eCost[e] / (attrs[eAttr[e]][3] || 1) / (avoided.has(e) ? 12 : 1); byKind[kind] += eLen[e];
      const label = kind === 'off' ? (i === 0 ? (mode === 'car' ? 'Head to the road' : 'Walk cross-country to the route') : i === pathE.length - 1 ? (mode === 'car' ? 'Leave the road for the destination' : 'Walk cross-country to the destination') : 'Cross-country') : (name || (kind === 'trail' ? 'Unnamed trail' : kind === 'forest' ? 'Forest road' : 'Unnamed road'));
      const last = steps[steps.length - 1];
      if (last && last.name === label && last.kind === kind) last.dist += eLen[e]; else steps.push({ name: label, kind, dist: eLen[e], at: coords.length / 2 - 1 });
    }
  }
  // tidy the directions: fold short hops (< 120 m) into the previous step, then join repeats of the same road
  const tidy = [];
  for (const st of steps) {
    const last = tidy[tidy.length - 1];
    if (last && st.kind !== 'off' && last.kind !== 'off' && (st.dist < 120 || st.name === last.name)) { last.dist += st.dist; continue; }
    if (last && last.kind !== 'off' && last.dist < 120 && st.kind === last.kind && tidy.length > 1) { const prev = tidy[tidy.length - 2]; if (prev.kind !== 'off') { prev.dist += last.dist; tidy.pop(); } }
    tidy.push(Object.assign({}, st));
  }
  return { coords, kinds, total, time, byKind, jx, pref: pref || 'fast', avoided: avoided.size, steps: tidy.filter(s => s.dist > 10), straight, haveLocal, nodes: N, visited, lines };
}
