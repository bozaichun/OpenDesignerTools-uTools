<template>
  <div class="print-detail">
    <PrintToolsDetailShell
      current-module="screenTint"
      :color="draftColor"
      :query-extra="shellQueryExtra"
      @update:color="draftColor = $event"
      @analyze="handleAnalyze"
    >
      <template #extra>
        <label class="checkbox-label">
          <input type="checkbox" v-model="draftUseDPI" />
          <span>DPI 精确</span>
        </label>
        <Selector v-if="draftUseDPI" v-model="draftDPI" :block="false" :flex="true">
          <option value="150">150 lpi</option>
          <option value="175">175 lpi</option>
          <option value="200">200 lpi</option>
          <option value="300">300 lpi</option>
        </Selector>
      </template>
    </PrintToolsDetailShell>

    <section v-if="analyzed" class="panel module-panel">
      <div class="module-head">
        <h3 class="panel-title">网点换算</h3>
        <span class="module-tag">制版参考</span>
      </div>
      <span class="panel-sub">基于当前主色换算各网点百分比对应色值，适配画册、包装印刷制版</span>

      <div class="halftone-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="activeUseDPI" />
          <span>根据 DPI 精确计算</span>
        </label>
        <Selector v-if="activeUseDPI" v-model="activeDPI" :block="false" :flex="true">
          <option value="150">150 lpi（粗网点）</option>
          <option value="175">175 lpi（标准）</option>
          <option value="200">200 lpi（精细）</option>
          <option value="300">300 lpi（超精细）</option>
        </Selector>
      </div>

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
            <tr v-for="(level, idx) in halftoneLevels" :key="idx">
              <td>{{ level.percent }}%</td>
              <td><span class="table-swatch lg" :style="{ background: level.color }"></span></td>
              <td class="mono">{{ level.color }}</td>
              <td class="mono">rgb({{ level.rgb.r }}, {{ level.rgb.g }}, {{ level.rgb.b }})</td>
              <td><button class="sm-btn" @click="copyValue(level.color, level.percent + '% 网点')">复制</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="halftone-hint">
        💡 提示：网点百分比越小，颜色越浅。报纸常用 85-120 lpi，杂志画册 150-175 lpi，高端印刷可达 200-300 lpi。
      </div>
    </section>
  </div>
</template>

<script>
import Selector from '../../components/Selector.vue';
import PrintToolsDetailShell from './PrintToolsDetailShell.vue';
import { copyToClipboard, showToast } from '../../utils/colorUtils';
import { computeHalftoneLevels, readDetailQuery, shouldAutoAnalyze } from './printToolsUtils';

export default {
  name: 'ScreenTintConverDetail',
  components: { Selector, PrintToolsDetailShell },
  data() {
    return {
      draftColor: '#1677FF',
      draftUseDPI: false,
      draftDPI: '175',
      activeColor: '#1677FF',
      activeUseDPI: false,
      activeDPI: '175',
      analyzed: false
    };
  },
  computed: {
    shellQueryExtra() {
      return {
        useDPI: this.draftUseDPI ? '1' : '0',
        dpi: this.draftDPI,
        profile: 'srgb',
        paper: 'coated'
      };
    },
    halftoneLevels() {
      return computeHalftoneLevels(this.activeColor);
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
      this.draftUseDPI = q.useDPI;
      this.draftDPI = q.dpi;
      if (shouldAutoAnalyze(this.$route)) {
        this.handleAnalyze();
      }
    },
    handleAnalyze() {
      this.activeColor = this.draftColor;
      this.activeUseDPI = this.draftUseDPI;
      this.activeDPI = this.draftDPI;
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
.checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-primary); cursor: pointer; white-space: nowrap;
}
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
.halftone-options {
  display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
}
.halftone-table-wrap { overflow-x: auto; margin-bottom: 12px; }
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
.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.halftone-hint {
  padding: 12px 16px; background: var(--accent-soft); border-radius: var(--radius-md);
  font-size: 12px; color: var(--accent);
}
</style>
