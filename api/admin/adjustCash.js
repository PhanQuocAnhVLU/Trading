import { getDb, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const { uid, delta } = req.body || {};
    const amount = Number(delta);
    if (!uid || !amount) { res.status(400).json({ ok: false, error: 'Thiếu uid hoặc số tiền.' }); return; }
    const ref = db.collection('wallets').doc(uid);
    const newBalance = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists ? snap.data().cashBalance || 0 : 0;
      const next = Math.max(0, current + amount);
      tx.set(ref, { cashBalance: next, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return next;
    });
    res.status(200).json({ ok: true, cashBalance: newBalance });
  } catch (err) {
    sendError(res, err);
  }
}
