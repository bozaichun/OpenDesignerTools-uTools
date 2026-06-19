<template>
  <div class="module-preset">
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
        <input
          type="text"
          v-model="searchText"
          placeholder="搜索颜色名称或 HEX 值..."
          class="search-input"
        />
        <button
          v-if="searchText"
          class="search-clear-btn"
          @click="searchText = ''"
          title="清空"
        >
          <span class="iconfont icon-Failure"></span>
        </button>
      </div>
    </div>

    <!-- 颜色卡片网格 -->
    <div v-if="filteredColors.length > 0" class="preset-grid">
      <div
        v-for="color in filteredColors"
        :key="color.name"
        class="preset-card"
      >
        <div class="group-tag">{{ color.group }}</div>
        <div class="swatch-row">
          <div class="swatch-wrapper">
            <div
              class="color-swatch"
              :style="{ background: color.hex }"
            ></div>
            <button
              class="swatch-copy-icon"
              :title="'复制颜色名: ' + color.name"
              @click.stop="copyValue(color.name, color.name)"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>
          <div class="color-info">
            <div class="color-name">{{ color.name }}</div>
            <div class="color-hex">{{ color.hex }}</div>
          </div>
        </div>

        <!-- 查看颜色按钮 -->
        <button
          class="view-color-btn"
          @click="openColorModal(color)"
        >
          查看颜色值
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      没有找到匹配的颜色，请尝试其他搜索词。
    </div>

    <!-- 颜色详情遮罩弹框 -->
    <Dialog
      v-model:visible="modalVisible"
      max-width="420px"
      @close="closeModal"
    >
      <template #header>
        <div class="modal-title-row">
          <div
            class="modal-swatch"
            :style="{ background: modalColor.hex }"
          ></div>
          <div>
            <div class="modal-title">{{ modalColor.name }}</div>
            <div class="modal-hex">{{ modalColor.hex }}</div>
          </div>
        </div>
      </template>

      <div
        v-for="item in modalFormatOutputs"
        :key="item.label"
        class="modal-format-row"
      >
        <span class="modal-format-label">{{ item.label }}</span>
        <span class="modal-format-value">{{ item.value }}</span>
        <button
          class="modal-copy-btn"
          @click="copyValue(item.value, item.label)"
        >
          复制
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { PRESET_COLORS, COLOR_GROUPS } from '../../data/presetColors';
import { parseColor, formatHEX, formatRGB, formatRGBA, formatHSL, formatCMYK, formatHSV, copyToClipboard, showToast } from '../../utils/colorUtils';
import Dialog from '../../components/Dialog.vue';

export default {
  name: 'PresetColors',
  components: { Dialog },
  data() {
    return {
      presetColors: PRESET_COLORS,
      colorGroups: COLOR_GROUPS,
      searchText: '',
      activeGroup: null,
      modalVisible: false,
      modalColor: { name: '', hex: '', group: '' }
    };
  },
  computed: {
    filteredColors() {
      const search = this.searchText.trim().toLowerCase();
      return this.presetColors.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search) || c.hex.toLowerCase().includes(search);
        const matchGroup = !this.activeGroup || c.group === this.activeGroup;
        return matchSearch && matchGroup;
      });
    },
    modalFormatOutputs() {
      const rgb = parseColor(this.modalColor.hex);
      if (!rgb) return [];
      const { r, g, b, a } = rgb;
      const rgba = { r, g, b, a };
      return [
        { label: 'HEX', value: formatHEX(rgba) },
        { label: 'RGB', value: formatRGB(rgba) },
        { label: 'RGBA', value: formatRGBA(rgba) },
        { label: 'HSL', value: formatHSL(rgba) },
        { label: 'CMYK', value: formatCMYK(rgba) },
        { label: 'HSV', value: formatHSV(rgba) }
      ];
    }
  },
  methods: {
    openColorModal(color) {
      this.modalColor = { ...color };
      this.modalVisible = true;
    },
    closeModal() {
      this.modalVisible = false;
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  },

};
</script>

<style lang="scss" scoped>
.module-preset {
  width: 100%;
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
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 8px 36px 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: var(--border-focus);
  }
}

.search-clear-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;

  .iconfont {
    font-size: 14px;
    line-height: 1;
  }

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
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
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .swatch-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 10px;
  }
}

/* ============ 色块与复制图标 ============ */
.swatch-wrapper {
  position: relative;
  flex-shrink: 0;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.swatch-copy-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  opacity: 0;

  .iconfont {
    font-size: 10px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

.preset-card:hover .swatch-copy-icon {
  opacity: 1;
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

/* ============ 查看颜色按钮 ============ */
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

/* ============ 空状态 ============ */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ============ 弹框头部 ============ */
.modal-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.modal-hex {
  font-size: 13px;
  color: var(--text-tertiary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  margin-top: 4px;
}

/* ============ 弹框内容 ============ */
.modal-format-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  gap: 12px;
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
  border: 1px solid transparent;

  & + .modal-format-row {
    margin-top: 4px;
  }

  &:hover {
    background: var(--bg-muted);
    border-color: var(--border-primary);
  }
}

.modal-format-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 56px;
  flex-shrink: 0;
  text-align: left;
}

.modal-format-value {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  word-break: break-all;
  min-width: 0;
}

.modal-copy-btn {
  padding: 5px 14px;
  font-size: 12px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 500;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
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

  .swatch-copy-icon {
    opacity: 1;
  }
}
</style>
