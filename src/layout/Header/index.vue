<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <div class="header-actions">
      <button
        class="icon-btn"
        @click="$emit('toggle-mode')"
        title="切换模式"
      >
        <span class="iconfont icon-Areality-ModeSwitching"></span>
      </button>
      <button
        class="icon-btn"
        @click="$emit('show-setting')"
        title="设置"
      >
        <span class="iconfont icon-Areality-Setting"></span>
      </button>
      <button class="palette-btn" @click="$emit('show-preset-modal')" title="色彩库">
        <span class="iconfont icon-Areality-Color palette-icon"></span>
        <span class="palette-text">色彩库</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['show-preset-modal', 'toggle-mode', 'show-setting']
};
</script>

<style lang="scss" scoped>
.page-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-primary);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
  }
}

.palette-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
}

.palette-icon {
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 640px) {
  .page-header {
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 14px;
  }

  .page-title {
    font-size: 17px;
  }

  .header-actions {
    gap: 6px;
  }

  .palette-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>
