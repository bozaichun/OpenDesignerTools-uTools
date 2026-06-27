<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Dialog from '../../components/Dialog.vue';
import Input from '../../components/Input.vue';
import Textarea from '../../components/Textarea.vue';
import Selector from '../../components/Selector.vue';
import ColorPicker from '../../components/ColorPicker.vue';
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import { loadPalettes, savePalettes } from './paletteStorage.js';
import {
  COLOR_VALUE_TYPES,
  DEFAULT_COLOR_VALUE_TYPE,
  getColorValueTypeLabel,
  getColorValueTypeTagClass,
  getColorValueTypeOption,
  normalizeColorValueType
} from '../../data/colorValueTypes.js';

const UNCATEGORIZED_FILTER = '__uncategorized__';

const route = useRoute();
const router = useRouter();
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const groups = ref([]);
const group = ref(null);
const colorValueTypes = COLOR_VALUE_TYPES;
const activeTypeFilter = ref(null);
const dialogAddColor = ref(false);
const dialogDeleteConfirm = ref(false);
const editingColorIndex = ref(null);
const deleteTargetIndex = ref(null);
const deleteTargetName = ref('');
const newColorName = ref('');
const newColorType = ref(DEFAULT_COLOR_VALUE_TYPE);
const newColorValue = ref('#1677FF');
const newColorNote = ref('');

const filteredColorEntries = computed(() => {
  if (!group.value) return [];
  return group.value.colors
    .map((color, idx) => ({ color, idx }))
    .filter(({ color }) => matchColorTypeFilter(color.colorType));
});

function loadGroup() {
  groups.value = loadPalettes();
  const groupId = route.query.groupId;
  group.value = groups.value.find((item) => item.id === groupId) || null;
  activeTypeFilter.value = null;
}
function updateHeaderActions() {
  if (!group.value) {
    clearHeaderActions();
    return;
  }
  setHeaderActions([
    { label: '添加色值', onClick: () => openAddColorDialog() }
  ]);
}
function goBack() {
  router.push('/PaletteManager');
}
function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}
function hasColorNote(note) {
  return Boolean(String(note ?? '').trim());
}
function formatColorNote(note) {
  const value = String(note ?? '').trim();
  return value || '--';
}
function getColorTypeLabel(type) {
  if (!getColorValueTypeOption(type)) return '未分类';
  return getColorValueTypeLabel(type);
}
function getColorTypeTagClass(type) {
  if (!getColorValueTypeOption(type)) return 'type-default';
  return getColorValueTypeTagClass(type);
}
function matchColorTypeFilter(type) {
  if (!activeTypeFilter.value) return true;
  if (activeTypeFilter.value === UNCATEGORIZED_FILTER) {
    return !getColorValueTypeOption(type);
  }
  return normalizeColorValueType(type) === activeTypeFilter.value;
}
function openAddColorDialog() {
  editingColorIndex.value = null;
  newColorName.value = '';
  newColorType.value = DEFAULT_COLOR_VALUE_TYPE;
  newColorValue.value = '#1677FF';
  newColorNote.value = '';
  dialogAddColor.value = true;
}
function openEditColorDialog(idx, color) {
  editingColorIndex.value = idx;
  newColorName.value = color.name;
  newColorType.value = normalizeColorValueType(color.colorType);
  newColorValue.value = color.color;
  newColorNote.value = color.note || '';
  dialogAddColor.value = true;
}
function closeColorDialog() {
  dialogAddColor.value = false;
  editingColorIndex.value = null;
  newColorName.value = '';
  newColorType.value = DEFAULT_COLOR_VALUE_TYPE;
  newColorValue.value = '#1677FF';
  newColorNote.value = '';
}
function saveColor() {
  if (!group.value) return;
  if (!newColorName.value.trim() || !newColorValue.value) {
    showToast(null, '请填写色值名称和色值', 'error');
    return;
  }
  const rgb = parseColor(newColorValue.value);
  if (!rgb) {
    showToast(null, '色值格式无效', 'error');
    return;
  }
  const normalizedHex = '#' + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const colorData = {
    name: newColorName.value.trim(),
    color: normalizedHex,
    note: newColorNote.value.trim(),
    colorType: newColorType.value
  };
  if (editingColorIndex.value !== null) {
    group.value.colors[editingColorIndex.value] = colorData;
    closeColorDialog();
    saveAll();
    showToast(null, '色值修改成功', 'success');
    return;
  }
  group.value.colors.push(colorData);
  closeColorDialog();
  saveAll();
  showToast(null, '色值添加成功', 'success');
}
function openDeleteConfirm(idx, color) {
  deleteTargetIndex.value = idx;
  deleteTargetName.value = color.name || color.color;
  dialogDeleteConfirm.value = true;
}
function confirmDeleteColor() {
  if (!group.value || deleteTargetIndex.value === null) return;
  group.value.colors.splice(deleteTargetIndex.value, 1);
  deleteTargetIndex.value = null;
  deleteTargetName.value = '';
  dialogDeleteConfirm.value = false;
  saveAll();
  showToast(null, '色值已删除', 'success');
}
function saveAll() {
  savePalettes(groups.value);
}
function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label, 'success');
}

