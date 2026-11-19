/* Drawn diagrams for the Fishing, Hunting & Trapping section (inline SVG, theme-aware, offline). */
(function () {
  const C = { wood: '#9b7b55', woodD: '#5f4a30', hide: '#a7865f', hideD: '#6e5638', vit: '#e2574c', water: '#3f8fcf', waterL: 'rgba(63,143,207,.22)', green: '#7fae5a', rope: '#c98a2e', stone: '#8d9096', ground: '#7a6a4c' };
  const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 10.5}" fill="${o.fill || 'currentColor'}" text-anchor="${o.a || 'start'}" font-weight="${o.w || 500}" font-family="-apple-system,Segoe UI,Roboto,sans-serif">${s}</text>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || 'currentColor'}" stroke-width="${o.w || 1.5}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ''}/>`;
  const pl = (pts, o = {}) => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="${o.f || 'none'}" stroke="${o.c || 'currentColor'}" stroke-width="${o.w || 1.5}" stroke-linecap="round" stroke-linejoin="round"${o.d ? ` stroke-dasharray="${o.d}"` : ''}/>`;
  const pa = (d, o = {}) => `<path d="${d}" fill="${o.f || 'none'}" stroke="${o.c || 'none'}" stroke-width="${o.w || 1.5}" stroke-linecap="round" stroke-linejoin="round"${o.d ? ` stroke-dasharray="${o.d}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
  const el = (cx, cy, rx, ry, o = {}) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${o.f || 'none'}" stroke="${o.c || 'none'}" stroke-width="${o.w || 1.5}"${o.d ? ` stroke-dasharray="${o.d}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}${o.r ? ` transform="rotate(${o.r} ${cx} ${cy})"` : ''}/>`;
  const arrow = (x1, y1, x2, y2, c = 'currentColor', w = 1.8) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 7; return ln(x1, y1, x2, y2, { c, w }) + `<path d="M${x2},${y2} L${x2 - h * Math.cos(a - .45)},${y2 - h * Math.sin(a - .45)} L${x2 - h * Math.cos(a + .45)},${y2 - h * Math.sin(a + .45)}Z" fill="${c}"/>`; };
  const svg = (inner, vb = '0 0 320 200') => `<svg class="knotsvg hfig" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  const fig = (s, cap) => `<figure class="knotfig">${s}<figcaption>${cap}</figcaption></figure>`;
  const figs = (...f) => `<div class="knotsteps">${f.join('')}</div>`;

  // ---------- animals ----------
  const deerBody = `<path d="M96,74 C88,58 80,44 74,34 L62,30 C52,30 44,36 40,42 C44,48 54,50 64,48 L84,82 C92,104 104,118 124,124 L126,182 L134,182 L136,126 C160,130 190,130 214,124 L222,182 L230,182 L230,118 C246,110 254,96 254,82 C262,80 266,74 262,68 C254,70 250,72 248,72 C236,62 210,58 180,60 C150,62 118,62 96,74 Z" fill="${C.hide}" stroke="${C.hideD}" stroke-width="1.5"/>
    ${ln(138, 124, 146, 182, { c: C.hideD, w: 7 })}${ln(212, 124, 206, 182, { c: C.hideD, w: 7 })}${el(70, 24, 5, 10, { f: C.hide, c: C.hideD, r: -20 })}${el(80, 26, 5, 10, { f: C.hide, c: C.hideD, r: 15 })}${el(52, 38, 2, 2, { f: '#222' })}`;
  const deerVitals = svg(`${deerBody}${el(160, 100, 22, 18, { f: C.vit, op: .45 })}${el(156, 112, 7, 6, { f: C.vit, op: .9 })}
    ${ln(146, 68, 146, 128, { c: '#fff', w: 1, d: '3 3' })}${el(160, 102, 5, 5, { c: '#fff', w: 2 })}${ln(160, 94, 160, 110, { c: '#fff', w: 1.2 })}${ln(152, 102, 168, 102, { c: '#fff', w: 1.2 })}
    ${arrow(96, 160, 154, 108, C.vit)}${t(8, 172, 'Aim here: just behind the front leg,')}${t(8, 185, 'a third of the way up from the belly')}${t(226, 40, 'heart + lungs', { fill: C.vit, w: 700 })}${arrow(240, 44, 172, 92, C.vit, 1.2)}`);
  const hogVitals = svg(`<path d="M84,84 C70,84 54,90 42,98 L32,100 C28,104 28,112 32,116 L44,118 C56,124 74,128 92,128 L96,182 L106,182 L112,134 C140,138 180,138 210,132 L216,182 L226,182 L232,124 C248,116 256,102 254,88 C262,86 266,82 264,78 C256,80 252,80 250,78 C240,64 214,58 180,58 C140,58 106,66 84,84 Z" fill="#5d4f43" stroke="#2f2721" stroke-width="1.5"/>
    ${el(31, 108, 3, 7, { f: '#3b322a' })}${pa('M72,78 L80,62 L88,80 Z', { f: '#5d4f43', c: '#2f2721' })}${el(56, 98, 2, 2, { f: '#eee' })}${pa('M44,116 C40,124 46,128 50,120', { c: '#eee', w: 2 })}
    ${el(108, 112, 18, 15, { f: C.vit, op: .55 })}${el(108, 120, 6, 5, { f: C.vit })}${el(110, 110, 5, 5, { c: '#fff', w: 2 })}
    ${t(8, 172, 'Hog vitals sit lower and farther forward:')}${t(8, 185, 'aim ON the crease of the front leg, low')}${t(150, 40, 'tough shoulder "shield"', { fill: '#e8b25a', w: 700 })}${arrow(170, 44, 128, 86, '#e8b25a', 1.2)}`);
  const fieldDress = svg(`${deerBody}${pl([[226, 124], [200, 128], [170, 129], [140, 126], [118, 118]], { c: '#fff', w: 2.2, d: '6 4' })}${el(250, 88, 7, 7, { c: '#fff', w: 2, d: '3 2' })}
    ${t(160, 196, '① belly cut, pelvis → breastbone: skin & belly wall only', { a: 'middle', size: 9.5 })}${arrow(160, 186, 170, 134, '#fff', 1.2)}${t(316, 22, '② cut around the vent', { a: 'end' })}${arrow(290, 28, 254, 80, 'currentColor', 1.2)}${t(150, 18, '③ reach in, cut the windpipe', { a: 'end' })}${arrow(130, 24, 110, 90, 'currentColor', 1.2)}`);
  const cuts = svg(`<defs><clipPath id="dclip"><path d="M96,74 C88,58 80,44 74,34 L62,30 C52,30 44,36 40,42 C44,48 54,50 64,48 L84,82 C92,104 104,118 124,124 L126,182 L134,182 L136,126 C160,130 190,130 214,124 L222,182 L230,182 L230,118 C246,110 254,96 254,82 C262,80 266,74 262,68 C254,70 250,72 248,72 C236,62 210,58 180,60 C150,62 118,62 96,74 Z"/></clipPath></defs>
    ${deerBody}<g clip-path="url(#dclip)" opacity=".8"><rect x="30" y="0" width="76" height="200" fill="#b98757"/><rect x="100" y="60" width="58" height="80" fill="#c46a4a"/><rect x="158" y="86" width="52" height="60" fill="#a8574a"/><rect x="100" y="56" width="140" height="22" fill="#d9a441"/><rect x="204" y="78" width="70" height="70" fill="#8e4a3c"/><rect x="100" y="140" width="160" height="60" fill="#6e5638"/></g>
    ${el(204, 86, 24, 4, { c: '#fff', w: 1.6, d: '4 3' })}
    ${t(54, 70, 'neck', { a: 'middle', fill: '#fff', w: 700 })}${t(128, 104, 'shoulder', { a: 'middle', fill: '#fff', w: 700 })}${t(184, 118, 'ribs', { a: 'middle', fill: '#fff', w: 700 })}${t(170, 72, 'backstrap (loin)', { a: 'middle', fill: '#222', w: 700 })}${t(240, 124, 'ham', { a: 'middle', fill: '#fff', w: 700 })}${t(180, 170, 'shanks', { a: 'middle', fill: '#fff', w: 700 })}
    ${t(206, 98, 'tenderloins (inside)', { a: 'middle', fill: '#fff', size: 8.5 })}${t(8, 198, 'Tenderloins & backstraps are best. Slow-cook or grind the rest.', { size: 9.5 })}`, '0 0 320 202');

  // ---------- traps ----------
  const snare = svg(`${ln(0, 170, 320, 170, { c: C.ground, w: 3 })}${pa('M30,170 C40,150 60,146 70,170 Z', { f: C.green, op: .6 })}${pa('M250,170 C262,140 292,146 300,170 Z', { f: C.green, op: .6 })}
    ${ln(110, 176, 110, 96, { c: C.wood, w: 7 })}${ln(210, 176, 210, 96, { c: C.wood, w: 7 })}${ln(100, 100, 222, 100, { c: C.wood, w: 6 })}
    ${ln(160, 100, 160, 116, { c: C.rope, w: 2 })}${el(160, 134, 18, 18, { c: C.rope, w: 2.4 })}${el(160, 116, 2.5, 2.5, { f: C.rope })}
    ${ln(136, 170, 136, 128, { c: C.woodD, w: 2.5 })}${ln(184, 170, 184, 128, { c: C.woodD, w: 2.5 })}
    ${ln(240, 152, 240, 170, { w: 1 })}${ln(236, 152, 244, 152, { w: 1 })}${ln(236, 170, 244, 170, { w: 1 })}${t(246, 164, '3–4 in')}${ln(178, 152, 240, 152, { w: .8, d: '2 2' })}
    ${t(160, 36, 'fist-size loop (rabbit), hung across the trail', { a: 'middle' })}${arrow(160, 42, 160, 112, 'currentColor', 1.2)}${t(70, 90, 'anchor', { a: 'end' })}${arrow(72, 92, 104, 104, 'currentColor', 1)}${t(20, 196, 'Twigs either side guide the animal into the loop.', { size: 9.5 })}`, '0 0 320 202');
  const poleSnare = svg(`${ln(0, 182, 320, 182, { c: C.ground, w: 3 })}<rect x="236" y="0" width="44" height="182" fill="${C.wood}" stroke="${C.woodD}"/>
    ${ln(40, 180, 240, 48, { c: '#b89466', w: 8 })}${[0.22, 0.42, 0.62, 0.82].map(f => { const x = 40 + 200 * f, y = 180 - 132 * f; return ln(x, y - 4, x, y - 10, { c: C.rope, w: 1.5 }) + el(x, y - 19, 9, 9, { c: C.rope, w: 2 }); }).join('')}
    ${t(60, 60, 'loops 2–3 in wide,')}${t(60, 72, 'about 1 in above the pole')}${t(150, 196, 'Squirrels use the pole as a shortcut up the tree.', { a: 'middle', size: 9.5 })}`, '0 0 320 202');
  const fig4 = svg(`${ln(0, 182, 320, 182, { c: C.ground, w: 3 })}
    <path d="M200,52 L222,40 L318,150 L316,182 L284,182 L190,64 Z" fill="${C.stone}" stroke="#55585c" stroke-width="1.5"/>
    ${ln(150, 182, 150, 104, { c: C.wood, w: 7 })}${ln(100, 152, 202, 56, { c: '#b89466', w: 6 })}${ln(100, 150, 252, 150, { c: C.woodD, w: 6 })}${el(256, 150, 7, 5, { f: '#d65a4a' })}
    ${el(150, 104, 3, 3, { f: '#fff' })}${el(150, 150, 3, 3, { f: '#fff' })}${el(101, 151, 3, 3, { f: '#fff' })}
    ${t(156, 128, 'upright')}${t(76, 108, 'diagonal', { a: 'middle' })}${t(170, 168, 'bait stick', { a: 'middle' })}${t(272, 140, 'heavy rock', { a: 'middle', fill: '#222', w: 700 })}${t(240, 170, 'bait', { a: 'middle' })}
    ${t(8, 18, 'Figure-4 deadfall: the three sticks lock each other at the')}${t(8, 30, 'white notches. Touching the bait drops the rock.')}`, '0 0 320 200');
  const bottle = svg(`${pa('M40,70 L230,70 C250,70 262,84 262,100 C262,116 250,130 230,130 L40,130 Z', { f: C.waterL, c: 'currentColor' })}
    ${pa('M40,70 L84,92 L84,108 L40,130', { c: 'currentColor', w: 1.5 })}${pa('M40,70 L40,130', { c: 'currentColor', w: 1, d: '3 3' })}
    ${el(220, 100, 12, 8, { f: '#d65a4a' })}${pa('M16,100 C24,94 30,94 34,100 C30,106 24,106 16,100 Z M8,100 L16,96 L16,104 Z', { f: C.stone })}${arrow(36, 100, 70, 100)}
    ${[[120, 85], [150, 115], [180, 90], [200, 118]].map(([x, y]) => el(x, y, 2, 2, { f: 'currentColor' })).join('')}
    ${t(150, 40, 'Cut the top off a 2-liter bottle, turn it around and push it in.', { a: 'middle' })}${t(150, 54, 'Punch small holes so it sinks. Bait inside.', { a: 'middle' })}${t(220, 150, 'bait', { a: 'middle' })}${t(92, 150, 'funnel: easy in, hard out', { a: 'middle' })}${t(150, 182, 'Minnows & crawfish. Weigh down with a rock, tie a cord to it.', { a: 'middle', size: 9.5 })}`);
  const weir = svg(`<rect x="0" y="40" width="320" height="120" fill="${C.waterL}"/>${ln(0, 40, 320, 40, { c: C.ground, w: 3 })}${ln(0, 160, 320, 160, { c: C.ground, w: 3 })}
    ${[[30, 44], [60, 62], [90, 80], [118, 94]].concat([[30, 156], [60, 138], [90, 120], [118, 106]]).map(([x, y]) => el(x, y, 8, 6, { f: C.stone })).join('')}
    ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2 + .3; return Math.abs(Math.cos(a) + 1) < .12 ? '' : el(180 + 46 * Math.cos(a), 100 + 34 * Math.sin(a), 8, 6, { f: C.stone }); }).join('')}
    ${arrow(300, 25, 230, 25, C.water)}${t(296, 18, 'current', { a: 'end', fill: C.water })}${arrow(20, 100, 80, 100, 'currentColor', 1.2)}${t(10, 184, 'Fish moving upstream follow the stone wings into the pen', { size: 9.5 })}${t(10, 197, 'and rarely find the gap out. Illegal in most waters.', { size: 9.5 })}${t(180, 104, 'pen', { a: 'middle', w: 700 })}`, '0 0 320 202');
  const hogTrap = svg(`${ln(0, 186, 320, 186, { c: C.ground, w: 2 })}${(() => { let s = ''; for (let i = 0; i < 16; i++) { const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2; if (i === 0) continue; s += ln(160 + 110 * Math.cos(a0), 100 + 70 * Math.sin(a0), 160 + 110 * Math.cos(a1), 100 + 70 * Math.sin(a1), { c: '#8d9096', w: 5 }); } return s; })()}
    ${ln(270, 100, 262, 74, { c: '#e8b25a', w: 6 })}${t(290, 66, 'gate', { a: 'middle', fill: '#e8b25a', w: 700 })}
    ${[[140, 104], [150, 96], [160, 108], [172, 100], [158, 92]].map(([x, y]) => el(x, y, 4, 3, { f: '#d9a441' })).join('')}${t(160, 128, 'shelled corn', { a: 'middle' })}
    ${ln(160, 100, 238, 120, { c: '#fff', w: 1, d: '3 3' })}${el(238, 120, 3, 3, { f: '#fff' })}${t(232, 140, 'root-stick trigger', { a: 'middle', size: 9.5 })}
    ${t(160, 14, 'Corral trap (top view): 5-ft hog panels in a circle on T-posts', { a: 'middle' })}${t(160, 199, 'Bait with the gate open for days; set it when the whole group comes in.', { a: 'middle', size: 9.2 })}`, '0 0 320 202');

  // ---------- fishing ----------
  const rigs = svg(`<rect x="0" y="50" width="360" height="160" fill="${C.waterL}"/>${ln(0, 50, 360, 50, { c: C.water, w: 2 })}${pa('M0,196 C80,188 160,204 360,194 L360,210 L0,210 Z', { f: C.ground, op: .6 })}
    ${ln(60, 0, 60, 46, { w: 1 })}${el(60, 50, 7, 9, { f: '#e2574c', c: '#fff', w: 1.5 })}${ln(60, 59, 60, 120, { w: 1 })}${el(60, 104, 3, 3, { f: C.stone })}${pa('M60,120 L60,130 C60,138 52,138 52,130', { c: 'currentColor', w: 1.6 })}${pa('M54,128 C46,126 48,118 56,122', { c: '#c06a6a', w: 3 })}
    ${t(60, 152, 'Bobber rig', { a: 'middle', w: 700 })}${t(60, 164, 'bream, crappie', { a: 'middle', size: 9.5 })}${t(72, 106, 'split shot', { size: 9 })}
    ${ln(180, 0, 180, 186, { w: 1 })}${el(180, 186, 6, 8, { f: C.stone })}${el(194, 190, 3, 3, { f: '#999' })}${ln(186, 188, 248, 192, { w: 1 })}${pa('M248,192 L256,192 C262,192 262,184 256,184', { c: 'currentColor', w: 1.6 })}${el(258, 188, 5, 3, { f: '#d65a4a' })}
    ${t(172, 152, 'Bottom rig', { a: 'end', w: 700 })}${t(172, 164, 'catfish', { a: 'end', size: 9.5 })}${t(196, 178, 'sinker, swivel, 18-in leader', { size: 9 })}
    ${pa('M360,8 C330,12 300,20 280,30', { c: C.wood, w: 6 })}${ln(300, 22, 300, 80, { w: 1 })}${pa('M300,80 L300,88 C300,96 292,96 292,88', { c: 'currentColor', w: 1.6 })}${el(296, 92, 5, 3, { f: '#d65a4a' })}
    ${t(300, 120, 'Limb line', { a: 'middle', w: 700 })}${t(300, 132, 'bait just under', { a: 'middle', size: 9 })}${t(300, 143, 'the surface', { a: 'middle', size: 9 })}`, '0 0 360 210');
  const lines = svg(`<rect x="0" y="40" width="360" height="150" fill="${C.waterL}"/>${ln(0, 40, 360, 40, { c: C.water, w: 2 })}
    ${ln(20, 30, 20, 190, { c: C.wood, w: 6 })}${ln(340, 30, 340, 190, { c: C.wood, w: 6 })}${pa('M20,70 C120,90 240,90 340,70', { c: C.rope, w: 2 })}
    ${[70, 110, 150, 190, 230, 270].map(x => { const y = 70 + 20 * Math.sin(Math.PI * (x - 20) / 320) * 1.0 + 0; return ln(x, y, x, y + 40, { w: 1.2 }) + pa(`M${x},${y + 40} L${x},${y + 46} C${x},${y + 52} ${x - 6},${y + 52} ${x - 6},${y + 46}`, { c: 'currentColor', w: 1.4 }); }).join('')}
    ${t(180, 160, 'Trotline: main line across the water, short drop lines', { a: 'middle' })}${t(180, 172, '2–3 ft apart. Tag it with your name if your state requires.', { a: 'middle', size: 9.5 })}
    ${t(180, 24, 'check every few hours; untended lines are illegal in most states', { a: 'middle', size: 9.5 })}`, '0 0 360 192');
  const holds = svg(`<path d="M0,40 C80,30 140,70 200,60 C260,50 300,30 360,40 L360,150 C300,140 260,170 200,160 C140,150 80,120 0,140 Z" fill="${C.waterL}" stroke="${C.water}" stroke-width="2"/>
    ${[50, 62, 74].map(x => pa(`M${x},70 l6,6 l-6,6`, { c: '#fff', w: 1.2, op: .8 })).join('')}${t(62, 112, 'riffle', { a: 'middle' })}
    ${el(150, 100, 34, 24, { f: '#245a85', op: .45 })}${t(150, 104, 'deep pool', { a: 'middle', fill: '#fff', w: 700 })}
    ${ln(230, 160, 280, 112, { c: C.wood, w: 6 })}${ln(250, 140, 262, 150, { c: C.wood, w: 3 })}${t(296, 176, 'fallen tree', { a: 'middle' })}
    ${el(300, 70, 9, 7, { f: C.stone })}${pa('M310,72 C320,78 322,86 312,90', { c: '#fff', w: 1, d: '2 2' })}${t(318, 106, 'eddy', { a: 'middle', size: 9.5 })}
    ${pa('M180,57 C200,52 230,48 250,52', { c: C.ground, w: 4 })}${t(214, 42, 'undercut bank (outside bend)', { a: 'middle', size: 9.5 })}
    ${[[100, 96], [168, 92], [140, 112], [262, 128], [272, 120], [324, 84], [218, 62], [234, 64]].map(([x, y]) => el(x, y, 3.5, 3.5, { f: '#e2574c' })).join('')}
    ${t(10, 186, '● fish hold in deep water, shade, cover, and slack water by current', { size: 9.5 })}${arrow(30, 22, 90, 22, C.water)}${t(96, 26, 'current', { fill: C.water })}`, '0 0 360 192');
  const fillet = svg(`<path d="M40,100 C70,60 150,50 220,62 C250,68 268,80 280,92 L312,64 L306,100 L312,136 L280,108 C268,120 250,132 220,138 C150,150 70,140 40,100 Z" fill="#8fa3a8" stroke="#4d5c60" stroke-width="1.5"/>
    ${el(62, 94, 4, 4, { f: '#222' })}${pa('M88,74 C96,92 96,110 88,126', { c: '#4d5c60', w: 1.5 })}${pa('M120,62 L170,58 L200,64', { c: '#4d5c60', w: 1 })}
    ${ln(100, 60, 100, 140, { c: '#e2574c', w: 2.4, d: '6 4' })}${pa('M100,100 L270,100', { c: '#e8b25a', w: 2.4, d: '6 4' })}${arrow(160, 112, 240, 112, '#e8b25a', 1.6)}
    ${t(100, 52, '① cut behind the gill plate', { a: 'middle', fill: '#e2574c', w: 700 })}${t(180, 160, '② turn the blade flat, slide along the backbone', { a: 'middle', fill: '#e8b25a', w: 700, size: 9.5 })}
    ${t(160, 176, 'Flip and repeat. Then slide the knife between skin and meat.', { a: 'middle', size: 9.5 })}`, '0 0 320 182');

  window.FG_HUNT = { figs, fig, deerVitals, hogVitals, fieldDress, cuts, snare, poleSnare, fig4, bottle, weir, hogTrap, rigs, lines, holds, fillet };
})();
