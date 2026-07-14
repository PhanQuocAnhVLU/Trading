import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import GoogleSignInButton from './GoogleSignInButton';
import { useAuthStore } from './store/authStore';

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register(form);
      if (!result.ok) {
        setLoading(false);
        setError(result.error);
        return;
      }
      login({ email: form.email, password: form.password });
      setLoading(false);
      navigate('/', { replace: true });
    }, 500);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">Tạo tài khoản</h2>
      <p className="text-sm text-text-secondary mt-1">Bắt đầu đầu tư với 200.000.000₫ tiền demo.</p>

      <div className="mt-6">
        <GoogleSignInButton onSuccess={() => navigate('/', { replace: true })} />
      </div>

      <div className="flex items-center gap-3 my-5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-disabled uppercase tracking-widest">Hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="fullName" label="Họ và tên" placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <Input
          id="email" type="email" label="Email" placeholder="ban@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          id="password" type="password" label="Mật khẩu" placeholder="Tối thiểu 6 ký tự"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Input
          id="confirm" type="password" label="Xác nhận mật khẩu" placeholder="••••••••"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>Đăng ký</Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
}
