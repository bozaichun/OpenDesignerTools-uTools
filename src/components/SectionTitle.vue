<script lang="ts" setup>
defineProps({
  mode: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary'].indexOf(v) !== -1
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div :class="['section-title-wrap', `mode-${mode}`]">
    <div :class="['st-title', { 'st-title-primary': mode === 'primary' }]">
      <slot name="title">{{ title }}</slot>
    </div>
    <div v-if="mode === 'secondary' && (subtitle || $slots.subtitle)" class="st-subtitle">
      <slot name="subtitle">{{ subtitle }}</slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.section-title-wrap {
  margin-bottom: 14px;
}

.st-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.st-title-primary {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 0;
}

.st-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.mode-primary {
  margin-bottom: 0;
}
</style>
