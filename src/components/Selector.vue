<template>
  <div
    ref="rootRef"
    class="app-selector"
    :class="selectorClass"
  >
    <button
      type="button"
      class="app-selector__trigger"
      :class="{ 'is-open': isOpen, 'is-placeholder': isPlaceholderDisplay }"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="handleToggle"
      @keydown="handleTriggerKeydown"
    >
      <span class="app-selector__label">{{ displayLabel }}</span>
      <span class="app-selector__arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6l4 4 4-4"
          />
        </svg>
      </span>
    </button>

    <Transition name="app-selector-dropdown">
      <div
        v-if="isOpen"
        class="app-selector__dropdown"
        role="listbox"
        :aria-activedescendant="activeOptionId"
      >
        <ul class="app-selector__list">
          <li
            v-for="(option, index) in options"
            :id="`${instanceId}-option-${index}`"
            :key="`${option.value}-${index}`"
            class="app-selector__option"
            :class="{
              'is-selected': isOptionSelected(option),
              'is-disabled': option.disabled,
              'is-active': activeIndex === index
            }"
            role="option"
            :aria-selected="isOptionSelected(option)"
            :aria-disabled="option.disabled || undefined"
            @click="handleSelect(option)"
            @mouseenter="activeIndex = index"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script>
let selectorUid = 0;

function getOptionText(node) {
  const { children } = node;
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === 'string') return child;
        if (typeof child === 'number') return String(child);
        if (child && typeof child.children === 'string') return child.children;
        return '';
      })
      .join('');
  }
  return '';
}

function parseOptionsFromSlot(vnodes) {
  const options = [];

  function walk(nodes) {
    if (!nodes) return;
    const list = Array.isArray(nodes) ? nodes : [nodes];
    for (const node of list) {
      if (!node || !node.type) continue;
      if (node.type === 'option') {
        const props = node.props || {};
        const label = getOptionText(node);
        const value = props.value !== undefined && props.value !== null ? props.value : label;
        options.push({
          value,
          label: label || String(value),
          disabled: !!props.disabled
        });
      } else if (node.children) {
        if (Array.isArray(node.children)) {
          walk(node.children);
        } else if (typeof node.children === 'object') {
          Object.values(node.children).forEach((slotFn) => {
            if (typeof slotFn === 'function') walk(slotFn());
          });
        }
      }
    }
  }

  walk(vnodes);
  return options;
}

export default {
  name: 'AppSelector',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'compact'].includes(value)
    },
    block: {
      type: Boolean,
      default: true
    },
    flex: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      isOpen: false,
      activeIndex: -1,
      instanceId: `app-selector-${++selectorUid}`
    };
  },
  computed: {
    options() {
      return parseOptionsFromSlot(this.$slots.default?.() ?? []);
    },
    selectorClass() {
      return [
        `app-selector--${this.variant}`,
        {
          'app-selector--block': this.block,
          'app-selector--flex': this.flex
        }
      ];
    },
    selectedOption() {
      return this.options.find((option) => this.isOptionSelected(option));
    },
    displayLabel() {
      if (this.selectedOption) {
        return this.selectedOption.label;
      }
      const emptyOption = this.options.find((option) => option.value === '' || option.value == null);
      if (emptyOption) return emptyOption.label;
      return this.placeholder;
    },
    isPlaceholderDisplay() {
      if (!this.selectedOption) return true;
      return this.selectedOption.value === '' || this.selectedOption.value == null;
    },
    activeOptionId() {
      if (this.activeIndex < 0) return undefined;
      return `${this.instanceId}-option-${this.activeIndex}`;
    }
  },
  watch: {
    isOpen(open) {
      if (open) {
        const selectedIndex = this.options.findIndex((option) => this.isOptionSelected(option));
        this.activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
        document.addEventListener('pointerdown', this.handleClickOutside);
        document.addEventListener('keydown', this.handleDocumentKeydown);
      } else {
        document.removeEventListener('pointerdown', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleDocumentKeydown);
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
  },
  methods: {
    isOptionSelected(option) {
      return String(option.value) === String(this.modelValue);
    },
    handleToggle() {
      if (this.disabled) return;
      this.isOpen = !this.isOpen;
    },
    handleSelect(option) {
      if (option.disabled) return;
      this.$emit('update:modelValue', option.value);
      this.$emit('change', option.value);
      this.isOpen = false;
    },
    handleClickOutside(event) {
      if (!this.$refs.rootRef?.contains(event.target)) {
        this.isOpen = false;
      }
    },
    handleTriggerKeydown(event) {
      if (this.disabled) return;
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!this.isOpen) {
          this.isOpen = true;
        } else if (event.key === 'Enter' || event.key === ' ') {
          const option = this.options[this.activeIndex];
          if (option) this.handleSelect(option);
        }
      } else if (event.key === 'Escape') {
        this.isOpen = false;
      }
    },
    handleDocumentKeydown(event) {
      if (!this.isOpen) return;
      if (event.key === 'Escape') {
        this.isOpen = false;
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.moveActive(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.moveActive(-1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const option = this.options[this.activeIndex];
        if (option) this.handleSelect(option);
      }
    },
    moveActive(step) {
      const len = this.options.length;
      if (!len) return;
      let index = this.activeIndex;
      for (let i = 0; i < len; i += 1) {
        index = (index + step + len) % len;
        if (!this.options[index]?.disabled) {
          this.activeIndex = index;
          break;
        }
      }
    }
  }
};
</script>

<style scoped>
.app-selector {
  position: relative;
  display: inline-flex;
}

.app-selector--block {
  width: 100%;
}

.app-selector--flex {
  flex: 1;
  min-width: 0;
}

.app-selector__trigger {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 0;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.app-selector--default .app-selector__trigger {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
}

.app-selector--compact .app-selector__trigger {
  min-width: 108px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.app-selector__trigger:hover:not(:disabled) {
  border-color: var(--border-strong);
}

.app-selector__trigger.is-open,
.app-selector__trigger:focus-visible {
  border-color: var(--border-focus, var(--accent));
  box-shadow: 0 0 0 1px var(--border-focus, var(--accent));
}

.app-selector__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-selector__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-selector__trigger.is-placeholder .app-selector__label {
  color: var(--text-tertiary);
}

.app-selector__arrow {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.app-selector--default .app-selector__arrow {
  width: 16px;
  height: 16px;
}

.app-selector--compact .app-selector__arrow {
  width: 14px;
  height: 14px;
}

.app-selector__arrow svg {
  width: 100%;
  height: 100%;
}

.app-selector__trigger.is-open .app-selector__arrow {
  transform: rotate(180deg);
}

.app-selector__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.app-selector__dropdown::before,
.app-selector__dropdown::after {
  content: '';
  position: absolute;
  left: 20px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.app-selector__dropdown::before {
  top: -12px;
  border-bottom-color: var(--border-primary);
}

.app-selector__dropdown::after {
  top: -11px;
  border-bottom-color: var(--bg-card);
}

.app-selector__list {
  margin: 0;
  padding: 4px 0;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
}

.app-selector__option {
  padding: 8px 12px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.app-selector--compact .app-selector__option {
  padding: 6px 10px;
  font-size: 13px;
}

.app-selector__option:hover,
.app-selector__option.is-active {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.app-selector__option.is-selected {
  color: var(--accent);
  font-weight: 500;
}

.app-selector__option.is-disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.app-selector__option.is-disabled:hover {
  background: transparent;
  color: var(--text-tertiary);
}

.app-selector-dropdown-enter-active,
.app-selector-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top center;
}

.app-selector-dropdown-enter-from,
.app-selector-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
