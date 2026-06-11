// charts.js — 纯 SVG 图表引擎（无第三方依赖，离线可用）
// 所有函数返回 SVG 字符串，由 slides.js 注入到幻灯片中。

export const PALETTE = ['#c8861a', '#2b6cb0', '#3f9b6b', '#b5546a', '#7b6cc0', '#d98841', '#5a9bd4'];
const GRID = '#ece3d3';
const AXIS = '#9a8e78';
const INK = '#2a2318';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (v) => (Number.isFinite(+v) ? +v : 0);

function svgWrap(w, h, inner, cls = '') {
  return `<svg class="chart ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img">${inner}</svg>`;
}

/* ───────── 折线图（月度趋势） ───────── */
export function lineChart(data, opts = {}) {
  const w = 760, h = 320, pad = { t: 24, r: 24, b: 46, l: 56 };
  const pts = data.map((d) => ({ label: d.label, value: num(d.value) }));
  if (!pts.length) return svgWrap(w, h, '');
  const max = Math.max(...pts.map((p) => p.value)) * 1.12;
  const min = Math.min(0, ...pts.map((p) => p.value));
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = (i) => pad.l + (pts.length === 1 ? iw / 2 : (i / (pts.length - 1)) * iw);
  const y = (v) => pad.t + ih - ((v - min) / (max - min || 1)) * ih;

  let g = '';
  // 网格 + Y 轴刻度
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = min + ((max - min) / ticks) * i;
    const yy = y(v);
    g += `<line x1="${pad.l}" y1="${yy}" x2="${w - pad.r}" y2="${yy}" stroke="${GRID}" stroke-width="1"/>`;
    g += `<text x="${pad.l - 10}" y="${yy + 4}" text-anchor="end" font-size="12" fill="${AXIS}">${Math.round(v)}</text>`;
  }
  // 面积 + 折线
  const line = pts.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  const area = `${pad.l},${y(min)} ${line} ${x(pts.length - 1)},${y(min)}`;
  g += `<polygon points="${area}" fill="${PALETTE[0]}" opacity="0.10"/>`;
  g += `<polyline points="${line}" fill="none" stroke="${PALETTE[0]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  // 数据点 + X 轴标签
  pts.forEach((p, i) => {
    g += `<circle cx="${x(i)}" cy="${y(p.value)}" r="4" fill="#fff" stroke="${PALETTE[0]}" stroke-width="2.5"/>`;
    const lbl = esc(p.label).replace(/^\d{4}-/, '');
    g += `<text x="${x(i)}" y="${h - pad.b + 20}" text-anchor="middle" font-size="11" fill="${AXIS}">${lbl}</text>`;
  });
  // 峰值标注
  const peak = pts.reduce((a, p, i) => (p.value > a.value ? { ...p, i } : a), { value: -Infinity, i: 0 });
  g += `<text x="${x(peak.i)}" y="${y(peak.value) - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="${PALETTE[0]}">${peak.value}</text>`;
  if (opts.unit) g += `<text x="${pad.l}" y="14" font-size="11" fill="${AXIS}">${esc(opts.unit)}</text>`;
  return svgWrap(w, h, g, 'chart-line');
}

/* ───────── 纵向柱状图 ───────── */
export function barChart(data, opts = {}) {
  const w = 760, h = 320, pad = { t: 28, r: 20, b: 48, l: 48 };
  const pts = data.map((d) => ({ label: d.label, value: num(d.value) }));
  if (!pts.length) return svgWrap(w, h, '');
  const max = Math.max(...pts.map((p) => p.value)) * 1.18 || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const bw = (iw / pts.length) * 0.6;
  const gap = (iw / pts.length) * 0.4;
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const yy = pad.t + ih - (ih / 4) * i;
    g += `<line x1="${pad.l}" y1="${yy}" x2="${w - pad.r}" y2="${yy}" stroke="${GRID}"/>`;
    g += `<text x="${pad.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="${AXIS}">${Math.round((max / 4) * i)}</text>`;
  }
  pts.forEach((p, i) => {
    const bh = (p.value / max) * ih;
    const xx = pad.l + gap / 2 + i * (bw + gap);
    const yy = pad.t + ih - bh;
    const color = opts.color || PALETTE[i % PALETTE.length];
    g += `<rect x="${xx}" y="${yy}" width="${bw}" height="${bh}" rx="4" fill="${color}"/>`;
    g += `<text x="${xx + bw / 2}" y="${yy - 7}" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${p.value}${opts.suffix || ''}</text>`;
    g += `<text x="${xx + bw / 2}" y="${h - pad.b + 20}" text-anchor="middle" font-size="11.5" fill="${AXIS}">${esc(p.label)}</text>`;
  });
  return svgWrap(w, h, g, 'chart-bar');
}

