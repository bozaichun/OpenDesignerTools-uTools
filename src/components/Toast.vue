<script lang="ts" setup>
import { computed, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success',
    validator: (v) => ['success', 'error', 'info', 'warning'].includes(v)
  },
  duration: {
    type: Number,
    default: 2000
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'close']);

const iconClass = computed(() => {
  if (props.type === 'success') return 'icon-Success';
  if (props.type === 'error') return 'icon-Failure';
  if (props.type === 'warning') return 'icon-Attention';
  return 'icon-Query';
});

watch(() => props.visible, (val) => {
  if (val && props.duration > 0) {
    setTimeout(() => {
      emit('update:visible', false);
      emit('close');
    }, props.duration);
  }
});
</script>

<template>
  <div v-if="visible" class="toast" :class="type">
    <span class="toast-icon iconfont" :class="iconClass"></span>
    <span class="toast-text">{{ message }}</span>
  </div>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: 13px;
  animation: toast-in 0.2s ease;
  pointer-events: auto;

  .toast-icon {
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
  }

  .toast-text {
    line-height: 1.4;
  }

  &.success {
    border-left: 4px solid #10b981;

    .toast-icon {
      color: #10b981;
    }
  }

  &.error {
    border-left: 4px solid var(--text-error);

    .toast-icon {
      color: var(--text-error);
    }
  }

  &.info {
    border-left: 4px solid var(--accent);

    .toast-icon {
      color: var(--accent);
    }
  }

  &.warning {
    background: var(--warning-bg);
    border: 1px solid var(--warning-border);
    border-left: 4px solid var(--warning);
    color: var(--warning-active);

    .toast-icon {
      color: var(--warning);
    }
  }
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
