// 智能配色：AI 问答系统提示 · 去同质化配色计算
import { parseColor, rgbToHex, rgbToHsl, hslToRgb } from '../../utils/colorUtils';

export const AI_SYSTEM_PROMPT = `你是「波仔」，专业的智能配色与设计管家，服务于「波仔棒 · 颜色值转换器」插件用户。

你的专长：
- 语义 AI 配色：根据情绪调性、行业场景生成完整配色方案
- 单色延展：同色系色阶、邻近色、互补色、三等分色
- 场景定向：海报、APP、PPT、社交媒体、包装等场景配色
- 去同质化：规避行业烂大街配色，输出差异化商业方案

回答要求：
1. 使用简洁中文，结构清晰，必要时用列表
2. 涉及色值时使用 HEX 格式（如 #1677FF），配色需包含主色、辅色、点缀、文字、背景
3. 给出可执行的设计建议，避免空泛
4. 若用户问题与配色设计无关，礼貌引导回相关主题`;

export const ADVANCED_TABS = [
  {
    key: 'semantic',
    label: '语义 AI 配色',
    routeName: 'IcmSemantic',
    headerDesc: '输入关键词情绪一键生成色'
  },
  {
    key: 'monochrome',
    label: '单色延展',
    routeName: 'IcmMonochrome',
    headerDesc: '输入主色一键生成延展配色'
  },
  {
    key: 'scenario',
    label: '场景定向',
    routeName: 'IcmScenario',
    headerDesc: '适配海报APP场景深浅色'
  },
  {
    key: 'unique',
    label: '去同质化',
    routeName: 'IcmUnique',
    headerDesc: '规避行业俗配输出差异化色'
  }
];

/** 是否为专业模式（Profession）下的子路由 */
export function isIcmProfessionRoute(routeName) {
  return ADVANCED_TABS.some((tab) => tab.routeName === routeName);
}

/** 专业模式子页页头说明文案 */
export function getProfessionHeaderDesc(routeName) {
  return ADVANCED_TABS.find((tab) => tab.routeName === routeName)?.headerDesc || '';
}

/** 会话标题截断：超过 maxLen 字以省略号显示 */
export function truncateSessionTitle(text, maxLen = 12) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}...`;
}

/** 导出 Markdown 文档内容 */
export function buildChatMarkdownDocument(question, reply, turns) {
  const timeStr = new Date().toLocaleString('zh-CN', { hour12: false });
  if (Array.isArray(turns) && turns.length) {
    let md = `# 智能配色问答\n\n> 导出时间：${timeStr}\n\n`;
    turns.forEach((turn, index) => {
      const q = (turn.user || '').trim();
      const r = (turn.assistant || '').trim();
      if (!q && !r) return;
      md += `## 第 ${index + 1} 轮\n\n### 问题\n\n${q}\n\n### 波仔回复\n\n${r}\n\n`;
    });
    return md;
  }
  const q = (question || '').trim();
  const r = (reply || '').trim();
  return `# 智能配色问答\n\n> 导出时间：${timeStr}\n\n## 问题\n\n${q}\n\n## 波仔回复\n\n${r}\n`;
}

/** 组装 AI 请求消息（含多轮上下文） */
export function buildAiChatMessages(turns) {
  const messages = [{ role: 'system', content: AI_SYSTEM_PROMPT }];
  (turns || []).forEach((turn) => {
    const userContent = (turn.user || '').trim();
    if (!userContent) return;
    messages.push({ role: 'user', content: userContent });
    const assistantContent = (turn.assistant || '').trim();
    if (assistantContent) {
      messages.push({ role: 'assistant', content: assistantContent });
    }
  });
  return messages;
}

export const AVOID_INDUSTRY_OPTIONS = [
  { key: 'tech', label: '科技行业' },
  { key: 'finance', label: '金融行业' },
  { key: 'ecommerce', label: '电商行业' },
  { key: 'food', label: '餐饮行业' }
];

