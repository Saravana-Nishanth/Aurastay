// Small display helpers. Prices are stored as NUMERIC so Postgres hands them
// back as strings — everything here goes through Number() on purpose.

export function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? '—' : `$${value.toFixed(2)}`;
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
