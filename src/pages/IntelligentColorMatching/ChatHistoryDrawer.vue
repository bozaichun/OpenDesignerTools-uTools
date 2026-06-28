<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Drawer from '../../components/Drawer.vue';
import {
  getAllChatSessions,
  removeChatSession,
  formatSessionTime
} from './chatHistoryStorage';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible', 'select']);

const sessions = ref([]);

function refreshSessions() {
  sessions.value = getAllChatSessions();
}

function handleClose() {
  emit('update:visible', false);
}

function handleSelect(session) {
  emit('select', session);
  handleClose();
}

function handleDelete(session, e) {
  e.stopPropagation();
  removeChatSession(session);
  refreshSessions();
}

onMounted(() => {
  refreshSessions();
  window.addEventListener('chat-history-changed', refreshSessions);
});

onUnmounted(() => {
  window.removeEventListener('chat-history-changed', refreshSessions);
});

defineExpose({ refreshSessions });
</script>

<template>
  <Drawer
    :visible="visible"
    title="历史会话"
    placement="right"
    width="360px"
    @update:visible="emit('update:visible', $event)"
    @close="handleClose"
  >
    <div v-if="!sessions.length" class="history-empty">
      <span class="iconfont icon-Prompt history-empty-icon"></span>
      <p>暂无历史会话</p>
      <span class="history-empty-tip">完成一次问答后将自动保存</span>
    </div>

    <ul v-else class="history-list">
      <li
        v-for="item in sessions"
        :key="item.id"
        class="history-item"
        @click="handleSelect(item)"
      >
        <div class="history-item-main">
          <div class="history-item-title">{{ item.preview }}</div>
          <div class="history-item-time">{{ formatSessionTime(item.createdAt) }}</div>
        </div>
        <button class="history-item-delete" title="删除" @click="handleDelete(item, $event)">
          <span class="iconfont icon-Failure"></span>
        </button>
      </li>
    </ul>
  </Drawer>
</template>

<style lang="scss" scoped>
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: var(--text-secondary);
  p { margin: 0 0 6px; font-size: 14px; color: var(--text-primary); }
}
.history-empty-icon {
  font-size: 32px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}
.history-empty-tip { font-size: 12px; color: var(--text-tertiary); }

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
}
.history-item-main { flex: 1; min-width: 0; }
.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.history-item-time {
  font-size: 11px;
  color: var(--text-tertiary);
}
.history-item-delete {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .iconfont { font-size: 12px; }
  &:hover {
    color: var(--error);
    border-color: var(--error);
    background: var(--error-bg);
  }
}
</style>
