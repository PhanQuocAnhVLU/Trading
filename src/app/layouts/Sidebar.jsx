import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { TrendingUp } from 'lucide-react';
import { NAV_ITEMS } from '../../shared/constants/navigation';

export default function Sidebar({ collapsed }) {
  const items = NAV_ITEMS;

  return (
    <aside
      className={clsx(
        'h-screen sticky top-0 flex flex-col border-r border-border bg-bg-elevated transition-all duration-200 z-40',
        collapsed ? 'w-[68px]' : 'w-[248px]'
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0">
        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shrink-0 shadow-glow">
          <TrendingUp size={18} className="text-bg-base" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <span className="font-display font-bold text-sm tracking-tight block">VietTrade</span>
            <span className="text-[10px] text-secondary font-semibold tracking-widest">PRO TERMINAL</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {!collapsed && <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-text-disabled uppercase">Điều hướng</p>}
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary shadow-glow" />}
                <item.icon size={18} className="shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-3 mx-2.5 mb-3 rounded-md border border-border bg-bg-elevated-2">
          <p className="text-[10px] text-text-disabled uppercase tracking-widest font-semibold">Phiên demo</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">Dữ liệu mô phỏng — không phải giao dịch thật.</p>
        </div>
      )}
    </aside>
  );
}
