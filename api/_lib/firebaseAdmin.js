import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Reads service-account credentials from environment variables.
// Set these in Vercel → Project Settings → Environment Variables:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste the full key; keep the \n escape sequences)
function ensureApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Thiếu biến môi trường Firebase Admin (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY). Xem README để cấu hình trên Vercel.'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getDb() {
  ensureApp();
  return getFirestore();
}

export function getAdminAuth() {
  ensureApp();
  return getAuth();
}

// Verifies the Firebase ID token sent by the client in the Authorization header
// and returns the decoded token ({ uid, email, ... }). Throws if missing/invalid.
export async function requireUser(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Thiếu token xác thực.');
    err.statusCode = 401;
    throw err;
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded;
  } catch {
    const err = new Error('Token không hợp lệ hoặc đã hết hạn.');
    err.statusCode = 401;
    throw err;
  }
}

// Admin allowlist: comma-separated emails in ADMIN_EMAILS env var, e.g.
//   ADMIN_EMAILS=owner@gmail.com,ops@gmail.com
export function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export async function requireAdmin(req) {
  const decoded = await requireUser(req);
  if (!isAdminEmail(decoded.email)) {
    const err = new Error('Tài khoản này không có quyền quản trị.');
    err.statusCode = 403;
    throw err;
  }
  return decoded;
}

export function sendError(res, err) {
  const status = err.statusCode || 500;
  res.status(status).json({ ok: false, error: err.message || 'Lỗi máy chủ không xác định.' });
}
