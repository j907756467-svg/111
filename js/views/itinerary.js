// Itinerary view — a day-by-day schedule for the current trip.

import { getCurrentTrip, addItinerary, deleteItinerary } from '../store.js';
import { ITINERARY_TYPES, itineraryType } from '../constants.js';
import { esc, prettyDate, todayISO } from '../utils.js';
import { noTripState } from './shared.js';

export const id = 'itinerary';
export const navLabel = '日程安排';
export const title = '日程安排';
export const subtitle = '按时间排布航班、住宿与会议';

export function render(container, ctx) {
  const trip = getCurrentTrip();
  if (!trip) { noTripState(container, ctx); return; }

  container.innerHTML = `
    <form class="calc-form itinerary-form" id="iti-form">
      <label class="field">
        <span class="field-label">类型</span>
        <select class="field-input" name="type">
          ${ITINERARY_TYPES.map((t) => `<option value="${t.value}">${t.icon} ${t.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">日期</span>
        <input class="field-input" name="date" type="date" value="${esc(trip.startDate || todayISO())}" required>
      </label>
      <label class="field">
        <span class="field-label">时间</span>
        <input class="field-input" name="time" type="time">
      </label>
      <label class="field full">
        <span class="field-label">事项 *</span>
        <input class="field-input" name="title" maxlength="80" required placeholder="如：CA1858 北京→上海 / 客户会议">
      </label>
      <label class="field">
        <span class="field-label">地点</span>
        <input class="field-input" name="location" maxlength="60" placeholder="如：首都T3 / 客户总部">
      </label>
      <label class="field">
        <span class="field-label">备注</span>
        <input class="field-input" name="notes" maxlength="120" placeholder="提醒事项">
      </label>
      <div class="btn-row full">
        <button type="submit" class="btn btn-primary">添加到日程</button>
      </div>
      <p class="form-error" id="iti-error" hidden></p>
    </form>

    <section class="dash-section" id="iti-list">
      ${renderTimeline(trip)}
    </section>
  `;

  const form = container.querySelector('#iti-form');
  const error = container.querySelector('#iti-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      type: form.type.value,
      date: form.date.value,
      time: form.time.value,
      title: form.title.value.trim(),
      location: form.location.value.trim(),
      notes: form.notes.value.trim(),
    };
    if (!item.title || !item.date) {
      error.hidden = false;
      error.textContent = '请填写事项与日期。';
      return;
    }
    addItinerary(trip.id, item);
    ctx.rerender();
  });

  bindDeletes(container, trip, ctx);
}

function renderTimeline(trip) {
  if (trip.itinerary.length === 0) {
    return '<p class="muted">还没有日程安排，使用上方表单添加第一项。</p>';
  }
  // Group by date, days ascending; items within a day by time.
  const byDate = new Map();
  for (const item of trip.itinerary) {
    if (!byDate.has(item.date)) byDate.set(item.date, []);
    byDate.get(item.date).push(item);
  }
  const dates = [...byDate.keys()].sort();
  return dates.map((date) => {
    const items = byDate.get(date).sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
    return `
      <div class="day-group">
        <h3 class="day-head">${esc(prettyDate(date))}</h3>
        <ul class="timeline">
          ${items.map((i) => timelineItem(i)).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

function timelineItem(i) {
  const meta = itineraryType(i.type);
  return `
    <li class="timeline-item">
      <span class="timeline-time">${esc(i.time || '全天')}</span>
      <span class="timeline-icon" title="${esc(meta.label)}">${meta.icon}</span>
      <div class="timeline-body">
        <p class="timeline-title">${esc(i.title)}</p>
        <p class="timeline-meta">
          ${i.location ? `<span>📍 ${esc(i.location)}</span>` : ''}
          ${i.notes ? `<span>· ${esc(i.notes)}</span>` : ''}
        </p>
      </div>
      <button type="button" class="icon-btn" data-del="${i.id}" title="删除">🗑️</button>
    </li>
  `;
}

function bindDeletes(container, trip, ctx) {
  for (const el of container.querySelectorAll('[data-del]')) {
    el.addEventListener('click', () => {
      deleteItinerary(trip.id, el.dataset.del);
      ctx.rerender();
    });
  }
}
