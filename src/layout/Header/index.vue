<script lang="ts" setup>
import SectionTitle from '../../components/SectionTitle.vue';

defineProps({
  title: {
    type: String,
    default: ''
  },
  isDetail: {
    type: Boolean,
    default: false
  },
  subtitle: {
    type: String,
    default: ''
  }
});

defineEmits(['toggle-mode', 'show-setting', 'back']);
</script>

<template>
  <header class="page-header">
    <div class="header-left">
      <SectionTitle :title="title" mode="primary" />
      <template v-if="isDetail">
        <span class="detail-back" @click="$emit('back')" title="返回">
          <span class="iconfont icon-Back"></span>
        </span>
      </template>
      <span v-if="subtitle" class="header-subtitle">
        <span class="header-subtitle-text">{{ subtitle }}</span>
        <span class="header-subtitle-prompt-wrap">
          <span class="header-subtitle-prompt iconfont icon-Prompt"></span>
          <span class="header-subtitle-tip">{{ subtitle }}</span>
        </span>
      </span>
    </div>
    <div class="header-actions">
      <slot name="actions"></slot>
      <slot name="extra"></slot>
      <slot name="mobile-expand"></slot>
      <button class="icon-btn" @click="$emit('toggle-mode')" title="切换模式">
        <span class="iconfont icon-Areality-ModeSwitching"></span>
      </button>
      <button class="icon-btn" @click="$emit('show-setting')" title="设置">
        <span class="iconfont icon-Areality-Setting"></span>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  height: 56px;
  padding: 0 20px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
  min-width: 0;
  flex: 1;
}

.header-subtitle-prompt-wrap {
  display: none;
  position: relative;
  flex-shrink: 0;
}

.header-subtitle-prompt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
  cursor: help;
  user-select: none;
  line-height: 1;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
}

.header-subtitle-tip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: max-content;
  max-width: min(320px, 70vw);
  padding: 8px 12px;
  background: rgba(30, 33, 38, 0.95);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}

.header-subtitle-prompt-wrap:hover .header-subtitle-tip {
  visibility: visible;
  opacity: 1;
}

@media (max-width: 1024px) {
  .header-subtitle {
    flex: 0 0 auto;
  }

  .header-subtitle-text {
    display: none;
  }

  .header-subtitle-prompt-wrap {
    display: inline-flex;
    align-items: center;
  }
}

.detail-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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
  width: 30px;
  height: 30px;
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
  }

  .header-left {
    flex-wrap: nowrap;
  }

  .header-actions {
    gap: 6px;
  }
}

:slotted(.header-expand-btn) {
  display: none;
}

@media (max-width: 640px) {
  :slotted(.header-expand-btn) {
    display: inline-flex;
  }
}
</style>
