import { create } from 'zustand';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { apiFetch } from '../../../shared/lib/api';
import { useAuthStore } from '../../auth/store/authStore';

function toIso(ts) {
  return ts?.toDate ? ts.toDate().toISOString() : null;
}

export const useTradingStore = create((set, get) => ({
  orders: [], // real orders for the signed-in user, live from Firestore
  holdings: {}, // real holdings for the signed-in user, live from Firestore
  _unsubOrders: null,
  _unsubHoldings: null,

  // Subscribes to this user's own orders + holdings in real time.
  subscribe: (uid) => {
    get().unsubscribe();
    if (!uid) return;

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('uid', '==', uid)),
      (snap) => {
        const orders = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              symbol: data.symbol,
              side: data.side,
              type: data.type,
              qty: data.qty,
              price: data.price,
              status: data.status,
              createdAt: toIso(data.createdAt) || new Date().toISOString(),
              matchedAt: toIso(data.matchedAt),
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        set({ orders });
      },
      () => {}
    );

    const unsubHoldings = onSnapshot(
      collection(db, 'holdings', uid, 'positions'),
      (snap) => {
        const holdings = {};
        snap.forEach((d) => {
          const data = d.data();
          if (data.qty > 0) holdings[d.id] = data;
        });
        set({ holdings });
      },
      () => {}
    );

    set({ _unsubOrders: unsubOrders, _unsubHoldings: unsubHoldings });
  },

  unsubscribe: () => {
    if (get()._unsubOrders) get()._unsubOrders();
    if (get()._unsubHoldings) get()._unsubHoldings();
    set({ _unsubOrders: null, _unsubHoldings: null, orders: [], holdings: {} });
  },

  // Places a real order: the backend fetches the live market price, validates
  // it, and atomically settles cash + holdings in Firestore.
  placeOrder: async ({ symbol, side, type, qty, price }) => {
    try {
      const data = await apiFetch('/api/orders/place', { method: 'POST', body: { symbol, side, type, qty, price } });
      useAuthStore.getState().refreshProfile();
      return { ok: true, execPrice: data.execPrice, orderId: data.orderId };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  // Orders settle immediately at the live market price in this simulator
  // (see api/orders/place.js), so there's nothing pending left to cancel.
  cancelOrder: async () => ({
    ok: false,
    error: 'Lệnh được khớp ngay tại giá thị trường thực khi đặt nên không có trạng thái chờ để huỷ.',
  }),
}));
