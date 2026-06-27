// 调色工具：色阶微调 / 渐变 / 色差比对计算与详情描述
import { parseColor, rgbToHex, rgbToHsl, hslToRgb } from '../../utils/colorUtils';

export const DEFAULT_GRADIENT_STOPS = [
  { color: '#1677FF', position: 0 },
  { color: '#8B5CF6', position: 100 }
];

export const MAX_GRADIENT_STOPS = 3;

export const DEFAULT_GRADIENT_DIRECTION = 'to right';
export const DEFAULT_DIFF_COLOR_B = '#2563EB';

export const DETAIL_MODULES = [
  {
    id: 'adjust',
    label: '色阶微调',
    route: '/ColorTools/AdjustDetail',
    description: '固定色相，微调明度、饱和度，一键生成同色系 9 阶色卡'
  },
  {
    id: 'gradient',
    label: '渐变编辑',
    route: '/ColorTools/GradientDetail',
    description: '双色/多色渐变取色，拆分渐变节点色值，导出 CSS 渐变代码'
  },
  {
    id: 'difference',
    label: '色差比对',
    route: '/ColorTools/DifferenceDetail',
    description: '双色并排预览，精准计算数值色差，适配品牌极小色差管控'
  }
];

export function getDetailModuleDescription(path) {
  const mod = DETAIL_MODULES.find((m) => m.route === path);
  return mod ? mod.description : '';
}

export function rgbToLab({ r, g, b }) {
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.cbrt(z) : 7.787 * z + 16 / 116;
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

export function computeAdjustedColor(hue, saturation, lightness) {
  const rgb = hslToRgb({ h: hue, s: saturation, l: lightness });
  return rgbToHex(rgb).toUpperCase();
}

export function computeAdjustedShades(hue, saturation) {
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800];
  return levels.map((level, idx) => {
    const lightness = 5 + (95 - 5) * (idx / (levels.length - 1));
    const rgb = hslToRgb({ h: hue, s: saturation, l: lightness });
    return { color: rgbToHex(rgb).toUpperCase(), level };
  });
}

export function computeGradientStyle(stops, direction) {
  const sorted = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');
  if (direction === 'circle') {
    return { background: `radial-gradient(circle, ${sorted})` };
  }
  return { background: `linear-gradient(${direction}, ${sorted})` };
}

export function computeGradientCSS(stops, direction) {
  const sorted = stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(',\n    ');
  if (direction === 'circle') {
    return `background: radial-gradient(\n  circle,\n    ${sorted}\n);`;
  }
  return `background: linear-gradient(\n  ${direction},\n    ${sorted}\n);`;
}

export function computeExtractedGradientColors(stops) {
  const sortedStops = stops.slice().sort((a, b) => a.position - b.position);
  if (sortedStops.length === 0) return [];
  const colors = [];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const pos = (i / (count - 1)) * 100;
    let color;
    for (let j = 0; j < sortedStops.length - 1; j++) {
      if (pos >= sortedStops[j].position && pos <= sortedStops[j + 1].position) {
        const span = sortedStops[j + 1].position - sortedStops[j].position;
        const localT = span === 0 ? 0 : (pos - sortedStops[j].position) / span;
        const rgb1 = parseColor(sortedStops[j].color);
        const rgb2 = parseColor(sortedStops[j + 1].color);
        if (rgb1 && rgb2) {
          const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * localT);
          const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * localT);
          const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * localT);
          color = rgbToHex({ r, g, b });
        }
        break;
      }
    }
    if (!color) color = sortedStops[0].color;
    colors.push(String(color).toUpperCase());
  }
  return colors;
}

export function computeDeltaE76(colorA, colorB) {
  const rgbA = parseColor(colorA);
  const rgbB = parseColor(colorB);
  if (!rgbA || !rgbB) return 0;
  const labA = rgbToLab(rgbA);
  const labB = rgbToLab(rgbB);
  return Math.sqrt(
    Math.pow(labA.l - labB.l, 2) +
    Math.pow(labA.a - labB.a, 2) +
    Math.pow(labA.b - labB.b, 2)
  );
}

export function getDeltaEDescription(deltaE) {
  if (deltaE < 1) return '人眼无法分辨';
  if (deltaE < 3) return '专业级可接受';
  if (deltaE < 6) return '中等差异';
  return '明显差异';
}

export function getDeltaEClass(deltaE) {
  if (deltaE < 1) return 'excellent';
  if (deltaE < 3) return 'good';
  if (deltaE < 6) return 'medium';
  return 'poor';
}

export function parseGradientStops(raw) {
  if (!raw) return DEFAULT_GRADIENT_STOPS.map((s) => ({ ...s }));
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 2) {
      return parsed
        .slice(0, MAX_GRADIENT_STOPS)
        .map((s) => ({ color: s.color, position: Number(s.position) }));
    }
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_GRADIENT_STOPS.map((s) => ({ ...s }));
}

export function buildHomeQuery(inputColor, extra = {}) {
  const rgb = parseColor(inputColor) || { r: 22, g: 119, b: 255 };
  const hsl = rgbToHsl(rgb);
  const stops = DEFAULT_GRADIENT_STOPS.map((s, idx) =>
    idx === 0 ? { ...s, color: inputColor } : { ...s }
  );
  return {
    color: inputColor,
    colorB: DEFAULT_DIFF_COLOR_B,
    hue: String(hsl.h),
    sat: String(hsl.s),
    light: String(hsl.l),
    direction: DEFAULT_GRADIENT_DIRECTION,
    stops: JSON.stringify(stops),
    ...extra
  };
}

export function readDetailQuery(route) {
  const q = route.query || {};
  const rgb = parseColor(q.color || '#1677FF');
  const hsl = rgb ? rgbToHsl(rgb) : { h: 215, s: 100, l: 54 };
  return {
    color: q.color || '#1677FF',
    colorB: q.colorB || DEFAULT_DIFF_COLOR_B,
    hue: q.hue != null ? Number(q.hue) : hsl.h,
    sat: q.sat != null ? Number(q.sat) : hsl.s,
    light: q.light != null ? Number(q.light) : hsl.l,
    direction: q.direction || DEFAULT_GRADIENT_DIRECTION,
    stops: parseGradientStops(q.stops)
  };
}

export function buildDetailQuery(state) {
  const stops = state.stops && state.stops.length > 0
    ? state.stops
    : DEFAULT_GRADIENT_STOPS.map((s) => ({ ...s }));
  return {
    color: state.color,
    colorB: state.colorB,
    hue: String(state.hue),
    sat: String(state.sat),
    light: String(state.light),
    direction: state.direction || DEFAULT_GRADIENT_DIRECTION,
    stops: JSON.stringify(stops)
  };
}
