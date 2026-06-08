import { LIGHTING_UNIT_LOADS, LIGHTING_DEMAND_FACTORS } from '../data.js';

// General lighting load calculator per NEC Article 220:
//  - Connected load = floor area x unit load (Table 220.12, VA/ft^2)
//  - Demand load = tiered demand factors where Table 220.42 provides them
//  - Continuous-load adjustment (x1.25) for conductor / OCPD sizing,
//    since general lighting is ordinarily a continuous load (NEC Art. 100,
//    210.19(A), 215.2(A))

export const id = 'lighting-load';
export const title = 'Lighting Load';
export const subtitle = 'General lighting load, demand factors & sizing current (NEC 220.12 / 220.42)';

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="ll-form">
      <label class="field">
        <span class="field-label">Occupancy type</span>
        <select class="field-input" name="occupancy" id="ll-occupancy">
          ${LIGHTING_UNIT_LOADS.map((o, i) => `<option value="${i}">${o.type} — ${o.vaPerSqFt} VA/ft²</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field-label">Floor area (sq ft)</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="area" id="ll-area" placeholder="e.g. 2400">
      </label>
      <label class="field">
        <span class="field-label">System</span>
        <select class="field-input" name="phase" id="ll-phase">
          <option value="1" selected>Single-phase</option>
          <option value="3">Three-phase</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Supply voltage (V)</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="voltage" id="ll-voltage" placeholder="e.g. 120">
      </label>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="ll-calc">Calculate</button>
        <button type="button" class="btn btn-ghost" id="ll-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="ll-result" hidden></div>
    <p class="calc-note">
      Unit loads are commonly published reference figures from NEC Table 220.12 (general
      lighting VA per square foot, using outside building dimensions per 220.12). Demand
      factors, where shown, follow Table 220.42's tiered reductions for that occupancy's
      general lighting portion only — other loads (receptacles, equipment, show windows,
      etc.) are calculated separately per Article 220 and are not included here. Always
      verify against the NEC edition &amp; amendments your local AHJ has adopted.
    </p>
  `;

  const form = container.querySelector('#ll-form');
  const result = container.querySelector('#ll-result');

  container.querySelector('#ll-calc').addEventListener('click', () => {
    const occupancy = LIGHTING_UNIT_LOADS[Number(form.occupancy.value)];
    const area = Number(form.area.value);
    const voltage = Number(form.voltage.value);
    const phase = Number(form.phase.value);

    if (![area, voltage].every((v) => Number.isFinite(v) && v > 0)) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter the floor area and supply voltage (both greater than zero).</p>`;
      return;
    }

    const connectedVA = area * occupancy.vaPerSqFt;
    const demand = occupancy.demandKey ? LIGHTING_DEMAND_FACTORS[occupancy.demandKey] : null;
    const { total: demandVA, breakdown } = demand ? tieredDemand(connectedVA, demand.tiers) : { total: connectedVA, breakdown: null };

    const continuousVA = demandVA * 1.25;
    const divisor = phase === 1 ? voltage : voltage * Math.sqrt(3);
    const amps = demandVA / divisor;
    const continuousAmps = continuousVA / divisor;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Connected lighting load</span><span class="result-value">${formatVA(connectedVA)} VA</span></div>
        <div class="result-item ${demand ? '' : 'result-item-highlight'}"><span class="result-label">${demand ? 'After Table 220.42 demand factor' : 'Demand load (no 220.42 reduction applies)'}</span><span class="result-value">${formatVA(demandVA)} VA</span></div>
        <div class="result-item"><span class="result-label">Equivalent current</span><span class="result-value">${round(amps)} A</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">× 1.25 continuous-load current</span><span class="result-value">${round(continuousAmps)} A</span></div>
      </div>
      ${breakdown ? `
        <p class="result-message">
          <strong>${demand.label}</strong> demand factor breakdown (Table 220.42):
        </p>
        <ul class="result-breakdown">
          ${breakdown.map((b) => `<li>${b.note}: ${formatVA(b.amount)} VA × ${(b.factor * 100).toFixed(0)}% = ${formatVA(b.demand)} VA</li>`).join('')}
        </ul>
      ` : ''}
      <p class="result-message">
        General lighting is ordinarily treated as a <strong>continuous load</strong> (on 3 hours
        or more) — branch-circuit conductors and overcurrent devices are generally sized for
        not less than 125% of the continuous portion (NEC 210.19(A)/215.2(A), 210.20(A)).
        The 125% figure above is shown for that sizing step; it is separate from any Table
        220.42 demand reduction already applied to the connected load.
      </p>
    `;
  });

  container.querySelector('#ll-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

// Apply Table 220.42-style tiered demand factors to a connected VA value.
function tieredDemand(connectedVA, tiers) {
  let remaining = connectedVA;
  let lowerBound = 0;
  let total = 0;
  const breakdown = [];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const tierCapacity = tier.upTo - lowerBound;
    const amount = Math.min(remaining, tierCapacity);
    const demand = amount * tier.factor;
    total += demand;
    breakdown.push({ note: tier.note, amount, factor: tier.factor, demand });
    remaining -= amount;
    lowerBound = tier.upTo;
  }

  return { total, breakdown };
}

function round(n) {
  return Number.isFinite(n) ? Number(n.toPrecision(4)) : '—';
}

// VA figures are whole-number-ish and often in the thousands — show them
// with thousands separators (e.g. "150,000") rather than calc-style precision.
function formatVA(n) {
  return Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—';
}
