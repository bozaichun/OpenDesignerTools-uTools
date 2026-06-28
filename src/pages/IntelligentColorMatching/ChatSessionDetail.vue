<script lang="ts" setup>
import { computed, ref } from 'vue';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { copyToClipboard, showToast } from '../../utils/colorUtils';
import { sanitizeFileName } from '../../utils/codeGenerator';
import { buildChatMarkdownDocument } from './intelligentColorMatchingUtils';

marked.setOptions({ breaks: true, gfm: true });

const props = defineProps({
  turns: { type: Array, default: () => [] },
  sessionQuestion: { type: String, default: '' },
  isLoading: { type: Boolean, default: false }
});

const threadRef = ref(null);

const lastTurnIndex = computed(() => Math.max(props.turns.length - 1, 0));
const lastTurn = computed(() => props.turns[lastTurnIndex.value] || { user: '', assistant: '' });
const showActionBar = computed(() => !!lastTurn.value.assistant && !props.isLoading);

function isStreamingTurn(index) {
  return index === lastTurnIndex.value && props.isLoading;
}

function getLastReplyElement() {
  return threadRef.value?.querySelector('[data-last-reply="true"]') || null;
}

function renderMarkdown(content) {
  if (!content) return '';
  return DOMPurify.sanitize(marked.parse(content) as string);
}

