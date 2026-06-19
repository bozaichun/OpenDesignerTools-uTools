<template>
  <div class="module-favorites">
    <div v-if="favorites.length > 0" class="favorites-grid">
      <div
        v-for="item in favorites"
        :key="item.hex"
        class="favorite-card"
      >
        <div class="swatch-row">
          <div class="color-swatch" :style="{ background: item.hex }"></div>
          <div class="color-info">
            <div class="color-info-header">
              <button
                class="info-action-btn"
                :title="'复制: ' + item.hex"
                @click.stop="copyValue(item.hex, item.hex)"
              >
                <span class="iconfont icon-Copy"></span>
              </button>
              <div class="color-name">{{ item.name }}</div>
              <FavoriteButton
                :hex="item.hex"
                :name="item.name"
                @unfavorited="loadFavorites"
              />
            </div>
            <div class="color-hex">{{ item.hex }}</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="action-btn" @click="openAddToPaletteDialog(item)">
            添加到色板
          </button>
          <button class="action-btn danger" @click="handleUnfavorite(item)">
            取消收藏
          </button>
        </div>

        <button class="view-color-btn" @click="openColorModal(item)">
          查看颜色值
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">☆</div>
      <div class="empty-title">暂无收藏</div>
      <div class="empty-desc">在预置颜色或其他页面点击收藏图标，将颜色保存到这里</div>
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
          <select v-model="selectedGroupId" class="form-select">
            <option
              v-for="group in paletteGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}（{{ group.colors.length }} 色）
            </option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">色值名称</label>
          <input
            type="text"
            v-model="paletteColorName"
            class="form-input"
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
  </div>
</template>

<script>
import Dialog from '../../components/Dialog.vue';
import FavoriteButton from '../../components/FavoriteButton.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import {
  getAllFavorites,
  removeFavorite
} from '../../utils/favoriteStorage';
import { loadPalettes, savePalettes } from '../PaletteManager/paletteStorage.js';
import { copyToClipboard, showToast } from '../../utils/colorUtils';

export default {
  name: 'MyCollection',
  components: {
    Dialog,
    FavoriteButton,
    ColorFormatDialog
  },
  data() {
    return {
      favorites: [],
      modalVisible: false,
      modalColor: { name: '', hex: '' },
      paletteDialogVisible: false,
      paletteGroups: [],
      selectedGroupId: '',
      paletteColorName: '',
      paletteTargetColor: null
    };
  },
  mounted() {
    this.loadFavorites();
    this.handleFavoritesChanged = () => this.loadFavorites();
    window.addEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  unmounted() {
    window.removeEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  methods: {
    loadFavorites() {
      this.favorites = getAllFavorites();
    },
    openColorModal(item) {
      this.modalColor = { name: item.name, hex: item.hex };
      this.modalVisible = true;
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    },
    handleUnfavorite(item) {
      const result = removeFavorite(item.hex);
      if (!result.ok) {
        showToast(this, result.message || '取消收藏失败', 'error');
        return;
      }
      showToast(this, '已取消收藏', 'success');
      this.loadFavorites();
    },
    openAddToPaletteDialog(item) {
      this.paletteGroups = loadPalettes();
      this.paletteTargetColor = item;
      this.paletteColorName = item.name || item.hex;
      this.selectedGroupId = this.paletteGroups[0]?.id || '';
      this.paletteDialogVisible = true;
    },
    confirmAddToPalette() {
      if (!this.paletteTargetColor || !this.selectedGroupId) {
        showToast(this, '请选择色板分组', 'error');
        return;
      }
      const groups = loadPalettes();
      const group = groups.find((g) => g.id === this.selectedGroupId);
      if (!group) {
        showToast(this, '分组不存在', 'error');
        return;
      }
      const name = this.paletteColorName.trim() || this.paletteTargetColor.hex;
      group.colors.push({
        name,
        color: this.paletteTargetColor.hex,
        note: '来自我的收藏',
        colorType: 'auxiliary'
      });
      savePalettes(groups);
      this.paletteDialogVisible = false;
      showToast(this, '已添加到「' + group.name + '」', 'success');
    },
    goToPaletteManager() {
      this.paletteDialogVisible = false;
      this.$router.push('/PaletteManager');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-favorites {
  width: 100%;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
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
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.color-info {
  flex: 1;
  min-width: 0;
}

.color-info-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-action-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 12px;
    line-height: 1;
  }

  &:hover {
    color: var(--accent);
    background: var(--bg-hover);
  }
}

.color-name {
  flex: 1;
  min-width: 0;
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
  padding-left: 28px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.action-btn {
  flex: 1;
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
    background: #ff4d4f;
    border-color: #ff4d4f;
    color: #fff;
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

.form-select,
.form-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: var(--border-focus);
  }
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

@media (max-width: 1200px) {
  .favorites-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
