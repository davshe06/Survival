/* Knot illustrations drawn as SVG.
   A rope is a list of points (smoothed with Catmull-Rom curves). Where the rope crosses itself or another rope,
   the "over" strand is re-drawn on top, so each diagram shows the true over/under structure of the knot.
   window.FG_KNOT(id) returns one or more captioned step diagrams. */
(function () {
  'use strict';
  const ROPE = { a: ['#c98a2e', '#5a3a10'], b: ['#3f8fcf', '#123b5c'], c: ['#d65a4a', '#5c1a12'], p: ['#9b8b6e', '#4d4433'], g: ['#b8bec4', '#5d6369'] };
  // ---------- geometry ----------
  function smooth(pts, n = 10) { // Catmull-Rom → dense polyline
    if (pts.length < 3) return pts.slice();
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let t = 0; t < 1; t += 1 / n) {
        const t2 = t * t, t3 = t2 * t;
        out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
                  (p1[2] || 0) + ((p2[2] || 0) - (p1[2] || 0)) * t]);
      }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  function segX(a, b, c, d) { // segment intersection → [t,u] or null
    const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-9) return null;
    const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
    return t >= 0 && t < 1 && u >= 0 && u < 1 ? [t, u] : null;
  }
  const d = pts => 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
  // ---------- drawing ----------
  // ropes: [{pts, color:'a'|'b', over:'ouou…' (one letter per crossing, in the order this rope meets them), end:'arrow'|'' }]
  // props: extra SVG drawn underneath (posts, rings) — string; top: extra SVG drawn on top (labels, arrows)
  function draw(ropes, props = '', top = '', vb = '0 0 300 220') {
    const W = 8, O = 11;
    const R = ropes.map(r => Object.assign({}, r, { P: r.raw ? r.pts : smooth(r.pts) }));
    // find all crossings between every pair of segments (including the same rope)
    const X = []; // {ri, si, rj, sj, pt}
    for (let a = 0; a < R.length; a++) for (let b = a; b < R.length; b++) {
      const A = R[a].P, B = R[b].P;
      for (let i = 0; i < A.length - 1; i++) for (let j = (a === b ? i + 3 : 0); j < B.length - 1; j++) {
        const hit = segX(A[i], A[i + 1], B[j], B[j + 1]); if (!hit) continue;
        const za = (A[i][2] || 0) + ((A[i + 1][2] || 0) - (A[i][2] || 0)) * hit[0], zb = (B[j][2] || 0) + ((B[j + 1][2] || 0) - (B[j][2] || 0)) * hit[1];
        X.push({ a, i, b, j, za, zb, x: A[i][0] + (A[i + 1][0] - A[i][0]) * hit[0], y: A[i][1] + (A[i + 1][1] - A[i][1]) * hit[0] });
      }
    }
    // assign over/under: each rope lists its crossings in path order
    const visits = R.map(() => []);
    X.forEach((c, k) => { visits[c.a].push([c.i, k, 'a']); visits[c.b].push([c.j, k, 'b']); });
    const overOf = {}; // crossing index → {rope, seg}
    X.forEach((c, k) => { if (Math.abs(c.za - c.zb) > 0.01) overOf[k] = c.za > c.zb ? { r: c.a, s: c.i, u: c.b, z: c.za } : { r: c.b, s: c.j, u: c.a, z: c.zb }; });
    visits.forEach((list, ri) => {
      list.sort((p, q) => p[0] - q[0]);
      const code = R[ri].over || '';
      list.forEach(([seg, k, side], n) => {
        const ch = code[n] || '';
        if (ch === 'o' && !(k in overOf)) overOf[k] = { r: ri, s: seg, u: side === 'a' ? X[k].b : X[k].a };
        if (ch === 'u' && !(k in overOf)) { const c = X[k]; overOf[k] = side === 'a' ? { r: c.b, s: c.j, u: ri } : { r: c.a, s: c.i, u: ri }; }
      });
    });
    let svg = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="knotsvg">${props}`;
    const wid = r => [r.w || W, (r.w || W) + 4], cap = r => r.w ? 'butt' : 'round';
    for (const r of R) { const [f, o] = ROPE[r.color || 'a'], [w1, w2] = wid(r); svg += `<path d="${d(r.P)}" fill="none" stroke="${o}" stroke-width="${w2}" stroke-linecap="${cap(r)}" stroke-linejoin="round"/><path d="${d(r.P)}" fill="none" stroke="${f}" stroke-width="${w1}" stroke-linecap="${cap(r)}" stroke-linejoin="round"/>`; }
    for (const r of R) if (!r.w) svg += `<path d="${d(r.P)}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="5 4"/>`;
    // redraw the over-strand around each crossing
    for (const k of Object.keys(overOf).sort((p, q) => (overOf[p].z || 0) - (overOf[q].z || 0))) {
      const { r, s, u } = overOf[k], P = R[r].P, [f, o] = ROPE[R[r].color || 'a'], [w1, w2] = wid(R[r]), reach = R[r].reach || (R[r].w ? R[r].w : 18);
      let lo = s, hi = s + 1, len = 0;
      while (lo > 0 && len < reach) { len += Math.hypot(P[lo][0] - P[lo - 1][0], P[lo][1] - P[lo - 1][1]); lo--; }
      len = 0; while (hi < P.length - 1 && len < reach) { len += Math.hypot(P[hi + 1][0] - P[hi][0], P[hi + 1][1] - P[hi][1]); hi++; }
      const piece = P.slice(lo, hi + 1);
      const core = R[r].w ? piece : piece.slice(Math.min(2, piece.length - 2), Math.max(piece.length - 2, 2));
      svg += (R[r].w || R[u].w ? '' : `<path d="${d(core)}" fill="none" style="stroke:var(--kbg,#22261d)" stroke-width="${w2 + 7}" stroke-linecap="butt" stroke-linejoin="round"/>`) + `<path d="${d(piece)}" fill="none" stroke="${o}" stroke-width="${w2}" stroke-linecap="butt" stroke-linejoin="round"/><path d="${d(piece)}" fill="none" stroke="${f}" stroke-width="${w1}" stroke-linecap="butt" stroke-linejoin="round"/>` + (R[r].w ? '' : `<path d="${d(piece)}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>`);
    }
    // rope texture: light center line
    // arrows at rope ends that are marked as moving
    for (const r of R) if (r.end === 'arrow') { const P = r.P, a = P[P.length - 3], b = P[P.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); svg += `<path d="M${b[0] + Math.cos(ang) * 10},${b[1] + Math.sin(ang) * 10} l${Math.cos(ang + 2.5) * 12},${Math.sin(ang + 2.5) * 12} l${Math.cos(ang - 2.5) * 12 - Math.cos(ang + 2.5) * 12},${Math.sin(ang - 2.5) * 12 - Math.sin(ang + 2.5) * 12}z" fill="var(--danger, #e2574c)"/>`; }
    return svg + top + '</svg>';
  }
  const txt = (x, y, s, anchor = 'start') => `<text x="${x}" y="${y}" font-size="11" fill="currentColor" text-anchor="${anchor}" font-family="-apple-system,Segoe UI,Roboto,sans-serif">${s}</text>`;
  const post = (x, y1, y2, w = 26) => `<rect x="${x - w / 2}" y="${y1}" width="${w}" height="${y2 - y1}" rx="4" fill="#8a8f7a" stroke="#555a48" stroke-width="2"/>`;
  const hpost = (y, x1, x2, h = 22) => `<rect x="${x1}" y="${y - h / 2}" width="${x2 - x1}" height="${h}" rx="4" fill="#8a8f7a" stroke="#555a48" stroke-width="2"/>`;
  const ring = (x, y, r = 18) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#9aa0a6" stroke-width="6"/>`;
  // primitives: dense point lists with depth z; join them with seg()
  const line = (x1, y1, x2, y2, z1 = 0, z2 = z1, n) => { n = n || Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 4)); return Array.from({ length: n + 1 }, (_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, z1 + (z2 - z1) * i / n]); };
  const arc = (cx, cy, r, a0, a1, z0 = 0, z1 = z0, ry = r) => { const n = Math.max(6, Math.round(Math.abs(a1 - a0) / 6)); return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + ry * Math.sin(a), z0 + (z1 - z0) * i / n]; }); };
  const seg = (...parts) => parts.reduce((o, p) => o.concat(o.length ? p.slice(1) : p), []);
  // a coil wrapping around the straight line (x0,y0)→(x1,y1): front passes get depth zc+1, back passes zc-1
  const coil = (x0, y0, x1, y1, turns, amp, zc = 0, phase = 0) => { const L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L, n = Math.round(turns * 24); return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = phase + t * turns * 2 * Math.PI; return [x0 + (x1 - x0) * t + nx * amp * Math.sin(a), y0 + (y1 - y0) * t + ny * amp * Math.sin(a), zc + Math.cos(a)]; }); };
  // shift a dense path sideways by dd (for doubled rope)
  const offset = (P, dd) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [p[0] - (b[1] - a[1]) / L * dd, p[1] + (b[0] - a[0]) / L * dd, p[2] || 0]; });
  window.FG_KNOT_DRAW = { draw, txt, post, hpost, ring, line, arc, seg, coil, offset, smooth };
  window.FG_KNOTS = {};
  window.FG_KNOT = function (id) {
    const steps = window.FG_KNOTS[id]; if (!steps) return '';
    return `<div class="knotsteps">${steps.map(([cap, svg], i) => `<figure class="knotfig">${svg}<figcaption>${steps.length > 1 ? '<b>' + (i + 1) + '.</b> ' : ''}${cap}</figcaption></figure>`).join('')}</div>`;
  };
})();

