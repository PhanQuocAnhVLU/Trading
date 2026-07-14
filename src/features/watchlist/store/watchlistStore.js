import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      lists: {
        'Danh sách của tôi': ['VNM', 'FPT', 'HPG', 'VCB', 'MWG'],
      },
      activeList: 'Danh sách của tôi',

      setActiveList: (name) => set({ activeList: name }),

      createList: (name) => {
        if (get().lists[name]) return;
        set((s) => ({ lists: { ...s.lists, [name]: [] }, activeList: name }));
      },

      removeList: (name) => {
        set((s) => {
          const lists = { ...s.lists };
          delete lists[name];
          const remaining = Object.keys(lists);
          return { lists, activeList: s.activeList === name ? (remaining[0] || null) : s.activeList };
        });
      },

      toggleSymbol: (symbol) => {
        set((s) => {
          const list = s.lists[s.activeList] || [];
          const exists = list.includes(symbol);
          const next = exists ? list.filter((x) => x !== symbol) : [...list, symbol];
          return { lists: { ...s.lists, [s.activeList]: next } };
        });
      },

      isWatched: (symbol) => {
        const list = get().lists[get().activeList] || [];
        return list.includes(symbol);
      },
    }),
    { name: 'trading-watchlist' }
  )
);
