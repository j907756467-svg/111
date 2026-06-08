const store = require('../../utils/store.js');
const { money, prettyDate, daysBetween, daysUntil, todayISO } = require('../../utils/util.js');

Page({
  data: { hasTrip: false },

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
    const days = daysBetween(trip.startDate, trip.endDate);
    const until = daysUntil(trip.startDate);
    const endUntil = daysUntil(trip.endDate);

    let countdown = '—';
    if (until !== null) {
      if (until > 0) countdown = '还有 ' + until + ' 天出发';
      else if (until === 0) countdown = '今天出发';
      else if (endUntil !== null && endUntil >= 0) countdown = '行程进行中';
      else countdown = '行程已结束';
    }

    const overBudget = budget > 0 && spend > budget;
    const barClass = overBudget ? 'bad' : pct >= 80 ? 'warn' : 'good';

    const today = todayISO();
    const upcoming = trip.itinerary
      .slice()
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
      .filter((i) => i.date >= today)
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        when: prettyDate(i.date) + ' ' + (i.time || ''),
        title: i.title,
        location: i.location || '',
      }));

    const trips = store.getTrips().map((t) => {
      const range = [t.startDate, t.endDate].filter(Boolean).map(prettyDate).join(' → ') || '未排期';
      return {
        id: t.id,
        name: t.title,
        meta: (t.destination || '—') + ' · ' + range,
        spend: money(store.tripSpend(t)),
        isCurrent: t.id === trip.id,
      };
    });

    this.setData({
      hasTrip: true,
      destination: trip.destination || '出差',
      countdown,
      title: trip.title,
      dateRange: (trip.startDate ? prettyDate(trip.startDate) : '未设置日期') +
        (trip.endDate ? ' → ' + prettyDate(trip.endDate) : ''),
      daysLabel: days ? days + ' 天' : '',
      itineraryCount: trip.itinerary.length,
      spend: money(spend),
      budgetLabel: budget > 0 ? '预算 ' + money(budget) : '未设预算',
      remaining: money(remaining),
      remainingBad: remaining < 0,
      doneCount: trip.checklist.filter((c) => c.done).length,
      checkTotal: trip.checklist.length,
      hasBudget: budget > 0,
      pct,
      barClass,
      overBudget,
      budgetCardClass: overBudget ? 'bad' : pct >= 80 ? 'warn' : 'good',
      upcoming,
      trips,
    });
  },

  goTab(e) {
    wx.switchTab({ url: '/pages/' + e.currentTarget.dataset.tab + '/index' });
  },

  selectTrip(e) {
    store.setCurrentTrip(e.currentTarget.dataset.id);
    this.build();
  },

  resetAll() {
    wx.showModal({
      title: '清空全部数据',
      content: '确定要清空全部行程数据吗？此操作不可恢复。',
      confirmColor: '#a32424',
      success: (res) => {
        if (res.confirm) {
          store.resetAll();
          this.build();
        }
      },
    });
  },
});
