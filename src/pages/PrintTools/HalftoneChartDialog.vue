<template>
  <Dialog v-model:visible="dialogVisible" title="网点分布图" max-width="560px">
    <div class="halftone-chart">
      <div v-for="(level, idx) in levels" :key="'c-' + idx" class="halftone-chart-row">
        <span class="halftone-chart-label">{{ level.percent }}%</span>
        <div class="halftone-chart-bar-wrap">
          <div
            class="halftone-chart-bar"
            :style="{ width: level.percent + '%', background: level.color }"
          ></div>
        </div>
        <span class="halftone-chart-hex">{{ level.color }}</span>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '../../components/Dialog.vue';

export default {
  name: 'HalftoneChartDialog',
  components: { Dialog },
  props: {
    visible: { type: Boolean, default: false },
    levels: { type: Array, default: () => [] }
  },
  emits: ['update:visible'],
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.halftone-chart { display: flex; flex-direction: column; gap: 10px; }
.halftone-chart-row { display: flex; align-items: center; gap: 10px; }
.halftone-chart-label {
  width: 36px; font-size: 12px; color: var(--text-secondary); text-align: right;
}
.halftone-chart-bar-wrap {
  flex: 1; height: 20px; background: var(--bg-muted);
  border-radius: 4px; overflow: hidden;
}
.halftone-chart-bar { height: 100%; min-width: 2px; border-radius: 4px; }
.halftone-chart-hex {
  width: 72px; font-size: 11px; font-family: monospace; color: var(--text-tertiary);
}
</style>
