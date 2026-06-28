<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChatMode from './ChatMode.vue';
import AdvancedMode from './AdvancedMode.vue';
import ChatHistoryDrawer from './ChatHistoryDrawer.vue';

const route = useRoute();
const router = useRouter();

const pageMode = ref('chat');
const chatInSession = ref(false);
const historyDrawerVisible = ref(false);
const chatModeRef = ref(null);

onMounted(() => {
  if (route.query.mode === 'chat') {
    pageMode.value = 'chat';
    router.replace({ path: route.path });
  }
});

function handleSessionActive(active) {
  chatInSession.value = active;
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
</script>

<template>
  <div class="module-intelligent">
    <!-- 页头左侧：模式切换 -->
    <Teleport to="#page-header-leading-slot">
      <div v-if="!(pageMode === 'chat' && chatInSession)" class="mode-row">
        <button
          class="mode-btn"
          :class="{ active: pageMode === 'chat' }"
          title="智能模式"
          @click="pageMode = 'chat'"
        >
          <span class="iconfont icon-Areality-AIMode mode-btn-icon"></span>
        </button>
        <button
          class="mode-btn"
          :class="{ active: pageMode === 'advanced' }"
          title="专业模式"
          @click="pageMode = 'advanced'"
        >
          <span class="iconfont icon-Areality-ProfessionalMode mode-btn-icon"></span>
        </button>
      </div>
    </Teleport>

    <!-- 页头右侧：历史会话 / 新会话 -->
    <Teleport to="#intelligent-color-matching-header-slot">
      <div class="icm-header-tools">
        <button
          v-if="pageMode === 'chat' && chatInSession"
          class="icm-new-session-btn"
          title="新会话"
          @click="handleNewSession"
        >
          新会话
        </button>
        <button
          v-if="pageMode === 'chat' && !chatInSession"
          class="icm-history-btn"
          title="历史会话"
          @click="openHistoryDrawer"
        >
          <span class="iconfont icon-Areality-HistoricalRecord"></span>
        </button>
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
.intelligent-color-matching-header-slot .icm-new-session-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
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
.page-header-leading-slot .mode-row {
  display: inline-flex;
  gap: 2px;
  background: var(--bg-muted);
  padding: 2px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}
.page-header-leading-slot .mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  flex-shrink: 0;
  .mode-btn-icon {
    font-size: 13px;
    line-height: 1;
  }
  &:hover { color: var(--text-primary); }
  &.active {
    background: var(--accent);
    color: var(--text-invert);
  }
}
</style>
