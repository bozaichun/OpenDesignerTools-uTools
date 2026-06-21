import { parseColor } from '../../utils/colorUtils';

export const DETAIL_MODULES = [
  {
    id: 'cmyk',
    label: 'CMYK 校准',
    route: '/PrintTools/CmykDetail',
    description: 'RGB/HEX 转带 ICC 配置 CMYK，预览印刷色差与溢色预警'
  },
  {
    id: 'pantone',
    label: '潘通匹配',
    route: '/PrintTools/PantoneDetail',
    description: '基于当前颜色自动匹配最接近的潘通色号'
  },
  {
    id: 'overprint',
    label: '叠印预览',
    route: '/PrintTools/OverprintPreviewDetail',
    description: '主色作为底层，可调整叠印色与透明度预览印刷叠加效果'
  },
  {
    id: 'screenTint',
    label: '网点换算',
    route: '/PrintTools/ScreenTintConverDetail',
    description: '基于当前主色换算各网点百分比对应色值，适配画册、包装印刷制版'
  }
];

export function getDetailModuleDescription(path, query = {}) {
  const mod = DETAIL_MODULES.find((m) => m.route === path);
  if (!mod) return '';
  if (path === '/PrintTools/PantoneDetail') {
    const paperLabel = query.paper === 'uncoated' ? '胶版纸' : '铜版纸';
    return mod.description + '（' + paperLabel + '）';
  }
  return mod.description;
}

export const PANTONE_COATED = [
  { code: 'PANTONE Yellow C', name: '潘通黄 C', hex: '#FFCD00', lab: { l: 88, a: -6, b: 110 } },
  { code: 'PANTONE Orange 021 C', name: '潘通橙 021 C', hex: '#FF6A13', lab: { l: 61, a: 61, b: 74 } },
  { code: 'PANTONE Warm Red C', name: '潘通暖红 C', hex: '#E4002B', lab: { l: 48, a: 68, b: 41 } },
  { code: 'PANTONE Red 032 C', name: '潘通红 032 C', hex: '#EF3340', lab: { l: 52, a: 66, b: 39 } },
  { code: 'PANTONE Rubine Red C', name: '潘通宝石红 C', hex: '#C62168', lab: { l: 44, a: 66, b: 14 } },
  { code: 'PANTONE Rhodamine Red C', name: '潘通玫瑰红 C', hex: '#E0006F', lab: { l: 49, a: 72, b: 17 } },
  { code: 'PANTONE Purple C', name: '潘通紫 C', hex: '#7D2181', lab: { l: 35, a: 48, b: -42 } },
  { code: 'PANTONE Violet C', name: '潘通紫罗兰 C', hex: '#4A2572', lab: { l: 25, a: 36, b: -47 } },
  { code: 'PANTONE Blue 072 C', name: '潘通蓝 072 C', hex: '#004F71', lab: { l: 25, a: 2, b: -45 } },
  { code: 'PANTONE Reflex Blue C', name: '潘通反射蓝 C', hex: '#002F87', lab: { l: 22, a: 34, b: -74 } },
  { code: 'PANTONE Process Blue C', name: '潘通四色蓝 C', hex: '#007CC3', lab: { l: 48, a: 3, b: -62 } },
  { code: 'PANTONE 300 C', name: '潘通 300 C', hex: '#00A1E4', lab: { l: 63, a: -20, b: -52 } },
  { code: 'PANTONE Green C', name: '潘通绿 C', hex: '#00A878', lab: { l: 61, a: -46, b: 37 } },
  { code: 'PANTONE 375 C', name: '潘通 375 C', hex: '#CFE02A', lab: { l: 85, a: -18, b: 90 } },
  { code: 'PANTONE Yellow 012 C', name: '潘通黄 012 C', hex: '#FFB61F', lab: { l: 78, a: 14, b: 91 } },
  { code: 'PANTONE 185 C', name: '潘通 185 C', hex: '#C8102E', lab: { l: 46, a: 64, b: 46 } },
  { code: 'PANTONE 186 C', name: '潘通 186 C', hex: '#A6192E', lab: { l: 39, a: 56, b: 35 } },
  { code: 'PANTONE 286 C', name: '潘通 286 C', hex: '#1D2860', lab: { l: 16, a: 25, b: -62 } },
  { code: 'PANTONE 3005 C', name: '潘通 3005 C', hex: '#0033A0', lab: { l: 22, a: 36, b: -79 } },
  { code: 'PANTONE 362 C', name: '潘通 362 C', hex: '#006749', lab: { l: 35, a: -28, b: 35 } }
];

