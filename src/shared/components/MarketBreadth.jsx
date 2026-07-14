import { usePriceStore } from '../store/priceStore';

export default function MarketBreadth() {
  const quotes = usePriceStore((s) => s.quotes);
  const list = Object.values(quotes);

  const ceiling = list.filter((q) => q.price >= q.ceiling).length;
  const up = list.filter((q) => q.price > q.ref && q.price < q.ceiling).length;
  const ref = list.filter((q) => q.price === q.ref).length;
  const down = list.filter((q) => q.price < q.ref && q.price > q.floor).length;
  const floor = list.filter((q) => q.price <= q.floor).length;
  const total = list.length || 1;

  const segments = [
    { key: 'ceiling', count: ceiling, color: 'bg-price-ceiling', label: 'Trần' },
    { key: 'up', count: up, color: 'bg-price-up', label: 'Tăng' },
    { key: 'ref', count: ref, color: 'bg-price-reference', label: 'Đứng giá' },
    { key: 'down', count: down, color: 'bg-price-down', label: 'Giảm' },
    { key: 'floor', count: floor, color: 'bg-price-floor', label: 'Sàn' },
  ];

  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-bg-elevated-2">
        {segments.map((seg) => (
          <div key={seg.key} className={seg.color} style={{ width: `${(seg.count / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs">
        {segments.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5 text-text-secondary">
            <span className={`h-2 w-2 rounded-full ${seg.color}`} />
            {seg.label} <span className="font-data font-semibold text-text-primary">{seg.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
