<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import {
  isFavorite,
  toggleFavorite,
  normalizeFavoriteHex
} from '../utils/favoriteStorage';
import { showToast } from '../utils/colorUtils';

const props = defineProps({
  hex: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'icon',
    validator: (value) => ['icon', 'text'].includes(value)
  }
});

const emit = defineEmits(['favorited', 'unfavorited']);

const instance = getCurrentInstance();
const favorited = ref(false);

const syncState = () => {
  favorited.value = isFavorite(props.hex);
};

watch(() => props.hex, () => {
  syncState();
}, {
  immediate: true
});

let handleFavoritesChanged;

onMounted(() => {
  handleFavoritesChanged = () => syncState();
  window.addEventListener('color-favorites-changed', handleFavoritesChanged);
});

onUnmounted(() => {
  window.removeEventListener('color-favorites-changed', handleFavoritesChanged);
});

const handleToggle = () => {
  const wasFavorited = favorited.value;
  const result = toggleFavorite({
    hex: props.hex,
    name: props.name || props.hex
  });
  if (!result.ok) {
    showToast(instance?.proxy, result.message || '操作失败', 'error');
    return;
  }
  favorited.value = !wasFavorited;
  const displayHex = normalizeFavoriteHex(props.hex) || props.hex;
  showToast(
    instance?.proxy,
    wasFavorited ? '已取消收藏' : `已将 “${displayHex}” 加入我的收藏`,
    'success'
  );
  emit(wasFavorited ? 'unfavorited' : 'favorited', {
    hex: props.hex,
    name: props.name || props.hex
  });
};
</script>

<template>
  <button
    class="favorite-btn"
    :class="{ active: favorited, 'favorite-btn--text': variant === 'text' }"
    :title="favorited ? '取消收藏' : '收藏'"
    @click.stop="handleToggle"
  >
    <span v-if="variant === 'text'" class="favorite-text">{{ favorited ? '已收藏' : '收藏' }}</span>
    <span
      v-else
      class="iconfont favorite-icon"
      :class="favorited ? 'icon-Areality-Collection' : 'icon-Collection'"
    ></span>
  </button>
</template>

<style lang="scss" scoped>
.favorite-btn {
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
}

.favorite-icon {
  font-size: 12px;
  line-height: 1;
}

.favorite-btn:hover {
  color: var(--accent);
  background: var(--bg-hover);
}

.favorite-btn.active {
  color: #faad14;
}

.favorite-btn.active:hover {
  color: #d48806;
}

.favorite-btn--text {
  width: auto;
  height: auto;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-primary);
}

.favorite-btn--text:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-card);
}

.favorite-btn--text.active {
  color: var(--accent);
  border-color: var(--accent-light);
  background: var(--accent-soft);
}

.favorite-btn--text.active:hover {
  color: var(--accent-hover);
  border-color: var(--accent);
}
</style>
