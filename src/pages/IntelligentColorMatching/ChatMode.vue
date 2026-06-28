<script lang="ts" setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { showToast } from '../../utils/colorUtils';
import { buildAiChatMessages } from './intelligentColorMatchingUtils';
import { saveChatSession } from './chatHistoryStorage';
import ChatSessionDetail from './ChatSessionDetail.vue';
import ChatSessionShell from './ChatSessionShell.vue';

const emit = defineEmits(['session-active']);

const userInput = ref('');
const userQuestion = ref('');
const conversationTurns = ref([]);
const isLoading = ref(false);
const hasConversation = ref(false);
const chatBodyRef = ref(null);
const textareaRef = ref(null);
const inputFieldRef = ref(null);
const clearAnchorRef = ref(null);
const clearTailRef = ref(null);
const clearBtnStyle = ref({ visibility: 'hidden', top: '0', left: '0' });
const stickToBottom = ref(true);
const showScrollBottomBtn = ref(false);

const CLEAR_BTN_GAP = 4;

const INPUT_PLACEHOLDER = '输入你的智能配色问题… · 按 Enter 发送 · Shift+Enter 换行';
const SCROLL_BOTTOM_THRESHOLD = 48;

let aiRequest = null;
let activeTurnIndex = -1;

function createTurn(user, assistant = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user,
    assistant
  };
}

function appendAssistantChunk(turnIndex, chunk) {
  conversationTurns.value = conversationTurns.value.map((turn, index) => {
    if (index !== turnIndex) return turn;
    return { ...turn, assistant: `${turn.assistant || ''}${chunk}` };
  });
}

function setAssistantReply(turnIndex, content) {
  conversationTurns.value = conversationTurns.value.map((turn, index) => {
    if (index !== turnIndex) return turn;
    return { ...turn, assistant: content };
  });
}

const canSend = computed(() => userInput.value.trim().length > 0 && !isLoading.value);
const hasInputContent = computed(() => userInput.value.length > 0);

function handleClearInput() {
  userInput.value = '';
}

function updateClearBtnPosition() {
  nextTick(() => {
    if (!hasInputContent.value || !textareaRef.value || !inputFieldRef.value) {
      clearBtnStyle.value = { visibility: 'hidden', top: '0', left: '0', transform: 'none' };
      return;
    }

    const textarea = textareaRef.value;
    const field = inputFieldRef.value;
    const measureEl = clearTailRef.value || clearAnchorRef.value;
    if (!measureEl) {
      clearBtnStyle.value = { visibility: 'hidden', top: '0', left: '0', transform: 'none' };
      return;
    }

    const fieldRect = field.getBoundingClientRect();
    const measureRect = measureEl.getBoundingClientRect();
    const anchorCenterY = measureRect.top - fieldRect.top - textarea.scrollTop + measureRect.height / 2;

    clearBtnStyle.value = {
      visibility: 'visible',
      top: `${anchorCenterY}px`,
      left: `${measureRect.right - fieldRect.left + CLEAR_BTN_GAP}px`,
      transform: 'translateY(-50%)'
    };
  });
}

function isNearBottom(el) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_BOTTOM_THRESHOLD;
}

function scrollToBottom(instant = true) {
  const el = chatBodyRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
}

function syncScrollBottomState() {
  if (!hasConversation.value) {
    showScrollBottomBtn.value = false;
    return;
  }
  const el = chatBodyRef.value;
  if (!el) return;
  const nearBottom = isNearBottom(el);
  stickToBottom.value = nearBottom;
  showScrollBottomBtn.value = !nearBottom;
}

function handleChatScroll() {
  syncScrollBottomState();
}

function handleScrollToBottomClick() {
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  scrollToBottom(true);
}

function resetConversation() {
  userQuestion.value = '';
  conversationTurns.value = [];
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
  if (Array.isArray(session.turns) && session.turns.length) {
    conversationTurns.value = session.turns.map((turn, index) => ({
      id: turn.id || `loaded-${index}-${Date.now()}`,
      user: turn.user || '',
      assistant: turn.assistant || ''
    }));
    userQuestion.value = conversationTurns.value[0]?.user || session.question || '';
  } else {
    userQuestion.value = session.question || '';
    conversationTurns.value = [createTurn(session.question || '', session.reply || '')];
  }
  hasConversation.value = true;
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  emit('session-active', true);
  nextTick(() => {
    scrollToBottom(true);
    syncScrollBottomState();
  });
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  if (!window.utools?.ai) {
    showToast(null, '请在 uTools 环境中使用 AI 问答功能', 'warning');
    return;
  }

  const isFollowUp = hasConversation.value && conversationTurns.value.length > 0;

  if (!isFollowUp) {
    userQuestion.value = text;
    hasConversation.value = true;
    emit('session-active', true);
    conversationTurns.value = [createTurn(text)];
  } else {
    conversationTurns.value = [...conversationTurns.value, createTurn(text)];
  }

  userInput.value = '';
  isLoading.value = true;
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;

  const turnIndex = conversationTurns.value.length - 1;
  activeTurnIndex = turnIndex;
  const messages = buildAiChatMessages(conversationTurns.value);

  try {
    aiRequest = window.utools.ai({ messages }, (chunk) => {
      if (chunk?.content && activeTurnIndex === turnIndex) {
        appendAssistantChunk(turnIndex, chunk.content);
        if (stickToBottom.value) {
          nextTick(() => scrollToBottom(true));
        }
      }
    });
    await aiRequest;
    if (!conversationTurns.value[turnIndex]?.assistant?.trim()) {
      setAssistantReply(turnIndex, '抱歉，未收到有效回复，请重试。');
    }
    saveChatSession({
      question: userQuestion.value,
      reply: conversationTurns.value[turnIndex].assistant,
      turns: conversationTurns.value
    });
  } catch (err) {
    if (err?.name !== 'AbortError') {
      const fallback = conversationTurns.value[turnIndex]?.assistant?.trim()
        || '抱歉，回答生成失败，请稍后重试。';
      setAssistantReply(turnIndex, fallback);
      showToast(null, 'AI 回答失败，请重试', 'error');
    }
  } finally {
    activeTurnIndex = -1;
    isLoading.value = false;
    aiRequest = null;
    if (stickToBottom.value) {
      await nextTick();
      scrollToBottom(true);
    }
  }
}

