<template>
  <div class="module-preset">
    <!-- 搜索和分组过滤 -->
    <div class="preset-filter-bar">
      <input
        type="text"
        v-model="searchText"
        placeholder="搜索颜色名称或 HEX 值..."
        class="search-input"
      />
    </div>

    <div class="group-chips" style="margin-bottom: 16px;">
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

    <!-- 颜色卡片网格 -->
    <div v-if="filteredColors.length > 0" class="preset-grid">
      <div
        v-for="color in filteredColors"
        :key="color.name"
        class="preset-card"
      >
        <div class="swatch-row" @click="toggleExpand(color.name)">
          <div
            class="color-swatch"
            :style="{ background: color.hex }"
            :title="'点击复制 ' + color.hex"
            @click.stop="copyValue(color.hex, color.hex)"
          ></div>
          <div>
            <div class="color-name">{{ color.name }}</div>
            <div class="color-hex">{{ color.hex }}</div>
            <div class="group-tag">{{ color.group }}</div>
          </div>
        </div>

        <!-- 展开的多格式输出 -->
        <div v-if="expandedColor === color.name" class="preset-expanded">
          <div
            v-for="item in getFormatOutputs(color.hex)"
            :key="item.label"
            class="format-copy-row"
          >
            <span class="format-label">{{ item.label }}</span>
            <span class="format-value">{{ item.value }}</span>
            <button
              class="copy-btn"
              @click="copyValue(item.value, item.label)"
            >
              复制
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      没有找到匹配的颜色，请尝试其他搜索词。
    </div>
  </div>
</template>

<script>
import { PRESET_COLORS, COLOR_GROUPS } from '../../data/presetColors';
import { parseColor, formatHEX, formatRGB, formatRGBA, formatHSL, formatCMYK, formatHSV, copyToClipboard, showToast } from '../../utils/colorUtils';

export default {
  name: 'PresetColors',
  data() {
    return {
      presetColors: PRESET_COLORS,
      colorGroups: COLOR_GROUPS,
      searchText: '',
      activeGroup: null,
      expandedColor: null
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
    }
  },
  methods: {
    toggleExpand(name) {
      this.expandedColor = this.expandedColor === name ? null : name;
    },
    getFormatOutputs(hex) {
      const rgb = parseColor(hex);
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
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-preset {
  width: 100%;
}

.preset-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;

  .search-input {
    flex: 1;
    min-width: 200px;
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
}

.group-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
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

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.preset-card {
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

  .swatch-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  .color-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    word-break: break-all;
  }

  .color-hex {
    font-size: 12px;
    color: var(--text-tertiary);
    font-family: 'SF Mono', Consolas, Monaco, monospace;
  }

  .group-tag {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }
}

.preset-expanded {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-primary);
}

.format-copy-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  gap: 8px;

  .format-label {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 52px;
    font-weight: 500;
  }

  .format-value {
    flex: 1;
    font-size: 12px;
    color: var(--text-primary);
    font-family: 'SF Mono', Consolas, Monaco, monospace;
    word-break: break-all;
    text-align: left;
  }

  .copy-btn {
    padding: 4px 10px;
    font-size: 11px;
    min-width: 50px;
    background: var(--accent);
    color: var(--text-invert);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 640px) {
  .preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
}
</style>
