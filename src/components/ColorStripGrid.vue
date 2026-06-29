<script lang="ts" setup>
import { computed } from 'vue';
import GridLayout from './GridLayout.vue';
import { resolveColorStripCols } from './layoutUtils';

const props = defineProps({
  columns: {
    type: Number,
    default: 8,
    validator: (value) => [1, 2, 3, 5, 8, 9, 10].includes(value)
  }
});

const stripCols = computed(() => resolveColorStripCols(props.columns));
</script>

<template>
  <GridLayout
    class="color-strip-grid"
    gap="sm"
    :cols="columns"
    :cols-mobile="stripCols.mobile"
    :cols-tablet="stripCols.tablet"
    :cols-large="stripCols.large"
    :cols-xlarge="stripCols.xlarge"
  >
    <slot />
  </GridLayout>
</template>

<style lang="scss" scoped>
@use './colorStripCard.scss' as *;
</style>