/* ───────── 横向条形图（排名等） ───────── */
export function hBarChart(data, opts = {}) {
  const rowH = 34, pad = { t: 14, r: 90, b: 14, l: 130 };
  const w = 760;
  const pts = data.map((d) => ({ label: d.label, value: num(d.value) }));
  const h = pad.t + pad.b + pts.length * rowH;
  const max = Math.max(...pts.map((p) => p.value), 1);
  const iw = w - pad.l - pad.r;
  let g = '';
  pts.forEach((p, i) => {
    const yy = pad.t + i * rowH + 5;
    const bw = (p.value / max) * iw;
    const color = opts.color || PALETTE[i % PALETTE.length];
    g += `<text x="${pad.l - 10}" y="${yy + rowH / 2 - 2}" text-anchor="end" font-size="12.5" fill="${INK}">${esc(p.label)}</text>`;
    g += `<rect x="${pad.l}" y="${yy}" width="${Math.max(bw, 2)}" height="${rowH - 12}" rx="4" fill="${color}"/>`;
    g += `<text x="${pad.l + bw + 8}" y="${yy + rowH / 2 - 2}" font-size="12" font-weight="700" fill="${INK}">${opts.fmt ? opts.fmt(p.value) : p.value}</text>`;
  });
  return svgWrap(w, h, g, 'chart-hbar');
}

