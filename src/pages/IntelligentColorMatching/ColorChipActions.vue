<script lang="ts" setup>
import FavoriteButton from '../../components/FavoriteButton.vue';
import { copyToClipboard, showToast } from '../../utils/colorUtils';

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true },
  favoriteName: { type: String, default: '' },
  /** 是否位于色块背景上（使用叠色控件样式） */
  onColor: { type: Boolean, default: true },
  /** 是否显示收藏（非 HEX 色值如阴影字符串时不显示） */
  showFavorite: { type: Boolean, default: true }
});

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function handleCopy() {
  copyToClipboard(props.value);
  showToast(null, `已复制 ${props.label}: ${props.value}`, 'success');
}

function canFavorite() {
  return props.showFavorite && HEX_PATTERN.test(props.value);
}
</script>

<template>
  <div class="color-chip-actions" :class="{ 'color-chip-actions--on-color': onColor }">
    <button
      class="chip-icon-btn"
      type="button"
      title="复制"
      @click.stop="handleCopy"
    >
      <span class="iconfont icon-Copy"></span>
    </button>
    <FavoriteButton
      v-if="canFavorite()"
      :hex="value"
      :name="favoriteName || label"
      class="chip-favorite-btn"
    />
  </div>
</template>

<style lang="scss" scoped>
.color-chip-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

.chip-icon-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-tertiary);

  .iconfont {
    font-size: 12px;
    line-height: 1;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--bg-hover);
  }
}

.color-chip-actions--on-color .chip-icon-btn {
  background: var(--chip-on-color-bg);
  border: 1px solid var(--chip-on-color-border);
  color: var(--chip-on-color-text);

  &:hover {
    background: var(--bg-card);
    border-color: var(--chip-on-color-border);
    color: var(--chip-on-color-text);
  }
}

.color-chip-actions--on-color :deep(.chip-favorite-btn.favorite-btn) {
  background: var(--chip-on-color-bg);
  border: 1px solid var(--chip-on-color-border);
  color: var(--chip-on-color-text);

  &:hover {
    background: var(--bg-card);
    color: var(--accent);
  }

  &.active {
    color: #faad14;
  }
}
</style>
