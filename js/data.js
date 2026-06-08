// Reference data for electrical calculations.
// Ampacity / correction / box-fill values reflect commonly published NEC
// reference figures used across the trade. Code editions and local amendments
// vary by jurisdiction (NEC 2017 / 2020 / 2023, etc.) — always verify against
// the version currently adopted in your area before relying on results for
// installations or inspections.

// AWG / kcmil -> circular mils (defined by the AWG standard itself; constant
// across code editions). Used for voltage drop calculations.
export const CIRCULAR_MILS = {
  '14': 4110,
  '12': 6530,
  '10': 10380,
  '8': 16510,
  '6': 26240,
  '4': 41740,
  '3': 52620,
  '2': 66360,
  '1': 83690,
  '1/0': 105600,
  '2/0': 133100,
  '3/0': 167800,
  '4/0': 211600,
  '250': 250000,
  '300': 300000,
  '350': 350000,
  '400': 400000,
  '500': 500000,
  '600': 600000,
  '750': 750000,
  '1000': 1000000,
};

// Explicit display order (smallest wire to largest). NOT derived via
// Object.keys() — JS sorts integer-like string keys ('6', '14', '250')
// numerically ahead of non-numeric ones ('1/0'), which would scramble
// this into 1, 2, 3, 4, 6 … 1000, 1/0, 2/0 instead of the trade's
// conventional 14, 12, 10 … 4/0, 250 … 1000 ordering.
export const WIRE_SIZES = [
  '14', '12', '10', '8', '6', '4', '3', '2', '1',
  '1/0', '2/0', '3/0', '4/0',
  '250', '300', '350', '400', '500', '600', '750', '1000',
];

// DC resistivity constants (ohm-circular-mil/ft) used in the standard
// field voltage-drop formula VD = (2 x K x I x D) / CM (single phase)
// or (1.732 x K x I x D) / CM (three phase).
export const RESISTIVITY_K = {
  copper: 12.9,
  aluminum: 21.2,
};

// NEC Table 310.16 — allowable ampacities for insulated copper conductors,
// rated per the temperature column shown (commonly published reference
// values for THWN/THHN-type insulation). Not less than 3 current-carrying
// conductors in raceway/cable, 30°C ambient.
export const AMPACITY_COPPER = {
  '14': { 60: 15, 75: 20, 90: 25 },
  '12': { 60: 20, 75: 25, 90: 30 },
  '10': { 60: 30, 75: 35, 90: 40 },
  '8': { 60: 40, 75: 50, 90: 55 },
  '6': { 60: 55, 75: 65, 90: 75 },
  '4': { 60: 70, 75: 85, 90: 95 },
  '3': { 60: 85, 75: 100, 90: 110 },
  '2': { 60: 95, 75: 115, 90: 130 },
  '1': { 60: 110, 75: 130, 90: 145 },
  '1/0': { 60: 125, 75: 150, 90: 170 },
  '2/0': { 60: 145, 75: 175, 90: 195 },
  '3/0': { 60: 165, 75: 200, 90: 225 },
  '4/0': { 60: 195, 75: 230, 90: 260 },
  '250': { 60: 215, 75: 255, 90: 290 },
  '300': { 60: 240, 75: 285, 90: 320 },
  '350': { 60: 260, 75: 310, 90: 350 },
  '400': { 60: 280, 75: 335, 90: 380 },
  '500': { 60: 320, 75: 380, 90: 430 },
  '600': { 60: 350, 75: 420, 90: 475 },
  '750': { 60: 400, 75: 475, 90: 535 },
  '1000': { 60: 455, 75: 545, 90: 615 },
};

// NEC Table 310.16 — allowable ampacities for insulated aluminum / copper-clad
// aluminum conductors (commonly published reference values).
export const AMPACITY_ALUMINUM = {
  '12': { 60: 15, 75: 20, 90: 25 },
  '10': { 60: 25, 75: 30, 90: 35 },
  '8': { 60: 30, 75: 40, 90: 45 },
  '6': { 60: 40, 75: 50, 90: 60 },
  '4': { 60: 55, 75: 65, 90: 75 },
  '3': { 60: 65, 75: 75, 90: 85 },
  '2': { 60: 75, 75: 90, 90: 100 },
  '1': { 60: 85, 75: 100, 90: 115 },
  '1/0': { 60: 100, 75: 120, 90: 135 },
  '2/0': { 60: 115, 75: 135, 90: 150 },
  '3/0': { 60: 130, 75: 155, 90: 175 },
  '4/0': { 60: 150, 75: 180, 90: 205 },
  '250': { 60: 170, 75: 205, 90: 230 },
  '300': { 60: 195, 75: 230, 90: 260 },
  '350': { 60: 215, 75: 250, 90: 280 },
  '400': { 60: 230, 75: 270, 90: 305 },
  '500': { 60: 265, 75: 310, 90: 350 },
  '600': { 60: 285, 75: 340, 90: 385 },
  '750': { 60: 320, 75: 385, 90: 435 },
  '1000': { 60: 375, 75: 445, 90: 500 },
};

