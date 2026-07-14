import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import PriceText from '../../shared/components/PriceText';
import { usePriceStore } from '../../shared/store/priceStore';
import { useWatchlistStore } from './store/watchlistStore';
import { STOCK_UNIVERSE } from '../../shared/constants/stockUniverse';
import { formatPercent, formatVolume } from '../../shared/lib/formatters';
import clsx from 'clsx';

export default function WatchlistPage() {
  const quotes = usePriceStore((s) => s.quotes);
  const { lists, activeList, setActiveList, createList, removeList, toggleSymbol } = useWatchlistStore();
  const [newListName, setNewListName] = useState('');
  const [showAddSymbol, setShowAddSymbol] = useState(false);

  const symbols = lists[activeList] || [];
  const notInList = STOCK_UNIVERSE.filter((s) => !symbols.includes(s.symbol));

  function handleCreateList(e) {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName('');
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Danh sách theo dõi</h1>
        <p className="text-sm text-text-secondary mt-1">Quản lý nhiều danh sách mã cổ phiếu quan tâm.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {Object.keys(lists).map((name) => (
          <button
            key={name}
            onClick={() => setActiveList(name)}
            className={clsx(
              'group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              activeList === name ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:bg-bg-surface'
            )}
          >
            {name} <span className="opacity-70">({lists[name].length})</span>
            {Object.keys(lists).length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); removeList(name); }} className="opacity-0 group-hover:opacity-100">
                <X size={12} />
              </span>
            )}
          </button>
        ))}
        <form onSubmit={handleCreateList} className="flex items-center gap-1">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Danh sách mới..."
            className="text-xs px-2.5 py-1.5 rounded-full border border-dashed border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-28"
          />
          <button type="submit" className="p-1.5 rounded-full hover:bg-bg-surface text-text-secondary"><Plus size={14} /></button>
        </form>
      </div>

      <Card title={activeList} action={
        <Button size="sm" variant="ghost" onClick={() => setShowAddSymbol((v) => !v)}>
          <Plus size={14} /> Thêm mã
        </Button>
      } padded={false}>
        {showAddSymbol && (
          <div className="p-3 border-b border-border flex flex-wrap gap-2">
            {notInList.slice(0, 20).map((s) => (
              <button
                key={s.symbol}
                onClick={() => { toggleSymbol(s.symbol); }}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-bg-surface font-data"
              >
                + {s.symbol}
              </button>
            ))}
          </div>
        )}

        {symbols.length === 0 ? (
          <p className="p-8 text-sm text-text-secondary text-center">Danh sách trống. Thêm mã để bắt đầu theo dõi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="px-4 py-2 font-medium">Mã</th>
                <th className="px-4 py-2 font-medium text-right">Giá</th>
                <th className="px-4 py-2 font-medium text-right">+/-</th>
                <th className="px-4 py-2 font-medium text-right">%</th>
                <th className="px-4 py-2 font-medium text-right">KL</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => {
                const q = quotes[sym];
                if (!q) return null;
                return (
                  <tr key={sym} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">
                      <Link to={`/market/${sym}`} className="font-data font-semibold hover:text-primary">{sym}</Link>
                      <p className="text-xs text-text-secondary truncate max-w-[160px]">{q.name}</p>
                    </td>
                    <td className="px-4 py-2 text-right"><PriceText current={q.price} ref={q.ref} ceiling={q.ceiling} floor={q.floor} /></td>
                    <td className={clsx('px-4 py-2 text-right font-data', q.change >= 0 ? 'text-price-up' : 'text-price-down')}>
                      {q.change >= 0 ? '+' : ''}{q.change.toFixed(0)}
                    </td>
                    <td className={clsx('px-4 py-2 text-right font-data', q.change >= 0 ? 'text-price-up' : 'text-price-down')}>
                      {formatPercent(q.changePct)}
                    </td>
                    <td className="px-4 py-2 text-right font-data text-text-secondary">{formatVolume(q.volume)}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => toggleSymbol(sym)} className="text-text-disabled hover:text-danger" aria-label="Xoá khỏi danh sách">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
