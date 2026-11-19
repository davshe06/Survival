/* Geo math: distances, bearings, UTM/MGRS, DMS, sun & moon, approximate declination. All offline. */
(function () {
  'use strict';
  const R = 6371008.8, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const Geo = {};

  Geo.dist = (a, b) => { // meters
    const dLat = (b.lat - a.lat) * D2R, dLon = (b.lon - a.lon) * D2R;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  Geo.bearing = (a, b) => {
    const y = Math.sin((b.lon - a.lon) * D2R) * Math.cos(b.lat * D2R);
    const x = Math.cos(a.lat * D2R) * Math.sin(b.lat * D2R) - Math.sin(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.cos((b.lon - a.lon) * D2R);
    return (Math.atan2(y, x) * R2D + 360) % 360;
  };
  Geo.dest = (p, brg, m) => {
    const d = m / R, t = brg * D2R, l1 = p.lat * D2R, g1 = p.lon * D2R;
    const l2 = Math.asin(Math.sin(l1) * Math.cos(d) + Math.cos(l1) * Math.sin(d) * Math.cos(t));
    const g2 = g1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(l1), Math.cos(d) - Math.sin(l1) * Math.sin(l2));
    return { lat: l2 * R2D, lon: ((g2 * R2D + 540) % 360) - 180 };
  };
  Geo.cardinal = b => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(b / 22.5) % 16];

  Geo.fmtDist = (m, units) => {
    if (units === 'met') return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(m < 10000 ? 2 : 1) + ' km';
    const ft = m * 3.28084; return ft < 1000 ? Math.round(ft) + ' ft' : (m / 1609.344).toFixed(m < 16093 ? 2 : 1) + ' mi';
  };
  Geo.dms = (v, isLat) => {
    const h = isLat ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'E' : 'W'); v = Math.abs(v);
    const d = Math.floor(v), mF = (v - d) * 60, m = Math.floor(mF), s = (mF - m) * 60;
    return `${d}°${String(m).padStart(2, '0')}'${s.toFixed(1).padStart(4, '0')}"${h}`;
  };
  Geo.dm = (v, isLat) => {
    const h = isLat ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'E' : 'W'); v = Math.abs(v);
    const d = Math.floor(v); return `${d}° ${((v - d) * 60).toFixed(3)}' ${h}`;
  };

  // Parse many coordinate formats: "33.75, -84.39", "33°45'00\"N 84°23'24\"W", "N33 45.000 W84 23.400", UTM "16S 741234 3738123", MGRS "16SGC4123438123"
  Geo.parse = str => {
    if (!str) return null; const s = str.trim().toUpperCase();
    const mg = s.replace(/\s+/g, '').match(/^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z]{2})(\d{2,10})$/);
    if (mg && mg[4].length % 2 === 0) return Geo.fromMGRS(s);
    const ut = s.match(/^(\d{1,2})\s*([C-HJ-NP-X])\s+(\d{5,7}(?:\.\d+)?)\s*[E]?\s+(\d{6,8}(?:\.\d+)?)\s*[N]?$/);
    if (ut) return Geo.fromUTM(+ut[1], ut[2] >= 'N', +ut[3], +ut[4]);
    // leading hemisphere ("N33 44.9 W84 23.2") → trailing ("33 44.9N 84 23.2W")
    const s2 = /^[NS]/.test(s) ? s.replace(/([NSEW])\s*([^NSEW]+)/g, (m, h, v) => v.trim() + h + ' ') : s;
    const parts = s2.match(/[NSEW]?\s*-?\d+(?:\.\d+)?(?:\s*[°D:\s]\s*\d+(?:\.\d+)?)?(?:\s*['M:\s]\s*\d+(?:\.\d+)?)?\s*["S]?\s*[NSEW]?/g);
    if (!parts) return null;
    const nums = parts.map(p => p.trim()).filter(p => /\d/.test(p));
    if (nums.length !== 2) return null;
    const conv = p => {
      const hem = (p.match(/[NSEW]/) || [''])[0];
      const n = p.replace(/[NSEW]/g, '').trim().split(/[°D:'M"\s]+/).filter(Boolean).map(Number);
      let v = Math.abs(n[0]) + (n[1] || 0) / 60 + (n[2] || 0) / 3600;
      if (n[0] < 0 || p.includes('-') || hem === 'S' || hem === 'W') v = -v;
      return { v, hem };
    };
    let a = conv(nums[0]), b = conv(nums[1]);
    if (a.hem === 'E' || a.hem === 'W') [a, b] = [b, a];
    if (Math.abs(a.v) > 90 || Math.abs(b.v) > 180) return null;
    return { lat: a.v, lon: b.v };
  };

  // ---- UTM (WGS84) ----
  const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996;
  const e2 = f * (2 - f), ep2 = e2 / (1 - e2);
  Geo.toUTM = (lat, lon) => {
    let zone = Math.floor((lon + 180) / 6) + 1;
    if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
    const lon0 = ((zone - 1) * 6 - 180 + 3) * D2R, phi = lat * D2R, lam = lon * D2R;
    const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2), T = Math.tan(phi) ** 2, C = ep2 * Math.cos(phi) ** 2, A = Math.cos(phi) * (lam - lon0);
    const M = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi) + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi) - (35 * e2 ** 3 / 3072) * Math.sin(6 * phi));
    let E = k0 * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5 / 120) + 500000;
    let Nn = k0 * (M + N * Math.tan(phi) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6 / 720));
    if (lat < 0) Nn += 10000000;
    const band = 'CDEFGHJKLMNPQRSTUVWXX'[Math.floor((lat + 80) / 8)] || 'X';
    return { zone, band, e: E, n: Nn };
  };
  Geo.fromUTM = (zone, north, E, Nn) => {
    const x = E - 500000, y = north ? Nn : Nn - 10000000, lon0 = ((zone - 1) * 6 - 180 + 3) * D2R;
    const M = y / k0, mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
    const N1 = a / Math.sqrt(1 - e2 * Math.sin(p1) ** 2), T1 = Math.tan(p1) ** 2, C1 = ep2 * Math.cos(p1) ** 2, R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(p1) ** 2, 1.5), Dd = x / (N1 * k0);
    const lat = p1 - (N1 * Math.tan(p1) / R1) * (Dd * Dd / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * Dd ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * Dd ** 6 / 720);
    const lon = lon0 + (Dd - (1 + 2 * T1 + C1) * Dd ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * Dd ** 5 / 120) / Math.cos(p1);
    return { lat: lat * R2D, lon: lon * R2D };
  };
  Geo.fmtUTM = (lat, lon) => { const u = Geo.toUTM(lat, lon); return `${u.zone}${u.band} ${Math.floor(u.e)}E ${Math.floor(u.n)}N`; };

  // ---- MGRS ----
  const SETS_E = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
  const SETS_N = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];
  Geo.toMGRS = (lat, lon, digits = 5) => {
    const u = Geo.toUTM(lat, lon); const set = (u.zone - 1) % 3;
    const col = SETS_E[set][Math.floor(u.e / 100000) - 1];
    const row = SETS_N[(u.zone - 1) % 2][Math.floor(u.n / 100000) % 20];
    const p = 10 ** (5 - digits);
    const ee = String(Math.floor((u.e % 100000) / p)).padStart(digits, '0'), nn = String(Math.floor((u.n % 100000) / p)).padStart(digits, '0');
    return `${u.zone}${u.band} ${col}${row} ${ee} ${nn}`;
  };
  Geo.fromMGRS = s => {
    const m = s.replace(/\s+/g, '').toUpperCase().match(/^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z])([A-HJ-NP-V])(\d*)$/);
    if (!m) return null; const zone = +m[1], band = m[2], digs = m[5]; const h = digs.length / 2;
    const e100 = SETS_E[(zone - 1) % 3].indexOf(m[3]) + 1; const n100 = SETS_N[(zone - 1) % 2].indexOf(m[4]);
    if (e100 < 1 || n100 < 0) return null;
    const p = 10 ** (5 - h); const E = e100 * 100000 + (h ? +digs.slice(0, h) * p : 0) + p / 2; let N = n100 * 100000 + (h ? +digs.slice(h) * p : 0) + p / 2;
    // find northing cycle that matches the latitude band
    const bandLat = 'CDEFGHJKLMNPQRSTUVWX'.indexOf(band) * 8 - 80; const north = band >= 'N';
    const minN = Geo.toUTM(Math.max(bandLat, -79.9), zone * 6 - 183).n;
    while (N < minN - 1) N += 2000000; // approximate band match
    if (!north && N > 10000000) N -= 2000000;
    return Geo.fromUTM(zone, north, E, N);
  };

  // ---- Sun (NOAA algorithm) ----
  Geo.sunTimes = (date, lat, lon) => {
    const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const res = {};
    const calc = (zenith, rising) => {
      const N = Math.floor((day - Date.UTC(date.getFullYear(), 0, 0)) / 864e5);
      const lngHour = lon / 15; const t = N + ((rising ? 6 : 18) - lngHour) / 24;
      const M = 0.9856 * t - 3.289;
      let L = M + 1.916 * Math.sin(M * D2R) + 0.020 * Math.sin(2 * M * D2R) + 282.634; L = (L + 360) % 360;
      let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R)); RA = (RA + 360) % 360;
      RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90; RA /= 15;
      const sinDec = 0.39782 * Math.sin(L * D2R), cosDec = Math.cos(Math.asin(sinDec));
      const cosH = (Math.cos(zenith * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));
      if (cosH > 1 || cosH < -1) return null;
      let H = rising ? 360 - R2D * Math.acos(cosH) : R2D * Math.acos(cosH); H /= 15;
      const T = H + RA - 0.06571 * t - 6.622; let UT = (T - lngHour) % 24; if (UT < 0) UT += 24;
      return new Date(day + UT * 3600e3);
    };
    res.sunrise = calc(90.833, true); res.sunset = calc(90.833, false);
    res.dawn = calc(96, true); res.dusk = calc(96, false);
    res.nauticalDawn = calc(102, true); res.nauticalDusk = calc(102, false);
    if (res.sunrise && res.sunset) { if (res.sunset < res.sunrise) res.sunset = new Date(+res.sunset + 864e5); if (res.dusk < res.dawn) res.dusk = new Date(+res.dusk + 864e5); res.noon = new Date((+res.sunrise + +res.sunset) / 2); res.dayLen = (res.sunset - res.sunrise) / 36e5; }
    return res;
  };
  // ---- Moon phase ----
  Geo.moon = date => {
    const syn = 29.530588853; const ref = Date.UTC(2000, 0, 6, 18, 14);
    const age = (((date - ref) / 864e5) % syn + syn) % syn;
    const illum = (1 - Math.cos(2 * Math.PI * age / syn)) / 2;
    const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
    const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const i = Math.floor((age / syn) * 8 + 0.5) % 8;
    const nextFull = new Date(+date + (((syn / 2 - age) % syn + syn) % syn) * 864e5);
    const nextNew = new Date(+date + (syn - age) * 864e5);
    return { age, illum, name: names[i], icon: icons[i], nextFull, nextNew };
  };
  // Approximate magnetic declination for the U.S. Southeast and PA/NJ/NY (~2025–2027 epoch, ±1–2°). Negative = West.
  Geo.declination = (lat, lon) => -55.12 - 0.6671 * lon - 0.1906 * lat;

  window.Geo = Geo;
})();
