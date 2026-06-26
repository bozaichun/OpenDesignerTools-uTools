<script lang="ts" setup>
import { computed, inject } from 'vue';

const t = inject('t', (key) => key);

const copyrightText = computed(() => {
  const year = new Date().getFullYear();
  return t('footerCopyright').replace('{year}', year);
});
</script>

<template>
  <footer class="app-footer">
    <span class="footer-text">{{ copyrightText }}</span>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 20px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1;
  user-select: none;
}

.footer-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .app-footer {
    height: 32px;
    padding: 0 14px;
    font-size: 11px;
  }
}
</style>
