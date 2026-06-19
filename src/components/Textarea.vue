<template>
  <span class="app-textarea-wrap" :class="wrapClass">
    <textarea
      class="app-textarea"
      :class="textareaClass"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :style="resizeStyle"
      @input="handleInput"
      @blur="handleBlur"
    />
    <button
      v-if="showClear"
      type="button"
      class="app-textarea__clear"
      title="清空"
      @mousedown.prevent
      @click="handleClear"
    >
      <span class="iconfont icon-Failure"></span>
    </button>
  </span>
</template>

<script>
export default {
  name: 'AppTextarea',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容'
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
      validator: (value) => ['default', 'ghost'].includes(value)
    },
    block: {
      type: Boolean,
      default: true
    },
    flex: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: 3
    },
    resize: {
      type: String,
      default: 'vertical',
      validator: (value) => ['none', 'vertical', 'horizontal', 'both'].includes(value)
    }
  },
  emits: ['update:modelValue', 'input', 'blur', 'clear'],
  computed: {
    isClearableEnabled() {
      if (this.clearable === false) return false;
      if (this.clearable === true) return true;
      return this.variant === 'default';
    },
    showClear() {
      if (!this.isClearableEnabled || this.disabled || this.readonly) return false;
      return String(this.modelValue ?? '').length > 0;
    },
    wrapClass() {
      return {
        'app-textarea-wrap--block': this.block,
        'app-textarea-wrap--flex': this.flex,
        'app-textarea-wrap--has-clear': this.showClear
      };
    },
    textareaClass() {
      return [
        `app-textarea--${this.variant}`,
        { 'is-invalid': this.invalid }
      ];
    },
    resizeStyle() {
      return { resize: this.resize };
    }
  },
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.$emit('update:modelValue', value);
      this.$emit('input', value);
    },
    handleBlur(event) {
      this.$emit('blur', event);
    },
    handleClear() {
      this.$emit('update:modelValue', '');
      this.$emit('input', '');
      this.$emit('clear');
    }
  }
};
</script>

<style scoped>
.app-textarea-wrap {
  position: relative;
  display: inline-flex;
  align-items: stretch;
}

.app-textarea-wrap--block {
  width: 100%;
}

.app-textarea-wrap--flex {
  flex: 1;
  min-width: 0;
}

.app-textarea {
  width: 100%;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  font-family: inherit;
  line-height: 1.5;
}

.app-textarea-wrap--has-clear .app-textarea--default {
  padding-right: 36px;
}

.app-textarea--default {
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  min-height: 72px;
}

.app-textarea--default::placeholder {
  color: var(--text-tertiary);
}

.app-textarea--default:focus {
  border-color: var(--border-focus, var(--accent));
}

.app-textarea--default.is-invalid {
  border-color: var(--text-error, #ef4444);
}

.app-textarea--ghost {
  padding: 4px 6px 4px 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
  min-height: 0;
}

.app-textarea--ghost::placeholder {
  color: var(--text-tertiary);
}

.app-textarea--ghost:focus {
  border-color: var(--accent);
  background: var(--bg-muted);
}

.app-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-textarea:read-only {
  cursor: default;
}

.app-textarea__clear {
  position: absolute;
  right: 6px;
  top: 8px;
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

.app-textarea__clear .iconfont {
  font-size: 14px;
  line-height: 1;
}

.app-textarea__clear:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
