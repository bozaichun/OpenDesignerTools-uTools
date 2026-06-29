<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { DETAIL_MODULES } from './printToolsUtils';

const props = defineProps({
  currentModule: { type: String, required: true },
  color: { type: String, required: true },
  queryExtra: { type: Object, default: () => ({}) }
});

defineEmits(['update:color']);

const route = useRoute();
const router = useRouter();

const modules = DETAIL_MODULES;

function handleModuleChange(moduleId) {
  if (moduleId === props.currentModule) return;
  const target = DETAIL_MODULES.find(m => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: {
      ...route.query,
      color: props.color,
      ...props.queryExtra
    }
  });
}
</script>

<template>
  <Teleport to="#print-tools-header-slot">
    <Selector
      class="header-module-selector"
      :model-value="currentModule"
      :block="false"
      :flex="false"
      @update:model-value="handleModuleChange"
    >
      <option v-for="m in modules" :key="m.id" :value="m.id">{{ m.label }}</option>
    </Selector>
  </Teleport>

  <section class="panel detail-control-panel">
    <div class="detail-control-row">
      <ColorPicker :model-value="color" @update:model-value="$emit('update:color', $event)" />
      <slot name="extra"></slot>
    </div>
    <slot name="footer"></slot>
  </section>
</template>

<style lang="scss" scoped>
.detail-control-panel { margin-bottom: 20px; }
.detail-control-row {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  :deep(.color-picker) { flex: 1; min-width: 180px; }
}
</style>
