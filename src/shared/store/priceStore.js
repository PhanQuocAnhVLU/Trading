import { create } from 'zustand';
import { STOCK_UNIVERSE, INDICES } from '../constants/stockUniverse';

function ceilPrice(ref) { return Math.round((ref * 1.07) / 10) * 10; }
function floorPrice(ref) { return Math.round((ref * 0.93) / 10) * 10; }

function initQuote(stock) {
  const ceiling = ceilPrice(stock.ref);
  const floor = floorPrice(stock.ref);
  return {
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    ref: stock.ref,
    ceiling,
    floor,
    price: stock.ref,
    prevPrice: stock.ref,
    open: stock.ref,
    high: stock.ref,
    low: stock.ref,
    volume: Math.floor(500_000 + Math.random() * 2_000_000),
    change: 0,
    changePct: 0,
    bids: makeBook(stock.ref, 'bid'),
    asks: makeBook(stock.ref, 'ask'),
    history: seedHistory(stock.ref),
    lastTick: Date.now(),
    // Foreign trading (khối ngoại) — mock
    foreignRoomPct: Math.round(10 + Math.random() * 39),
    foreignBuyVol: Math.floor(50_000 + Math.random() * 400_000),
    foreignSellVol: Math.floor(50_000 + Math.random() * 400_000),
  };
}

function makeBook(ref, side) {
  const rows = [];
  for (let i = 1; i <= 3; i++) {
    const step = i * 10 * (side === 'bid' ? -1 : 1);
    rows.push({
      price: Math.round((ref + step) / 10) * 10,
      qty: Math.floor(1000 + Math.random() * 9000),
    });
  }
  return rows;
}

function seedHistory(ref) {
  // 30 candles of daily-ish mock history ending at ref
  const arr = [];
  let p = ref * (0.9 + Math.random() * 0.05);
  for (let i = 0; i < 30; i++) {
    const drift = (Math.random() - 0.48) * ref * 0.015;
    const open = p;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.random() * ref * 0.005;
    const low = Math.min(open, close) - Math.random() * ref * 0.005;
    arr.push({ t: i, open, close, high, low, volume: Math.floor(300_000 + Math.random() * 1_500_000) });
    p = close;
  }
  // force last close to ref for continuity
  arr[arr.length - 1].close = ref;
  return arr;
}

const initialQuotes = {};
STOCK_UNIVERSE.forEach((s) => { initialQuotes[s.symbol] = initQuote(s); });

const initialIndices = {};
INDICES.forEach((idx) => { initialIndices[idx.code] = { code: idx.code, value: idx.base, prev: idx.base, change: 0, changePct: 0 }; });

export const usePriceStore = create((set, get) => ({
  quotes: initialQuotes,
  indices: initialIndices,
  running: false,
  haltedSymbols: {}, // symbol -> true when admin has paused trading

  toggleHalt: (symbol) => {
    set((s) => ({ haltedSymbols: { ...s.haltedSymbols, [symbol]: !s.haltedSymbols[symbol] } }));
  },

  start: () => {
    if (get().running) return;
    set({ running: true });
    const tick = () => {
      if (!get().running) return;
      set((state) => {
        const quotes = { ...state.quotes };
        // update a random subset of symbols each tick for a "live" feel
        const symbols = Object.keys(quotes);
        const halted = get().haltedSymbols;
        const subset = symbols.filter((sym) => !halted[sym] && Math.random() < 0.35);
        subset.forEach((sym) => {
          const q = quotes[sym];
          const volatility = q.ref * 0.0015;
          let next = q.price + (Math.random() - 0.5) * 2 * volatility;
          next = Math.min(q.ceiling, Math.max(q.floor, next));
          next = Math.round(next / 10) * 10;
          const change = next - q.ref;
          const changePct = (change / q.ref) * 100;
          quotes[sym] = {
            ...q,
            prevPrice: q.price,
            price: next,
            high: Math.max(q.high, next),
            low: Math.min(q.low, next),
            volume: q.volume + Math.floor(Math.random() * 5000),
            foreignBuyVol: q.foreignBuyVol + Math.floor(Math.random() * 2000),
            foreignSellVol: q.foreignSellVol + Math.floor(Math.random() * 2000),
            change,
            changePct,
            bids: makeBook(next, 'bid'),
            asks: makeBook(next, 'ask'),
            lastTick: Date.now(),
          };
        });
        // indices derived as weighted-ish average drift
        const indices = { ...state.indices };
        Object.keys(indices).forEach((code) => {
          const idx = indices[code];
          const drift = (Math.random() - 0.5) * idx.value * 0.0006;
          const value = Math.max(1, idx.value + drift);
          const change = value - idx.prev;
          indices[code] = { ...idx, value, change, changePct: (change / idx.prev) * 100 };
        });
        return { quotes, indices };
      });
      get()._timer = setTimeout(tick, 1500);
    };
    tick();
  },

  stop: () => {
    set({ running: false });
    if (get()._timer) clearTimeout(get()._timer);
  },

  getQuote: (symbol) => get().quotes[symbol],
}));
