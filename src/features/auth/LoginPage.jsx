import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import GoogleSignInButton from './GoogleSignInButton';
import { useAuthStore } from './store/authStore';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dest = location.state?.from || '/';

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
      navigate(dest, { replace: true });
    }, 500);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">Đăng nhập</h2>
      <p className="text-sm text-text-secondary mt-1">Chào mừng quay trở lại VietTrade Pro.</p>

      <div className="mt-6">
        <GoogleSignInButton onSuccess={() => navigate(dest, { replace: true })} />
      </div>

      <div className="flex items-center gap-3 my-5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-disabled uppercase tracking-widest">Hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email" type="email" label="Email"
          placeholder="ban@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          id="password" type="password" label="Mật khẩu"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>Đăng nhập</Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Đăng ký ngay</Link>
      </p>
    </div>
  );
}
