import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import { useTradingStore } from '../trading/store/tradingStore';
import { formatCurrency, formatDateTime } from '../../shared/lib/formatters';
import clsx from 'clsx';

export default function ReportsPage() {
  const orders = useTradingStore((s) => s.orders);
  const [range, setRange] = useState('all');

  const matched = useMemo(() => {
    const now = Date.now();
    const rangeMs = { '7d': 7 * 864e5, '30d': 30 * 864e5, all: Infinity }[range];
    return orders
      .filter((o) => o.status === 'matched')
      .filter((o) => now - new Date(o.matchedAt).getTime() <= rangeMs);
  }, [orders, range]);

  const totalBuy = matched.filter((o) => o.side === 'BUY').reduce((s, o) => s + o.qty * o.price, 0);
  const totalSell = matched.filter((o) => o.side === 'SELL').reduce((s, o) => s + o.qty * o.price, 0);
  const fee = Math.round((totalBuy + totalSell) * 0.0015); // mock brokerage fee 0.15%

  function handleExport() {
    const header = 'Mã,Loại,Khối lượng,Giá,Giá trị,Thời gian khớp\n';
    const rows = matched.map((o) => `${o.symbol},${o.side === 'BUY' ? 'Mua' : 'Bán'},${o.qty},${o.price},${o.qty * o.price},${formatDateTime(o.matchedAt)}`).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sao-ke-giao-dich.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Báo cáo & Sao kê</h1>
          <p className="text-sm text-text-secondary mt-1">Lịch sử giao dịch đã khớp lệnh.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="text-sm rounded-md border border-border bg-bg-base px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
          <Button variant="ghost" onClick={handleExport}><Download size={14} /> Xuất CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><p className="text-xs text-text-secondary">Tổng giá trị mua</p><p className="text-lg font-bold font-data mt-1">{formatCurrency(totalBuy)}₫</p></Card>
        <Card><p className="text-xs text-text-secondary">Tổng giá trị bán</p><p className="text-lg font-bold font-data mt-1">{formatCurrency(totalSell)}₫</p></Card>
        <Card><p className="text-xs text-text-secondary">Phí giao dịch ước tính (0.15%)</p><p className="text-lg font-bold font-data mt-1">{formatCurrency(fee)}₫</p></Card>
      </div>

      <Card title="Sao kê giao dịch đã khớp" padded={false}>
        {matched.length === 0 ? (
          <p className="p-8 text-sm text-text-secondary text-center">Không có giao dịch nào trong khoảng thời gian này.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border">
                  <th className="px-4 py-2 font-medium">Mã</th>
                  <th className="px-4 py-2 font-medium">Loại</th>
                  <th className="px-4 py-2 font-medium text-right">KL</th>
                  <th className="px-4 py-2 font-medium text-right">Giá khớp</th>
                  <th className="px-4 py-2 font-medium text-right">Giá trị</th>
                  <th className="px-4 py-2 font-medium">Thời gian khớp</th>
                </tr>
              </thead>
              <tbody>
                {matched.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-data font-semibold">{o.symbol}</td>
                    <td className="px-4 py-2"><Badge variant={o.side === 'BUY' ? 'success' : 'danger'}>{o.side === 'BUY' ? 'Mua' : 'Bán'}</Badge></td>
                    <td className="px-4 py-2 text-right font-data">{o.qty.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 text-right font-data">{formatCurrency(o.price)}</td>
                    <td className="px-4 py-2 text-right font-data">{formatCurrency(o.qty * o.price)}</td>
                    <td className="px-4 py-2 text-text-secondary text-xs">{formatDateTime(o.matchedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
