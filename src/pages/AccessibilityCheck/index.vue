<template>
  <div class="module-access">
    <!-- 功能选项卡 -->
    <div class="tab-row">
      <div class="tab-scroll">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- WCAG 对比度检测 -->
    <section v-if="activeTab === 'wcag'" class="panel wcag-panel">
      <div class="wcag-workbench">
        <div class="wcag-col wcag-input-col">
          <div class="panel-header compact">
            <h3 class="panel-title">WCAG 2.1 对比度自动测算</h3>
            <span class="panel-sub">区分正文与大字号，判定 AA / AAA 合规</span>
          </div>

          <div class="wcag-color-pair">
            <div class="wcag-color-item">
              <span class="wcag-color-tag">前景色</span>
              <div class="wcag-color-row">
                <span class="wcag-mini-swatch" :style="{ background: fgColor }"></span>
                <ColorPicker v-model="fgColor" />
              </div>
            </div>
            <div class="wcag-color-item">
              <span class="wcag-color-tag">背景色</span>
              <div class="wcag-color-row">
                <span class="wcag-mini-swatch" :style="{ background: bgColor }"></span>
                <ColorPicker v-model="bgColor" />
              </div>
            </div>
          </div>

          <div class="quick-test-row compact">
            <div class="quick-test-label">快速参考</div>
            <div class="quick-chip-list">
              <div
                v-for="pair in quickPairs"
                :key="pair.label"
                class="quick-chip"
                @click="applyPair(pair)"
              >
                <span class="quick-chip-fg" :style="{ background: pair.fg }"></span>
                <span class="quick-chip-bg" :style="{ background: pair.bg }"></span>
                {{ pair.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="wcag-col wcag-chart-col">
          <div class="contrast-gauge-card">
            <div class="gauge-head">
              <span class="gauge-title">对比度比值</span>
              <span class="gauge-value">{{ contrastRatio.toFixed(2) }}:1</span>
            </div>
            <div class="gauge-track">
              <div class="gauge-fill" :style="{ width: contrastGaugePercent + '%' }"></div>
              <div
                v-for="mark in contrastGaugeMarks"
                :key="mark.label"
                class="gauge-mark"
                :style="{ left: mark.left + '%' }"
                :title="mark.name"
              >
                <span class="gauge-mark-line"></span>
                <span class="gauge-mark-label">{{ mark.label }}</span>
              </div>
            </div>
            <div class="gauge-legend">
              <span v-for="mark in contrastGaugeMarks" :key="'lg-' + mark.label">{{ mark.name }} {{ mark.label }}</span>
            </div>
          </div>

          <div class="contrast-preview compact" :style="{ background: bgColor, color: fgColor }">
            <div class="contrast-line-lg">大字号 24px</div>
            <div class="contrast-line-base">正文 14px</div>
            <div class="contrast-line-sm">辅助 12px</div>
          </div>
        </div>

        <div class="wcag-col wcag-result-col">
          <div class="result-matrix-title">合规判定</div>
          <div class="contrast-result-matrix">
            <div class="result-card compact" :class="resultNormal.class">
              <div class="result-label">正文 AA</div>
              <div class="result-value">{{ contrastRatio.toFixed(2) }}:1</div>
              <div class="result-status">{{ resultNormal.status }} · 4.5:1</div>
            </div>
            <div class="result-card compact" :class="resultLarge.class">
              <div class="result-label">大字号 AA</div>
              <div class="result-value">{{ contrastRatio.toFixed(2) }}:1</div>
              <div class="result-status">{{ resultLarge.status }} · 3:1</div>
            </div>
            <div class="result-card compact" :class="resultNormalAAA.class">
              <div class="result-label">正文 AAA</div>
              <div class="result-value">{{ contrastRatio.toFixed(2) }}:1</div>
              <div class="result-status">{{ resultNormalAAA.status }} · 7:1</div>
            </div>
            <div class="result-card compact" :class="resultLargeAAA.class">
              <div class="result-label">大字号 AAA</div>
              <div class="result-value">{{ contrastRatio.toFixed(2) }}:1</div>
              <div class="result-status">{{ resultLargeAAA.status }} · 4.5:1</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 色弱色盲模拟 -->
    <section v-if="activeTab === 'sim'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">色弱色盲色觉模拟预览</h3>
        <span class="panel-sub">红绿色弱 / 蓝黄色弱 / 全色盲 三色模拟，配色是否失效一目了然</span>
      </div>

      <div class="sim-color-input">
        <div class="color-input-label">上传或选择主色</div>
        <div class="color-input-row">
          <ColorPicker v-model="simColor" />
        </div>
      </div>

      <div class="sim-grid">
        <div v-for="sim in simResults" :key="sim.key" class="sim-card">
          <div class="sim-card-head">
            <div class="sim-title">{{ sim.label }}</div>
            <span class="sim-prompt iconfont icon-Prompt"></span>
            <span class="sim-prompt-tip">{{ sim.label }}：设计稿配色是否在该人群中清晰可辨？</span>
          </div>
          <div class="sim-colors">
            <div
              v-for="(c, i) in sim.colors"
              :key="i"
              class="sim-color-cell"
              :style="{ background: c }"
              :title="c"
            ></div>
          </div>
          <div class="sim-hex">{{ sim.hex }}</div>
          <div class="sim-readability">
            <span class="sim-readability-text" :style="{ color: sim.hex }">Aa 示例文字 · 14px</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 政企合规 -->
    <section v-if="activeTab === 'gov'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">政企 / 海外合规色彩校验</h3>
        <span class="panel-sub">政务平台配色、海外欧盟色彩合规，一键优化不合规配色</span>
      </div>

      <div class="gov-input-row">
        <ColorPicker v-model="govColor" />
        <button class="primary-btn" @click="runGovCheck">执行合规检查</button>
      </div>

      <div class="gov-check-grid">
        <div v-for="c in govChecks" :key="c.title" class="gov-check-card" :class="c.pass ? 'pass' : 'warn'">
          <div class="gov-check-head">
            <span class="gov-check-icon">{{ c.pass ? '✓' : '!' }}</span>
            <span class="gov-check-title">{{ c.title }}</span>
          </div>
          <div class="gov-check-desc">{{ c.desc }}</div>
          <div v-if="c.suggestion" class="gov-check-suggest">建议：{{ c.suggestion }}</div>
        </div>
      </div>

      <div class="gov-summary">
        <strong>合规汇总：</strong> {{ govPassedCount }}/{{ govChecks.length }} 项符合标准。
        <span v-if="govSuggestedColors.length">推荐优化色：</span>
        <span v-for="c in govSuggestedColors" :key="c" class="gov-suggest-chip" @click="govColor = c">
          <span class="gov-swatch" :style="{ background: c }"></span>{{ c }}
        </span>
      </div>
    </section>

    <!-- 文字叠色安全推荐 -->
    <section v-if="activeTab === 'text'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">基于底色自动生成合规可读文字色</h3>
        <span class="panel-sub">省去手动调试，一键获得 AA / AAA 级推荐文字色</span>
      </div>

      <div class="text-bg-input">
        <div class="color-input-label">底色（背景色）</div>
        <div class="color-input-row">
          <ColorPicker v-model="textBgColor" />
        </div>
      </div>

      <div class="text-suggest-grid">
        <div
          v-for="rec in textSuggestions"
          :key="rec.name"
          class="text-suggest-card"
          :style="{ background: textBgColor, color: rec.color }"
        >
          <div class="text-suggest-row-1">{{ rec.name }}</div>
          <div class="text-suggest-row-2">推荐文字色：{{ rec.color }}</div>
          <div class="text-suggest-row-3">对比度 {{ rec.ratio.toFixed(2) }}:1 · {{ rec.level }}</div>
          <button class="copy-btn-sm" @click="copyValue(rec.color, rec.name)">复制色值</button>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import {
  parseColor, formatHEX, copyToClipboard, showToast
} from '../../utils/colorUtils';

function hexToRgb(hex) {
  const rgb = parseColor(hex);
  return rgb ? { r: rgb.r, g: rgb.g, b: rgb.b } : { r: 0, g: 0, b: 0 };
}

function rgbToHexObj({ r, g, b }) {
  const toH = (n) => n.toString(16).padStart(2, '0');
  return ('#' + toH(Math.round(r)) + toH(Math.round(g)) + toH(Math.round(b))).toUpperCase();
}

function srgbToLinear(v) {
  v = v / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(fg, bg) {
  const l1 = luminance(hexToRgb(fg));
  const l2 = luminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function protanopia({ r, g, b }) {
  return {
    r: r * 0.567 + g * 0.433,
    g: r * 0.558 + g * 0.442,
    b: b
  };
}
function deuteranopia({ r, g, b }) {
  return {
    r: r * 0.625 + g * 0.375,
    g: r * 0.7 + g * 0.3,
    b: b
  };
}
function tritanopia({ r, g, b }) {
  return {
    r: r,
    g: g * 0.733 + b * 0.267,
    b: g * 0.183 + b * 0.817
  };
}
function achromatopsia({ r, g, b }) {
  const gv = r * 0.299 + g * 0.587 + b * 0.114;
  return { r: gv, g: gv, b: gv };
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function adjustTowardNeutral(rgb, target, amount) {
  return {
    r: rgb.r + (target - rgb.r) * amount,
    g: rgb.g + (target - rgb.g) * amount,
    b: rgb.b + (target - rgb.b) * amount
  };
}

function darken(rgb, amount) {
  return {
    r: rgb.r * (1 - amount),
    g: rgb.g * (1 - amount),
    b: rgb.b * (1 - amount)
  };
}

export default {
  name: 'AccessibilityCheck',
  components: { ColorPicker },
  data() {
    return {
      activeTab: 'wcag',
      tabs: [
        { key: 'wcag', label: 'WCAG 对比度' },
        { key: 'sim', label: '色弱色盲模拟' },
        { key: 'gov', label: '政企合规' },
        { key: 'text', label: '文字叠色推荐' }
      ],
      fgColor: '#1677FF',
      bgColor: '#FFFFFF',
      simColor: '#FF5A5A',
      govColor: '#1677FF',
      govChecks: [],
      govPassedCount: 0,
      textBgColor: '#2563EB'
    };
  },
  computed: {
    contrastRatio() {
      return contrast(this.fgColor, this.bgColor);
    },
    contrastGaugePercent() {
      return Math.min((this.contrastRatio / 21) * 100, 100);
    },
    contrastGaugeMarks() {
      return [
        { label: '3:1', left: (3 / 21) * 100, name: 'AA 大字号' },
        { label: '4.5:1', left: (4.5 / 21) * 100, name: 'AA 正文' },
        { label: '7:1', left: (7 / 21) * 100, name: 'AAA 正文' }
      ];
    },
    resultNormal() {
      return this.buildContrastResult(this.contrastRatio, 4.5);
    },
    resultLarge() {
      return this.buildContrastResult(this.contrastRatio, 3);
    },
    resultNormalAAA() {
      return this.buildContrastResult(this.contrastRatio, 7);
    },
    resultLargeAAA() {
      return this.buildContrastResult(this.contrastRatio, 4.5);
    },
    quickPairs() {
      return [
        { fg: '#FFFFFF', bg: '#1677FF', label: '白-蓝' },
        { fg: '#FFFFFF', bg: '#000000', label: '白-黑' },
        { fg: '#000000', bg: '#FFFFFF', label: '黑-白' },
        { fg: '#333333', bg: '#F5F5F5', label: '深灰-浅灰' },
        { fg: '#FFFFFF', bg: '#EF4444', label: '白-红' },
        { fg: '#000000', bg: '#FCD34D', label: '黑-黄' }
      ].map(p => ({ ...p, ratio: contrast(p.fg, p.bg) }));
    },
    simResults() {
      const rgb = hexToRgb(this.simColor);
      const variants = [];
      for (let i = 0; i < 8; i++) {
        const adj = adjustTowardNeutral(rgb, 128, i * 0.1);
        variants.push({
          base: rgbToHexObj(adj),
          proto: rgbToHexObj(protanopia(adj)),
          deut: rgbToHexObj(deuteranopia(adj)),
          trita: rgbToHexObj(tritanopia(adj)),
          achro: rgbToHexObj(achromatopsia(adj))
        });
      }
      const main = variants[0];
      return [
        { key: 'normal', label: '正常色觉', hex: main.base, colors: variants.map(v => v.base) },
        { key: 'proto', label: '红色弱 (Protanopia)', hex: main.proto, colors: variants.map(v => v.proto) },
        { key: 'deut', label: '绿色弱 (Deuteranopia)', hex: main.deut, colors: variants.map(v => v.deut) },
        { key: 'trit', label: '蓝黄色弱 (Tritanopia)', hex: main.trita, colors: variants.map(v => v.trita) },
        { key: 'achro', label: '全色盲 (Achromatopsia)', hex: main.achro, colors: variants.map(v => v.achro) }
      ];
    },
    textSuggestions() {
      const bgHex = this.textBgColor;
      const cand = [
        { name: '纯黑', color: '#000000' },
        { name: '深灰', color: '#1F2937' },
        { name: '纯白', color: '#FFFFFF' },
        { name: '浅灰', color: '#F9FAFB' },
        { name: '暖白', color: '#FFFBEB' }
      ];
      return cand.map(c => {
        const ratio = contrast(c.color, bgHex);
        let level = '不合格';
        if (ratio >= 7) level = 'AAA';
        else if (ratio >= 4.5) level = 'AA';
        else if (ratio >= 3) level = 'AA 大字号';
        return { ...c, ratio, level };
      });
    },
    govSuggestedColors() {
      const set = new Set();
      this.govChecks.forEach(c => {
        if (c.suggestions) c.suggestions.forEach(s => set.add(s));
      });
      return [...set];
    }
  },
  mounted() {
    this.runGovCheck();
  },
  methods: {
    buildContrastResult(ratio, threshold) {
      if (ratio >= threshold) {
        return { class: 'ok', status: '通过' };
      }
      const gap = threshold - ratio;
      if (gap < 1) return { class: 'warn', status: '接近' };
      return { class: 'fail', status: '不通过' };
    },
    onFgPicker() {},
    onBgPicker() {},
    onFgText() {
      if (!this.fgColor.startsWith('#')) this.fgColor = '#' + this.fgColor;
    },
    onBgText() {
      if (!this.bgColor.startsWith('#')) this.bgColor = '#' + this.bgColor;
    },
    onSimText() {
      if (!this.simColor.startsWith('#')) this.simColor = '#' + this.simColor;
    },
    onTextBgText() {
      if (!this.textBgColor.startsWith('#')) this.textBgColor = '#' + this.textBgColor;
    },
    applyPair(p) {
      this.fgColor = p.fg;
      this.bgColor = p.bg;
    },
    runGovCheck() {
      const hex = this.govColor.trim();
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        this.govChecks = [{ title: '格式错误', desc: '请输入合法 HEX 如 #1677FF', pass: false }];
        this.govPassedCount = 0;
        return;
      }
      const rgb = hexToRgb(hex);
      const toWhite = contrast(hex, '#FFFFFF');
      const toBlack = contrast(hex, '#000000');

      const checks = [];
      checks.push({
        title: '政务平台冷静色检查',
        desc: '政务平台推荐使用冷静蓝/灰/红，避免过度饱和的高饱和色。',
        pass: rgb.r < 220 || rgb.g < 220 || rgb.b < 220,
        suggestions: ['#1F4E79', '#0D5AA6']
      });
      checks.push({
        title: '白底对比度（AA 正文）',
        desc: `对比度 ${toWhite.toFixed(2)}:1，需 ≥4.5:1 方满足正文可读性。`,
        pass: toWhite >= 4.5,
        suggestions: toWhite < 4.5 ? ['#1F4E79', '#2563EB'] : []
      });
      checks.push({
        title: '黑底对比度（深色模式）',
        desc: `对比度 ${toBlack.toFixed(2)}:1，需 ≥4.5:1 方可在深色背景上用作文字。`,
        pass: toBlack >= 4.5,
        suggestions: toBlack < 4.5 ? ['#93C5FD', '#A7F3D0'] : []
      });
      checks.push({
        title: '欧盟 Web 无障碍（WCAG 2.1 AA）',
        desc: '海外投放需满足 WCAG 2.1 AA 级，建议同时通过大字号与正文对比度。',
        pass: toWhite >= 3 || toBlack >= 3,
        suggestions: ['#1D4ED8', '#065F46']
      });
      checks.push({
        title: '品牌色与警示色区分',
        desc: `避免主色与警示红 (#EF4444) / 警告黄 (#F59E0B) 在色弱人群中产生混淆。`,
        pass: contrast(hex, '#EF4444') >= 3 || contrast(hex, '#F59E0B') >= 3,
        suggestions: []
      });
      checks.push({
        title: '打印色彩预判',
        desc: `高饱和 RGB 色可能在 CMYK 印刷后变暗，需注意印刷稿与屏幕色的色差。`,
        pass: !(rgb.r > 230 && rgb.g < 80 && rgb.b < 80),
        suggestions: []
      });
      this.govChecks = checks;
      this.govPassedCount = checks.filter(c => c.pass).length;
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-access { width: 100%; min-width: 0; }

.tab-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-scroll {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
}
.tab-btn {
  padding: 8px 16px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
  flex-shrink: 0;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
  &.active {
    background: var(--accent);
    color: var(--text-invert);
    border-color: var(--accent);
  }
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}
.panel-header { margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); }

.wcag-panel { padding: 16px; }
.panel-header.compact { margin-bottom: 12px; }
.wcag-workbench {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 1.2fr) minmax(200px, 0.9fr);
  gap: 16px;
  align-items: stretch;
}
.wcag-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.wcag-color-pair {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}
.wcag-color-item { display: flex; flex-direction: column; gap: 6px; }
.wcag-color-tag { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
.wcag-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  :deep(.color-picker) { flex: 1; min-width: 0; }
}
.wcag-mini-swatch {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}
.contrast-gauge-card {
  padding: 14px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}
.gauge-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.gauge-title { font-size: 12px; color: var(--text-secondary); }
.gauge-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.gauge-track {
  position: relative;
  height: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  overflow: visible;
  margin-bottom: 28px;
}
.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, #EF4444 0%, #F59E0B 35%, #10B981 70%, var(--accent) 100%);
  border-radius: var(--radius-pill);
  transition: width 0.2s ease;
}
.gauge-mark {
  position: absolute;
  top: -2px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.gauge-mark-line {
  width: 2px;
  height: 16px;
  background: var(--text-tertiary);
  border-radius: 1px;
}
.gauge-mark-label {
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-tertiary);
  white-space: nowrap;
}
.gauge-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 10px;
  color: var(--text-tertiary);
}
.result-matrix-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.contrast-result-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 1;
}
.result-card.compact {
  padding: 10px 8px;
  .result-value { font-size: 16px; margin-bottom: 2px; }
  .result-label { margin-bottom: 4px; }
}

.color-input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.color-input-card {
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 12px;
  border: 1px solid var(--border-primary);
}
.color-input-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.color-input-row {
  display: flex; gap: 8px; align-items: center; margin-bottom: 10px;
  input[type="color"] {
    width: 40px; height: 36px; border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm); padding: 2px; background: var(--bg-card); cursor: pointer;
  }
  :deep(.color-picker) {
    flex: 1;
    min-width: 0;
  }
}
.color-swatch {
  width: 100%; height: 40px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.contrast-preview {
  padding: 20px; border-radius: var(--radius-md);
  border: 1px solid var(--border-primary); margin-bottom: 16px;
  &.compact {
    padding: 14px 16px;
    margin-bottom: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 96px;
  }
}
.contrast-line-lg { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
.contrast-line-base { font-size: 14px; margin-bottom: 10px; }
.contrast-line-sm { font-size: 12px; }
.contrast-preview.compact {
  .contrast-line-lg { font-size: 20px; margin-bottom: 6px; }
  .contrast-line-base { font-size: 13px; margin-bottom: 6px; }
  .contrast-line-sm { font-size: 11px; }
}

.contrast-result-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.result-card {
  padding: 14px; border-radius: var(--radius-md); text-align: center;
  border: 1px solid var(--border-primary); background: var(--bg-muted);
  &.ok { border-color: #10B981; background: rgba(16,185,129,0.1); }
  &.warn { border-color: #F59E0B; background: rgba(245,158,11,0.1); }
  &.fail { border-color: #EF4444; background: rgba(239,68,68,0.1); }
}
.result-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.result-value { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.result-status { font-size: 11px; color: var(--text-tertiary); }

.quick-test-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 16px; padding-top: 16px;
  border-top: 1px dashed var(--border-primary);
  &.compact {
    flex-direction: column;
    align-items: stretch;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    gap: 6px;
  }
}
.quick-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-test-label { font-size: 12px; color: var(--text-secondary); }
.quick-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-pill);
  font-size: 12px; color: var(--text-primary); cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.quick-chip-fg, .quick-chip-bg {
  width: 12px; height: 12px; border-radius: 2px; border: 1px solid var(--border-primary);
}

/* sim */
.sim-color-input { margin-bottom: 16px; }
.sim-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px;
  overflow: visible;
}
.sim-card {
  position: relative;
  background: var(--bg-muted); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); padding: 12px; text-align: center;
  overflow: visible;
}
.sim-card-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 18px;
  margin-bottom: 8px;
  overflow: visible;
}
.sim-title { font-size: 12px; font-weight: 600; color: var(--text-primary); margin: 0; }
.sim-prompt {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: help;
  user-select: none;
  line-height: 1;
  transition: color 0.15s ease;
  z-index: 2;
  &:hover { color: var(--accent); }
}
.sim-prompt-tip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  width: auto;
  max-width: 100%;
  padding: 8px 10px;
  background: rgba(30, 33, 38, 0.95);
  color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}
.sim-prompt:hover + .sim-prompt-tip {
  visibility: visible;
  opacity: 1;
}
.sim-colors {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; margin-bottom: 8px;
}
.sim-color-cell { height: 24px; border-radius: 2px; }
.sim-hex { font-size: 11px; color: var(--text-tertiary); font-family: monospace; margin-bottom: 8px; }
.sim-readability {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 6px;
  background: #fff;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}
.sim-readability-text {
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
}

/* gov */
.gov-input-row {
  display: flex; gap: 8px; align-items: center; margin-bottom: 16px;
  :deep(.color-picker) {
    flex: 1;
    min-width: 0;
  }
  input[type="color"] {
    width: 40px; height: 36px; border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm); padding: 2px; background: var(--bg-card); cursor: pointer;
  }
}
.primary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
  &:hover { opacity: 0.9; }
}
.gov-check-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;
}
.gov-check-card {
  padding: 14px; border-radius: var(--radius-md);
  border: 1px solid var(--border-primary); background: var(--bg-muted);
  &.pass { border-color: #10B981; background: rgba(16,185,129,0.08); }
  &.warn { border-color: #F59E0B; background: rgba(245,158,11,0.08); }
}
.gov-check-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.gov-check-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; font-size: 12px; font-weight: 700;
  background: var(--accent); color: var(--text-invert);
  .pass & { background: #10B981; }
  .warn & { background: #F59E0B; }
}
.gov-check-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.gov-check-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.gov-check-suggest { font-size: 12px; color: var(--accent); margin-top: 6px; }
.gov-summary {
  padding: 12px 14px; background: var(--bg-muted); border-radius: var(--radius-md);
  font-size: 13px; color: var(--text-primary);
}
.gov-suggest-chip {
  display: inline-flex; align-items: center; gap: 6px; margin-left: 8px;
  padding: 3px 8px; background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill); cursor: pointer; font-size: 12px;
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.gov-swatch {
  width: 14px; height: 14px; border-radius: 2px; border: 1px solid var(--border-primary);
}

/* text suggestions */
.text-bg-input { margin-bottom: 16px; }
.text-suggest-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.text-suggest-card {
  padding: 16px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-primary);
  position: relative; min-height: 120px;
}
.text-suggest-row-1 { font-size: 18px; font-weight: 700; margin-bottom: 8px; line-height: 1.3; }
.text-suggest-row-2 { font-size: 11px; margin-bottom: 4px; }
.text-suggest-row-3 { font-size: 11px; font-weight: 600; }
.copy-btn-sm {
  margin-top: 10px; padding: 4px 10px; background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.15); border-radius: var(--radius-sm);
  font-size: 11px; cursor: pointer; color: #111;
  &:hover { background: #fff; }
}

@media (max-width: 960px) {
  .wcag-workbench { grid-template-columns: 1fr; }
  .color-input-grid { grid-template-columns: 1fr; }
  .contrast-result-grid { grid-template-columns: repeat(2, 1fr); }
  .contrast-result-matrix { grid-template-columns: repeat(2, 1fr); }
  .gov-check-grid { grid-template-columns: 1fr; }
  .sim-grid { grid-template-columns: repeat(2, 1fr); }
  .text-suggest-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
