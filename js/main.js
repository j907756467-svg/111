// App shell: builds the nav, routes between views via the URL hash, and keeps
// the header's "current trip" indicator in sync. Each view module exports
// { id, title, subtitle, render(container, ctx) } and is fully self-contained.

import * as dashboard from './views/dashboard.js';
import * as trips from './views/trips.js';
import * as itinerary from './views/itinerary.js';
import * as expenses from './views/expenses.js';
import * as checklist from './views/checklist.js';
import { getCurrentTrip } from './store.js';
import { esc, prettyDate } from './utils.js';

const VIEWS = [dashboard, trips, itinerary, expenses, checklist];

const nav = document.getElementById('view-nav');
const panel = document.getElementById('view-panel');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const tripIndicator = document.getElementById('trip-indicator');

let activeId = null;

const ctx = {
  // Re-render the currently active view in place (after a data mutation).
  rerender() {
    if (activeId) selectView(activeId, { keepScroll: true });
  },
  // Jump to another view by id.
  navigate(id) {
    if (location.hash !== `#${id}`) location.hash = `#${id}`;
    else selectView(id);
  },
  // Update the header chip after the current trip changes.
  refreshHeader: updateTripIndicator,
};

function buildNav() {
  nav.innerHTML = VIEWS.map(
    (v) => `<button class="nav-btn" data-id="${v.id}" type="button">${esc(v.navLabel || v.title)}</button>`
  ).join('');

  nav.addEventListener('click', (event) => {
    const btn = event.target.closest('.nav-btn');
    if (btn) ctx.navigate(btn.dataset.id);
  });
}

function selectView(id, opts = {}) {
  const view = VIEWS.find((v) => v.id === id) || VIEWS[0];
  activeId = view.id;

  for (const btn of nav.querySelectorAll('.nav-btn')) {
    btn.classList.toggle('is-active', btn.dataset.id === view.id);
  }

  viewTitle.textContent = view.title;
  viewSubtitle.textContent = view.subtitle;
  panel.innerHTML = '';
  view.render(panel, ctx);
  updateTripIndicator();

  if (location.hash !== `#${view.id}`) {
    history.replaceState(null, '', `#${view.id}`);
  }
  if (!opts.keepScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function updateTripIndicator() {
  const trip = getCurrentTrip();
  if (!trip) {
    tripIndicator.innerHTML = '<span class="trip-indicator-empty">未选择行程</span>';
    return;
  }
  const range = [trip.startDate, trip.endDate].filter(Boolean).map(prettyDate).join(' → ');
  tripIndicator.innerHTML = `
    <span class="trip-indicator-label">当前行程</span>
    <span class="trip-indicator-name">${esc(trip.title)}</span>
    ${range ? `<span class="trip-indicator-dates">${esc(range)}</span>` : ''}
  `;
}

function init() {
  buildNav();
  const requested = location.hash.replace('#', '');
  const initial = VIEWS.find((v) => v.id === requested) ? requested : VIEWS[0].id;
  selectView(initial);

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (VIEWS.find((v) => v.id === id)) selectView(id);
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

init();
