<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from '../../components/Dialog.vue';
import Input from '../../components/Input.vue';
import Selector from '../../components/Selector.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import Banner from '../../components/Banner.vue';
import DefaultPage from '../../components/DefaultPage.vue';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';
import { COLOR_GROUPS, inferColorGroup } from '../../data/presetColors';
import {
  getAllFavorites,
  removeFavorite
} from '../../utils/favoriteStorage';
import { loadPalettes, savePalettes } from '../PaletteManager/paletteStorage.js';
import { showToast, parseColor, getContrastColor as gcc } from '../../utils/colorUtils';
import { downloadPaletteCard } from '../../utils/paletteCard';

const router = useRouter();
const clearHeaderActions = inject('clearHeaderActions');

const favorites = ref([]);
const colorGroups = COLOR_GROUPS;
const activeGroup = ref(null);
const selectedKeys = ref(new Set());
const modalVisible = ref(false);
const modalColor = ref({ name: '', hex: '' });
const paletteDialogVisible = ref(false);
const paletteGroups = ref([]);
const selectedGroupId = ref('');
const paletteColorName = ref('');
const paletteTargetColor = ref(null);
const filterStickSentinel = ref(null);
const filterBarRef = ref(null);
const filterBarStuck = ref(false);
const filterBarHeight = ref(0);
const filterBarFixedStyle = ref({});
let filterStickObserver = null;
let filterBarResizeObserver = null;
let filterScrollRoot = null;

const filteredFavorites = computed(() => {
  return favorites.value.filter((item) => {
    if (!activeGroup.value) return true;
    return inferColorGroup(item.hex) === activeGroup.value;
  });
});

const selectedCount = computed(() => selectedKeys.value.size);
const multiSelectVisible = computed(() => selectedCount.value > 0);

const isAllFilteredSelected = computed(() => {
  const list = filteredFavorites.value;
  return list.length > 0 && list.every((item) => selectedKeys.value.has(item.hex));
});

const isAllFilteredIndeterminate = computed(() => {
  const list = filteredFavorites.value;
  if (!list.length) return false;
  const selectedInView = list.filter((item) => selectedKeys.value.has(item.hex)).length;
  return selectedInView > 0 && selectedInView < list.length;
});

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
  filterBarStuck.value = false;
}

async function syncFilterBarStick() {
  await nextTick();
  if (favorites.value.length) {
    if (!filterStickObserver) {
      setupFilterBarStick();
    } else {
      updateFilterBarLayout();
    }
    return;
  }
  teardownFilterBarStick();
}

function loadFavorites() {
  favorites.value = getAllFavorites();
  syncFilterBarStick();
}

function isSelected(hex) {
  return selectedKeys.value.has(hex);
}

function toggleSelect(hex) {
  const next = new Set(selectedKeys.value);
  if (next.has(hex)) next.delete(hex);
  else next.add(hex);
  selectedKeys.value = next;
}

function toggleSelectAllFiltered() {
  if (isAllFilteredSelected.value) {
    const next = new Set(selectedKeys.value);
    filteredFavorites.value.forEach((item) => next.delete(item.hex));
    selectedKeys.value = next;
    return;
  }
  const next = new Set(selectedKeys.value);
  filteredFavorites.value.forEach((item) => next.add(item.hex));
  selectedKeys.value = next;
}

function handleCancelMultiSelect() {
  selectedKeys.value = new Set();
}

function handleDownloadColorCard() {
  const selected = favorites.value.filter((item) => selectedKeys.value.has(item.hex));
  if (!selected.length) return;
  downloadPaletteCard(selected, {
    title: '我的收藏色卡',
    subtitle: `共 ${selected.length} 种收藏色`,
    filenamePrefix: 'my-favorites-palette'
  });
}

function handleUnfavoriteSelected() {
  const selected = favorites.value.filter((item) => selectedKeys.value.has(item.hex));
  if (!selected.length) return;

  let failCount = 0;
  selected.forEach((item) => {
    const result = removeFavorite(item.hex);
    if (!result.ok) failCount += 1;
  });

  selectedKeys.value = new Set();

  if (failCount > 0) {
    showToast(null, `有 ${failCount} 个颜色取消收藏失败`, 'error');
    return;
  }
  showToast(null, `已取消收藏 ${selected.length} 个颜色`, 'success');
}

