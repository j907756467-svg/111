// Expenses view — log spend by category and track it against the trip budget.

import { getCurrentTrip, addExpense, deleteExpense, tripSpend } from '../store.js';
import { EXPENSE_CATEGORIES, expenseCategory } from '../constants.js';
import { esc, money, prettyDate, todayISO } from '../utils.js';
import { noTripState } from './shared.js';

export const id = 'expenses';
export const navLabel = '费用预算';
export const title = '费用预算';
export const subtitle = '记录开销，实时对比出差预算';

export function render(container, ctx) {
  const trip = getCurrentTrip();
  if (!trip) { noTripState(container, ctx); return; }

  const spend = tripSpend(trip);
  const budget = trip.budget || 0;
  const remaining = budget - spend;
  const pct = budget > 0 ? Math.min(100, Math.round((spend / budget) * 100)) : 0;
  const over = budget > 0 && spend > budget;
  const barClass = over ? 'stat-bad' : pct >= 80 ? 'stat-warn' : 'stat-good';

  container.innerHTML = `
    <div class="budget-summary">
      <div class="budget-summary-row">
        <div><span class="stat-label">已花费</span><p class="budget-big ${over ? 'text-bad' : ''}">${money(spend)}</p></div>
        <div class="budget-summary-right">
          <span class="stat-label">预算</span><p class="budget-mid">${budget > 0 ? money(budget) : '未设置'}</p>
        </div>
      </div>
      ${budget > 0 ? `
        <div class="budget-bar"><div class="budget-bar-fill ${barClass}" style="width:${pct}%"></div></div>
        <p class="budget-bar-text">
          ${over ? `已超支 ${money(spend - budget)}` : `剩余 ${money(remaining)}`} · 使用 ${pct}%
        </p>` : '<p class="muted">在「行程管理」中为本次出差设置预算后，可在此追踪结余。</p>'}
    </div>

    ${renderBreakdown(trip, spend)}

    <form class="calc-form expense-form" id="exp-form">
      <p class="form-heading">记一笔</p>
      <label class="field">
        <span class="field-label">类别</span>
        <select class="field-input" name="category">
          ${EXPENSE_CATEGORIES.map((c) => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">金额 (¥) *</span>
        <input class="field-input" name="amount" type="number" inputmode="decimal" min="0" step="any" required placeholder="0.00">
      </label>
      <label class="field">
        <span class="field-label">日期</span>
        <input class="field-input" name="date" type="date" value="${esc(todayISO())}">
      </label>
      <label class="field full">
        <span class="field-label">说明</span>
        <input class="field-input" name="note" maxlength="80" placeholder="如：高铁票 / 客户晚餐">
      </label>
      <div class="btn-row full">
        <button type="submit" class="btn btn-primary">添加费用</button>
      </div>
      <p class="form-error" id="exp-error" hidden></p>
    </form>

    <section class="dash-section">
      <h3 class="section-title">费用明细 (${trip.expenses.length})</h3>
      ${renderList(trip)}
    </section>
  `;

  const form = container.querySelector('#exp-form');
  const error = container.querySelector('#exp-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.amount.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      error.hidden = false;
      error.textContent = '请输入有效的金额。';
      return;
    }
    addExpense(trip.id, {
      category: form.category.value,
      amount,
      date: form.date.value || todayISO(),
      note: form.note.value.trim(),
    });
    ctx.rerender();
  });

  for (const el of container.querySelectorAll('[data-del]')) {
    el.addEventListener('click', () => {
      deleteExpense(trip.id, el.dataset.del);
      ctx.rerender();
    });
  }
}

function renderBreakdown(trip, spend) {
  if (trip.expenses.length === 0) return '';
  const totals = new Map();
  for (const e of trip.expenses) {
    totals.set(e.category, (totals.get(e.category) || 0) + (Number(e.amount) || 0));
  }
  const rows = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => {
      const meta = expenseCategory(cat);
      const pct = spend > 0 ? Math.round((amt / spend) * 100) : 0;
      return `
        <div class="breakdown-row">
          <span class="breakdown-label">${meta.icon} ${esc(meta.label)}</span>
          <span class="breakdown-track"><span class="breakdown-fill" style="width:${pct}%"></span></span>
          <span class="breakdown-amt">${money(amt)} <small>${pct}%</small></span>
        </div>`;
    });
  return `
    <section class="dash-section">
      <h3 class="section-title">分类占比</h3>
      <div class="breakdown">${rows.join('')}</div>
    </section>
  `;
}

function renderList(trip) {
  if (trip.expenses.length === 0) {
    return '<p class="muted">还没有费用记录。</p>';
  }
  const items = trip.expenses.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `
    <ul class="expense-list">
      ${items.map((e) => {
        const meta = expenseCategory(e.category);
        return `
          <li class="expense-item">
            <span class="expense-icon" title="${esc(meta.label)}">${meta.icon}</span>
            <div class="expense-body">
              <p class="expense-note">${esc(e.note || meta.label)}</p>
              <p class="expense-meta">${esc(meta.label)} · ${esc(prettyDate(e.date))}</p>
            </div>
            <span class="expense-amt">${money(e.amount)}</span>
            <button type="button" class="icon-btn" data-del="${e.id}" title="删除">🗑️</button>
          </li>`;
      }).join('')}
    </ul>
  `;
}
