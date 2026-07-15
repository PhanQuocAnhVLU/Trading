import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiFetch } from '../lib/api';
import { STOCK_UNIVERSE, INDICES } from '../constants/stockUniverse';

// Maps our display index codes to the codes vnstock-js/VietCap expects.
// If an index doesn't come back from the API, double-check this mapping
// against https://vnstock-js-docs.vercel.app/ and adjust here.
const INDEX_CODE_MAP = { 'VN-INDEX': 'VNINDEX', VN30: 'VN30', 'HNX-INDEX': 'HNXINDEX' };

const POLL_INTERVAL_MS = 5000;

function ceilPrice(ref) { return Math.round((ref * 1.07) / 10) * 10; }
function floorPrice(ref) { return Math.round((ref * 0.93) / 10) * 10; }

function seedQuote(stock) {
  return {
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    ref: stock.ref,
    ceiling: ceilPrice(stock.ref),
    floor: floorPrice(stock.ref),
    price: stock.ref,
    prevPrice: stock.ref,
    open: stock.ref,
    high: stock.ref,
    low: stock.ref,
    volume: 0,
    change: 0,
    changePct: 0,
    bids: [],
    asks: [],
    history: null,
    lastTick: 0,
    foreignRoomPct: 0,
    foreignBuyVol: 0,
    foreignSellVol: 0,
  };
}

const initialQuotes = {};
STOCK_UNIVERSE.forEach((s) => { initialQuotes[s.symbol] = seedQuote(s); });

const initialIndices = {};
INDICES.forEach((idx) => { initialIndices[idx.code] = { code: idx.code, value: idx.base, prev: idx.base, change: 0, changePct: 0 }; });

const SYMBOLS = STOCK_UNIVERSE.map((s) => s.symbol);
const NAME_LOOKUP = Object.fromEntries(STOCK_UNIVERSE.map((s) => [s.symbol, s]));

export const usePriceStore = create((set, get) => ({
  quotes: initialQuotes,
  indices: initialIndices,
  haltedSymbols: {},
  running: false,
  loaded: false,
  lastError: null,
  lastUpdatedAt: null,

  // Starts polling the real-market backend (/api/market/board) and subscribes
  // to the live "halted symbols" list controlled by admins in Firestore.
  start: () => {
    if (get().running) return;
    set({ running: true });

    if (!get()._unsubHalt) {
      const unsub = onSnapshot(
        doc(db, 'marketControl', 'halted'),
        (snap) => set({ haltedSymbols: snap.exists() ? snap.data() : {} }),
        () => {} // ignore permission errors while signed out
      );
      set({ _unsubHalt: unsub });
    }

    const poll = async () => {
      if (!get().running) return;
      try {
        const symbolsParam = SYMBOLS.join(',');
        const indicesParam = Object.values(INDEX_CODE_MAP).join(',');
        const res = await fetch(`/api/market/board?symbols=${symbolsParam}&indices=${indicesParam}`);
        const data = await res.json();
        if (data.ok) {
          set((state) => {
            const quotes = { ...state.quotes };
            Object.entries(data.quotes).forEach(([sym, q]) => {
              if (!q) return;
              const meta = NAME_LOOKUP[sym];
              const prev = quotes[sym];
              quotes[sym] = {
                ...prev,
                ...q,
                symbol: sym,
                name: meta?.name || prev?.name,
                sector: meta?.sector || prev?.sector,
                prevPrice: prev?.price ?? q.price,
              };
            });
            const indices = { ...state.indices };
            INDICES.forEach((idx) => {
              const code = INDEX_CODE_MAP[idx.code];
              const val = data.indices?.[code];
              if (val) indices[idx.code] = { code: idx.code, ...val };
            });
            return { quotes, indices, loaded: true, lastError: null, lastUpdatedAt: data.updatedAt };
          });
        } else {
          set({ lastError: data.error });
        }
      } catch (err) {
        set({ lastError: err.message });
      }
      if (get().running) set({ _timer: setTimeout(poll, POLL_INTERVAL_MS) });
    };
    poll();
  },

  stop: () => {
    set({ running: false });
    if (get()._timer) clearTimeout(get()._timer);
    if (get()._unsubHalt) { get()._unsubHalt(); set({ _unsubHalt: null }); }
  },

  // Admin-only: toggles a trading halt. The change propagates to every
  // client through the Firestore listener set up in start().
  toggleHalt: async (symbol) => {
    await apiFetch('/api/admin/halt', { method: 'POST', body: { symbol } });
  },

  // Lazily fetches real OHLCV history for a symbol's candlestick chart.
  loadHistory: async (symbol, days = 90) => {
    try {
      const res = await fetch(`/api/market/history?symbol=${symbol}&days=${days}`);
      const data = await res.json();
      if (data.ok) {
        set((state) => ({
          quotes: { ...state.quotes, [symbol]: { ...state.quotes[symbol], history: data.candles } },
        }));
      }
      return data;
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  getQuote: (symbol) => get().quotes[symbol],
}));
