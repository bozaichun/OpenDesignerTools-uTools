<template>
  <div class="print-detail">
    <PrintToolsDetailShell
      current-module="pantone"
      :color="draftColor"
      :query-extra="shellQueryExtra"
      @update:color="draftColor = $event"
      @analyze="handleAnalyze"
    >
      <template #extra>
        <Selector v-model="draftPaper" :block="false" :flex="true">
          <option value="coated">铜版纸 Coated</option>
          <option value="uncoated">胶版纸 Uncoated</option>
        </Selector>
      </template>
    </PrintToolsDetailShell>

    <section v-if="analyzed" class="panel module-panel">
      <div class="module-head">
        <h3 class="panel-title">潘通匹配</h3>
        <span class="module-tag">Pantone 专色</span>
      </div>
      <span class="panel-sub">基于当前颜色自动匹配最接近的潘通色号（{{ activePaper === 'coated' ? '铜版纸' : '胶版纸' }}）</span>

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
import { computePantoneResults, readDetailQuery, shouldAutoAnalyze } from './printToolsUtils';

export default {
  name: 'PantoneDetail',
  components: { Selector, PrintToolsDetailShell },
  data() {
    return {
      draftColor: '#1677FF',
      draftPaper: 'coated',
      activeColor: '#1677FF',
      activePaper: 'coated',
      analyzed: false
    };
  },
  computed: {
    shellQueryExtra() {
      return { paper: this.draftPaper, profile: 'srgb' };
    },
    pantoneResults() {
      return computePantoneResults(this.activeColor, this.activePaper);
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
      this.draftColor = q.color;
      this.draftPaper = q.paper;
      if (shouldAutoAnalyze(this.$route)) {
        this.handleAnalyze();
      }
    },
    handleAnalyze() {
      this.activeColor = this.draftColor;
      this.activePaper = this.draftPaper;
      this.analyzed = true;
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
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); display: block; margin-bottom: 16px; margin-top: -8px; }
.module-head {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;
}
.module-tag {
  padding: 2px 8px; font-size: 11px; font-weight: 500;
  background: var(--accent-soft); color: var(--accent); border-radius: var(--radius-pill);
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
