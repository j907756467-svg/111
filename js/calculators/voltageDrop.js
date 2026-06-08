import { CIRCULAR_MILS, WIRE_SIZES, RESISTIVITY_K } from '../data.js';

// Voltage drop calculator using the standard field formula:
//   Single-phase: VD = (2 x K x I x D) / CM
//   Three-phase:  VD = (1.732 x K x I x D) / CM
// where K is the conductor material constant, I is load current (A),
// D is the one-way conductor length (ft), and CM is the conductor's
// circular-mil area. This is the widely used "rule of thumb" approach
// taught for field estimating; for critical/long-run designs also check
// conductor AC impedance (NEC Chapter 9, Table 9).

export const id = 'voltage-drop';
export const title = 'Voltage Drop';
export const subtitle = 'Estimate conductor voltage drop for a circuit run';

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="vd-form">
      <label class="field">
        <span class="field-label">System</span>
        <select class="field-input" name="phase" id="vd-phase">
          <option value="1">Single-phase (×2)</option>
          <option value="3">Three-phase (×1.732)</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Conductor material</span>
        <select class="field-input" name="material" id="vd-material">
          <option value="copper">Copper (K = 12.9)</option>
          <option value="aluminum">Aluminum (K = 21.2)</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Conductor size (AWG / kcmil)</span>
        <select class="field-input" name="size" id="vd-size">
          ${WIRE_SIZES.map((s) => `<option value="${s}">${formatSize(s)} (${CIRCULAR_MILS[s].toLocaleString()} CM)</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Load current (A)</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="amps" id="vd-amps" placeholder="e.g. 20">
      </label>
      <label class="field">
        <span class="field-label">One-way distance (ft)</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="distance" id="vd-distance" placeholder="e.g. 100">
      </label>
      <label class="field">
        <span class="field-label">Source voltage (V)</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="voltage" id="vd-voltage" placeholder="e.g. 120">
      </label>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="vd-calc">Calculate</button>
        <button type="button" class="btn btn-ghost" id="vd-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="vd-result" hidden></div>
    <p class="calc-note">
      Formula: VD = (2 or 1.732 × K × I × D) ÷ CM. NEC recommends keeping voltage drop to
      ≤3% for branch circuits and ≤5% combined feeder + branch circuit (Informational Note,
      NEC 210.19(A) / 215.2(A)) for reasonable efficiency — these are recommendations, not
      hard requirements, unless adopted locally.
    </p>
  `;

  const form = container.querySelector('#vd-form');
  const result = container.querySelector('#vd-result');

  container.querySelector('#vd-calc').addEventListener('click', () => {
    const amps = Number(form.amps.value);
    const distance = Number(form.distance.value);
    const voltage = Number(form.voltage.value);
    const size = form.size.value;
    const material = form.material.value;
    const phase = Number(form.phase.value);

    if (![amps, distance, voltage].every((v) => Number.isFinite(v) && v > 0)) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter current, distance, and source voltage (all greater than zero).</p>`;
      return;
    }

    const K = RESISTIVITY_K[material];
    const CM = CIRCULAR_MILS[size];
    const multiplier = phase === 1 ? 2 : Math.sqrt(3);

    const dropVolts = (multiplier * K * amps * distance) / CM;
    const dropPercent = (dropVolts / voltage) * 100;
    const endVoltage = voltage - dropVolts;

    let verdict = 'within the commonly recommended 3% range for branch circuits.';
    let verdictClass = 'good';
    if (dropPercent > 5) {
      verdict = 'above the commonly recommended 5% combined limit — consider a larger conductor or shorter run.';
      verdictClass = 'bad';
    } else if (dropPercent > 3) {
      verdict = 'above the commonly recommended 3% branch-circuit guideline, but within the 5% combined allowance.';
      verdictClass = 'warn';
    }

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Voltage drop</span><span class="result-value">${round(dropVolts)} V</span></div>
        <div class="result-item"><span class="result-label">Drop percentage</span><span class="result-value">${round(dropPercent)}%</span></div>
        <div class="result-item"><span class="result-label">Voltage at load</span><span class="result-value">${round(endVoltage)} V</span></div>
      </div>
      <p class="result-message result-${verdictClass}">This is ${verdict}</p>
    `;
  });

  container.querySelector('#vd-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

function formatSize(size) {
  return /^\d+$/.test(size) && Number(size) >= 250 ? `${size} kcmil` : `${size} AWG`;
}

function round(n) {
  return Number.isFinite(n) ? Number(n.toPrecision(4)) : '—';
}
