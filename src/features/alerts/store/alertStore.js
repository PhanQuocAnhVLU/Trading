import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let alertSeq = 1;

export const useAlertStore = create(
  persist(
    (set, get) => ({
      alerts: [], // { id, symbol, condition: 'above'|'below', target, active, triggered, createdAt }
      notifications: [], // { id, message, type, read, createdAt }

      addAlert: ({ symbol, condition, target }) => {
        const alert = {
          id: 'ALT' + String(alertSeq++).padStart(4, '0'),
          symbol, condition, target,
          active: true,
          triggered: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ alerts: [alert, ...s.alerts] }));
      },

      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      toggleAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) })),

      checkAlerts: (quotes) => {
        const { alerts, notifications } = get();
        let changed = false;
        const newNotifications = [];
        const updated = alerts.map((a) => {
          if (!a.active || a.triggered) return a;
          const q = quotes[a.symbol];
          if (!q) return a;
          const hit = a.condition === 'above' ? q.price >= a.target : q.price <= a.target;
          if (hit) {
            changed = true;
            newNotifications.push({
              id: 'NOTI' + Date.now() + Math.random().toString(36).slice(2, 6),
              message: `${a.symbol} đã ${a.condition === 'above' ? 'vượt' : 'giảm dưới'} ${a.target.toLocaleString('vi-VN')} đ (hiện tại: ${q.price.toLocaleString('vi-VN')} đ)`,
              type: 'alert',
              read: false,
              createdAt: new Date().toISOString(),
            });
            return { ...a, triggered: true };
          }
          return a;
        });
        if (changed) {
          set({ alerts: updated, notifications: [...newNotifications, ...notifications] });
        }
      },

      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    }),
    { name: 'trading-alerts' }
  )
);
