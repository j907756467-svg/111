import * as ohmsLaw from './calculators/ohmsLaw.js';
import * as voltageDrop from './calculators/voltageDrop.js';
import * as ampacity from './calculators/ampacity.js';
import * as boxFill from './calculators/boxFill.js';
import * as conduitFill from './calculators/conduitFill.js';
import * as motorFlc from './calculators/motorFlc.js';
import * as lightingLoad from './calculators/lightingLoad.js';
import * as transformer from './calculators/transformer.js';

const CALCULATORS = [
  ohmsLaw, voltageDrop, ampacity, boxFill, conduitFill, motorFlc, lightingLoad, transformer,
];

const nav = document.getElementById('calc-nav');
const panel = document.getElementById('calc-panel');
const calcTitle = document.getElementById('calc-title');
const calcSubtitle = document.getElementById('calc-subtitle');

function buildNav() {
  nav.innerHTML = CALCULATORS.map(
    (calc) => `<button class="nav-btn" data-id="${calc.id}" type="button">${calc.title}</button>`
  ).join('');

  nav.addEventListener('click', (event) => {
    const btn = event.target.closest('.nav-btn');
    if (!btn) return;
    selectCalculator(btn.dataset.id);
  });
}

function selectCalculator(id) {
  const calc = CALCULATORS.find((c) => c.id === id) || CALCULATORS[0];

  for (const btn of nav.querySelectorAll('.nav-btn')) {
    btn.classList.toggle('is-active', btn.dataset.id === calc.id);
  }

  calcTitle.textContent = calc.title;
  calcSubtitle.textContent = calc.subtitle;
  panel.innerHTML = '';
  calc.render(panel);

  if (location.hash !== `#${calc.id}`) {
    history.replaceState(null, '', `#${calc.id}`);
  }
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function init() {
  buildNav();
  const requested = location.hash.replace('#', '');
  const initial = CALCULATORS.find((c) => c.id === requested) ? requested : CALCULATORS[0].id;
  selectCalculator(initial);

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (CALCULATORS.find((c) => c.id === id)) selectCalculator(id);
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}

init();
