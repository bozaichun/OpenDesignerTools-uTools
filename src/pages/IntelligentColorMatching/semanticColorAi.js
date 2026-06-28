/**  AI 配色：UI 设计规范生成与解析 */

import {
  finalizeDesignSpec,
  THEME_COLOR_FIELDS,
  FUNCTIONAL_COLOR_TYPES,
  FUNCTIONAL_COLOR_FIELDS,
  AUXILIARY_COLOR_FIELDS,
  NEUTRAL_COLOR_FIELDS,
  SHADOW_FIELDS
} from './semanticDesignSpec.js';

const SEMANTIC_COLOR_SYSTEM_PROMPT = `你是专业 UI 配色设计师。根据用户的情绪调性、行业场景与补充关键词，生成一套完整、可落地的 UI 设计规范配色方案。

必须严格返回 JSON，不要包含 markdown 代码块、解释文字或多余字段：
{
  "name": "方案名称，如温暖科技风",
  "description": "一句话描述配色特点与适用场景",
  "theme": {
    "primary": "#1677FF",
    "primaryHover": "#4096FF",
    "primaryActive": "#0958D9",
    "primaryBg": "#E6F4FF",
    "primaryBorder": "#91CAFF"
  },
  "functional": {
    "success": { "primary": "#22BD14", "hover": "#23CF13", "active": "#15AF07", "bg": "#E8F5E9", "border": "#C8E6C9" },
    "warning": { "primary": "#EBA51B", "hover": "#FAB120", "active": "#DB9200", "bg": "#FFF3E0", "border": "#FFE0B2" },
    "info": { "primary": "#9C9C9C", "hover": "#BBBBBB", "active": "#8A8A8A", "bg": "#F2F2F6", "border": "#E4E4E4" },
    "error": { "primary": "#F05E45", "hover": "#FA755E", "active": "#EB3939", "bg": "#FBE9E7", "border": "#FFC9B8" }
  },
  "auxiliary": {
    "hover": "#F0F1F2",
    "border": "#E4E5E7",
    "divider": "#F0F0F0",
    "bg": "#F3F4F6",
    "white": "#FFFFFF",
    "black": "#000000"
  },
  "neutral": {
    "light": { "title": "#262626", "mainText": "#595959", "secondaryText": "#8C8C8C", "disabledText": "#BFBFBF" },
    "dark": { "title": "#D9D9D9", "mainText": "#A6A6A6", "secondaryText": "#737373", "disabledText": "#4D4D4D" }
  },
  "shadows": {
    "base": "0 6px 10px 0 rgba(0,0,0,0.08), 0 0 1px 0 rgba(0,0,0,0.15)",
    "top": "0px -20px 40px 0px rgba(0,0,0,0.06)",
    "bottom": "0px 20px 40px 0px rgba(0,0,0,0.06)",
    "left": "-20px 0px 40px 0px rgba(0,0,0,0.06)",
    "right": "20px 0px 40px 0px rgba(0,0,0,0.06)"
  }
}

要求：
1. theme、functional、auxiliary、neutral 中所有颜色必须是合法 6 位 HEX
2. functional 必须包含 success、warning、info、error 四类，每类含 primary、hover、active、bg、border
3. neutral 必须分别给出 light 与 dark 两套文本色，保证各自背景下可读
4. shadows 提供 5 种阴影的 CSS box-shadow 值字符串
5. 配色需和谐统一，符合用户指定的情绪与行业特征`;

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function normalizeHex(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return '';
}

function pickHex(source, key) {
  return normalizeHex(source?.[key]);
}

function parseColorGroup(source, fields) {
  const result = {};
  fields.forEach((f) => {
    const hex = pickHex(source, f.key);
    if (!hex) throw new Error(`缺少有效色值：${f.label}`);
    result[f.key] = hex;
  });
  return result;
}

function parseFunctionalColors(source) {
  const result = {};
  FUNCTIONAL_COLOR_TYPES.forEach((type) => {
    result[type.key] = parseColorGroup(source?.[type.key] || {}, FUNCTIONAL_COLOR_FIELDS);
  });
  return result;
}

function parseNeutralColors(source) {
  return {
    light: parseColorGroup(source?.light || {}, NEUTRAL_COLOR_FIELDS),
    dark: parseColorGroup(source?.dark || {}, NEUTRAL_COLOR_FIELDS)
  };
}

function parseShadows(source) {
  const result = {};
  SHADOW_FIELDS.forEach((f) => {
    const val = String(source?.[f.key] || '').trim();
    if (val) result[f.key] = val;
  });
  return result;
}

/** 组装语义配色 AI 请求消息 */
export function buildSemanticAiMessages({ mood, industry, keywords }) {
  const parts = [
    `情绪调性：${mood || '未指定'}`,
    `行业场景：${industry || '未指定'}`
  ];
  if (keywords) parts.push(`补充关键词：${keywords}`);

  return [
    { role: 'system', content: SEMANTIC_COLOR_SYSTEM_PROMPT },
    { role: 'user', content: `请为以下需求生成 UI 设计规范配色方案：\n${parts.join('\n')}` }
  ];
}

/** 解析 AI 返回的 JSON 文本为设计规范结构 */
export function parseSemanticAiResponse(raw) {
  const text = String(raw || '').trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 返回格式无效');

  const data = JSON.parse(jsonMatch[0]);
  const name = String(data.name || '').trim();
  const description = String(data.description || '').trim();
  if (!name) throw new Error('缺少方案名称');

  const parsed = {
    name,
    description,
    theme: parseColorGroup(data.theme || {}, THEME_COLOR_FIELDS),
    functional: parseFunctionalColors(data.functional || {}),
    auxiliary: parseColorGroup(data.auxiliary || {}, AUXILIARY_COLOR_FIELDS),
    neutral: parseNeutralColors(data.neutral || {}),
    shadows: parseShadows(data.shadows || {})
  };

  return finalizeDesignSpec(parsed);
}

export function isValidSemanticHex(hex) {
  return HEX_PATTERN.test(hex);
}
