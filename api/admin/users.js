import { getDb, requireAdmin, sendError } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }
  try {
    await requireAdmin(req);
    const db = getDb();
    const usersSnap = await db.collection('users').get();
    const users = [];
    for (const doc of usersSnap.docs) {
      const u = doc.data();
      const walletSnap = await db.collection('wallets').doc(doc.id).get();
      users.push({
        uid: doc.id,
        email: u.email,
        fullName: u.fullName,
        accountNo: u.accountNo,
        role: u.role,
        banned: !!u.banned,
        cashBalance: walletSnap.exists ? walletSnap.data().cashBalance || 0 : 0,
      });
    }
    res.status(200).json({ ok: true, users });
  } catch (err) {
    sendError(res, err);
  }
}