function openColorModal(item) {
  modalColor.value = { name: item.name, hex: item.hex };
  modalVisible.value = true;
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

function openAddToPaletteDialog(item) {
  paletteGroups.value = loadPalettes();
  paletteTargetColor.value = item;
  paletteColorName.value = item.hex;
  selectedGroupId.value = paletteGroups.value[0]?.id || '';
  paletteDialogVisible.value = true;
}

function confirmAddToPalette() {
  if (!paletteTargetColor.value || !selectedGroupId.value) {
    showToast(null, '请选择色板分组', 'error');
    return;
  }
  const groups = loadPalettes();
  const group = groups.find((g) => g.id === selectedGroupId.value);
  if (!group) {
    showToast(null, '分组不存在', 'error');
    return;
  }
  const name = paletteColorName.value.trim() || paletteTargetColor.value.hex;
  group.colors.push({
    name,
    color: paletteTargetColor.value.hex,
    note: '来自我的收藏',
    colorType: 'auxiliary'
  });
  savePalettes(groups);
  paletteDialogVisible.value = false;
  showToast(null, '已添加到「' + group.name + '」', 'success');
}

function goToPaletteManager() {
  paletteDialogVisible.value = false;
  router.push('/PaletteManager');
}

watch(filteredFavorites, (list) => {
  const visibleHexes = new Set(list.map((item) => item.hex));
  const next = new Set([...selectedKeys.value].filter((hex) => visibleHexes.has(hex)));
  if (next.size !== selectedKeys.value.size) {
    selectedKeys.value = next;
  }
});

let handleFavoritesChanged = null;

onMounted(() => {
  clearHeaderActions();
  loadFavorites();
  handleFavoritesChanged = () => loadFavorites();
  window.addEventListener('color-favorites-changed', handleFavoritesChanged);
});

onUnmounted(() => {
  teardownFilterBarStick();
  clearHeaderActions();
  window.removeEventListener('color-favorites-changed', handleFavoritesChanged);
});
</script>

<template>
  <LayoutContainer
    variant="module"
    class="module-favorites"
    :class="{ 'has-multi-bar': multiSelectVisible }"
  >
    <div class="favorites-main">
      <Banner
        title="收藏常用色，快速取用"
        description="在预置颜色或其他页面点击收藏图标，将颜色保存到这里统一管理，可一键添加到色板"
        mode="url"
        image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/MyCollection.png"
      />

      <template v-if="favorites.length > 0">
        <!-- 色系筛选（滚动后吸顶） -->
        <div ref="filterStickSentinel" class="favorites-filter-stick-sentinel" aria-hidden="true"></div>
        <div
          class="favorites-filter-anchor"
          :style="filterBarStuck ? { height: `${filterBarHeight}px` } : undefined"
        >
          <div
            ref="filterBarRef"
            class="favorites-filter-bar"
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

        <GridLayout
          v-if="filteredFavorites.length > 0"
          class="favorites-grid"
          :cols="4"
          :cols-large="5"
          :cols-tablet="3"
          :cols-mobile="1"
        >
          <div
            v-for="item in filteredFavorites"
            :key="item.hex"
            class="favorite-card"
            :class="{ 'is-selected': isSelected(item.hex) }"
            @click="toggleSelect(item.hex)"
          >
            <div class="swatch-row">
              <div
                class="color-swatch"
                :style="{
                  background: item.hex,
                  color: getContrastColor(item.hex)
                }"
              >
                <span class="swatch-hex">{{ item.hex }}</span>
              </div>
            </div>

            <div class="card-action-bar" @click.stop>
              <button
                type="button"
                class="card-select-btn"
                :class="{ checked: isSelected(item.hex) }"
                title="多选"
                @click="toggleSelect(item.hex)"
              >
                <span v-if="isSelected(item.hex)" class="iconfont icon-Check"></span>
              </button>
              <ColorActionGroup
                variant="card"
                :value="item.hex"
                :copy-label="item.name || item.hex"
                :favorite-name="item.name || item.hex"
              >
                <template #prefix>
                  <button
                    type="button"
                    class="color-action-group__extra-btn"
                    title="添加到色板"
                    @click="openAddToPaletteDialog(item)"
                  >
                    <span class="iconfont icon-AddColorSwatch"></span>
                  </button>
                  <button
                    type="button"
                    class="color-action-group__extra-btn"
                    title="查看颜色值"
                    @click="openColorModal(item)"
                  >
                    <span class="iconfont icon-ViewDetails"></span>
                  </button>
                </template>
              </ColorActionGroup>
            </div>
          </div>
        </GridLayout>

        <div v-else class="filter-empty-state">
          当前色系下暂无收藏。
        </div>
      </template>

      <DefaultPage
        v-else
        text="暂无收藏"
        description="在预置颜色或其他页面点击收藏图标，将颜色保存到这里"
      />
    </div>

    <!-- 多选功能区 -->
    <div v-if="multiSelectVisible" class="favorites-multi-bar">
      <div class="favorites-multi-left">
        <button class="favorites-multi-all" @click="toggleSelectAllFiltered">
          <span
            class="favorites-check-box"
            :class="{
              checked: isAllFilteredSelected,
              indeterminate: isAllFilteredIndeterminate
            }"
          >
            <span v-if="isAllFilteredSelected" class="iconfont icon-Check"></span>
            <span v-else-if="isAllFilteredIndeterminate" class="favorites-check-indeterminate"></span>
          </span>
          全选
        </button>
        <span class="favorites-multi-divider" aria-hidden="true"></span>
        <span class="favorites-multi-count">已选 {{ selectedCount }} 张色卡</span>
      </div>
      <div class="favorites-multi-right">
        <button type="button" class="favorites-multi-action danger" @click="handleUnfavoriteSelected">
          取消收藏
        </button>
        <button type="button" class="favorites-multi-action" @click="handleDownloadColorCard">
          下载色卡
        </button>
        <button type="button" class="favorites-multi-action" @click="handleCancelMultiSelect">
          取消
        </button>
      </div>
    </div>

    <ColorFormatDialog
      v-model:visible="modalVisible"
      :color="modalColor"
    />

    <Dialog
      v-model:visible="paletteDialogVisible"
      title="添加到色板"
      max-width="480px"
    >
      <div v-if="paletteGroups.length" class="dialog-form">
        <div class="form-field">
          <label class="form-label">选择色板分组</label>
          <Selector v-model="selectedGroupId">
            <option
              v-for="group in paletteGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}（{{ group.colors.length }} 色）
            </option>
          </Selector>
        </div>
        <div class="form-field">
          <label class="form-label">色值名称</label>
          <Input
            v-model="paletteColorName"
            placeholder="色值名称"
          />
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="paletteDialogVisible = false">取消</button>
          <button class="primary-btn" @click="confirmAddToPalette">确认添加</button>
        </div>
      </div>
      <div v-else class="empty-palette-hint">
        <p>暂无可用色板分组，请先在「色板管理」中创建分组</p>
        <button class="primary-btn" @click="goToPaletteManager">前往色板管理</button>
      </div>
    </Dialog>
  </LayoutContainer>
