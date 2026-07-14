import { useNavigate, useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import PriceText from '../../shared/components/PriceText';
import Badge from '../../shared/components/Badge';
import CandlestickChart from '../../shared/components/CandlestickChart';
import MarketSessionBadge from '../../shared/components/MarketSessionBadge';
import { usePriceStore } from '../../shared/store/priceStore';
import { useWatchlistStore } from '../watchlist/store/watchlistStore';
import { formatCurrency, formatPercent, formatVolume } from '../../shared/lib/formatters';
import clsx from 'clsx';

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const q = usePriceStore((s) => s.quotes[symbol]);
  const halted = usePriceStore((s) => !!s.haltedSymbols[symbol]);
  const { toggleSymbol, isWatched } = useWatchlistStore();

  if (!q) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Không tìm thấy mã cổ phiếu "{symbol}".</p>
        <Link to="/market" className="text-primary text-sm hover:underline mt-2 inline-block">Quay lại bảng giá</Link>
      </div>
    );
  }

  const watched = isWatched(symbol);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft size={15} /> Quay lại
        </button>
        <MarketSessionBadge />
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-bg-elevated p-5">
        <div className={clsx('absolute inset-0 opacity-[0.07] bg-grid pointer-events-none')} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold font-display tracking-tight">{q.symbol}</h1>
              <Badge variant="neutral">{q.sector}</Badge>
              {halted && <Badge variant="warning">Tạm dừng giao dịch</Badge>}
              <button onClick={() => toggleSymbol(symbol)} aria-label="Theo dõi" className="transition-transform hover:scale-110">
                <Star size={18} fill={watched ? 'currentColor' : 'none'} className={watched ? 'text-warning' : 'text-text-disabled'} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{q.name}</p>
          </div>
          <div className="text-right">
            <PriceText current={q.price} ref={q.ref} ceiling={q.ceiling} floor={q.floor} className="text-4xl font-bold font-display" />
            <p className={clsx('text-sm font-data mt-1 font-semibold', q.change >= 0 ? 'text-price-up' : 'text-price-down')}>
              {q.change >= 0 ? '+' : ''}{formatCurrency(q.change)} ({formatPercent(q.changePct)})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Trần" value={formatCurrency(q.ceiling)} className="text-price-ceiling" />
        <Stat label="Sàn" value={formatCurrency(q.floor)} className="text-price-floor" />
        <Stat label="TC" value={formatCurrency(q.ref)} className="text-price-reference" />
        <Stat label="KL" value={formatVolume(q.volume)} />
        <Stat label="Cao nhất" value={formatCurrency(q.high)} />
        <Stat label="Thấp nhất" value={formatCurrency(q.low)} />
        <Stat label="Mở cửa" value={formatCurrency(q.open)} />
        <Stat label="Vốn hoá (ước tính)" value={formatVolume(q.price * 1_000_000_000)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Room nước ngoài còn lại" value={`${q.foreignRoomPct}%`} className="text-info" />
        <Stat label="NN mua (khối lượng)" value={formatVolume(q.foreignBuyVol)} className="text-info" />
        <Stat label="NN bán (khối lượng)" value={formatVolume(q.foreignSellVol)} className="text-secondary" />
        <Stat
          label="NN mua ròng"
          value={formatVolume(Math.abs(q.foreignBuyVol - q.foreignSellVol))}
          className={q.foreignBuyVol >= q.foreignSellVol ? 'text-price-up' : 'text-price-down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Biểu đồ giá — Nến 30 phiên" className="lg:col-span-2">
          <CandlestickChart history={q.history} height={340} />
        </Card>

        <Card title="Sổ lệnh (Order Book)">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Dư mua</p>
              {(() => {
                const maxQty = Math.max(...q.bids.map((b) => b.qty), ...q.asks.map((a) => a.qty));
                return q.bids.slice().reverse().map((b, i) => (
                  <BookRow key={i} price={b.price} qty={b.qty} side="bid" maxQty={maxQty} />
                ));
              })()}
            </div>
            <div className="text-center py-1 border-y border-border">
              <PriceText current={q.price} ref={q.ref} ceiling={q.ceiling} floor={q.floor} className="text-lg font-bold font-display" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1.5">Dư bán</p>
              {(() => {
                const maxQty = Math.max(...q.bids.map((b) => b.qty), ...q.asks.map((a) => a.qty));
                return q.asks.map((a, i) => (
                  <BookRow key={i} price={a.price} qty={a.qty} side="ask" maxQty={maxQty} />
                ));
              })()}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="buy" onClick={() => navigate(`/trading?symbol=${symbol}&side=BUY`)} className="flex-1 sm:flex-none">Đặt lệnh Mua</Button>
        <Button variant="sell" onClick={() => navigate(`/trading?symbol=${symbol}&side=SELL`)} className="flex-1 sm:flex-none">Đặt lệnh Bán</Button>
      </div>
    </div>
  );
}

function Stat({ label, value, className }) {
  return (
    <div className="bg-bg-elevated border border-border rounded-md px-3 py-2.5">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={clsx('text-sm font-data font-semibold mt-0.5', className)}>{value}</p>
    </div>
  );
}

function BookRow({ price, qty, side, maxQty }) {
  const pct = maxQty ? Math.max(6, (qty / maxQty) * 100) : 0;
  return (
    <div className="relative flex items-center justify-between text-xs font-data py-1 overflow-hidden rounded-sm">
      <div
        className={clsx('absolute inset-y-0', side === 'bid' ? 'right-0 bg-price-up/10' : 'left-0 bg-price-down/10')}
        style={{ width: `${pct}%` }}
      />
      <span className="relative text-text-secondary px-1">{qty.toLocaleString('vi-VN')}</span>
      <span className={clsx('relative px-1 font-medium', side === 'bid' ? 'text-price-up' : 'text-price-down')}>{formatCurrency(price)}</span>
    </div>
  );
}
