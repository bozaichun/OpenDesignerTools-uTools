<script lang="ts" setup>
defineProps({
  /** 缺省页主文案 */
  text: {
    type: String,
    required: true
  },
  /** 辅助说明（可选） */
  description: {
    type: String,
    default: ''
  },
  /** 紧凑模式：用于区块内嵌空态 */
  compact: {
    type: Boolean,
    default: false
  },
  /** 带边框背景：用于卡片/区块内空态 */
  bordered: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
    class="default-page"
    :class="{
      'default-page--compact': compact,
      'default-page--bordered': bordered
    }"
  >
    <span class="iconfont icon-Areality-NoContentAvailable default-page__icon"></span>
    <p class="default-page__text">{{ text }}</p>
    <p v-if="description" class="default-page__desc">{{ description }}</p>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.default-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  gap: 12px;
}

.default-page--compact {
  padding: 32px 16px;
  gap: 10px;

  .default-page__icon {
    font-size: 40px;
  }

  .default-page__text {
    font-size: 12px;
  }
}

.default-page--bordered {
  background: var(--bg-muted);
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
}

.default-page__icon {
  font-size: 48px;
  color: var(--text-tertiary);
  line-height: 1;
}

.default-page__text {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.default-page__desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
  max-width: 360px;
}
</style>
