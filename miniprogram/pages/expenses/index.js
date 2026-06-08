const store = require('../../utils/store.js');
const { money, prettyDate, todayISO } = require('../../utils/util.js');
const { EXPENSE_CATEGORIES, expenseCategory } = require('../../utils/constants.js');

const CAT_LABELS = EXPENSE_CATEGORIES.map((c) => c.icon + ' ' + c.label);

function emptyForm() {
  return { categoryIndex: 0, amount: '', date: todayISO(), note: '' };
}

Page({
  data: {
    hasTrip: false,
    catLabels: CAT_LABELS,
    form: emptyForm(),
    error: '',
  },

  onShow() {
    this.build();
  },

  build() {
    const trip = store.getCurrentTrip();
    if (!trip) {
      this.setData({ hasTrip: false });
      return;
    }

    const spend = store.tripSpend(trip);
    const budget = trip.budget || 0;
    const remaining = budget - spend;
    const pct = budget > 0 ? Math.min(100, Math.round((spend / budget) * 100)) : 0;
    const over = budget > 0 && spend > budget;
    const barClass = over ? 'bad' : pct >= 80 ? 'warn' : 'good';

    // Category breakdown
    const totals = {};
    trip.expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + (Number(e.amount) || 0);
    });
    const breakdown = Object.keys(totals)
      .map((cat) => {
        const meta = expenseCategory(cat);
        const amt = totals[cat];
        return {
          label: meta.icon + ' ' + meta.label,
          amount: money(amt),
          pct: spend > 0 ? Math.round((amt / spend) * 100) : 0,
          raw: amt,
        };
      })
      .sort((a, b) => b.raw - a.raw);

    // Detailed list, newest first
    const list = trip.expenses
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .map((e) => {
        const meta = expenseCategory(e.category);
        return {
          id: e.id,
          icon: meta.icon,
          note: e.note || meta.label,
          meta: meta.label + ' · ' + prettyDate(e.date),
          amount: money(e.amount),
        };
      });

    this.setData({
      hasTrip: true,
      spend: money(spend),
      spendOver: over,
      hasBudget: budget > 0,
      budgetLabel: budget > 0 ? money(budget) : '未设置',
      remainingText: over ? '已超支 ' + money(spend - budget) : '剩余 ' + money(remaining),
      pct,
      barClass,
      breakdown,
      list,
      expenseCount: trip.expenses.length,
    });
  },

  onCategory(e) { this.setData({ 'form.categoryIndex': Number(e.detail.value) }); },
  onDate(e) { this.setData({ 'form.date': e.detail.value }); },
  onInput(e) {
    this.setData({ ['form.' + e.currentTarget.dataset.field]: e.detail.value });
  },

  add() {
    const f = this.data.form;
    const trip = store.getCurrentTrip();
    if (!trip) return;
    const amount = Number(f.amount);
    if (!isFinite(amount) || amount <= 0) {
      this.setData({ error: '请输入有效的金额。' });
      return;
    }
    store.addExpense(trip.id, {
      category: EXPENSE_CATEGORIES[f.categoryIndex].value,
      amount: amount,
      date: f.date || todayISO(),
      note: f.note.trim(),
    });
    this.setData({ form: emptyForm(), error: '' });
    this.build();
  },

  remove(e) {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.deleteExpense(trip.id, e.currentTarget.dataset.id);
    this.build();
  },

  goTrips() { wx.switchTab({ url: '/pages/trips/index' }); },
});
