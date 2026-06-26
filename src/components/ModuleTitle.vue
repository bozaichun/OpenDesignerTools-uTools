<script lang="ts" setup>
import { computed, useSlots } from 'vue';

defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'center',
    validator: (v) => ['center', 'section'].indexOf(v) !== -1
  }
});

const slots = useSlots();

const hasSubtitle = computed(() => {
  return Boolean(props.subtitle) || Boolean(slots.subtitle);
});
</script>

<template>
  <div :class="['module-title', `mode-${mode}`]">
    <div v-if="mode === 'section'" class="module-title-inner">
      <div class="module-title-row">
        <span class="module-title-accent" aria-hidden="true"></span>
        <div class="module-title-text">
          <slot name="title">{{ title }}</slot>
        </div>
      </div>
      <div v-if="hasSubtitle" class="module-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
    <template v-else>
      <div class="module-title-text">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="hasSubtitle" class="module-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.module-title {
  display: block;
  width: 100%;
  flex-shrink: 0;
  margin-bottom: 14px;
}

.module-title-text {
  display: block;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.module-subtitle {
  display: block;
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.mode-center {
  text-align: center;
}

.mode-section {
  text-align: left;
}

.module-title-inner {
  display: flex;
  flex-direction: column;
}

.module-title-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.module-title-accent {
  flex-shrink: 0;
  width: 4px;
  border-radius: var(--radius-pill);
  background: var(--accent);
}

.mode-section .module-subtitle {
  margin-left: 14px;
}
</style>
