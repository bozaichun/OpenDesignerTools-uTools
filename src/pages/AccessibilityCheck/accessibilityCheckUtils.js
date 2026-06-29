// 色彩对比：WCAG / 色弱模拟 / 政企合规 / 文字叠色 — 计算与详情配置
import { parseColor, rgbToHsl, hslToRgb } from '../../utils/colorUtils';

export const DEFAULT_FG = '#1677FF';
export const DEFAULT_BG = '#FFFFFF';
export const DEFAULT_SIM = '#FF5A5A';
export const DEFAULT_GOV = '#1677FF';
export const DEFAULT_TEXT_BG = '#2563EB';

export const DETAIL_MODULES = [
  {
    id: 'wcag',
    label: 'WCAG 对比度',
    route: '/AccessibilityCheck/WcagDetail',
    description: '区分字号类型，自动判定AA、AAA合规等级'
  },
  {
    id: 'sim',
    label: '色弱色盲模拟',
    route: '/AccessibilityCheck/SimDetail',
    description: '三色弱色盲模拟，配色失效直观可见'
  },
  {
    id: 'gov',
    label: '政企合规',
    route: '/AccessibilityCheck/GovDetail',
    description: '政务欧盟配色，一键优化色彩合规'
  },
  {
    id: 'text',
    label: '文字叠色推荐',
    route: '/AccessibilityCheck/TextDetail',
    description: '依托底色生成AA/AAA合规文字色'
  }
];

export function getDetailModuleDescription(path) {
  const mod = DETAIL_MODULES.find((m) => m.route === path);
  return mod ? mod.description : '';
}

export function hexToRgb(hex) {
  const rgb = parseColor(hex);
  return rgb ? { r: rgb.r, g: rgb.g, b: rgb.b } : { r: 0, g: 0, b: 0 };
}

export function rgbToHexObj({ r, g, b }) {
  const toH = (n) => n.toString(16).padStart(2, '0');
  return ('#' + toH(Math.round(r)) + toH(Math.round(g)) + toH(Math.round(b))).toUpperCase();
}

