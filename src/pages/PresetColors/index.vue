<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { getUniquePresets, COLOR_GROUPS } from '../../data/presetColors';
import { showToast } from '../../utils/colorUtils';
import { downloadPaletteCard } from '../../utils/paletteCard';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import Input from '../../components/Input.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import Banner from '../../components/Banner.vue';

const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const presetColors = getUniquePresets();
const colorGroups = COLOR_GROUPS;
const searchText = ref('');
const activeGroup = ref(null);
const modalVisible = ref(false);
const modalColor = ref({ name: '', hex: '', group: '' });
const selectedKeys = ref(new Set());

const filteredColors = computed(() => {
  const search = searchText.value.trim().toLowerCase();
  return presetColors.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search) || c.hex.toLowerCase().includes(search);
    const matchGroup = !activeGroup.value || c.group === activeGroup.value;
    return matchSearch && matchGroup;
  });
});

const selectedCount = computed(() => selectedKeys.value.size);

const multiSelectVisible = computed(() => selectedCount.value > 0);

const isAllFilteredSelected = computed(() => {
  const list = filteredColors.value;
  return list.length > 0 && list.every((color) => selectedKeys.value.has(color.name));
});

const isAllFilteredIndeterminate = computed(() => {
  const list = filteredColors.value;
  if (!list.length) return false;
  const selectedInView = list.filter((color) => selectedKeys.value.has(color.name)).length;
  return selectedInView > 0 && selectedInView < list.length;
});

function updateHeaderActions() {
  setHeaderActions([
    { label: '下载色卡', onClick: handleDownloadColorCard }
  ]);
}

function isSelected(name) {
  return selectedKeys.value.has(name);
}

function toggleSelect(name) {
  const next = new Set(selectedKeys.value);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  selectedKeys.value = next;
}

function toggleSelectAllFiltered() {
  if (isAllFilteredSelected.value) {
    const next = new Set(selectedKeys.value);
    filteredColors.value.forEach((color) => next.delete(color.name));
    selectedKeys.value = next;
    return;
  }
  const next = new Set(selectedKeys.value);
  filteredColors.value.forEach((color) => next.add(color.name));
  selectedKeys.value = next;
}

function handleCancelMultiSelect() {
  selectedKeys.value = new Set();
}

function handleDownloadColorCard() {
  const selected = presetColors.filter((color) => selectedKeys.value.has(color.name));
  if (!selected.length) {
    showToast(null, '请先选择要下载的颜色', 'warning');
    return;
  }
  downloadPaletteCard(selected, {
    title: '预置颜色色卡',
    subtitle: `共 ${selected.length} 种颜色`,
    filenamePrefix: 'preset-colors-palette'
  });
}

function openColorModal(color) {
  modalColor.value = { ...color };
  modalVisible.value = true;
}

watch(filteredColors, (list) => {
  const visibleNames = new Set(list.map((color) => color.name));
  const next = new Set([...selectedKeys.value].filter((name) => visibleNames.has(name)));
  if (next.size !== selectedKeys.value.size) {
    selectedKeys.value = next;
  }
});

onMounted(() => {
  updateHeaderActions();
});

onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-preset" :class="{ 'has-multi-bar': multiSelectVisible }">
    <div class="preset-main">
    <Banner
      title="按色系浏览，一键获取颜色值"
      description="覆盖红橙黄绿蓝紫黑白灰等常用色系，支持名称与 HEX 搜索快速定位"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/PresetColors.png"
    />
    <!-- 筛选与搜索 -->
    <div class="preset-filter-bar">
      <div class="group-chips">
        <div
          class="chip"
          :class="{ active: activeGroup === null }"
          @click="activeGroup = null"
        >
          全部
        </div>
        <div
          v-for="group in colorGroups"
          :key="group"
          class="chip"
          :class="{ active: activeGroup === group }"
          @click="activeGroup = group"
        >
          {{ group }}
        </div>
      </div>
      <div class="search-wrap">
        <Input
          v-model="searchText"
          placeholder="搜索颜色名称或 HEX 值..."
        />
      </div>
    </div>

    <!-- 颜色卡片网格 -->
    <div v-if="filteredColors.length > 0" class="preset-grid">
      <div
        v-for="color in filteredColors"
        :key="color.name"
        class="preset-card"
        :class="{ 'is-selected': isSelected(color.name) }"
        @click="toggleSelect(color.name)"
      >
        <span
          class="card-select-btn"
          :class="{ checked: isSelected(color.name) }"
          aria-hidden="true"
        >
          <span v-if="isSelected(color.name)" class="iconfont icon-Success"></span>
        </span>
        <div class="group-tag">{{ color.group }}</div>
        <div class="swatch-row">
          <div class="color-swatch" :style="{ background: color.hex }"></div>
          <div class="color-info">
            <div class="color-name">{{ color.name }}</div>
            <div class="color-hex">{{ color.hex }}</div>
          </div>
        </div>

        <div class="card-action-bar" @click.stop>
          <button
            class="view-color-btn"
            @click="openColorModal(color)"
          >
            查看颜色值
          </button>
          <ColorActionGroup
            :value="color.hex"
            :copy-label="color.name"
            :favorite-name="color.name"
          />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      没有找到匹配的颜色，请尝试其他搜索词。
    </div>
    </div>

    <!-- 多选功能区 -->
    <div v-if="multiSelectVisible" class="preset-multi-bar">
      <div class="preset-multi-left">
        <button
          class="preset-multi-all"
          @click="toggleSelectAllFiltered"
        >
          <span
            class="preset-check-box"
            :class="{
              checked: isAllFilteredSelected,
              indeterminate: isAllFilteredIndeterminate
            }"
          >
            <span v-if="isAllFilteredSelected" class="iconfont icon-Success"></span>
            <span v-else-if="isAllFilteredIndeterminate" class="preset-check-indeterminate"></span>
          </span>
          全选
        </button>
        <span class="preset-multi-divider" aria-hidden="true"></span>
        <span class="preset-multi-count">已选 {{ selectedCount }} 张色卡</span>
      </div>
      <button class="preset-multi-cancel" @click="handleCancelMultiSelect">
        取消
      </button>
    </div>

    <ColorFormatDialog
      v-model:visible="modalVisible"
      :color="modalColor"
    />
  </div>
