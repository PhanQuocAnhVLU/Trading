import { useState } from 'react';
import { Ban, CheckCircle2, Wallet, Trash2, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import Card from '../../shared/components/Card';
import Badge from '../../shared/components/Badge';
import Button from '../../shared/components/Button';
import { useAuthStore } from '../auth/store/authStore';
import { useTradingStore } from '../trading/store/tradingStore';
import { usePriceStore } from '../../shared/store/priceStore';
import { formatCurrency, formatDateTime } from '../../shared/lib/formatters';
import { STOCK_UNIVERSE } from '../../shared/constants/stockUniverse';
import clsx from 'clsx';

export default function AdminPage() {
  const { users, adminToggleBan, adminAdjustCash, adminDeleteUser } = useAuthStore();
  const { orders, cancelOrder } = useTradingStore();
  const { quotes, haltedSymbols, toggleHalt } = usePriceStore();
  const symbolCount = Object.keys(quotes).length;
  const [cashModal, setCashModal] = useState(null); // { email }
  const [cashAmount, setCashAmount] = useState('');

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  function handleAdjustCash(email) {
    const delta = Number(cashAmount);
    if (!delta) return;
    adminAdjustCash(email, delta);
    setCashModal(null);
    setCashAmount('');
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold font-display text-text-primary">Quản trị hệ thống</h1>
        <p className="text-sm text-text-secondary mt-1">Giám sát và quản lý người dùng, lệnh giao dịch, mã cổ phiếu.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><p className="text-xs text-text-secondary">Tổng người dùng</p><p className="text-lg font-bold font-data mt-1">{users.length}</p></Card>
        <Card><p className="text-xs text-text-secondary">Tổng lệnh đã đặt</p><p className="text-lg font-bold font-data mt-1">{orders.length}</p></Card>
        <Card><p className="text-xs text-text-secondary">Lệnh đang chờ khớp</p><p className="text-lg font-bold font-data mt-1">{pendingCount}</p></Card>
        <Card><p className="text-xs text-text-secondary">Mã đang tạm dừng</p><p className="text-lg font-bold font-data mt-1">{Object.values(haltedSymbols).filter(Boolean).length}/{symbolCount}</p></Card>
      </div>

      {/* User management */}
      <Card title="Quản lý người dùng" padded={false}>
        {users.length === 0 ? (
          <p className="p-8 text-sm text-text-secondary text-center">Chưa có người dùng đăng ký.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border">
                  <th className="px-4 py-2 font-medium">Họ tên</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Số TK</th>
                  <th className="px-4 py-2 font-medium text-right">Số dư tiền mặt</th>
                  <th className="px-4 py-2 font-medium text-right">Trạng thái</th>
                  <th className="px-4 py-2 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className={clsx('border-b border-border last:border-0', u.banned && 'opacity-50')}>
                    <td className="px-4 py-2 font-medium">{u.fullName}</td>
                    <td className="px-4 py-2 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-2 font-data text-text-secondary">{u.accountNo}</td>
                    <td className="px-4 py-2 text-right font-data">{formatCurrency(u.cashBalance)}₫</td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant={u.banned ? 'danger' : 'success'}>{u.banned ? 'Đã khoá' : 'Hoạt động'}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setCashModal({ email: u.email, name: u.fullName }); setCashAmount(''); }}
                          className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-bg-elevated-2"
                          title="Điều chỉnh số dư"
                        >
                          <Wallet size={15} />
                        </button>
                        <button
                          onClick={() => adminToggleBan(u.email)}
                          className={clsx('p-1.5 rounded-md hover:bg-bg-elevated-2', u.banned ? 'text-success' : 'text-warning')}
                          title={u.banned ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}
                        >
                          {u.banned ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Xoá tài khoản ${u.email}?`)) adminDeleteUser(u.email); }}
                          className="p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-bg-elevated-2"
                          title="Xoá tài khoản"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Trading control */}
      <Card title="Kiểm soát giao dịch theo mã">
        <div className="flex flex-wrap gap-2">
          {STOCK_UNIVERSE.map((s) => {
            const halted = !!haltedSymbols[s.symbol];
            return (
              <button
                key={s.symbol}
                onClick={() => toggleHalt(s.symbol)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors font-data',
                  halted ? 'bg-warning/15 text-warning border-warning/40' : 'border-border text-text-secondary hover:bg-bg-elevated-2'
                )}
              >
                {halted ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                {s.symbol}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-text-secondary mt-3">Bấm vào mã để tạm dừng / mở lại giao dịch. Mã đang tạm dừng sẽ đứng giá và nhà đầu tư không thể đặt lệnh mới.</p>
      </Card>

      {/* Order log */}
      <Card title="Nhật ký lệnh toàn hệ thống" padded={false}>
        {orders.length === 0 ? (
          <p className="p-8 text-sm text-text-secondary text-center">Chưa có lệnh nào.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-bg-elevated">
                <tr className="text-left text-text-secondary border-b border-border">
                  <th className="px-4 py-2 font-medium">Mã lệnh</th>
                  <th className="px-4 py-2 font-medium">Mã CK</th>
                  <th className="px-4 py-2 font-medium">Loại</th>
                  <th className="px-4 py-2 font-medium text-right">KL</th>
                  <th className="px-4 py-2 font-medium text-right">Giá</th>
                  <th className="px-4 py-2 font-medium">Thời gian</th>
                  <th className="px-4 py-2 font-medium text-right">Trạng thái</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-data text-xs text-text-secondary">{o.id}</td>
                    <td className="px-4 py-2 font-data font-medium">{o.symbol}</td>
                    <td className="px-4 py-2"><Badge variant={o.side === 'BUY' ? 'success' : 'danger'}>{o.side === 'BUY' ? 'Mua' : 'Bán'}</Badge></td>
                    <td className="px-4 py-2 text-right font-data">{o.qty.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 text-right font-data">{formatCurrency(o.price)}</td>
                    <td className="px-4 py-2 text-text-secondary text-xs">{formatDateTime(o.createdAt)}</td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant={o.status === 'matched' ? 'success' : o.status === 'cancelled' ? 'neutral' : 'warning'}>
                        {o.status === 'matched' ? 'Khớp' : o.status === 'cancelled' ? 'Huỷ' : 'Chờ'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {o.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="text-xs text-danger hover:underline flex items-center gap-1 justify-end w-full"
                        >
                          <XCircle size={12} /> Buộc huỷ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {cashModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setCashModal(null)}>
          <div className="bg-bg-elevated border border-border rounded-lg p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold">Điều chỉnh số dư — {cashModal.name}</h3>
            <p className="text-xs text-text-secondary mt-1">Nhập số tiền dương để nạp, âm để trừ.</p>
            <input
              type="number" autoFocus
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="VD: 50000000 hoặc -20000000"
              className="w-full mt-3 rounded-sm border border-border bg-bg-base px-3 py-2 text-sm font-data focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setCashModal(null)}>Huỷ</Button>
              <Button className="flex-1" onClick={() => handleAdjustCash(cashModal.email)}>Xác nhận</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
