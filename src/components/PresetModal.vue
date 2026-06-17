<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2 class="modal-title">预设颜色表</h2>
          <button class="modal-close" @click="$emit('close')" title="关闭">
            &#10005;
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PresetModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close']
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 24px;
}

.modal-dialog {
  width: 100%;
  max-width: 880px;
  max-height: 85vh;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-muted);
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border-primary);
  }
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .modal-dialog,
.modal-fade-leave-active .modal-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
