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

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { DETAIL_MODULES, buildDetailQuery } from './colorToolsUtils';

export default {
  name: 'ColorToolsDetailShell',
  components: { ColorPicker, Selector },
  props: {
    currentModule: { type: String, required: true },
    color: { type: String, required: true },
    queryState: { type: Object, default: () => ({}) }
  },
  emits: ['update:color'],
  data() {
    return { modules: DETAIL_MODULES };
  },
  methods: {
    handleModuleChange(moduleId) {
      if (moduleId === this.currentModule) return;
      const target = DETAIL_MODULES.find((m) => m.id === moduleId);
      if (!target) return;
      this.$router.push({
        path: target.route,
        query: buildDetailQuery({
          color: this.color,
          colorB: this.queryState.colorB,
          hue: this.queryState.hue,
          sat: this.queryState.sat,
          light: this.queryState.light,
          direction: this.queryState.direction,
          stops: this.queryState.stops
        })
      });
    }
  }
};
</script>

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
