<script lang="ts" setup>
import CopyIconButton from './CopyIconButton.vue';
import FavoriteButton from './FavoriteButton.vue';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  copyLabel: {
    type: String,
    default: ''
  },
  favoriteName: {
    type: String,
    default: ''
  },
  /** default：卡片/表格；on-color：色块背景上；input：表单输入行；compact：紧凑；card：色卡底部操作栏 */
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'on-color', 'compact', 'input', 'card'].includes(value)
  },
  showFavorite: {
    type: Boolean,
    default: true
  },
  showToast: {
    type: Boolean,
    default: true
  }
});

function canFavorite() {
  return props.showFavorite && HEX_PATTERN.test(props.value);
}

function resolvedCopyLabel() {
  return props.copyLabel || props.favoriteName || props.value;
}

function resolvedFavoriteName() {
  return props.favoriteName || props.copyLabel || props.value;
}
</script>

<template>
  <div
    class="color-action-group"
    :class="[
      `color-action-group--${variant}`,
      { 'color-action-group--favorite-only': !canFavorite() }
    ]"
  >
    <slot name="prefix" />
    <FavoriteButton
      v-if="canFavorite()"
      :hex="value"
      :name="resolvedFavoriteName()"
      class="color-action-group__favorite"
    />
    <CopyIconButton
      :value="value"
      :label="resolvedCopyLabel()"
      :show-toast-msg="showToast"
      class="color-action-group__copy"
    />
  </div>
</template>

<style lang="scss" scoped>
.color-action-group {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.color-action-group--on-color,
.color-action-group--compact {
  :deep(.copy-icon-btn),
  :deep(.color-action-group__favorite.favorite-btn) {
    width: 16px;
    height: 16px;
    background: var(--chip-on-color-bg);
    border: 1px solid var(--chip-on-color-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: var(--chip-on-color-text);

    .iconfont,
    .favorite-icon {
      font-size: 9px;
    }
  }

  :deep(.copy-icon-btn:hover),
  :deep(.color-action-group__favorite.favorite-btn:hover) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  :deep(.copy-icon-btn--copied) {
    background: var(--chip-on-color-bg);
    border-color: var(--chip-on-color-border);
    color: var(--success);
  }

  :deep(.copy-icon-btn--copied:hover) {
    background: var(--chip-on-color-bg);
    border-color: var(--chip-on-color-border);
    color: var(--success);
  }

  :deep(.color-action-group__favorite.favorite-btn.active) {
    color: #faad14;
    background: var(--chip-on-color-bg);
    border-color: var(--chip-on-color-border);
  }

  :deep(.color-action-group__favorite.favorite-btn.active:hover) {
    color: #d48806;
    background: var(--chip-on-color-bg);
    border-color: var(--chip-on-color-border);
  }
}

.color-action-group--default {
  :deep(.color-action-group__favorite.favorite-btn) {
    width: 20px;
    height: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 4px;

    .favorite-icon {
      font-size: 12px;
    }
  }

  :deep(.color-action-group__favorite.favorite-btn:hover) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  :deep(.color-action-group__favorite.favorite-btn.active) {
    color: #faad14;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }

  :deep(.color-action-group__favorite.favorite-btn.active:hover) {
    color: #d48806;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }
}

.color-action-group--card {
  :deep(.copy-icon-btn),
  :deep(.color-action-group__favorite.favorite-btn),
  :deep(.color-action-group__extra-btn) {
    width: 24px;
    height: 24px;
    padding: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    .iconfont,
    .favorite-icon {
      font-size: 14px;
      line-height: 1;
    }
  }

  :deep(.color-action-group__extra-btn) {
    &:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--text-invert);
    }
  }

  :deep(.copy-icon-btn:hover),
  :deep(.color-action-group__favorite.favorite-btn:hover) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  :deep(.copy-icon-btn--copied) {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
  }

  :deep(.copy-icon-btn--copied:hover) {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
  }

  :deep(.color-action-group__favorite.favorite-btn.active) {
    color: #faad14;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }

  :deep(.color-action-group__favorite.favorite-btn.active:hover) {
    color: #d48806;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }
}

.color-action-group--input {
  :deep(.copy-icon-btn),
  :deep(.color-action-group__favorite.favorite-btn) {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-sm);

    .iconfont,
    .favorite-icon {
      font-size: 12px;
    }
  }

  :deep(.color-action-group__favorite.favorite-btn) {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
  }

  :deep(.color-action-group__favorite.favorite-btn:hover) {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }

  :deep(.color-action-group__favorite.favorite-btn.active) {
    color: #faad14;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }

  :deep(.color-action-group__favorite.favorite-btn.active:hover) {
    color: #d48806;
    background: var(--bg-card);
    border-color: var(--border-primary);
  }

  @media (max-width: 640px) {
    :deep(.copy-icon-btn),
    :deep(.color-action-group__favorite.favorite-btn) {
      width: 30px;
      height: 30px;

      .iconfont,
      .favorite-icon {
        font-size: 11px;
      }
    }
  }
}
</style>
