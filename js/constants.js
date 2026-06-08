// Shared option lists for itinerary types and expense categories, with the
// emoji + label used to render them consistently across views.

export const ITINERARY_TYPES = [
  { value: 'flight', label: '航班', icon: '✈️' },
  { value: 'train', label: '火车', icon: '🚄' },
  { value: 'hotel', label: '住宿', icon: '🏨' },
  { value: 'meeting', label: '会议', icon: '📅' },
  { value: 'meal', label: '餐饮', icon: '🍽️' },
  { value: 'transport', label: '市内交通', icon: '🚕' },
  { value: 'other', label: '其他', icon: '📌' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'transport', label: '交通', icon: '🚕' },
  { value: 'hotel', label: '住宿', icon: '🏨' },
  { value: 'meal', label: '餐饮', icon: '🍽️' },
  { value: 'entertain', label: '招待', icon: '🤝' },
  { value: 'office', label: '办公', icon: '🗂️' },
  { value: 'other', label: '其他', icon: '📌' },
];

export function itineraryType(value) {
  return ITINERARY_TYPES.find((t) => t.value === value) || ITINERARY_TYPES[ITINERARY_TYPES.length - 1];
}

export function expenseCategory(value) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

// Suggested packing items offered as one-tap presets in the checklist view.
export const PACKING_PRESETS = [
  '身份证 / 工牌',
  '笔记本电脑 + 充电器',
  '手机充电宝',
  '名片',
  '合同 / 资料文件',
  '洗漱用品',
  '换洗衣物',
  '常用药品',
  '报销单据信封',
  '雨伞',
];
