<script lang="ts" setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from '../../components/Dialog.vue';
import Input from '../../components/Input.vue';
import Selector from '../../components/Selector.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import Banner from '../../components/Banner.vue';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';
import {
  getAllFavorites,
  removeFavorite
} from '../../utils/favoriteStorage';
import { loadPalettes, savePalettes } from '../PaletteManager/paletteStorage.js';
import { copyToClipboard, showToast, parseColor, getContrastColor as gcc } from '../../utils/colorUtils';
import {
  getPaletteColumnCount,
  downloadPaletteCard
} from '../../utils/paletteCard';

const router = useRouter();
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const favorites = ref([]);
const modalVisible = ref(false);
const modalColor = ref({ name: '', hex: '' });
const paletteDialogVisible = ref(false);
const colorCardDialogVisible = ref(false);
const paletteGroups = ref([]);
const selectedGroupId = ref('');
const paletteColorName = ref('');
const paletteTargetColor = ref(null);

const paletteCols = computed(() => getPaletteColumnCount(favorites.value.length));

function loadFavorites() {
  favorites.value = getAllFavorites();
  updateHeaderActions();
}

function updateHeaderActions() {
  if (!favorites.value.length) {
    clearHeaderActions();
    return;
  }
  setHeaderActions([
    { label: '生成色卡', onClick: () => openColorCardDialog() }
  ]);
}

function openColorCardDialog() {
  if (!favorites.value.length) {
    showToast(null, '暂无收藏颜色，无法生成色卡', 'error');
    return;
  }
  colorCardDialogVisible.value = true;
}

function handleDownloadColorCard() {
  downloadPaletteCard(favorites.value, {
    title: '我的收藏色卡',
    subtitle: '共 ' + favorites.value.length + ' 种收藏色',
    filenamePrefix: 'my-favorites-palette'
  });
}

function openColorModal(item) {
  modalColor.value = { name: item.name, hex: item.hex };
  modalVisible.value = true;
}

function copyHex(hex) {
  copyToClipboard(hex);
  showToast(null, '已复制 ' + hex, 'success');
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

function handleUnfavorite(item) {
  const result = removeFavorite(item.hex);
  if (!result.ok) {
    showToast(null, result.message || '取消收藏失败', 'error');
    return;
  }
  showToast(null, '已取消收藏', 'success');
  loadFavorites();
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

let handleFavoritesChanged = null;

onMounted(() => {
  loadFavorites();
  handleFavoritesChanged = () => loadFavorites();
  window.addEventListener('color-favorites-changed', handleFavoritesChanged);
});

onUnmounted(() => {
  clearHeaderActions();
  window.removeEventListener('color-favorites-changed', handleFavoritesChanged);
});
</script>

<template>
  <LayoutContainer variant="module" class="module-favorites">
    <Banner
      title="收藏常用色，快速取用"
      description="在预置颜色或其他页面点击收藏图标，将颜色保存到这里统一管理，可一键添加到色板"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/MyCollection.png"
    />
    <GridLayout
      v-if="favorites.length > 0"
      class="favorites-grid"
      :cols="4"
      :cols-large="5"
      :cols-tablet="3"
      :cols-mobile="1"
    >
      <div
        v-for="item in favorites"
        :key="item.hex"
        class="favorite-card"
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

        <div class="card-actions">
          <button class="action-btn" @click="openAddToPaletteDialog(item)">
            添加到色板
          </button>
          <button
            class="card-copy-btn"
            :title="'复制 ' + item.hex"
            @click="copyHex(item.hex)"
          >
            <span class="iconfont icon-Copy"></span>
          </button>
          <button class="action-btn danger" @click="handleUnfavorite(item)">
            取消收藏
          </button>
        </div>

        <button class="view-color-btn" @click="openColorModal(item)">
          更多格式
        </button>
      </div>
    </GridLayout>

    <div v-else class="empty-state">
      <div class="empty-icon">☆</div>
      <div class="empty-title">暂无收藏</div>
      <div class="empty-desc">在预置颜色或其他页面点击收藏图标，将颜色保存到这里</div>
    </div>

    <ColorFormatDialog
      v-model:visible="modalVisible"
      :color="modalColor"
    />

    <!-- 生成色卡预览弹框 -->
    <Dialog
      :visible="colorCardDialogVisible"
      title="色卡预览"
      max-width="860px"
      @close="colorCardDialogVisible = false"
    >
      <div class="palette-dialog-body">
        <div v-if="!favorites.length" class="palette-empty">暂无可用色卡数据</div>
        <div v-else class="palette-grid" :class="'palette-cols-' + paletteCols">
          <div
            v-for="item in favorites"
            :key="item.hex"
            class="palette-card"
          >
            <div
              class="palette-swatch"
              :style="{ background: item.hex }"
            ></div>
            <div class="palette-value">
              <span>{{ item.hex }}</span>
              <button
                class="palette-copy"
                @click.stop="copyHex(item.hex)"
                title="复制颜色值"
              >
                <span class="iconfont icon-Copy"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="palette-dialog-footer">
          <button class="palette-btn secondary" @click="colorCardDialogVisible = false">取消</button>
          <button class="palette-btn" @click="handleDownloadColorCard">下载色卡</button>
        </div>
      </template>
    </Dialog>

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
}

.favorite-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
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

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
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

.action-btn {
  flex-shrink: 0;
  padding: 5px 8px;
  font-size: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  &.danger:hover {
    background: var(--error);
    border-color: var(--error);
    color: var(--text-invert);
  }
}

.view-color-btn {
  width: 100%;
  padding: 6px 10px;
  font-size: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  max-width: 320px;
  margin: 0 auto;
  line-height: 1.5;
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
  .card-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.palette-dialog-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: -16px -20px 0;
  padding: 0;
}

.palette-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.palette-grid {
  display: grid;
  gap: 12px;
  padding: 12px;
  max-height: min(52vh, 480px);
  overflow-y: auto;
}

.palette-grid.palette-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.palette-grid.palette-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.palette-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
  }
}

.palette-swatch {
  width: 100%;
  aspect-ratio: 2 / 1;
  min-height: 80px;
}

.palette-value {
  padding: 10px 12px;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  background: var(--bg-muted);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.palette-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  padding: 0;

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.palette-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.palette-btn {
  min-width: 88px;
  height: 34px;
  padding: 0 18px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.88;
  }

  &.secondary {
    background: var(--bg-card);
    color: var(--text-secondary);
    border-color: var(--border-primary);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      opacity: 1;
    }
  }
}

@media (max-width: 720px) {
  .palette-grid.palette-cols-3,
  .palette-grid.palette-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .palette-dialog-footer {
    flex-direction: column-reverse;
    align-items: stretch;

    .palette-btn {
      width: 100%;
    }
  }
}
</style>
