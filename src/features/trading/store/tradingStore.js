import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let orderSeq = 1;

export const useTradingStore = create(
  persist(
    (set, get) => ({
      orders: [], // { id, symbol, side, type, qty, price, status, createdAt, matchedAt }
      holdings: {}, // symbol -> { qty, avgCost }

      placeOrder: ({ symbol, side, type, qty, price, cashAvailable, onCash, onHolding }) => {
        const orderValue = qty * price;

        if (side === 'BUY') {
          if (orderValue > cashAvailable) {
            return { ok: false, error: 'Số dư tiền mặt không đủ để đặt lệnh.' };
          }
        } else {
          const holding = get().holdings[symbol];
          const ownedQty = holding ? holding.qty : 0;
          if (qty > ownedQty) {
            return { ok: false, error: 'Khối lượng bán vượt quá số lượng sở hữu.' };
          }
        }

        const order = {
          id: 'ORD' + String(orderSeq++).padStart(6, '0') + '-' + Date.now(),
          symbol, side, type, qty, price,
          status: 'pending',
          createdAt: new Date().toISOString(),
          matchedAt: null,
        };

        set((s) => ({ orders: [order, ...s.orders] }));

        // Reserve cash immediately for BUY (simulate margin hold)
        if (side === 'BUY' && onCash) onCash(-orderValue);

        // Simulate matching engine latency
        setTimeout(() => {
          set((s) => {
            const orders = s.orders.map((o) => (o.id === order.id ? { ...o, status: 'matched', matchedAt: new Date().toISOString() } : o));
            const holdings = { ...s.holdings };
            const h = holdings[symbol] || { qty: 0, avgCost: 0 };
            if (side === 'BUY') {
              const totalCost = h.avgCost * h.qty + price * qty;
              const newQty = h.qty + qty;
              holdings[symbol] = { qty: newQty, avgCost: newQty ? totalCost / newQty : 0 };
            } else {
              const newQty = h.qty - qty;
              holdings[symbol] = { qty: newQty, avgCost: newQty > 0 ? h.avgCost : 0 };
              if (onCash) onCash(orderValue);
            }
            return { orders, holdings };
          });
          if (onHolding) onHolding();
        }, 1800 + Math.random() * 1200);

        return { ok: true, order };
      },

      cancelOrder: (id, { onCash } = {}) => {
        set((s) => {
          const target = s.orders.find((o) => o.id === id);
          if (!target || target.status !== 'pending') return {};
          if (target.side === 'BUY' && onCash) onCash(target.qty * target.price);
          return { orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)) };
        });
      },
    }),
    { name: 'trading-orders' }
  )
);
