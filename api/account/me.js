import { getDb, requireUser, sendError, isAdminEmail } from '../_lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

const STARTING_CASH = 200_000_000;

function genAccountNo() {
  return '069C' + String(Math.floor(100000 + Math.random() * 900000));
}

export default async function handler(req, res) {
  try {
    const decoded = await requireUser(req);
    const db = getDb();
    const userRef = db.collection('users').doc(decoded.uid);

    if (req.method === 'GET' || req.method === 'POST') {
      // POST = bootstrap (create-if-missing), used right after register/login.
      let snap = await userRef.get();
      if (!snap.exists) {
        if (req.method !== 'POST') {
          res.status(404).json({ ok: false, error: 'Chưa có hồ sơ tài khoản.' });
          return;
        }
        const body = req.body || {};
        const profile = {
          email: decoded.email || '',
          fullName: body.fullName || decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Nhà đầu tư'),
          accountNo: genAccountNo(),
          role: isAdminEmail(decoded.email) ? 'admin' : 'investor',
          banned: false,
          createdAt: FieldValue.serverTimestamp(),
        };
        await userRef.set(profile);
        await db.collection('wallets').doc(decoded.uid).set({
          cashBalance: STARTING_CASH,
          updatedAt: FieldValue.serverTimestamp(),
        });
        snap = await userRef.get();
      }

      const profile = snap.data();
      if (profile.banned) {
        res.status(403).json({ ok: false, error: 'Tài khoản đã bị tạm khoá. Vui lòng liên hệ quản trị viên.' });
        return;
      }

      const walletSnap = await db.collection('wallets').doc(decoded.uid).get();
      const wallet = walletSnap.exists ? walletSnap.data() : { cashBalance: 0 };

      const holdingsSnap = await db.collection('holdings').doc(decoded.uid).collection('positions').get();
      const holdings = {};
      holdingsSnap.forEach((d) => { holdings[d.id] = d.data(); });

      res.status(200).json({
        ok: true,
        profile: {
          email: profile.email,
          fullName: profile.fullName,
          accountNo: profile.accountNo,
          role: profile.role,
          banned: profile.banned,
        },
        cashBalance: wallet.cashBalance || 0,
        holdings,
      });
      return;
    }

    if (req.method === 'PATCH') {
      // Allow the user to update their own non-financial profile fields only.
      const body = req.body || {};
      const patch = {};
      if (typeof body.fullName === 'string' && body.fullName.trim()) patch.fullName = body.fullName.trim();
      if (Object.keys(patch).length) await userRef.update(patch);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    sendError(res, err);
  }
}
