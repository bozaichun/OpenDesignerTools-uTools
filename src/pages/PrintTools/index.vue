<template>
  <div class="module-printtools">
    <!-- 统一色值输入 -->
    <section class="panel unified-panel">
      <div class="panel-header">
        <h3 class="panel-title">印刷色值一站式分析</h3>
        <span class="panel-sub">选择或输入颜色一次，同步查看 CMYK 校准、潘通匹配、叠印预览、网点换算四项结果</span>
      </div>

      <div class="unified-input-row">
        <ColorPicker v-model="inputColor" />
        <Selector v-model="cmykProfile" :block="false" :flex="true">
          <option value="srgb">sRGB / 通用</option>
          <option value="cmyk_us">US Web Coated (SWOP) v2</option>
          <option value="cmyk_eu">Euroscale Coated v2</option>
          <option value="cmyk_jp">Japan Color 2001 Coated</option>
        </Selector>
        <Selector v-model="pantonePaperType" :block="false" :flex="true">
          <option value="coated">铜版纸 Coated</option>
          <option value="uncoated">胶版纸 Uncoated</option>
        </Selector>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">CMYK 校准</div>
          <div class="summary-value">cmyk({{ cmykResult.c }}%, {{ cmykResult.m }}%, {{ cmykResult.y }}%, {{ cmykResult.k }}%)</div>
          <div class="summary-status" :class="cmykResult.outOfGamut ? 'warn' : 'ok'">
            {{ cmykResult.outOfGamut ? '⚠ 溢色预警' : '✓ 色域正常' }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('cmyk')">查看详情</button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">潘通匹配</div>
          <div class="summary-value">{{ topPantone ? topPantone.code : '—' }}</div>
          <div class="summary-status">{{ topPantone ? 'ΔE ' + topPantone.deltaE.toFixed(2) : '—' }}</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('pantone')">查看详情</button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">叠印预览</div>
          <div class="summary-swatch" :style="{ background: overprintMixedHex }"></div>
          <div class="summary-value">{{ overprintMixedHex }}</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('overprint')">查看详情</button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">网点换算</div>
          <div class="summary-swatch" :style="{ background: halftoneMidLevel ? halftoneMidLevel.color : 'transparent' }"></div>
          <div class="summary-value">{{ halftoneMidLevel ? halftoneMidLevel.color : '—' }}</div>
          <div class="summary-status">50% 网点参考色</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('screenTint')">查看详情</button>
            <button class="sm-btn" @click="halftoneChartVisible = true">网点分布图</button>
          </div>
        </div>
      </div>
    </section>

    <HalftoneChartDialog v-model:visible="halftoneChartVisible" :levels="halftoneLevels" />
  </div>
</template>

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import HalftoneChartDialog from './HalftoneChartDialog.vue';
import {
  DETAIL_MODULES,
  computeCmykResult,
  computePantoneResults,
  computeOverprintMixed,
  computeHalftoneLevels
} from './printToolsUtils';

export default {
  name: 'PrintTools',
  components: { ColorPicker, Selector, HalftoneChartDialog },
  data() {
    return {
      inputColor: '#1677FF',
      cmykProfile: 'srgb',
      pantonePaperType: 'coated',
      overprintColorB: '#FFFFFF',
      overprintOpacity: 70,
      halftoneChartVisible: false
    };
  },
  computed: {
    cmykResult() {
      return computeCmykResult(this.inputColor);
    },
    pantoneResults() {
      return computePantoneResults(this.inputColor, this.pantonePaperType);
    },
    topPantone() {
      return this.pantoneResults.length > 0 ? this.pantoneResults[0] : null;
    },
    overprintMixedHex() {
      return computeOverprintMixed(this.inputColor, this.overprintColorB, this.overprintOpacity).hex;
    },
    halftoneLevels() {
      return computeHalftoneLevels(this.inputColor);
    },
    halftoneMidLevel() {
      return this.halftoneLevels.find(l => l.percent === 50) || null;
    }
  },
  methods: {
    buildQuery(extra = {}) {
      return {
        color: this.inputColor,
        profile: this.cmykProfile,
        paper: this.pantonePaperType,
        colorB: this.overprintColorB,
        opacity: String(this.overprintOpacity),
        ...extra
      };
    },
    goToDetail(moduleId, extra = {}) {
      const target = DETAIL_MODULES.find(m => m.id === moduleId);
      if (!target) return;
      this.$router.push({
        path: target.route,
        query: this.buildQuery(extra)
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.module-printtools { width: 100%; min-width: 0; }

.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.panel-header { margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); display: block; margin-bottom: 16px; }

.unified-input-row {
  display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
  :deep(.color-picker) { flex: 1; min-width: 200px; }
}

.summary-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.summary-card {
  padding: 14px; background: var(--bg-muted); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); text-align: center;
  display: flex; flex-direction: column;
}
.summary-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.summary-value {
  font-size: 12px; font-weight: 600; color: var(--text-primary);
  font-family: monospace; word-break: break-all; margin-bottom: 4px;
}
.summary-status { font-size: 11px; color: var(--text-tertiary); margin-bottom: 8px; }
.summary-status.ok { color: #10B981; }
.summary-status.warn { color: #F59E0B; }
.summary-swatch {
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary); margin: 0 auto 6px;
}
.summary-actions {
  display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-top: auto;
}
.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}

@media (max-width: 1024px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .summary-grid { grid-template-columns: 1fr; }
}
</style>
