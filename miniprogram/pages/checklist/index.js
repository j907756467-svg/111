const store = require('../../utils/store.js');
const { PACKING_PRESETS } = require('../../utils/constants.js');

Page({
  data: {
    hasTrip: false,
    items: [],
    done: 0,
    total: 0,
    pct: 0,
    allDone: false,
    presetsLeft: [],
    inputText: '',
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
    const items = trip.checklist;
    const done = items.filter((c) => c.done).length;
    const total = items.length;
    const taken = {};
    items.forEach((c) => { taken[c.text] = true; });
    this.setData({
      hasTrip: true,
      items,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      allDone: total > 0 && done === total,
      presetsLeft: PACKING_PRESETS.filter((p) => !taken[p]),
    });
  },

  onInput(e) { this.setData({ inputText: e.detail.value }); },

  addCustom() {
    const text = this.data.inputText.trim();
    const trip = store.getCurrentTrip();
    if (!text || !trip) return;
    store.addChecklistItem(trip.id, text);
    this.setData({ inputText: '' });
    this.build();
  },

  addPreset(e) {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.addChecklistItem(trip.id, e.currentTarget.dataset.text);
    this.build();
  },

  addAll() {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.addChecklistItems(trip.id, this.data.presetsLeft);
    this.build();
  },

  toggle(e) {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.toggleChecklistItem(trip.id, e.currentTarget.dataset.id);
    this.build();
  },

  remove(e) {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.deleteChecklistItem(trip.id, e.currentTarget.dataset.id);
    this.build();
  },

  goTrips() { wx.switchTab({ url: '/pages/trips/index' }); },
});
