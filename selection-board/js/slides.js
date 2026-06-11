// slides.js — 根据数据构建 9 章立项 PPT 幻灯片
import { lineChart, barChart, hBarChart, donutChart, radarChart, ganttChart, gauge, PALETTE } from './charts.js';

export const CHAPTERS = [
  { n: 1, name: '产品概要', icon: '📦' },
  { n: 2, name: '看市场', icon: '📊' },
  { n: 3, name: '看竞争', icon: '⚔️' },
  { n: 4, name: '看用户', icon: '💬' },
  { n: 5, name: '看自己', icon: '🪞' },
  { n: 6, name: '定产品', icon: '🎯' },
  { n: 7, name: '定策略', icon: '💰' },
  { n: 8, name: '定计划', icon: '🗓️' },
  { n: 9, name: '立项评审', icon: '✅' },
];

const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtWan = (v) => `$${(+v).toLocaleString()}万`;
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

/* ── 可编辑文本 ── */
function ed(path, value, cls = '') {
  return `<span class="editable ${cls}" data-path="${path}" tabindex="0" title="点击编辑">${e(value)}</span>`;
}

/* ── 幻灯片头部（Action Title = 结论句） ── */
function head(ch, action, sub = '') {
  const c = CHAPTERS.find((x) => x.n === ch);
  return `<div class="slide-head">
    <div class="slide-kicker"><span class="kdot">${c.icon}</span> 第 ${ch} 章 · ${c.name}</div>
    <h2 class="action-title">${action}</h2>
    ${sub ? `<p class="slide-sub">${sub}</p>` : ''}
  </div>`;
}

/* ── KPI 卡片组 ── */
function kpiCards(items) {
  return `<div class="kpi-grid">${items.map((k) => `
    <div class="kpi-card">
      <div class="kpi-label">${e(k.label)}</div>
      <div class="kpi-value">${e(k.value)}<span class="kpi-unit">${e(k.unit || '')}</span></div>
      <div class="kpi-sub">${e(k.sub || '')}</div>
    </div>`).join('')}</div>`;
}

