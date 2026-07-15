import { Outlet } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import TickerTape from '../../shared/components/TickerTape';
import { usePriceStore } from '../../shared/store/priceStore';

const CANDLES = [40, 62, 35, 78, 50, 90, 44, 68, 58, 82, 46, 72, 60, 95, 38];

export default function AuthLayout() {
  const start = usePriceStore((s) => s.start);
  const stop = usePriceStore((s) => s.stop);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    start();
    return () => stop();
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-base">
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[#070A11] text-white">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-secondary/15 blur-[100px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-glow">
            <TrendingUp size={20} className="text-[#070A11]" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="font-display font-bold text-lg block">VietTrade</span>
            <span className="text-[10px] text-secondary font-semibold tracking-widest">PRO TERMINAL</span>
          </div>
        </div>

        <div className="relative space-y-7">
          <h1 className="text-4xl font-bold font-display leading-tight">
            Nền tảng giao dịch<br />chứng khoán <span className="text-gradient">cấp doanh nghiệp</span>
          </h1>
          <p className="text-white/55 max-w-md leading-relaxed">
            Tra cứu thị trường, đặt lệnh, quản lý danh mục và báo cáo tài chính — tốc độ, minh bạch, đáng tin cậy.
          </p>

          {/* Decorative live candlestick strip — signature element */}
          <div className="flex items-end gap-1 h-24 pt-2">
            {CANDLES.map((h, i) => (
              <div
                key={i}
                className={i % 3 === 0 ? 'w-2.5 rounded-sm bg-price-down/70' : 'w-2.5 rounded-sm bg-price-up/70'}
                style={{ height: `${h}%`, animation: `pulseGlow ${2 + (i % 4) * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <Feature icon={Zap} title="Độ trễ thấp" desc="Cập nhật giá mô phỏng thời gian thực mỗi 1.5 giây" />
            <Feature icon={BarChart3} title="Phân tích chuyên sâu" desc="Biểu đồ nến, sổ lệnh, bản đồ nhiệt thị trường" />
            <Feature icon={ShieldCheck} title="Bảo mật" desc="Xác thực, mã hoá phiên đăng nhập" />
          </div>
        </div>

        <p className="relative text-xs text-white/35">© 2026 VietTrade Pro — Dữ liệu thị trường thật, giao dịch bằng tiền ảo.</p>
      </div>

      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <TickerTape />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
        <Icon size={16} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/45">{desc}</p>
      </div>
    </div>
  );
}
