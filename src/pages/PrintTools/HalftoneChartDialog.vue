<script lang="ts" setup>
import { computed } from 'vue';
import Dialog from '../../components/Dialog.vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  levels: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});
</script>

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
        <div class="halftone-chart-hex-cell">
          <span class="halftone-chart-hex">{{ level.color }}</span>
          <ColorActionGroup
            :value="level.color"
            :copy-label="level.percent + '% 网点色'"
            :favorite-name="level.percent + '% 网点色'"
            variant="default"
            class="halftone-chart-actions"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

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
.halftone-chart-hex-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.halftone-chart-hex {
  font-size: 11px;
  font-family: monospace;
  color: var(--text-tertiary);
}
.halftone-chart-actions {
  flex-shrink: 0;
}
</style>
