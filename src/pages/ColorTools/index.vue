<template>
  <div class="module-colortools">
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

    <section v-if="activeTab === 'adjust'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">色阶明度微调</h3>
        <span class="panel-sub">固定色相，微调明度、饱和度，一键生成同色系色卡</span>
      </div>

      <div class="adjust-input-row">
        <ColorPicker v-model="adjustColor" />
        <button class="primary-btn" @click="resetAdjust">重置</button>
      </div>

      <div class="adjust-preview">
        <div class="adjust-main-swatch" :style="{ background: adjustColor }">
          <span :style="{ color: getContrastColor(adjustColor) }">{{ adjustColor }}</span>
        </div>
      </div>

      <div class="adjust-sliders">
        <div class="slider-item">
          <label>色相 Hue: {{ adjustHue }}°</label>
          <input type="range" v-model="adjustHue" min="0" max="360" class="adjust-slider" />
        </div>
        <div class="slider-item">
          <label>饱和度 Saturation: {{ adjustSaturation }}%</label>
          <input type="range" v-model="adjustSaturation" min="0" max="200" class="adjust-slider" />
        </div>
        <div class="slider-item">
          <label>明度 Lightness: {{ adjustLightness }}%</label>
          <input type="range" v-model="adjustLightness" min="0" max="100" class="adjust-slider" />
        </div>
      </div>

      <div class="adjust-current">
        <div class="adjust-result-swatch" :style="{ background: adjustedColor }">
          <span :style="{ color: getContrastColor(adjustedColor) }">当前调整结果</span>
        </div>
        <div class="adjust-result-info">
          <div><strong>HEX:</strong> {{ adjustedColor }}</div>
          <div><strong>HSL:</strong> hsl({{ adjustHue }}, {{ adjustSaturation }}%, {{ adjustLightness }}%)</div>
        </div>
        <button class="primary-btn" @click="copyValue(adjustedColor, '调整后色值')">复制</button>
      </div>

      <div class="shade-section">
        <div class="section-title">同色系 9 阶色卡（UI 分级配色专用）</div>
        <div class="shade-grid">
          <div
            v-for="(shade, idx) in adjustedShades"
            :key="idx"
            class="shade-card"
          >
            <div class="shade-swatch" :style="{ background: shade.color }">
              <span class="shade-level" :style="{ color: getContrastColor(shade.color) }">{{ shade.level }}</span>
            </div>
            <div class="shade-hex">{{ shade.color }}</div>
            <button class="sm-btn" @click="copyValue(shade.color, shade.level)">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'gradient'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">渐变色彩编辑器</h3>
        <span class="panel-sub">双色/多色渐变取色，拆分渐变节点色值，导出渐变代码</span>
      </div>

      <div class="gradient-inputs">
        <div class="gradient-color-inputs">
          <div
            v-for="(stop, idx) in gradientStops"
            :key="idx"
            class="gradient-stop-input"
          >
            <label>节点 {{ idx + 1 }}</label>
            <ColorPicker v-model="stop.color" />
            <input type="range" v-model="stop.position" min="0" max="100" class="gradient-pos-slider" />
            <span>{{ stop.position }}%</span>
            <button v-if="gradientStops.length > 2" class="sm-btn danger" @click="removeStop(idx)">×</button>
          </div>
        </div>
        <button class="secondary-btn" @click="addStop">+ 添加节点</button>
      </div>

      <div class="gradient-preview-section">
        <div class="gradient-preview-large" :style="gradientStyle">
          <span class="gradient-preview-text">渐变预览</span>
        </div>

        <div class="gradient-direction">
          <label>渐变方向：</label>
          <select v-model="gradientDirection" class="form-select">
            <option value="to right">从左到右</option>
            <option value="to bottom">从上到下</option>
            <option value="to bottom right">对角线</option>
            <option value="circle">圆形辐射</option>
            <option value="45deg">45° 斜向</option>
            <option value="135deg">135° 斜向</option>
          </select>
        </div>

        <div class="gradient-extracted">
          <div class="section-title">自动提取的 8 个节点色值</div>
          <div class="extracted-grid">
            <div
              v-for="(color, idx) in extractedGradientColors"
              :key="idx"
              class="extracted-item"
            >
              <div class="extracted-swatch" :style="{ background: color }"></div>
              <span class="extracted-hex">{{ color }}</span>
              <button class="sm-btn-xs" @click="copyValue(color, '渐变节点 ' + (idx + 1))">复制</button>
            </div>
          </div>
        </div>
      </div>

      <div class="gradient-code-section">
        <div class="section-title">CSS 渐变代码</div>
        <pre class="code-block"><code>{{ gradientCSS }}</code></pre>
        <button class="primary-btn" @click="copyValue(gradientCSS, 'CSS 渐变代码')">复制 CSS 代码</button>
      </div>
    </section>

    <section v-if="activeTab === 'difference'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">色差比对工具</h3>
        <span class="panel-sub">双色并排预览，精准计算数值色差，适配品牌极小色差管控</span>
      </div>

      <div class="diff-inputs">
        <div class="diff-input-group">
          <label>颜色 A</label>
          <div class="diff-input-row">
            <ColorPicker v-model="diffColorA" />
          </div>
        </div>
        <div class="diff-input-group">
          <label>颜色 B</label>
          <div class="diff-input-row">
            <ColorPicker v-model="diffColorB" />
          </div>
        </div>
      </div>

      <div class="diff-compare">
        <div class="diff-swatch" :style="{ background: diffColorA }">
          <span :style="{ color: getContrastColor(diffColorA) }">A</span>
        </div>
        <div class="diff-arrow">↔</div>
        <div class="diff-swatch" :style="{ background: diffColorB }">
          <span :style="{ color: getContrastColor(diffColorB) }">B</span>
        </div>
        <div class="diff-swatch-mix" :style="diffMixedStyle">
          <span :style="{ color: getContrastColor(diffMixedHex) }">混合</span>
        </div>
      </div>

      <div class="diff-results">
        <div class="diff-result-card">
          <div class="diff-result-label">ΔE (CIE76)</div>
          <div class="diff-result-value" :class="getDeltaEClass(deltaE76)">{{ deltaE76.toFixed(2) }}</div>
          <div class="diff-result-status">{{ getDeltaEDescription(deltaE76) }}</div>
        </div>
        <div class="diff-result-card">
          <div class="diff-result-label">RGB 差值</div>
          <div class="diff-result-value">{{ rgbDiff.r }}, {{ rgbDiff.g }}, {{ rgbDiff.b }}</div>
          <div class="diff-result-status">各通道差 (±255)</div>
        </div>
        <div class="diff-result-card">
          <div class="diff-result-label">HSL 差值</div>
          <div class="diff-result-value">{{ hslDiff.h }}°, {{ hslDiff.s }}%, {{ hslDiff.l }}%</div>
          <div class="diff-result-status">色相/饱和度/明度</div>
        </div>
        <div class="diff-result-card">
          <div class="diff-result-label">亮度差</div>
          <div class="diff-result-value">{{ brightnessDiff.toFixed(1) }}</div>
          <div class="diff-result-status">{{ brightnessDiff < 50 ? '差异较小' : '差异明显' }}</div>
        </div>
      </div>

      <div class="diff-detail">
        <div class="diff-colors-info">
          <div class="diff-color-info">
            <div class="diff-color-label">颜色 A: {{ diffColorA }}</div>
            <div class="diff-color-rgb">RGB: {{ colorA.rgb.r }}, {{ colorA.rgb.g }}, {{ colorA.rgb.b }}</div>
            <div class="diff-color-hsl">HSL: {{ colorA.hsl.h }}°, {{ colorA.hsl.s }}%, {{ colorA.hsl.l }}%</div>
          </div>
          <div class="diff-color-info">
            <div class="diff-color-label">颜色 B: {{ diffColorB }}</div>
            <div class="diff-color-rgb">RGB: {{ colorB.rgb.r }}, {{ colorB.rgb.g }}, {{ colorB.rgb.b }}</div>
            <div class="diff-color-hsl">HSL: {{ colorB.hsl.h }}°, {{ colorB.hsl.s }}%, {{ colorB.hsl.l }}%</div>
          </div>
        </div>

        <div class="diff-hint">
          💡 行业标准提示：ΔE < 1 人眼几乎无法分辨；1-3 轻微差异，专业设计可接受；3-6 中等差异；>6 明显差异。
        </div>
      </div>

      <div class="diff-palette">
        <div class="section-title">A → B 过渡色（10 阶）</div>
        <div class="diff-transition-grid">
          <div
            v-for="(color, idx) in transitionColors"
            :key="idx"
            class="diff-transition-item"
          >
            <div class="diff-transition-swatch" :style="{ background: color }">
              <span class="diff-transition-pct" :style="{ color: getContrastColor(color) }">{{ Math.round(idx / 9 * 100) }}%</span>
            </div>
            <span class="diff-transition-hex">{{ color }}</span>
            <button class="sm-btn-xs" @click="copyValue(color, '过渡色 ' + (idx + 1))">复制</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ColorPicker from '../../components/ColorPicker.vue';
