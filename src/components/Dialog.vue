<template>
  <div
    v-if="visible"
    class="dialog-overlay"
    @click.self="handleClose"
    tabindex="-1"
  >
    <div class="dialog-card" :style="cardStyle" @click.stop>
      <div class="dialog-header">
        <slot name="header">
          <h3 class="dialog-title">{{ title }}</h3>
        </slot>
        <button
          class="dialog-close-btn"
          @click="handleClose"
          title="关闭"
        >
          <span class="iconfont icon-Failure"></span>
        </button>
      </div>
      <div class="dialog-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: String,
      default: '680px'
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'update:visible'],
  computed: {
    cardStyle() {
      return {
        maxWidth: this.maxWidth
      };
    }
  },
  watch: {
    visible(val) {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  mounted() {
    this._keyHandler = (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.handleClose();
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._keyHandler);
    document.body.style.overflow = '';
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this._keyHandler);
    document.body.style.overflow = '';
  },
  methods: {
    handleClose() {
      this.$emit('close');
      this.$emit('update:visible', false);
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: dialogFadeIn 0.2s ease;
}

@keyframes dialogFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  animation: dialogSlideIn 0.2s ease;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dialog-close-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  flex-shrink: 0;

  .iconfont {
    font-size: 16px;
    line-height: 1;
  }

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

.dialog-body {
  padding: 16px 20px 24px;
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 640px) {
  .dialog-overlay {
    padding: 12px;
  }
}
</style>
