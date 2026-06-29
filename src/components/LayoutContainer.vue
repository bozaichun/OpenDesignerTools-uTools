<script lang="ts" setup>
defineProps({
  /** 渲染标签 */
  tag: { type: String, default: 'div' },
  /**
   * module：页面模块根容器
   * page：带纵向间距的页面区块
   * section：子区块（仅底部间距）
   * panel：卡片面板（背景 + 边框 + 内边距）
   * flush：无内边距，用于全宽/沉浸式模块
   */
  variant: {
    type: String,
    default: 'module',
    validator: (value) => ['module', 'page', 'section', 'panel', 'flush'].includes(value)
  },
  /** 子元素排列方向 */
  direction: {
    type: String,
    default: 'column',
    validator: (value) => ['column', 'row'].includes(value)
  },
  /** 子元素间距 */
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  /** 大屏最大宽度：content 1280px · wide 1600px */
  maxWidth: {
    type: String,
    default: 'none',
    validator: (value) => ['none', 'content', 'wide'].includes(value)
  }
});
</script>

<template>
  <component
    :is="tag"
    class="layout-container"
    :class="[
      `layout-container--${variant}`,
      `layout-container--gap-${gap}`,
      `layout-container--dir-${direction}`,
      maxWidth !== 'none' ? `layout-container--max-${maxWidth}` : ''
    ]"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
@use './layout/layoutTokens.scss' as *;

.layout-container {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.layout-container--dir-column {
  display: flex;
  flex-direction: column;
}

.layout-container--dir-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
}

.layout-container--gap-none { gap: 0; }
.layout-container--gap-sm { gap: var(--size-8); }
.layout-container--gap-md { gap: var(--size-16); }
.layout-container--gap-lg { gap: var(--size-24); }

.layout-container--module,
.layout-container--page,
.layout-container--section,
.layout-container--flush {
  background: transparent;
}

.layout-container--page {
  margin-bottom: var(--size-24);
}

.layout-container--section {
  margin-bottom: var(--size-20);
}

.layout-container--panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--size-20);
  margin-bottom: var(--size-20);

  @include layout-tablet-only {
    padding: var(--size-16);
  }

  @include layout-mobile-only {
    padding: 14px;
    margin-bottom: var(--size-16);
  }
}

.layout-container--flush {
  padding: 0;
  margin: 0;
}

.layout-container--max-content,
.layout-container--max-wide {
  margin-left: auto;
  margin-right: auto;
}

.layout-container--max-content {
  max-width: $layout-max-content;
}

.layout-container--max-wide {
  max-width: $layout-max-wide;
}

@include layout-large-up {
  .layout-container--max-content,
  .layout-container--max-wide {
    padding-left: var(--size-8);
    padding-right: var(--size-8);
  }
}

@include layout-xlarge-up {
  .layout-container--panel {
    padding: var(--size-24);
  }
}
</style>
