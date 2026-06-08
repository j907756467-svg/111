// Ohm's Law / power formula solver. Given any two of {V, I, R, P}, derive
// the rest using the standard relationships V=IR, P=VI, P=I^2 R, P=V^2/R.

export const id = 'ohms-law';
export const title = "Ohm's Law / Power";
export const subtitle = 'Solve for voltage, current, resistance, or power';

export function render(container) {
  container.innerHTML = `
    <p class="calc-help">Enter any <strong>two</strong> known values — the other two are calculated automatically.</p>
    <form class="calc-form" id="ohms-form">
      ${field('volts', 'Voltage (V)', 'volts')}
      ${field('amps', 'Current (A)', 'amps')}
      ${field('ohms', 'Resistance (Ω)', 'ohms')}
      ${field('watts', 'Power (W)', 'watts')}
      <div class="btn-row">
        <button type="button" class="btn btn-primary" id="ohms-solve">Calculate</button>
        <button type="button" class="btn btn-ghost" id="ohms-clear">Clear</button>
      </div>
    </form>
    <div class="result" id="ohms-result" hidden></div>
    <p class="calc-note">Formulas used: V = I × R &nbsp;|&nbsp; P = V × I &nbsp;|&nbsp; P = I² × R &nbsp;|&nbsp; P = V² ÷ R</p>
  `;

  const form = container.querySelector('#ohms-form');
  const result = container.querySelector('#ohms-result');

  container.querySelector('#ohms-solve').addEventListener('click', () => {
    const V = parseInput(form.volts.value);
    const I = parseInput(form.amps.value);
    const R = parseInput(form.ohms.value);
    const P = parseInput(form.watts.value);

    const known = [V, I, R, P].filter((v) => v !== null).length;
    if (known < 2) {
      showMessage(result, 'Enter at least two known values to solve for the rest.');
      return;
    }

    const solved = solve({ V, I, R, P });
    if (!solved) {
      showMessage(result, 'Could not solve with the given combination — double check your inputs.');
      return;
    }

    form.volts.value = round(solved.V);
    form.amps.value = round(solved.I);
    form.ohms.value = round(solved.R);
    form.watts.value = round(solved.P);

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Voltage</span><span class="result-value">${round(solved.V)} V</span></div>
        <div class="result-item"><span class="result-label">Current</span><span class="result-value">${round(solved.I)} A</span></div>
        <div class="result-item"><span class="result-label">Resistance</span><span class="result-value">${round(solved.R)} Ω</span></div>
        <div class="result-item"><span class="result-label">Power</span><span class="result-value">${round(solved.P)} W</span></div>
      </div>
    `;
  });

  container.querySelector('#ohms-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

function field(name, label, id) {
  return `
    <label class="field">
      <span class="field-label">${label}</span>
      <input class="field-input" type="number" inputmode="decimal" step="any" name="${name}" id="${id}" placeholder="—">
    </label>
  `;
}

function parseInput(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function showMessage(result, message) {
  result.hidden = false;
  result.innerHTML = `<p class="result-message">${message}</p>`;
}

function round(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return Number(n.toPrecision(6));
}

// Try every pair of known values and derive the remaining two.
function solve({ V, I, R, P }) {
  const attempts = [
    () => (V !== null && I !== null) ? { V, I, R: V / I, P: V * I } : null,
    () => (V !== null && R !== null) ? { V, I: V / R, R, P: (V * V) / R } : null,
    () => (V !== null && P !== null) ? { V, I: P / V, R: (V * V) / P, P } : null,
    () => (I !== null && R !== null) ? { V: I * R, I, R, P: I * I * R } : null,
    () => (I !== null && P !== null) ? { V: P / I, I, R: P / (I * I), P } : null,
    () => (R !== null && P !== null) ? { V: Math.sqrt(P * R), I: Math.sqrt(P / R), R, P } : null,
  ];

  for (const attempt of attempts) {
    const out = attempt();
    if (out && Object.values(out).every((v) => Number.isFinite(v))) return out;
  }
  return null;
}
