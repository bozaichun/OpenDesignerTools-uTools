<script lang="ts" setup>
import { computed } from 'vue';
import { resolveGridCols } from './layoutUtils';

const props = defineProps({
  tag: { type: String, default: 'div' },
  /** 桌面端列数（简写） */
  cols: { type: Number, default: null },
  colsMobile: { type: Number, default: null },
  colsTablet: { type: Number, default: null },
  colsDesktop: { type: Number, default: null },
  colsLarge: { type: Number, default: null },
  colsXlarge: { type: Number, default: null },
  /** fixed：固定列数 · auto-fill：按最小列宽自适应 */
  mode: {
    type: String,
    default: 'fixed',
    validator: (value) => ['fixed', 'auto-fill'].includes(value)
  },
  minColWidth: { type: String, default: '260px' },
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const gridStyle = computed(() => {
  if (props.mode === 'auto-fill') {
    return { '--grid-min-col-width': props.minColWidth };
  }
  const resolved = resolveGridCols(props);
  return {
    '--grid-cols-mobile': String(resolved.mobile),
    '--grid-cols-tablet': String(resolved.tablet),
    '--grid-cols-desktop': String(resolved.desktop),
    '--grid-cols-large': String(resolved.large),
    '--grid-cols-xlarge': String(resolved.xlarge)
  };
});
</script>

<template>
  <component
    :is="tag"
    class="grid-layout"
    :class="[
      `grid-layout--gap-${gap}`,
      mode === 'auto-fill' ? 'grid-layout--auto-fill' : 'grid-layout--fixed'
    ]"
    :style="gridStyle"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
@use './layout/layoutTokens.scss' as *;

.grid-layout {
  display: grid;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.grid-layout--gap-sm { gap: 6px; }
.grid-layout--gap-md { gap: var(--size-12, 12px); }
.grid-layout--gap-lg { gap: var(--size-20); }

.grid-layout--fixed {
  grid-template-columns: repeat(var(--grid-cols-mobile, 1), minmax(0, 1fr));

  @include layout-tablet-up {
    grid-template-columns: repeat(var(--grid-cols-tablet, 2), minmax(0, 1fr));
  }

  @include layout-desktop-up {
    grid-template-columns: repeat(var(--grid-cols-desktop, 4), minmax(0, 1fr));
  }

  @include layout-large-up {
    grid-template-columns: repeat(var(--grid-cols-large, 4), minmax(0, 1fr));
  }

  @include layout-xlarge-up {
    grid-template-columns: repeat(var(--grid-cols-xlarge, 4), minmax(0, 1fr));
  }
}

.grid-layout--auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(min(var(--grid-min-col-width, 260px), 100%), 1fr));

  @include layout-xlarge-up {
    gap: var(--size-16);
  }
}
</style>
