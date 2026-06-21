<template>
  <div class="print-detail">
    <PrintToolsDetailShell
      current-module="pantone"
      :color="inputColor"
      :query-extra="shellQueryExtra"
      @update:color="inputColor = $event"
    >
      <template #extra>
        <Selector v-model="paperType" :block="false" :flex="true">
          <option value="coated">铜版纸 Coated</option>
          <option value="uncoated">胶版纸 Uncoated</option>
        </Selector>
      </template>
    </PrintToolsDetailShell>

    <section class="panel module-panel">
      <div v-if="pantoneResults.length > 0" class="pantone-results">
        <div class="pantone-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>潘通色号</th>
                <th>名称</th>
                <th>HEX</th>
                <th>色差 ΔE</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in pantoneResults" :key="'t-' + idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <span class="table-swatch" :style="{ background: p.hex }"></span>
                  {{ p.code }}
                </td>
                <td>{{ p.name }}</td>
                <td class="mono">{{ p.hex }}</td>
                <td>{{ p.deltaE.toFixed(2) }}</td>
                <td><button class="sm-btn" @click="copyValue(p.hex, p.code)">复制</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Selector from '../../components/Selector.vue';
import PrintToolsDetailShell from './PrintToolsDetailShell.vue';
import { copyToClipboard, showToast } from '../../utils/colorUtils';
import { computePantoneResults, readDetailQuery } from './printToolsUtils';

export default {
  name: 'PantoneDetail',
  components: { Selector, PrintToolsDetailShell },
  data() {
    return {
      inputColor: '#1677FF',
      paperType: 'coated'
    };
  },
  computed: {
    shellQueryExtra() {
      return { paper: this.paperType, profile: 'srgb' };
    },
    pantoneResults() {
      return computePantoneResults(this.inputColor, this.paperType);
    }
  },
  mounted() {
    this.applyRouteQuery();
  },
  watch: {
    '$route.query'() {
      this.applyRouteQuery();
    }
  },
  methods: {
    applyRouteQuery() {
      const q = readDetailQuery(this.$route);
      this.inputColor = q.color;
      this.paperType = q.paper;
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.print-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.pantone-table-wrap { overflow-x: auto; margin-bottom: 12px; }
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
}
.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}
</style>
