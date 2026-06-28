<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Drawer from '../../components/Drawer.vue';
import Dialog from '../../components/Dialog.vue';
import {
  getAllChatSessions,
  removeChatSession,
  formatSessionTime
} from './chatHistoryStorage';
import { truncateSessionTitle } from './intelligentColorMatchingUtils';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible', 'select']);

const sessions = ref([]);
const deleteDialogVisible = ref(false);
const deleteTarget = ref(null);

const deleteTargetPreview = computed(() => deleteTarget.value?.preview || '');

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

function handleDeleteClick(session, e) {
  e.stopPropagation();
  deleteTarget.value = session;
  deleteDialogVisible.value = true;
}

function handleCancelDelete() {
  deleteDialogVisible.value = false;
  deleteTarget.value = null;
}

function confirmDelete() {
  if (deleteTarget.value) {
    removeChatSession(deleteTarget.value);
    refreshSessions();
  }
  handleCancelDelete();
}

function getDisplayTitle(preview) {
  return truncateSessionTitle(preview);
}

function shouldShowTitleTip(preview) {
  return (preview || '').trim().length > 12;
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
          <div class="history-item-title-wrap">
            <div class="history-item-title">{{ getDisplayTitle(item.preview) }}</div>
            <span v-if="shouldShowTitleTip(item.preview)" class="history-item-tip">{{ item.preview }}</span>
          </div>
          <div class="history-item-time">{{ formatSessionTime(item.createdAt) }}</div>
        </div>
        <button class="history-item-delete" title="删除" @click="handleDeleteClick(item, $event)">
          <span class="iconfont icon-Failure"></span>
        </button>
      </li>
    </ul>
  </Drawer>

  <!-- 删除确认 -->
  <Dialog
    v-model:visible="deleteDialogVisible"
    title="删除历史会话"
    max-width="420px"
    :confirm-on-enter="true"
    @confirm="confirmDelete"
    @close="handleCancelDelete"
  >
    <div class="dialog-confirm">
      <p class="confirm-text">
        确定删除「{{ deleteTargetPreview }}」吗？删除后不可恢复。
      </p>
      <div class="dialog-footer">
        <button class="secondary-btn" @click="handleCancelDelete">取消</button>
        <button class="primary-btn danger-btn" @click="confirmDelete">确认删除</button>
      </div>
    </div>
  </Dialog>
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
.history-item-title-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin-bottom: 4px;
}
.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-item-tip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 10;
  width: max-content;
  max-width: min(280px, 70vw);
  padding: 6px 10px;
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  box-shadow: var(--shadow-md);
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}
.history-item-title-wrap:hover .history-item-tip {
  visibility: visible;
  opacity: 1;
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

.dialog-confirm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}
.primary-btn,
.secondary-btn {
  padding: 8px 18px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { opacity: 0.9; }
}
.secondary-btn {
  background: var(--bg-muted);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
.danger-btn {
  background: var(--error);
  border-color: var(--error);
  color: var(--text-invert);

  &:hover {
    background: var(--error-hover);
    border-color: var(--error-hover);
  }
}
</style>
