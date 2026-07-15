import { auth } from './firebase';

async function authHeader() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch(path, { method = 'GET', body, auth: needsAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (needsAuth) Object.assign(headers, await authHeader());

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { ok: false, error: `Lỗi máy chủ (HTTP ${res.status}).` };
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Yêu cầu thất bại (HTTP ${res.status}).`);
  }
  return data;
}
