// Shared helpers. Date parsing uses slashes ("2026/06/08") because iOS in the
// WeChat runtime does not reliably parse dashed ISO strings.

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Parse a yyyy-mm-dd string into a Date at local midnight, iOS-safe.
function parseISO(iso) {
  if (!iso) return null;
  const d = new Date(iso.replace(/-/g, '/') + ' 00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Format as RMB with thousands separators, e.g. -¥1,234.5
function money(amount) {
  let n = Number(amount);
  if (!isFinite(n)) n = 0;
  const neg = n < 0;
  n = Math.abs(Math.round(n * 100) / 100);
  const parts = String(n).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-¥' : '¥') + parts.join('.');
}

// Pretty Chinese date: 2026-06-08 -> 6月8日 周一
function prettyDate(iso) {
  const d = parseISO(iso);
  if (!d) return iso || '';
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`;
}

// Whole days inclusive between two ISO dates; null if either missing/invalid.
function daysBetween(startISO, endISO) {
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  if (!a || !b) return null;
  return Math.round((b - a) / 86400000) + 1;
}

// Days from today until an ISO date (negative = past, 0 = today).
function daysUntil(iso) {
  const target = parseISO(iso);
  const now = parseISO(todayISO());
  if (!target) return null;
  return Math.round((target - now) / 86400000);
}

module.exports = { uid, todayISO, money, prettyDate, daysBetween, daysUntil };
