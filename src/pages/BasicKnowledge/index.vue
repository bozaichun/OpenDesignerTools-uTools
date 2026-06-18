<template>
  <div class="module-knowledge">
    <div class="knowledge-grid">
      <div
        v-for="item in KNOWLEDGE_DATA"
        :key="item.id"
        class="knowledge-card"
      >
        <div class="knowledge-header">
          <div class="knowledge-header-left">
            <h3 class="knowledge-title">{{ item.title }}</h3>
            <span
              class="prompt-icon iconfont icon-Prompt"
              @click.stop="toggleTooltip($event, item.id, item.summary)"
            ></span>
          </div>
          <div class="knowledge-header-right">
            <span
              class="detail-link"
              @click="openDetail(item)"
            >详细信息</span>
          </div>
        </div>

        <div class="knowledge-body">
          <div class="knowledge-chart" :ref="el => setChartRef(el, item.id)"></div>
          <div class="knowledge-chart-title">{{ item.chart ? item.chart.title : '' }}</div>
        </div>
      </div>
    </div>

    <div v-if="tooltipVisible" class="tooltip-box" :style="tooltipStyle">
      {{ tooltipText }}
    </div>

    <Dialog
      v-model:visible="detailVisible"
      :title="currentDetailItem ? currentDetailItem.title : ''"
      max-width="680px"
      @close="closeDetail"
    >
      <div v-for="(section, sIdx) in currentDetailItem.sections" :key="sIdx" class="knowledge-section">
        <h4 class="knowledge-section-title">{{ section.title }}</h4>
        <p class="knowledge-section-content">{{ section.content }}</p>
      </div>
    </Dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { KNOWLEDGE_DATA } from '../../data/knowledge';
import Dialog from '../../components/Dialog.vue';

