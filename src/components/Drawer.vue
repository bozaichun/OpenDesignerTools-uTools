<script lang="ts" setup>
import { computed, watch, useSlots, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  placement: {
    type: String,
    default: 'right',
    validator: (val) => ['left', 'right'].includes(val)
  },
  width: {
    type: String,
    default: '320px'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'update:visible']);

const slots = useSlots();

const panelStyle = computed(() => ({ width: props.width, maxWidth: '92vw' }));

let keyHandler = null;

const handleClose = () => {
  if (!props.closeOnOverlay) return;
  emit('close');
  emit('update:visible', false);
};

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  keyHandler = (e) => {
    if (e.key === 'Escape' && props.visible) {
      handleClose();
    }
  };
  document.addEventListener('keydown', keyHandler);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', keyHandler);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    v-if="visible"
    class="drawer-overlay"
    @click.self="handleClose"
    tabindex="-1"
  >
    <!-- 抽屉面板 -->
    <div
      class="drawer-panel"
      :class="['drawer-' + placement]"
      :style="panelStyle"
      @click.stop
    >
      <div class="drawer-header">
        <slot name="header">
          <h3 class="drawer-title">{{ title }}</h3>
        </slot>
        <button
          class="drawer-close-btn"
          @click="handleClose"
          title="关闭"
        >
          <span class="iconfont icon-Failure"></span>
        </button>
      </div>
      <div class="drawer-body">
        <slot></slot>
      </div>
      <div v-if="slots.footer" class="drawer-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  z-index: 1000;
  animation: drawerFadeIn 0.2s ease;
}

@keyframes drawerFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.drawer-panel.drawer-right {
  right: 0;
  border-left: 1px solid var(--border-primary);
  animation: drawerSlideInRight 0.25s ease;
}

.drawer-panel.drawer-left {
  left: 0;
  border-right: 1px solid var(--border-primary);
  animation: drawerSlideInLeft 0.25s ease;
}

@keyframes drawerSlideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes drawerSlideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  flex: 0 0 auto;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.drawer-close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.15s ease;
  flex-shrink: 0;

  .iconfont {
    font-size: 14px;
    line-height: 1;
  }

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border-strong);
  }
}

.drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 12px 8px;
}

.drawer-footer {
  flex: 0 0 auto;
  padding: 12px 16px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-muted);
}

@media (max-width: 640px) {
  .drawer-header {
    padding: 12px;
  }

  .drawer-body {
    padding: 8px;
  }
}
</style>
