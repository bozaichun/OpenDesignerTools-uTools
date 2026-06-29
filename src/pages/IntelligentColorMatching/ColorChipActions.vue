<script lang="ts" setup>
import ColorActionGroup from '../../components/ColorActionGroup.vue';

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true },
  favoriteName: { type: String, default: '' },
  /** 是否位于色块背景上（使用叠色控件样式） */
  onColor: { type: Boolean, default: true },
  /** 是否显示收藏（非 HEX 色值如阴影字符串时不显示） */
  showFavorite: { type: Boolean, default: true }
});
</script>

<template>
  <ColorActionGroup
    :value="value"
    :copy-label="label"
    :favorite-name="favoriteName || label"
    :variant="onColor ? 'on-color' : 'default'"
    :show-favorite="showFavorite"
    class="color-chip-actions"
  />
</template>

<style lang="scss" scoped>
.color-chip-actions {
  margin-top: 6px;
}
</style>
