// 色板分组 localStorage 读写与默认数据
export const STORAGE_KEY = 'color_palette_manager_v1';

const DEFAULT_PALETTES = [
  {
    id: 'default-1',
    name: '品牌主色',
    type: 'brand',
    colors: [
      { name: '主色 Primary', color: '#1677FF', note: '按钮、链接、高亮元素', colorType: 'theme' },
      { name: '辅色 Secondary', color: '#69B1FF', note: '次要按钮、状态标识', colorType: 'auxiliary' },
      { name: '成功色 Success', color: '#52C41A', note: '成功状态、完成图标', colorType: 'functional' },
      { name: '警告色 Warning', color: '#FAAD14', note: '警告信息、需要注意的内容', colorType: 'functional' },
      { name: '错误色 Error', color: '#FF4D4F', note: '错误信息、危险操作', colorType: 'functional' }
    ]
  },
  {
    id: 'default-2',
    name: '项目 A 配色',
    type: 'project',
    colors: [
      { name: '主色', color: '#7C3AED', note: '品牌主视觉', colorType: 'theme' },
      { name: '辅色', color: '#EC4899', note: '点缀色', colorType: 'auxiliary' },
      { name: '背景', color: '#FAF5FF', note: '页面背景', colorType: 'auxiliary' }
    ]
  }
];

export function loadPalettes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return DEFAULT_PALETTES.map((group) => ({
    ...group,
    colors: group.colors.map((color) => ({ ...color }))
  }));
}

export function savePalettes(groups) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {}
}

export function findPaletteGroup(groupId) {
  return loadPalettes().find((group) => group.id === groupId) || null;
}
