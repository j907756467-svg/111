import {
  AMPACITY_COPPER,
  AMPACITY_ALUMINUM,
  TEMP_CORRECTION,
  CONDUCTOR_ADJUSTMENT,
  WIRE_SIZES,
} from '../data.js';

// Conductor ampacity lookup with ambient-temperature correction (NEC Table
// 310.15(B)(1)(1)) and current-carrying-conductor adjustment (NEC Table
// 310.15(C)(1)) applied to the NEC Table 310.16 base allowable ampacity.

export const id = 'ampacity';
export const title = 'Conductor Ampacity';
export const subtitle = 'Base ampacity with temperature & bundling derating (NEC 310.16)';

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="amp-form">
      <label class="field">
        <span class="field-label">Conductor material</span>
        <select class="field-input" name="material" id="amp-material">
          <option value="copper">Copper</option>
          <option value="aluminum">Aluminum / copper-clad aluminum</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Conductor size (AWG / kcmil)</span>
        <select class="field-input" name="size" id="amp-size"></select>
      </label>
      <label class="field">
        <span class="field-label">Insulation temperature rating</span>
        <select class="field-input" name="rating" id="amp-rating">
          <option value="60">60°C (e.g. TW, UF)</option>
          <option value="75" selected>75°C (e.g. THW, THWN, XHHW)</option>
          <option value="90">90°C (e.g. THHN, THWN-2, XHHW-2)</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Ambient temperature</span>
        <select class="field-input" name="ambient" id="amp-ambient">
          ${TEMP_CORRECTION.ranges.map((r, i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Current-carrying conductors in raceway/cable</span>
        <input class="field-input" type="number" inputmode="numeric" min="1" step="1" name="count" id="amp-count" value="3">
      </label>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="amp-calc">Calculate</button>
        <button type="button" class="btn btn-ghost" id="amp-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="amp-result" hidden></div>
    <p class="calc-note">
      Base values reflect commonly published NEC Table 310.16 reference ampacities for
      insulated conductors (not more than 3 current-carrying conductors, 30°C ambient,
      raceway/cable/earth). Always verify against the NEC edition &amp; amendments adopted
      by your local AHJ, and remember the conductor ampacity is also capped by its
      terminal/equipment temperature rating (commonly 60°C or 75°C — NEC 110.14(C)).
    </p>
  `;

  const form = container.querySelector('#amp-form');
  const result = container.querySelector('#amp-result');
  const sizeSelect = container.querySelector('#amp-size');

  function populateSizes() {
    const table = form.material.value === 'copper' ? AMPACITY_COPPER : AMPACITY_ALUMINUM;
    const sizes = WIRE_SIZES.filter((s) => table[s]);
    sizeSelect.innerHTML = sizes.map((s) => `<option value="${s}">${formatSize(s)}</option>`).join('');
  }
  populateSizes();
  form.material.addEventListener('change', populateSizes);

  container.querySelector('#amp-calc').addEventListener('click', () => {
    const table = form.material.value === 'copper' ? AMPACITY_COPPER : AMPACITY_ALUMINUM;
    const size = sizeSelect.value;
    const rating = Number(form.rating.value);
    const ambientIndex = Number(form.ambient.value);
    const count = Math.max(1, Math.floor(Number(form.count.value) || 1));

    const base = table[size]?.[rating];
    if (base === undefined) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">No reference value for that combination — try a different size or rating.</p>`;
      return;
    }

    const tempFactor = TEMP_CORRECTION.factors[rating][ambientIndex];
    const adjustment = CONDUCTOR_ADJUSTMENT.find((a) => count <= a.max);
    const bundleFactor = count > 3 ? adjustment.factor : 1;

    if (tempFactor === null) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">The ${rating}°C conductor is not rated for that ambient temperature — choose a higher temperature-rated insulation or a lower ambient range.</p>`;
      return;
    }

    const adjusted = base * tempFactor * bundleFactor;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Table 310.16 base ampacity</span><span class="result-value">${base} A</span></div>
        <div class="result-item"><span class="result-label">Ambient correction factor</span><span class="result-value">× ${tempFactor}</span></div>
        <div class="result-item"><span class="result-label">Conductor bundling factor</span><span class="result-value">× ${bundleFactor}${count > 3 ? ` (${adjustment.range} conductors)` : ' (3 or fewer — no adjustment)'}</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">Adjusted allowable ampacity</span><span class="result-value">${round(adjusted)} A</span></div>
      </div>
      <p class="result-message">
        Remember: the conductor's <strong>final rating</strong> is the lowest of (a) this adjusted
        ampacity, (b) the conductor's terminal temperature rating limit, and (c) the next
        standard overcurrent device size where permitted by NEC 240.4(B).
      </p>
    `;
  });

  container.querySelector('#amp-clear').addEventListener('click', () => {
    form.reset();
    populateSizes();
    result.hidden = true;
  });
}

function formatSize(size) {
  return /^\d+$/.test(size) && Number(size) >= 250 ? `${size} kcmil` : `${size} AWG`;
}

function round(n) {
  return Number.isFinite(n) ? Number(n.toPrecision(4)) : '—';
}
