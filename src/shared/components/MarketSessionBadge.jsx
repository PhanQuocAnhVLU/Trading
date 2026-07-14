import { useEffect, useState } from 'react';
import { getMarketSession } from '../lib/marketSession';
import clsx from 'clsx';

const dotColor = {
  success: 'bg-price-up',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-text-disabled',
};
const textColor = {
  success: 'text-price-up bg-price-up/10 border-price-up/30',
  warning: 'text-warning bg-warning/10 border-warning/30',
  info: 'text-info bg-info/10 border-info/30',
  neutral: 'text-text-secondary bg-text-secondary/10 border-text-secondary/30',
};

export default function MarketSessionBadge({ className }) {
  const [session, setSession] = useState(() => getMarketSession());

  useEffect(() => {
    const id = setInterval(() => setSession(getMarketSession()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={clsx('flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border', textColor[session.color], className)}>
      <span className={clsx('h-1.5 w-1.5 rounded-full animate-pulse-glow', dotColor[session.color])} />
      {session.label}
    </div>
  );
}
