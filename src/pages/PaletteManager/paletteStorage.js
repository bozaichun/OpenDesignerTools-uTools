// 色板分组 localStorage 读写（新用户默认为空）
export const STORAGE_KEY = 'color_palette_manager_v1';

export function loadPalettes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

export function savePalettes(groups) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {}
}

export function findPaletteGroup(groupId) {
  return loadPalettes().find((group) => group.id === groupId) || null;
}
