import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Card from '../../shared/components/Card';
import Input from '../../shared/components/Input';
import MarketSessionBadge from '../../shared/components/MarketSessionBadge';
import MarketBreadth from '../../shared/components/MarketBreadth';
import { usePriceStore } from '../../shared/store/priceStore';
import { useWatchlistStore } from '../watchlist/store/watchlistStore';
import { formatVolume, formatCurrency } from '../../shared/lib/formatters';
import { SECTORS } from '../../shared/constants/stockUniverse';
import clsx from 'clsx';

function fmt(n) {
  return n.toLocaleString('vi-VN');
}

function cellColor(price, ref, ceiling, floor) {
  if (price >= ceiling) return 'text-price-ceiling';
  if (price <= floor) return 'text-price-floor';
  if (price > ref) return 'text-price-up';
  if (price < ref) return 'text-price-down';
  return 'text-price-reference';
}

export default function MarketPage() {
  const quotes = usePriceStore((s) => s.quotes);
  const haltedSymbols = usePriceStore((s) => s.haltedSymbols);
  const { toggleSymbol, isWatched } = useWatchlistStore();
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('Tất cả');

  const list = useMemo(() => {
    let arr = Object.values(quotes);
    if (sector !== 'Tất cả') arr = arr.filter((q) => q.sector === sector);
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter((q) => q.symbol.toLowerCase().includes(s) || q.name.toLowerCase().includes(s));
    }
    return arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [quotes, search, sector]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-text-primary">Bảng giá thị trường</h1>
          <p className="text-sm text-text-secondary mt-1">Dữ liệu mô phỏng theo cấu trúc bảng giá HOSE.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MarketSessionBadge />
          <div className="w-full sm:w-56">
            <Input id="search" placeholder="Tìm theo mã hoặc tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <Card padded>
        <MarketBreadth />
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Tất cả', ...SECTORS].map((sec) => (
          <button
            key={sec}
            onClick={() => setSector(sec)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
              sector === sec ? 'bg-primary text-bg-base border-primary' : 'border-border text-text-secondary hover:bg-bg-surface'
            )}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary px-1">
        <LegendDot className="bg-price-ceiling" label="Trần" />
        <LegendDot className="bg-price-up" label="Tăng" />
        <LegendDot className="bg-price-reference" label="Tham chiếu" />
        <LegendDot className="bg-price-down" label="Giảm" />
        <LegendDot className="bg-price-floor" label="Sàn" />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-data border-collapse min-w-[1400px]">
            <thead className="bg-bg-surface text-text-secondary select-none">
              <tr>
                <th rowSpan={2} className="sticky left-0 z-20 bg-bg-surface px-2 py-2 text-left font-semibold border-b border-r border-border min-w-[130px]">Mã CK</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-border text-price-reference">TC</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-border text-price-ceiling">Trần</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-border text-price-floor">Sàn</th>
                <th colSpan={6} className="px-2 py-1.5 text-center font-semibold border-b border-l border-border bg-price-up/5">Bên mua</th>
                <th colSpan={3} className="px-2 py-1.5 text-center font-semibold border-b border-l border-border bg-bg-elevated-2">Khớp lệnh</th>
                <th colSpan={6} className="px-2 py-1.5 text-center font-semibold border-b border-l border-border bg-price-down/5">Bên bán</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-l border-border">Cao</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-border">Thấp</th>
                <th rowSpan={2} className="px-2 py-2 text-right font-medium border-b border-border">Tổng KL</th>
                <th colSpan={2} className="px-2 py-1.5 text-center font-semibold border-b border-l border-border">NN (room)</th>
              </tr>
              <tr>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-l border-border">Giá 3</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 3</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">Giá 2</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 2</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">Giá 1</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 1</th>
                <th className="px-1.5 py-1.5 text-right font-semibold border-b border-l border-border">Giá</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">%</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-l border-border">Giá 1</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 1</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">Giá 2</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 2</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">Giá 3</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">KL 3</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-l border-border">Mua</th>
                <th className="px-1.5 py-1.5 text-right font-normal border-b border-border">Bán</th>
              </tr>
            </thead>
            <tbody>
              {list.map((q) => (
                <LadderRow key={q.symbol} q={q} watched={isWatched(q.symbol)} onToggle={() => toggleSymbol(q.symbol)} halted={!!haltedSymbols[q.symbol]} />
              ))}
              {list.length === 0 && (
                <tr><td colSpan={24} className="text-center py-10 text-text-secondary font-sans">Không tìm thấy mã phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={clsx('h-2 w-2 rounded-full', className)} />
      {label}
    </span>
  );
}

function LadderRow({ q, watched, onToggle, halted }) {
  const up = q.price > q.prevPrice;
  const down = q.price < q.prevPrice;
  const matchColor = cellColor(q.price, q.ref, q.ceiling, q.floor);
  // bids: [best(giá1), giá2, giá3] -> display giá3,giá2,giá1
  const [b1, b2, b3] = q.bids;
  const [a1, a2, a3] = q.asks;

  return (
    <tr className={clsx('transition-colors hover:bg-bg-elevated-2/60', up && 'animate-flash-up', down && 'animate-flash-down', halted && 'opacity-50')}>
      <td className="sticky left-0 z-10 bg-bg-elevated px-2 py-1.5 border-b border-r border-border">
        <div className="flex items-center gap-1.5 font-sans">
          <button onClick={onToggle} aria-label="Theo dõi" className="text-text-disabled hover:text-warning shrink-0">
            <Star size={12} fill={watched ? 'currentColor' : 'none'} className={watched ? 'text-warning' : ''} />
          </button>
          <Link to={`/market/${q.symbol}`} className="font-bold hover:text-primary">{q.symbol}</Link>
          {halted && <span className="text-[9px] font-semibold px-1 py-0.5 rounded-full bg-warning/15 text-warning whitespace-nowrap">Dừng</span>}
        </div>
      </td>
      <td className="px-2 py-1.5 text-right border-b border-border text-price-reference">{fmt(q.ref)}</td>
      <td className="px-2 py-1.5 text-right border-b border-border text-price-ceiling">{fmt(q.ceiling)}</td>
      <td className="px-2 py-1.5 text-right border-b border-border text-price-floor">{fmt(q.floor)}</td>

      <td className="px-1.5 py-1.5 text-right border-b border-l border-border text-price-up">{fmt(b3.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(b3.qty)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-price-up">{fmt(b2.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(b2.qty)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-price-up font-semibold">{fmt(b1.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(b1.qty)}</td>

      <td className={clsx('px-1.5 py-1.5 text-right border-b border-l border-border font-bold text-sm', matchColor)}>{fmt(q.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{formatVolume(q.volume)}</td>
      <td className={clsx('px-1.5 py-1.5 text-right border-b border-border font-semibold', matchColor)}>
        {q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%
      </td>

      <td className="px-1.5 py-1.5 text-right border-b border-l border-border text-price-down font-semibold">{fmt(a1.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(a1.qty)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-price-down">{fmt(a2.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(a2.qty)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-price-down">{fmt(a3.price)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-text-secondary">{fmt(a3.qty)}</td>

      <td className="px-2 py-1.5 text-right border-b border-l border-border text-text-secondary">{fmt(q.high)}</td>
      <td className="px-2 py-1.5 text-right border-b border-border text-text-secondary">{fmt(q.low)}</td>
      <td className="px-2 py-1.5 text-right border-b border-border text-text-secondary">{formatVolume(q.volume)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-l border-border text-info">{formatVolume(q.foreignBuyVol)}</td>
      <td className="px-1.5 py-1.5 text-right border-b border-border text-secondary">{formatVolume(q.foreignSellVol)}</td>
    </tr>
  );
}
