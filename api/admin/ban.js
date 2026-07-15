import { getDb, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const { uid } = req.body || {};
    if (!uid) { res.status(400).json({ ok: false, error: 'Thiếu uid.' }); return; }
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) { res.status(404).json({ ok: false, error: 'Không tìm thấy người dùng.' }); return; }
    const nextBanned = !snap.data().banned;
    await ref.update({ banned: nextBanned });
    res.status(200).json({ ok: true, banned: nextBanned });
  } catch (err) {
    sendError(res, err);
  }
}
