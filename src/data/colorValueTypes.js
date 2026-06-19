export const COLOR_VALUE_TYPES = [
  { value: 'theme', label: '主题色', tagClass: 'type-theme' },
  { value: 'functional', label: '功能色', tagClass: 'type-functional' },
  { value: 'text-light', label: '文本色（浅色背景下）', tagClass: 'type-text-light' },
  { value: 'text-dark', label: '文本色（深色背景下）', tagClass: 'type-text-dark' },
  { value: 'auxiliary', label: '辅助色', tagClass: 'type-auxiliary' }
];

export const DEFAULT_COLOR_VALUE_TYPE = 'theme';

export function getColorValueTypeOption(value) {
  return COLOR_VALUE_TYPES.find((item) => item.value === value) || null;
}

export function getColorValueTypeLabel(value) {
  const option = getColorValueTypeOption(value);
  return option ? option.label : '未分类';
}

export function getColorValueTypeTagClass(value) {
  const option = getColorValueTypeOption(value);
  return option ? option.tagClass : 'type-default';
}

export function normalizeColorValueType(value) {
  if (getColorValueTypeOption(value)) return value;
  return DEFAULT_COLOR_VALUE_TYPE;
}
