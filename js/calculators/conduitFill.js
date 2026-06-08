import {
  CONDUIT_FILL_PERCENT,
  CONDUIT_AREA,
  CONDUIT_TRADE_SIZES,
  CONDUCTOR_AREA_THHN,
  WIRE_SIZES,
} from '../data.js';

// Conduit fill calculator per NEC Chapter 9, Table 1 (max % fill) using
// Table 4 conduit internal areas and Table 5 conductor areas (THHN/THWN-2
// reference subset). Supports up to four conductor groups so mixed-size
// runs can be checked in one pass.

export const id = 'conduit-fill';
export const title = 'Conduit Fill';
export const subtitle = 'Check conductor fill against NEC Chapter 9, Table 1';

const CONDUIT_TYPES = Object.keys(CONDUIT_AREA);
const ROWS = 4;

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="cf-form">
      <label class="field">
        <span class="field-label">Conduit type</span>
        <select class="field-input" name="conduitType" id="cf-type"></select>
      </label>
      <label class="field">
        <span class="field-label">Trade size</span>
        <select class="field-input" name="tradeSize" id="cf-trade"></select>
      </label>

      <fieldset class="field-group">
        <legend>Conductors (THHN/THWN-2 reference areas — mix sizes as needed)</legend>
        ${Array.from({ length: ROWS }).map((_, i) => conductorRow(i)).join('')}
      </fieldset>

      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="cf-calc">Calculate</button>
        <button type="button" class="btn btn-ghost" id="cf-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="cf-result" hidden></div>
    <p class="calc-note">
      Max fill applied per NEC Chapter 9, Table 1: 53% for one conductor, 31% for two,
      40% for three or more (over-40-fill nipples ≤24" long may use 60% per Table 1 Note 4
      — not modeled here). Conduit and conductor areas are commonly published reference
      subsets for EMT / PVC Schedule 40 / RMC and THHN/THWN-2 insulation — always verify
      actual stamped/listed dimensions and the table values in the NEC edition adopted
      locally, especially for compact-stranded, lead-covered, or other insulation types.
    </p>
  `;

  const form = container.querySelector('#cf-form');
  const result = container.querySelector('#cf-result');
  const typeSelect = container.querySelector('#cf-type');
  const tradeSelect = container.querySelector('#cf-trade');

  typeSelect.innerHTML = CONDUIT_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('');

  function populateTradeSizes() {
    const available = CONDUIT_AREA[typeSelect.value];
    const sizes = CONDUIT_TRADE_SIZES.filter((s) => available[s] !== undefined);
    tradeSelect.innerHTML = sizes.map((s) => `<option value="${s}">${s}"</option>`).join('');
  }
  populateTradeSizes();
  typeSelect.addEventListener('change', populateTradeSizes);

  container.querySelector('#cf-calc').addEventListener('click', () => {
    const conduitArea = CONDUIT_AREA[typeSelect.value][tradeSelect.value];

    let totalConductors = 0;
    let totalArea = 0;
    const breakdown = [];

    for (let i = 0; i < ROWS; i++) {
      const sizeEl = form.querySelector(`[name="size_${i}"]`);
      const qtyEl = form.querySelector(`[name="qty_${i}"]`);
      const qty = Math.floor(Number(qtyEl.value)) || 0;
      if (qty <= 0) continue;

      const size = sizeEl.value;
      const area = CONDUCTOR_AREA_THHN[size] * qty;
      totalConductors += qty;
      totalArea += area;
      breakdown.push({ size, qty, area });
    }

    if (totalConductors === 0) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter at least one conductor size and quantity.</p>`;
      return;
    }

    const fillKey = totalConductors === 1 ? 1 : totalConductors === 2 ? 2 : 3;
    const maxPercent = CONDUIT_FILL_PERCENT[fillKey];
    const maxArea = conduitArea * maxPercent;
    const usedPercent = (totalArea / conduitArea) * 100;
    const fits = totalArea <= maxArea;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Total conductors</span><span class="result-value">${totalConductors}</span></div>
        <div class="result-item"><span class="result-label">Conduit internal area</span><span class="result-value">${conduitArea.toFixed(3)} in²</span></div>
        <div class="result-item"><span class="result-label">Allowed fill (${(maxPercent * 100).toFixed(0)}%)</span><span class="result-value">${maxArea.toFixed(3)} in²</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">Conductor fill area</span><span class="result-value">${totalArea.toFixed(3)} in² (${usedPercent.toFixed(1)}%)</span></div>
      </div>
      <p class="result-message ${fits ? 'result-good' : 'result-bad'}">
        ${fits
          ? `Fits within the ${(maxPercent * 100).toFixed(0)}% fill limit for ${totalConductors} conductor${totalConductors > 1 ? 's' : ''}.`
          : `Exceeds the ${(maxPercent * 100).toFixed(0)}% fill limit — go up a trade size, split into multiple raceways, or reduce conductor count/size.`}
      </p>
      <ul class="result-breakdown">
        ${breakdown.map((b) => `<li>${b.qty} × ${formatSize(b.size)} THHN — ${b.area.toFixed(3)} in² total</li>`).join('')}
      </ul>
    `;
  });

  container.querySelector('#cf-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

function conductorRow(index) {
  return `
    <div class="conductor-row">
      <label class="field">
        <span class="field-label">Size ${index + 1}</span>
        <select class="field-input" name="size_${index}">
          ${WIRE_SIZES.filter((s) => CONDUCTOR_AREA_THHN[s]).map((s) => `<option value="${s}">${formatSize(s)}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Qty</span>
        <input class="field-input field-input-narrow" type="number" inputmode="numeric" min="0" step="1" name="qty_${index}" value="${index === 0 ? 3 : 0}">
      </label>
    </div>
  `;
}

function formatSize(size) {
  return /^\d+$/.test(size) && Number(size) >= 250 ? `${size} kcmil` : `${size} AWG`;
}
