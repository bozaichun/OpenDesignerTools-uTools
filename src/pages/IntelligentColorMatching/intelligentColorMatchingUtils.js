// 智能配色：AI 问答系统提示
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
  { key: 'semantic', label: '语义 AI 配色' },
  { key: 'monochrome', label: '单色延展' },
  { key: 'scenario', label: '场景定向' },
  { key: 'unique', label: '去同质化' }
];

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
