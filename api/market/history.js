import { getHistory } from '../_lib/vnstockClient.js';

function toVnd(n) {
  return typeof n === 'number' ? Math.round(n * 1000) : n;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    const symbol = String(req.query.symbol || '').trim().toUpperCase();
    const days = Math.min(Number(req.query.days) || 90, 365);
    if (!symbol) {
      res.status(400).json({ ok: false, error: 'Thiếu tham số symbol.' });
      return;
    }
    const rows = await getHistory(symbol, days);
    const candles = rows.map((r, i) => ({
      t: i,
      date: r.date,
      open: toVnd(r.open),
      high: toVnd(r.high),
      low: toVnd(r.low),
      close: toVnd(r.close),
      volume: r.volume,
    }));
    res.status(200).json({ ok: true, symbol, candles });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Lỗi lấy lịch sử giá.' });
  }
}