import { parseColor, rgbToHex, rgbToHsl, hslToRgb, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';

function rgbToLab({ r, g, b }) {
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.00000;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116);
  y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116);
  z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116);
  return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

export default {
  name: 'ColorTools',
  components: { ColorPicker },
  data() {
    return {
      activeTab: 'adjust',
      tabs: [
        { key: 'adjust', label: '色阶微调' },
        { key: 'gradient', label: '渐变编辑' },
        { key: 'difference', label: '色差比对' }
      ],
      adjustColor: '#1677FF',
      adjustHue: 215,
      adjustSaturation: 100,
      adjustLightness: 54,
      originalHsl: { h: 215, s: 100, l: 54 },

      gradientStops: [
        { color: '#1677FF', position: 0 },
        { color: '#69B1FF', position: 50 },
        { color: '#8B5CF6', position: 100 }
      ],
      gradientDirection: 'to right',

      diffColorA: '#1677FF',
      diffColorB: '#2563EB'
    };
  },
  computed: {
    adjustedColor() {
      const rgb = hslToRgb({
        h: this.adjustHue,
        s: this.adjustSaturation,
        l: this.adjustLightness
      });
      return rgbToHex(rgb).toUpperCase();
    },
    adjustedShades() {
      const shades = [];
      const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800];
      levels.forEach((level, idx) => {
        const lightness = 5 + (95 - 5) * (idx / (levels.length - 1));
        const rgb = hslToRgb({ h: this.adjustHue, s: this.adjustSaturation, l: lightness });
        shades.push({ color: rgbToHex(rgb).toUpperCase(), level });
      });
      return shades;
    },

    gradientStyle() {
      const stops = this.gradientStops
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');
      if (this.gradientDirection === 'circle') {
        return { background: `radial-gradient(circle, ${stops})` };
      }
      return { background: `linear-gradient(${this.gradientDirection}, ${stops})` };
    },
    gradientCSS() {
      const stops = this.gradientStops
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(s => `${s.color} ${s.position}%`)
        .join(',\n    ');
      if (this.gradientDirection === 'circle') {
        return `background: radial-gradient(\n  circle,\n    ${stops}\n);`;
      }
      return `background: linear-gradient(\n  ${this.gradientDirection},\n    ${stops}\n);`;
    },
    extractedGradientColors() {
      const sortedStops = this.gradientStops.slice().sort((a, b) => a.position - b.position);
      const colors = [];
      const count = 8;
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        let pos = t * 100;
        let color;
        for (let j = 0; j < sortedStops.length - 1; j++) {
          if (pos >= sortedStops[j].position && pos <= sortedStops[j + 1].position) {
            const span = sortedStops[j + 1].position - sortedStops[j].position;
            const localT = span === 0 ? 0 : (pos - sortedStops[j].position) / span;
            const rgb1 = parseColor(sortedStops[j].color);
            const rgb2 = parseColor(sortedStops[j + 1].color);
            if (rgb1 && rgb2) {
              const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * localT);
              const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * localT);
              const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * localT);
              color = rgbToHex({ r, g, b });
            }
            break;
          }
        }
        if (!color) color = sortedStops[0].color;
        colors.push(color.toUpperCase());
      }
      return colors;
    },

    colorA() {
      const rgb = parseColor(this.diffColorA) || { r: 0, g: 0, b: 0 };
      const hsl = rgbToHsl(rgb);
      return { rgb, hsl };
    },
    colorB() {
      const rgb = parseColor(this.diffColorB) || { r: 0, g: 0, b: 0 };
      const hsl = rgbToHsl(rgb);
      return { rgb, hsl };
    },
    deltaE76() {
      const labA = rgbToLab(this.colorA.rgb);
      const labB = rgbToLab(this.colorB.rgb);
      return Math.sqrt(
        Math.pow(labA.l - labB.l, 2) +
        Math.pow(labA.a - labB.a, 2) +
        Math.pow(labA.b - labB.b, 2)
      );
    },
    rgbDiff() {
      return {
        r: this.colorA.rgb.r - this.colorB.rgb.r,
        g: this.colorA.rgb.g - this.colorB.rgb.g,
        b: this.colorA.rgb.b - this.colorB.rgb.b
      };
    },
    hslDiff() {
      return {
        h: Math.abs(this.colorA.hsl.h - this.colorB.hsl.h),
        s: Math.abs(this.colorA.hsl.s - this.colorB.hsl.s),
        l: Math.abs(this.colorA.hsl.l - this.colorB.hsl.l)
      };
    },
    brightnessDiff() {
      const brightnessA = (this.colorA.rgb.r * 299 + this.colorA.rgb.g * 587 + this.colorA.rgb.b * 114) / 1000;
      const brightnessB = (this.colorB.rgb.r * 299 + this.colorB.rgb.g * 587 + this.colorB.rgb.b * 114) / 1000;
      return Math.abs(brightnessA - brightnessB);
    },
    diffMixedStyle() {
      const r = Math.round((this.colorA.rgb.r + this.colorB.rgb.r) / 2);
      const g = Math.round((this.colorA.rgb.g + this.colorB.rgb.g) / 2);
      const b = Math.round((this.colorA.rgb.b + this.colorB.rgb.b) / 2);
      const hex = rgbToHex({ r, g, b }).toUpperCase();
      return { background: hex };
    },
    diffMixedHex() {
      const r = Math.round((this.colorA.rgb.r + this.colorB.rgb.r) / 2);
      const g = Math.round((this.colorA.rgb.g + this.colorB.rgb.g) / 2);
      const b = Math.round((this.colorA.rgb.b + this.colorB.rgb.b) / 2);
      return rgbToHex({ r, g, b }).toUpperCase();
    },
    transitionColors() {
      const colors = [];
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const r = Math.round(this.colorA.rgb.r + (this.colorB.rgb.r - this.colorA.rgb.r) * t);
        const g = Math.round(this.colorA.rgb.g + (this.colorB.rgb.g - this.colorA.rgb.g) * t);
        const b = Math.round(this.colorA.rgb.b + (this.colorB.rgb.b - this.colorA.rgb.b) * t);
        colors.push(rgbToHex({ r, g, b }).toUpperCase());
      }
      return colors;
    }
  },
  watch: {
    adjustColor(newVal) {
      const rgb = parseColor(newVal);
      if (rgb) {
        const hsl = rgbToHsl(rgb);
        this.adjustHue = hsl.h;
        this.adjustSaturation = hsl.s;
        this.adjustLightness = hsl.l;
      }
    }
  },
  methods: {
    getContrastColor(hex) {
      const rgb = parseColor(hex);
      if (!rgb) return '#000000';
      return gcc(rgb);
    },
    resetAdjust() {
      this.adjustHue = 215;
      this.adjustSaturation = 100;
      this.adjustLightness = 54;
      this.adjustColor = '#1677FF';
    },
    addStop() {
      const lastPos = this.gradientStops.length > 0 ? this.gradientStops[this.gradientStops.length - 1].position : 0;
      this.gradientStops.push({
        color: '#FFFFFF',
        position: Math.min(100, lastPos + 25)
      });
    },
    removeStop(idx) {
      this.gradientStops.splice(idx, 1);
    },
    getDeltaEClass(deltaE) {
      if (deltaE < 1) return 'excellent';
      if (deltaE < 3) return 'good';
      if (deltaE < 6) return 'medium';
      return 'poor';
    },
    getDeltaEDescription(deltaE) {
      if (deltaE < 1) return '人眼无法分辨';
      if (deltaE < 3) return '专业级可接受';
      if (deltaE < 6) return '中等差异';
      return '明显差异';
    },
    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-colortools { width: 100%; min-width: 0; }

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

.form-input {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;
  font-family: 'SF Mono', monospace;
  &:focus { outline: none; border-color: var(--accent); }
}
.form-select {
  padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); color: var(--text-primary); font-size: 13px;
}

