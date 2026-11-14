// Small display helpers. Prices are stored as NUMERIC so Postgres hands them
// back as strings — everything here goes through Number() on purpose.

export function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatCoord(value) {
  const n = Number(value);
  return Number.isNaN(n) ? '—' : n.toFixed(4);
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
