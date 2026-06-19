<template>
  <div class="color-picker" :class="{ 'is-invalid': invalid }">
    <input
      type="color"
      class="color-picker__native"
      :value="pickerValue"
      :disabled="disabled"
      @input="handlePickerInput"
    />
    <input
      type="text"
      class="color-picker__hex"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleHexInput"
      @blur="handleHexBlur"
    />
  </div>
</template>

<script>
import { parseColor, formatHEX } from '../utils/colorUtils';

export default {
  name: 'ColorPicker',
  props: {
    modelValue: {
      type: String,
      default: '#1677FF'
    },
    placeholder: {
      type: String,
      default: '#FFFFFF'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      invalid: false,
      editingHex: false
    };
  },
  computed: {
    pickerValue() {
      const rgb = parseColor(this.modelValue);
      if (rgb) {
        return formatHEX(rgb).toLowerCase();
      }
      return '#1677ff';
    },
    displayValue() {
      if (this.editingHex) {
        return this.modelValue;
      }
      const rgb = parseColor(this.modelValue);
      if (rgb) {
        return formatHEX(rgb);
      }
      return this.modelValue;
    }
  },
  methods: {
    emitColor(hex) {
      this.$emit('update:modelValue', hex);
      this.$emit('change', hex);
    },
    normalizeHex(value) {
      const rgb = parseColor(value);
      if (!rgb) return null;
      return formatHEX(rgb);
    },
    handlePickerInput(e) {
      const hex = this.normalizeHex(e.target.value);
      if (!hex) return;
      this.invalid = false;
      this.editingHex = false;
      this.emitColor(hex);
    },
    handleHexInput(e) {
      this.editingHex = true;
      this.invalid = false;
      this.$emit('update:modelValue', e.target.value);
    },
    handleHexBlur() {
      this.editingHex = false;
      const hex = this.normalizeHex(this.modelValue);
      if (hex) {
        this.invalid = false;
        this.emitColor(hex);
      } else if (this.modelValue.trim()) {
        this.invalid = true;
      }
    }
  }
};
</script>

<style scoped>
.color-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.color-picker__native {
  width: 40px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  background: var(--bg-input);
  flex-shrink: 0;
}

.color-picker__native:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.color-picker__hex {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md, 6px);
  color: var(--text-primary);
  font-size: 13px;
  font-family: monospace;
}

.color-picker__hex:focus {
  outline: none;
  border-color: var(--accent);
}

.color-picker__hex:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.color-picker.is-invalid .color-picker__hex {
  border-color: var(--text-error, #ef4444);
}
</style>