// NEC Table 310.15(B)(1)(1) — ambient temperature correction factors,
// keyed by the conductor's terminal temperature rating column.
export const TEMP_CORRECTION = {
  ranges: [
    { max: 25, label: '10–25°C (50–77°F)' },
    { max: 30, label: '26–30°C (78–86°F)' },
    { max: 35, label: '31–35°C (87–95°F)' },
    { max: 40, label: '36–40°C (96–104°F)' },
    { max: 45, label: '41–45°C (105–113°F)' },
    { max: 50, label: '46–50°C (114–122°F)' },
    { max: 55, label: '51–55°C (123–131°F)' },
    { max: 60, label: '56–60°C (132–140°F)' },
    { max: 65, label: '61–65°C (141–149°F)' },
    { max: 70, label: '66–70°C (150–158°F)' },
  ],
  factors: {
    60: [1.29, 1.00, 0.71, 0.41, null, null, null, null, null, null],
    75: [1.20, 1.00, 0.88, 0.75, 0.61, 0.45, 0.24, null, null, null],
    90: [1.15, 1.00, 0.91, 0.82, 0.71, 0.58, 0.41, 0.29, null, null],
  },
};

// NEC Table 310.15(C)(1) — adjustment factors for more than three
// current-carrying conductors in a raceway or cable.
export const CONDUCTOR_ADJUSTMENT = [
  { range: '4–6', max: 6, factor: 0.80 },
  { range: '7–9', max: 9, factor: 0.70 },
  { range: '10–20', max: 20, factor: 0.50 },
  { range: '21–30', max: 30, factor: 0.45 },
  { range: '31–40', max: 40, factor: 0.40 },
  { range: '41+', max: Infinity, factor: 0.35 },
];

// NEC 314.16(B) — volume allowance (cubic inches) required per conductor,
// clamp, device/strap, etc., based on the largest conductor for that item.
export const BOX_FILL_VOLUME = {
  '14': 2.00,
  '12': 2.25,
  '10': 2.50,
  '8': 3.00,
  '6': 5.00,
};

// NEC Table 314.16(A) — common metal box trade sizes and their rated
// cubic-inch capacities (commonly published reference subset).
export const COMMON_BOX_SIZES = [
  { label: '4" round/octagonal, 1-1/4" deep — 12.5 in³', value: 12.5 },
  { label: '4" round/octagonal, 1-1/2" deep — 15.5 in³', value: 15.5 },
  { label: '4" square, 1-1/4" deep — 18.0 in³', value: 18.0 },
  { label: '4" square, 1-1/2" deep — 21.0 in³', value: 21.0 },
  { label: '4" square, 2-1/8" deep — 30.3 in³', value: 30.3 },
  { label: '4-11/16" square, 1-1/2" deep — 29.5 in³', value: 29.5 },
  { label: '4-11/16" square, 2-1/8" deep — 42.0 in³', value: 42.0 },
  { label: '3" x 2" x 1-1/2" device box — 7.5 in³', value: 7.5 },
  { label: '3" x 2" x 2-1/4" device box — 10.0 in³', value: 10.0 },
  { label: '3" x 2" x 2-1/2" device box — 10.5 in³', value: 10.5 },
  { label: '3" x 2" x 2-3/4" device box — 12.5 in³', value: 12.5 },
  { label: '3" x 2" x 3-1/2" device box — 14.0 in³', value: 14.0 },
];

// NEC Chapter 9, Table 1 — maximum percent fill for conductors in conduit.
export const CONDUIT_FILL_PERCENT = {
  1: 0.53, // one conductor
  2: 0.31, // two conductors
  3: 0.40, // three or more conductors
};

