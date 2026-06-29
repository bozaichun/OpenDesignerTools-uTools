<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { getUniquePresets, COLOR_GROUPS } from '../../data/presetColors';
import { showToast } from '../../utils/colorUtils';
import { downloadPaletteCard } from '../../utils/paletteCard';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import Banner from '../../components/Banner.vue';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';

const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const presetColors = getUniquePresets();
const colorGroups = COLOR_GROUPS;
const activeGroup = ref(null);
const modalVisible = ref(false);
const modalColor = ref({ name: '', hex: '', group: '' });
const selectedKeys = ref(new Set());
const filterStickSentinel = ref(null);
const filterBarRef = ref(null);
const filterBarStuck = ref(false);
const filterBarHeight = ref(0);
const filterBarFixedStyle = ref({});
let filterStickObserver = null;
let filterBarResizeObserver = null;
let filterScrollRoot = null;

function updateFilterBarLayout() {
  const bar = filterBarRef.value;
  if (!bar) return;

  filterBarHeight.value = bar.offsetHeight;
  const scrollRoot = bar.closest('.content-body');
  if (!scrollRoot) return;

  const rect = scrollRoot.getBoundingClientRect();
  filterBarFixedStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  };
}

function handleFilterScrollRootChange() {
  updateFilterBarLayout();
}

function setupFilterBarStick() {
  filterScrollRoot = filterStickSentinel.value?.closest('.content-body');
  if (!filterScrollRoot || !filterStickSentinel.value) return;

  updateFilterBarLayout();

  filterStickObserver = new IntersectionObserver(
    ([entry]) => {
      filterBarStuck.value = !entry.isIntersecting;
      if (filterBarStuck.value) {
        updateFilterBarLayout();
      }
    },
    { root: filterScrollRoot, threshold: 0 }
  );
  filterStickObserver.observe(filterStickSentinel.value);

  filterScrollRoot.addEventListener('scroll', handleFilterScrollRootChange, { passive: true });
  window.addEventListener('resize', handleFilterScrollRootChange, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    filterBarResizeObserver = new ResizeObserver(() => {
      updateFilterBarLayout();
    });
    filterBarResizeObserver.observe(filterScrollRoot);
    if (filterBarRef.value) {
      filterBarResizeObserver.observe(filterBarRef.value);
    }
  }
}

function teardownFilterBarStick() {
  filterStickObserver?.disconnect();
  filterStickObserver = null;
  filterBarResizeObserver?.disconnect();
  filterBarResizeObserver = null;
  filterScrollRoot?.removeEventListener('scroll', handleFilterScrollRootChange);
  window.removeEventListener('resize', handleFilterScrollRootChange);
  filterScrollRoot = null;
}

const filteredColors = computed(() => {
  return presetColors.filter(c => {
    return !activeGroup.value || c.group === activeGroup.value;
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
    {
      label: '下载色卡',
      icon: 'icon-Download',
      iconOnly: true,
      onClick: handleDownloadColorCard
    }
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
  setupFilterBarStick();
});

onUnmounted(() => {
  teardownFilterBarStick();
  clearHeaderActions();
});
</script>

<template>
  <LayoutContainer
    variant="module"
    class="module-preset"
    :class="{ 'has-multi-bar': multiSelectVisible }"
  >
    <div class="preset-main">
    <Banner
      title="按色系浏览，一键获取颜色值"
      description="覆盖红橙黄绿蓝紫黑白灰等常用色系，按色系筛选快速定位"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/PresetColors.png"
    />
    <!-- 色系筛选（滚动后吸顶） -->
    <div ref="filterStickSentinel" class="preset-filter-stick-sentinel" aria-hidden="true"></div>
    <div
      class="preset-filter-anchor"
      :style="filterBarStuck ? { height: `${filterBarHeight}px` } : undefined"
    >
      <div
        ref="filterBarRef"
        class="preset-filter-bar"
        :class="{ 'is-stuck': filterBarStuck }"
        :style="filterBarStuck ? filterBarFixedStyle : undefined"
      >
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
      </div>
    </div>

    <!-- 颜色卡片网格 -->
    <GridLayout
      v-if="filteredColors.length > 0"
      class="preset-grid"
      :cols="5"
      :cols-large="6"
      :cols-xlarge="6"
      :cols-tablet="3"
      :cols-mobile="2"
    >
      <div
        v-for="color in filteredColors"
        :key="color.name"
        class="preset-card"
        :class="{ 'is-selected': isSelected(color.name) }"
        @click="toggleSelect(color.name)"
      >
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
            type="button"
            class="card-select-btn"
            :class="{ checked: isSelected(color.name) }"
            title="多选"
            @click="toggleSelect(color.name)"
          >
            <span v-if="isSelected(color.name)" class="iconfont icon-Check"></span>
          </button>
          <ColorActionGroup
            variant="card"
            :value="color.hex"
            :copy-label="color.name"
            :favorite-name="color.name"
          >
            <template #prefix>
              <button
                type="button"
                class="color-action-group__extra-btn"
                title="查看颜色值"
                @click="openColorModal(color)"
              >
                <span class="iconfont icon-ViewDetails"></span>
              </button>
            </template>
          </ColorActionGroup>
        </div>
      </div>
    </GridLayout>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      当前色系下暂无颜色。
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
            <span v-if="isAllFilteredSelected" class="iconfont icon-Check"></span>
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
  </LayoutContainer>
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

  :deep(.app-banner) {
    margin-bottom: 16px;
  }
}

/* ============ 色系筛选 ============ */
.preset-filter-stick-sentinel {
  height: 0;
  width: 100%;
  pointer-events: none;
}

.preset-filter-anchor {
  min-width: 0;
}

.preset-filter-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0 10px;
  margin-bottom: 12px;
  background: var(--bg-card);
  box-sizing: border-box;

  &.is-stuck {
    position: fixed;
    z-index: 15;
    margin-bottom: 0;
    padding: 8px 20px 10px;
    border-bottom: 1px solid var(--border-primary);
    box-shadow: var(--shadow-bottom);
  }
}

/* ============ 分组标签 ============ */
.group-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
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
  width: 18px;
  height: 18px;
  padding: 0;
  flex-shrink: 0;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-invert);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 10px;
    line-height: 1;
  }

  &:hover {
    border-color: var(--accent);
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
  justify-content: space-between;
  gap: 6px;
  cursor: default;

  :deep(.color-action-group) {
    flex-shrink: 0;
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
  color: var(--primary);
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
@media (max-width: 640px) {
  .preset-filter-bar.is-stuck {
    padding-left: 14px;
    padding-right: 14px;
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
