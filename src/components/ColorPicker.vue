<script lang="ts" setup>
import { ref, computed } from 'vue';
import Input from './Input.vue';
import { parseColor, formatHEX } from '../utils/colorUtils';

const props = defineProps({
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
});

const emit = defineEmits(['update:modelValue', 'change', 'clear-all']);

const invalid = ref(false);
const editingHex = ref(false);

const pickerValue = computed(() => {
  const rgb = parseColor(props.modelValue);
  if (rgb) {
    return formatHEX(rgb).toLowerCase();
  }
  return '#1677ff';
});

const displayValue = computed(() => {
  if (editingHex.value) {
    return props.modelValue;
  }
  const rgb = parseColor(props.modelValue);
  if (rgb) {
    return formatHEX(rgb);
  }
  return props.modelValue;
});

const emitColor = (hex) => {
  emit('update:modelValue', hex);
  emit('change', hex);
};

const normalizeHex = (value) => {
  const rgb = parseColor(value);
  if (!rgb) return null;
  return formatHEX(rgb);
};

const handlePickerInput = (e) => {
  const hex = normalizeHex(e.target.value);
  if (!hex) return;
  invalid.value = false;
  editingHex.value = false;
  emitColor(hex);
};

const handleHexInput = (value) => {
  editingHex.value = true;
  invalid.value = false;
  emit('update:modelValue', value);
};

const handleHexBlur = () => {
  editingHex.value = false;
  const hex = normalizeHex(props.modelValue);
  if (hex) {
    invalid.value = false;
    emitColor(hex);
  } else if (props.modelValue.trim()) {
    invalid.value = true;
  }
};

const handleClear = () => {
  invalid.value = false;
  editingHex.value = false;
  emitColor('#FFFFFF');
  emit('clear-all');
};
</script>

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
      @clear="handleClear"
    />
  </div>
</template>

<style lang="scss" scoped>
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
