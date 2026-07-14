import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../../shared/components/Card';
import { usePriceStore } from '../../shared/store/priceStore';
import { useAuthStore } from '../auth/store/authStore';
import { useTradingStore } from '../trading/store/tradingStore';
import { formatCurrency, formatPercent } from '../../shared/lib/formatters';
import PriceText from '../../shared/components/PriceText';
import clsx from 'clsx';

const COLORS = ['#0052CC', '#6554C0', '#00875A', '#FF991F', '#DE350B', '#0065FF', '#B345C7', '#0088CC', '#F5A623', '#57D9A3'];

export default function PortfolioPage() {
  const quotes = usePriceStore((s) => s.quotes);
  const user = useAuthStore((s) => s.user);
  const holdings = useTradingStore((s) => s.holdings);

  const rows = useMemo(() => {
    return Object.entries(holdings)
      .filter(([, h]) => h.qty > 0)
      .map(([symbol, h]) => {
        const q = quotes[symbol];
        const marketValue = q ? q.price * h.qty : 0;
        const costValue = h.avgCost * h.qty;
        const pnl = marketValue - costValue;
        const pnlPct = costValue > 0 ? (pnl / costValue) * 100 : 0;
        return { symbol, qty: h.qty, avgCost: h.avgCost, q, marketValue, costValue, pnl, pnlPct };
      })
      .sort((a, b) => b.marketValue - a.marketValue);
  }, [holdings, quotes]);

  const totalMarketValue = rows.reduce((sum, r) => sum + r.marketValue, 0);
  const totalCostValue = rows.reduce((sum, r) => sum + r.costValue, 0);
  const totalPnl = totalMarketValue - totalCostValue;
  const totalPnlPct = totalCostValue > 0 ? (totalPnl / totalCostValue) * 100 : 0;
  const totalAssets = (user?.cashBalance || 0) + totalMarketValue;

  const allocationData = rows.map((r) => ({ name: r.symbol, value: r.marketValue }));
  if (user?.cashBalance > 0) allocationData.push({ name: 'Tiền mặt', value: user.cashBalance });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Danh mục đầu tư</h1>
        <p className="text-sm text-text-secondary mt-1">Tổng hợp tài sản và hiệu suất đầu tư.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Tổng tài sản" value={`${formatCurrency(totalAssets)}₫`} />
        <SummaryCard label="Giá trị chứng khoán" value={`${formatCurrency(totalMarketValue)}₫`} />
        <SummaryCard label="Tiền mặt" value={`${formatCurrency(user?.cashBalance)}₫`} />
        <SummaryCard
          label="Lãi/lỗ tạm tính"
          value={`${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}₫`}
          sub={formatPercent(totalPnlPct)}
          valueClass={totalPnl >= 0 ? 'text-price-up' : 'text-price-down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Danh mục sở hữu" className="lg:col-span-2" padded={false}>
          {rows.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-text-secondary">Bạn chưa sở hữu mã cổ phiếu nào.</p>
              <Link to="/trading" className="text-primary text-sm hover:underline mt-2 inline-block">Đặt lệnh mua ngay</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-border">
                    <th className="px-4 py-2 font-medium">Mã</th>
                    <th className="px-4 py-2 font-medium text-right">KL</th>
                    <th className="px-4 py-2 font-medium text-right">Giá vốn TB</th>
                    <th className="px-4 py-2 font-medium text-right">Giá hiện tại</th>
                    <th className="px-4 py-2 font-medium text-right">Giá trị</th>
                    <th className="px-4 py-2 font-medium text-right">Lãi/lỗ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.symbol} className="border-b border-border last:border-0">
                      <td className="px-4 py-2">
                        <Link to={`/market/${r.symbol}`} className="font-data font-semibold hover:text-primary">{r.symbol}</Link>
                      </td>
                      <td className="px-4 py-2 text-right font-data">{r.qty.toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-2 text-right font-data">{formatCurrency(r.avgCost)}</td>
                      <td className="px-4 py-2 text-right">
                        {r.q && <PriceText current={r.q.price} ref={r.q.ref} ceiling={r.q.ceiling} floor={r.q.floor} />}
                      </td>
                      <td className="px-4 py-2 text-right font-data">{formatCurrency(r.marketValue)}</td>
                      <td className={clsx('px-4 py-2 text-right font-data', r.pnl >= 0 ? 'text-price-up' : 'text-price-down')}>
                        {r.pnl >= 0 ? '+' : ''}{formatCurrency(r.pnl)} ({formatPercent(r.pnlPct)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Phân bổ tài sản">
          {allocationData.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-12">Chưa có dữ liệu phân bổ.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v) + '₫'} contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, valueClass }) {
  return (
    <Card>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={clsx('text-lg font-bold font-data mt-1', valueClass)}>{value}</p>
      {sub && <p className={clsx('text-xs font-data mt-0.5', valueClass)}>{sub}</p>}
    </Card>
  );
}
