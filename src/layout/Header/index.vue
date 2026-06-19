<template>
  <header class="page-header">
    <div class="header-left">
      <SectionTitle :title="title" mode="primary" />
      <template v-if="isDetail">
        <span class="detail-back" @click="$emit('back')" title="返回">
          <span class="iconfont icon-Back"></span>
        </span>
      </template>
    </div>
    <div class="header-actions">
      <slot name="actions"></slot>
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
    </div>
  </header>
</template>

<script>
import SectionTitle from '../../components/SectionTitle.vue';

export default {
  name: 'PageHeader',
  components: {
    SectionTitle
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    isDetail: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-mode', 'show-setting', 'back']
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

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--accent);
  cursor: pointer;
  user-select: none;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all 0.15s ease;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }
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

@media (max-width: 640px) {
  .page-header {
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 14px;
  }

  .header-actions {
    gap: 6px;
  }
}
</style>
