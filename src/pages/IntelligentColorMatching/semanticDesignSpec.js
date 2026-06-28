/** UI 设计规范：固定 Token（描边 / 间距 / 圆角 / 字阶）与 Markdown 导出 */

export const DESIGN_SPEC_STROKES = [
  { key: '0.5', label: '0.5', value: '0.5px' },
  { key: '1', label: '1', value: '1px' },
  { key: '2', label: '2', value: '2px' },
  { key: '4', label: '4', value: '4px' }
];

export const DESIGN_SPEC_SPACING = [
  { key: '0', label: '0', value: 0 },
  { key: '4', label: '4', value: 4 },
  { key: '8', label: '8', value: 8 },
  { key: '12', label: '12', value: 12 },
  { key: '16', label: '16', value: 16 },
  { key: '20', label: '20', value: 20 },
  { key: '32', label: '32', value: 32 },
  { key: '48', label: '48', value: 48 }
];

export const DESIGN_SPEC_RADIUS = [
  { key: '4', label: '4', value: 4 },
  { key: '6', label: '6', value: 6 },
  { key: '12', label: '12', value: 12 },
  { key: '20', label: '20', value: 20 },
  { key: '100', label: '100', value: 100 }
];

export const DESIGN_SPEC_TYPOGRAPHY = [
  { size: 12, lineHeight: 20 },
  { size: 14, lineHeight: 22 },
  { size: 16, lineHeight: 24 },
  { size: 20, lineHeight: 28 },
  { size: 24, lineHeight: 32 },
  { size: 30, lineHeight: 38 },
  { size: 38, lineHeight: 46 },
  { size: 46, lineHeight: 54 },
  { size: 56, lineHeight: 64 },
  { size: 68, lineHeight: 76 }
];

export const THEME_COLOR_FIELDS = [
  { key: 'primary', label: '主色' },
  { key: 'primaryHover', label: '悬停色' },
  { key: 'primaryActive', label: '激活色' },
  { key: 'primaryBg', label: '背景色' },
  { key: 'primaryBorder', label: '边框色' }
];

export const FUNCTIONAL_COLOR_TYPES = [
  { key: 'success', label: '成功色' },
  { key: 'warning', label: '警告色' },
  { key: 'info', label: '信息色' },
  { key: 'error', label: '错误色' }
];

export const FUNCTIONAL_COLOR_FIELDS = [
  { key: 'primary', label: '主色' },
  { key: 'hover', label: '悬停色' },
  { key: 'active', label: '激活色' },
  { key: 'bg', label: '背景色' },
  { key: 'border', label: '边框色' }
];

export const AUXILIARY_COLOR_FIELDS = [
  { key: 'hover', label: '悬停色' },
  { key: 'border', label: '边框色' },
  { key: 'divider', label: '分隔线' },
  { key: 'bg', label: '背景色' },
  { key: 'white', label: '纯白' },
  { key: 'black', label: '纯黑' }
];

export const NEUTRAL_COLOR_FIELDS = [
  { key: 'title', label: '标题' },
  { key: 'mainText', label: '正文（主要）' },
  { key: 'secondaryText', label: '正文（次要）' },
  { key: 'disabledText', label: '禁用文本' }
];

export const SHADOW_FIELDS = [
  { key: 'base', label: '基础阴影' },
  { key: 'top', label: '上阴影' },
  { key: 'bottom', label: '下阴影' },
  { key: 'left', label: '左阴影' },
  { key: 'right', label: '右阴影' }
];

const DEFAULT_SHADOWS = {
  base: '0 6px 10px 0 rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.15)',
  top: '0px -20px 40px 0px rgba(0, 0, 0, 0.06)',
  bottom: '0px 20px 40px 0px rgba(0, 0, 0, 0.06)',
  left: '-20px 0px 40px 0px rgba(0, 0, 0, 0.06)',
  right: '20px 0px 40px 0px rgba(0, 0, 0, 0.06)'
};

function mdColorRow(label, value) {
  return `| ${label} | \`${value}\` |`;
}

function mdColorTable(rows) {
  return ['| 名称 | 色值 |', '| --- | --- |', ...rows].join('\n');
}

