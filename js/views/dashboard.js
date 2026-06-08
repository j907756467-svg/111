// Dashboard — at-a-glance summary of the current trip plus all upcoming trips.

import { getCurrentTrip, getTrips, tripSpend, resetAll } from '../store.js';
import { esc, money, prettyDate, daysBetween, daysUntil, todayISO } from '../utils.js';
import { setCurrentTrip } from '../store.js';

export const id = 'dashboard';
export const navLabel = '仪表盘';
export const title = '仪表盘';
export const subtitle = '出差全局概览，掌握行程与预算';

export function render(container, ctx) {
  const trip = getCurrentTrip();
  const trips = getTrips();

  if (!trip) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧳</div>
        <p class="empty-title">还没有出差行程</p>
        <p class="empty-text">创建你的第一段行程，开始规划日程、预算与行李。</p>
        <button type="button" class="btn btn-primary" id="go-trips">新建行程</button>
      </div>
    `;
    container.querySelector('#go-trips').addEventListener('click', () => ctx.navigate('trips'));
    return;
  }

  const spend = tripSpend(trip);
  const budget = trip.budget || 0;
  const remaining = budget - spend;
  const pct = budget > 0 ? Math.min(100, Math.round((spend / budget) * 100)) : 0;
  const days = daysBetween(trip.startDate, trip.endDate);
  const until = daysUntil(trip.startDate);
  const doneCount = trip.checklist.filter((c) => c.done).length;

  const countdown = until === null ? '—'
    : until > 0 ? `还有 ${until} 天出发`
    : until === 0 ? '今天出发'
    : days !== null && daysUntil(trip.endDate) >= 0 ? '行程进行中'
    : '行程已结束';

  const budgetClass = budget > 0 && spend > budget ? 'stat-bad' : pct >= 80 ? 'stat-warn' : 'stat-good';

  container.innerHTML = `
    <section class="trip-hero">
      <div>
        <p class="trip-hero-eyebrow">${esc(trip.destination || '出差')} · ${countdown}</p>
        <h2 class="trip-hero-title">${esc(trip.title)}</h2>
        <p class="trip-hero-dates">
          ${trip.startDate ? esc(prettyDate(trip.startDate)) : '未设置日期'}
          ${trip.endDate ? ' → ' + esc(prettyDate(trip.endDate)) : ''}
          ${days ? `<span class="pill">${days} 天</span>` : ''}
        </p>
      </div>
    </section>

    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">日程安排</span>
        <span class="stat-value">${trip.itinerary.length}<small>项</small></span>
        <button type="button" class="stat-link" data-go="itinerary">查看日程 →</button>
      </div>
      <div class="stat-card ${budgetClass}">
        <span class="stat-label">已花费 / 预算</span>
        <span class="stat-value">${money(spend)}</span>
        <span class="stat-sub">${budget > 0 ? `预算 ${money(budget)}` : '未设预算'}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">预算结余</span>
        <span class="stat-value ${remaining < 0 ? 'text-bad' : ''}">${money(remaining)}</span>
        <button type="button" class="stat-link" data-go="expenses">管理费用 →</button>
      </div>
      <div class="stat-card">
        <span class="stat-label">行李清单</span>
        <span class="stat-value">${doneCount}<small>/${trip.checklist.length}</small></span>
        <button type="button" class="stat-link" data-go="checklist">整理行李 →</button>
      </div>
    </div>

    ${budget > 0 ? `
      <div class="budget-bar-wrap">
        <div class="budget-bar"><div class="budget-bar-fill ${budgetClass}" style="width:${pct}%"></div></div>
        <p class="budget-bar-text">预算使用 ${pct}%${spend > budget ? ' · 已超支' : ''}</p>
      </div>` : ''}

    ${renderNextUp(trip)}

    <section class="dash-section">
      <div class="section-head">
        <h3 class="section-title">全部行程 (${trips.length})</h3>
        <button type="button" class="btn btn-ghost btn-sm" data-go="trips">管理行程</button>
      </div>
      <ul class="trip-mini-list">
        ${trips.map((t) => tripMiniRow(t)).join('')}
      </ul>
    </section>

    <details class="disclaimer danger-zone">
      <summary>数据与隐私说明</summary>
      <div class="disclaimer-body">
        <p>本应用所有数据仅保存在你当前浏览器的本地存储 (localStorage) 中，不会上传到任何服务器，清除浏览器数据后将丢失。建议重要单据另行备份。</p>
        <button type="button" class="btn btn-danger btn-sm" id="reset-all">清空全部数据</button>
      </div>
    </details>
  `;

  for (const el of container.querySelectorAll('[data-go]')) {
    el.addEventListener('click', () => ctx.navigate(el.dataset.go));
  }
  for (const el of container.querySelectorAll('[data-trip]')) {
    const select = () => {
      setCurrentTrip(el.dataset.trip);
      ctx.refreshHeader();
      ctx.rerender();
    };
    el.addEventListener('click', select);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
    });
  }
  const reset = container.querySelector('#reset-all');
  if (reset) {
    reset.addEventListener('click', () => {
      if (confirm('确定要清空全部行程数据吗？此操作不可恢复。')) {
        resetAll();
        ctx.refreshHeader();
        ctx.rerender();
      }
    });
  }
}

function renderNextUp(trip) {
  const upcoming = trip.itinerary
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter((i) => i.date >= todayISO())
    .slice(0, 3);
  if (upcoming.length === 0) return '';
  return `
    <section class="dash-section">
      <h3 class="section-title">即将进行</h3>
      <ul class="next-up-list">
        ${upcoming.map((i) => `
          <li class="next-up-item">
            <span class="next-up-when">${esc(prettyDate(i.date))} ${esc(i.time || '')}</span>
            <span class="next-up-title">${esc(i.title)}</span>
            ${i.location ? `<span class="next-up-loc">📍 ${esc(i.location)}</span>` : ''}
          </li>`).join('')}
      </ul>
    </section>
  `;
}

function tripMiniRow(t) {
  const spend = tripSpend(t);
  const range = [t.startDate, t.endDate].filter(Boolean).map(prettyDate).join(' → ');
  return `
    <li class="trip-mini" data-trip="${t.id}" role="button" tabindex="0">
      <span class="trip-mini-main">
        <span class="trip-mini-name">${esc(t.title)}</span>
        <span class="trip-mini-meta">${esc(t.destination || '—')} · ${esc(range || '未排期')}</span>
      </span>
      <span class="trip-mini-spend">${money(spend)}</span>
    </li>
  `;
}
