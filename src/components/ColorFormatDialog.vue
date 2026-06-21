<template>
  <Dialog
    :visible="visible"
    max-width="420px"
    @update:visible="$emit('update:visible', $event)"
    @close="$emit('update:visible', false)"
  >
    <template #header>
      <div class="modal-title-row">
        <div class="modal-swatch" :style="{ background: color.hex }"></div>
        <div class="modal-title-wrap">
          <div class="modal-title">{{ color.hex }}</div>
        </div>
      </div>
    </template>

    <div
      v-for="item in formatOutputs"
      :key="item.label"
      class="modal-format-row"
    >
      <span class="modal-format-label">{{ item.label }}</span>
      <span class="modal-format-value">{{ item.value }}</span>
      <button class="modal-copy-btn" @click="copyValue(item.value, item.label)">
        复制
      </button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue';
import {
  parseColor,
  formatHEX,
  formatRGB,
  formatRGBA,
  formatHSL,
  formatCMYK,
  formatHSV,
  copyToClipboard,
  showToast
} from '../utils/colorUtils';

export default {
  name: 'ColorFormatDialog',
  components: { Dialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    color: {
      type: Object,
      default: () => ({ name: '', hex: '' })
    }
  },
  emits: ['update:visible'],
  computed: {
    formatOutputs() {
      const rgb = parseColor(this.color.hex);
      if (!rgb) return [];
      const { r, g, b, a } = rgb;
      const rgba = { r, g, b, a };
      return [
        { label: 'HEX', value: formatHEX(rgba) },
        { label: 'RGB', value: formatRGB(rgba) },
        { label: 'RGBA', value: formatRGBA(rgba) },
        { label: 'HSL', value: formatHSL(rgba) },
        { label: 'CMYK', value: formatCMYK(rgba) },
        { label: 'HSV', value: formatHSV(rgba) }
      ];
    }
  },
  methods: {
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  }
};
</script>

<style scoped>
.modal-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.modal-title-wrap {
  min-width: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  line-height: 1.2;
  word-break: break-all;
}

.modal-format-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  gap: 12px;
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
  border: 1px solid transparent;
}

.modal-format-row + .modal-format-row {
  margin-top: 4px;
}

.modal-format-row:hover {
  background: var(--bg-muted);
  border-color: var(--border-primary);
}

.modal-format-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 56px;
  flex-shrink: 0;
  text-align: left;
}

.modal-format-value {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  word-break: break-all;
  min-width: 0;
}

.modal-copy-btn {
  padding: 5px 14px;
  font-size: 12px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 500;
  transition: opacity 0.15s ease;
}

.modal-copy-btn:hover {
  opacity: 0.85;
}
</style>
