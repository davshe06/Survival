# Field Guide — offline survival app

An installable, fully offline survival reference for the U.S. Southeast. Works on iPhone, iPad and Android as a home‑screen app (PWA) — after one online visit, everything works in Airplane Mode.

## What's inside

- **~140 guide articles** in 22 topics: first aid & medical, dog first aid, survival basics, water, fire, shelter, navigation, signaling & radio frequencies, weather & disasters (hurricanes, tornadoes, floods, lightning, heat, ice), dangerous wildlife (venomous snakes, alligators, bears, ticks), edible & poisonous plants of the Southeast (with deadly lookalikes and a foraging calendar), growing food (crop guide, seeds, compost, pests, livestock), off‑grid cooking & recipes, food preservation, fishing/hunting, vehicle repair, power & solar, home & gear repair, making things, and knots.
- **Offline Southeast map with GPS**: states, all 1,000+ counties, cities, every interstate/US/state/county highway, rivers, lakes, parks, airports. Filter overlays: 💧 water sources (3,700+ springs, waterfalls, lakes, ponds — with "nearest water"), 🥾 hiking & OHV trails, 🌲 forest service & 4WD roads, ⛰️ contour lines (computed on the phone from terrain data). Every local road is a per‑state offline download. Live position, live compass, waypoints, **offline turn-by-turn routing** (straight line, drive on roads, or walk/hike on any mix of trails and roads — computed on the phone),  track recording with back‑track, GPX import/export. USGS topo/satellite maps and terrain can be saved for offline use area by area.
- **Tools**: GPS readout (decimal, DMS, UTM, MGRS), compass with declination, coordinate converter, sun/moon times, water purification dose calculator, SOS/Morse screen strobe, CPR metronome, unit converter, water & food planner, Dutch oven coal calculator, planting calendar by frost date, battery/solar calculator, timers & tourniquet time log.
- **Car gear checklist**: ~160 items by priority (essential / recommended / nice to have), with car packing advice, custom items and a "copy what's missing" shopping list.
- Notes & medical log, starred articles, dark / light / **night‑vision red** modes, large text, and a backup/restore file for your data.

## Install on iPhone / iPad

1. Open the hosted URL in **Safari** (it must be served over HTTPS — see Hosting).
2. Share button → **Add to Home Screen**.
3. Open it once from the home screen while online; wait for “Saved for offline use”.
4. Test in Airplane Mode.

GPS works without signal on iPhones and cellular iPads. Wi‑Fi‑only iPads have no GPS chip (use a Bluetooth GPS receiver or your phone).

## Hosting

It's a static site with no build step — host this folder anywhere with HTTPS.

- **GitHub Pages** (current setup): *Settings → Pages → Source: GitHub Actions*. The workflow in `.github/workflows/pages.yml` publishes the site to https://davshe06.github.io/survival/ on every push to `main` (and can be run by hand from the Actions tab). (Pages on a private repo needs a paid GitHub plan.)
- Or drag this folder into Netlify Drop, Vercel, or Cloudflare Pages.

Local test: `python3 -m http.server 8000` then open http://localhost:8000.

When you change any file, bump `VERSION` in `sw.js` so installed copies update.

## Map data

- `data/map-se.js` — base map from [Natural Earth](https://www.naturalearthdata.com/) (public domain) and [us-atlas](https://github.com/topojson/us-atlas) county boundaries (U.S. Census). Built by `tools/build-map.js`.
- `data/se/<STATE>.json` (bundled) and `data/packs/local-<STATE>.json` (downloaded on demand) — roads, forest/4WD roads and trails from the USGS National Transportation Dataset (public domain; roads from Census TIGER, trails from the National Digital Trails dataset incl. U.S. Forest Service and NPS). Built by `tools/build-tran.py` then `tools/build-overlays.js`.
- `data/water.json` — springs, falls, lakes, reservoirs, summits and gaps from the USGS Geographic Names Information System (public domain).
- Contour lines and elevation — calculated in the browser from Terrain Tiles on AWS Open Data (USGS 3DEP/SRTM, public domain).
- Downloadable topo tiles — USGS The National Map (public domain).

## Disclaimer

Educational reference compiled from widely published public guidance (Red Cross, CDC, EPA, USDA, FEMA, NOAA, extension services, U.S. Army FM 21‑76). Not a substitute for professional medical care or training, and always follow local laws (hunting, fishing, foraging). When help is reachable, call 911.