export const PANTONE_UNCOATED = [
  { code: 'PANTONE Yellow U', name: '潘通黄 U', hex: '#FFD100', lab: { l: 89, a: -5, b: 108 } },
  { code: 'PANTONE Orange 021 U', name: '潘通橙 021 U', hex: '#FF7A18', lab: { l: 63, a: 58, b: 72 } },
  { code: 'PANTONE Red 032 U', name: '潘通红 032 U', hex: '#F04A3D', lab: { l: 54, a: 62, b: 38 } },
  { code: 'PANTONE Blue 072 U', name: '潘通蓝 072 U', hex: '#00557C', lab: { l: 27, a: 0, b: -42 } },
  { code: 'PANTONE Reflex Blue U', name: '潘通反射蓝 U', hex: '#003D87', lab: { l: 24, a: 32, b: -70 } },
  { code: 'PANTONE Process Blue U', name: '潘通四色蓝 U', hex: '#0085CF', lab: { l: 50, a: 0, b: -58 } },
  { code: 'PANTONE Green U', name: '潘通绿 U', hex: '#00B087', lab: { l: 63, a: -44, b: 35 } },
  { code: 'PANTONE Purple U', name: '潘通紫 U', hex: '#822A85', lab: { l: 37, a: 46, b: -40 } },
  { code: 'PANTONE 185 U', name: '潘通 185 U', hex: '#CB1A32', lab: { l: 47, a: 62, b: 44 } },
  { code: 'PANTONE 286 U', name: '潘通 286 U', hex: '#222E68', lab: { l: 18, a: 24, b: -58 } }
];

export function rgbToLab({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116);
  y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116);
  z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116);
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

export function deltaE(lab1, lab2) {
  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

export function computeCmykResult(inputColor) {
  const rgb = parseColor(inputColor);
  if (!rgb) return { c: 0, m: 0, y: 0, k: 0, outOfGamut: false };
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100, outOfGamut: false };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  const outOfGamut = (r * 299 + g * 587 + b * 114) / 1000 > 230 ||
    (r > 0.95 && g > 0.95 && b > 0.95);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
    outOfGamut
  };
}

export function computeCmykConvertedHex(cmykResult) {
  const { c, m, y, k } = cmykResult;
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase();
}

export function computePantoneResults(inputColor, pantonePaperType) {
  const rgb = parseColor(inputColor);
  if (!rgb) return [];
  const lab = rgbToLab(rgb);
  const palette = pantonePaperType === 'coated' ? PANTONE_COATED : PANTONE_UNCOATED;
  const results = palette.map(p => ({
    ...p,
    deltaE: deltaE(lab, p.lab)
  }));
  results.sort((a, b) => a.deltaE - b.deltaE);
  return results.slice(0, 5);
}

export function computeOverprintMixed(inputColor, overprintColorB, overprintOpacity) {
  const rgbA = parseColor(inputColor);
  const rgbB = parseColor(overprintColorB);
  if (!rgbA || !rgbB) return { hex: inputColor, style: { background: inputColor } };
  const alpha = overprintOpacity / 100;
  const r = Math.round(rgbA.r * (1 - alpha) + rgbB.r * alpha);
  const g = Math.round(rgbA.g * (1 - alpha) + rgbB.g * alpha);
  const b = Math.round(rgbA.b * (1 - alpha) + rgbB.b * alpha);
  const toHex = (n) => n.toString(16).padStart(2, '0');
  const hex = ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase();
  return { hex, style: { background: hex } };
}

export function computeHalftoneLevels(inputColor) {
  const rgb = parseColor(inputColor);
  if (!rgb) return [];
  const levels = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  return levels.map(pct => {
    const factor = pct / 100;
    const r = Math.round(255 - (255 - rgb.r) * factor);
    const g = Math.round(255 - (255 - rgb.g) * factor);
    const b = Math.round(255 - (255 - rgb.b) * factor);
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return {
      percent: pct,
      color: ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase(),
      rgb: { r, g, b }
    };
  });
}

export function buildDetailQuery(vm, extra = {}) {
  return {
    color: vm.draftColor,
    profile: vm.draftProfile,
    paper: vm.draftPaper,
    colorB: vm.draftColorB,
    opacity: vm.draftOpacity,
    useDPI: vm.draftUseDPI ? '1' : '0',
    dpi: vm.draftDPI,
    ...extra
  };
}

export function readDetailQuery(route) {
  const q = route.query || {};
  return {
    color: q.color || '#1677FF',
    profile: q.profile || 'srgb',
    paper: q.paper || 'coated',
    colorB: q.colorB || '#FFFFFF',
    opacity: q.opacity ? Number(q.opacity) : 70,
    useDPI: q.useDPI === '1',
    dpi: q.dpi || '175'
  };
}