.primary-btn, .secondary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
  &:hover { opacity: 0.9; }
}
.secondary-btn {
  background: var(--bg-muted); color: var(--text-primary); border-color: var(--border-primary);
}

.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
  &.danger { &:hover { border-color: #EF4444; color: #EF4444; } }
}
.sm-btn-xs {
  padding: 3px 8px; background: var(--bg-muted);
  border: 1px solid var(--border-primary); border-radius: 4px;
  font-size: 10px; cursor: pointer; color: var(--text-secondary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}

.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 20px 0 12px; }

.adjust-input-row {
  display: flex; gap: 12px; align-items: center; margin-bottom: 20px;
}

.adjust-preview {
  display: flex; justify-content: center; margin-bottom: 20px;
}
.adjust-main-swatch {
  width: 200px; height: 80px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; border: 1px solid var(--border-primary);
}

.adjust-sliders {
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.slider-item {
  display: flex; flex-direction: column; gap: 8px;
}
.slider-item label {
  font-size: 13px; font-weight: 500; color: var(--text-primary);
}
.adjust-slider {
  width: 100%; height: 6px;
}

.adjust-current {
  display: flex; align-items: center; gap: 20px;
  padding: 20px; background: var(--bg-muted); border-radius: var(--radius-md);
  margin-bottom: 20px;
}
.adjust-result-swatch {
  width: 80px; height: 80px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600; border: 1px solid var(--border-primary);
  text-align: center;
}
.adjust-result-info {
  flex: 1;
  font-size: 13px; color: var(--text-secondary); line-height: 1.8;
}

.shade-grid {
  display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px;
}
.shade-card {
  padding: 8px; background: var(--bg-muted); border-radius: var(--radius-sm);
  text-align: center;
}
.shade-swatch {
  width: 100%; height: 60px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px; border: 1px solid var(--border-primary);
}
.shade-level { font-size: 10px; font-weight: 600; }
.shade-hex { font-size: 10px; font-family: monospace; color: var(--text-tertiary); margin-bottom: 4px; }

.gradient-inputs {
  display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;
}
.gradient-color-inputs {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px; background: var(--bg-muted); border-radius: var(--radius-md);
}
.gradient-stop-input {
  display: flex; align-items: center; gap: 10px;
  label { font-size: 12px; color: var(--text-secondary); min-width: 60px; }
  input[type="color"] { width: 40px; height: 36px; border: 1px solid var(--border-primary); border-radius: 4px; cursor: pointer; }
  input[type="text"] { flex: 1; }
}
.gradient-pos-slider { flex: 1; min-width: 80px; }

.gradient-preview-section {
  margin-bottom: 20px;
}
.gradient-preview-large {
  height: 120px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; border: 1px solid var(--border-primary);
}
.gradient-preview-text {
  font-size: 14px; font-weight: 600; color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.gradient-direction {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
  label { font-size: 13px; color: var(--text-primary); }
}

.extracted-grid {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;
}
.extracted-item {
  padding: 6px; background: var(--bg-muted); border-radius: var(--radius-sm);
  text-align: center;
}
.extracted-swatch {
  width: 100%; height: 40px; border-radius: 4px;
  border: 1px solid var(--border-primary); margin-bottom: 4px;
}
.extracted-hex {
  font-size: 9px; font-family: monospace; color: var(--text-tertiary);
  display: block; margin-bottom: 4px;
}

.gradient-code-section {
  margin-top: 16px;
}

.code-block {
  background: #1e1e2e; color: #cdd6f4;
  padding: 20px; border-radius: var(--radius-md);
  font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.6;
  overflow-x: auto; margin-bottom: 12px;
  code { white-space: pre; display: block; }
}

.diff-inputs {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-bottom: 20px;
}
.diff-input-group {
  padding: 14px; background: var(--bg-muted); border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}
.diff-input-group label {
  display: block; font-size: 13px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 8px;
}
.diff-input-row {
  display: flex; gap: 8px; align-items: center;
  input[type="color"] { width: 40px; height: 36px; border: 1px solid var(--border-primary); border-radius: 4px; cursor: pointer; }
  input[type="text"] { flex: 1; }
}

.diff-compare {
  display: grid; grid-template-columns: 1fr auto 1fr 1fr; gap: 12px;
  align-items: center; margin-bottom: 20px;
}
.diff-swatch {
  height: 100px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; border: 1px solid var(--border-primary);
}
.diff-swatch-mix {
  height: 100px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600; border: 1px solid var(--border-primary);
}
.diff-arrow {
  font-size: 24px; text-align: center; color: var(--text-tertiary);
}

.diff-results {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  margin-bottom: 20px;
}
.diff-result-card {
  padding: 14px; background: var(--bg-muted); border-radius: var(--radius-md);
  text-align: center; border: 1px solid var(--border-primary);
}
.diff-result-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.diff-result-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.diff-result-value.excellent { color: #10B981; }
.diff-result-value.good { color: #3B82F6; }
.diff-result-value.medium { color: #F59E0B; }
.diff-result-value.poor { color: #EF4444; }
.diff-result-status { font-size: 11px; color: var(--text-tertiary); }

.diff-colors-info {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-bottom: 12px;
}
.diff-color-info {
  padding: 12px; background: var(--bg-muted); border-radius: var(--radius-md);
}
.diff-color-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.diff-color-rgb, .diff-color-hsl { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

.diff-hint {
  padding: 12px 16px; background: var(--accent-soft); border-radius: var(--radius-md);
  font-size: 12px; color: var(--accent);
}

.diff-transition-grid {
  display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px;
}
.diff-transition-item {
  padding: 6px; background: var(--bg-muted); border-radius: var(--radius-sm);
  text-align: center;
}
.diff-transition-swatch {
  width: 100%; height: 50px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px; border: 1px solid var(--border-primary);
}
.diff-transition-pct { font-size: 10px; font-weight: 600; }
.diff-transition-hex { font-size: 9px; font-family: monospace; color: var(--text-tertiary); display: block; margin-bottom: 4px; }

@media (max-width: 1024px) {
  .shade-grid { grid-template-columns: repeat(5, 1fr); }
  .extracted-grid { grid-template-columns: repeat(4, 1fr); }
  .diff-transition-grid { grid-template-columns: repeat(5, 1fr); }
  .diff-inputs { grid-template-columns: 1fr; }
  .diff-compare { grid-template-columns: 1fr 1fr; }
  .diff-arrow { display: none; }
  .diff-results { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .shade-grid, .extracted-grid, .diff-transition-grid { grid-template-columns: repeat(3, 1fr); }
  .diff-results { grid-template-columns: 1fr; }
  .diff-colors-info { grid-template-columns: 1fr; }
}
</style>
