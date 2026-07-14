import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [], // registered mock accounts: { email, password, fullName, accountNo, banned }

      register: ({ email, password, fullName }) => {
        const exists = get().users.some((u) => u.email === email);
        if (exists) return { ok: false, error: 'Email đã được đăng ký.' };
        const accountNo = '069C' + Math.floor(100000 + Math.random() * 900000);
        const newUser = { email, password, fullName, accountNo, role: 'investor', cashBalance: 200_000_000, banned: false };
        set((s) => ({ users: [...s.users, newUser] }));
        return { ok: true };
      },

      login: ({ email, password }) => {
        // Demo admin shortcut
        if (email === 'admin@demo.vn' && password === 'admin123') {
          const admin = { email, fullName: 'Quản trị viên', accountNo: 'ADMIN001', role: 'admin', cashBalance: 0 };
          set({ user: admin });
          return { ok: true };
        }
        const found = get().users.find((u) => u.email === email && u.password === password);
        if (!found) return { ok: false, error: 'Email hoặc mật khẩu không đúng.' };
        if (found.banned) return { ok: false, error: 'Tài khoản đã bị tạm khoá. Vui lòng liên hệ quản trị viên.' };
        set({ user: found });
        return { ok: true };
      },

      loginWithGoogle: (firebaseUser) => {
        const { email, displayName, uid } = firebaseUser;
        const existing = get().users.find((u) => u.email === email);
        if (existing) {
          if (existing.banned) return { ok: false, error: 'Tài khoản đã bị tạm khoá. Vui lòng liên hệ quản trị viên.' };
          set({ user: existing });
          return { ok: true };
        }
        const accountNo = '069C' + Math.floor(100000 + Math.random() * 900000);
        const newUser = {
          email,
          fullName: displayName || email.split('@')[0],
          accountNo,
          role: 'investor',
          cashBalance: 200_000_000,
          banned: false,
          authProvider: 'google',
          uid,
        };
        set((s) => ({ users: [...s.users, newUser], user: newUser }));
        return { ok: true };
      },

      logout: () => set({ user: null }),

      updateUser: (patch) => {
        set((s) => {
          if (!s.user) return {};
          const updatedUser = { ...s.user, ...patch };
          const users = s.users.map((u) => (u.email === s.user.email ? { ...u, ...patch } : u));
          return { user: updatedUser, users };
        });
      },

      adjustCash: (delta) => {
        set((s) => {
          if (!s.user) return {};
          const updatedUser = { ...s.user, cashBalance: (s.user.cashBalance || 0) + delta };
          const users = s.users.map((u) => (u.email === s.user.email ? updatedUser : u));
          return { user: updatedUser, users };
        });
      },

      // ---- Admin-only actions (act on any account, independent of current session) ----
      adminToggleBan: (email) => {
        set((s) => ({
          users: s.users.map((u) => (u.email === email ? { ...u, banned: !u.banned } : u)),
        }));
      },

      adminAdjustCash: (email, delta) => {
        set((s) => ({
          users: s.users.map((u) => (u.email === email ? { ...u, cashBalance: (u.cashBalance || 0) + delta } : u)),
        }));
      },

      adminDeleteUser: (email) => {
        set((s) => ({ users: s.users.filter((u) => u.email !== email) }));
      },
    }),
    { name: 'trading-auth' }
  )
);
