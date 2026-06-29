<script lang="ts" setup>
import ColorStripGrid from './ColorStripGrid.vue';

defineProps({
  title: { type: String, default: '' },
  columns: {
    type: Number,
    default: 8,
    validator: (value) => [1, 2, 3, 5, 8, 9, 10].includes(value)
  },
  /** 是否显示顶部分隔线 */
  divider: { type: Boolean, default: true }
});
</script>

<template>
  <div
    class="color-strip-section"
    :class="{ 'color-strip-section--plain': !divider }"
  >
    <h4 v-if="title" class="color-strip-section__title">{{ title }}</h4>
    <ColorStripGrid :columns="columns">
      <slot />
    </ColorStripGrid>
  </div>
</template>

<style lang="scss" scoped>
@use './colorStripCard.scss' as *;

.color-strip-section--plain {
  padding-top: 0;
  border-top: none;
}

.color-strip-section__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
