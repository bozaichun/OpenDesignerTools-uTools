<script lang="ts" setup>
import { computed, inject } from 'vue';
import { APP_VERSION_LABEL } from '../../config/appVersion.js';

const t = inject('t', (key) => key);

const copyrightText = computed(() => {
  const year = new Date().getFullYear();
  return t('footerCopyright').replace('{year}', year);
});

const versionLabel = APP_VERSION_LABEL;
</script>

<template>
  <footer class="app-footer">
    <span class="footer-side footer-side-left"></span>
    <!-- 版权信息 -->
    <span class="footer-text">{{ copyrightText }}</span>
    <span class="footer-version" :title="versionLabel">{{ versionLabel }}</span>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
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
  justify-self: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer-version {
  justify-self: end;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .app-footer {
    height: 32px;
    padding: 0 14px;
    font-size: 11px;
  }

  .footer-version {
    font-size: 10px;
  }
}
</style>
