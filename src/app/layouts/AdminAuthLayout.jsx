import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AdminAuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070C] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="h-11 w-11 rounded-lg bg-bg-elevated border border-border-strong flex items-center justify-center mb-3">
            <ShieldCheck size={20} className="text-text-secondary" />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-text-disabled uppercase">Internal Console</p>
        </div>
        <div className="bg-bg-elevated border border-border rounded-lg p-6">
          <Outlet />
        </div>
        <p className="text-center text-[11px] text-text-disabled mt-4">
          Khu vực nội bộ — chỉ dành cho quản trị viên được cấp quyền.
        </p>
      </div>
    </div>
  );
}
