// Central data store for the trip planner.
// Everything is persisted to localStorage as a single JSON blob so the app
// works fully offline with no backend. Views read through the exported helpers
// and call save() (implicit in every mutator) so state survives refreshes.

import { uid, todayISO } from './utils.js';

const STORAGE_KEY = 'tripmate.v1';

const DEFAULT_STATE = {
  trips: [],
  currentTripId: null,
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    return {
      trips: Array.isArray(parsed.trips) ? parsed.trips : [],
      currentTripId: parsed.currentTripId ?? null,
    };
  } catch {
    return seed();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota) — keep working in memory.
  }
}

// A small sample trip so a first-time user sees how the app works rather than
// an empty shell. Only created when no saved data exists. Persists and returns
// the object directly — runs during module init, before `state` is assigned,
// so it must not reference the `state` global.
function seed() {
  const tripId = uid();
  const seeded = {
    trips: [
      {
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
      },
    ],
    currentTripId: tripId,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore storage failures — the seed still works in memory for this session.
  }
  return seeded;
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------- Trips ----------

export function getTrips() {
  return state.trips.slice().sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}

export function getCurrentTrip() {
  return state.trips.find((t) => t.id === state.currentTripId) || null;
}

export function setCurrentTrip(id) {
  state.currentTripId = id;
  save();
}

export function addTrip(data) {
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

export function updateTrip(id, data) {
  const trip = state.trips.find((t) => t.id === id);
  if (!trip) return;
  Object.assign(trip, {
    title: data.title ?? trip.title,
    destination: data.destination ?? trip.destination,
    startDate: data.startDate ?? trip.startDate,
    endDate: data.endDate ?? trip.endDate,
    budget: data.budget !== undefined ? Number(data.budget) || 0 : trip.budget,
    notes: data.notes ?? trip.notes,
  });
  save();
}

export function deleteTrip(id) {
  state.trips = state.trips.filter((t) => t.id !== id);
  if (state.currentTripId === id) {
    state.currentTripId = state.trips[0]?.id || null;
  }
  save();
}

// ---------- Itinerary items ----------

export function addItinerary(tripId, item) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.itinerary.push({ id: uid(), ...item });
  save();
}

export function deleteItinerary(tripId, itemId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.itinerary = trip.itinerary.filter((i) => i.id !== itemId);
  save();
}

// ---------- Expenses ----------

export function addExpense(tripId, expense) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.expenses.push({ id: uid(), ...expense, amount: Number(expense.amount) || 0 });
  save();
}

export function deleteExpense(tripId, expenseId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);
  save();
}

// ---------- Checklist ----------

export function addChecklistItem(tripId, text) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.checklist.push({ id: uid(), text, done: false });
  save();
}

export function addChecklistItems(tripId, texts) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  const existing = new Set(trip.checklist.map((c) => c.text));
  for (const text of texts) {
    if (existing.has(text)) continue;
    existing.add(text);
    trip.checklist.push({ id: uid(), text, done: false });
  }
  save();
}

export function toggleChecklistItem(tripId, itemId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  const item = trip.checklist.find((c) => c.id === itemId);
  if (item) item.done = !item.done;
  save();
}

export function deleteChecklistItem(tripId, itemId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.checklist = trip.checklist.filter((c) => c.id !== itemId);
  save();
}

// ---------- Derived helpers ----------

export function tripSpend(trip) {
  if (!trip) return 0;
  return trip.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

// Reset everything (used by the danger-zone button on the dashboard).
export function resetAll() {
  state = { trips: [], currentTripId: null };
  save();
}