/* ───────── 环形图（细分占比） ───────── */
export function donutChart(data, opts = {}) {
  const w = 360, h = 320, cx = 150, cy = 160, r = 110, ir = 64;
  const pts = data.map((d) => ({ label: d.label, value: num(d.value) }));
  const total = pts.reduce((s, p) => s + p.value, 0) || 1;
  let a0 = -Math.PI / 2, g = '';
  pts.forEach((p, i) => {
    const a1 = a0 + (p.value / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi0 = cx + ir * Math.cos(a1), yi0 = cy + ir * Math.sin(a1);
    const xi1 = cx + ir * Math.cos(a0), yi1 = cy + ir * Math.sin(a0);
    const color = PALETTE[i % PALETTE.length];
    g += `<path d="M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi0},${yi0} A${ir},${ir} 0 ${large} 0 ${xi1},${yi1} Z" fill="${color}"/>`;
    a0 = a1;
  });
  g += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="13" fill="${AXIS}">${esc(opts.centerLabel || '细分')}</text>`;
  g += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="20" font-weight="800" fill="${INK}">${esc(opts.centerValue || pts.length + ' 类')}</text>`;
  // 图例
  let ly = 40;
  pts.forEach((p, i) => {
    g += `<rect x="300" y="${ly - 11}" width="13" height="13" rx="3" fill="${PALETTE[i % PALETTE.length]}"/>`;
    g += `<text x="320" y="${ly}" font-size="12.5" fill="${INK}">${esc(p.label)} ${((p.value / total) * 100).toFixed(1)}%</text>`;
    ly += 26;
  });
  return svgWrap(720, h, `<g>${g}</g>`, 'chart-donut');
}

/* ───────── 雷达图（产品力 7 维对比） ───────── */
export function radarChart(dims, series, opts = {}) {
  const w = 720, h = 380, cx = 210, cy = 190, R = 140, max = opts.max || 5;
  const n = dims.length;
  const ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i, v) => [cx + (R * v) / max * Math.cos(ang(i)), cy + (R * v) / max * Math.sin(ang(i))];
  let g = '';
  // 同心网格
  for (let ring = 1; ring <= 4; ring++) {
    const rr = (R / 4) * ring;
    const poly = dims.map((_, i) => `${cx + rr * Math.cos(ang(i))},${cy + rr * Math.sin(ang(i))}`).join(' ');
    g += `<polygon points="${poly}" fill="none" stroke="${GRID}" stroke-width="1"/>`;
  }
  // 轴线 + 维度标签
  dims.forEach((d, i) => {
    const [ex, ey] = pt(i, max);
    g += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="${GRID}"/>`;
    const lx = cx + (R + 22) * Math.cos(ang(i));
    const ly = cy + (R + 22) * Math.sin(ang(i));
    const anchor = Math.abs(lx - cx) < 12 ? 'middle' : lx > cx ? 'start' : 'end';
    g += `<text x="${lx}" y="${ly + 4}" text-anchor="${anchor}" font-size="12.5" font-weight="600" fill="${INK}">${esc(d)}</text>`;
  });
  // 各系列多边形
  series.forEach((s, si) => {
    const color = s.color || PALETTE[si % PALETTE.length];
    const poly = s.values.map((v, i) => pt(i, num(v)).join(',')).join(' ');
    const isSelf = si === 0;
    g += `<polygon points="${poly}" fill="${color}" fill-opacity="${isSelf ? 0.22 : 0.06}" stroke="${color}" stroke-width="${isSelf ? 3 : 1.6}"/>`;
    if (isSelf) s.values.forEach((v, i) => { const [px, py] = pt(i, num(v)); g += `<circle cx="${px}" cy="${py}" r="3.5" fill="${color}"/>`; });
  });
  // 图例
  let ly = 70;
  series.forEach((s, si) => {
    const color = s.color || PALETTE[si % PALETTE.length];
    g += `<rect x="450" y="${ly - 11}" width="14" height="14" rx="3" fill="${color}" fill-opacity="${si === 0 ? 0.9 : 0.5}" stroke="${color}" stroke-width="1.5"/>`;
    g += `<text x="472" y="${ly}" font-size="12.5" fill="${INK}">${esc(s.name)}${s.score != null ? `　<tspan font-weight="700">${s.score}</tspan>` : ''}</text>`;
    ly += 28;
  });
  return svgWrap(w, h, g, 'chart-radar');
}

/* ───────── 甘特图（项目计划） ───────── */
export function ganttChart(milestones, totalWeeks) {
  const rowH = 38, pad = { t: 40, r: 24, b: 16, l: 150 };
  const w = 760;
  const h = pad.t + pad.b + milestones.length * rowH;
  const iw = w - pad.l - pad.r;
  const cw = iw / totalWeeks;
  let g = '';
  // 周刻度
  for (let wk = 0; wk <= totalWeeks; wk += 4) {
    const xx = pad.l + wk * cw;
    g += `<line x1="${xx}" y1="${pad.t - 8}" x2="${xx}" y2="${h - pad.b}" stroke="${GRID}"/>`;
    g += `<text x="${xx}" y="${pad.t - 14}" text-anchor="middle" font-size="11" fill="${AXIS}">W${wk}</text>`;
  }
  milestones.forEach((m, i) => {
    const yy = pad.t + i * rowH + 6;
    const xx = pad.l + (m.start - 1) * cw;
    const bw = Math.max((m.end - m.start + 1) * cw, 6);
    const color = PALETTE[i % PALETTE.length];
    g += `<text x="${pad.l - 12}" y="${yy + 16}" text-anchor="end" font-size="12" fill="${INK}">${esc(m.phase)}</text>`;
    g += `<rect x="${xx}" y="${yy}" width="${bw}" height="${rowH - 16}" rx="5" fill="${color}" fill-opacity="0.88"/>`;
    g += `<text x="${xx + bw + 6}" y="${yy + 16}" font-size="10.5" fill="${AXIS}">${esc(m.owner)}</text>`;
  });
  return svgWrap(w, h, g, 'chart-gantt');
}

/* ───────── 半圆仪表盘（评分 / ROI） ───────── */
export function gauge(value, max, opts = {}) {
  const w = 240, h = 150, cx = 120, cy = 130, r = 96;
  const pct = Math.max(0, Math.min(1, value / max));
  const a = Math.PI * (1 - pct);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const arc = (sx, sy, ex, ey, large) => `M${sx},${sy} A${r},${r} 0 ${large} 1 ${ex},${ey}`;
  const color = opts.color || (pct >= 0.8 ? PALETTE[2] : pct >= 0.6 ? PALETTE[0] : PALETTE[3]);
  let g = '';
  g += `<path d="${arc(cx - r, cy, cx + r, cy, 1)}" fill="none" stroke="${GRID}" stroke-width="16" stroke-linecap="round"/>`;
  g += `<path d="${arc(cx - r, cy, x, y, pct > 0.5 ? 1 : 0)}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/>`;
  g += `<text x="${cx}" y="${cy - 12}" text-anchor="middle" font-size="30" font-weight="800" fill="${INK}">${opts.display ?? value}</text>`;
  g += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="12.5" fill="${AXIS}">${esc(opts.label || '')}</text>`;
  return svgWrap(w, h, g, 'chart-gauge');
}
