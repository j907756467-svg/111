// defaultData.js — 默认数据集
// 基于上传的 5 个技能包（产品概要 / 看市场 / 看竞争 / 定产品 / 完整工作流）示例数据构建
// 品类：亚马逊浴室排气扇 (Bathroom Exhaust Fan) ｜ 己品品牌：Amico
// 该数据可在看板中编辑，并通过「数据存档」保存为快照 / 导出 JSON。

export const SCHEMA_VERSION = 1;

export function buildDefaultData() {
  return {
    meta: {
      title: '亚马逊浴室排气扇选品立项报告',
      category: '浴室排气扇 (Bathroom Exhaust Fan)',
      brand: 'Amico',
      author: '选品立项工作组',
      date: '2026-06-11',
      reportVersion: 'v4',
      // 三个关键人工确认节点（技能包强约束）
      gates: {
        brand: { status: 'confirmed', value: 'Amico', time: '2026-06-11' },
        segment: { status: 'confirmed', value: '带灯款', assist: '智能款', time: '2026-06-11' },
        direction: { status: 'confirmed', value: 'A', time: '2026-06-11' },
      },
    },

    // ───────── 第 1 章 产品概要 ─────────
    overview: {
      definition: {
        name: '浴室排气扇',
        nameEn: 'Bathroom Exhaust Fan',
        func: '排除浴室湿气 / 异味，改善空气流通，预防霉变',
        scene: '家庭浴室 / 卫生间，嵌入天花板安装',
      },
      classes: [
        { name: '带灯款', asin: 1180, salesShare: 48, revShare: 50.5, avgPrice: 96 },
        { name: '常规款', asin: 760, salesShare: 33, revShare: 27.0, avgPrice: 58 },
        { name: '加热款', asin: 250, salesShare: 9, revShare: 12.8, avgPrice: 142 },
        { name: '智能款', asin: 150, salesShare: 10, revShare: 9.7, avgPrice: 88 },
      ],
      params: [
        { dim: 'CFM 风量', desc: '排气能力，决定适用面积', viz: '分布直方图' },
        { dim: '噪音 / sone', desc: '静音程度，越低越优', viz: '分段占比' },
        { dim: '亮度 / LM', desc: '照明能力（带灯款）', viz: '分段占比' },
        { dim: '色温 / K', desc: '灯光色调，可调 vs 固定', viz: '可调占比' },
        { dim: '价格 / USD', desc: '售价区间', viz: '价格段分布' },
        { dim: '认证', desc: 'Energy Star / HVI / ETL', viz: '认证占比' },
      ],
      keywords: {
        core: ['bathroom exhaust fan', 'bathroom fan', 'ventilation fan'],
        longtail: ['bathroom exhaust fan with light', 'quiet bathroom fan', 'exhaust fan with humidity sensor'],
        attr: ['quiet', 'LED', 'humidity sensor', '110 CFM', 'energy star', '5 CCT'],
        brand: ['Broan', 'Panasonic', 'Delta', 'KAZE'],
      },
    },

    // ───────── 第 2 章 看市场 ─────────
    market: {
      kpis: [
        { label: '总销额(近12月)', value: '9,071', unit: '万美元', sub: '≈ $0.91 亿' },
        { label: '总销量(近12月)', value: '116.3', unit: '万件', sub: '同比 +18%' },
        { label: '市场均价', value: '78', unit: '美元', sub: '总销额/总销量' },
        { label: '活跃品牌数', value: '187', unit: '个', sub: 'ASIN 2,340 个' },
        { label: '新品率(近6月)', value: '18', unit: '%', sub: '创新活跃度中等' },
        { label: '月均销额', value: '756', unit: '万美元', sub: '春季装修旺季走高' },
      ],
      // 月度趋势（万美元），春季 3-5 月装修旺季走高
      trend: [
        { month: '2025-06', rev: 790, vol: 9.8 },
        { month: '2025-07', rev: 740, vol: 9.4 },
        { month: '2025-08', rev: 720, vol: 9.1 },
        { month: '2025-09', rev: 760, vol: 9.6 },
        { month: '2025-10', rev: 800, vol: 10.2 },
        { month: '2025-11', rev: 780, vol: 10.0 },
        { month: '2025-12', rev: 591, vol: 7.6 },
        { month: '2026-01', rev: 620, vol: 8.0 },
        { month: '2026-02', rev: 660, vol: 8.5 },
        { month: '2026-03', rev: 820, vol: 10.6 },
        { month: '2026-04', rev: 910, vol: 11.7 },
        { month: '2026-05', rev: 880, vol: 11.3 },
      ],
      priceDist: [
        { range: '<$50', volShare: 22, revShare: 12, brands: 96 },
        { range: '$50-100', volShare: 41, revShare: 38, brands: 124 },
        { range: '$100-150', volShare: 24, revShare: 30, brands: 68 },
        { range: '$150-200', volShare: 9, revShare: 14, brands: 31 },
        { range: '>$200', volShare: 4, revShare: 6, brands: 18 },
      ],
      cfmDist: [
        { range: '50CFM', share: 12 },
        { range: '80CFM', share: 38 },
        { range: '110CFM', share: 35 },
        { range: '130CFM+', share: 15 },
      ],
      soneDist: [
        { range: '≤0.5 sone', share: 14 },
        { range: '≤1.0 sone', share: 47 },
        { range: '≤1.5 sone', share: 28 },
        { range: '>1.5 sone', share: 11 },
      ],
      // 细分优先度评估（AI 推荐排序）
      segments: [
        { name: '带灯款', rev: 4579, revShare: 50.5, growth: 22, brands: 92, stars: 5, layout: '己品已有 $106万 布局', strategy: '巩固 + 扩展色温可调优势' },
        { name: '智能款', rev: 884, revShare: 9.7, growth: 76, brands: 30, stars: 4, layout: '己品空白 · 蓝海', strategy: '蓝海卡位，快速迭代' },
        { name: '加热款', rev: 1162, revShare: 12.8, growth: 50, brands: 41, stars: 3, layout: '己品空白', strategy: '评估进入可行性' },
        { name: '常规款', rev: 2446, revShare: 27.0, growth: 8, brands: 118, stars: 2, layout: '己品已有布局', strategy: '以守为主，优化利润' },
      ],
    },

    // ───────── 第 3 章 看竞争（仅主攻细分 = 带灯款） ─────────
    competitor: {
      cr5: 67, cr10: 85,
      brandRank: [
        { rank: 1, brand: 'Broan-NuTone', rev: 1145, asin: 86, avgPrice: 89, share: 25.0 },
        { rank: 2, brand: 'Panasonic', rev: 824, asin: 42, avgPrice: 165, share: 18.0 },
        { rank: 3, brand: 'Delta', rev: 458, asin: 38, avgPrice: 95, share: 10.0 },
        { rank: 4, brand: 'KAZE', rev: 367, asin: 24, avgPrice: 119, share: 8.0 },
        { rank: 5, brand: 'Homewerks', rev: 275, asin: 31, avgPrice: 72, share: 6.0 },
        { rank: 6, brand: 'Hunter', rev: 229, asin: 19, avgPrice: 99, share: 5.0 },
        { rank: 7, brand: 'Air King', rev: 183, asin: 22, avgPrice: 68, share: 4.0 },
        { rank: 8, brand: 'Aero Pure', rev: 160, asin: 15, avgPrice: 145, share: 3.5 },
        { rank: 9, brand: 'VENTS', rev: 137, asin: 12, avgPrice: 130, share: 3.0 },
        { rank: 10, brand: 'Akicon', rev: 115, asin: 14, avgPrice: 79, share: 2.5 },
      ],
      // 竞品产品线价格段布局（ASIN 数量）
      priceLayout: [
        { brand: 'Broan-NuTone', d: [8, 22, 31, 16, 6, 3] },
        { brand: 'Panasonic', d: [0, 4, 12, 14, 8, 4] },
        { brand: 'Delta', d: [3, 14, 13, 6, 2, 0] },
      ],
      priceLayoutCols: ['<$50', '$50-80', '$80-120', '$120-160', '$160-200', '>$200'],
      // 核心参数覆盖矩阵（ASIN 数量）
      paramMatrix: [
        { brand: 'Broan-NuTone', d: [34, 31, 12, 48, 18, 6, 4] },
        { brand: 'Panasonic', d: [6, 28, 22, 14, 24, 9, 2] },
        { brand: 'Delta', d: [18, 14, 5, 26, 9, 3, 1] },
      ],
      paramMatrixCols: ['80CFM', '110CFM', '≤0.5sone', '≤1.0sone', '色温可调', '智能', '加热'],
      insights: [
        '竞品主力阵地集中在 $80-120，$120-160 高端中端存在结构性空白，可作为己品上探切口。',
        'Panasonic 主打超静音(≤0.5sone)但色温可调覆盖弱；Broan 量大但静音与色温可调是盲区。',
        '头部品牌色温可调 SKU 占比偏低（<25%），己品「静音 + 5档色温可调」组合具备差异化窗口。',
      ],
      companies: [
        {
          name: 'Broan-NuTone', founded: 1932, hq: '美国威斯康星', parent: 'Madison Air',
          positioning: '大众走量 · 渠道为王', asin: 86, rev: 1145, avgPrice: 89, share: 25.0,
          pros: '品牌认知度高、渠道铺货广、价格带齐全', cons: '静音与色温可调创新滞后，高端溢价不足',
          insight: 'Amico 可在其薄弱的静音 + 色温可调维度做差异化卡位',
        },
        {
          name: 'Panasonic', founded: 1918, hq: '日本大阪', parent: 'Panasonic Holdings',
          positioning: '高端静音 · 技术壁垒', asin: 42, rev: 824, avgPrice: 165, share: 18.0,
          pros: 'DC 电机超静音技术领先、品牌溢价强、口碑好', cons: '价格高($150+)、色温可调与高流明覆盖不足',
          insight: 'Amico 用「接近的静音 + 更优性价比 + 色温可调」错位竞争',
        },
      ],
      bestParent: {
        asin: 'B07XXXLIGHT', name: 'Broan-NuTone 110 CFM 带灯排气扇旗舰款',
        rev: 318, price: 89.99, params: '110CFM / 1.0 sone / 1200LM / 4000K',
        rows: [
          { dim: '灯光亮度', spec: '1200LM / 4000K 固定', voc: '亮度足够(好评 31%)' },
          { dim: '电机类型', spec: '交流 AC 电机', voc: '静音好评率 22%，部分反馈偏吵' },
          { dim: '安装设计', spec: '快装支架', voc: '安装好评 28.5%' },
          { dim: '认证', spec: 'Energy Star / HVI', voc: '消费者信任度高' },
          { dim: '评分', spec: '4.5 星 (3,210 条)', voc: '高于品类均值 4.3' },
          { dim: '退货率', spec: '4.2%', voc: '低于品类均值 6.1%' },
        ],
        success: [
          '价格锚定精准：$89.99 卡在主力价格段甜点，走量能力强',
          '快装支架降低安装门槛，安装好评率达 28.5%',
          '110CFM + 1200LM 参数组合覆盖主流需求',
          'Energy Star / HVI 双认证建立信任，退货率仅 4.2%',
        ],
      },
    },

    // ───────── 第 4 章 看用户 VOC（仅主攻细分） ─────────
    user: {
      pros: [
        { dim: '静音表现', share: 34, note: '“安静到几乎听不见”' },
        { dim: '灯光亮度', share: 28, note: '“浴室一下子亮堂了”' },
        { dim: '安装便捷', share: 21, note: '“快装支架，一个人就能装”' },
        { dim: '排气效果', share: 17, note: '“镜子不再起雾”' },
      ],
      cons: [
        { dim: '噪音偏大', share: 38, note: 'AC 电机款集中差评' },
        { dim: '色温单一', share: 24, note: '“只有冷白光，不够温馨”' },
        { dim: '灯光偏暗', share: 19, note: '<800LM 款集中' },
        { dim: '接线复杂', share: 11, note: '传统接线款' },
      ],
      // 不同 sone 区间的好评率（参数临界值识别）
      soneSatisfaction: [
        { range: '≤0.3', pos: 92 },
        { range: '0.3-0.5', pos: 88 },
        { range: '0.5-0.8', pos: 81 },
        { range: '0.8-1.0', pos: 68 },
        { range: '1.0-1.5', pos: 52 },
        { range: '>1.5', pos: 34 },
      ],
      criticalInsight: '静音满意度临界点在 0.8 sone：≤0.8 sone 好评率 81%+，>1.0 sone 骤降至 52%。己品方向应锁定 ≤0.8 sone。',
    },

    // ───────── 第 5 章 看自己 SWOT（仅主攻细分） ─────────
    self: {
      productLine: [
        { sku: 'Amico 80CFM 带灯款', price: 64.99, rev: 62, status: '在售' },
        { sku: 'Amico 110CFM 带灯款', price: 79.99, rev: 44, status: '在售' },
      ],
      supplyChain: '深圳自有合作工厂，支持私模；交期 35 天；DC 电机已有供应商导入中',
      swot: {
        S: ['色温可调技术已量产', '深圳供应链私模能力', '带灯款已有 $106万 销售基础'],
        W: ['静音水平落后 Panasonic', '品牌认知度低于头部', '高端价格段($120+)空白'],
        O: ['色温可调渗透率仍低(<25%)', '$120-160 价格带结构性空白', '智能款蓝海(增速+76%)'],
        T: ['Broan 价格战', 'Panasonic 静音技术壁垒', '原材料 / 物流成本波动'],
      },
    },

    // ───────── 第 6 章 定产品（3 方向均在带灯款内） ─────────
    product: {
      swotCross: [
        { combo: 'S+O', meaning: '利用优势抓住机会', dir: '基于色温可调优势，升级静音 + 高流明旗舰款（→方向A）' },
        { combo: 'S+T', meaning: '利用优势规避威胁', dir: '强化静音 + 性价比，巩固中端防止跟进（→方向B）' },
        { combo: 'W+O', meaning: '克服劣势抓住机会', dir: '导入 DC 电机超静音，填补 $120+ 高端空白（→方向C）' },
      ],
      directions: [
        {
          id: 'A', name: 'Amico 旗舰静音色温可调带灯排气扇', stars: 5, rec: '推荐度最高',
          price: '$80-120', target: 99.99, params: '110CFM / ≤0.8sone / ≥1200LM / 5档色温可调',
          userType: '创新型产品', users: 'DIY 房主 / 新房装修用户',
          selling: '静音 + 色温可调双壁垒', link: '延伸现有色温可调技术，升级静音水平',
          expSales: 800, score: 4.7,
          radar: [
            { dim: '风量', self: 5, c1: 5, c2: 5, c3: 4 },
            { dim: '静音', self: 4, c1: 3, c2: 2, c3: 5 },
            { dim: '灯光', self: 5, c1: 4, c2: 2, c3: 5 },
            { dim: '安装', self: 4, c1: 4, c2: 3, c3: 5 },
            { dim: '性价比', self: 5, c1: 3, c2: 2, c3: 1 },
            { dim: '口碑', self: 5, c1: 4, c2: 3, c3: 5 },
            { dim: '差异化', self: 5, c1: 3, c2: 1, c3: 4 },
          ],
          benchNames: ['己品目标', 'KAZE $129.99', 'Broan $149.99', 'Panasonic $189.99'],
          benchScore: [4.7, 3.7, 2.7, 4.3],
        },
        {
          id: 'B', name: 'Amico 中端色温可调带灯排气扇', stars: 4, rec: '性价比走量',
          price: '$60-80', target: 69.99, params: '80CFM / ≤1.0sone / ≥1000LM / 3档色温可调',
          userType: '自由100产品', users: '价格敏感 DIY / 出租屋改造',
          selling: '色温可调 + 极致性价比', link: '基于现有走量款迭代，降本扩份额',
          expSales: 1400, score: 4.2,
          radar: [
            { dim: '风量', self: 4, c1: 4, c2: 5, c3: 4 },
            { dim: '静音', self: 3, c1: 3, c2: 2, c3: 4 },
            { dim: '灯光', self: 4, c1: 4, c2: 3, c3: 4 },
            { dim: '安装', self: 4, c1: 4, c2: 3, c3: 4 },
            { dim: '性价比', self: 5, c1: 4, c2: 5, c3: 3 },
            { dim: '口碑', self: 4, c1: 4, c2: 3, c3: 4 },
            { dim: '差异化', self: 4, c1: 3, c2: 2, c3: 3 },
          ],
          benchNames: ['己品目标', 'Homewerks $72', 'Broan $79', 'Air King $68'],
          benchScore: [4.2, 3.8, 4.0, 3.5],
        },
        {
          id: 'C', name: 'Amico 高端静音色温可调带灯排气扇', stars: 3, rec: '高端突破',
          price: '$120-160', target: 139.99, params: '130CFM / ≤0.5sone / ≥1500LM / 5档色温可调+夜灯',
          userType: '创新型产品', users: '高端装修 / 大浴室房主',
          selling: '超静音 + 高流明 + 夜灯三合一', link: '填补 $120+ 高端空白，提升品牌溢价',
          expSales: 350, score: 4.1,
          radar: [
            { dim: '风量', self: 5, c1: 5, c2: 4, c3: 5 },
            { dim: '静音', self: 5, c1: 4, c2: 3, c3: 5 },
            { dim: '灯光', self: 5, c1: 5, c2: 4, c3: 5 },
            { dim: '安装', self: 4, c1: 4, c2: 4, c3: 5 },
            { dim: '性价比', self: 4, c1: 3, c2: 3, c3: 1 },
            { dim: '口碑', self: 4, c1: 5, c2: 4, c3: 5 },
            { dim: '差异化', self: 5, c1: 4, c2: 3, c3: 4 },
          ],
          benchNames: ['己品目标', 'Aero Pure $145', 'KAZE $129', 'Panasonic $189'],
          benchScore: [4.1, 4.3, 3.9, 4.0],
        },
      ],
      // 产品定义表（确认方向 A 后生成，双 SKU）
      defTable: {
        cols: ['参数', 'SKU1', 'SKU2'],
        rows: [
          ['产品名称', '带灯浴室排气扇 80CFM', '带灯浴室排气扇 110CFM'],
          ['用户类型', '略胜型产品', '创新型产品'],
          ['父体结构', 'BS100 / 80CFM 0.8Sone DC 带灯 5CCT', 'BS100 / 110CFM 0.8Sone DC 带灯 5CCT'],
          ['输入电压', '120V', '120V'],
          ['色温', '2700/3000/3500/4000/5000K', '2700/3000/3500/4000/5000K'],
          ['功率', '电机18W / 光源18W', '电机22W / 光源18W'],
          ['光通量', '1200LM', '1200LM'],
          ['风量', '80CFM', '110CFM'],
          ['噪音', '≤0.8 SONE', '≤0.8 SONE'],
          ['认证', 'ETL、HVI', 'ETL、HVI'],
          ['采购价', '¥176', '¥192'],
          ['售价', '$89.99', '$99.99'],
          ['毛利率', '38.5%', '37.7%'],
        ],
      },
      patent: {
        appearance: '工厂私模设计，无外观侵权风险；我司同步安排专利排查中',
        invention: '色温可调电路为公知技术 / 已获授权专利保护，无侵权风险',
        risk: '低风险',
        action: '量产前完成 FTO 检索，预计 2 周完成；私模外观同步申请专利',
      },
    },

    // ───────── 第 7 章 定策略（仅确认方向 A） ─────────
    strategy: {
      // 单件成本结构（基于 SKU2 110CFM，售价 $99.99）
      costRows: [
        { item: '采购成本', value: 26.7, note: '¥192 ≈ $26.7' },
        { item: '头程物流', value: 4.2, note: '海运 + 关税' },
        { item: 'FBA 配送费', value: 12.0, note: '标准尺寸' },
        { item: '平台佣金(15%)', value: 15.0, note: '$99.99×15%' },
        { item: '推广 / 广告', value: 8.0, note: 'ACOS 摊销' },
        { item: '退货 / 售后', value: 2.0, note: '退货率 4%' },
      ],
      price: 99.99,
      grossMargin: 37.7,
      // 盈亏平衡
      breakeven: { fixedInvest: 22, monthlyUnit: 580, note: '模具 $8k + 认证 $6k + 首批库存 $8k' },
      // 首年 ROI 测算
      roi: {
        monthlyTarget: 800,
        unitProfit: 32.1,
        year1Sales: 9600,
        year1Revenue: 95.99,   // 万美元
        year1Profit: 30.8,     // 万美元
        roiPct: 140,
        payback: 4.2,          // 月
      },
    },

    // ───────── 第 8 章 项目计划（甘特图，仅确认方向 A） ─────────
    timeline: {
      totalWeeks: 24,
      milestones: [
        { phase: '产品定义 & BOM', start: 1, end: 2, owner: '产品' },
        { phase: '开模 / 打样 EVT', start: 3, end: 6, owner: '工程' },
        { phase: 'ETL / HVI 认证', start: 5, end: 10, owner: '合规' },
        { phase: 'DVT 设计验证', start: 7, end: 10, owner: '工程' },
        { phase: 'PVT 量产试产', start: 11, end: 13, owner: '供应链' },
        { phase: '头程物流入仓', start: 13, end: 16, owner: '物流' },
        { phase: 'Listing & 上架', start: 15, end: 17, owner: '运营' },
        { phase: '推广爬升期', start: 17, end: 24, owner: '运营' },
      ],
    },

    // ───────── 第 9 章 立项评审（立项九问 + Go/NoGo） ─────────
    approval: {
      nineQuestions: [
        { q: '市场够大吗？', a: '带灯款 $4,579万 / 占比 50.5%，体量充足', score: 5 },
        { q: '增长趋势如何？', a: '带灯款 YoY +22%，色温可调子赛道更快', score: 4 },
        { q: '竞争格局有空间吗？', a: 'CR5 67%，但 $120-160 高端中端有结构性空白', score: 4 },
        { q: '我们有差异化优势吗？', a: '静音 + 5档色温可调双壁垒，雷达均分 4.7', score: 5 },
        { q: '用户痛点真实且未满足？', a: '噪音差评 38%、色温单一 24%，痛点明确', score: 5 },
        { q: '供应链可控吗？', a: '深圳私模 + DC 电机供应商导入中，交期 35 天', score: 4 },
        { q: '盈利模型成立吗？', a: '毛利率 37.7%，首年 ROI 140%，回本 4.2 月', score: 4 },
        { q: '合规 / 专利风险可控？', a: '私模无外观风险，FFO 检索 2 周完成，低风险', score: 4 },
        { q: '团队 / 资源匹配吗？', a: '已有带灯款运营经验与色温可调技术积累', score: 4 },
      ],
      // 评分矩阵（加权）
      scoreMatrix: [
        { dim: '市场吸引力', weight: 25, score: 4.5 },
        { dim: '竞争壁垒', weight: 25, score: 4.6 },
        { dim: '盈利能力', weight: 20, score: 4.0 },
        { dim: '执行可行性', weight: 15, score: 4.2 },
        { dim: '风险可控性', weight: 15, score: 4.0 },
      ],
      decision: 'Go',
      decisionNote: '综合加权得分 4.32 / 5，超过 Go 阈值 4.0。建议立项，优先推进方向 A（旗舰静音色温可调带灯排气扇）双 SKU。',
    },
  };
}
