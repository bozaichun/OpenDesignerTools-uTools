<template>
  <div class="module-preset">
    <Banner
      title="按色系浏览，一键获取颜色值"
      description="覆盖红橙黄绿蓝紫黑白灰等常用色系，支持名称与 HEX 搜索快速定位"
      icon="icon-Areality-Color"
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
      >
        <div class="group-tag">{{ color.group }}</div>
        <div class="swatch-row">
          <div class="color-swatch" :style="{ background: color.hex }"></div>
          <div class="color-info">
            <div class="color-name">{{ color.name }}</div>
            <div class="color-hex">{{ color.hex }}</div>
          </div>
        </div>

        <div class="card-action-bar">
          <button
            class="view-color-btn"
            @click="openColorModal(color)"
          >
            查看颜色值
          </button>
          <button
            class="card-icon-btn"
            :title="'复制颜色名: ' + color.name"
            @click.stop="copyValue(color.name, color.name)"
          >
            <span class="iconfont icon-Copy"></span>
          </button>
          <FavoriteButton :hex="color.hex" :name="color.name" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      没有找到匹配的颜色，请尝试其他搜索词。
    </div>

    <ColorFormatDialog
      v-model:visible="modalVisible"
      :color="modalColor"
    />
  </div>
</template>

<script>
import { PRESET_COLORS, COLOR_GROUPS } from '../../data/presetColors';
import { copyToClipboard, showToast } from '../../utils/colorUtils';
import FavoriteButton from '../../components/FavoriteButton.vue';
import Input from '../../components/Input.vue';
import ColorFormatDialog from '../../components/ColorFormatDialog.vue';
import Banner from '../../components/Banner.vue';

export default {
  name: 'PresetColors',
  components: { FavoriteButton, Input, ColorFormatDialog, Banner },
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
  },
  methods: {
    openColorModal(color) {
      this.modalColor = { ...color };
      this.modalVisible = true;
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
}

.view-color-btn {
  flex: 1;
  min-width: 0;
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
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
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
}
</style>
