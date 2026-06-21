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
  </section>
</template>

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { DETAIL_MODULES } from './printToolsUtils';

export default {
  name: 'PrintToolsDetailShell',
  components: { ColorPicker, Selector },
  props: {
    currentModule: { type: String, required: true },
    color: { type: String, required: true },
    queryExtra: { type: Object, default: () => ({}) }
  },
  emits: ['update:color'],
  data() {
    return { modules: DETAIL_MODULES };
  },
  methods: {
    handleModuleChange(moduleId) {
      if (moduleId === this.currentModule) return;
      const target = DETAIL_MODULES.find(m => m.id === moduleId);
      if (!target) return;
      this.$router.push({
        path: target.route,
        query: {
          ...this.$route.query,
          color: this.color,
          ...this.queryExtra
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.detail-control-panel { margin-bottom: 20px; }
.detail-control-row {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  :deep(.color-picker) { flex: 1; min-width: 180px; }
}
</style>