/** 导出 UI 设计规范 Markdown 文档 */
export function buildSemanticDesignSpecMarkdown(spec) {
  if (!spec) return '';

  const timeStr = new Date().toLocaleString('zh-CN', { hour12: false });
  const lines = [
    `# ${spec.name}`,
    '',
    `> ${spec.description || ''}`,
    '',
    `> 导出时间：${timeStr}`,
    ''
  ];

  lines.push('## 主题色', '', mdColorTable(
    THEME_COLOR_FIELDS.map((f) => mdColorRow(f.label, spec.theme?.[f.key] || '-'))
  ), '');

  FUNCTIONAL_COLOR_TYPES.forEach((type) => {
    const group = spec.functional?.[type.key] || {};
    lines.push(`## ${type.label}`, '', mdColorTable(
      FUNCTIONAL_COLOR_FIELDS.map((f) => mdColorRow(f.label, group[f.key] || '-'))
    ), '');
  });

  lines.push('## 辅助色', '', mdColorTable(
    AUXILIARY_COLOR_FIELDS.map((f) => mdColorRow(f.label, spec.auxiliary?.[f.key] || '-'))
  ), '');

  ['light', 'dark'].forEach((mode) => {
    const modeLabel = mode === 'light' ? '浅色模式' : '深色模式';
    const group = spec.neutral?.[mode] || {};
    lines.push(`## 中性色 · ${modeLabel}`, '', mdColorTable(
      NEUTRAL_COLOR_FIELDS.map((f) => mdColorRow(f.label, group[f.key] || '-'))
    ), '');
  });

  lines.push('## 阴影', '', '| 名称 | box-shadow |', '| --- | --- |');
  SHADOW_FIELDS.forEach((f) => {
    lines.push(`| ${f.label} | \`${spec.shadows?.[f.key] || DEFAULT_SHADOWS[f.key]}\` |`);
  });
  lines.push('');

  lines.push('## 描边', '', '| 规格 | 值 |', '| --- | --- |');
  DESIGN_SPEC_STROKES.forEach((s) => lines.push(`| ${s.label} | ${s.value} |`));
  lines.push('');

  lines.push('## 间距', '', '| 规格 | 值 |', '| --- | --- |');
  DESIGN_SPEC_SPACING.forEach((s) => lines.push(`| ${s.label} | ${s.value}px |`));
  lines.push('');

  lines.push('## 圆角', '', '| 规格 | 值 |', '| --- | --- |');
  DESIGN_SPEC_RADIUS.forEach((r) => lines.push(`| ${r.label} | ${r.value}px |`));
  lines.push('');

  lines.push('## 字阶与行高', '', '| 字号 | 行高 |', '| --- | --- |');
  DESIGN_SPEC_TYPOGRAPHY.forEach((t) => lines.push(`| ${t.size}px | ${t.lineHeight}px |`));
  lines.push('');

  return lines.join('\n');
}

function cssVarLine(name, value, comment) {
  const suffix = comment ? ` /* ${comment} */` : '';
  return `  ${name}: ${value};${suffix}`;
}

