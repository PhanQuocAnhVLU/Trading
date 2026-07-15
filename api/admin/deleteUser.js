import { getDb, getAdminAuth, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const { uid } = req.body || {};
    if (!uid) { res.status(400).json({ ok: false, error: 'Thiếu uid.' }); return; }

    const positionsSnap = await db.collection('holdings').doc(uid).collection('positions').get();
    const batch = db.batch();
    positionsSnap.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection('holdings').doc(uid));
    batch.delete(db.collection('wallets').doc(uid));
    batch.delete(db.collection('users').doc(uid));
    await batch.commit();

    try { await getAdminAuth().deleteUser(uid); } catch { /* user may already be gone from Auth */ }

    res.status(200).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
}