function getLastAssistantReply() {
  const turns = conversationTurns.value;
  if (!turns.length) return '';
  return turns[turns.length - 1].assistant || '';
}

function handleStop() {
  aiRequest?.abort?.();
  activeTurnIndex = -1;
  isLoading.value = false;
  if (getLastAssistantReply()) {
    saveChatSession({
      question: userQuestion.value,
      reply: getLastAssistantReply(),
      turns: conversationTurns.value
    });
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

watch(conversationTurns, () => {
  if (stickToBottom.value && isLoading.value) {
    nextTick(() => scrollToBottom(true));
  } else if (hasConversation.value) {
    nextTick(() => syncScrollBottomState());
  }
}, { deep: true });

watch(userInput, () => {
  updateClearBtnPosition();
});

let inputFieldResizeObserver = null;

onMounted(() => {
  updateClearBtnPosition();
  if (inputFieldRef.value && typeof ResizeObserver !== 'undefined') {
    inputFieldResizeObserver = new ResizeObserver(() => updateClearBtnPosition());
    inputFieldResizeObserver.observe(inputFieldRef.value);
  }
});

onUnmounted(() => {
  inputFieldResizeObserver?.disconnect();
  inputFieldResizeObserver = null;
  activeTurnIndex = -1;
  aiRequest?.abort?.();
  emit('session-active', false);
});

defineExpose({ loadSession, resetToHome: handleBackToHome });
</script>

<template>
  <div class="chat-mode">
    <ChatSessionShell
      v-if="hasConversation"
      :session-title="userQuestion"
      @back="handleBackToHome"
    />

    <div
      ref="chatBodyRef"
      class="chat-body"
      @scroll="handleChatScroll"
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
            AI配色
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
        :turns="conversationTurns"
        :session-question="userQuestion"
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
        <div ref="inputFieldRef" class="input-field">
          <div class="textarea-measure" aria-hidden="true">
            <span class="textarea-measure-text">
              <template v-if="userInput.length > 1">
                {{ userInput.slice(0, -1) }}<span ref="clearTailRef" class="textarea-measure-tail">{{ userInput.slice(-1) }}<span ref="clearAnchorRef" class="textarea-measure-anchor"></span></span>
              </template>
              <template v-else>
                <span ref="clearTailRef" class="textarea-measure-tail">{{ userInput }}<span ref="clearAnchorRef" class="textarea-measure-anchor"></span></span>
              </template>
            </span>
          </div>
          <textarea
            ref="textareaRef"
            v-model="userInput"
            class="chat-textarea"
            :placeholder="INPUT_PLACEHOLDER"
            rows="2"
            :disabled="isLoading"
            @keydown="handleKeydown"
            @scroll="updateClearBtnPosition"
          ></textarea>
          <button
            v-if="hasInputContent && !isLoading"
            type="button"
            class="input-clear-btn"
            title="清空"
            :style="clearBtnStyle"
            @mousedown.prevent
            @click="handleClearInput"
          >
            <span class="iconfont icon-Close"></span>
          </button>
        </div>
        <div class="input-toolbar">
          <button
            v-if="isLoading"
            type="button"
            class="input-icon-btn stop-btn"
            title="停止"
            @click="handleStop"
          >
            <span class="iconfont icon-Areality-Stop"></span>
          </button>
          <button
            v-else
            type="button"
            class="input-icon-btn send-icon-btn"
            :disabled="!canSend"
            title="发送"
            @click="handleSend"
          >
            <span class="iconfont icon-Areality-Send"></span>
          </button>
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
  left: 50%;
  bottom: calc(100% + 10px);
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
  position: relative;
  z-index: 10;
  padding: 12px 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
}
.input-wrap {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  &:focus-within { border-color: var(--accent); }
}
.input-field {
  position: relative;
  flex: 1;
  min-width: 0;
}
.textarea-measure {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  visibility: hidden;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
}
.textarea-measure-tail {
  white-space: nowrap;
}
.textarea-measure-anchor {
  display: inline;
  width: 0;
  overflow: hidden;
}
.input-clear-btn {
  position: absolute;
  z-index: 2;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);

  .iconfont {
    font-size: 8px;
    line-height: 1;
  }

  &:hover {
    color: var(--error);
    border-color: var(--error-border);
    background: var(--error-bg);
  }
}
.chat-textarea {
  flex: 1;
  width: 100%;
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
.input-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
.send-icon-btn:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-invert);

  &:hover {
    background: var(--accent-hover, var(--accent));
    border-color: var(--accent-hover, var(--accent));
    color: var(--text-invert);
  }
}
.stop-btn {
  background: var(--error);
  border-color: var(--error);
  color: var(--text-invert);

  &:hover {
    background: var(--error-hover);
    border-color: var(--error-hover);
    color: var(--text-invert);
  }
}
</style>
