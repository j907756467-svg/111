const store = require('../../utils/store.js');
const { money, prettyDate, daysBetween } = require('../../utils/util.js');

const EMPTY_FORM = { title: '', destination: '', budget: '', startDate: '', endDate: '', notes: '' };

Page({
  data: {
    trips: [],
    editingId: null,
    form: Object.assign({}, EMPTY_FORM),
    error: '',
  },

  onShow() {
    this.build();
  },

  build() {
    const current = store.getCurrentTrip();
    const trips = store.getTrips().map((t) => {
      const range = [t.startDate, t.endDate].filter(Boolean).map(prettyDate).join(' → ') || '未排期';
      const days = daysBetween(t.startDate, t.endDate);
      const spend = store.tripSpend(t);
      return {
        id: t.id,
        title: t.title,
        meta: '📍 ' + (t.destination || '—') + ' · ' + range + (days ? ' · ' + days + '天' : ''),
        budgetLabel: '预算 ' + money(t.budget),
        spendLabel: '已花 ' + money(spend),
        over: t.budget > 0 && spend > t.budget,
        isCurrent: current && current.id === t.id,
      };
    });
    this.setData({ trips });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['form.' + field]: e.detail.value });
  },

  onStartDate(e) {
    this.setData({ 'form.startDate': e.detail.value });
  },

  onEndDate(e) {
    this.setData({ 'form.endDate': e.detail.value });
  },

  submit() {
    const f = this.data.form;
    const data = {
      title: f.title.trim(),
      destination: f.destination.trim(),
      budget: f.budget,
      startDate: f.startDate,
      endDate: f.endDate,
      notes: f.notes.trim(),
    };
    if (!data.title) { this.setData({ error: '请填写出差主题。' }); return; }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      this.setData({ error: '返回日期不能早于出发日期。' });
      return;
    }
    if (this.data.editingId) {
      store.updateTrip(this.data.editingId, data);
      wx.showToast({ title: '已保存', icon: 'success' });
    } else {
      store.addTrip(data);
      wx.showToast({ title: '已创建', icon: 'success' });
    }
    this.setData({ editingId: null, form: Object.assign({}, EMPTY_FORM), error: '' });
    this.build();
  },

  edit(e) {
    const t = store.getTrips().find((x) => x.id === e.currentTarget.dataset.id);
    if (!t) return;
    this.setData({
      editingId: t.id,
      error: '',
      form: {
        title: t.title,
        destination: t.destination,
        budget: t.budget ? String(t.budget) : '',
        startDate: t.startDate,
        endDate: t.endDate,
        notes: t.notes,
      },
    });
    wx.pageScrollTo({ scrollTop: 0, duration: 250 });
  },

  cancelEdit() {
    this.setData({ editingId: null, form: Object.assign({}, EMPTY_FORM), error: '' });
  },

  select(e) {
    store.setCurrentTrip(e.currentTarget.dataset.id);
    wx.showToast({ title: '已切换', icon: 'none' });
    this.build();
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    const t = store.getTrips().find((x) => x.id === id);
    wx.showModal({
      title: '删除行程',
      content: '删除「' + (t ? t.title : '') + '」及其全部日程、费用和清单？',
      confirmColor: '#a32424',
      success: (res) => {
        if (res.confirm) {
          store.deleteTrip(id);
          if (this.data.editingId === id) {
            this.setData({ editingId: null, form: Object.assign({}, EMPTY_FORM) });
          }
          this.build();
        }
      },
    });
  },
});