// Explicit trade-size display order (smallest to largest). Same ordering
// hazard as WIRE_SIZES — '1' and '2' are integer-like and would otherwise
// sort ahead of '1/2' and '3/4'.
export const CONDUIT_TRADE_SIZES = [
  '1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '3-1/2', '4',
];

// NEC Chapter 9, Table 4 — approximate internal cross-sectional area
// (square inches) of common conduit types by trade size (commonly
// published reference subset for EMT / PVC Sch 40 / RMC).
export const CONDUIT_AREA = {
  EMT: {
    '1/2': 0.304, '3/4': 0.533, '1': 0.864, '1-1/4': 1.496,
    '1-1/2': 2.036, '2': 3.356, '2-1/2': 5.858, '3': 8.846,
    '3-1/2': 11.545, '4': 14.753,
  },
  'PVC Sch 40': {
    '1/2': 0.285, '3/4': 0.508, '1': 0.832, '1-1/4': 1.453,
    '1-1/2': 1.986, '2': 3.291, '2-1/2': 4.695, '3': 7.268,
    '3-1/2': 9.737, '4': 12.554,
  },
  RMC: {
    '1/2': 0.314, '3/4': 0.549, '1': 0.887, '1-1/4': 1.526,
    '1-1/2': 2.071, '2': 3.408, '2-1/2': 4.866, '3': 7.499,
    '3-1/2': 10.010, '4': 12.882,
  },
};

// NEC Chapter 9, Table 5 — approximate conductor cross-sectional area
// (square inches) by size, for common building-wire insulation types
// (commonly published reference subset for THHN/THWN-2).
export const CONDUCTOR_AREA_THHN = {
  '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366,
  '6': 0.0507, '4': 0.0824, '3': 0.0973, '2': 0.1158,
  '1': 0.1562, '1/0': 0.1855, '2/0': 0.2223, '3/0': 0.2679,
  '4/0': 0.3237, '250': 0.3970, '300': 0.4536, '350': 0.5028,
  '400': 0.5473, '500': 0.6291, '600': 0.7620, '750': 0.9060,
  '1000': 1.1370,
};

// NEC Table 430.250 — three-phase motor full-load current (amps), commonly
// published reference subset by horsepower and voltage.
export const MOTOR_FLC_3PHASE = {
  voltages: [208, 230, 460, 575],
  rows: [
    { hp: 0.5, amps: [2.4, 2.2, 1.1, 0.9] },
    { hp: 0.75, amps: [3.5, 3.2, 1.6, 1.3] },
    { hp: 1, amps: [4.6, 4.2, 2.1, 1.7] },
    { hp: 1.5, amps: [6.6, 6.0, 3.0, 2.4] },
    { hp: 2, amps: [7.5, 6.8, 3.4, 2.7] },
    { hp: 3, amps: [10.6, 9.6, 4.8, 3.9] },
    { hp: 5, amps: [16.7, 15.2, 7.6, 6.1] },
    { hp: 7.5, amps: [24.2, 22, 11, 9] },
    { hp: 10, amps: [30.8, 28, 14, 11] },
    { hp: 15, amps: [46.2, 42, 21, 17] },
    { hp: 20, amps: [59.4, 54, 27, 22] },
    { hp: 25, amps: [74.8, 68, 34, 27] },
    { hp: 30, amps: [88, 80, 40, 32] },
    { hp: 40, amps: [114, 104, 52, 41] },
    { hp: 50, amps: [143, 130, 65, 52] },
    { hp: 60, amps: [169, 154, 77, 62] },
    { hp: 75, amps: [211, 192, 96, 77] },
    { hp: 100, amps: [273, 248, 124, 99] },
  ],
};

// NEC Table 430.248 — single-phase motor full-load current (amps), commonly
// published reference subset by horsepower and voltage.
export const MOTOR_FLC_1PHASE = {
  voltages: [115, 230],
  rows: [
    { hp: 0.5, amps: [9.8, 4.9] },
    { hp: 0.75, amps: [13.8, 6.9] },
    { hp: 1, amps: [16, 8] },
    { hp: 1.5, amps: [20, 10] },
    { hp: 2, amps: [24, 12] },
    { hp: 3, amps: [34, 17] },
    { hp: 5, amps: [56, 28] },
    { hp: 7.5, amps: [80, 40] },
    { hp: 10, amps: [100, 50] },
  ],
};
