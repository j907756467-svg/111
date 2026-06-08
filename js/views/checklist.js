// Checklist view — packing / to-do list with one-tap preset items.

import {
  getCurrentTrip, addChecklistItem, addChecklistItems,
  toggleChecklistItem, deleteChecklistItem,
} from '../store.js';
import { PACKING_PRESETS } from '../constants.js';
import { esc } from '../utils.js';
import { noTripState } from './shared.js';

export const id = 'checklist';
export const navLabel = '行李清单';
export const title = '行李清单';
export const subtitle = '出发前逐项打勾，避免遗漏';

export function render(container, ctx) {
  const trip = getCurrentTrip();
  if (!trip) { noTripState(container, ctx); return; }

  const items = trip.checklist;
  const done = items.filter((c) => c.done).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  const presetsLeft = PACKING_PRESETS.filter((p) => !items.some((c) => c.text === p));

  container.innerHTML = `
    <div class="check-progress">
      <div class="budget-bar"><div class="budget-bar-fill stat-good" style="width:${pct}%"></div></div>
      <p class="budget-bar-text">已完成 ${done} / ${items.length} 项${items.length > 0 && done === items.length ? ' · 全部就绪 ✅' : ''}</p>
    </div>

    <form class="add-row" id="check-form">
      <input class="field-input" name="text" maxlength="60" placeholder="添加一项，如：转换插头" required>
      <button type="submit" class="btn btn-primary">添加</button>
    </form>

    ${presetsLeft.length > 0 ? `
      <div class="presets">
        <span class="presets-label">常用项（点击添加）：</span>
        <div class="preset-chips">
          ${presetsLeft.map((p) => `<button type="button" class="chip" data-preset="${esc(p)}">+ ${esc(p)}</button>`).join('')}
          ${presetsLeft.length > 1 ? '<button type="button" class="chip chip-all" data-preset-all="1">+ 全部添加</button>' : ''}
        </div>
      </div>` : ''}

    <section class="dash-section">
      ${items.length === 0
        ? '<p class="muted">清单为空，从上方添加或选择常用项。</p>'
        : `<ul class="check-list">${items.map((c) => row(c)).join('')}</ul>`}
    </section>
  `;

  const form = container.querySelector('#check-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = form.text.value.trim();
    if (!text) return;
    addChecklistItem(trip.id, text);
    ctx.rerender();
  });

  for (const el of container.querySelectorAll('[data-preset]')) {
    el.addEventListener('click', () => {
      addChecklistItem(trip.id, el.dataset.preset);
      ctx.rerender();
    });
  }
  const all = container.querySelector('[data-preset-all]');
  if (all) all.addEventListener('click', () => {
    addChecklistItems(trip.id, presetsLeft);
    ctx.rerender();
  });

  for (const el of container.querySelectorAll('[data-toggle]')) {
    el.addEventListener('change', () => {
      toggleChecklistItem(trip.id, el.dataset.toggle);
      ctx.rerender();
    });
  }
  for (const el of container.querySelectorAll('[data-del]')) {
    el.addEventListener('click', () => {
      deleteChecklistItem(trip.id, el.dataset.del);
      ctx.rerender();
    });
  }
}

function row(c) {
  return `
    <li class="check-item ${c.done ? 'is-done' : ''}">
      <label class="check-label">
        <input type="checkbox" data-toggle="${c.id}" ${c.done ? 'checked' : ''}>
        <span class="check-text">${esc(c.text)}</span>
      </label>
      <button type="button" class="icon-btn" data-del="${c.id}" title="删除">🗑️</button>
    </li>
  `;
}