function handleCopyReply() {
  const content = lastTurn.value.assistant.trim();
  if (!content) return;
  copyToClipboard(content);
  showToast(null, '已复制回复内容', 'success');
}

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    || (document.documentElement.getAttribute('data-theme') !== 'light'
      && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function handleScreenshotReply() {
  const el = getLastReplyElement();
  if (!el) return;

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: isDarkTheme() ? '#1F2937' : '#FFFFFF',
      scale: 2,
      useCORS: true
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast(null, '截图失败，请手动截屏保存', 'warning');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `波仔回复-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast(null, '回复截图已保存', 'success');
    }, 'image/png');
  } catch {
    showToast(null, '截图失败，请手动截屏保存', 'warning');
  }
}

async function handleDownloadMarkdown() {
  const content = buildChatMarkdownDocument(
    props.sessionQuestion,
    lastTurn.value.assistant,
    props.turns
  );
  if (!content.trim()) return;

  const baseName = sanitizeFileName(props.sessionQuestion.slice(0, 24) || '波仔回复');
  const fileName = `${baseName}.md`;

  if (window.utools?.showSaveDialog && window.services?.writeTextToPath) {
    const defaultPath = window.services.getDefaultSavePath?.(fileName) || fileName;
    const savePath = window.utools.showSaveDialog({
      title: '保存 Markdown 文档',
      defaultPath,
      buttonLabel: '保存',
      filters: [{ name: 'Markdown 文档', extensions: ['md'] }]
    });
    if (!savePath) return;
    try {
      window.services.writeTextToPath(content, savePath);
      showToast(null, 'Markdown 文档已保存', 'success');
    } catch {
      showToast(null, '文档保存失败，请重试', 'error');
    }
    return;
  }

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Markdown 文档', accept: { 'text/markdown': ['.md'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      showToast(null, 'Markdown 文档已保存', 'success');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  showToast(null, 'Markdown 文档已下载', 'success');
}
</script>

<template>
  <div ref="threadRef" class="chat-thread">
    <template v-for="(turn, index) in turns" :key="turn.id || index">
      <div class="chat-bubble user-bubble">
        <div class="bubble-label">你</div>
        <div class="bubble-content">{{ turn.user }}</div>
      </div>

      <div class="chat-bubble assistant-bubble">
        <div class="bubble-head">
          <div class="bubble-label">波仔</div>
        </div>
        <div class="bubble-content">
          <span
            v-if="isStreamingTurn(index) && !turn.assistant"
            class="typing-indicator"
          >正在思考...</span>
          <div
            v-else-if="turn.assistant"
            class="reply-markdown markdown-body"
            :data-last-reply="index === lastTurnIndex ? 'true' : null"
          >
            <div v-if="isStreamingTurn(index)" class="reply-streaming">{{ turn.assistant }}</div>
            <div v-else v-html="renderMarkdown(turn.assistant)"></div>
          </div>
          <span
            v-if="isStreamingTurn(index) && turn.assistant"
            class="typing-cursor"
          >|</span>
        </div>

        <!-- 功能栏：仅最后一轮回复完成后显示 -->
        <div v-if="index === lastTurnIndex && showActionBar" class="session-action-bar">
          <button class="session-icon-btn" title="复制" @click="handleCopyReply">
            <span class="iconfont icon-Copy"></span>
          </button>
          <button class="session-icon-btn" title="截图" @click="handleScreenshotReply">
            <span class="iconfont icon-PictureAddition"></span>
          </button>
          <button class="session-icon-btn" title="下载文档" @click="handleDownloadMarkdown">
            <span class="iconfont icon-Areality-Code"></span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.chat-thread {
  padding: 8px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-bubble {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  max-width: 92%;
}
.user-bubble { align-self: flex-end; background: var(--accent-soft); border-color: var(--accent); }
.assistant-bubble {
  align-self: flex-start;
  background: var(--bg-card);
  max-width: 100%;
  width: 100%;
  padding-bottom: 12px;
}
.bubble-head { margin-bottom: 8px; }
.bubble-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); letter-spacing: 0.5px; }
.bubble-content { font-size: 14px; line-height: 1.7; color: var(--text-primary); word-break: break-word; }
.typing-indicator { color: var(--text-tertiary); font-style: italic; }
.typing-cursor { animation: blink 1s step-end infinite; color: var(--accent); }
@keyframes blink { 50% { opacity: 0; } }

.session-action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-primary);
}
.session-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}

.reply-markdown {
  padding: 24px;
  border-radius: var(--radius-md);
}
.reply-streaming {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}
.reply-markdown :deep(h1), .reply-markdown :deep(h2), .reply-markdown :deep(h3), .reply-markdown :deep(h4) {
  font-weight: 600;
  color: var(--text-primary);
  margin: 16px 0 8px;
  line-height: 1.4;
  &:first-child { margin-top: 0; }
}
.reply-markdown :deep(h1) { font-size: 18px; }
.reply-markdown :deep(h2) { font-size: 16px; }
.reply-markdown :deep(h3) { font-size: 15px; }
.reply-markdown :deep(h4) { font-size: 14px; }
.reply-markdown :deep(p) { margin: 0 0 10px; &:last-child { margin-bottom: 0; } }
.reply-markdown :deep(ul), .reply-markdown :deep(ol) { margin: 0 0 10px; padding-left: 20px; }
.reply-markdown :deep(li) { margin-bottom: 4px; }
.reply-markdown :deep(strong), .reply-markdown :deep(b) { font-weight: 600; color: var(--text-primary); }
.reply-markdown :deep(code) {
  padding: 2px 6px;
  background: var(--bg-muted);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: monospace;
}
.reply-markdown :deep(pre) {
  margin: 0 0 12px;
  padding: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow-x: auto;
  code { padding: 0; background: transparent; }
}
.reply-markdown :deep(blockquote) {
  margin: 0 0 10px;
  padding: 8px 12px;
  border-left: 3px solid var(--accent);
  background: var(--bg-muted);
  color: var(--text-secondary);
}
.reply-markdown :deep(table) {
  width: 100%;
  margin: 0 0 12px;
  border-collapse: collapse;
  font-size: 13px;
}
.reply-markdown :deep(th), .reply-markdown :deep(td) {
  padding: 8px 10px;
  border: 1px solid var(--border-primary);
  text-align: left;
}
.reply-markdown :deep(th) {
  background: var(--bg-muted);
  font-weight: 600;
  color: var(--text-primary);
}
.reply-markdown :deep(tr:nth-child(even) td) { background: var(--bg-muted); }
.reply-markdown :deep(hr) {
  margin: 12px 0;
  border: none;
  border-top: 1px dashed var(--border-primary);
}
.reply-markdown :deep(a) { color: var(--accent); text-decoration: none; &:hover { text-decoration: underline; } }
</style>
