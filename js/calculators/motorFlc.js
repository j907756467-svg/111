import { MOTOR_FLC_3PHASE, MOTOR_FLC_1PHASE } from '../data.js';

// Motor full-load current lookup per NEC Table 430.250 (three-phase) and
// Table 430.248 (single-phase). These FLC table values — not the motor's
// nameplate current — are what NEC Article 430 requires you to use when
// sizing branch-circuit conductors, short-circuit/ground-fault protection,
// and overload/disconnect ratings.

export const id = 'motor-flc';
export const title = 'Motor Full-Load Current';
export const subtitle = 'Look up FLC for sizing per NEC Article 430 (Tables 430.250 / 430.248)';

export function render(container) {
  container.innerHTML = `
    <form class="calc-form" id="mflc-form">
      <label class="field">
        <span class="field-label">System</span>
        <select class="field-input" name="phase" id="mflc-phase">
          <option value="3">Three-phase (Table 430.250)</option>
          <option value="1">Single-phase (Table 430.248)</option>
        </select>
      </label>
      <label class="field">
        <span class="field-label">Motor horsepower</span>
        <select class="field-input" name="hp" id="mflc-hp"></select>
      </label>
      <label class="field">
        <span class="field-label">Voltage</span>
        <select class="field-input" name="voltage" id="mflc-voltage"></select>
      </label>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="mflc-calc">Look up</button>
        <button type="button" class="btn btn-ghost" id="mflc-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="mflc-result" hidden></div>
    <p class="calc-note">
      Values are commonly published reference subsets of NEC Tables 430.250 / 430.248 full-load
      current. Per NEC 430.6(A)(1), use these table values — not motor nameplate current — to
      size branch-circuit conductors, disconnects, and short-circuit/ground-fault protection;
      use the nameplate current for overload protection sizing (430.6(A)(2)). Confirm against
      the current NEC edition adopted locally and the specific motor's listing.
    </p>
  `;

  const form = container.querySelector('#mflc-form');
  const result = container.querySelector('#mflc-result');
  const hpSelect = container.querySelector('#mflc-hp');
  const voltageSelect = container.querySelector('#mflc-voltage');

  function table() {
    return form.phase.value === '3' ? MOTOR_FLC_3PHASE : MOTOR_FLC_1PHASE;
  }

  function populate() {
    const t = table();
    hpSelect.innerHTML = t.rows.map((r) => `<option value="${r.hp}">${r.hp} HP</option>`).join('');
    voltageSelect.innerHTML = t.voltages.map((v) => `<option value="${v}">${v} V</option>`).join('');
  }
  populate();
  form.phase.addEventListener('change', () => {
    populate();
    result.hidden = true;
  });

  container.querySelector('#mflc-calc').addEventListener('click', () => {
    const t = table();
    const hp = Number(hpSelect.value);
    const voltageIndex = t.voltages.indexOf(Number(voltageSelect.value));
    const row = t.rows.find((r) => r.hp === hp);
    const amps = row?.amps?.[voltageIndex];

    if (amps === undefined) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">No reference value for that combination.</p>`;
      return;
    }

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item result-item-highlight"><span class="result-label">Full-load current (FLC)</span><span class="result-value">${amps} A</span></div>
        <div class="result-item"><span class="result-label">Suggested conductor minimum (125% × FLC)</span><span class="result-value">${(amps * 1.25).toFixed(1)} A</span></div>
      </div>
      <p class="result-message">
        NEC 430.22 generally requires branch-circuit conductors for a single continuous-duty
        motor to be sized at not less than <strong>125% of FLC</strong> — verify duty cycle,
        multiple-motor, and other Article 430 provisions that may apply to your installation.
      </p>
    `;
  });

  container.querySelector('#mflc-clear').addEventListener('click', () => {
    form.reset();
    populate();
    result.hidden = true;
  });
}
