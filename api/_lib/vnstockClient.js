import vnstockDefault, { stock } from 'vnstock-js';

let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = vnstockDefault
      .init({ cacheDir: '/tmp/vnstock-cache', timeout: 8000 })
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}

const BOARD_TTL_MS = 4000;
const boardCache = new Map(); // symbol -> { promise, expiresAt }

function cached(map, key, ttlMs, fetcher) {
  const hit = map.get(key);
  const now = Date.now();
  if (hit && hit.expiresAt > now) return hit.promise;
  const promise = fetcher().catch((err) => {
    map.delete(key);
    throw err;
  });
  map.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

export async function getPriceBoard(symbol) {
  await ensureInit();
  return cached(boardCache, symbol, BOARD_TTL_MS, async () => {
    const rows = await stock.priceBoard({ ticker: symbol });
    return Array.isArray(rows) ? rows[0] : rows;
  });
}

export async function getManyPriceBoards(symbols) {
  const results = await Promise.allSettled(symbols.map((s) => getPriceBoard(s)));
  const quotes = {};
  const errors = {};
  symbols.forEach((sym, i) => {
    const r = results[i];
    if (r.status === 'fulfilled' && r.value) quotes[sym] = r.value;
    else errors[sym] = r.status === 'rejected' ? (r.reason?.message || String(r.reason)) : 'no data';
  });
  return { quotes, errors };
}

const indexCache = new Map();
export async function getIndexValue(indexCode) {
  await ensureInit();
  return cached(indexCache, indexCode, BOARD_TTL_MS, async () => {
    const today = new Date().toISOString().slice(0, 10);
    // Ask for a small trailing window in case "today" has no bar yet (pre-market / off days).
    const start = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    const rows = await stock.index({ index: indexCode, start, end: today });
    if (!rows || !rows.length) throw new Error('Không có dữ liệu chỉ số ' + indexCode);
    return rows[rows.length - 1];
  });
}

export async function getManyIndices(codes) {
  const results = await Promise.allSettled(codes.map((c) => getIndexValue(c)));
  const indices = {};
  const errors = {};
  codes.forEach((code, i) => {
    const r = results[i];
    if (r.status === 'fulfilled' && r.value) indices[code] = r.value;
    else errors[code] = r.status === 'rejected' ? (r.reason?.message || String(r.reason)) : 'no data';
  });
  return { indices, errors };
}

export async function getHistory(symbol, days = 90) {
  await ensureInit();
  const start = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const rows = await stock.quote({ ticker: symbol, start });
  return rows || [];
}

export async function getTopMovers() {
  await ensureInit();
  const [gainers, losers] = await Promise.all([stock.topGainers(), stock.topLosers()]);
  return { gainers, losers };
}
