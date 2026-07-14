import { usePriceStore } from '../store/priceStore';
import { formatCurrency, formatPercent } from '../lib/formatters';
import clsx from 'clsx';

export default function TickerTape() {
  const quotes = usePriceStore((s) => s.quotes);
  const list = Object.values(quotes);
  const doubled = [...list, ...list];

  return (
    <div className="relative overflow-hidden border-b border-border bg-bg-base h-9 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-bg-base to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-bg-base to-transparent pointer-events-none" />
      <div className="flex whitespace-nowrap animate-marquee">
        {doubled.map((q, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs font-data border-r border-border/60">
            <span className="font-semibold text-text-primary">{q.symbol}</span>
            <span className={q.change >= 0 ? 'text-price-up' : 'text-price-down'}>{formatCurrency(q.price)}</span>
            <span className={clsx('text-[11px]', q.change >= 0 ? 'text-price-up' : 'text-price-down')}>
              {q.change >= 0 ? '▲' : '▼'} {formatPercent(q.changePct)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
