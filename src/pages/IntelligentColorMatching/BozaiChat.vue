<script lang="ts" setup>
import { ref, inject, onMounted, onUnmounted } from 'vue';
import ChatMode from './ChatMode.vue';
import ChatHistoryDrawer from './ChatHistoryDrawer.vue';
import { getAllChatSessions } from './chatHistoryStorage';

const setIcmChatInSession = inject('setIcmChatInSession');

const chatInSession = ref(false);
const historyDrawerVisible = ref(false);
const hasHistory = ref(false);
const chatModeRef = ref(null);

function refreshHistoryState() {
  hasHistory.value = getAllChatSessions().length > 0;
}

function handleSessionActive(active) {
  chatInSession.value = active;
  setIcmChatInSession?.(active);
}

function handleLoadHistory(session) {
  chatModeRef.value?.loadSession(session);
}

function openHistoryDrawer() {
  historyDrawerVisible.value = true;
}

function handleNewSession() {
  chatModeRef.value?.resetToHome?.();
}

onMounted(() => {
  refreshHistoryState();
  window.addEventListener('chat-history-changed', refreshHistoryState);
});

onUnmounted(() => {
  window.removeEventListener('chat-history-changed', refreshHistoryState);
  setIcmChatInSession?.(false);
});
</script>

<template>
  <div class="icm-sub-page">
    <!-- 页头右侧：历史会话 / 新会话 -->
    <Teleport to="#intelligent-color-matching-header-slot">
      <div class="icm-header-tools">
        <button
          v-if="chatInSession"
          class="icm-new-session-btn"
          title="新会话"
          @click="handleNewSession"
        >
          新会话
        </button>
        <button
          v-else-if="hasHistory"
          class="icm-history-btn"
          title="历史会话"
          @click="openHistoryDrawer"
        >
          <span class="iconfont icon-Areality-HistoricalRecord"></span>
        </button>
      </div>
    </Teleport>

    <ChatMode
      ref="chatModeRef"
      @session-active="handleSessionActive"
    />

    <ChatHistoryDrawer
      v-model:visible="historyDrawerVisible"
      @select="handleLoadHistory"
    />
  </div>
</template>

<style lang="scss" scoped>
.icm-sub-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
