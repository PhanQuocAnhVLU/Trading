import { Link } from 'react-router-dom';
import { usePriceStore } from '../store/priceStore';
import { formatPercent } from '../lib/formatters';
import clsx from 'clsx';

function heatColor(changePct) {
  const clamped = Math.max(-3, Math.min(3, changePct));
  const intensity = Math.abs(clamped) / 3;
  if (clamped >= 0) {
    // green scale
    const alpha = 0.15 + intensity * 0.55;
    return `rgba(34, 197, 94, ${alpha})`;
  }
  const alpha = 0.15 + intensity * 0.55;
  return `rgba(240, 71, 90, ${alpha})`;
}

export default function MarketHeatmap({ limit = 30 }) {
  const quotes = usePriceStore((s) => s.quotes);
  const list = Object.values(quotes)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
      {list.map((q) => (
        <Link
          key={q.symbol}
          to={`/market/${q.symbol}`}
          style={{ backgroundColor: heatColor(q.changePct) }}
          className={clsx(
            'group relative rounded-md px-2.5 py-3 flex flex-col justify-between min-h-[64px] transition-transform duration-150 hover:scale-[1.04] hover:z-10',
            'border border-white/5'
          )}
        >
          <span className="text-xs font-bold font-data text-white drop-shadow">{q.symbol}</span>
          <span className={clsx('text-[11px] font-data font-semibold text-white/90 drop-shadow')}>
            {formatPercent(q.changePct)}
          </span>
        </Link>
      ))}
    </div>
  );
}
