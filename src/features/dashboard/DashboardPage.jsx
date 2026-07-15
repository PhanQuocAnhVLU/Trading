import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Wallet, PieChart, Flame } from 'lucide-react';
import Card from '../../shared/components/Card';
import Badge from '../../shared/components/Badge';
import Sparkline from '../../shared/components/Sparkline';
import MarketHeatmap from '../../shared/components/MarketHeatmap';
import MarketSessionBadge from '../../shared/components/MarketSessionBadge';
import MarketBreadth from '../../shared/components/MarketBreadth';
import AnimatedNumber from '../../shared/components/AnimatedNumber';
import { usePriceStore } from '../../shared/store/priceStore';
import { useAuthStore } from '../auth/store/authStore';
import { useTradingStore } from '../trading/store/tradingStore';
import { formatCurrency, formatPercent, formatVolume } from '../../shared/lib/formatters';
import PriceText from '../../shared/components/PriceText';
import clsx from 'clsx';

export default function DashboardPage() {
  const quotes = usePriceStore((s) => s.quotes);
  const indices = usePriceStore((s) => s.indices);
  const loadHistory = usePriceStore((s) => s.loadHistory);
  const user = useAuthStore((s) => s.user);
  const holdings = useTradingStore((s) => s.holdings);
  const orders = useTradingStore((s) => s.orders);

  const list = Object.values(quotes);

  const topGainers = useMemo(() => [...list].sort((a, b) => b.changePct - a.changePct).slice(0, 5), [quotes]);
  const topLosers = useMemo(() => [...list].sort((a, b) => a.changePct - b.changePct).slice(0, 5), [quotes]);

  useEffect(() => {
    [...topGainers, ...topLosers].forEach((q) => {
      if (q && !q.history) loadHistory(q.symbol, 20);
    });
  }, [topGainers, topLosers]);

  const { marketValue, costValue } = useMemo(() => {
    let mv = 0, cv = 0;
    Object.entries(holdings).forEach(([symbol, h]) => {
      if (h.qty <= 0) return;
      const q = quotes[symbol];
      if (!q) return;
      mv += q.price * h.qty;
      cv += h.avgCost * h.qty;
    });
    return { marketValue: mv, costValue: cv };
  }, [holdings, quotes]);

  const totalAssets = (user?.cashBalance || 0) + marketValue;
  const pnl = marketValue - costValue;
  const pnlPct = costValue > 0 ? (pnl / costValue) * 100 : 0;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-text-primary">
            Xin chào, {user?.fullName?.split(' ').slice(-1)[0] || 'bạn'} <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">Tổng quan tài khoản và thị trường hôm nay.</p>
        </div>
        <MarketSessionBadge />
      </div>

      {/* Market breadth */}
      <Card padded>
        <MarketBreadth />
      </Card>

      {/* Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.values(indices).map((idx) => (
          <Card key={idx.code} padded className="relative overflow-hidden">
            <div className={clsx('absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-20', idx.change >= 0 ? 'bg-price-up' : 'bg-price-down')} />
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-semibold text-text-secondary tracking-wide">{idx.code}</p>
              {idx.change >= 0 ? <ArrowUpRight size={16} className="text-price-up" /> : <ArrowDownRight size={16} className="text-price-down" />}
            </div>
            <p className={`relative mt-2 text-3xl font-bold font-display font-data ${idx.change >= 0 ? 'text-price-up' : 'text-price-down'}`}>
              <AnimatedNumber value={idx.value} formatter={(v) => v.toFixed(2)} />
            </p>
            <p className={`relative text-sm font-data mt-0.5 ${idx.change >= 0 ? 'text-price-up' : 'text-price-down'}`}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({formatPercent(idx.changePct)})
            </p>
          </Card>
        ))}
      </div>

      {/* Asset overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-2 text-text-secondary">
            <Wallet size={16} />
            <span className="text-sm font-medium">Tổng tài sản</span>
          </div>
          <p className="relative text-3xl font-bold font-display font-data mt-2 text-gradient">
            <AnimatedNumber value={totalAssets} formatter={(v) => Math.round(v).toLocaleString('vi-VN')} />₫
          </p>
          <div className="relative mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Tiền mặt</span>
              <span className="font-data">{formatCurrency(user?.cashBalance)}₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Giá trị chứng khoán</span>
              <span className="font-data">{formatCurrency(marketValue)}₫</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-text-secondary flex items-center gap-1"><PieChart size={13} /> Lãi/lỗ tạm tính</span>
              <span className={`font-data font-semibold ${pnl >= 0 ? 'text-price-up' : 'text-price-down'}`}>
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}₫ ({formatPercent(pnlPct)})
              </span>
            </div>
          </div>
          <Link to="/trading">
            <button className="relative mt-4 w-full bg-primary text-bg-base text-sm font-semibold py-2.5 rounded-md hover:bg-primary-hover transition-colors shadow-glow">
              Đặt lệnh ngay
            </button>
          </Link>
        </Card>

        <Card title="Top tăng giá" className="lg:col-span-1">
          <MoverList items={topGainers} positive />
        </Card>
        <Card title="Top giảm giá" className="lg:col-span-1">
          <MoverList items={topLosers} positive={false} />
        </Card>
      </div>

      {/* Heatmap */}
      <Card
        title="Bản đồ nhiệt thị trường"
        action={<span className="flex items-center gap-1 text-xs text-text-secondary"><Flame size={13} className="text-secondary" /> Theo khối lượng giao dịch</span>}
      >
        <MarketHeatmap limit={24} />
      </Card>

      {/* Recent orders */}
      <Card title="Lệnh gần đây" action={<Link to="/trading" className="text-xs text-primary hover:underline">Xem tất cả</Link>} padded={false}>
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary text-center">Chưa có lệnh nào được đặt.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="px-4 py-2 font-medium">Mã</th>
                <th className="px-4 py-2 font-medium">Loại</th>
                <th className="px-4 py-2 font-medium text-right">KL</th>
                <th className="px-4 py-2 font-medium text-right">Giá</th>
                <th className="px-4 py-2 font-medium text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-data font-medium">{o.symbol}</td>
                  <td className="px-4 py-2">
                    <Badge variant={o.side === 'BUY' ? 'success' : 'danger'}>{o.side === 'BUY' ? 'Mua' : 'Bán'}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right font-data">{o.qty.toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2 text-right font-data">{formatCurrency(o.price)}</td>
                  <td className="px-4 py-2 text-right">
                    <Badge variant={o.status === 'matched' ? 'success' : o.status === 'cancelled' ? 'neutral' : 'warning'}>
                      {o.status === 'matched' ? 'Khớp' : o.status === 'cancelled' ? 'Đã huỷ' : 'Chờ khớp'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function MoverList({ items, positive }) {
  return (
    <div className="divide-y divide-border">
      {items.map((q) => (
        <Link key={q.symbol} to={`/market/${q.symbol}`} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 hover:bg-bg-elevated-2 -mx-1 px-1 rounded-md transition-colors">
          <div>
            <p className="text-sm font-semibold font-data">{q.symbol}</p>
            <p className="text-xs text-text-secondary">{formatVolume(q.volume)}</p>
          </div>
          <Sparkline data={q.history || []} positive={positive} width={64} height={28} />
          <div className="text-right">
            <PriceText current={q.price} ref={q.ref} ceiling={q.ceiling} floor={q.floor} className="text-sm font-semibold" />
            <p className={`text-xs font-data ${positive ? 'text-price-up' : 'text-price-down'}`}>{formatPercent(q.changePct)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
