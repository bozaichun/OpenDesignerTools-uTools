<template>
  <div class="color-picker" :class="{ 'is-invalid': invalid }">
    <input
      type="color"
      class="color-picker__native"
      :value="pickerValue"
      :disabled="disabled"
      @input="handlePickerInput"
    />
    <Input
      variant="mono"
      :block="false"
      :flex="true"
      :clearable="clearable"
      :model-value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="invalid"
      @update:model-value="handleHexInput"
      @blur="handleHexBlur"
    />
  </div>
</template>

<script>
import Input from './Input.vue';
import { parseColor, formatHEX } from '../utils/colorUtils';

export default {
  name: 'ColorPicker',
  components: { Input },
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
    },
    clearable: {
      type: Boolean,
      default: true
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
    handleHexInput(value) {
      this.editingHex = true;
      this.invalid = false;
      this.$emit('update:modelValue', value);
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
  width: 100%;
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
</style>
