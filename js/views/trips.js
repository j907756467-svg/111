// Trips view — create, edit, select and delete business trips.

import {
  getTrips, getCurrentTrip, setCurrentTrip,
  addTrip, updateTrip, deleteTrip, tripSpend,
} from '../store.js';
import { esc, money, prettyDate, daysBetween } from '../utils.js';

export const id = 'trips';
export const navLabel = '行程管理';
export const title = '行程管理';
export const subtitle = '创建并切换你的出差行程';

// Tracks which trip (if any) is being edited inline; null = creating new.
let editingId = null;

export function render(container, ctx) {
  const trips = getTrips();
  const current = getCurrentTrip();
  const editing = editingId ? trips.find((t) => t.id === editingId) : null;

  container.innerHTML = `
    <form class="calc-form trip-form" id="trip-form">
      <p class="form-heading">${editing ? '编辑行程' : '新建行程'}</p>
      <label class="field full">
        <span class="field-label">出差主题 / 事由 *</span>
        <input class="field-input" name="title" maxlength="60" required placeholder="如：深圳供应商验厂" value="${esc(editing?.title || '')}">
      </label>
      <label class="field">
        <span class="field-label">目的地</span>
        <input class="field-input" name="destination" maxlength="40" placeholder="如：深圳" value="${esc(editing?.destination || '')}">
      </label>
      <label class="field">
        <span class="field-label">预算 (¥)</span>
        <input class="field-input" name="budget" type="number" inputmode="decimal" min="0" step="any" placeholder="如：5000" value="${editing?.budget || ''}">
      </label>
      <label class="field">
        <span class="field-label">出发日期</span>
        <input class="field-input" name="startDate" type="date" value="${esc(editing?.startDate || '')}">
      </label>
      <label class="field">
        <span class="field-label">返回日期</span>
        <input class="field-input" name="endDate" type="date" value="${esc(editing?.endDate || '')}">
      </label>
      <label class="field full">
        <span class="field-label">备注</span>
        <textarea class="field-input" name="notes" rows="2" maxlength="300" placeholder="行程目的、注意事项…">${esc(editing?.notes || '')}</textarea>
      </label>
      <div class="btn-row full">
        <button type="submit" class="btn btn-primary">${editing ? '保存修改' : '创建行程'}</button>
        ${editing ? '<button type="button" class="btn btn-ghost" id="cancel-edit">取消</button>' : ''}
      </div>
      <p class="form-error" id="trip-error" hidden></p>
    </form>

    <section class="dash-section">
      <h3 class="section-title">全部行程 (${trips.length})</h3>
      ${trips.length === 0
        ? '<p class="muted">还没有行程，先在上方创建一段吧。</p>'
        : `<ul class="trip-list">${trips.map((t) => tripCard(t, current?.id === t.id)).join('')}</ul>`}
    </section>
  `;

  const form = container.querySelector('#trip-form');
  const error = container.querySelector('#trip-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      title: form.title.value.trim(),
      destination: form.destination.value.trim(),
      budget: form.budget.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      notes: form.notes.value.trim(),
    };
    if (!data.title) {
      showError(error, '请填写出差主题。');
      return;
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      showError(error, '返回日期不能早于出发日期。');
      return;
    }
    if (editing) {
      updateTrip(editing.id, data);
      editingId = null;
    } else {
      addTrip(data);
    }
    ctx.refreshHeader();
    ctx.rerender();
  });

  const cancel = container.querySelector('#cancel-edit');
  if (cancel) cancel.addEventListener('click', () => { editingId = null; ctx.rerender(); });

  for (const el of container.querySelectorAll('[data-action]')) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const { action, trip: tripId } = el.dataset;
      if (action === 'select') {
        setCurrentTrip(tripId);
      } else if (action === 'edit') {
        editingId = tripId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'delete') {
        const t = trips.find((x) => x.id === tripId);
        if (confirm(`删除行程「${t?.title || ''}」及其全部日程、费用和清单？`)) {
          deleteTrip(tripId);
          if (editingId === tripId) editingId = null;
        }
      }
      ctx.refreshHeader();
      ctx.rerender();
    });
  }
}

function tripCard(t, isCurrent) {
  const spend = tripSpend(t);
  const days = daysBetween(t.startDate, t.endDate);
  const range = [t.startDate, t.endDate].filter(Boolean).map(prettyDate).join(' → ') || '未排期';
  const over = t.budget > 0 && spend > t.budget;
  return `
    <li class="trip-card ${isCurrent ? 'is-current' : ''}">
      <div class="trip-card-body" data-action="select" data-trip="${t.id}" role="button" tabindex="0">
        <div class="trip-card-head">
          <span class="trip-card-name">${esc(t.title)}</span>
          ${isCurrent ? '<span class="badge badge-current">当前</span>' : ''}
        </div>
        <p class="trip-card-meta">📍 ${esc(t.destination || '—')} · ${esc(range)}${days ? ` · ${days}天` : ''}</p>
        <p class="trip-card-figures">
          <span>预算 ${money(t.budget)}</span>
          <span class="${over ? 'text-bad' : ''}">已花 ${money(spend)}</span>
        </p>
      </div>
      <div class="trip-card-actions">
        <button type="button" class="icon-btn" data-action="edit" data-trip="${t.id}" title="编辑">✏️</button>
        <button type="button" class="icon-btn" data-action="delete" data-trip="${t.id}" title="删除">🗑️</button>
      </div>
    </li>
  `;
}

function showError(el, msg) {
  el.hidden = false;
  el.textContent = msg;
}
