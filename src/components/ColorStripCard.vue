<script lang="ts" setup>
import { computed } from 'vue';
import ColorActionGroup from './ColorActionGroup.vue';
import { parseColor, getContrastColor as gcc } from '../utils/colorUtils';

const props = defineProps({
  color: { type: String, required: true },
  /** 色块中央标签（如色阶、百分比） */
  label: { type: String, default: '' },
  /** 色块中央标题（如邻近色、互补色名称） */
  title: { type: String, default: '' },
  copyLabel: { type: String, default: '' },
  favoriteName: { type: String, default: '' },
  showFavorite: { type: Boolean, default: true }
});

const swatchLabelColor = computed(() => {
  const rgb = parseColor(props.color);
  if (!rgb) return '#000000';
  return gcc(rgb);
});

const resolvedCopyLabel = computed(() => props.copyLabel || props.favoriteName || props.color);
const resolvedFavoriteName = computed(() => props.favoriteName || props.copyLabel || props.color);
</script>

<template>
  <div class="color-strip-cell">
    <div class="color-strip-swatch" :style="{ background: color }">
      <span
        v-if="title"
        class="color-strip-title"
        :style="{ color: swatchLabelColor }"
      >{{ title }}</span>
      <span
        v-else-if="label"
        class="color-strip-label"
        :style="{ color: swatchLabelColor }"
      >{{ label }}</span>
    </div>
    <div class="color-strip-meta">
      <span class="color-strip-hex">{{ color }}</span>
      <ColorActionGroup
        :value="color"
        :copy-label="resolvedCopyLabel"
        :favorite-name="resolvedFavoriteName"
        :show-favorite="showFavorite"
        variant="default"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './colorStripCard.scss' as *;
</style>
