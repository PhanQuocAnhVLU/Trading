import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import Card from '../../shared/components/Card';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { useAuthStore } from '../auth/store/authStore';
import { useUIStore } from '../../shared/store/uiStore';
import { auth } from '../../shared/lib/firebase';
import { formatCurrency } from '../../shared/lib/formatters';
import clsx from 'clsx';

function mapPwError(err) {
  const map = {
    'auth/wrong-password': 'Mật khẩu hiện tại không đúng.',
    'auth/invalid-credential': 'Mật khẩu hiện tại không đúng.',
    'auth/weak-password': 'Mật khẩu mới cần tối thiểu 6 ký tự.',
    'auth/requires-recent-login': 'Phiên đăng nhập đã cũ, vui lòng đăng xuất rồi đăng nhập lại trước khi đổi mật khẩu.',
  };
  return map[err?.code] || err?.message || 'Không thể đổi mật khẩu.';
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    const result = await updateUser({ fullName });
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMessage(null);
    if (pwForm.next.length < 6) {
      setPwMessage({ type: 'error', text: 'Mật khẩu mới cần tối thiểu 6 ký tự.' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' });
      return;
    }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwMessage({ type: 'success', text: 'Đổi mật khẩu thành công.' });
    } catch (err) {
      setPwMessage({ type: 'error', text: mapPwError(err) });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Cài đặt tài khoản</h1>
        <p className="text-sm text-text-secondary mt-1">Quản lý thông tin cá nhân, bảo mật và giao diện.</p>
      </div>

      <Card title="Thông tin tài khoản">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input id="fullName" label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input id="email" label="Email" value={user?.email || ''} disabled />
          <Input id="accountNo" label="Số tài khoản giao dịch" value={user?.accountNo || ''} disabled />
          {user?.role !== 'admin' && (
            <Input id="cash" label="Số dư tiền mặt" value={`${formatCurrency(user?.cashBalance)}₫`} disabled />
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
            {saved && <span className="text-sm text-success">Đã lưu.</span>}
          </div>
        </form>
      </Card>

      <Card title="Giao diện">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Chế độ hiển thị</p>
            <p className="text-xs text-text-secondary">Chọn giao diện Sáng hoặc Tối.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-bg-surface"
          >
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'light' ? 'Sáng' : 'Tối'}
          </button>
        </div>
      </Card>

      {user?.authProvider === 'google' ? (
        <Card title="Bảo mật">
          <p className="text-sm text-text-secondary">Tài khoản này đăng nhập bằng Google — mật khẩu được quản lý bởi Google, không thể đổi tại đây.</p>
        </Card>
      ) : (
        <Card title="Bảo mật — Đổi mật khẩu">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input id="current" type="password" label="Mật khẩu hiện tại" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <Input id="next" type="password" label="Mật khẩu mới" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <Input id="confirm" type="password" label="Xác nhận mật khẩu mới" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            {pwMessage && <p className={clsx('text-sm', pwMessage.type === 'error' ? 'text-danger' : 'text-success')}>{pwMessage.text}</p>}
            <Button type="submit" variant="secondary" disabled={pwSaving}>{pwSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