</template>

<style lang="scss" scoped>
.module-preset {
  width: 100%;

  &.has-multi-bar {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin-bottom: -20px;

    .preset-main {
      flex: 1 1 auto;
    }

    .preset-multi-bar {
      margin-top: auto;
    }
  }
}

.preset-main {
  min-width: 0;
}

/* ============ 筛选与搜索 ============ */
.preset-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.search-wrap {
  flex-shrink: 0;
  width: 280px;
}

/* ============ 分组标签 ============ */
.group-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.chip {
  padding: 6px 14px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
  }
}

/* ============ 颜色卡片网格 ============ */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.preset-card {
  position: relative;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.is-selected {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .swatch-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 10px;
  }
}

.card-select-btn {
  position: absolute;
  top: -6px;
  left: -6px;
  z-index: 2;
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  background: var(--bg-card);
  color: var(--text-invert);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 10px;
    line-height: 1;
  }

  &.checked {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

/* ============ 颜色信息 ============ */
.color-info {
  flex: 1;
  min-width: 0;
}

.color-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.3;
}

.color-hex {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  margin-top: 2px;
}

.group-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--bg-card);
  padding: 3px 10px;
  border: 1px solid var(--border-primary);
  border-top: none;
  border-right: none;
  border-top-right-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
  border-top-left-radius: 0;
  border-bottom-right-radius: 0;
  line-height: 1.2;
  white-space: nowrap;
}

/* ============ 底部操作栏 ============ */
.card-action-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: default;

  :deep(.color-action-group) {
    flex-shrink: 0;
  }
}

.view-color-btn {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  font-size: 11px;
  line-height: 1;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-weight: 500;
  box-sizing: border-box;

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

.card-icon-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 12px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

.card-action-bar :deep(.favorite-btn) {
  width: 28px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .favorite-icon {
    font-size: 12px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  &.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);

    &:hover {
      background: var(--accent-hover, var(--accent));
      border-color: var(--accent-hover, var(--accent));
      color: var(--text-invert);
    }
  }
}

/* ============ 多选功能区（贴底全宽条） ============ */
.preset-multi-bar {
  position: sticky;
  bottom: -20px;
  z-index: 20;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-left: -20px;
  margin-right: -20px;
  margin-bottom: -20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
  box-shadow: var(--shadow-top);
}

.preset-multi-left {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.preset-multi-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.preset-multi-divider {
  width: 1px;
  height: 14px;
  background: var(--error);
  flex-shrink: 0;
}

.preset-multi-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--error);
  white-space: nowrap;
}

.preset-check-box {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  background: var(--bg-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 10px;
    line-height: 1;
    color: var(--text-invert);
  }

  &.checked {
    background: var(--accent);
    border-color: var(--accent);
  }

  &.indeterminate {
    border-color: var(--accent);
  }
}

.preset-check-indeterminate {
  width: 8px;
  height: 2px;
  border-radius: 1px;
  background: var(--accent);
}

.preset-multi-cancel {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
}

/* ============ 空状态 ============ */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ============ 响应式 ============ */
@media (max-width: 1200px) {
  .preset-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .preset-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .preset-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrap {
    width: 100%;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .module-preset.has-multi-bar {
    margin-bottom: -14px;
  }

  .preset-multi-bar {
    bottom: -14px;
    margin-left: -14px;
    margin-right: -14px;
    margin-bottom: -14px;
    padding: 10px 14px;
  }
}
</style>
