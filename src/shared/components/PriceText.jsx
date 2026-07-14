import clsx from 'clsx';
import { priceStatus, PRICE_STATUS_COLOR, formatPrice } from '../lib/formatters';

export default function PriceText({ current, ref, ceiling, floor, className, mono = true }) {
  const status = priceStatus(current, ref, ceiling, floor);
  return (
    <span className={clsx(mono && 'font-data', PRICE_STATUS_COLOR[status], className)}>
      {formatPrice(current)}
    </span>
  );
}
