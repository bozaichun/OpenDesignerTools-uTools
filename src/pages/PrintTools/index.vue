<template>
  <div class="module-printtools">
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

    <section v-if="activeTab === 'cmyk'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">屏幕色转印刷 CMYK</h3>
        <span class="panel-sub">RGB/HEX 转带 ICC 配置 CMYK，预览印刷色差与溢色预警</span>
      </div>

      <div class="cmyk-input-row">
        <ColorPicker v-model="cmykInputColor" />
        <Selector v-model="cmykProfile" :block="false" :flex="true">
          <option value="srgb">sRGB / 通用</option>
          <option value="cmyk_us">US Web Coated (SWOP) v2</option>
          <option value="cmyk_eu">Euroscale Coated v2</option>
          <option value="cmyk_jp">Japan Color 2001 Coated</option>
        </Selector>
      </div>

      <div class="cmyk-preview">
        <div class="cmyk-preview-item">
          <div class="cmyk-preview-swatch" :style="{ background: cmykInputColor }">
            <span class="cmyk-preview-text" :style="{ color: getContrastColor(cmykInputColor) }">屏幕色</span>
          </div>
          <div class="cmyk-preview-label">原始 RGB</div>
          <div class="cmyk-preview-value">{{ cmykInputColor }}</div>
        </div>
        <div class="cmyk-arrow">→</div>
        <div class="cmyk-preview-item">
          <div class="cmyk-preview-swatch" :style="{ background: cmykConvertedHex }">
            <span class="cmyk-preview-text" :style="{ color: getContrastColor(cmykConvertedHex) }">印刷色</span>
          </div>
          <div class="cmyk-preview-label">CMYK 模拟</div>
          <div class="cmyk-preview-value">cmyk({{ cmykResult.c }}%, {{ cmykResult.m }}%, {{ cmykResult.y }}%, {{ cmykResult.k }}%)</div>
        </div>
      </div>

      <div class="cmyk-result-grid">
        <div class="result-card" :class="cmykResult.outOfGamut ? 'warn' : 'ok'">
          <div class="result-label">色域检测</div>
          <div class="result-value">{{ cmykResult.outOfGamut ? '⚠ 溢色' : '✓ 正常' }}</div>
          <div class="result-status">超出 CMYK 色域的颜色印刷后会变暗</div>
        </div>
        <div class="result-card">
          <div class="result-label">C 青色</div>
          <div class="result-value">{{ cmykResult.c }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill c" :style="{ width: cmykResult.c + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">M 品红</div>
          <div class="result-value">{{ cmykResult.m }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill m" :style="{ width: cmykResult.m + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">Y 黄色</div>
          <div class="result-value">{{ cmykResult.y }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill y" :style="{ width: cmykResult.y + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">K 黑色</div>
          <div class="result-value">{{ cmykResult.k }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill k" :style="{ width: cmykResult.k + '%' }"></div></div>
        </div>
      </div>

      <div class="warning-box" v-if="cmykResult.outOfGamut">
        ⚠ 此颜色超出 CMYK 印刷色域，实际印刷效果可能与屏幕显示有明显差异。建议降低饱和度后使用。
      </div>
    </section>

    <section v-if="activeTab === 'pantone'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">潘通 Pantone 专色匹配</h3>
        <span class="panel-sub">CMYK/HEX 一键匹配对应潘通色号，支持铜版纸/胶版纸</span>
      </div>

      <div class="pantone-input-row">
        <ColorPicker v-model="pantoneInputColor" />
        <Selector v-model="pantonePaperType" :block="false" :flex="true">
          <option value="coated">铜版纸 Coated</option>
          <option value="uncoated">胶版纸 Uncoated</option>
        </Selector>
        <button class="primary-btn" @click="matchPantone">匹配潘通色</button>
      </div>

      <div v-if="pantoneResults.length > 0" class="pantone-results">
        <div class="pantone-title">最接近的 {{ pantoneResults.length }} 个潘通色号</div>
        <div class="pantone-list">
          <div
            v-for="(p, idx) in pantoneResults"
            :key="idx"
            class="pantone-item"
          >
            <div class="pantone-swatch" :style="{ background: p.hex }">
              <span class="pantone-swatch-text" :style="{ color: getContrastColor(p.hex) }">{{ p.code }}</span>
            </div>
            <div class="pantone-info">
              <div class="pantone-code">{{ p.code }}</div>
              <div class="pantone-name">{{ p.name }}</div>
              <div class="pantone-hex">{{ p.hex }}</div>
              <div class="pantone-delta">ΔE: {{ p.deltaE.toFixed(2) }}</div>
            </div>
            <button class="sm-btn" @click="copyValue(p.hex, p.code)">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'overprint'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">叠印 / 透印预览</h3>
        <span class="panel-sub">两色叠加印刷效果预览，避免印刷混色翻车</span>
      </div>

      <div class="overprint-inputs">
        <div class="overprint-input-group">
          <div class="input-label">颜色 A（底层）</div>
          <div class="input-row">
            <ColorPicker v-model="overprintColorA" />
          </div>
        </div>
        <div class="overprint-input-group">
          <div class="input-label">颜色 B（上层）</div>
          <div class="input-row">
            <ColorPicker v-model="overprintColorB" />
          </div>
        </div>
        <div class="overprint-input-group">
          <div class="input-label">上层透明度</div>
          <div class="input-row">
            <input type="range" v-model="overprintOpacity" min="10" max="100" class="opacity-slider" />
            <span>{{ overprintOpacity }}%</span>
          </div>
        </div>
      </div>

      <div class="overprint-preview">
        <div class="overprint-item">
          <div class="overprint-swatch large" :style="{ background: overprintColorA }">
            <span :style="{ color: getContrastColor(overprintColorA) }">颜色 A</span>
          </div>
          <div class="overprint-label">{{ overprintColorA }}</div>
        </div>
        <div class="overprint-plus">+</div>
        <div class="overprint-item">
          <div class="overprint-swatch large" :style="{ background: overprintColorB }">
            <span :style="{ color: getContrastColor(overprintColorB) }">颜色 B</span>
          </div>
          <div class="overprint-label">{{ overprintColorB }}</div>
        </div>
        <div class="overprint-equals">=</div>
        <div class="overprint-item">
          <div class="overprint-swatch large" :style="overprintMixedStyle">
            <span :style="{ color: getContrastColor(overprintMixedHex) }">叠印效果</span>
          </div>
          <div class="overprint-label">{{ overprintMixedHex }}</div>
        </div>
      </div>

      <div class="overprint-description">
        <strong>印刷提示：</strong> 叠印常用于在深色背景上印刷浅色文字或特殊工艺。
        实际印刷效果受纸张类型、油墨品牌、印刷压力等因素影响，建议先打样确认。
      </div>
    </section>

    <section v-if="activeTab === 'halftone'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">网点适配色值换算</h3>
        <span class="panel-sub">印刷网点百分比对应色值换算，适配画册、包装印刷制版</span>
      </div>

      <div class="halftone-input-row">
        <ColorPicker v-model="halftoneInputColor" />
        <label class="checkbox-label">
          <input type="checkbox" v-model="halftoneUseDPI" />
          <span>根据 DPI 精确计算</span>
        </label>
        <Selector v-if="halftoneUseDPI" v-model="halftoneDPI" :block="false" :flex="true">
          <option value="150">150 lpi（粗网点）</option>
          <option value="175">175 lpi（标准）</option>
          <option value="200">200 lpi（精细）</option>
          <option value="300">300 lpi（超精细）</option>
        </Selector>
      </div>

      <div class="halftone-grid">
        <div
          v-for="(level, idx) in halftoneLevels"
          :key="idx"
          class="halftone-card"
        >
          <div class="halftone-swatch" :style="{ background: level.color }">
            <span class="halftone-text" :style="{ color: getContrastColor(level.color) }">{{ level.percent }}%</span>
          </div>
          <div class="halftone-info">
            <div class="halftone-percent">网点 {{ level.percent }}%</div>
            <div class="halftone-hex">{{ level.color }}</div>
            <div class="halftone-rgb">RGB({{ level.rgb.r }}, {{ level.rgb.g }}, {{ level.rgb.b }})</div>
          </div>
          <button class="sm-btn" @click="copyValue(level.color, level.percent + '% 网点')">复制</button>
        </div>
      </div>

      <div class="halftone-hint">
        💡 提示：网点百分比越小，颜色越浅。报纸常用 85-120 lpi，杂志画册 150-175 lpi，高端印刷可达 200-300 lpi。
      </div>
    </section>
  </div>
</template>

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { parseColor, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';

const PANTONE_COATED = [
  { code: 'PANTONE Yellow C', name: '潘通黄 C', hex: '#FFCD00', lab: { l: 88, a: -6, b: 110 } },
  { code: 'PANTONE Orange 021 C', name: '潘通橙 021 C', hex: '#FF6A13', lab: { l: 61, a: 61, b: 74 } },
  { code: 'PANTONE Warm Red C', name: '潘通暖红 C', hex: '#E4002B', lab: { l: 48, a: 68, b: 41 } },
  { code: 'PANTONE Red 032 C', name: '潘通红 032 C', hex: '#EF3340', lab: { l: 52, a: 66, b: 39 } },
  { code: 'PANTONE Rubine Red C', name: '潘通宝石红 C', hex: '#C62168', lab: { l: 44, a: 66, b: 14 } },
  { code: 'PANTONE Rhodamine Red C', name: '潘通玫瑰红 C', hex: '#E0006F', lab: { l: 49, a: 72, b: 17 } },
  { code: 'PANTONE Purple C', name: '潘通紫 C', hex: '#7D2181', lab: { l: 35, a: 48, b: -42 } },
  { code: 'PANTONE Violet C', name: '潘通紫罗兰 C', hex: '#4A2572', lab: { l: 25, a: 36, b: -47 } },
  { code: 'PANTONE Blue 072 C', name: '潘通蓝 072 C', hex: '#004F71', lab: { l: 25, a: 2, b: -45 } },
  { code: 'PANTONE Reflex Blue C', name: '潘通反射蓝 C', hex: '#002F87', lab: { l: 22, a: 34, b: -74 } },
  { code: 'PANTONE Process Blue C', name: '潘通四色蓝 C', hex: '#007CC3', lab: { l: 48, a: 3, b: -62 } },
  { code: 'PANTONE 300 C', name: '潘通 300 C', hex: '#00A1E4', lab: { l: 63, a: -20, b: -52 } },
  { code: 'PANTONE Green C', name: '潘通绿 C', hex: '#00A878', lab: { l: 61, a: -46, b: 37 } },
  { code: 'PANTONE 375 C', name: '潘通 375 C', hex: '#CFE02A', lab: { l: 85, a: -18, b: 90 } },
  { code: 'PANTONE Yellow 012 C', name: '潘通黄 012 C', hex: '#FFB61F', lab: { l: 78, a: 14, b: 91 } },
  { code: 'PANTONE 185 C', name: '潘通 185 C', hex: '#C8102E', lab: { l: 46, a: 64, b: 46 } },
  { code: 'PANTONE 186 C', name: '潘通 186 C', hex: '#A6192E', lab: { l: 39, a: 56, b: 35 } },
  { code: 'PANTONE 286 C', name: '潘通 286 C', hex: '#1D2860', lab: { l: 16, a: 25, b: -62 } },
  { code: 'PANTONE 3005 C', name: '潘通 3005 C', hex: '#0033A0', lab: { l: 22, a: 36, b: -79 } },
  { code: 'PANTONE 362 C', name: '潘通 362 C', hex: '#006749', lab: { l: 35, a: -28, b: 35 } }
];

const PANTONE_UNCOATED = [
  { code: 'PANTONE Yellow U', name: '潘通黄 U', hex: '#FFD100', lab: { l: 89, a: -5, b: 108 } },
  { code: 'PANTONE Orange 021 U', name: '潘通橙 021 U', hex: '#FF7A18', lab: { l: 63, a: 58, b: 72 } },
  { code: 'PANTONE Red 032 U', name: '潘通红 032 U', hex: '#F04A3D', lab: { l: 54, a: 62, b: 38 } },
  { code: 'PANTONE Blue 072 U', name: '潘通蓝 072 U', hex: '#00557C', lab: { l: 27, a: 0, b: -42 } },
  { code: 'PANTONE Reflex Blue U', name: '潘通反射蓝 U', hex: '#003D87', lab: { l: 24, a: 32, b: -70 } },
  { code: 'PANTONE Process Blue U', name: '潘通四色蓝 U', hex: '#0085CF', lab: { l: 50, a: 0, b: -58 } },
  { code: 'PANTONE Green U', name: '潘通绿 U', hex: '#00B087', lab: { l: 63, a: -44, b: 35 } },
  { code: 'PANTONE Purple U', name: '潘通紫 U', hex: '#822A85', lab: { l: 37, a: 46, b: -40 } },
  { code: 'PANTONE 185 U', name: '潘通 185 U', hex: '#CB1A32', lab: { l: 47, a: 62, b: 44 } },
  { code: 'PANTONE 286 U', name: '潘通 286 U', hex: '#222E68', lab: { l: 18, a: 24, b: -58 } }
];

function rgbToLab({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116);
  y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116);
  z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116);
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

function deltaE(lab1, lab2) {
  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

export default {
  name: 'PrintTools',
  components: { ColorPicker, Selector },
  data() {
    return {
      activeTab: 'cmyk',
      tabs: [
        { key: 'cmyk', label: 'CMYK 校准' },
        { key: 'pantone', label: '潘通匹配' },
        { key: 'overprint', label: '叠印预览' },
        { key: 'halftone', label: '网点换算' }
      ],
      cmykInputColor: '#1677FF',
      cmykProfile: 'srgb',
      pantoneInputColor: '#FF6B6B',
      pantonePaperType: 'coated',
      pantoneResults: [],
      overprintColorA: '#FF6B6B',
      overprintColorB: '#1677FF',
      overprintOpacity: 70,
      halftoneInputColor: '#52C41A',
      halftoneUseDPI: false,
      halftoneDPI: '175'
    };
  },
  computed: {
    cmykResult() {
      const rgb = parseColor(this.cmykInputColor);
      if (!rgb) return { c: 0, m: 0, y: 0, k: 0, outOfGamut: false };
      const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return { c: 0, m: 0, y: 0, k: 100, outOfGamut: false };
      const c = (1 - r - k) / (1 - k);
      const m = (1 - g - k) / (1 - k);
      const y = (1 - b - k) / (1 - k);
      const outOfGamut = (r * 299 + g * 587 + b * 114) / 1000 > 230 ||
        (r > 0.95 && g > 0.95 && b > 0.95);
      return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100),
        outOfGamut
      };
    },
    cmykConvertedHex() {
      const { c, m, y, k } = this.cmykResult;
      const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
      const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
      const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
      const toHex = (n) => n.toString(16).padStart(2, '0');
      return ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase();
    },
    overprintMixedStyle() {
      const rgbA = parseColor(this.overprintColorA);
      const rgbB = parseColor(this.overprintColorB);
      if (!rgbA || !rgbB) return { background: this.overprintColorA };
      const alpha = this.overprintOpacity / 100;
      const r = Math.round(rgbA.r * (1 - alpha) + rgbB.r * alpha);
      const g = Math.round(rgbA.g * (1 - alpha) + rgbB.g * alpha);
      const b = Math.round(rgbA.b * (1 - alpha) + rgbB.b * alpha);
      const toHex = (n) => n.toString(16).padStart(2, '0');
      const hex = '#' + toHex(r) + toHex(g) + toHex(b);
      return { background: hex.toUpperCase() };
    },
    overprintMixedHex() {
      return this.overprintMixedStyle.background || '#FFFFFF';
    },
    halftoneLevels() {
      const rgb = parseColor(this.halftoneInputColor);
      if (!rgb) return [];
      const levels = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      return levels.map(pct => {
        const factor = pct / 100;
        const r = Math.round(255 - (255 - rgb.r) * factor);
        const g = Math.round(255 - (255 - rgb.g) * factor);
        const b = Math.round(255 - (255 - rgb.b) * factor);
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return {
          percent: pct,
          color: ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase(),
          rgb: { r, g, b }
        };
      });
    }
  },
  mounted() {
    this.matchPantone();
  },
  methods: {
    getContrastColor(hex) {
      const rgb = parseColor(hex);
      if (!rgb) return '#000000';
      return gcc(rgb);
    },
    matchPantone() {
      const rgb = parseColor(this.pantoneInputColor);
      if (!rgb) return;
      const lab = rgbToLab(rgb);
      const palette = this.pantonePaperType === 'coated' ? PANTONE_COATED : PANTONE_UNCOATED;
      const results = palette.map(p => ({
        ...p,
        deltaE: deltaE(lab, p.lab)
      }));
      results.sort((a, b) => a.deltaE - b.deltaE);
      this.pantoneResults = results.slice(0, 5);
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-printtools { width: 100%; min-width: 0; }

.tab-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.tab-scroll {
  display: flex; gap: 8px; flex-wrap: wrap; flex: 1 1 auto; min-width: 0;
}
.tab-btn {
  padding: 8px 16px; background: var(--bg-muted); color: var(--text-secondary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-md);
  cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease;
  flex-shrink: 0;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
  &.active { background: var(--accent); color: var(--text-invert); border-color: var(--accent); }
}

.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.panel-header { margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); }

.primary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
  &:hover { opacity: 0.9; }
}

.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}

.cmyk-input-row, .pantone-input-row, .halftone-input-row {
  display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
}

.cmyk-preview {
  display: flex; align-items: center; justify-content: center; gap: 24px;
  padding: 24px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.cmyk-preview-item {
  text-align: center;
}
.cmyk-preview-swatch {
  width: 120px; height: 120px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px; border: 1px solid var(--border-primary);
}
.cmyk-preview-text { font-size: 14px; font-weight: 600; }
.cmyk-preview-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
.cmyk-preview-value { font-size: 11px; font-family: monospace; color: var(--text-tertiary); }
.cmyk-arrow { font-size: 24px; color: var(--text-tertiary); }

.cmyk-result-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  margin-bottom: 16px;
}
.result-card {
  padding: 14px; border-radius: var(--radius-md); text-align: center;
  border: 1px solid var(--border-primary); background: var(--bg-muted);
  &.ok { border-color: #10B981; background: rgba(16,185,129,0.08); }
  &.warn { border-color: #F59E0B; background: rgba(245,158,11,0.08); }
}
.result-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.result-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.result-status { font-size: 11px; color: var(--text-tertiary); }

.cmyk-bar {
  height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin-top: 8px;
}
.cmyk-bar-fill {
  height: 100%; border-radius: 4px;
  &.c { background: #00AEEF; }
  &.m { background: #EC008C; }
  &.y { background: #FFF200; }
  &.k { background: #231F20; }
}

.warning-box {
  padding: 14px 18px; background: rgba(245, 158, 11, 0.1);
  border: 1px solid #F59E0B; border-radius: var(--radius-md);
  font-size: 13px; color: #B45309;
}

.pantone-list {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.pantone-item {
  padding: 12px; background: var(--bg-muted); border-radius: var(--radius-md);
  border: 1px solid var(--border-primary); display: flex; flex-direction: column;
  align-items: center; text-align: center;
}
.pantone-swatch {
  width: 100%; height: 60px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px; border: 1px solid var(--border-primary);
}
.pantone-swatch-text { font-size: 10px; font-weight: 600; }
.pantone-info { flex: 1; margin-bottom: 10px; }
.pantone-code { font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.pantone-name { font-size: 11px; color: var(--text-secondary); margin-bottom: 2px; }
.pantone-hex { font-size: 10px; font-family: monospace; color: var(--text-tertiary); }
.pantone-delta { font-size: 10px; color: var(--accent); margin-top: 4px; }

.pantone-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }

.overprint-inputs {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 24px;
}
.overprint-input-group {
  background: var(--bg-muted); padding: 14px; border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}
.input-label { font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.input-row {
  display: flex; gap: 8px; align-items: center;
}
.input-row :deep(.color-picker) {
  flex: 1;
  min-width: 0;
}
.input-row input[type="color"] {
  width: 40px; height: 36px; border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm); padding: 2px; cursor: pointer;
}

.opacity-slider { flex: 1; }

.overprint-preview {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 24px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 20px; flex-wrap: wrap;
}
.overprint-item {
  text-align: center;
}
.overprint-swatch {
  border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; border: 1px solid var(--border-primary);
  margin-bottom: 8px;
  &.large { width: 120px; height: 80px; }
}
.overprint-label { font-size: 11px; font-family: monospace; color: var(--text-secondary); }
.overprint-plus, .overprint-equals {
  font-size: 28px; font-weight: 300; color: var(--text-tertiary);
}

.overprint-description {
  padding: 14px 18px; background: var(--bg-muted); border-radius: var(--radius-md);
  font-size: 13px; color: var(--text-secondary); line-height: 1.6;
}

.checkbox-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-primary); cursor: pointer;
}

.halftone-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-bottom: 16px;
}
.halftone-card {
  display: flex; gap: 12px; padding: 12px;
  background: var(--bg-muted); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); align-items: center;
}
.halftone-swatch {
  width: 60px; height: 60px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-primary);
}
.halftone-text { font-size: 12px; font-weight: 600; }
.halftone-info { flex: 1; }
.halftone-percent { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.halftone-hex { font-size: 11px; font-family: monospace; color: var(--text-secondary); }
.halftone-rgb { font-size: 10px; color: var(--text-tertiary); }

.halftone-hint {
  padding: 12px 16px; background: var(--accent-soft); border-radius: var(--radius-md);
  font-size: 12px; color: var(--accent);
}

@media (max-width: 1024px) {
  .cmyk-result-grid { grid-template-columns: repeat(2, 1fr); }
  .pantone-list { grid-template-columns: repeat(2, 1fr); }
  .overprint-inputs { grid-template-columns: 1fr; }
  .halftone-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .cmyk-result-grid, .pantone-list, .halftone-grid { grid-template-columns: 1fr; }
  .cmyk-preview { flex-direction: column; }
  .overprint-preview { flex-direction: column; }
}
</style>
