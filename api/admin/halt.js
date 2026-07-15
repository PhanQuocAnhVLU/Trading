import { getDb, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const { symbol } = req.body || {};
    if (!symbol) { res.status(400).json({ ok: false, error: 'Thiếu mã cổ phiếu.' }); return; }
    const ref = db.collection('marketControl').doc('halted');
    const snap = await ref.get();
    const current = snap.exists ? snap.data() : {};
    const next = !current[symbol];
    await ref.set({ [symbol]: next }, { merge: true });
    res.status(200).json({ ok: true, symbol, halted: next });
  } catch (err) {
    sendError(res, err);
  }
}
