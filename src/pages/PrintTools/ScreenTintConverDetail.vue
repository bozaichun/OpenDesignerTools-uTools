<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Selector from '../../components/Selector.vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import PrintToolsDetailShell from './PrintToolsDetailShell.vue';
import { computeHalftoneLevels, readDetailQuery } from './printToolsUtils';

const route = useRoute();

const inputColor = ref('#1677FF');
const useDPI = ref(false);
const dpi = ref('175');

const shellQueryExtra = computed(() => {
  return {
    useDPI: useDPI.value ? '1' : '0',
    dpi: dpi.value,
    profile: 'srgb',
    paper: 'coated'
  };
});

const halftoneLevels = computed(() => {
  return computeHalftoneLevels(inputColor.value);
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  inputColor.value = q.color;
  useDPI.value = q.useDPI;
  dpi.value = q.dpi;
}

watch(() => route.query, () => {
  applyRouteQuery();
});

onMounted(() => {
  applyRouteQuery();
});
</script>

<template>
  <div class="print-detail">
    <PrintToolsDetailShell
      current-module="screenTint"
      :color="inputColor"
      :query-extra="shellQueryExtra"
      @update:color="inputColor = $event"
    >
      <template #extra>
        <label class="checkbox-label">
          <input type="checkbox" v-model="useDPI" />
          <span>DPI 精确</span>
        </label>
        <Selector v-if="useDPI" v-model="dpi" :block="false" :flex="true">
          <option value="150">150 lpi</option>
          <option value="175">175 lpi</option>
          <option value="200">200 lpi</option>
          <option value="300">300 lpi</option>
        </Selector>
      </template>
      <template #footer>
        <div class="halftone-hint">
          💡 提示：网点百分比越小，颜色越浅。报纸常用 85-120 lpi，杂志画册 150-175 lpi，高端印刷可达 200-300 lpi。
        </div>
      </template>
    </PrintToolsDetailShell>

    <section class="panel module-panel">
      <div class="halftone-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>网点%</th>
              <th>预览</th>
              <th>HEX</th>
              <th>RGB</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="level in halftoneLevels" :key="level.percent">
              <td>{{ level.percent }}%</td>
              <td><span class="table-swatch lg" :style="{ background: level.color }"></span></td>
              <td class="mono">{{ level.color }}</td>
              <td class="mono">rgb({{ level.rgb.r }}, {{ level.rgb.g }}, {{ level.rgb.b }})</td>
              <td>
                <ColorActionGroup
                  :value="level.color"
                  :copy-label="level.percent + '% 网点'"
                  :favorite-name="level.percent + '% 网点'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.print-detail { width: 100%; min-width: 0; }
.checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-primary); cursor: pointer; white-space: nowrap;
}
.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.halftone-table-wrap { overflow-x: auto; }
.data-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
  th, td {
    padding: 10px 12px; text-align: left;
    border-bottom: 1px solid var(--border-primary);
  }
  th {
    background: var(--bg-muted); color: var(--text-secondary);
    font-weight: 600; white-space: nowrap;
  }
  td { color: var(--text-primary); }
  .mono { font-family: monospace; font-size: 11px; }
}
.table-swatch {
  display: inline-block; width: 20px; height: 20px;
  border-radius: 3px; border: 1px solid var(--border-primary);
  vertical-align: middle; margin-right: 6px;
  &.lg { width: 28px; height: 28px; margin-right: 0; }
}
.halftone-hint {
  margin-top: 12px;
  padding: 12px 16px; background: var(--accent-soft); border-radius: var(--radius-md);
  font-size: 12px; color: var(--accent);
}
</style>