watch(() => route.query.groupId, () => {
  loadGroup();
});

onMounted(() => {
  loadGroup();
  updateHeaderActions();
});
onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-palette-detail">
    <div v-if="!group" class="empty-state">
      <div class="empty-text">未找到该分组，可能已被删除</div>
      <button class="primary-btn" @click="goBack">返回列表</button>
    </div>

    <template v-else>
      <div class="palette-toolbar">
        <div v-if="group.colors.length" class="filter-main">
          <span class="filter-label">筛选</span>
          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ active: activeTypeFilter === null }"
              @click="activeTypeFilter = null"
            >
              全部
            </button>
            <button
              v-for="item in colorValueTypes"
              :key="item.value"
              type="button"
              class="filter-chip"
              :class="{ active: activeTypeFilter === item.value }"
              @click="activeTypeFilter = item.value"
            >
              {{ item.label }}
            </button>
            <button
              type="button"
              class="filter-chip"
              :class="{ active: activeTypeFilter === UNCATEGORIZED_FILTER }"
              @click="activeTypeFilter = UNCATEGORIZED_FILTER"
            >
              未分类
            </button>
          </div>
        </div>
        <div class="detail-summary">共 {{ group.colors.length }} 个色值</div>
      </div>

      <div v-if="group.colors.length" class="palette-list-wrap">
        <div v-if="filteredColorEntries.length" class="palette-list">
          <div
            v-for="entry in filteredColorEntries"
            :key="entry.idx"
            class="palette-item"
          >
            <div class="palette-swatch" :style="{ background: entry.color.color }">
              <span class="palette-contrast-text" :style="{ color: getContrastColor(entry.color.color) }">Aa</span>
            </div>
            <div class="palette-name-cell">
              <Input
                v-model="entry.color.name"
                variant="ghost"
                bold
                placeholder="色值名称"
                @blur="saveAll()"
              />
              <div class="palette-hex">{{ entry.color.color }}</div>
            </div>
            <span
              class="palette-note-text"
              :class="{ 'is-empty': !hasColorNote(entry.color.note) }"
            >{{ formatColorNote(entry.color.note) }}</span>
            <div class="palette-type-cell">
              <span
                class="color-type-tag"
                :class="getColorTypeTagClass(entry.color.colorType)"
              >
                {{ getColorTypeLabel(entry.color.colorType) }}
              </span>
            </div>
            <div class="palette-actions-sm">
              <button class="sm-btn" @click="openEditColorDialog(entry.idx, entry.color)">修改色值</button>
              <button class="sm-btn" @click="copyValue(entry.color.color, entry.color.name)">复制</button>
              <button class="sm-btn danger" @click="openDeleteConfirm(entry.idx, entry.color)">删除</button>
            </div>
          </div>
        </div>
        <div v-else class="filter-empty">没有匹配的色值，请调整筛选条件</div>
      </div>
      <div v-else class="expand-empty">该分组暂无色值，点击右上角「添加色值」开始创建</div>
    </template>

    <!-- 添加 / 修改色值 -->
    <Dialog
      v-model:visible="dialogAddColor"
      :title="editingColorIndex !== null ? '修改色值' : '添加色值'"
      max-width="480px"
      :confirm-on-enter="true"
      @confirm="saveColor"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label class="form-label">色值名称</label>
          <Input
            v-model="newColorName"
            placeholder="色值名称（如：品牌主色）"
          />
        </div>
        <div class="form-field">
          <label class="form-label">色值类型</label>
          <Selector v-model="newColorType">
            <option
              v-for="item in colorValueTypes"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </Selector>
        </div>
        <div class="form-field">
          <label class="form-label">选择颜色</label>
          <ColorPicker v-model="newColorValue" class="color-picker-full" />
        </div>
        <div class="form-field">
          <label class="form-label">使用场景<span class="form-optional">（选填）</span></label>
          <Textarea
            v-model="newColorNote"
            placeholder="备注/使用场景（选填）"
          />
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="closeColorDialog">取消</button>
          <button class="primary-btn" @click="saveColor">{{ editingColorIndex !== null ? '确认修改' : '确认添加' }}</button>
        </div>
      </div>
    </Dialog>

    <!-- 删除确认 -->
    <Dialog
      v-model:visible="dialogDeleteConfirm"
      title="删除色值"
      max-width="420px"
      :confirm-on-enter="true"
      @confirm="confirmDeleteColor"
    >
      <div class="dialog-confirm">
        <p class="confirm-text">
          您是否删除「{{ deleteTargetName }}」色值，此过程不可撤销！
        </p>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="dialogDeleteConfirm = false">取消</button>
          <button class="primary-btn danger-btn" @click="confirmDeleteColor">确认删除</button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.module-palette-detail {
  width: 100%;
  min-width: 0;
}

