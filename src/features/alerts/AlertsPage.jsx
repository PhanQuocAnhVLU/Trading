import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import { useAlertStore } from './store/alertStore';
import { STOCK_UNIVERSE } from '../../shared/constants/stockUniverse';
import { usePriceStore } from '../../shared/store/priceStore';
import { formatCurrency } from '../../shared/lib/formatters';

export default function AlertsPage() {
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlertStore();
  const quotes = usePriceStore((s) => s.quotes);
  const [form, setForm] = useState({ symbol: 'VNM', condition: 'above', target: '' });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.target) return;
    addAlert({ symbol: form.symbol, condition: form.condition, target: Number(form.target) });
    setForm({ ...form, target: '' });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Cảnh báo giá</h1>
        <p className="text-sm text-text-secondary mt-1">Nhận thông báo khi giá cổ phiếu chạm ngưỡng mong muốn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Tạo cảnh báo mới">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Mã cổ phiếu</label>
              <select
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                className="w-full rounded-sm border border-border bg-bg-base px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-data"
              >
                {STOCK_UNIVERSE.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Khi giá</span>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="rounded-sm border border-border bg-bg-base px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="above">vượt trên</option>
                <option value="below">giảm dưới</option>
              </select>
            </div>
            <input
              type="number" step={10} placeholder="Giá mục tiêu (đ)"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="w-full rounded-sm border border-border bg-bg-base px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-data"
            />
            {quotes[form.symbol] && (
              <p className="text-xs text-text-secondary">Giá hiện tại: <span className="font-data">{formatCurrency(quotes[form.symbol].price)}₫</span></p>
            )}
            <Button type="submit" className="w-full"><Bell size={14} /> Tạo cảnh báo</Button>
          </form>
        </Card>

        <Card title="Danh sách cảnh báo" className="lg:col-span-2" padded={false}>
          {alerts.length === 0 ? (
            <p className="p-8 text-sm text-text-secondary text-center">Chưa có cảnh báo nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border">
                  <th className="px-4 py-2 font-medium">Mã</th>
                  <th className="px-4 py-2 font-medium">Điều kiện</th>
                  <th className="px-4 py-2 font-medium text-right">Ngưỡng</th>
                  <th className="px-4 py-2 font-medium text-right">Trạng thái</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-data font-semibold">{a.symbol}</td>
                    <td className="px-4 py-2 text-text-secondary">{a.condition === 'above' ? 'Vượt trên' : 'Giảm dưới'}</td>
                    <td className="px-4 py-2 text-right font-data">{formatCurrency(a.target)}</td>
                    <td className="px-4 py-2 text-right">
                      {a.triggered ? (
                        <Badge variant="success">Đã kích hoạt</Badge>
                      ) : a.active ? (
                        <button onClick={() => toggleAlert(a.id)}><Badge variant="info">Đang theo dõi</Badge></button>
                      ) : (
                        <button onClick={() => toggleAlert(a.id)}><Badge variant="neutral">Tạm dừng</Badge></button>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => removeAlert(a.id)} className="text-text-disabled hover:text-danger" aria-label="Xoá cảnh báo">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