const UNIQUE_INDUSTRY_META = {
  tech: {
    name: '差异化科技配色',
    description: '规避常规蓝色，使用暖橙/琥珀/深绿等差异化配色',
    hueShift: 150
  },
  finance: {
    name: '差异化金融配色',
    description: '打破红金传统，采用深紫/森林绿/深海蓝',
    hueShift: 270
  },
  ecommerce: {
    name: '差异化电商配色',
    description: '远离橙红黄，使用薄荷绿/粉紫/天青蓝',
    hueShift: 160
  },
  food: {
    name: '差异化餐饮配色',
    description: '跳出食物橙红，使用藏红花/橄榄绿/深陶土',
    hueShift: 40
  }
};

const INDUSTRY_AVOID_DEFS = {
  tech: [
    { name: '科技蓝', hue: 215, s: 82, l: 56 },
    { name: '渐变蓝', hue: 225, s: 78, l: 52 },
    { name: '浅蓝', hue: 210, s: 70, l: 62 },
    { name: '紫蓝', hue: 235, s: 75, l: 58 }
  ],
  finance: [
    { name: '金融红', hue: 0, s: 72, l: 51 },
    { name: '金色', hue: 32, s: 85, l: 52 },
    { name: '稳重蓝', hue: 224, s: 68, l: 40 },
    { name: '深灰', hue: 220, s: 14, l: 28 }
  ],
  ecommerce: [
    { name: '电商橙', hue: 24, s: 88, l: 54 },
    { name: '促销红', hue: 0, s: 84, l: 58 },
    { name: '活力黄', hue: 43, s: 96, l: 56 },
    { name: '商城绿', hue: 160, s: 72, l: 42 }
  ],
  food: [
    { name: '食物红', hue: 6, s: 78, l: 52 },
    { name: '暖橙', hue: 28, s: 86, l: 54 },
    { name: '嫩绿', hue: 145, s: 62, l: 46 },
    { name: '咖啡棕', hue: 25, s: 55, l: 32 }
  ]
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function blend(a, b, ratio) {
  return a + (b - a) * ratio;
}

function hexFromHsl(h, s, l) {
  return rgbToHex(hslToRgb({ h, s, l, a: 1 })).toUpperCase();
}

/** 根据主色与行业生成差异化配色（6 色） */
export function computeUniqueDifferentiatedPalette(baseHex, industryKey) {
  const rgb = parseColor(baseHex);
  const meta = UNIQUE_INDUSTRY_META[industryKey] || UNIQUE_INDUSTRY_META.tech;

  if (!rgb) {
    return { ...meta, colors: [] };
  }

  const hsl = rgbToHsl(rgb);
  const primaryHue = (hsl.h + meta.hueShift) % 360;
  const sat = clamp(hsl.s, 45, 85);
  const light = clamp(hsl.l, 38, 62);

  return {
    ...meta,
    colors: [
      { name: '主色', color: hexFromHsl(primaryHue, sat, light) },
      {
        name: '辅色',
        color: hexFromHsl((primaryHue + 72) % 360, clamp(sat - 10, 35, 80), clamp(light + 8, 45, 70))
      },
      {
        name: '点缀',
        color: hexFromHsl((primaryHue + 168) % 360, clamp(sat + 5, 50, 90), clamp(light - 5, 35, 58))
      },
      { name: '文字', color: hexFromHsl(primaryHue, 12, 18) },
      { name: '背景', color: hexFromHsl(primaryHue, clamp(sat * 0.25, 8, 25), 96) },
      {
        name: '链接',
        color: hexFromHsl((primaryHue + 36) % 360, clamp(sat, 50, 85), clamp(light - 12, 32, 55))
      }
    ]
  };
}

/** 根据主色与行业生成需规避的典型配色（4 色） */
export function computeIndustryAvoidColors(baseHex, industryKey) {
  const defs = INDUSTRY_AVOID_DEFS[industryKey] || INDUSTRY_AVOID_DEFS.tech;
  const rgb = parseColor(baseHex);

  if (!rgb) {
    return defs.map((item) => ({
      name: item.name,
      color: hexFromHsl(item.hue, item.s, item.l)
    }));
  }

  const hsl = rgbToHsl(rgb);

  return defs.map((item) => ({
    name: item.name,
    color: hexFromHsl(
      item.hue,
      clamp(blend(hsl.s, item.s, 0.35), 35, 95),
      clamp(blend(hsl.l, item.l, 0.35), 22, 78)
    )
  }));
}