/* ── 通用表格 ── */
function table(cols, rows, opts = {}) {
  const align = opts.align || [];
  return `<table class="data-table ${opts.cls || ''}">
    <thead><tr>${cols.map((c, i) => `<th style="text-align:${align[i] || 'left'}">${e(c)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((cell, i) => `<td style="text-align:${align[i] || 'left'}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

/* ── 热力矩阵表（竞品参数 / 价格段覆盖） ── */
function heatTable(cols, rows) {
  const allVals = rows.flatMap((r) => r.d);
  const max = Math.max(...allVals, 1);
  const body = rows.map((r) => `<tr>
    <td class="ht-brand">${e(r.brand)}</td>
    ${r.d.map((v) => {
      const t = v / max;
      const bg = `rgba(200,134,26,${(0.10 + t * 0.62).toFixed(2)})`;
      return `<td class="ht-cell" style="background:${bg};color:${t > 0.55 ? '#fff' : '#2a2318'}">${v}</td>`;
    }).join('')}
  </tr>`).join('');
  return `<table class="data-table heat-table">
    <thead><tr><th>品牌 \\ 维度</th>${cols.map((c) => `<th style="text-align:center">${e(c)}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody></table>`;
}

/* ── 决策节点（人工确认门） ── */
function gate(key, title, desc, valueLabel, gateState) {
  const ok = gateState.status === 'confirmed';
  return `<div class="gate ${ok ? 'gate-ok' : 'gate-wait'}" data-gate="${key}">
    <div class="gate-top">
      <span class="gate-icon">${ok ? '✔' : '⏳'}</span>
      <span class="gate-title">${e(title)}</span>
      <span class="gate-pill">${ok ? '已确认' : '等待确认'}</span>
    </div>
    <p class="gate-desc">${desc}</p>
    <div class="gate-value">确认结果：<strong>${ed(`meta.gates.${key}.value`, gateState.value)}</strong>${gateState.assist ? ` ｜ 辅助：${ed(`meta.gates.${key}.assist`, gateState.assist)}` : ''} <span class="gate-time">${e(gateState.time || '')}</span></div>
  </div>`;
}

function chip(text, kind = '') { return `<span class="chip ${kind}">${e(text)}</span>`; }

/* ════════════════════════════════════════════════
   构建全部幻灯片
   ════════════════════════════════════════════════ */
export function buildSlides(s) {
  const slides = [];
  const push = (ch, body) => slides.push({ ch, body });

  /* ───── 封面 ───── */
  slides.push({
    ch: 0, cover: true,
    body: `<div class="cover">
      <div class="cover-badge">亚马逊选品立项报告 · ${e(s.meta.reportVersion)}</div>
      <h1 class="cover-title">${ed('meta.title', s.meta.title)}</h1>
      <div class="cover-meta">
        <div><span>品类</span>${ed('meta.category', s.meta.category)}</div>
        <div><span>己品品牌</span>${ed('meta.brand', s.meta.brand)}</div>
        <div><span>编制</span>${ed('meta.author', s.meta.author)}</div>
        <div><span>日期</span>${ed('meta.date', s.meta.date)}</div>
      </div>
      <div class="cover-gates">
        ${gate('brand', '己品品牌确认', '后续「看自己 / 定产品 / 定策略」均以该品牌为己品展开。', s.meta.brand, s.meta.gates.brand)}
        ${gate('segment', '主攻细分确认', '确认后第 3–9 章全部锁定在该细分内，不出现其他细分数据。', s.meta.gates.segment.value, s.meta.gates.segment)}
        ${gate('direction', '产品方向确认', '确认后「定策略 / 定计划 / 立项评审」围绕该方向展开。', s.meta.gates.direction.value, s.meta.gates.direction)}
      </div>
    </div>`,
  });

  /* ───── 工作流总览 ───── */
  push(0, `${head(0 || 1, '九步工作流：从市场洞察到 Go / NoGo 立项决策').replace('第 1 章 · 产品概要', '工作流总览')}
    <div class="flow">${CHAPTERS.map((c, i) => `
      <div class="flow-node">
        <div class="flow-n">${c.n}</div>
        <div class="flow-ico">${c.icon}</div>
        <div class="flow-name">${c.name}</div>
        ${[2, 6].includes(c.n) ? `<div class="flow-gate">⏳ 确认节点</div>` : ''}
      </div>${i < CHAPTERS.length - 1 ? '<div class="flow-arrow">→</div>' : ''}`).join('')}
    </div>
    <div class="note-row">
      ${chip('规则1：细分确认后第 3–9 章锁定该细分', 'good')}
      ${chip('规则2：方向确认后第 7–9 章锁定该方向', 'good')}
      ${chip('规则3：数据隔离，不使用未确认细分/方向', 'good')}
    </div>`);

  /* ═══ 第 1 章 产品概要 ═══ */
  const ov = s.overview;
  push(1, `${head(1, `${e(ov.definition.name)}是解决「${e(ov.definition.func)}」的刚需家电，分四大细分`)}
    <div class="two-col">
      <div>
        <div class="def-card">
          <div class="def-row"><span>产品名称</span>${ed('overview.definition.name', ov.definition.name)} / ${e(ov.definition.nameEn)}</div>
          <div class="def-row"><span>核心功能</span>${ed('overview.definition.func', ov.definition.func)}</div>
          <div class="def-row"><span>应用场景</span>${ed('overview.definition.scene', ov.definition.scene)}</div>
        </div>
        ${table(['细分', 'ASIN数', '销量占比', '销额占比', '均价'],
          ov.classes.map((c) => [e(c.name), c.asin, c.salesShare + '%', `<strong>${c.revShare}%</strong>`, '$' + c.avgPrice]),
          { align: ['left', 'right', 'right', 'right', 'right'] })}
      </div>
      <div>${donutChart(ov.classes.map((c) => ({ label: c.name, value: c.revShare })), { centerLabel: '销额占比', centerValue: '4 细分' })}</div>
    </div>`);

  push(1, `${head(1, '买家最关注 6 大核心参数，关键词体系覆盖大词 + 长尾 + 属性词')}
    <div class="two-col">
      <div>
        <h4 class="blk-title">核心参数维度</h4>
        ${table(['参数维度', '说明', '呈现方式'], ov.params.map((p) => [`<strong>${e(p.dim)}</strong>`, e(p.desc), e(p.viz)]))}
      </div>
      <div>
        <h4 class="blk-title">关键词体系</h4>
        <div class="kw-block"><span class="kw-tag">核心大词</span><div>${ov.keywords.core.map((k) => chip(k)).join('')}</div></div>
        <div class="kw-block"><span class="kw-tag">长尾词</span><div>${ov.keywords.longtail.map((k) => chip(k)).join('')}</div></div>
        <div class="kw-block"><span class="kw-tag">属性词</span><div>${ov.keywords.attr.map((k) => chip(k, 'good')).join('')}</div></div>
        <div class="kw-block"><span class="kw-tag">品牌词</span><div>${ov.keywords.brand.map((k) => chip(k, 'muted')).join('')}</div></div>
      </div>
    </div>`);

  /* ═══ 第 2 章 看市场 ═══ */
  const mk = s.market;
  push(2, `${head(2, `${fmtWan(9071)} 市场体量、近 12 月销量 +18%，春季装修旺季驱动增长`)}
    ${kpiCards(mk.kpis)}`);

  push(2, `${head(2, '销额呈明显季节性：3–5 月装修旺季为全年高峰，12 月触底')}
    ${lineChart(mk.trend.map((t) => ({ label: t.month, value: t.rev })), { unit: '万美元 / 月' })}`);

  push(2, `${head(2, '$50–100 是主力价格段（销量 41%），80–110CFM + ≤1.0sone 为主流参数')}
    <div class="two-col">
      <div>
        <h4 class="blk-title">价格段分布</h4>
        ${barChart(mk.priceDist.map((p) => ({ label: p.range, value: p.volShare })), { suffix: '%', color: PALETTE[1] })}
      </div>
      <div>
        <h4 class="blk-title">CFM 风量分布</h4>
        ${barChart(mk.cfmDist.map((p) => ({ label: p.range, value: p.share })), { suffix: '%', color: PALETTE[2] })}
        <h4 class="blk-title" style="margin-top:14px">噪音 sone 分布</h4>
        ${table(mk.soneDist.map((x) => x.range), [mk.soneDist.map((x) => `<strong>${x.share}%</strong>`)], { align: mk.soneDist.map(() => 'center') })}
      </div>
    </div>`);

  push(2, `${head(2, 'AI 推荐主攻【带灯款】★★★★★：体量最大 + 己品已有布局 + 色温可调蓝海', '细分优先度评估 — 等待人工确认')}
    <div class="two-col">
      <div>${table(['细分', '销额', '占比', '增速', '评级', '建议策略'],
        mk.segments.map((g) => [
          `<strong>${e(g.name)}</strong>`, fmtWan(g.rev), g.revShare + '%',
          `<span class="up">+${g.growth}%</span>`, `<span class="stars">${stars(g.stars)}</span>`, e(g.strategy),
        ]), { align: ['left', 'right', 'right', 'right', 'left', 'left'] })}
      </div>
      <div>${donutChart(mk.segments.map((g) => ({ label: g.name, value: g.rev })), { centerLabel: '细分销额', centerValue: fmtWan(9071) })}</div>
    </div>
    ${gate('segment', '主攻细分确认', '确认后第 3–9 章全部锁定该细分；竞品/用户/产品定义均不出现其他细分数据。', mk.segments[0].name, s.meta.gates.segment)}`);

  /* ═══ 第 3 章 看竞争 ═══ */
  const cp = s.competitor;
  push(3, `${head(3, `带灯款 CR5=${cp.cr5}%，Broan / Panasonic 双寡头，$120–160 中高端存在空白`, '品牌排名 TOP10（已排除己品 Amico）')}
    <div class="two-col">
      <div>${hBarChart(cp.brandRank.slice(0, 8).map((b) => ({ label: b.brand, value: b.rev })), { fmt: (v) => fmtWan(v), color: PALETTE[0] })}</div>
      <div>${table(['#', '品牌', '销额', 'ASIN', '均价', '市占'],
        cp.brandRank.map((b) => [b.rank, `<strong>${e(b.brand)}</strong>`, fmtWan(b.rev), b.asin, '$' + b.avgPrice, b.share + '%']),
        { align: ['center', 'left', 'right', 'right', 'right', 'right'] })}
        <div class="note-row">${chip('CR5 = ' + cp.cr5 + '%')}${chip('CR10 = ' + cp.cr10 + '%')}</div>
      </div>
    </div>`);

  push(3, `${head(3, '竞品主力集中 $80–120，静音 + 色温可调是 Broan 盲区 → 己品差异化窗口')}
    <div class="two-col">
      <div><h4 class="blk-title">价格段 ASIN 布局</h4>${heatTable(cp.priceLayoutCols, cp.priceLayout)}
        <h4 class="blk-title" style="margin-top:14px">核心参数覆盖</h4>${heatTable(cp.paramMatrixCols, cp.paramMatrix)}</div>
      <div><h4 class="blk-title">布局洞察</h4>
        ${cp.insights.map((t, i) => `<div class="insight"><span class="insight-n">${i + 1}</span>${e(t)}</div>`).join('')}
      </div>
    </div>`);

  push(3, `${head(3, 'Broan 走量但创新滞后、Panasonic 高端静音但贵 → 己品错位卡位')}
    <div class="two-col">${cp.companies.map((c) => `
      <div class="company-card">
        <div class="company-head"><strong>${e(c.name)}</strong><span class="chip muted">${e(c.positioning)}</span></div>
        <div class="company-meta">${c.founded} · ${e(c.hq)} · ${e(c.parent)}</div>
        <div class="company-kpis">
          <div><b>${c.asin}</b><span>ASIN</span></div>
          <div><b>${fmtWan(c.rev)}</b><span>年销额</span></div>
          <div><b>$${c.avgPrice}</b><span>均价</span></div>
          <div><b>${c.share}%</b><span>市占</span></div>
        </div>
        <div class="sw-line good">优势：${e(c.pros)}</div>
        <div class="sw-line bad">劣势：${e(c.cons)}</div>
        <div class="sw-line tip">💡 启示：${e(c.insight)}</div>
      </div>`).join('')}</div>`);

  const bp = cp.bestParent;
  push(3, `${head(3, `标杆父体 ${e(bp.name)}：${bp.params}，4.5 星 / 退货率仅 4.2%`, `ASIN ${e(bp.asin)} · 年销额 ${fmtWan(bp.rev)} · 售价 $${bp.price}`)}
    <div class="two-col">
      <div>${table(['维度', '参数/表现', '评论反馈'], bp.rows.map((r) => [`<strong>${e(r.dim)}</strong>`, e(r.spec), e(r.voc)]))}</div>
      <div><h4 class="blk-title">成功因素</h4>${bp.success.map((t, i) => `<div class="insight"><span class="insight-n">${i + 1}</span>${e(t)}</div>`).join('')}</div>
    </div>`);

  /* ═══ 第 4 章 看用户 ═══ */
  const us = s.user;
  push(4, `${head(4, '静音(好评34%)与灯光是核心买点；噪音(差评38%)与色温单一是首要痛点')}
    <div class="two-col">
      <div><h4 class="blk-title good">好评 TOP（占比）</h4>${us.pros.map((p) => `
        <div class="voc-bar"><span class="voc-dim">${e(p.dim)}</span><div class="voc-track"><div class="voc-fill good" style="width:${p.share}%"></div></div><span class="voc-pct">${p.share}%</span></div>
        <div class="voc-note">${e(p.note)}</div>`).join('')}</div>
      <div><h4 class="blk-title bad">差评 TOP（占比）</h4>${us.cons.map((p) => `
        <div class="voc-bar"><span class="voc-dim">${e(p.dim)}</span><div class="voc-track"><div class="voc-fill bad" style="width:${p.share}%"></div></div><span class="voc-pct">${p.share}%</span></div>
        <div class="voc-note">${e(p.note)}</div>`).join('')}</div>
    </div>
    <div class="callout">📌 参数临界值：${e(us.criticalInsight)}</div>`);

  /* ═══ 第 5 章 看自己 ═══ */
  const sf = s.self;
  push(5, `${head(5, `己品 ${e(s.meta.brand)} 带灯款已有布局，优势在色温可调 + 私模供应链，需补静音短板`)}
    <div class="two-col">
      <div>
        <h4 class="blk-title">己品带灯款产品线</h4>
        ${table(['SKU', '售价', '年销额', '状态'], sf.productLine.map((p) => [e(p.sku), '$' + p.price, fmtWan(p.rev), chip(p.status, 'good')]), { align: ['left', 'right', 'right', 'center'] })}
        <div class="callout sm">🏭 供应链：${e(sf.supplyChain)}</div>
      </div>
      <div>
        <h4 class="blk-title">SWOT 分析</h4>
        <div class="swot">
          <div class="swot-q s"><b>S 优势</b><ul>${sf.swot.S.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
          <div class="swot-q w"><b>W 劣势</b><ul>${sf.swot.W.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
          <div class="swot-q o"><b>O 机会</b><ul>${sf.swot.O.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
          <div class="swot-q t"><b>T 威胁</b><ul>${sf.swot.T.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </div>`);

  /* ═══ 第 6 章 定产品 ═══ */
  const pd = s.product;
  push(6, `${head(6, 'SWOT 交叉推导出 3 个方向，全部位于【带灯款】内，覆盖巩固/走量/突破三路径')}
    <div class="cross-grid">${pd.swotCross.map((c) => `
      <div class="cross-card">
        <div class="cross-combo">${e(c.combo)}</div>
        <div class="cross-mean">${e(c.meaning)}</div>
        <div class="cross-dir">${e(c.dir)}</div>
      </div>`).join('')}</div>`);

  pd.directions.forEach((d) => {
    const series = [
      { name: d.benchNames[0], values: d.radar.map((r) => r.self), score: d.benchScore[0], color: PALETTE[0] },
      { name: d.benchNames[1], values: d.radar.map((r) => r.c1), score: d.benchScore[1], color: PALETTE[1] },
      { name: d.benchNames[2], values: d.radar.map((r) => r.c2), score: d.benchScore[2], color: PALETTE[4] },
      { name: d.benchNames[3], values: d.radar.map((r) => r.c3), score: d.benchScore[3], color: PALETTE[5] },
    ];
    push(6, `${head(6, `方向 ${d.id}：${e(d.name)} — 雷达综合均分 ${d.score}（对标 ${d.benchScore.slice(1).join('/')}）`, `${d.rec} · <span class="stars">${stars(d.stars)}</span>`)}
      <div class="two-col">
        <div>
          ${table(['定义维度', '内容'], [
            ['目标价格段', `<strong>${e(d.price)}</strong>（目标 $${d.target}）`],
            ['核心参数', e(d.params)],
            ['用户类型', e(d.userType)],
            ['目标用户', e(d.users)],
            ['差异化卖点', `<strong>${e(d.selling)}</strong>`],
            ['与己品关联', e(d.link)],
            ['预期月销量', `${d.expSales} 件`],
          ])}
        </div>
        <div>${radarChart(d.radar.map((r) => r.dim), series)}</div>
      </div>`);
  });

  const A = pd.directions[0];
  push(6, `${head(6, `已确认方向 A，生成双 SKU 产品定义表，专利风险评估为${e(pd.patent.risk)}`, '产品方向选择 — 等待人工确认')}
    ${gate('direction', '产品方向确认', '确认后「定策略 / 定计划 / 立项评审」均围绕该方向展开，财务与风险与之绑定。', 'A', s.meta.gates.direction)}
    <div class="two-col" style="margin-top:14px">
      <div><h4 class="blk-title">产品定义表（方向 A 双 SKU）</h4>
        ${table(pd.defTable.cols, pd.defTable.rows.map((r) => r.map((c, i) => i === 0 ? `<strong>${e(c)}</strong>` : e(c))), { cls: 'compact' })}</div>
      <div><h4 class="blk-title">专利排查与风险分析</h4>
        <div class="patent-row"><span>外观专利</span>${e(pd.patent.appearance)}</div>
        <div class="patent-row"><span>发明专利</span>${e(pd.patent.invention)}</div>
        <div class="patent-row"><span>风险等级</span>${chip(pd.patent.risk, 'good')}</div>
        <div class="patent-row"><span>行动计划</span>${e(pd.patent.action)}</div>
        <div class="callout sm" style="margin-top:12px">🎯 核心卖点：${e(A.selling)} ｜ ${e(A.params)}</div>
      </div>
    </div>`);

  /* ═══ 第 7 章 定策略 ═══ */
  const st = s.strategy;
  const totalCost = st.costRows.reduce((a, c) => a + c.value, 0);
  push(7, `${head(7, `方向 A 售价 $${st.price}，毛利率 ${st.grossMargin}%，首年 ROI ${st.roi.roiPct}%，${st.roi.payback} 月回本`)}
    <div class="three-col">
      <div><h4 class="blk-title">单件成本结构（$）</h4>
        ${table(['成本项', '金额', '说明'], st.costRows.map((c) => [e(c.item), '$' + c.value, e(c.note)]), { align: ['left', 'right', 'left'] })}
        <div class="cost-sum">总成本 $${totalCost.toFixed(1)} ｜ 单件毛利 <strong>$${(st.price - totalCost).toFixed(1)}</strong></div>
      </div>
      <div class="center-col">
        ${gauge(st.grossMargin, 100, { display: st.grossMargin + '%', label: '毛利率', color: PALETTE[2] })}
        ${gauge(st.roi.roiPct, 200, { display: st.roi.roiPct + '%', label: '首年 ROI', color: PALETTE[0] })}
      </div>
      <div><h4 class="blk-title">盈亏平衡 & 首年测算</h4>
        ${table(['指标', '值'], [
          ['固定投入', `$${st.breakeven.fixedInvest}万`],
          ['盈亏平衡月销量', `<strong>${st.breakeven.monthlyUnit} 件</strong>`],
          ['月销目标', `${st.roi.monthlyTarget} 件`],
          ['单件净利', `$${st.roi.unitProfit}`],
          ['首年销量', `${st.roi.year1Sales.toLocaleString()} 件`],
          ['首年销额', `$${st.roi.year1Revenue}万`],
          ['首年净利', `<strong>$${st.roi.year1Profit}万</strong>`],
          ['回本周期', `${st.roi.payback} 月`],
        ], { align: ['left', 'right'] })}
        <div class="callout sm">${e(st.breakeven.note)}</div>
      </div>
    </div>`);

  /* ═══ 第 8 章 定计划 ═══ */
  const tl = s.timeline;
  push(8, `${head(8, `方向 A 开发周期 ${tl.totalWeeks} 周：开模→认证→量产→上架→推广爬升`)}
    ${ganttChart(tl.milestones, tl.totalWeeks)}
    <div class="note-row">
      ${chip('关键路径：开模(W3) → 认证(W10) → 量产(W13) → 上架(W17)', 'good')}
      ${chip('认证 ETL/HVI 与 DVT 并行以压缩周期')}
    </div>`);

  /* ═══ 第 9 章 立项评审 ═══ */
  const ap = s.approval;
  push(9, `${head(9, '立项九问全部正向，9 项均分 4.3 / 5，无致命短板')}
    <div class="nine-grid">${ap.nineQuestions.map((q, i) => `
      <div class="nine-card">
        <div class="nine-q"><span class="nine-n">Q${i + 1}</span>${e(q.q)}</div>
        <div class="nine-a">${e(q.a)}</div>
        <div class="nine-score">${'●'.repeat(q.score)}${'○'.repeat(5 - q.score)} <b>${q.score}</b></div>
      </div>`).join('')}</div>`);

  const weighted = ap.scoreMatrix.reduce((a, m) => a + (m.weight / 100) * m.score, 0);
  push(9, `${head(9, `加权综合得分 ${weighted.toFixed(2)} / 5 ≥ Go 阈值 4.0 → 决策【${ap.decision}】`, '立项决策矩阵')}
    <div class="two-col">
      <div>${table(['评估维度', '权重', '得分', '加权'], ap.scoreMatrix.map((m) => [
        `<strong>${e(m.dim)}</strong>`, m.weight + '%', m.score.toFixed(1),
        `<div class="mini-bar"><div style="width:${(m.score / 5) * 100}%"></div></div>`,
      ]), { align: ['left', 'center', 'center', 'left'] })}
        <div class="cost-sum">加权总分 <strong>${weighted.toFixed(2)} / 5</strong></div>
      </div>
      <div class="decision-col">
        <div class="decision-badge ${ap.decision === 'Go' ? 'go' : 'nogo'}">${e(ap.decision)}</div>
        <p class="decision-note">${e(ap.decisionNote)}</p>
      </div>
    </div>`);

  return slides;
}
