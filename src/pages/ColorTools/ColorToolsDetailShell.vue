<script lang="ts" setup>
import { useRouter } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { DETAIL_MODULES, buildDetailQuery } from './colorToolsUtils';

const props = defineProps({
  currentModule: { type: String, required: true },
  color: { type: String, required: true },
  queryState: { type: Object, default: () => ({}) }
});

defineEmits(['update:color']);

const router = useRouter();

const modules = DETAIL_MODULES;

function handleModuleChange(moduleId) {
  if (moduleId === props.currentModule) return;
  const target = DETAIL_MODULES.find((m) => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: buildDetailQuery({
      color: props.color,
      colorB: props.queryState.colorB,
      hue: props.queryState.hue,
      sat: props.queryState.sat,
      light: props.queryState.light,
      direction: props.queryState.direction,
      stops: props.queryState.stops
    })
  });
}
</script>

<template>
  <Teleport to="#color-tools-header-slot">
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

  <div class="detail-control-row">
    <slot name="main">
      <ColorPicker :model-value="color" @update:model-value="$emit('update:color', $event)" />
    </slot>
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
