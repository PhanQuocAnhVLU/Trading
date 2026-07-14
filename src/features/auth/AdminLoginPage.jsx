import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { useAuthStore } from './store/authStore';

export default function AdminLoginPage() {
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(form);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.ok && useAuthStore.getState().user?.role !== 'admin') {
        useAuthStore.getState().logout();
        setError('Tài khoản này không có quyền quản trị.');
        return;
      }
      navigate('/admin', { replace: true });
    }, 400);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Đăng nhập quản trị</h2>
      <p className="text-xs text-text-secondary mt-1">Nhập thông tin tài khoản được cấp quyền admin.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input
          id="admin-email" type="email" label="Email"
          placeholder="admin@company.vn"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          id="admin-password" type="password" label="Mật khẩu"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="ghost" className="w-full" loading={loading}>Đăng nhập</Button>
      </form>
    </div>
  );
}
