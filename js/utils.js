// Shared helpers used across views — formatting, escaping, IDs and dates.

// Unique-enough id for client-side records (no backend / collisions to worry about).
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Escape user-entered text before injecting into innerHTML.
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Format a number as RMB currency. Falls back gracefully for non-numbers.
export function money(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '¥0';
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ISO date string (yyyy-mm-dd) for today, in local time.
export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}

// Pretty Chinese date: 2026-06-08 -> 6月8日 周一
export function prettyDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`;
}

// Whole days inclusive between two ISO dates. Returns null if either is missing.
export function daysBetween(startISO, endISO) {
  if (!startISO || !endISO) return null;
  const a = new Date(startISO + 'T00:00:00');
  const b = new Date(endISO + 'T00:00:00');
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.round((b - a) / 86400000) + 1;
}

// Days from today until an ISO date (negative = in the past, 0 = today).
export function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso + 'T00:00:00');
  const now = new Date(todayISO() + 'T00:00:00');
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - now) / 86400000);
}
