<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import Drawer from '../../components/Drawer.vue';
import Dialog from '../../components/Dialog.vue';
import {
  getAllChatSessions,
  removeChatSession,
  removeAllChatSessions,
  formatSessionTime
} from './chatHistoryStorage';
import { truncateSessionTitle } from './intelligentColorMatchingUtils';
import { showToast } from '../../utils/colorUtils';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible', 'select']);

const sessions = ref([]);
const multiSelectMode = ref(false);
const selectedIds = ref(new Set());
const deleteDialogVisible = ref(false);
const deleteDialogType = ref('single');
const deleteTarget = ref(null);

const deleteTargetPreview = computed(() => deleteTarget.value?.preview || '');

const selectedCount = computed(() => selectedIds.value.size);

const primaryDeleteLabel = computed(() => {
  if (multiSelectMode.value) {
    return selectedCount.value > 0 ? `删除(${selectedCount.value})` : '删除';
  }
  return '多选删除';
});

const confirmText = computed(() => {
  if (deleteDialogType.value === 'all') {
    return '确定删除全部历史会话吗？删除后不可恢复。';
  }
  if (deleteDialogType.value === 'batch') {
    return `确定删除选中的 ${selectedCount.value} 条历史会话吗？删除后不可恢复。`;
  }
  return `确定删除「${deleteTargetPreview.value}」吗？删除后不可恢复。`;
});

function refreshSessions() {
  sessions.value = getAllChatSessions();
}

function exitMultiSelectMode() {
  multiSelectMode.value = false;
  selectedIds.value = new Set();
}

function handleClose() {
  exitMultiSelectMode();
  emit('update:visible', false);
}

function handleSelect(session) {
  emit('select', session);
  handleClose();
}

function isSelected(id) {
  return selectedIds.value.has(id);
}

function toggleSelect(id) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
}

function handleItemClick(session) {
  if (multiSelectMode.value) {
    toggleSelect(session.id);
    return;
  }
  handleSelect(session);
}

function handlePrimaryDeleteClick() {
  if (!multiSelectMode.value) {
    multiSelectMode.value = true;
    return;
  }
  if (selectedCount.value === 0) {
    showToast(null, '请先选择要删除的会话', 'warning');
    return;
  }
  deleteDialogType.value = 'batch';
  deleteDialogVisible.value = true;
}

function handleDeleteAllClick() {
  deleteDialogType.value = 'all';
  deleteDialogVisible.value = true;
}

function handleDeleteClick(session, e) {
  e.stopPropagation();
  deleteDialogType.value = 'single';
  deleteTarget.value = session;
  deleteDialogVisible.value = true;
}

function handleCancelDelete() {
  deleteDialogVisible.value = false;
  deleteTarget.value = null;
  deleteDialogType.value = 'single';
}

function confirmDelete() {
  if (deleteDialogType.value === 'all') {
    removeAllChatSessions();
    refreshSessions();
    exitMultiSelectMode();
  } else if (deleteDialogType.value === 'batch') {
    const targets = sessions.value.filter((s) => selectedIds.value.has(s.id));
    targets.forEach((session) => removeChatSession(session));
    refreshSessions();
    exitMultiSelectMode();
    showToast(null, `已删除 ${targets.length} 条会话`, 'success');
  } else if (deleteTarget.value) {
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

watch(() => props.visible, (val) => {
  if (val) refreshSessions();
  else exitMultiSelectMode();
});

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
        :class="{
          'is-multi-select': multiSelectMode,
          'is-selected': isSelected(item.id)
        }"
        @click="handleItemClick(item)"
      >
        <label
          v-if="multiSelectMode"
          class="history-item-check"
          @click.stop.prevent="toggleSelect(item.id)"
        >
          <input
            type="checkbox"
            :checked="isSelected(item.id)"
            tabindex="-1"
          />
        </label>
        <div class="history-item-main">
          <div class="history-item-title-wrap">
            <div class="history-item-title">{{ getDisplayTitle(item.preview) }}</div>
            <span v-if="shouldShowTitleTip(item.preview)" class="history-item-tip">{{ item.preview }}</span>
          </div>
          <div class="history-item-time">{{ formatSessionTime(item.createdAt) }}</div>
        </div>
        <button
          v-if="!multiSelectMode"
          class="history-item-delete"
          title="删除"
          @click="handleDeleteClick(item, $event)"
        >
          <span class="iconfont icon-Failure"></span>
        </button>
      </li>
    </ul>

    <template #footer>
      <div v-if="sessions.length" class="history-footer">
        <button
          class="footer-btn"
          :class="{ 'footer-btn-danger': multiSelectMode }"
          @click="handlePrimaryDeleteClick"
        >
          {{ primaryDeleteLabel }}
        </button>
        <button
          v-if="multiSelectMode"
          class="footer-btn"
          @click="exitMultiSelectMode"
        >
          取消
        </button>
        <button class="footer-btn footer-btn-danger" @click="handleDeleteAllClick">
          删除全部
        </button>
      </div>
    </template>
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
        {{ confirmText }}
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
  &.is-multi-select.is-selected {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
}
.history-item-check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
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

.history-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-btn {
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.footer-btn-danger {
  color: var(--error);
  &:hover {
    border-color: var(--error);
    color: var(--error);
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
