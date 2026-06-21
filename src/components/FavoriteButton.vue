<template>
  <button
    class="favorite-btn"
    :class="{ active: favorited }"
    :title="favorited ? '取消收藏' : '收藏'"
    @click.stop="handleToggle"
  >
    <span class="favorite-icon">{{ favorited ? '★' : '☆' }}</span>
  </button>
</template>

<script>
import {
  isFavorite,
  toggleFavorite,
  normalizeFavoriteHex
} from '../utils/favoriteStorage';
import { showToast } from '../utils/colorUtils';

export default {
  name: 'FavoriteButton',
  props: {
    hex: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      favorited: false
    };
  },
  watch: {
    hex: {
      immediate: true,
      handler() {
        this.syncState();
      }
    }
  },
  mounted() {
    this.handleFavoritesChanged = () => this.syncState();
    window.addEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  unmounted() {
    window.removeEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  methods: {
    syncState() {
      this.favorited = isFavorite(this.hex);
    },
    handleToggle() {
      const wasFavorited = this.favorited;
      const result = toggleFavorite({
        hex: this.hex,
        name: this.name || this.hex
      });
      if (!result.ok) {
        showToast(this, result.message || '操作失败', 'error');
        return;
      }
      this.favorited = !wasFavorited;
      const displayHex = normalizeFavoriteHex(this.hex) || this.hex;
      showToast(
        this,
        wasFavorited ? '已取消收藏' : `已将 “${displayHex}” 加入我的收藏`,
        'success'
      );
      this.$emit(wasFavorited ? 'unfavorited' : 'favorited', {
        hex: this.hex,
        name: this.name || this.hex
      });
    }
  }
};
</script>

<style scoped>
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
  font-size: 16px;
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
</style>
