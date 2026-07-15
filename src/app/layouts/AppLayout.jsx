import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import TickerTape from '../../shared/components/TickerTape';
import { usePriceStore } from '../../shared/store/priceStore';
import { useUIStore } from '../../shared/store/uiStore';
import { useAlertStore } from '../../features/alerts/store/alertStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useTradingStore } from '../../features/trading/store/tradingStore';

export default function AppLayout() {
  const start = usePriceStore((s) => s.start);
  const stop = usePriceStore((s) => s.stop);
  const quotes = usePriceStore((s) => s.quotes);
  const checkAlerts = useAlertStore((s) => s.checkAlerts);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const initTheme = useUIStore((s) => s.initTheme);
  const location = useLocation();
  const uid = useAuthStore((s) => s.user?.uid);
  const subscribeTrading = useTradingStore((s) => s.subscribe);
  const unsubscribeTrading = useTradingStore((s) => s.unsubscribe);

  useEffect(() => {
    initTheme();
    start();
    return () => stop();
  }, []);

  useEffect(() => {
    subscribeTrading(uid);
    return () => unsubscribeTrading();
  }, [uid]);

  useEffect(() => {
    checkAlerts(quotes);
  }, [quotes]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-surface">
      <TickerTape />
      <div className="flex flex-1">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
