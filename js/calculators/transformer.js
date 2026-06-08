import { STANDARD_TRANSFORMER_KVA } from '../data.js';

// Transformer current & sizing helper.
//   Single-phase: I = (kVA x 1000) / V
//   Three-phase:  I = (kVA x 1000) / (V x 1.732)
// Section A finds primary/secondary full-load current from a transformer's
// nameplate rating. Section B works the relationship backwards — from a
// known load — to suggest a minimum kVA and the next standard size up.

export const id = 'transformer';
export const title = 'Transformer';
export const subtitle = 'Primary/secondary FLA and quick sizing for a known load';

export function render(container) {
  container.innerHTML = `
    <section class="calc-section">
      <h2 class="calc-section-title">Find currents from a transformer's rating</h2>
      <form class="calc-form" id="xfmr-fla-form">
        <label class="field">
          <span class="field-label">System</span>
          <select class="field-input" name="phase" id="xfmr-phase">
            <option value="1">Single-phase</option>
            <option value="3" selected>Three-phase</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Transformer rating (kVA)</span>
          <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="kva" id="xfmr-kva" placeholder="e.g. 75">
        </label>
        <label class="field">
          <span class="field-label">Primary voltage (V)</span>
          <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="primaryV" id="xfmr-primary" placeholder="e.g. 480">
        </label>
        <label class="field">
          <span class="field-label">Secondary voltage (V)</span>
          <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="secondaryV" id="xfmr-secondary" placeholder="e.g. 208">
        </label>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="xfmr-fla-calc">Calculate</button>
          <button type="button" class="btn btn-ghost" id="xfmr-fla-clear">Clear</button>
        </div>
      </form>
      <div class="result" id="xfmr-fla-result" hidden></div>
      <p class="calc-note">
        Formula: I = (kVA × 1000) ÷ V for single-phase, or ÷ (V × 1.732) for three-phase.
        Per NEC 450.3, overcurrent protection and conductor sizing have their own rules
        (primary/secondary protection percentages, when secondary protection may be omitted,
        etc.) — this gives you the FLA inputs to those calculations, not the final device sizes.
      </p>
    </section>

    <section class="calc-section">
      <h2 class="calc-section-title">Size a transformer for a known load</h2>
      <form class="calc-form" id="xfmr-size-form">
        <label class="field">
          <span class="field-label">System</span>
          <select class="field-input" name="phase" id="xfmr-size-phase">
            <option value="1">Single-phase</option>
            <option value="3" selected>Three-phase</option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Load current (A)</span>
          <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="amps" id="xfmr-size-amps" placeholder="e.g. 120">
        </label>
        <label class="field">
          <span class="field-label">Load voltage (V)</span>
          <input class="field-input" type="number" inputmode="decimal" min="0" step="any" name="voltage" id="xfmr-size-voltage" placeholder="e.g. 208">
        </label>
        <label class="field">
          <span class="field-label">Spare capacity margin</span>
          <select class="field-input" name="margin" id="xfmr-size-margin">
            <option value="1">None — exact load (0%)</option>
            <option value="1.15">+15% spare capacity</option>
            <option value="1.25" selected>+25% spare capacity (room to grow)</option>
          </select>
        </label>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="xfmr-size-calc">Calculate</button>
          <button type="button" class="btn btn-ghost" id="xfmr-size-clear">Clear</button>
        </div>
      </form>
      <div class="result" id="xfmr-size-result" hidden></div>
      <p class="calc-note">
        Suggests the smallest <em>commonly available standard kVA size</em> at or above your
        target. Continuous loads, future growth, harmonic-rich loads (electronic ballasts,
        LED drivers, VFDs) and NEC Article 450 provisions can all push the right answer
        higher — treat this as a starting point for sizing discussions, not a final spec.
      </p>
    </section>
  `;

  wireFlaForm(container);
  wireSizeForm(container);
}

function wireFlaForm(container) {
  const form = container.querySelector('#xfmr-fla-form');
  const result = container.querySelector('#xfmr-fla-result');

  container.querySelector('#xfmr-fla-calc').addEventListener('click', () => {
    const phase = Number(form.phase.value);
    const kva = Number(form.kva.value);
    const primaryV = Number(form.primaryV.value);
    const secondaryV = Number(form.secondaryV.value);

    if (![kva, primaryV, secondaryV].every((v) => Number.isFinite(v) && v > 0)) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter the transformer's kVA rating and both voltages (all greater than zero).</p>`;
      return;
    }

    const divisor = phase === 1 ? 1 : Math.sqrt(3);
    const primaryFLA = (kva * 1000) / (primaryV * divisor);
    const secondaryFLA = (kva * 1000) / (secondaryV * divisor);
    const ratio = primaryV / secondaryV;

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item result-item-highlight"><span class="result-label">Primary FLA</span><span class="result-value">${round(primaryFLA)} A</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">Secondary FLA</span><span class="result-value">${round(secondaryFLA)} A</span></div>
        <div class="result-item"><span class="result-label">Voltage (turns) ratio</span><span class="result-value">${round(ratio)} : 1</span></div>
      </div>
    `;
  });

  container.querySelector('#xfmr-fla-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

function wireSizeForm(container) {
  const form = container.querySelector('#xfmr-size-form');
  const result = container.querySelector('#xfmr-size-result');

  container.querySelector('#xfmr-size-calc').addEventListener('click', () => {
    const phase = Number(form.phase.value);
    const amps = Number(form.amps.value);
    const voltage = Number(form.voltage.value);
    const margin = Number(form.margin.value);

    if (![amps, voltage].every((v) => Number.isFinite(v) && v > 0)) {
      result.hidden = false;
      result.innerHTML = `<p class="result-message">Enter the load current and voltage (both greater than zero).</p>`;
      return;
    }

    const multiplier = phase === 1 ? 1 : Math.sqrt(3);
    const loadKVA = (voltage * amps * multiplier) / 1000;
    const targetKVA = loadKVA * margin;
    const suggested = STANDARD_TRANSFORMER_KVA.find((size) => size >= targetKVA);

    result.hidden = false;
    result.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><span class="result-label">Calculated load</span><span class="result-value">${round(loadKVA)} kVA</span></div>
        <div class="result-item"><span class="result-label">Target with margin</span><span class="result-value">${round(targetKVA)} kVA</span></div>
        <div class="result-item result-item-highlight"><span class="result-label">Suggested standard size</span><span class="result-value">${suggested ? `${suggested} kVA` : '> 1000 kVA — consult a manufacturer'}</span></div>
      </div>
      <p class="result-message">
        Standard sizes referenced: ${STANDARD_TRANSFORMER_KVA.join(', ')} kVA. Always confirm
        availability and ratings (impedance, temperature rise, K-factor for nonlinear loads,
        etc.) with the transformer's actual nameplate and manufacturer data.
      </p>
    `;
  });

  container.querySelector('#xfmr-size-clear').addEventListener('click', () => {
    form.reset();
    result.hidden = true;
  });
}

function round(n) {
  return Number.isFinite(n) ? Number(n.toPrecision(4)) : '—';
}
