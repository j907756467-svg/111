import { BOX_FILL_VOLUME, COMMON_BOX_SIZES, WIRE_SIZES } from '../data.js';

// Outlet/device box fill calculator per NEC 314.16(B): every conductor,
// clamp set, support fitting, and device/yoke counts toward a volume
// allowance based on the largest conductor present, then compared against
// the box's rated cubic-inch capacity.

export const id = 'box-fill';
export const title = 'Box Fill';
export const subtitle = 'Check device/junction box volume against NEC 314.16(B)';

// Ordered smallest-to-largest (WIRE_SIZES is the canonical trade ordering;
// Object.keys(BOX_FILL_VOLUME) would sort '6' ahead of '14' numerically).
const SIZES = WIRE_SIZES.filter((s) => BOX_FILL_VOLUME[s] !== undefined);

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="bf-form">
      <label class="field">
        <span class="field-label">Largest conductor in the box (AWG)</span>
        <select class="field-input" name="size" id="bf-size">
          ${SIZES.map((s) => `<option value="${s}">${s} AWG — ${BOX_FILL_VOLUME[s].toFixed(2)} in³ allowance</option>`).join('')}
        </select>
      </label>

      <fieldset class="field-group">
        <legend>Conductor counts (per NEC 314.16(B)(1))</legend>
        ${counterField('cond_in', 'Conductors entering the box from outside (each counts once)', 0)}
        ${counterField('cond_through', 'Conductors passing through without splice (each counts once)', 0)}
        ${counterField('cond_terminate', 'Conductor pairs that terminate &amp; re-leave on a pigtail are counted as entering only — leave at 0 unless unsure', 0)}
      </fieldset>

      <fieldset class="field-group">
        <legend>Other fill allowances</legend>
        ${counterField('clamps', 'Internal cable clamps (all clamps count as ONE conductor, max)', 0)}
        ${counterField('support_fittings', 'Fixture studs / hickeys (each counts as one conductor)', 0)}
        ${counterField('devices', 'Devices / yokes — switches, receptacles (each counts as TWO conductors)', 0)}
        ${counterField('grounds', 'Equipment grounding conductors (all grounds together count as ONE conductor; add one more if an isolated ground is present)', 0)}
      </fieldset>

      <label class="field">
        <span class="field-label">Box capacity</span>
        <select class="field-input" name="boxPick" id="bf-box-pick">
          <option value="custom">Enter cubic-inch capacity manually…</option>
          ${COMMON_BOX_SIZES.map((b) => `<option value="${b.value}">${b.label}</option>`).join('')}
        </select>
      </label>
      <label class="field" id="bf-custom-wrap">
        <span class="field-label">Box capacity (in³ — stamped inside the box, or from Table 314.16(A))</span>
        <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="capacity" id="bf-capacity" placeholder="e.g. 18.0">
      </label>

      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="bf-calc">Calculate</button>
        <button type="button" class="btn btn-ghost" id="bf-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="bf-result" hidden></div>
    <p class="calc-note">
      Based on NEC 314.16(B) fill rules: each conductor originating outside the box and
      terminating/spliced inside counts once; each unbroken through conductor counts once;
      all clamps together count as one conductor; each support fitting (stud/hickey) counts
      as one; each strap/yoke (device) counts as two, sized by the largest conductor
      connected to it; all equipment grounds together count as one (plus one more for an
      isolated ground). Nonmetallic boxes &lt;100 in³ must be legibly marked with their
      cubic-inch capacity — use that marked value when present.
    </p>
  `;

  const form = container.querySelector('#bf-form');
  const result = container.querySelector('#bf-result');
  const customWrap = container.querySelector('#bf-custom-wrap');
  const boxPick = container.querySelector('#bf-box-pick');
  const capacityInput = container.querySelector('#bf-capacity');

  function syncCustomVisibility() {
    const isCustom = boxPick.value === 'custom';
    customWrap.style.display = isCustom ? '' : 'none';
    if (!isCustom) capacityInput.value = boxPick.value;
  }
  syncCustomVisibility();
  boxPick.addEventListener('change', syncCustomVisibility);

  container.querySelector('#bf-calc').addEventListener('click', () => {
    const allowance = BOX_FILL_VOLUME[form.size.value];
    const condIn = count(form.cond_in);
    const condThrough = count(form.cond_through);
    const clamps = count(form.clamps);
    const fittings = count(form.support_fittings);
    const devices = count(form.devices);
    const grounds = count(form.grounds);

    const conductorEquivalents =
      condIn + condThrough + (clamps > 0 ? 1 : 0) + fittings + devices * 2 + (grounds > 0 ? 1 : 0);

    const requiredVolume = conductorEquivalents * allowance;
    const capacity = Number(boxPick.value === 'custom' ? capacityInput.value : boxPick.value);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter the box's cubic-inch capacity (stamped on the box or from Table 314.16(A)).</p>`;
      return;
    }

    const fits = requiredVolume <= capacity;
    const remaining = capacity - requiredVolume;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Conductor-equivalent count</span><span class="result-value">${conductorEquivalents}</span></div>
        <div class="result-item"><span class="result-label">Volume allowance per conductor</span><span class="result-value">${allowance.toFixed(2)} in³</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">Required box volume</span><span class="result-value">${requiredVolume.toFixed(2)} in³</span></div>
        <div class="result-item"><span class="result-label">Box capacity</span><span class="result-value">${capacity.toFixed(2)} in³</span></div>
      </div>
      <p class="result-message ${fits ? 'result-good' : 'result-bad'}">
        ${fits
          ? `Fits — ${remaining.toFixed(2)} in³ of spare capacity remaining.`
          : `Does NOT fit — over by ${Math.abs(remaining).toFixed(2)} in³. Use a larger box, an extension ring, or reduce the conductor/device count.`}
      </p>
    `;
  });

  container.querySelector('#bf-clear').addEventListener('click', () => {
    form.reset();
    syncCustomVisibility();
    result.hidden = true;
  });
}

function counterField(name, label, def) {
  return `
    <label class="field field-inline">
      <span class="field-label">${label}</span>
      <input class="field-input field-input-narrow" type="number" inputmode="numeric" min="0" step="1" name="${name}" value="${def}">
    </label>
  `;
}

function count(input) {
  const n = Math.floor(Number(input.value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
