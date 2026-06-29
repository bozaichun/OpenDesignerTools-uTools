<script lang="ts" setup>
const props = defineProps({
  columns: {
    type: Number,
    default: 8,
    validator: (value) => [1, 2, 3, 5, 8, 9, 10].includes(value)
  }
});
</script>

<template>
  <div class="color-strip-grid" :class="`color-strip-grid--${columns}`">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use './colorStripCard.scss' as *;
</style>
