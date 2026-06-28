<script lang="ts" setup>
import { computed, ref } from 'vue';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { copyToClipboard, showToast } from '../../utils/colorUtils';

marked.setOptions({ breaks: true, gfm: true });

const props = defineProps({
  userQuestion: { type: String, default: '' },
  assistantReply: { type: String, default: '' },
  isLoading: { type: Boolean, default: false }
});

const replyRef = ref(null);

const renderedReply = computed(() => {
  if (!props.assistantReply) return '';
  return DOMPurify.sanitize(marked.parse(props.assistantReply) as string);
});

const showActionBar = computed(() => props.assistantReply && !props.isLoading);

function handleCopyReply() {
  const content = props.assistantReply.trim();
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
  const el = replyRef.value;
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
</script>

<template>
  <div class="chat-thread">
    <div class="chat-bubble user-bubble">
      <div class="bubble-label">你</div>
      <div class="bubble-content">{{ userQuestion }}</div>
    </div>

    <div class="chat-bubble assistant-bubble">
      <div class="bubble-head">
        <div class="bubble-label">波仔</div>
      </div>
      <div class="bubble-content">
        <span v-if="!assistantReply && isLoading" class="typing-indicator">正在思考...</span>
        <div v-else ref="replyRef" class="reply-markdown markdown-body" v-html="renderedReply"></div>
        <span v-if="isLoading && assistantReply" class="typing-cursor">|</span>
      </div>

      <!-- 功能栏：复制 / 截图 -->
      <div v-if="showActionBar" class="session-action-bar">
        <button class="session-icon-btn" title="复制" @click="handleCopyReply">
          <span class="iconfont icon-Copy"></span>
        </button>
        <button class="session-icon-btn" title="截图" @click="handleScreenshotReply">
          <span class="iconfont icon-PictureAddition"></span>
        </button>
      </div>
    </div>
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
  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    font-weight: 600;
    color: var(--text-primary);
    margin: 16px 0 8px;
    line-height: 1.4;
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: 18px; }
  :deep(h2) { font-size: 16px; }
  :deep(h3) { font-size: 15px; }
  :deep(h4) { font-size: 14px; }
  :deep(p) { margin: 0 0 10px; &:last-child { margin-bottom: 0; } }
  :deep(ul), :deep(ol) { margin: 0 0 10px; padding-left: 20px; }
  :deep(li) { margin-bottom: 4px; }
  :deep(strong), :deep(b) { font-weight: 600; color: var(--text-primary); }
  :deep(code) {
    padding: 2px 6px;
    background: var(--bg-muted);
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-family: monospace;
  }
  :deep(pre) {
    margin: 0 0 12px;
    padding: 12px;
    background: var(--bg-muted);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    overflow-x: auto;
    code { padding: 0; background: transparent; }
  }
  :deep(blockquote) {
    margin: 0 0 10px;
    padding: 8px 12px;
    border-left: 3px solid var(--accent);
    background: var(--bg-muted);
    color: var(--text-secondary);
  }
  :deep(table) {
    width: 100%;
    margin: 0 0 12px;
    border-collapse: collapse;
    font-size: 13px;
  }
  :deep(th), :deep(td) {
    padding: 8px 10px;
    border: 1px solid var(--border-primary);
    text-align: left;
  }
  :deep(th) {
    background: var(--bg-muted);
    font-weight: 600;
    color: var(--text-primary);
  }
  :deep(tr:nth-child(even) td) { background: var(--bg-muted); }
  :deep(hr) {
    margin: 12px 0;
    border: none;
    border-top: 1px dashed var(--border-primary);
  }
  :deep(a) { color: var(--accent); text-decoration: none; &:hover { text-decoration: underline; } }
}
</style>
