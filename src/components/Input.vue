<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  invalid: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: undefined
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'ghost', 'mono'].includes(value)
  },
  block: {
    type: Boolean,
    default: true
  },
  flex: {
    type: Boolean,
    default: false
  },
  bold: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'keyup-enter', 'clear']);

const isClearableEnabled = computed(() => {
  if (props.clearable === false) return false;
  if (props.clearable === true) return true;
  return props.variant === 'default';
});

const showClear = computed(() => {
  if (!isClearableEnabled.value || props.disabled || props.readonly) return false;
  return String(props.modelValue ?? '').length > 0;
});

const wrapClass = computed(() => ({
  'app-input-wrap--block': props.block,
  'app-input-wrap--flex': props.flex,
  'app-input-wrap--has-clear': showClear.value
}));

const inputClass = computed(() => [
  `app-input--${props.variant}`,
  {
    'is-invalid': props.invalid,
    'app-input--bold': props.bold
  }
]);

const handleInput = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('input', value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleEnter = (event) => {
  emit('keyup-enter', event);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('input', '');
  emit('clear');
};
</script>

<template>
  <span class="app-input-wrap" :class="wrapClass">
    <input
      :type="type"
      class="app-input"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="handleInput"
      @blur="handleBlur"
      @keyup.enter="handleEnter"
    />
    <button
      v-if="showClear"
      type="button"
      class="app-input__clear"
      title="清空"
      @mousedown.prevent
      @click="handleClear"
    >
      <span class="iconfont icon-Failure"></span>
    </button>
  </span>
</template>

<style lang="scss" scoped>
.app-input-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.app-input-wrap--block {
  width: 100%;
}

.app-input-wrap--flex {
  flex: 1;
  min-width: 0;
}

.app-input {
  width: 100%;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  font-family: inherit;
}

.app-input-wrap--has-clear .app-input--default,
.app-input-wrap--has-clear .app-input--mono {
  padding-right: 36px;
}

.app-input--default {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
}

.app-input--default:focus {
  border-color: var(--border-focus, var(--accent));
}

.app-input--default.is-invalid {
  border-color: var(--text-error, #ef4444);
}

.app-input--ghost {
  padding: 4px 6px 4px 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
}

.app-input--ghost.app-input--bold {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.app-input--ghost:focus {
  border-color: var(--accent);
  background: var(--bg-muted);
}

.app-input--mono {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  font-family: monospace;
}

.app-input--mono:focus {
  border-color: var(--border-focus, var(--accent));
}

.app-input--mono:read-only {
  cursor: default;
}

.app-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-input__clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.app-input__clear .iconfont {
  font-size: 14px;
  line-height: 1;
}

.app-input__clear:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
