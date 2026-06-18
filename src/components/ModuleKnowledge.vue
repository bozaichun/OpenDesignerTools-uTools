<template>
  <div class="module-knowledge">
    <div class="knowledge-list">
      <div
        v-for="item in KNOWLEDGE_DATA"
        :key="item.id"
        class="knowledge-card"
        :class="isExpanded(item.id) ? 'expanded' : ''"
      >
        <div class="knowledge-header" @click="toggle(item.id)">
          <div class="knowledge-header-text">
            <h3 class="knowledge-title">{{ item.title }}</h3>
            <p class="knowledge-summary">{{ item.summary }}</p>
          </div>
          <span class="knowledge-expand-icon" :class="isExpanded(item.id) ? 'rotated' : ''">▼</span>
        </div>

        <div v-if="isExpanded(item.id)" class="knowledge-body">
          <div class="knowledge-chart" :ref="setChartRefFunc(item.id)"></div>
          <div class="knowledge-chart-title">{{ item.chart ? item.chart.title : '' }}</div>

          <div v-if="item.colorDemo" class="color-demo-row">
            <div v-for="c in item.colorDemo" :key="c.hex" class="color-demo-item">
              <div class="color-demo-swatch" :style="{ background: c.hex }"></div>
              <span class="color-demo-name">{{ c.name }}</span>
            </div>
          </div>

          <div v-if="item.colorWheel" class="color-wheel">
            <div v-for="cw in item.colorWheel" :key="cw.h" class="color-wheel-item">
              <div class="color-wheel-swatch" :style="{ background: 'hsl(' + cw.h + ', 75%, 55%)' }"></div>
              <span class="color-wheel-label">{{ cw.label }} {{ cw.h }}°</span>
            </div>
          </div>

          <div v-for="(section, sIdx) in item.sections" :key="sIdx" class="knowledge-section">
            <h4 class="knowledge-section-title">{{ section.title }}</h4>
            <p class="knowledge-section-content">{{ section.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { KNOWLEDGE_DATA } from '../data/knowledge';

export default {
  name: 'ModuleKnowledge',
  data() {
    return {
      KNOWLEDGE_DATA,
      expandedId: null,
      chartInstances: {},
      _resizeHandler: null
    };
  },
  mounted() {
    const self = this;
    this._resizeHandler = function() {
      Object.keys(self.chartInstances).forEach(function(k) {
        if (self.chartInstances[k]) {
          self.chartInstances[k].resize();
        }
      });
    };
    window.addEventListener('resize', this._resizeHandler);
  },
  beforeUnmount() {
    this.disposeAllCharts();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  },
  beforeDestroy() {
    this.disposeAllCharts();
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  },
  methods: {
    isExpanded(id) {
      return this.expandedId === id;
    },
    toggle(id) {
      const willExpand = this.expandedId !== id;
      this.expandedId = willExpand ? id : null;
      this.$nextTick(() => {
        if (this.expandedId) {
          this.initChart(this.expandedId);
        }
      });
    },
    setChartRefFunc(id) {
      const self = this;
      return function(el) {
        if (el && !self.chartInstances[id] && self.expandedId === id) {
          self.initChartWithEl(id, el);
        }
      };
    },
    initChart(id) {
      const el = this.$el.querySelector('.knowledge-card.expanded .knowledge-chart');
      if (el) {
        this.initChartWithEl(id, el);
      }
    },
    initChartWithEl(id, el) {
      if (!el) return;
      if (this.chartInstances[id]) {
        this.chartInstances[id].dispose();
      }
      const item = KNOWLEDGE_DATA.find(function(d) { return d.id === id; });
      if (!item || !item.chart) return;

      const chart = echarts.init(el);
      this.chartInstances[id] = chart;
      const option = this.buildChartOption(item.chart);
      chart.setOption(option);

      const self = this;
      setTimeout(function() { if (self.chartInstances[id]) self.chartInstances[id].resize(); }, 50);
      setTimeout(function() { if (self.chartInstances[id]) self.chartInstances[id].resize(); }, 300);
    },
    buildChartOption(chartConfig) {
      if (chartConfig.type === 'rgb-bar') return this.rgbBarOption(chartConfig);
      if (chartConfig.type === 'color-wheel') return this.colorWheelOption(chartConfig);
      if (chartConfig.type === 'format-radar') return this.radarOption(chartConfig);
      if (chartConfig.type === 'design-standard') return this.designBarOption(chartConfig);
      return {};
    },
    rgbBarOption(cfg) {
      const names = cfg.data.map(function(d) { return d.name; });
      const rVals = cfg.data.map(function(d) { return d.r; });
      const gVals = cfg.data.map(function(d) { return d.g; });
      const bVals = cfg.data.map(function(d) { return d.b; });
      const rSeriesData = rVals.map(function(v) { return { value: v, itemStyle: { color: '#EF4444' } }; });
      const gSeriesData = gVals.map(function(v) { return { value: v, itemStyle: { color: '#10B981' } }; });
      const bSeriesData = bVals.map(function(v) { return { value: v, itemStyle: { color: '#2563EB' } }; });

      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['R 通道', 'G 通道', 'B 通道'], top: 5 },
        grid: { left: 40, right: 20, top: 45, bottom: 30, containLabel: true },
        xAxis: { type: 'category', data: names },
        yAxis: { type: 'value', max: 255, splitLine: { lineStyle: { type: 'dashed' } } },
        series: [
          { name: 'R 通道', type: 'bar', data: rSeriesData, barWidth: 12 },
          { name: 'G 通道', type: 'bar', data: gSeriesData, barWidth: 12 },
          { name: 'B 通道', type: 'bar', data: bSeriesData, barWidth: 12 }
        ]
      };
    },
    colorWheelOption(cfg) {
      const axisData = cfg.data.map(function(d) { return d.label; });
      const values = cfg.data.map(function(d) {
        return { value: d.value, itemStyle: { color: 'hsl(' + d.h + ', 75%, 55%)' } };
      });

      return {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const d = cfg.data[params.dataIndex];
            return d.label + ' ' + d.h + '°';
          }
        },
        polar: { radius: ['15%', '85%'] },
        angleAxis: { type: 'category', data: axisData, axisLine: { show: false }, splitLine: { show: false } },
        radiusAxis: { type: 'value', max: 100, axisLabel: { show: false }, axisLine: { show: false } },
        series: [{ type: 'bar', data: values, coordinateSystem: 'polar', barWidth: 18 }]
      };
    },
    radarOption(cfg) {
      return {
        tooltip: {},
        legend: { data: cfg.data.map(function(d) { return d.name; }), top: 5 },
        radar: {
          indicator: cfg.indicator,
          shape: 'polygon',
          splitNumber: 4,
          splitLine: { lineStyle: { type: 'dashed' } },
          splitArea: { areaStyle: { color: ['transparent'] } }
        },
        series: [{
          type: 'radar',
          data: cfg.data.map(function(d) {
            return {
              value: d.value,
              name: d.name,
              areaStyle: { color: d.color, opacity: 0.15 },
              lineStyle: { color: d.color, width: 2 },
              itemStyle: { color: d.color }
            };
          })
        }]
      };
    },
    designBarOption(cfg) {
      const sorted = cfg.data.slice().sort(function(a, b) { return a.value - b.value; });
      const names = sorted.map(function(d) { return d.name; });
      const maxVal = Math.max.apply(null, cfg.data.map(function(d) { return d.value; })) * 1.1;
      const barData = sorted.map(function(d) {
        return { value: d.value, itemStyle: { color: d.color } };
      });

      const markLines = cfg.thresholds.map(function(t) {
        return {
          yAxis: t.value,
          lineStyle: { color: t.color, type: 'dashed', width: 2 },
          label: { formatter: t.name, color: t.color, fontSize: 10, position: 'end' }
        };
      });

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function(params) {
            const p = params[0];
            return p.name + '<br/>对比度: ' + p.value + ':1';
          }
        },
        grid: { left: 10, right: 60, top: 20, bottom: 30, containLabel: true },
        xAxis: { type: 'value', max: maxVal, splitLine: { lineStyle: { type: 'dashed' } } },
        yAxis: { type: 'category', data: names },
        series: [{
          type: 'bar',
          data: barData,
          barWidth: 18,
          label: { show: true, position: 'right', formatter: '{c}:1', fontSize: 11 },
          markLine: { silent: true, symbol: 'none', data: markLines }
        }]
      };
    },
    disposeAllCharts() {
      const self = this;
      Object.keys(this.chartInstances).forEach(function(k) {
        if (self.chartInstances[k]) {
          self.chartInstances[k].dispose();
          delete self.chartInstances[k];
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.module-knowledge {
  width: 100%;
  min-width: 0;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.knowledge-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.15s ease;

  &.expanded {
    border-color: var(--accent);
  }
}

.knowledge-header {
  padding: 16px 18px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-hover);
  }
}

.knowledge-header-text {
  flex: 1;
  min-width: 0;
}

.knowledge-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.knowledge-summary {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.knowledge-expand-icon {
  font-size: 14px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.rotated {
    transform: rotate(180deg);
  }
}

.knowledge-body {
  padding: 0 18px 18px;
  border-top: 1px dashed var(--border-primary);
}

.knowledge-chart {
  width: 100%;
  height: 320px;
  margin: 16px 0 8px 0;
}

.knowledge-chart-title {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  margin-bottom: 16px;
}

.knowledge-section {
  margin-top: 16px;
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
}

.color-wheel {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 12px 0;
}

.color-wheel-item {
  text-align: center;
}

.color-wheel-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid var(--border-primary);
  margin-bottom: 4px;
  box-shadow: var(--shadow-sm);
}

.color-wheel-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.color-demo-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.color-demo-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.color-demo-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--border-primary);
}

.color-demo-name {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
}

@media (max-width: 640px) {
  .color-wheel {
    grid-template-columns: repeat(4, 1fr);
  }

  .knowledge-chart {
    height: 280px;
  }
}

@media (min-width: 1024px) {
  .color-wheel {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
