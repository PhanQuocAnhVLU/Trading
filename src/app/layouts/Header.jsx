import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../shared/store/uiStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useAlertStore } from '../../features/alerts/store/alertStore';
import { STOCK_UNIVERSE } from '../../shared/constants/stockUniverse';

export default function Header() {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const notifications = useAlertStore((s) => s.notifications);
  const markAllRead = useAlertStore((s) => s.markAllRead);
  const unread = notifications.filter((n) => !n.read).length;
  const [query, setQuery] = useState('');
  const [showNoti, setShowNoti] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  const results = query.length > 0
    ? STOCK_UNIVERSE.filter((s) => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center gap-4 px-4 border-b border-border glass">
      <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-bg-surface text-text-secondary" aria-label="Thu gọn menu">
        <Menu size={18} />
      </button>

      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã cổ phiếu..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {results.length > 0 && (
          <div className="absolute mt-1 w-full bg-bg-elevated border border-border rounded-md shadow-e3 overflow-hidden z-40">
            {results.map((s) => (
              <button
                key={s.symbol}
                onClick={() => { navigate(`/market/${s.symbol}`); setQuery(''); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-bg-surface text-left"
              >
                <span className="font-medium font-data">{s.symbol}</span>
                <span className="text-text-secondary text-xs truncate ml-2">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-bg-surface text-text-secondary" aria-label="Đổi giao diện">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowNoti((v) => !v); if (!showNoti) markAllRead(); }}
            className="p-2 rounded-md hover:bg-bg-surface text-text-secondary relative"
            aria-label="Thông báo"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-0.5 rounded-full bg-danger text-white text-[10px] leading-4 text-center">
                {unread}
              </span>
            )}
          </button>
          {showNoti && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-bg-elevated border border-border rounded-md shadow-e3 z-40">
              <div className="px-3 py-2 border-b border-border text-sm font-semibold">Thông báo</div>
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-text-secondary text-center">Chưa có thông báo nào.</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="px-3 py-2.5 border-b border-border last:border-0 text-sm">
                    <p className="text-text-primary">{n.message}</p>
                    <p className="text-xs text-text-secondary mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative ml-1">
          <button onClick={() => setShowUser((v) => !v)} className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-md hover:bg-bg-surface">
            <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={14} className="text-text-secondary" />
          </button>
          {showUser && (
            <div className="absolute right-0 mt-2 w-56 bg-bg-elevated border border-border rounded-md shadow-e3 z-40 overflow-hidden">
              <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                <p className="text-xs text-text-secondary mt-0.5">Số TK: {user?.accountNo}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setShowUser(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-surface text-left">
                <UserIcon size={15} /> Tài khoản
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-surface text-left text-danger">
                <LogOut size={15} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
