import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../../shared/lib/firebase';
import { apiFetch } from '../../../shared/lib/api';

function mapAuthError(err) {
  const code = err?.code || '';
  const map = {
    'auth/email-already-in-use': 'Email đã được đăng ký.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu cần tối thiểu 6 ký tự.',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/too-many-requests': 'Bạn thử sai quá nhiều lần. Vui lòng thử lại sau ít phút.',
  };
  return map[code] || err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

function composeUser(fbUser, data) {
  const isGoogle = (fbUser.providerData || []).some((p) => p.providerId === 'google.com');
  return {
    uid: fbUser.uid,
    email: data.profile.email,
    fullName: data.profile.fullName,
    accountNo: data.profile.accountNo,
    role: data.profile.role,
    banned: data.profile.banned,
    cashBalance: data.cashBalance,
    authProvider: isGoogle ? 'google' : 'password',
  };
}

export const useAuthStore = create((set, get) => ({
  user: null,
  authLoading: true,
  users: [], // admin: full user list

  // Called once at app startup to restore session state.
  init: () => {
    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { set({ user: null, authLoading: false }); return; }
      try {
        const data = await apiFetch('/api/account/me', { method: 'POST', body: { fullName: fbUser.displayName } });
        set({ user: composeUser(fbUser, data), authLoading: false });
      } catch {
        set({ user: null, authLoading: false });
      }
    });
  },

  refreshProfile: async () => {
    if (!auth.currentUser) return;
    try {
      const data = await apiFetch('/api/account/me', { method: 'GET' });
      set((s) => (s.user ? { user: { ...s.user, cashBalance: data.cashBalance, banned: data.profile.banned, fullName: data.profile.fullName } } : {}));
    } catch { /* keep last known state */ }
  },

  register: async ({ email, password, fullName }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) await updateProfile(cred.user, { displayName: fullName });
      const data = await apiFetch('/api/account/me', { method: 'POST', body: { fullName } });
      set({ user: composeUser(cred.user, data) });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: mapAuthError(err) };
    }
  },

  login: async ({ email, password }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const data = await apiFetch('/api/account/me', { method: 'POST', body: {} });
      set({ user: composeUser(cred.user, data) });
      return { ok: true };
    } catch (err) {
      if (err?.statusCode === 403 || /tạm khoá/.test(err?.message || '')) {
        await signOut(auth);
        return { ok: false, error: err.message };
      }
      return { ok: false, error: mapAuthError(err) };
    }
  },

  loginWithGoogle: async (firebaseUser) => {
    try {
      const data = await apiFetch('/api/account/me', { method: 'POST', body: { fullName: firebaseUser.displayName } });
      set({ user: composeUser(firebaseUser, data) });
      return { ok: true };
    } catch (err) {
      await signOut(auth);
      return { ok: false, error: err.message || 'Không thể đăng nhập.' };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  updateUser: async (patch) => {
    try {
      await apiFetch('/api/account/me', { method: 'PATCH', body: patch });
      set((s) => (s.user ? { user: { ...s.user, ...patch } } : {}));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  // ---- Admin-only actions ----
  fetchUsers: async () => {
    const data = await apiFetch('/api/admin/users');
    set({ users: data.users });
  },
  adminToggleBan: async (uid) => {
    await apiFetch('/api/admin/ban', { method: 'POST', body: { uid } });
    await get().fetchUsers();
  },
  adminAdjustCash: async (uid, delta) => {
    await apiFetch('/api/admin/adjustCash', { method: 'POST', body: { uid, delta } });
    await get().fetchUsers();
  },
  adminDeleteUser: async (uid) => {
    await apiFetch('/api/admin/deleteUser', { method: 'POST', body: { uid } });
    await get().fetchUsers();
  },
}));
