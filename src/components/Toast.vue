<template>
  <div v-if="visible" class="toast" :class="type">
    <slot>{{ message }}</slot>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'success',
      validator: (v) => ['success', 'error', 'info'].includes(v)
    },
    duration: {
      type: Number,
      default: 2000
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(val) {
      if (val && this.duration > 0) {
        setTimeout(() => {
          this.$emit('update:visible', false);
          this.$emit('close');
        }, this.duration);
      }
    }
  }
};
</script>

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
  padding: 10px 20px;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: 13px;
  animation: toast-in 0.2s ease;
  pointer-events: auto;

  &.success {
    border-left: 4px solid #10b981;
  }

  &.error {
    border-left: 4px solid var(--text-error);
  }

  &.info {
    border-left: 4px solid var(--accent);
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
