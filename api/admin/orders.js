import { getDb, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(200).get();
    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid,
        email: data.email,
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        qty: data.qty,
        price: data.price,
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        matchedAt: data.matchedAt?.toDate ? data.matchedAt.toDate().toISOString() : null,
      };
    });
    res.status(200).json({ ok: true, orders });
  } catch (err) {
    sendError(res, err);
  }
}
