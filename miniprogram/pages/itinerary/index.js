const store = require('../../utils/store.js');
const { prettyDate, todayISO } = require('../../utils/util.js');
const { ITINERARY_TYPES, itineraryType } = require('../../utils/constants.js');

const TYPE_LABELS = ITINERARY_TYPES.map((t) => t.icon + ' ' + t.label);

function emptyForm(date) {
  return { typeIndex: 0, date: date || todayISO(), time: '', title: '', location: '', notes: '' };
}

Page({
  data: {
    hasTrip: false,
    typeLabels: TYPE_LABELS,
    form: emptyForm(),
    groups: [],
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

    // Group itinerary items by date (ascending), items within a day by time.
    const map = {};
    trip.itinerary.forEach((i) => {
      (map[i.date] = map[i.date] || []).push(i);
    });
    const groups = Object.keys(map).sort().map((date) => ({
      date,
      dateLabel: prettyDate(date),
      items: map[date]
        .slice()
        .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
        .map((i) => {
          const meta = itineraryType(i.type);
          return {
            id: i.id,
            icon: meta.icon,
            time: i.time || '全天',
            title: i.title,
            location: i.location || '',
            notes: i.notes || '',
          };
        }),
    }));

    const form = this.data.form;
    // Default the add-form date to the trip start the first time we load it.
    if (!this._inited) {
      form.date = trip.startDate || todayISO();
      this._inited = true;
    }

    this.setData({ hasTrip: true, groups, tripTitle: trip.title, form });
  },

  onType(e) { this.setData({ 'form.typeIndex': Number(e.detail.value) }); },
  onDate(e) { this.setData({ 'form.date': e.detail.value }); },
  onTime(e) { this.setData({ 'form.time': e.detail.value }); },
  onInput(e) {
    this.setData({ ['form.' + e.currentTarget.dataset.field]: e.detail.value });
  },

  add() {
    const f = this.data.form;
    const trip = store.getCurrentTrip();
    if (!trip) return;
    if (!f.title.trim() || !f.date) {
      this.setData({ error: '请填写事项与日期。' });
      return;
    }
    store.addItinerary(trip.id, {
      type: ITINERARY_TYPES[f.typeIndex].value,
      date: f.date,
      time: f.time,
      title: f.title.trim(),
      location: f.location.trim(),
      notes: f.notes.trim(),
    });
    this.setData({ form: emptyForm(f.date), error: '' });
    this.build();
  },

  remove(e) {
    const trip = store.getCurrentTrip();
    if (!trip) return;
    store.deleteItinerary(trip.id, e.currentTarget.dataset.id);
    this.build();
  },

  goTrips() { wx.switchTab({ url: '/pages/trips/index' }); },
});
