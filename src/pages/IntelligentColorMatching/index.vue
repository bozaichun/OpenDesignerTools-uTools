<script lang="ts" setup>
import { ref } from 'vue';
import ChatMode from './ChatMode.vue';
import AdvancedMode from './AdvancedMode.vue';
import ChatHistoryDrawer from './ChatHistoryDrawer.vue';

const pageMode = ref('chat');
const chatInSession = ref(false);
const historyDrawerVisible = ref(false);
const chatModeRef = ref(null);

function handleSessionActive(active) {
  chatInSession.value = active;
}

function handleLoadHistory(session) {
  chatModeRef.value?.loadSession(session);
}

function openHistoryDrawer() {
  historyDrawerVisible.value = true;
}
</script>

<template>
  <div class="module-intelligent">
    <!-- 页头工具：历史会话 + 模式切换 -->
    <Teleport to="#intelligent-color-matching-header-slot">
      <div class="icm-header-tools">
        <button
          v-if="pageMode === 'chat'"
          class="icm-history-btn"
          title="历史会话"
          @click="openHistoryDrawer"
        >
          <span class="iconfont icon-Areality-Collection"></span>
        </button>
        <div v-if="!(pageMode === 'chat' && chatInSession)" class="mode-row">
          <button
            class="mode-btn"
            :class="{ active: pageMode === 'chat' }"
            @click="pageMode = 'chat'"
          >
            问答模式
          </button>
          <button
            class="mode-btn"
            :class="{ active: pageMode === 'advanced' }"
            @click="pageMode = 'advanced'"
          >
            高级模式
          </button>
        </div>
      </div>
    </Teleport>

    <ChatMode
      v-if="pageMode === 'chat'"
      ref="chatModeRef"
      @session-active="handleSessionActive"
    />
    <AdvancedMode v-else />

    <ChatHistoryDrawer
      v-model:visible="historyDrawerVisible"
      @select="handleLoadHistory"
    />
  </div>
</template>

<style lang="scss" scoped>
.module-intelligent {
  width: calc(100% + 40px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px - 36px);
  min-height: calc(100vh - 56px - 36px);
  margin: -20px;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>

<style lang="scss">
.intelligent-color-matching-header-slot .icm-header-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.intelligent-color-matching-header-slot .icm-history-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  .iconfont { font-size: 16px; line-height: 1; }
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.intelligent-color-matching-header-slot .mode-row {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-muted);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}
.intelligent-color-matching-header-slot .mode-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover { color: var(--text-primary); }
  &.active {
    background: var(--accent);
    color: var(--text-invert);
  }
}
</style>
