/* Field Guide – core app: routing, guide rendering, search, favorites, notes, settings. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const view = $('#view');
  const titleEl = $('#title');
  const backBtn = $('#backBtn');

  // ---------- storage helpers ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fg.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('fg.' + k, JSON.stringify(v)); } catch (e) { toast('Storage full or blocked'); } }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  let toastT;
  function toast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ---------- guide data ----------
  const ORDER = ['basics', 'firstaid', 'dogs', 'water', 'fire', 'shelter', 'navigation', 'signal', 'weather', 'wildlife',
    'plants', 'garden', 'cooking', 'preserve', 'hunt', 'vehicle', 'power', 'repair', 'make', 'knots', 'hygiene', 'security'];
  const cats = (window.GUIDE || []).slice().sort((a, b) => {
    const ia = ORDER.indexOf(a.id), ib = ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const catById = {}; const artIndex = [];
  cats.forEach(c => { catById[c.id] = c; c.articles.forEach((a, i) => { a.cat = c; a.idx = i; artIndex.push(a); }); });
  function stripHtml(h) { return h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' '); }
  artIndex.forEach(a => { a.text = stripHtml(a.body || ''); a.hay = (a.title + ' ' + (a.tags || []).join(' ') + ' ' + (a.sum || '') + ' ' + a.text).toLowerCase(); });

  // ---------- router ----------
  const routes = [];
  function route(re, fn) { routes.push([re, fn]); }
  let cleanup = null;
  function render() {
    if (cleanup) { try { cleanup(); } catch (e) { } cleanup = null; }
    const hash = location.hash.slice(1) || '/';
    const [p, qs] = hash.split('?');
    const q = new URLSearchParams(qs || '');
    document.body.classList.remove('is-map');
    for (const [re, fn] of routes) {
      const m = p.match(re);
      if (m) {
        const r = fn(m, q);
        if (typeof r === 'function') cleanup = r;
        const tab = p.startsWith('/map') ? 'map' : p.startsWith('/tools') ? 'tools' : p.startsWith('/gear') ? 'gear' : (p.startsWith('/more') || p.startsWith('/notes') || p.startsWith('/settings') || p.startsWith('/favs') || p.startsWith('/about')) ? 'more' : 'home';
        document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
        return;
      }
    }
    location.hash = '#/';
  }
  function setTitle(t, back) {
    titleEl.textContent = t; document.title = t === 'Field Guide' ? t : t + ' · Field Guide';
    if (back) { backBtn.hidden = false; backBtn.href = back; } else backBtn.hidden = true;
  }
  window.addEventListener('hashchange', () => { render(); view.scrollTop = 0; });

  // ---------- views ----------
  route(/^\/$/, () => {
    setTitle('Field Guide');
    const favs = store.get('favs', []);
    const recent = store.get('recent', []).slice(0, 5);
    view.innerHTML = `
      <div class="search"><input id="q" type="search" placeholder="Search everything (e.g. snake bite, flat tire, acorns)" autocomplete="off" enterkeyhint="search"></div>
      <div class="sos-strip">
        <a href="#/a/firstaid/bleeding"><span>🩸</span>Severe bleeding</a>
        <a href="#/a/firstaid/cpr"><span>❤️</span>CPR</a>
        <a href="#/a/firstaid/choking"><span>😮‍💨</span>Choking</a>
        <a href="#/a/wildlife/snakes"><span>🐍</span>Snakebite</a>
        <a href="#/a/firstaid/heat"><span>🌡️</span>Heat / Cold</a>
        <a href="#/c/dogs"><span>🐕</span>Dog first aid</a>
        <a href="#/tools/sos"><span>🔦</span>SOS signal</a>
      </div>
      ${favs.length ? `<h2 class="section">★ Saved</h2><div class="list">${favs.map(id => artRow(findArt(id))).join('')}</div>` : ''}
      ${recent.length ? `<h2 class="section">Recently viewed</h2><div class="list">${recent.map(id => artRow(findArt(id))).join('')}</div>` : ''}
      <h2 class="section">Topics</h2>
      <div class="grid">${cats.map(c => `<a class="tile" style="--c:${c.color}" href="#/c/${c.id}"><span class="i">${c.icon}</span><b>${esc(c.title)}</b><small>${esc(c.blurb)}</small></a>`).join('')}</div>
      <h2 class="section">Quick tools</h2>
      <div class="grid">
        <a class="tile" style="--c:#5aa9c4" href="#/map"><span class="i">🗺️</span><b>Map &amp; GPS</b><small>Offline Southeast map, waypoints, tracks</small></a>
        <a class="tile" style="--c:#d9a441" href="#/tools/compass"><span class="i">🧭</span><b>Compass</b><small>Heading &amp; bearings</small></a>
        <a class="tile" style="--c:#7fae5a" href="#/tools/water"><span class="i">💧</span><b>Water purify calc</b><small>Bleach / iodine doses</small></a>
        <a class="tile" style="--c:#e2574c" href="#/gear"><span class="i">🎒</span><b>Car gear list</b><small>Checklist that fits a car</small></a>
      </div>
      <p class="footer-note">${artIndex.length} articles · works offline once installed. Information is for education; seek professional help whenever it is available.</p>`;
    const qi = $('#q');
    qi.addEventListener('keydown', e => { if (e.key === 'Enter') location.hash = '#/search?q=' + encodeURIComponent(qi.value); });
    let t; qi.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { if (qi.value.trim().length > 1) location.hash = '#/search?q=' + encodeURIComponent(qi.value); }, 500); });
  });

  function findArt(key) { const [c, a] = String(key).split('/'); const cat = catById[c]; return cat && cat.articles.find(x => x.id === a); }
  function artRow(a) {
    if (!a) return '';
    return `<a class="row" href="#/a/${a.cat.id}/${a.id}"><span class="i">${a.icon || a.cat.icon}</span><span class="t"><b>${esc(a.title)}</b><small>${esc(a.sum || a.cat.title)}</small></span><span class="chev">›</span></a>`;
  }

  route(/^\/c\/([\w-]+)$/, m => {
    const c = catById[m[1]]; if (!c) { location.hash = '#/'; return; }
    setTitle(c.title, '#/');
    view.innerHTML = `
      <p class="muted" style="margin-top:0">${esc(c.blurb)}</p>
      ${c.intro ? `<div class="box info">${c.intro}</div>` : ''}
      <div class="list">${c.articles.map(artRow).join('')}</div>`;
  });

  route(/^\/a\/([\w-]+)\/([\w-]+)$/, m => {
    const c = catById[m[1]]; const a = c && c.articles.find(x => x.id === m[2]);
    if (!a) { location.hash = '#/'; return; }
    setTitle(a.title, '#/c/' + c.id);
    const key = c.id + '/' + a.id;
    const recent = store.get('recent', []).filter(x => x !== key); recent.unshift(key); store.set('recent', recent.slice(0, 12));
    const favs = store.get('favs', []);
    const prev = c.articles[a.idx - 1], next = c.articles[a.idx + 1];
    view.innerHTML = `
      <article class="doc">
        <div class="crumbs"><a href="#/">Guide</a> › <a href="#/c/${c.id}">${esc(c.title)}</a></div>
        <div style="display:flex;align-items:flex-start;gap:8px"><h1 style="flex:1">${esc(a.title)}</h1>
        <button class="star" id="fav" aria-label="Save">${favs.includes(key) ? '★' : '☆'}</button></div>
        ${a.tags ? `<div class="tags">${a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${a.body}
        <div class="artnav">
          ${prev ? `<a href="#/a/${c.id}/${prev.id}"><small>‹ Previous</small>${esc(prev.title)}</a>` : '<span style="flex:1"></span>'}
          ${next ? `<a class="next" href="#/a/${c.id}/${next.id}"><small>Next ›</small>${esc(next.title)}</a>` : '<span style="flex:1"></span>'}
        </div>
      </article>`;
    $('#fav').onclick = () => {
      let f = store.get('favs', []);
      if (f.includes(key)) f = f.filter(x => x !== key); else f.unshift(key);
      store.set('favs', f); $('#fav').textContent = f.includes(key) ? '★' : '☆';
      toast(f.includes(key) ? 'Saved to home screen list' : 'Removed from saved');
    };
    // highlight search term
    const hl = new URLSearchParams(location.hash.split('?')[1] || '').get('hl');
    if (hl) highlight(view.querySelector('article'), hl);
  });

  function highlight(root, term) {
    if (!root || !term) return;
    const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n, first = null; const hits = [];
    while ((n = walker.nextNode())) if (re.test(n.nodeValue)) hits.push(n);
    hits.slice(0, 50).forEach(node => {
      const span = document.createElement('span'); span.innerHTML = esc(node.nodeValue).replace(new RegExp(re.source, 'gi'), '<mark>$1</mark>');
      node.parentNode.replaceChild(span, node); if (!first) first = span;
    });
    if (first) setTimeout(() => first.scrollIntoView({ block: 'center' }), 50);
  }

  route(/^\/search$/, (m, q) => {
    const term = (q.get('q') || '').trim();
    setTitle('Search', '#/');
    view.innerHTML = `<div class="search"><input id="q" type="search" value="${esc(term)}" placeholder="Search everything" autocomplete="off" enterkeyhint="search"></div><div id="res"></div>`;
    const qi = $('#q'); const res = $('#res');
    function run() {
      const t = qi.value.trim().toLowerCase();
      history.replaceState(null, '', '#/search?q=' + encodeURIComponent(qi.value));
      if (t.length < 2) { res.innerHTML = '<p class="muted">Type at least 2 letters.</p>'; return; }
      const words = t.split(/\s+/).filter(Boolean);
      const scored = [];
      for (const a of artIndex) {
        if (!words.every(w => a.hay.includes(w))) continue;
        let s = 0; const tl = a.title.toLowerCase();
        words.forEach(w => { if (tl.includes(w)) s += 10; if ((a.tags || []).join(' ').toLowerCase().includes(w)) s += 5; s += Math.min(5, a.hay.split(w).length - 1); });
        scored.push([s, a]);
      }
      scored.sort((x, y) => y[0] - x[0]);
      const tools = TOOL_LIST.filter(x => words.every(w => (x.title + ' ' + x.sum + ' ' + x.k).toLowerCase().includes(w)));
      res.innerHTML = (tools.length ? `<h2 class="section">Tools</h2><div class="list">${tools.map(x => `<a class="row" href="#/tools/${x.id}"><span class="i">${x.icon}</span><span class="t"><b>${esc(x.title)}</b><small>${esc(x.sum)}</small></span><span class="chev">›</span></a>`).join('')}</div>` : '') +
        `<h2 class="section">${scored.length} article${scored.length === 1 ? '' : 's'}</h2>` +
        (scored.length ? '<div class="list">' + scored.slice(0, 60).map(([, a]) => {
          const i = a.text.toLowerCase().indexOf(words[0]);
          const snip = i >= 0 ? '…' + a.text.slice(Math.max(0, i - 40), i + 80) + '…' : a.sum || '';
          return `<a class="row" href="#/a/${a.cat.id}/${a.id}?hl=${encodeURIComponent(words[0])}"><span class="i">${a.icon || a.cat.icon}</span><span class="t"><b>${esc(a.title)}</b><small>${esc(a.cat.title)} — ${esc(snip)}</small></span><span class="chev">›</span></a>`;
        }).join('') + '</div>' : '<p class="muted">No matches. Try fewer or simpler words.</p>');
    }
    let tm; qi.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 200); });
    run(); if (!term) qi.focus();
  });

  // ---------- More / notes / settings ----------
  route(/^\/more$/, () => {
    setTitle('More');
    view.innerHTML = `<div class="list">
      <a class="row" href="#/notes"><span class="i">📝</span><span class="t"><b>Notes &amp; logs</b><small>Your own notes, medical log, contacts — saved on this device</small></span><span class="chev">›</span></a>
      <a class="row" href="#/favs"><span class="i">★</span><span class="t"><b>Saved articles</b><small>Articles you starred</small></span><span class="chev">›</span></a>
      <a class="row" href="#/settings"><span class="i">⚙️</span><span class="t"><b>Settings &amp; backup</b><small>Display mode, text size, export / import your data</small></span><span class="chev">›</span></a>
      <a class="row" href="#/about"><span class="i">📲</span><span class="t"><b>Install &amp; offline status</b><small>How to put this on your iPhone / iPad home screen</small></span><span class="chev">›</span></a>
    </div>
    <h2 class="section">All topics</h2>
    <div class="list">${cats.map(c => `<a class="row" href="#/c/${c.id}"><span class="i">${c.icon}</span><span class="t"><b>${esc(c.title)}</b><small>${c.articles.length} articles</small></span><span class="chev">›</span></a>`).join('')}</div>`;
  });

  route(/^\/favs$/, () => {
    setTitle('Saved', '#/more');
    const favs = store.get('favs', []);
    view.innerHTML = favs.length ? `<div class="list">${favs.map(id => artRow(findArt(id))).join('')}</div>` : '<p class="muted">Tap ☆ on any article to save it here and on the home screen.</p>';
  });

  route(/^\/notes$/, () => {
    setTitle('Notes & logs', '#/more');
    const notes = store.get('notes', []);
    view.innerHTML = `
      <div class="card">
        <h3>New note</h3>
        <select class="inp" id="nk"><option>General</option><option>Medical log</option><option>Contacts / rally points</option><option>Supplies</option><option>Route / trip plan</option></select>
        <label class="f" for="nt">Note</label>
        <textarea class="inp" id="nt" rows="4" placeholder="e.g. 14:20 — John: cut on left forearm, cleaned, butterfly closures, tetanus up to date"></textarea>
        <div class="btnrow"><button class="btn pri" id="nadd">Save note</button><button class="btn" id="nstamp">Insert time + GPS</button></div>
      </div>
      <div id="nlist" class="list"></div>`;
    function draw() {
      const n = store.get('notes', []);
      $('#nlist').innerHTML = n.length ? n.map((x, i) => `<div class="card"><div class="small muted">${esc(x.k)} · ${new Date(x.d).toLocaleString()}</div><div style="white-space:pre-wrap;margin-top:6px">${esc(x.t)}</div><div class="btnrow"><button class="btn" data-del="${i}">Delete</button></div></div>`).join('') : '<p class="muted">No notes yet. Notes stay on this device (use Settings → Export to back up).</p>';
      $('#nlist').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Delete this note?')) return; const a = store.get('notes', []); a.splice(+b.dataset.del, 1); store.set('notes', a); draw(); });
    }
    $('#nadd').onclick = () => { const t = $('#nt').value.trim(); if (!t) return; const a = store.get('notes', []); a.unshift({ k: $('#nk').value, t, d: Date.now() }); store.set('notes', a); $('#nt').value = ''; draw(); toast('Saved'); };
    $('#nstamp').onclick = () => {
      const ins = s => { const ta = $('#nt'); ta.value = (ta.value ? ta.value + '\n' : '') + s; };
      const ts = new Date().toLocaleString();
      if (!navigator.geolocation) return ins(ts);
      navigator.geolocation.getCurrentPosition(p => ins(ts + ' @ ' + p.coords.latitude.toFixed(5) + ', ' + p.coords.longitude.toFixed(5)), () => ins(ts), { enableHighAccuracy: true, timeout: 15000 });
    };
    draw();
  });

  route(/^\/settings$/, () => {
    setTitle('Settings', '#/more');
    const s = store.get('settings', {});
    view.innerHTML = `
      <div class="card"><h3>Display mode</h3>
        <div class="btnrow">${[['dark', '🌙 Dark'], ['light', '☀️ Light'], ['red', '🔴 Night vision (red)']].map(([k, l]) => `<button class="btn ${((s.theme || 'dark') === k) ? 'pri' : ''}" data-theme="${k}">${l}</button>`).join('')}</div>
        <p class="small muted">Red mode preserves your night vision and is harder to see from a distance.</p></div>
      <div class="card"><h3>Text size</h3>
        <div class="btnrow">${[['', 'Normal'], ['l', 'Large'], ['xl', 'Extra large']].map(([k, l]) => `<button class="btn ${((s.size || '') === k) ? 'pri' : ''}" data-size="${k}">${l}</button>`).join('')}</div></div>
      <div class="card"><h3>Units</h3>
        <div class="btnrow">${[['imp', 'Miles / feet'], ['met', 'Kilometers / meters']].map(([k, l]) => `<button class="btn ${((s.units || 'imp') === k) ? 'pri' : ''}" data-units="${k}">${l}</button>`).join('')}</div></div>
      <div class="card"><h3>Backup your data</h3>
        <p class="small muted">Waypoints, tracks, gear checklist, notes and saved articles live only on this device. Export a backup file and keep a copy somewhere safe (Files app, email to yourself).</p>
        <div class="btnrow"><button class="btn pri" id="exp">Export backup</button><label class="btn">Import backup<input type="file" id="imp" accept="application/json,.json" hidden></label></div></div>
      <div class="card"><h3>Reset</h3><div class="btnrow"><button class="btn red" id="wipe">Erase all my data on this device</button></div></div>`;
    view.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { applySetting('theme', b.dataset.theme); render(); });
    view.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { applySetting('size', b.dataset.size); render(); });
    view.querySelectorAll('[data-units]').forEach(b => b.onclick = () => { applySetting('units', b.dataset.units); render(); });
    $('#exp').onclick = () => {
      const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('fg.')) data[k] = localStorage.getItem(k); }
      const blob = new Blob([JSON.stringify({ app: 'field-guide', v: 1, date: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'field-guide-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };
    $('#imp').onchange = e => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { const j = JSON.parse(r.result); if (j.app !== 'field-guide') throw 0; Object.entries(j.data).forEach(([k, v]) => localStorage.setItem(k, v)); toast('Backup restored'); setTimeout(() => location.reload(), 600); } catch (err) { toast('That is not a Field Guide backup file'); } };
      r.readAsText(f);
    };
    $('#wipe').onclick = () => { if (!confirm('Erase waypoints, tracks, notes, checklist and settings on this device?')) return; Object.keys(localStorage).filter(k => k.startsWith('fg.')).forEach(k => localStorage.removeItem(k)); location.reload(); };
  });

  route(/^\/about$/, () => {
    setTitle('Install & offline', '#/more');
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    view.innerHTML = `
      <div class="card"><h3>Status</h3><dl class="kv">
        <dt>Installed</dt><dd>${standalone ? '✅ Running as a home-screen app' : '⚠️ Running in the browser — install it (below)'}</dd>
        <dt>Offline copy</dt><dd id="offst">Checking…</dd>
        <dt>Connection</dt><dd>${navigator.onLine ? 'Online' : 'Offline'}</dd>
        <dt>Storage</dt><dd id="stor">—</dd></dl>
        <div class="btnrow"><button class="btn" id="recache">Re-download offline copy</button></div></div>
      <article class="doc">
        <h2>Install on iPhone or iPad</h2>
        <ol class="steps">
          <li>Open this page in <b>Safari</b> while you have internet.</li>
          <li>Tap the <b>Share</b> button (square with an up arrow).</li>
          <li>Scroll and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>
          <li>Open <b>Field Guide</b> from your home screen once while still online, and wait until the status above says the offline copy is ready.</li>
          <li>Test it: turn on Airplane Mode and open the app. Everything should still work.</li>
        </ol>
        <h2>Install on Android</h2>
        <ol class="steps"><li>Open the page in Chrome.</li><li>Tap ⋮ menu → <b>Install app</b> (or Add to Home screen).</li></ol>
        <h2>GPS without internet</h2>
        <p>GPS satellites are free and need no cell signal. iPhones and <b>cellular (Wi‑Fi + Cellular) iPads</b> have a real GPS chip and will show your position with no internet at all. <b>Wi‑Fi‑only iPads have no GPS chip</b> — they can only locate themselves near known Wi‑Fi networks. For a Wi‑Fi‑only iPad, pair an inexpensive Bluetooth GPS receiver (e.g. a Bad Elf or Garmin GLO) or rely on your phone.</p>
        <p>Allow location for Safari: <b>Settings → Privacy &amp; Security → Location Services → Safari Websites → While Using</b>, and turn on <b>Precise Location</b>.</p>
        <h2>Keep your data safe</h2>
        <p>Your waypoints, notes and checklist are stored only on this device. Use <a href="#/settings">Settings → Export backup</a> now and then. iOS may clear data for web apps you haven't opened in many weeks — opening the app occasionally prevents that.</p>
        <h2>Sources &amp; disclaimer</h2>
        <p class="small">Map data: Natural Earth (public domain); U.S. Census Bureau county boundaries via us-atlas; roads and trails from the USGS National Transportation Dataset (Census TIGER, U.S. Forest Service, NPS); springs, lakes and peaks from USGS GNIS; contours from Terrain Tiles on AWS Open Data (USGS 3DEP/SRTM). Content compiled from widely published public guidance (e.g. American Red Cross, CDC, EPA, USDA, FEMA, NOAA, U.S. Army survival manual FM 21-76, university extension services). This app is an educational reference and not a substitute for professional medical care, formal training, or local laws and regulations. When help is reachable, call 911.</p>
      </article>`;
    checkOffline();
    $('#recache').onclick = () => { if (navigator.serviceWorker && navigator.serviceWorker.controller) { navigator.serviceWorker.controller.postMessage('recache'); toast('Downloading…'); setTimeout(checkOffline, 4000); } else toast('Open the installed app online first'); };
    if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(e => { const el = $('#stor'); if (el) el.textContent = (e.usage / 1048576).toFixed(1) + ' MB used'; });
  });

  async function checkOffline() {
    const el = $('#offst'); if (!el) return;
    if (!('caches' in window) || !navigator.serviceWorker) { el.textContent = '❌ This browser does not support offline apps'; return; }
    try {
      const keys = await caches.keys(); const k = keys.find(x => x.startsWith('fg-app-'));
      if (!k) { el.textContent = '⏳ Not ready yet — stay online a moment'; return; }
      const c = await caches.open(k); const n = (await c.keys()).length;
      el.textContent = (n >= (window.FG_ASSET_COUNT || 1) ? '✅ Ready — ' : '⏳ Partial — ') + n + ' files saved (' + k.replace('fg-app-', 'version ') + ')';
    } catch (e) { el.textContent = 'Unknown'; }
  }

  // ---------- settings ----------
  function applySetting(k, v) {
    const s = store.get('settings', {}); s[k] = v; store.set('settings', s);
    if (k === 'theme') { document.documentElement.dataset.theme = v; const m = document.querySelector('meta[name=theme-color]'); m.content = v === 'light' ? '#f4f1e8' : v === 'red' ? '#000000' : '#12140f'; }
    if (k === 'size') document.documentElement.dataset.size = v;
    document.dispatchEvent(new CustomEvent('fg-settings'));
  }
  $('#themeBtn').onclick = () => {
    const cur = store.get('settings', {}).theme || 'dark';
    const nxt = { dark: 'light', light: 'red', red: 'dark' }[cur];
    applySetting('theme', nxt); toast({ dark: 'Dark mode', light: 'Light mode', red: 'Night-vision red mode' }[nxt]);
    document.dispatchEvent(new CustomEvent('fg-theme'));
  };
  if (store.get('settings', {}).theme) applySetting('theme', store.get('settings', {}).theme);

  // ---------- expose ----------
  const TOOL_LIST = [];
  window.FG = { route, render, setTitle, store, esc, toast, view, $, TOOL_LIST, catById, units: () => store.get('settings', {}).units || 'imp' };

  // ---------- service worker ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => { if (w.state === 'activated') toast(hadController ? 'Offline copy updated' : '✅ Saved for offline use'); });
      });
    }).catch(() => { });
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'cached') { window.FG_ASSET_COUNT = e.data.total; checkOffline(); } });
  }
  // initial render waits until every script (tools, map, gear) has registered its routes
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', render); else setTimeout(render, 0);
})();