/* ---------- knot definitions ---------- */
(function () {
  'use strict';
  const { draw, txt, line, arc, seg, coil, offset, smooth } = window.FG_KNOT_DRAW, K = window.FG_KNOTS;
  const pole = (x1, y1, x2, y2, w, z = 0) => ({ raw: 1, pts: line(x1, y1, x2, y2, z, z), color: 'p', w });
  const ringProp = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#9aa0a6" stroke-width="5"/>`;
  const hook = x => `<path d="M${x} 114 L${x} 175 Q${x} 200 ${x + 25} 200 Q${x + 50} 200 ${x + 52} 172" fill="none" stroke="#9aa0a6" stroke-width="5"/>`;

  K['bowline'] = [['Finished bowline. The working end comes up through the small loop (the "hole"), goes around behind the standing part, and goes back down the hole beside itself.', draw([
    { pts: [[165,0,0],[165,55,0],[163,82,-1],[150,108,-1],[130,126,0],[128,145,0],[152,160,0],[185,162,0],[215,152,0],[228,130,0],[210,108,0],[185,100,0.4],[160,98,1],[130,98,1],[100,104,0],[84,125,0],[82,190,0],[96,212,0],[155,216,0],[210,212,0],[224,192,0],[220,172,0],[212,152,-1],[206,125,0],[201,100,1],[201,62,1],[192,36,0],[165,22,-1],[132,32,0],[114,58,1],[115,98,1],[126,122,1],[142,142,0],[150,162,-1],[151,195,0]] }
  ], '', txt(172, 12, 'standing part') + txt(234, 120, 'hole') + txt(157, 192, 'tail') + txt(28, 180, 'fixed loop'), '0 0 300 225')]];

  K['taut-line'] = [['Two wraps inside the loop (toward the stake), then one wrap outside it. Slide the hitch up to tighten the line.', draw([
    { pts: [[120,0,0],[120,40,0],[120,190,0],[130,206,0],[160,210,0],[183,200,0],[186,170,0],[185,90,0],[180,66,0],[160,64,0],[120,76,1],[102,86,0],[120,94,-1],[138,100,0],[120,108,1],[102,118,0],[120,126,-1],[140,130,0],[156,118,1],[158,60,1],[156,40,1],[140,32,0],[120,38,1],[102,46,0],[120,54,-1],[138,58,0],[158,52,0],[210,46,0],[240,38,0]], end: 'arrow' }
  ], `<circle cx="160" cy="204" r="7" fill="#8a8f7a" stroke="#555a48" stroke-width="2"/>`, txt(126, 12, 'to tent') + txt(194, 212, 'stake') + txt(60, 112, '2 wraps') + txt(60, 50, '1 wrap'))]];

  K['truckers'] = [['The free end goes around the hook and back up through the fixed loop, which works like a pulley. Pull down, pinch, then tie off with two half hitches.', draw([
    { pts: [[140,22,0],[140,40,0],[141,62,0],[152,80,1],[172,92,0],[192,82,0],[194,62,0],[178,50,0],[158,58,0],[144,82,-1],[140,110,0],[140,190,0],[146,203,0],[165,206,0],[177,194,0],[178,130,0],[179,100,-1],[180,75,0],[181,45,1],[195,30,0],[218,38,0],[225,70,0],[225,180,0]], end: 'arrow' }
  ], ringProp(140, 16) + ringProp(160, 210), txt(232, 175, 'pull') + txt(66, 80, 'fixed loop') + txt(66, 20, 'anchor') + txt(176, 216, 'hook'))]];

  K['round-turn'] = [['Two full turns around the rail take the strain. Then two half hitches around the standing part, both made in the same direction.', draw([
    pole(10, 60, 290, 60, 22),
    { pts: [[100,215,0],[100,120,0],[100,85,1],[104,40,1],[111,28,0],[118,40,-1],[121,80,-1],[126,90,0],[130,80,1],[134,40,1],[141,28,0],[148,40,-1],[151,80,-1],[154,100,0],[146,113,1],[100,118,1],[78,127,0],[100,136,-1],[125,132,0],[150,116,1],[170,112,1],[178,135,0],[165,152,1],[100,158,1],[78,167,0],[100,176,-1],[135,170,0],[178,148,1],[205,140,1],[240,140,0]], end: 'arrow' }
  ], '', txt(106, 212, 'standing part'))]];

  K['clove'] = [['Clove hitch: the diagonal rides over both ends. The ends leave in opposite directions, each tucked under the diagonal.', draw([
    pole(150, 8, 150, 212, 34),
    { pts: [[10,112,0],[100,112,0],[150,112,1],[176,112,1],[178,124,0],[150,132,-1],[124,138,0],[126,152,0],[150,124,2],[170,92,2],[180,72,2],[176,58,0],[150,60,-1],[124,70,0],[124,84,0],[150,86,1],[200,86,1],[290,88,0]], end: 'arrow' }
  ], '', txt(12, 104, 'standing part') + txt(288, 78, 'end', 'end'))]];

  K['timber'] = [['Timber hitch: around the log, then twist the end around its own part 3 to 4 times. The pull locks it.', draw([
    pole(15, 165, 285, 165, 34),
    { raw: 1, pts: seg(smooth([[290,40,0],[230,58,0],[175,82,0],[158,108,1],[156,150,1],[156,190,1],[148,204,0],[126,198,-1],[120,165,-1],[120,128,0],[126,108,0],[140,104,1]]), coil(156, 104, 156, 196, 4, 20, 1, -Math.PI / 2).slice(1)) }
  ], '', txt(284, 32, 'standing part', 'end') + txt(20, 140, 'log'))]];

  K['marlinspike'] = [['Marlinspike: the stick passes over both sides of the loop and under the standing part inside it. Pull on the stick to grip.', draw([
    { pts: [[150,5,0],[150,45,0],[156,64,0],[176,72,0],[187,100,-1],[176,128,0],[150,138,0],[124,128,0],[113,100,-1],[122,72,0],[136,64,0],[147,80,0],[150,100,1],[150,140,1],[150,215,0]] },
    pole(60, 100, 240, 100, 12, 0)
  ], '', txt(240, 92, 'stick', 'end'))]];

  K['sheet-bend'] = [['Thin rope comes up through the bight, goes around behind both legs, then tucks under itself. Both short ends finish on the same side.', draw([
    { raw: 1, pts: seg(line(15, 70, 200, 70), arc(200, 110, 40, -90, 90), line(200, 150, 15, 150)) },
    { raw: 1, pts: seg(line(150, 215, 150, 140, -1, -1), line(150, 140, 150, 100, -1, 1), line(150, 100, 150, 40, 1, 1), arc(175, 40, 25, 180, 360, 0, 0), line(200, 40, 200, 175, -1, -1), arc(185, 175, 15, 0, 180, 0, 0), line(170, 175, 170, 135, 1, 1), arc(160, 135, 10, 0, -90, 0, 0), line(160, 125, 95, 125, -1, -1)), color: 'b', end: 'arrow' }
  ], '', txt(18, 62, 'thick rope (bight)') + txt(158, 212, 'thin rope'))]];

  K['square'] = [['Square knot: two interlocking bights. Both ends of each rope leave on the same side. If they don\'t, it\'s a granny knot that will slip.', draw([
    { pts: [[10, 92], [150, 92], [200, 92], [222, 110], [200, 128], [150, 128], [10, 128]], color: 'a', over: 'ou' },
    { pts: [[290, 70], [120, 70], [92, 72], [80, 110], [92, 148], [120, 150], [290, 150]], color: 'b', over: 'ou' }
  ], '', txt(12, 84, 'rope 1') + txt(288, 62, 'rope 2', 'end'))]];

  K['figure8'] = [['Figure-8 stopper: make a loop, take the end behind the standing part, then down through the loop.', draw([
    { raw: 1, pts: seg(line(10, 140, 150, 140), arc(150, 105, 35, 90, -180), line(115, 105, 88, 160, 1, 1), arc(62, 160, 26, 0, 180, -1, -1), line(36, 160, 40, 95, -1, -1), arc(85, 95, 45, 180, 270, 0, 0), line(85, 50, 200, 158, 1, -1)), end: 'arrow' }
  ], '', txt(100, 180, 'standing part'))]];

  const f8 = seg(line(10, 150, 160, 150), arc(160, 108, 42, 90, -180), line(118, 108, 92, 170, 1, 1), arc(62, 170, 30, 0, 180, -1, -1), line(32, 170, 36, 100, -1, -1), arc(86, 100, 50, 180, 270, 0, 0), line(86, 50, 205, 160, 1, -1));
  const E = f8[f8.length - 1], Pp = f8[f8.length - 4], tl = Math.hypot(E[0] - Pp[0], E[1] - Pp[1]), t = [(E[0] - Pp[0]) / tl, (E[1] - Pp[1]) / tl], n = [-t[1], t[0]];
  const at = (a, b) => [E[0] + a * t[0] + b * n[0], E[1] + a * t[1] + b * n[1], 0];
  const bight = smooth([at(0, 7), at(14, 7), at(40, 26), at(66, 0), at(40, -26), at(14, -7), at(0, -7)]);
  K['figure8-loop'] = [['Figure-8 loop: the same figure-8 tied with the rope doubled. The bight left over is your loop.', draw([{ raw: 1, pts: seg(offset(f8, 7), bight, offset(f8, -7).reverse()) }], '', txt(100, 205, 'doubled rope') + txt(240, 238, 'loop', 'end'), '0 0 300 250')]];

  K['butterfly'] = [['Step 1: three wraps around your hand, numbered from the fingertips toward the wrist.', draw([
    pole(150, 20, 150, 200, 54),
    { raw: 1, pts: seg(smooth([[20,40,0],[80,44,0],[118,50,0]]), coil(150, 52, 150, 172, 3, 34, 0, -Math.PI / 2).slice(1), smooth([[116,172,0],[80,178,0],[20,186,0]]).slice(1)) }
  ], '', txt(150, 14, 'fingertips', 'middle') + txt(150, 214, 'wrist', 'middle') + txt(196, 76, '1') + txt(196, 116, '2') + txt(196, 156, '3') + txt(220, 40, 'hand'))]];

  K['clinch'] = [['Improved clinch: through the eye, 5 to 7 wraps, back through the small loop by the eye, then through the big loop.', draw([
    { raw: 1, pts: arc(40, 100, 10, 0, 360, 0, 0, 14), color: 'g' },
    { raw: 1, color: 'b', end: 'arrow', pts: seg(line(290, 100, 60, 100, 0, 0), line(60, 100, 50, 100, 0, 1), line(50, 100, 30, 100, 1, -1), line(30, 100, 16, 100, -1, 0), arc(16, 113, 13, -90, -270, 0, 0), smooth([[16,126,0],[45,128,0],[62,120,0],[72,110,0]]).slice(1), coil(72, 100, 182, 100, 5, 10, 0, Math.PI / 2).slice(1), smooth([[182,110,0],[196,92,0],[188,70,0],[150,66,0],[90,66,0],[64,76,0],[60,100,1],[62,114,0],[72,112,-1],[80,98,-1],[88,82,0],[98,66,1],[110,44,1],[125,28,0]]).slice(1)) }
  ], hook(40), txt(200, 125, 'wraps') + txt(250, 92, 'main line'))]];

  K['palomar'] = [['Palomar step 1: double the line and push the loop through the hook eye. Then tie a loose overhand with the doubled line and pass the hook through the loop.', draw([
    { raw: 1, pts: arc(60, 100, 10, 0, 360, 0, 0, 22), color: 'g' },
    { raw: 1, color: 'b', pts: seg(line(290, 93, 70, 93, 0, 0), line(70, 93, 50, 93, 1, -1), line(50, 93, 30, 93, -1, -1), arc(30, 100, 7, -90, -270, -1, -1), line(30, 107, 50, 107, -1, -1), line(50, 107, 70, 107, -1, 1), line(70, 107, 290, 107, 0, 0)) }
  ], hook(60), txt(200, 84, 'doubled line'))]];

  K['uni'] = [['Double uni: each tag end loops back and wraps 4 to 6 times around both lines inside its loop. Pull the two knots together.', draw([
    { raw: 1, pts: seg(line(10, 93, 250, 93, 0, 0), smooth([[250,93,0],[265,85,0],[262,64,0],[240,58,0],[180,58,0],[168,70,1],[168,100,2],[170,122,0],[184,120,0]]).slice(1), coil(186, 100, 248, 100, 4, 22, 0, Math.PI / 2).slice(1), smooth([[248,122,0],[262,132,0],[280,140,0]]).slice(1)), end: 'arrow' },
    { raw: 1, color: 'b', pts: seg(line(290, 107, 50, 107, 0, 0), smooth([[50,107,0],[35,115,0],[38,136,0],[60,142,0],[120,142,0],[132,130,1],[132,100,2],[130,78,0],[116,80,0]]).slice(1), coil(114, 100, 52, 100, 4, 22, 0, Math.PI / 2).slice(1), smooth([[52,78,0],[38,68,0],[20,60,0]]).slice(1)), end: 'arrow' }
  ], '', txt(12, 84, 'line 1') + txt(288, 125, 'line 2', 'end'))]];

  const sq = []; for (let i = 0; i < 3; i++) { const o = i * 13, Rx = 176 + o, Lx = 124 - o, T = 82 - o, B = 138 + o; sq.push([Rx, B, 0.5], [Rx, 110, 2], [Rx, T, 0.5], [150, T, -1], [Lx, T, 0.5], [Lx, 110, 2], [Lx, B + 6, 0.5], [150, B + 7, -1]); }
  K['square-lashing'] = [['Square lashing: start with a clove hitch on the upright. Wrap over the crossbar and behind the upright 3 to 4 times, frap between the poles, then finish with a clove hitch.', draw([
    pole(150, 5, 150, 215, 26, 0), pole(10, 110, 290, 110, 24, 1),
    { pts: [[90, 200, 0], [150, 160, -1], ...sq, [205, 168, 0], [250, 190, 0]] }
  ], '', txt(20, 96, 'crossbar') + txt(158, 210, 'upright'))]];

  K['shear-lashing'] = [['Shear lashing: wrap both poles loosely 6 to 8 times, then frap between them and tie off.', draw([
    pole(125, 5, 125, 215, 26, 0), pole(175, 5, 175, 215, 26, 0),
    { raw: 1, pts: seg(smooth([[40,40,0],[90,48,0],[150,55,1]]), coil(150, 55, 150, 150, 6, 58, 0, 0).slice(1), smooth([[150,150,1],[147,175,2],[147,110,2],[147,45,2],[150,38,0],[153,45,-2],[153,160,-2],[160,190,0],[230,205,0]]).slice(1)) }
  ], '', txt(160, 28, 'frap'))]];

  const tp = []; for (let i = 0; i < 3; i++) { const y = 55 + i * 34; tp.push([100, y, 1], [150, y + 4, -1], [200, y + 8, 1], [226, y + 14, 0], [200, y + 19, -1], [150, y + 22, 1], [100, y + 26, -1], [76, y + 30, 0]); }
  K['tripod-lashing'] = [['Tripod lashing: weave over and under the three poles in a figure-8. Frap between each pair, tie off, then stand it up and spread the legs.', draw([
    pole(100, 5, 100, 215, 22, 0), pole(150, 5, 150, 215, 22, 0), pole(200, 5, 200, 215, 22, 0),
    { pts: [[30, 40, 0], [70, 52, 0], ...tp, [110, 170, -1], [60, 190, 0]] }
  ])]];
})();
