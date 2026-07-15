import { Outlet, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05070C]">
      <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-bg-elevated">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-bg-elevated-2 border border-border-strong flex items-center justify-center">
            <ShieldCheck size={16} className="text-text-secondary" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Internal Console</p>
            <p className="text-[10px] text-text-disabled tracking-widest uppercase">Quản trị hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary hidden sm:inline">{user?.email}</span>
          <button
            onClick={async () => { await logout(); navigate('/admin/login', { replace: true }); }}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-danger transition-colors"
          >
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto p-5 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
