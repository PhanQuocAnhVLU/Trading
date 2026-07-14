import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';
import Card from '../../shared/components/Card';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import PriceText from '../../shared/components/PriceText';
import { usePriceStore } from '../../shared/store/priceStore';
import { useAuthStore } from '../auth/store/authStore';
import { useTradingStore } from './store/tradingStore';
import { STOCK_UNIVERSE } from '../../shared/constants/stockUniverse';
import { formatCurrency } from '../../shared/lib/formatters';

export default function TradingPage() {
  const [params, setParams] = useSearchParams();
  const quotes = usePriceStore((s) => s.quotes);
  const haltedSymbols = usePriceStore((s) => s.haltedSymbols);
  const { user, adjustCash } = useAuthStore();
  const { orders, holdings, placeOrder, cancelOrder } = useTradingStore();

  const [symbol, setSymbol] = useState(params.get('symbol') || 'VNM');
  const [side, setSide] = useState(params.get('side') || 'BUY');
  const [qty, setQty] = useState(100);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState(null);

  const q = quotes[symbol];

  useEffect(() => {
    if (q && !price) setPrice(q.price);
  }, [q]);

  useEffect(() => {
    if (params.get('symbol') && params.get('symbol') !== symbol) setSymbol(params.get('symbol'));
    if (params.get('side') && params.get('side') !== side) setSide(params.get('side'));
    // eslint-disable-next-line
  }, [params]);

  const holding = holdings[symbol];
  const orderValue = qty * (Number(price) || 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const matchedOrders = orders.filter((o) => o.status !== 'pending');

  function handleSymbolChange(sym) {
    setSymbol(sym);
    setParams({ symbol: sym, side });
    setPrice('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!q) return;
    if (haltedSymbols[symbol]) {
      setMessage({ type: 'error', text: `Mã ${symbol} đang bị tạm dừng giao dịch bởi quản trị viên.` });
      return;
    }
    const numQty = Number(qty);
    const numPrice = Number(price);
    if (!numQty || numQty <= 0 || numQty % 100 !== 0) {
      setMessage({ type: 'error', text: 'Khối lượng phải là bội số của 100.' });
      return;
    }
    if (!numPrice || numPrice < q.floor || numPrice > q.ceiling) {
      setMessage({ type: 'error', text: `Giá đặt phải trong khoảng ${formatCurrency(q.floor)} – ${formatCurrency(q.ceiling)}.` });
      return;
    }
    const result = placeOrder({
      symbol, side, type: 'LO', qty: numQty, price: numPrice,
      cashAvailable: user?.cashBalance || 0,
      onCash: (delta) => adjustCash(delta),
    });
    if (!result.ok) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `Đã đặt lệnh ${side === 'BUY' ? 'MUA' : 'BÁN'} ${numQty} ${symbol} @ ${formatCurrency(numPrice)}. Đang chờ khớp...` });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Đặt lệnh</h1>
        <p className="text-sm text-text-secondary mt-1">Lệnh giới hạn (LO) — mô phỏng khớp lệnh sau 2-3 giây.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Phiếu lệnh" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Mã cổ phiếu</label>
              <select
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="w-full rounded-sm border border-border bg-bg-base px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-data"
              >
                {STOCK_UNIVERSE.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
              </select>
            </div>

            {q && (
              <div className="flex items-center justify-between text-sm bg-bg-surface rounded-md px-3 py-2">
                <span className="text-text-secondary">Giá khớp gần nhất</span>
                <PriceText current={q.price} ref={q.ref} ceiling={q.ceiling} floor={q.floor} className="font-semibold" />
              </div>
            )}

            {haltedSymbols[symbol] && (
              <div className="flex items-center gap-2 text-sm bg-warning/10 border border-warning/30 text-warning rounded-md px-3 py-2">
                <AlertTriangle size={15} className="shrink-0" />
                Mã {symbol} đang bị quản trị viên tạm dừng giao dịch.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSide('BUY')}
                className={clsx('py-2 rounded-md text-sm font-semibold border transition-colors',
                  side === 'BUY' ? 'bg-price-up text-white border-price-up' : 'border-border text-text-secondary hover:bg-bg-surface')}>
                Mua
              </button>
              <button type="button" onClick={() => setSide('SELL')}
                className={clsx('py-2 rounded-md text-sm font-semibold border transition-colors',
                  side === 'SELL' ? 'bg-price-down text-white border-price-down' : 'border-border text-text-secondary hover:bg-bg-surface')}>
                Bán
              </button>
            </div>

            <Input id="qty" type="number" step={100} min={100} label="Khối lượng" value={qty} onChange={(e) => setQty(e.target.value)} suffix="CP" />
            <Input id="price" type="number" step={10} label="Giá đặt" value={price} onChange={(e) => setPrice(e.target.value)} suffix="đ" />

            <div className="text-sm space-y-1.5 pt-2 border-t border-border">
              <div className="flex justify-between"><span className="text-text-secondary">Giá trị lệnh</span><span className="font-data font-medium">{formatCurrency(orderValue)}₫</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Tiền mặt khả dụng</span><span className="font-data">{formatCurrency(user?.cashBalance)}₫</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Đang sở hữu</span><span className="font-data">{(holding?.qty || 0).toLocaleString('vi-VN')} CP</span></div>
            </div>

            {message && (
              <p className={clsx('text-sm', message.type === 'error' ? 'text-danger' : 'text-success')}>{message.text}</p>
            )}

            <Button type="submit" variant={side === 'BUY' ? 'buy' : 'sell'} className="w-full" disabled={!!haltedSymbols[symbol]}>
              Đặt lệnh {side === 'BUY' ? 'MUA' : 'BÁN'}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card title={`Sổ lệnh trong ngày (${pendingOrders.length} đang chờ)`} padded={false}>
            <OrderTable orders={pendingOrders} onCancel={(id) => cancelOrder(id, { onCash: (d) => adjustCash(d) })} showCancel />
          </Card>
          <Card title="Lịch sử lệnh" padded={false}>
            <OrderTable orders={matchedOrders} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderTable({ orders, onCancel, showCancel }) {
  if (orders.length === 0) {
    return <p className="p-6 text-sm text-text-secondary text-center">Không có lệnh nào.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-secondary border-b border-border">
            <th className="px-4 py-2 font-medium">Mã</th>
            <th className="px-4 py-2 font-medium">Loại</th>
            <th className="px-4 py-2 font-medium text-right">KL</th>
            <th className="px-4 py-2 font-medium text-right">Giá</th>
            <th className="px-4 py-2 font-medium">Thời gian</th>
            <th className="px-4 py-2 font-medium text-right">Trạng thái</th>
            {showCancel && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-data font-medium">{o.symbol}</td>
              <td className="px-4 py-2"><Badge variant={o.side === 'BUY' ? 'success' : 'danger'}>{o.side === 'BUY' ? 'Mua' : 'Bán'}</Badge></td>
              <td className="px-4 py-2 text-right font-data">{o.qty.toLocaleString('vi-VN')}</td>
              <td className="px-4 py-2 text-right font-data">{formatCurrency(o.price)}</td>
              <td className="px-4 py-2 text-text-secondary text-xs">{new Date(o.createdAt).toLocaleTimeString('vi-VN')}</td>
              <td className="px-4 py-2 text-right">
                <Badge variant={o.status === 'matched' ? 'success' : o.status === 'cancelled' ? 'neutral' : 'warning'}>
                  {o.status === 'matched' ? 'Đã khớp' : o.status === 'cancelled' ? 'Đã huỷ' : 'Chờ khớp'}
                </Badge>
              </td>
              {showCancel && (
                <td className="px-4 py-2 text-right">
                  <button onClick={() => onCancel(o.id)} className="text-xs text-danger hover:underline">Huỷ</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
