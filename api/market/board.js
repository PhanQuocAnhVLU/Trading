import { getManyPriceBoards, getManyIndices } from '../_lib/vnstockClient.js';

// Converts vnstock-js "thousand VND" convention (e.g. 68.5) to full VND (68500).
function toVnd(n) {
  return typeof n === 'number' ? Math.round(n * 1000) : n;
}

function mapBoardItem(item) {
  if (!item) return null;
  const price = toVnd(item.price);
  const ref = toVnd(item.referencePrice);
  return {
    ref,
    ceiling: toVnd(item.ceilingPrice),
    floor: toVnd(item.floorPrice),
    price,
    // The public price-board endpoint doesn't expose the session open price,
    // so we approximate "open" with the reference price (previous close).
    open: ref,
    high: toVnd(item.highestPrice) || price,
    low: toVnd(item.lowestPrice) || price,
    volume: item.matchVolume ?? item.totalVolume ?? 0,
    change: price - ref,
    changePct: ref ? ((price - ref) / ref) * 100 : 0,
    bids: (item.bidPrices || []).map((b) => ({ price: toVnd(b.price), qty: b.volume })),
    asks: (item.askPrices || []).map((a) => ({ price: toVnd(a.price), qty: a.volume })),
    foreignBuyVol: item.foreignBuyVolume ?? 0,
    foreignSellVol: item.foreignSellVolume ?? 0,
    lastTick: Date.now(),
  };
}

function mapIndexItem(item) {
  if (!item) return null;
  return {
    value: item.close,
    prev: item.open,
    change: item.close - item.open,
    changePct: item.open ? ((item.close - item.open) / item.open) * 100 : 0,
    high: item.high,
    low: item.low,
    date: item.date,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const indexCodes = String(req.query.indices || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const [{ quotes, errors: quoteErrors }, { indices, errors: indexErrors }] = await Promise.all([
      symbols.length ? getManyPriceBoards(symbols) : { quotes: {}, errors: {} },
      indexCodes.length ? getManyIndices(indexCodes) : { indices: {}, errors: {} },
    ]);

    const mappedQuotes = {};
    Object.entries(quotes).forEach(([sym, item]) => { mappedQuotes[sym] = mapBoardItem(item); });
    const mappedIndices = {};
    Object.entries(indices).forEach(([code, item]) => { mappedIndices[code] = mapIndexItem(item); });

    res.status(200).json({
      ok: true,
      quotes: mappedQuotes,
      indices: mappedIndices,
      errors: { ...quoteErrors, ...indexErrors },
      updatedAt: Date.now(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Lỗi lấy dữ liệu thị trường.' });
  }
}
