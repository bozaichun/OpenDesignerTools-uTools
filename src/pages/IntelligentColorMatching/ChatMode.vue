<script lang="ts" setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue';
import { showToast } from '../../utils/colorUtils';
import { AI_SYSTEM_PROMPT } from './intelligentColorMatchingUtils';
import { saveChatSession } from './chatHistoryStorage';
import ChatSessionDetail from './ChatSessionDetail.vue';
import ChatSessionShell from './ChatSessionShell.vue';

const emit = defineEmits(['session-active']);

const userInput = ref('');
const userQuestion = ref('');
const assistantReply = ref('');
const isLoading = ref(false);
const hasConversation = ref(false);
const chatBodyRef = ref(null);
const stickToBottom = ref(true);
const showScrollBottomBtn = ref(false);

const INPUT_PLACEHOLDER = '输入你的智能配色问题… · 按 Enter 发送 · Shift+Enter 换行';

let aiRequest = null;

const canSend = computed(() => userInput.value.trim().length > 0 && !isLoading.value);

function scrollToBottom(instant = true) {
  const el = chatBodyRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
}

function handleChatWheel() {
  if (!hasConversation.value) return;
  stickToBottom.value = false;
  showScrollBottomBtn.value = true;
}

function handleScrollToBottomClick() {
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  scrollToBottom(false);
}

function resetConversation() {
  userQuestion.value = '';
  assistantReply.value = '';
  hasConversation.value = false;
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  emit('session-active', false);
}

function handleBackToHome() {
  if (isLoading.value) {
    aiRequest?.abort?.();
    isLoading.value = false;
  }
  resetConversation();
}

function loadSession(session) {
  if (isLoading.value) {
    aiRequest?.abort?.();
    isLoading.value = false;
  }
  userQuestion.value = session.question || '';
  assistantReply.value = session.reply || '';
  hasConversation.value = true;
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  emit('session-active', true);
  nextTick(() => scrollToBottom(true));
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  if (!window.utools?.ai) {
    showToast(null, '请在 uTools 环境中使用 AI 问答功能', 'warning');
    return;
  }

  resetConversation();
  userQuestion.value = text;
  userInput.value = '';
  hasConversation.value = true;
  isLoading.value = true;
  assistantReply.value = '';
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  emit('session-active', true);

  const messages = [
    { role: 'system', content: AI_SYSTEM_PROMPT },
    { role: 'user', content: text }
  ];

  try {
    aiRequest = window.utools.ai({ messages }, (chunk) => {
      if (chunk?.content) {
        assistantReply.value += chunk.content;
        if (stickToBottom.value) {
          nextTick(() => scrollToBottom(true));
        }
      }
    });
    await aiRequest;
    saveChatSession({ question: userQuestion.value, reply: assistantReply.value });
  } catch (err) {
    if (err?.name !== 'AbortError') {
      assistantReply.value = assistantReply.value || '抱歉，回答生成失败，请稍后重试。';
      showToast(null, 'AI 回答失败，请重试', 'error');
    }
  } finally {
    isLoading.value = false;
    aiRequest = null;
    if (stickToBottom.value) {
      await nextTick();
      scrollToBottom(true);
    }
  }
}

function handleStop() {
  aiRequest?.abort?.();
  isLoading.value = false;
  if (assistantReply.value) {
    saveChatSession({ question: userQuestion.value, reply: assistantReply.value });
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

watch(assistantReply, () => {
  if (stickToBottom.value && isLoading.value) {
    nextTick(() => scrollToBottom(true));
  }
});

onUnmounted(() => {
  aiRequest?.abort?.();
  emit('session-active', false);
});

defineExpose({ loadSession });
</script>

<template>
  <div class="chat-mode">
    <ChatSessionShell v-if="hasConversation" @back="handleBackToHome" />

    <div
      ref="chatBodyRef"
      class="chat-body"
      @wheel="handleChatWheel"
    >
      <div v-if="!hasConversation" class="chat-welcome">
        <div class="welcome-avatar">波</div>
        <h2 class="welcome-title">有问题问波仔！</h2>
        <p class="welcome-sub">你的专属设计管家</p>
        <p class="welcome-desc">
          问我语义配色、单色延展、场景定向、去同质化等智能配色问题，我来帮你解答。
        </p>
        <div class="welcome-examples">
          <button class="example-chip" @click="userInput = '帮我设计一套科技互联网、冷静专业风格的完整配色方案'">
            语义 AI 配色
          </button>
          <button class="example-chip" @click="userInput = '主色 #1677FF 如何延展出 9 阶色卡和邻近色？'">
            单色延展建议
          </button>
          <button class="example-chip" @click="userInput = '餐饮行业有哪些差异化、去同质化的配色思路？'">
            去同质化配色
          </button>
        </div>
      </div>

      <ChatSessionDetail
        v-else
        :user-question="userQuestion"
        :assistant-reply="assistantReply"
        :is-loading="isLoading"
      />
    </div>

    <div class="chat-input-area">
      <button
        v-if="showScrollBottomBtn && hasConversation"
        class="scroll-bottom-btn"
        title="回到底部"
        @click="handleScrollToBottomClick"
      >
        <span class="iconfont icon-BackTop scroll-bottom-icon"></span>
      </button>
      <div class="input-wrap">
        <textarea
          v-model="userInput"
          class="chat-textarea"
          :placeholder="INPUT_PLACEHOLDER"
          rows="2"
          :disabled="isLoading"
          @keydown="handleKeydown"
        ></textarea>
        <div class="input-toolbar">
          <button v-if="isLoading" class="send-btn stop-btn" @click="handleStop">停止</button>
          <button v-else class="send-btn" :disabled="!canSend" @click="handleSend">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-mode {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  width: 100%;
  min-width: 0;
  position: relative;
}
.chat-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.chat-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}
.welcome-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-invert);
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.welcome-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; }
.welcome-sub { font-size: 14px; color: var(--accent); margin: 0 0 12px; font-weight: 500; }
.welcome-desc { font-size: 13px; color: var(--text-secondary); max-width: 420px; line-height: 1.6; margin: 0 0 24px; }
.welcome-examples { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 520px; }
.example-chip {
  padding: 8px 14px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.scroll-bottom-btn {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.scroll-bottom-icon {
  display: inline-block;
  transform: rotate(180deg);
  font-size: 16px;
  line-height: 1;
}
.chat-input-area {
  flex-shrink: 0;
  z-index: 10;
  padding: 12px 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
}
.input-wrap {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  &:focus-within { border-color: var(--accent); }
}
.chat-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  min-height: 44px;
  max-height: 120px;
  outline: none;
  font-family: inherit;
  &::placeholder { color: var(--text-tertiary); font-size: 13px; }
  &:disabled { opacity: 0.6; }
}
.input-toolbar { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
.send-btn {
  padding: 8px 18px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}
.stop-btn { background: var(--error); border-color: var(--error); }
</style>