</template>

<style lang="scss" scoped>
.module-favorites {
  width: 100%;

  &.has-multi-bar {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin-bottom: -20px;

    .favorites-main {
      flex: 1 1 auto;
    }

    .favorites-multi-bar {
      margin-top: auto;
    }
  }
}

.favorites-main {
  min-width: 0;

  :deep(.app-banner) {
    margin-bottom: 16px;
  }
}

/* ============ 色系筛选 ============ */
.favorites-filter-stick-sentinel {
  height: 0;
  width: 100%;
  pointer-events: none;
}

.favorites-filter-anchor {
  min-width: 0;
}

.favorites-filter-bar {
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

.favorite-card {
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

.swatch-row {
  margin-bottom: 10px;
}

.color-swatch {
  width: 100%;
  height: 56px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.swatch-hex {
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
}

.card-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  :deep(.color-action-group) {
    flex-shrink: 0;
  }
}

.filter-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ============ 多选功能区（贴底全宽条） ============ */
.favorites-multi-bar {
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

.favorites-multi-left {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.favorites-multi-all {
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

.favorites-multi-divider {
  width: 1px;
  height: 14px;
  background: var(--error);
  flex-shrink: 0;
}

.favorites-multi-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  white-space: nowrap;
}

.favorites-check-box {
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

.favorites-check-indeterminate {
  width: 8px;
  height: 2px;
  border-radius: 1px;
  background: var(--accent);
}

.favorites-multi-right {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.favorites-multi-action {
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

  &.danger {
    color: var(--text-error);
  }
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.primary-btn,
.secondary-btn {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;
}

.primary-btn {
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);

  &:hover {
    opacity: 0.88;
  }
}

.secondary-btn {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

.empty-palette-hint {
  text-align: center;
  padding: 12px 0;

  p {
    margin: 0 0 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

@media (max-width: 640px) {
  .favorites-filter-bar.is-stuck {
    padding-left: 14px;
    padding-right: 14px;
  }

  .card-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .module-favorites.has-multi-bar {
    margin-bottom: -14px;
  }

  .favorites-multi-bar {
    bottom: -14px;
    margin-left: -14px;
    margin-right: -14px;
    margin-bottom: -14px;
    padding: 10px 14px;
  }
}
</style>