.detail-summary {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.palette-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 12px;
}

.expand-empty,
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.expand-empty {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-text {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.palette-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.filter-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.filter-chip {
  height: 28px;
  padding: 0px 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-chip.active {
  background: var(--accent);
  color: var(--text-invert);
  border-color: var(--accent);
}

.filter-empty {
  padding: 32px 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-item {
  display: grid;
  grid-template-columns: 48px minmax(120px, 160px) minmax(140px, 1fr) minmax(160px, max-content) auto;
  gap: 12px;
  align-items: start;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.palette-item > * {
  justify-self: start;
  text-align: left;
}

.palette-item > .palette-swatch,
.palette-item > .palette-name-cell,
.palette-item > .palette-note-text,
.palette-item > .palette-type-cell,
.palette-item > .palette-actions-sm {
  align-self: center;
}

.palette-item > .palette-swatch {
  width: 48px;
}

.palette-item > .palette-name-cell,
.palette-item > .palette-note-text {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.palette-note-text {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-note-text.is-empty {
  color: var(--text-tertiary);
}

.palette-item > .palette-type-cell {
  width: auto;
  max-width: none;
}

.palette-item > .palette-actions-sm {
  width: auto;
}

.palette-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.palette-swatch {
  width: 48px;
  height: 48px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  align-self: start;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
}

.palette-contrast-text {
  font-size: 18px;
  font-weight: 700;
}

.palette-hex {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-secondary);
}

.palette-type-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.color-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  border: 1px solid transparent;
}

.type-theme {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: var(--accent-light);
}

.type-functional {
  color: var(--success);
  background: var(--success-bg);
  border-color: var(--success-border);
}

.type-text-light {
  color: var(--text-secondary);
  background: var(--bg-muted);
  border-color: var(--border-primary);
}

.type-text-dark {
  color: var(--text-primary);
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.type-auxiliary {
  color: var(--accent-hover);
  background: var(--accent-soft);
  border-color: var(--accent-light);
}

.type-default {
  color: var(--text-secondary);
  background: var(--bg-muted);
  border-color: var(--border-primary);
}

.palette-actions-sm {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 6px;
}

.sm-btn {
  padding: 4px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: 11px;
  cursor: pointer;
  color: var(--text-primary);
}

.sm-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.sm-btn.danger:hover {
  border-color: var(--text-error);
  color: var(--text-error);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-optional {
  font-weight: 400;
  color: var(--text-tertiary);
}

.color-picker-full {
  width: 100%;
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
}

.primary-btn:hover,
.secondary-btn:hover {
  opacity: 0.9;
}

.secondary-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

.danger-btn {
  background: var(--text-error, #ef4444);
  border-color: var(--text-error, #ef4444);
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

@media (max-width: 768px) {
  .palette-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .detail-summary {
    align-self: flex-end;
  }

  .filter-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .palette-item {
    grid-template-columns: 48px 1fr;
  }

  .palette-item > .palette-note-text,
  .palette-type-cell,
  .palette-actions-sm {
    grid-column: 1 / -1;
  }

  .palette-actions-sm {
    justify-content: flex-start;
  }
}
</style>