/** 导出 UI 设计规范 CSS 设计稿 */
export function buildSemanticDesignSpecCss(spec) {
  if (!spec) return '';

  const timeStr = new Date().toLocaleString('zh-CN', { hour12: false });
  const t = spec.theme || {};
  const lines = [
    '/* ============================================================',
    `   UI 设计规范 · ${spec.name}`,
    `   ${spec.description || ''}`,
    `   生成时间：${timeStr}`,
    '   ============================================================ */',
    '',
    ':root {',
    '  /* 主题色 */',
    cssVarLine('--primary', t.primary, '主色'),
    cssVarLine('--primary-hover', t.primaryHover, '悬停色'),
    cssVarLine('--primary-active', t.primaryActive, '激活色'),
    cssVarLine('--primary-bg', t.primaryBg, '背景色'),
    cssVarLine('--primary-border', t.primaryBorder, '边框色'),
    ''
  ];

  FUNCTIONAL_COLOR_TYPES.forEach((type) => {
    const group = spec.functional?.[type.key] || {};
    lines.push(`  /* ${type.label} */`);
    lines.push(cssVarLine(`--${type.key}`, group.primary, '主色'));
    lines.push(cssVarLine(`--${type.key}-hover`, group.hover, '悬停色'));
    lines.push(cssVarLine(`--${type.key}-active`, group.active, '激活色'));
    lines.push(cssVarLine(`--${type.key}-bg`, group.bg, '背景色'));
    lines.push(cssVarLine(`--${type.key}-border`, group.border, '边框色'));
    lines.push('');
  });

  const aux = spec.auxiliary || {};
  lines.push('  /* 辅助色 */');
  lines.push(cssVarLine('--hover', aux.hover, '悬停色'));
  lines.push(cssVarLine('--border', aux.border, '边框色'));
  lines.push(cssVarLine('--divider', aux.divider, '分隔线'));
  lines.push(cssVarLine('--bg', aux.bg, '背景色'));
  lines.push(cssVarLine('--white', aux.white, '纯白'));
  lines.push(cssVarLine('--black', aux.black, '纯黑'));
  lines.push('');

  const light = spec.neutral?.light || {};
  lines.push('  /* 中性色 · 浅色模式 */');
  lines.push(cssVarLine('--title', light.title, '标题'));
  lines.push(cssVarLine('--main-text', light.mainText, '正文（主要）'));
  lines.push(cssVarLine('--secondary-text', light.secondaryText, '正文（次要）'));
  lines.push(cssVarLine('--disabled-text', light.disabledText, '禁用文本'));
  lines.push('');

  SHADOW_FIELDS.forEach((field) => {
    const key = field.key === 'base' ? '--shadow' : `--shadow-${field.key}`;
    lines.push(cssVarLine(key, spec.shadows?.[field.key] || DEFAULT_SHADOWS[field.key], field.label));
  });
  lines.push('');

  (spec.strokes || DESIGN_SPEC_STROKES).forEach((stroke) => {
    const key = stroke.key === '0.5' ? '--size-line' : `--size-${stroke.key}`;
    lines.push(cssVarLine(key, stroke.value, `描边 ${stroke.label}`));
  });
  lines.push('');

  (spec.spacing || DESIGN_SPEC_SPACING).forEach((space) => {
    lines.push(cssVarLine(`--size-${space.key}`, `${space.value}px`, `间距 ${space.label}`));
  });
  lines.push('');

  (spec.radius || DESIGN_SPEC_RADIUS).forEach((radius) => {
    lines.push(cssVarLine(`--radius-${radius.key}`, `${radius.value}px`, `圆角 ${radius.label}`));
  });
  lines.push('');

  (spec.typography || DESIGN_SPEC_TYPOGRAPHY).forEach((item) => {
    lines.push(cssVarLine(`--fs-${item.size}`, `${item.size}px`, `字阶 ${item.size}/${item.lineHeight}`));
    lines.push(cssVarLine(`--lh-${item.size}`, `${item.lineHeight}px`, ''));
  });

  lines.push('}');
  lines.push('');

  const dark = spec.neutral?.dark || {};
  lines.push('[data-theme="dark"] {');
  lines.push('  /* 中性色 · 深色模式 */');
  lines.push(cssVarLine('--title', dark.title, '标题'));
  lines.push(cssVarLine('--main-text', dark.mainText, '正文（主要）'));
  lines.push(cssVarLine('--secondary-text', dark.secondaryText, '正文（次要）'));
  lines.push(cssVarLine('--disabled-text', dark.disabledText, '禁用文本'));
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

/** 合并 AI 返回与固定 Token，补全 shadows 默认值 */
function normalizeFunctionalGroups(functional) {
  if (!functional || typeof functional !== 'object' || Array.isArray(functional)) return {};

  const result = {};
  FUNCTIONAL_COLOR_TYPES.forEach(({ key }) => {
    const group = functional[key];
    if (group && typeof group === 'object' && !Array.isArray(group)) {
      result[key] = { ...group };
    }
  });
  return result;
}

export function finalizeDesignSpec(parsed, { streaming = false } = {}) {
  const theme = parsed.theme && typeof parsed.theme === 'object' ? parsed.theme : {};
  const auxiliary = parsed.auxiliary && typeof parsed.auxiliary === 'object' ? parsed.auxiliary : {};
  const neutralLight = parsed.neutral?.light && typeof parsed.neutral.light === 'object'
    ? parsed.neutral.light
    : {};
  const neutralDark = parsed.neutral?.dark && typeof parsed.neutral.dark === 'object'
    ? parsed.neutral.dark
    : {};

  return {
    name: parsed.name || '',
    description: parsed.description || '',
    theme: { ...theme },
    functional: normalizeFunctionalGroups(parsed.functional),
    auxiliary: { ...auxiliary },
    neutral: {
      light: { ...neutralLight },
      dark: { ...neutralDark }
    },
    shadows: streaming
      ? { ...(parsed.shadows || {}) }
      : { ...DEFAULT_SHADOWS, ...(parsed.shadows || {}) },
    strokes: DESIGN_SPEC_STROKES,
    spacing: DESIGN_SPEC_SPACING,
    radius: DESIGN_SPEC_RADIUS,
    typography: DESIGN_SPEC_TYPOGRAPHY
  };
}