export default {
  name: 'BasicKnowledge',
  components: { Dialog },
  data() {
    return {
      KNOWLEDGE_DATA,
      chartInstances: {},
      chartRefs: {},
      _resizeHandler: null,
      tooltipVisible: false,
      tooltipText: '',
      tooltipStyle: { top: '0px', left: '0px' },
      activeTooltipId: null,
      detailVisible: false,
      currentDetailItem: null
    };
  },
  mounted() {
    const self = this;
    this.$nextTick(() => {
      self.initAllCharts();
    });
    this._resizeHandler = () => {
      Object.keys(self.chartInstances).forEach((k) => {
        if (self.chartInstances[k]) {
          self.chartInstances[k].resize();
        }
      });
    };
    this._docClickHandler = () => {
      self.activeTooltipId = null;
      self.tooltipVisible = false;
    };
    window.addEventListener('resize', this._resizeHandler);
    document.addEventListener('click', this._docClickHandler);
  },
  beforeUnmount() {
    this.disposeAllCharts();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    if (this._docClickHandler) {
      document.removeEventListener('click', this._docClickHandler);
    }
  },
  beforeDestroy() {
    this.disposeAllCharts();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    if (this._docClickHandler) {
      document.removeEventListener('click', this._docClickHandler);
    }
  },
  methods: {
    setChartRef(el, id) {
      if (el) {
        this.chartRefs[id] = el;
      }
    },
    initAllCharts() {
      const self = this;
      KNOWLEDGE_DATA.forEach((item) => {
        const el = self.chartRefs[item.id];
        if (el && item.chart) {
          self.initOneChart(item.id, el, item.chart);
        }
      });
    },
    initOneChart(id, el, chartCfg) {
      if (!el || !chartCfg) return;
      if (this.chartInstances[id]) {
        this.chartInstances[id].dispose();
      }
      const chart = echarts.init(el);
      this.chartInstances[id] = chart;
      const option = this.buildChartOption(chartCfg);
      chart.setOption(option);
      setTimeout(() => { if (this.chartInstances[id]) this.chartInstances[id].resize(); }, 50);
      setTimeout(() => { if (this.chartInstances[id]) this.chartInstances[id].resize(); }, 300);
    },
    buildChartOption(chartConfig) {
      if (chartConfig.type === 'rgb-bar') return this.rgbBarOption(chartConfig);
      if (chartConfig.type === 'color-wheel') return this.colorWheelOption(chartConfig);
      if (chartConfig.type === 'format-radar') return this.radarOption(chartConfig);
      if (chartConfig.type === 'design-standard') return this.designBarOption(chartConfig);
      return {};
    },
    rgbBarOption(cfg) {
      const names = cfg.data.map((d) => d.name);
      const rVals = cfg.data.map((d) => d.r);
      const gVals = cfg.data.map((d) => d.g);
      const bVals = cfg.data.map((d) => d.b);
      const rSeriesData = rVals.map((v) => ({ value: v, itemStyle: { color: '#EF4444' } }));
      const gSeriesData = gVals.map((v) => ({ value: v, itemStyle: { color: '#10B981' } }));
      const bSeriesData = bVals.map((v) => ({ value: v, itemStyle: { color: '#2563EB' } }));
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['R 通道', 'G 通道', 'B 通道'], top: 5 },
        grid: { left: 40, right: 20, top: 45, bottom: 30, containLabel: true },
        xAxis: { type: 'category', data: names },
        yAxis: { type: 'value', max: 255, splitLine: { lineStyle: { type: 'dashed' } } },
        series: [
          { name: 'R 通道', type: 'bar', data: rSeriesData, barWidth: 10 },
          { name: 'G 通道', type: 'bar', data: gSeriesData, barWidth: 10 },
          { name: 'B 通道', type: 'bar', data: bSeriesData, barWidth: 10 }
        ]
      };
    },
    colorWheelOption(cfg) {
      const axisData = cfg.data.map((d) => d.label);
      const values = cfg.data.map((d) => ({ value: d.value, itemStyle: { color: 'hsl(' + d.h + ', 75%, 55%)' } }));
      return {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const d = cfg.data[params.dataIndex];
            return d.label + ' ' + d.h + '°';
          }
        },
        polar: { radius: ['18%', '82%'] },
        angleAxis: { type: 'category', data: axisData, axisLine: { show: false }, splitLine: { show: false } },
        radiusAxis: { type: 'value', max: 100, axisLabel: { show: false }, axisLine: { show: false } },
        series: [{ type: 'bar', data: values, coordinateSystem: 'polar', barWidth: 16 }]
      };
    },
    radarOption(cfg) {
      return {
        tooltip: {},
        legend: { data: cfg.data.map((d) => d.name), bottom: 0, textStyle: { fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
        radar: {
          indicator: cfg.indicator,
          shape: 'polygon',
          splitNumber: 4,
          center: ['50%', '48%'],
          radius: '60%',
          splitLine: { lineStyle: { type: 'dashed' } },
          splitArea: { areaStyle: { color: ['transparent'] } }
        },
        series: [{
          type: 'radar',
          data: cfg.data.map((d) => ({
            value: d.value,
            name: d.name,
            areaStyle: { color: d.color, opacity: 0.15 },
            lineStyle: { color: d.color, width: 2 },
            itemStyle: { color: d.color }
          }))
        }]
      };
    },
    designBarOption(cfg) {
      const sorted = cfg.data.slice().sort((a, b) => a.value - b.value);
      const names = sorted.map((d) => d.name);
      const maxVal = Math.max.apply(null, cfg.data.map((d) => d.value)) * 1.1;
      const barData = sorted.map((d) => ({ value: d.value, itemStyle: { color: d.color } }));
      const markLines = cfg.thresholds.map((t) => ({
        yAxis: t.value,
        lineStyle: { color: t.color, type: 'dashed', width: 2 },
        label: { formatter: t.name, color: t.color, fontSize: 10, position: 'insideEndTop' }
      }));
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const p = params[0];
            return p.name + '<br/>对比度: ' + p.value + ':1';
          }
        },
        grid: { left: 10, right: 90, top: 20, bottom: 30, containLabel: true },
        xAxis: { type: 'value', max: maxVal, splitLine: { lineStyle: { type: 'dashed' } } },
        yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
        series: [{
          type: 'bar',
          data: barData,
          barWidth: 16,
          label: { show: true, position: 'right', formatter: '{c}:1', fontSize: 11 },
          markLine: { silent: true, symbol: 'none', data: markLines }
        }]
      };
    },
    disposeAllCharts() {
      const self = this;
      Object.keys(this.chartInstances).forEach((k) => {
        if (self.chartInstances[k]) {
          self.chartInstances[k].dispose();
          delete self.chartInstances[k];
        }
      });
    },
    toggleTooltip(event, id, text) {
      if (this.activeTooltipId === id) {
        this.activeTooltipId = null;
        this.tooltipVisible = false;
        return;
      }
      this.activeTooltipId = id;
      this.tooltipText = text;
      const x = event.clientX + 12;
      const y = event.clientY + 12;
      this.tooltipStyle = { top: y + 'px', left: x + 'px' };
      this.tooltipVisible = true;
    },
    openDetail(item) {
      this.currentDetailItem = item;
      this.detailVisible = true;
    },
    closeDetail() {
      this.detailVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.module-knowledge {
  width: 100%;
  min-width: 0;
  position: relative;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  min-width: 0;
}

.knowledge-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.knowledge-header {
  padding: 14px 16px;
  border-bottom: 1px dashed var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.knowledge-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge-header-right {
  flex-shrink: 0;
}

.knowledge-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.prompt-icon {
  font-size: 14px;
  color: var(--text-secondary);
  cursor: help;
  user-select: none;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
}

.knowledge-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
}

.knowledge-chart {
  width: 100%;
  height: 300px;
  min-height: 300px;
}

.knowledge-chart-title {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 4px;
}

.detail-link {
  display: inline-block;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-hover);
    text-decoration: underline;
  }
}

.knowledge-section {
  margin-top: 14px;
}

.knowledge-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 8px 0;
}

.knowledge-section-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-line;
  margin: 0;
}

.tooltip-box {
  position: fixed;
  z-index: 9999;
  background: rgba(30, 33, 38, 0.95);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  max-width: 340px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

@media (max-width: 1024px) {
  .knowledge-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .knowledge-chart {
    height: 280px;
  }
}

@media (max-width: 640px) {
  .knowledge-header {
    padding: 12px 14px;
  }

  .knowledge-body {
    padding: 10px 14px 14px;
  }

  .knowledge-chart {
    height: 260px;
  }
}
</style>
