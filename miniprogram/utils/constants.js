// Shared option lists for itinerary types and expense categories.

const ITINERARY_TYPES = [
  { value: 'flight', label: '航班', icon: '✈️' },
  { value: 'train', label: '火车', icon: '🚄' },
  { value: 'hotel', label: '住宿', icon: '🏨' },
  { value: 'meeting', label: '会议', icon: '📅' },
  { value: 'meal', label: '餐饮', icon: '🍽️' },
  { value: 'transport', label: '市内交通', icon: '🚕' },
  { value: 'other', label: '其他', icon: '📌' },
];

const EXPENSE_CATEGORIES = [
  { value: 'transport', label: '交通', icon: '🚕' },
  { value: 'hotel', label: '住宿', icon: '🏨' },
  { value: 'meal', label: '餐饮', icon: '🍽️' },
  { value: 'entertain', label: '招待', icon: '🤝' },
  { value: 'office', label: '办公', icon: '🗂️' },
  { value: 'other', label: '其他', icon: '📌' },
];

const PACKING_PRESETS = [
  '身份证 / 工牌', '笔记本电脑 + 充电器', '手机充电宝', '名片',
  '合同 / 资料文件', '洗漱用品', '换洗衣物', '常用药品', '报销单据信封', '雨伞',
];

function findBy(list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].value === value) return list[i];
  }
  return list[list.length - 1];
}

module.exports = {
  ITINERARY_TYPES,
  EXPENSE_CATEGORIES,
  PACKING_PRESETS,
  itineraryType: (v) => findBy(ITINERARY_TYPES, v),
  expenseCategory: (v) => findBy(EXPENSE_CATEGORIES, v),
};