function srgbToLinear(v) {
  v = v / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrast(fg, bg) {
  const l1 = luminance(hexToRgb(fg));
  const l2 = luminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function protanopia({ r, g, b }) {
  return { r: r * 0.567 + g * 0.433, g: r * 0.558 + g * 0.442, b };
}
function deuteranopia({ r, g, b }) {
  return { r: r * 0.625 + g * 0.375, g: r * 0.7 + g * 0.3, b };
}
function tritanopia({ r, g, b }) {
  return { r, g: g * 0.733 + b * 0.267, b: g * 0.183 + b * 0.817 };
}
function achromatopsia({ r, g, b }) {
  const gv = r * 0.299 + g * 0.587 + b * 0.114;
  return { r: gv, g: gv, b: gv };
}

function adjustTowardNeutral(rgb, target, amount) {
  return {
    r: rgb.r + (target - rgb.r) * amount,
    g: rgb.g + (target - rgb.g) * amount,
    b: rgb.b + (target - rgb.b) * amount
  };
}

export function buildContrastResult(ratio, threshold) {
  if (ratio >= threshold) return { class: 'ok', status: '通过' };
  const gap = threshold - ratio;
  if (gap < 1) return { class: 'warn', status: '接近' };
  return { class: 'fail', status: '不通过' };
}

export function computeWcagSummary(fgColor, bgColor) {
  const ratio = contrast(fgColor, bgColor);
  return {
    ratio,
    resultNormal: buildContrastResult(ratio, 4.5),
    resultLarge: buildContrastResult(ratio, 3)
  };
}

export function computeSimResults(simColor) {
  const rgb = hexToRgb(simColor);
  const variants = [];
  for (let i = 0; i < 8; i++) {
    const adj = adjustTowardNeutral(rgb, 128, i * 0.1);
    variants.push({
      base: rgbToHexObj(adj),
      proto: rgbToHexObj(protanopia(adj)),
      deut: rgbToHexObj(deuteranopia(adj)),
      trita: rgbToHexObj(tritanopia(adj)),
      achro: rgbToHexObj(achromatopsia(adj))
    });
  }
  const main = variants[0];
  return [
    { key: 'normal', label: '正常色觉', hex: main.base, colors: variants.map((v) => v.base) },
    { key: 'proto', label: '红色弱 (Protanopia)', hex: main.proto, colors: variants.map((v) => v.proto) },
    { key: 'deut', label: '绿色弱 (Deuteranopia)', hex: main.deut, colors: variants.map((v) => v.deut) },
    { key: 'trit', label: '蓝黄色弱 (Tritanopia)', hex: main.trita, colors: variants.map((v) => v.trita) },
    { key: 'achro', label: '全色盲 (Achromatopsia)', hex: main.achro, colors: variants.map((v) => v.achro) }
  ];
}

export function computeTextSuggestions(textBgColor) {
  const cand = [
    { name: '纯黑', color: '#000000' },
    { name: '深灰', color: '#1F2937' },
    { name: '纯白', color: '#FFFFFF' },
    { name: '浅灰', color: '#F9FAFB' },
    { name: '暖白', color: '#FFFBEB' }
  ];
  return cand.map((c) => {
    const ratio = contrast(c.color, textBgColor);
    let level = '不合格';
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else if (ratio >= 3) level = 'AA 大字号';
    return { ...c, ratio, level, qualified: level !== '不合格' };
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// 基于底色 HSL 生成 12 种相近叠色
export function computeSimilarStackColors(baseHex, count = 12) {
  const rgb = parseColor(baseHex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb);
  const colors = new Set();
  let i = 0;
  while (colors.size < count && i < count * 4) {
    const offset = i - Math.floor(count / 2);
    const l = clamp(hsl.l + offset * 5, 8, 92);
    const h = (hsl.h + offset * 3 + 360) % 360;
    const s = clamp(hsl.s - Math.abs(offset) * 3, 20, 100);
    colors.add(rgbToHexObj(hslToRgb({ h, s, l })));
    i++;
  }
  return [...colors].slice(0, count);
}

export function runGovCheck(govColor) {
  const hex = govColor.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return {
      checks: [{ title: '格式错误', desc: '请输入合法 HEX 如 #1677FF', pass: false, suggestions: [] }],
      passedCount: 0,
      suggestedColors: []
    };
  }
  const rgb = hexToRgb(hex);
  const toWhite = contrast(hex, '#FFFFFF');
  const toBlack = contrast(hex, '#000000');

  const checks = [
    {
      title: '政务平台冷静色检查',
      desc: '政务平台推荐使用冷静蓝/灰/红，避免过度饱和的高饱和色。',
      pass: rgb.r < 220 || rgb.g < 220 || rgb.b < 220,
      suggestions: ['#1F4E79', '#0D5AA6']
    },
    {
      title: '白底对比度（AA 正文）',
      desc: `对比度 ${toWhite.toFixed(2)}:1，需 ≥4.5:1 方满足正文可读性。`,
      pass: toWhite >= 4.5,
      suggestions: toWhite < 4.5 ? ['#1F4E79', '#2563EB'] : []
    },
    {
      title: '黑底对比度（深色模式）',
      desc: `对比度 ${toBlack.toFixed(2)}:1，需 ≥4.5:1 方可在深色背景上用作文字。`,
      pass: toBlack >= 4.5,
      suggestions: toBlack < 4.5 ? ['#93C5FD', '#A7F3D0'] : []
    },
    {
      title: '欧盟 Web 无障碍（WCAG 2.1 AA）',
      desc: '海外投放需满足 WCAG 2.1 AA 级，建议同时通过大字号与正文对比度。',
      pass: toWhite >= 3 || toBlack >= 3,
      suggestions: ['#1D4ED8', '#065F46']
    },
    {
      title: '品牌色与警示色区分',
      desc: '避免主色与警示红 (#EF4444) / 警告黄 (#F59E0B) 在色弱人群中产生混淆。',
      pass: contrast(hex, '#EF4444') >= 3 || contrast(hex, '#F59E0B') >= 3,
      suggestions: []
    },
    {
      title: '打印色彩预判',
      desc: '高饱和 RGB 色可能在 CMYK 印刷后变暗，需注意印刷稿与屏幕色的色差。',
      pass: !(rgb.r > 230 && rgb.g < 80 && rgb.b < 80),
      suggestions: []
    }
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const set = new Set();
  checks.forEach((c) => {
    if (c.suggestions) c.suggestions.forEach((s) => set.add(s));
  });

  return { checks, passedCount, suggestedColors: [...set] };
}

export const QUICK_PAIRS = [
  { fg: '#FFFFFF', bg: '#1677FF', label: '白-蓝' },
  { fg: '#FFFFFF', bg: '#000000', label: '白-黑' },
  { fg: '#000000', bg: '#FFFFFF', label: '黑-白' },
  { fg: '#333333', bg: '#F5F5F5', label: '深灰-浅灰' },
  { fg: '#FFFFFF', bg: '#EF4444', label: '白-红' },
  { fg: '#000000', bg: '#FCD34D', label: '黑-黄' }
];

export function buildHomeQuery(fg = DEFAULT_FG, bg = DEFAULT_BG, extra = {}) {
  return { fg, bg, sim: DEFAULT_SIM, gov: DEFAULT_GOV, textBg: DEFAULT_TEXT_BG, ...extra };
}

export function readDetailQuery(route) {
  const q = route.query || {};
  return {
    fgColor: q.fg || DEFAULT_FG,
    bgColor: q.bg || DEFAULT_BG,
    simColor: q.sim || DEFAULT_SIM,
    govColor: q.gov || DEFAULT_GOV,
    textBgColor: q.textBg || DEFAULT_TEXT_BG
  };
}

export function buildDetailQuery(state) {
  return {
    fg: state.fgColor,
    bg: state.bgColor,
    sim: state.simColor,
    gov: state.govColor,
    textBg: state.textBgColor
  };
}
