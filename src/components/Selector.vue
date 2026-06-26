<script lang="ts" setup>
import { ref, computed, watch, useSlots, onBeforeUnmount } from 'vue';

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
        const nodeProps = node.props || {};
        const label = getOptionText(node);
        const value = nodeProps.value !== undefined && nodeProps.value !== null ? nodeProps.value : label;
        options.push({
          value,
          label: label || String(value),
          disabled: !!nodeProps.disabled
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

const props = defineProps({
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
});

const emit = defineEmits(['update:modelValue', 'change']);

const slots = useSlots();
const rootRef = ref(null);
const isOpen = ref(false);
const activeIndex = ref(-1);
const instanceId = `app-selector-${++selectorUid}`;

const options = computed(() => parseOptionsFromSlot(slots.default?.() ?? []));

const selectorClass = computed(() => [
  `app-selector--${props.variant}`,
  {
    'app-selector--block': props.block,
    'app-selector--flex': props.flex
  }
]);

const selectedOption = computed(() => options.value.find((option) => isOptionSelected(option)));

const displayLabel = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.label;
  }
  const emptyOption = options.value.find((option) => option.value === '' || option.value == null);
  if (emptyOption) return emptyOption.label;
  return props.placeholder;
});

const isPlaceholderDisplay = computed(() => {
  if (!selectedOption.value) return true;
  return selectedOption.value.value === '' || selectedOption.value.value == null;
});

const activeOptionId = computed(() => {
  if (activeIndex.value < 0) return undefined;
  return `${instanceId}-option-${activeIndex.value}`;
});

const isOptionSelected = (option) => {
  return String(option.value) === String(props.modelValue);
};

const handleToggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const handleSelect = (option) => {
  if (option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (!rootRef.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

const moveActive = (step) => {
  const len = options.value.length;
  if (!len) return;
  let index = activeIndex.value;
  for (let i = 0; i < len; i += 1) {
    index = (index + step + len) % len;
    if (!options.value[index]?.disabled) {
      activeIndex.value = index;
      break;
    }
  }
};

const handleTriggerKeydown = (event) => {
  if (props.disabled) return;
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!isOpen.value) {
      isOpen.value = true;
    } else if (event.key === 'Enter' || event.key === ' ') {
      const option = options.value[activeIndex.value];
      if (option) handleSelect(option);
    }
  } else if (event.key === 'Escape') {
    isOpen.value = false;
  }
};

const handleDocumentKeydown = (event) => {
  if (!isOpen.value) return;
  if (event.key === 'Escape') {
    isOpen.value = false;
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveActive(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveActive(-1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const option = options.value[activeIndex.value];
    if (option) handleSelect(option);
  }
};

watch(isOpen, (open) => {
  if (open) {
    const selectedIndex = options.value.findIndex((option) => isOptionSelected(option));
    activeIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleDocumentKeydown);
  } else {
    document.removeEventListener('pointerdown', handleClickOutside);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

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

<style lang="scss" scoped>
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
