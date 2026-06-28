<script lang="ts" setup>
import { useRouter } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { DETAIL_MODULES, buildDetailQuery } from './accessibilityCheckUtils';

const props = defineProps({
  currentModule: { type: String, required: true },
  queryState: { type: Object, default: () => ({}) }
});

const router = useRouter();
const modules = DETAIL_MODULES;

function handleModuleChange(moduleId) {
  if (moduleId === props.currentModule) return;
  const target = DETAIL_MODULES.find((m) => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: buildDetailQuery(props.queryState)
  });
}
</script>

<template>
  <Teleport to="#accessibility-check-header-slot">
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

  <div v-if="$slots.main || $slots.extra" class="detail-control-row">
    <slot name="main"></slot>
    <slot name="extra"></slot>
  </div>
</template>

<style lang="scss" scoped>
.detail-control-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
  :deep(.color-picker) { flex: 1; min-width: 180px; }
}
</style>
