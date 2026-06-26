<script lang="ts" setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  },
  inline: {
    type: Boolean,
    default: false
  },
  local: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div v-if="visible" class="loading-overlay" :class="{ 'loading-inline': inline, 'loading-local': local }">
    <div class="loading-content">
      <img class="loading-spinner" src="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/icon/project/loading.gif" alt="loading" />
      <div class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;

  &.loading-inline {
    position: absolute;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 8px;
    z-index: 10;
  }

  &.loading-local {
    position: absolute;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 0;
    z-index: 10;
  }
}

@media (prefers-color-scheme: dark) {
  .loading-overlay.loading-inline {
    background: rgba(30, 30, 30, 0.75);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.loading-text {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.loading-overlay.loading-inline .loading-text {
  color: rgb(88, 164, 246);
  text-shadow: none;
}

.loading-overlay.loading-local .loading-text {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
</style>
