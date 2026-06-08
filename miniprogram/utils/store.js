// Central data store. Persists a single object to WeChat synchronous storage
// so the mini program works fully offline. Pages read through these helpers
// and every mutator saves immediately.

const { uid, todayISO } = require('./util.js');

const STORAGE_KEY = 'tripmate_v1';

function addDays(iso, n) {
  const d = new Date(iso.replace(/-/g, '/') + ' 00:00:00');
  d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Sample trip for first-time users. Writes storage directly and returns the
// object — runs during module init before `state` exists, so it must not
// reference the `state` global.
function seed() {
  const tripId = uid();
  const seeded = {
    trips: [{
      id: tripId,
      title: '上海客户拜访',
      destination: '上海',
      startDate: todayISO(),
      endDate: addDays(todayISO(), 2),
      budget: 5000,
      notes: '与华东区客户对接季度合作方案。',
      itinerary: [
        { id: uid(), type: 'flight', title: 'CA1858 北京→上海虹桥', date: todayISO(), time: '08:30', location: '首都T3', notes: '提前2小时到机场' },
        { id: uid(), type: 'hotel', title: '入住外滩茂悦大酒店', date: todayISO(), time: '13:00', location: '黄浦区', notes: '已含双早' },
        { id: uid(), type: 'meeting', title: '客户季度沟通会', date: addDays(todayISO(), 1), time: '10:00', location: '客户总部 18F', notes: '带合同与样品' },
      ],
      expenses: [
        { id: uid(), category: 'transport', amount: 1280, date: todayISO(), note: '往返机票' },
        { id: uid(), category: 'hotel', amount: 1560, date: todayISO(), note: '酒店2晚' },
      ],
      checklist: [
        { id: uid(), text: '身份证 / 工牌', done: true },
        { id: uid(), text: '笔记本电脑 + 充电器', done: false },
        { id: uid(), text: '合同与名片', done: false },
        { id: uid(), text: '报销单据信封', done: false },
      ],
    }],
    currentTripId: tripId,
  };
  try { wx.setStorageSync(STORAGE_KEY, seeded); } catch (e) {}
  return seeded;
}

function load() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw) return seed();
    return {
      trips: Array.isArray(raw.trips) ? raw.trips : [],
      currentTripId: raw.currentTripId || null,
    };
  } catch (e) {
    return seed();
  }
}

let state = load();

function save() {
  try { wx.setStorageSync(STORAGE_KEY, state); } catch (e) {}
}

function findTrip(id) {
  return state.trips.find((t) => t.id === id);
}

// ---------- Trips ----------

function getTrips() {
  return state.trips.slice().sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}

function getCurrentTrip() {
  return findTrip(state.currentTripId) || null;
}

function setCurrentTrip(id) {
  state.currentTripId = id;
  save();
}

function addTrip(data) {
  const trip = {
    id: uid(),
    title: data.title || '未命名出差',
    destination: data.destination || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: Number(data.budget) || 0,
    notes: data.notes || '',
    itinerary: [],
    expenses: [],
    checklist: [],
  };
  state.trips.push(trip);
  state.currentTripId = trip.id;
  save();
  return trip;
}

function updateTrip(id, data) {
  const trip = findTrip(id);
  if (!trip) return;
  trip.title = data.title != null ? data.title : trip.title;
  trip.destination = data.destination != null ? data.destination : trip.destination;
  trip.startDate = data.startDate != null ? data.startDate : trip.startDate;
  trip.endDate = data.endDate != null ? data.endDate : trip.endDate;
  trip.budget = data.budget !== undefined ? (Number(data.budget) || 0) : trip.budget;
  trip.notes = data.notes != null ? data.notes : trip.notes;
  save();
}

function deleteTrip(id) {
  state.trips = state.trips.filter((t) => t.id !== id);
  if (state.currentTripId === id) {
    state.currentTripId = state.trips.length ? state.trips[0].id : null;
  }
  save();
}

// ---------- Itinerary ----------

function addItinerary(tripId, item) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.itinerary.push(Object.assign({ id: uid() }, item));
  save();
}

function deleteItinerary(tripId, itemId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.itinerary = trip.itinerary.filter((i) => i.id !== itemId);
  save();
}

// ---------- Expenses ----------

function addExpense(tripId, expense) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.expenses.push(Object.assign({ id: uid() }, expense, { amount: Number(expense.amount) || 0 }));
  save();
}

function deleteExpense(tripId, expenseId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);
  save();
}

// ---------- Checklist ----------

function addChecklistItem(tripId, text) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.checklist.push({ id: uid(), text: text, done: false });
  save();
}

function addChecklistItems(tripId, texts) {
  const trip = findTrip(tripId);
  if (!trip) return;
  const existing = {};
  trip.checklist.forEach((c) => { existing[c.text] = true; });
  texts.forEach((text) => {
    if (!existing[text]) {
      existing[text] = true;
      trip.checklist.push({ id: uid(), text: text, done: false });
    }
  });
  save();
}

function toggleChecklistItem(tripId, itemId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  const item = trip.checklist.find((c) => c.id === itemId);
  if (item) item.done = !item.done;
  save();
}

function deleteChecklistItem(tripId, itemId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  trip.checklist = trip.checklist.filter((c) => c.id !== itemId);
  save();
}

// ---------- Derived ----------

function tripSpend(trip) {
  if (!trip) return 0;
  return trip.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

function resetAll() {
  state = { trips: [], currentTripId: null };
  save();
}

module.exports = {
  getTrips, getCurrentTrip, setCurrentTrip,
  addTrip, updateTrip, deleteTrip,
  addItinerary, deleteItinerary,
  addExpense, deleteExpense,
  addChecklistItem, addChecklistItems, toggleChecklistItem, deleteChecklistItem,
  tripSpend, resetAll,
};
