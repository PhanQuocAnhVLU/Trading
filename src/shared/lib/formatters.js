export function formatCurrency(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0, ...opts }).format(value);
}

export function formatPrice(value) {
  // Prices stored in VND, displayed as-is with thousands separators
  return formatCurrency(value);
}

export function formatPercent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatVolume(value) {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return String(value);
}

export function formatDate(date, opts = {}) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...opts }).format(d);
}

export function formatDateTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(d);
}

// Price status classification per VN market convention
export function priceStatus(current, ref, ceiling, floor) {
  if (current >= ceiling) return 'ceiling';
  if (current <= floor) return 'floor';
  if (current > ref) return 'up';
  if (current < ref) return 'down';
  return 'reference';
}

export const PRICE_STATUS_COLOR = {
  up: 'text-price-up',
  down: 'text-price-down',
  ceiling: 'text-price-ceiling',
  floor: 'text-price-floor',
  reference: 'text-price-reference',
};
