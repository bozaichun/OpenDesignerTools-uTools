<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import ColorStripCard from '../../components/ColorStripCard.vue';
import ColorStripSection from '../../components/ColorStripSection.vue';
import ColorToolsDetailShell from './ColorToolsDetailShell.vue';
import {
  parseColor,
  rgbToHex,
  rgbToHsl,
  copyToClipboard,
  showToast,
  getContrastColor as gcc
} from '../../utils/colorUtils';
import {
  computeDeltaE76,
  getDeltaEDescription,
  getDeltaEClass,
  readDetailQuery
} from './colorToolsUtils';

const route = useRoute();

const diffColorA = ref('#1677FF');
const diffColorB = ref('#2563EB');
const adjustHue = ref(215);
const adjustSaturation = ref(100);
const adjustLightness = ref(54);
const gradientDirection = ref('to right');
const gradientStops = ref([]);

const shellQueryState = computed(() => {
  return {
    colorB: diffColorB.value,
    hue: adjustHue.value,
    sat: adjustSaturation.value,
    light: adjustLightness.value,
    direction: gradientDirection.value,
    stops: gradientStops.value
  };
});

const colorA = computed(() => {
  const rgb = parseColor(diffColorA.value) || { r: 0, g: 0, b: 0 };
  return { rgb, hsl: rgbToHsl(rgb) };
});

const colorB = computed(() => {
  const rgb = parseColor(diffColorB.value) || { r: 0, g: 0, b: 0 };
  return { rgb, hsl: rgbToHsl(rgb) };
});

const deltaE76 = computed(() => {
  return computeDeltaE76(diffColorA.value, diffColorB.value);
});

const rgbDiff = computed(() => {
  return {
    r: colorA.value.rgb.r - colorB.value.rgb.r,
    g: colorA.value.rgb.g - colorB.value.rgb.g,
    b: colorA.value.rgb.b - colorB.value.rgb.b
  };
});

const hslDiff = computed(() => {
  return {
    h: Math.abs(colorA.value.hsl.h - colorB.value.hsl.h),
    s: Math.abs(colorA.value.hsl.s - colorB.value.hsl.s),
    l: Math.abs(colorA.value.hsl.l - colorB.value.hsl.l)
  };
});

const brightnessDiff = computed(() => {
  const brightnessA = (colorA.value.rgb.r * 299 + colorA.value.rgb.g * 587 + colorA.value.rgb.b * 114) / 1000;
  const brightnessB = (colorB.value.rgb.r * 299 + colorB.value.rgb.g * 587 + colorB.value.rgb.b * 114) / 1000;
  return Math.abs(brightnessA - brightnessB);
});

const diffMixedStyle = computed(() => {
  const r = Math.round((colorA.value.rgb.r + colorB.value.rgb.r) / 2);
  const g = Math.round((colorA.value.rgb.g + colorB.value.rgb.g) / 2);
  const b = Math.round((colorA.value.rgb.b + colorB.value.rgb.b) / 2);
  return { background: rgbToHex({ r, g, b }).toUpperCase() };
});

const diffMixedHex = computed(() => {
  const r = Math.round((colorA.value.rgb.r + colorB.value.rgb.r) / 2);
  const g = Math.round((colorA.value.rgb.g + colorB.value.rgb.g) / 2);
  const b = Math.round((colorA.value.rgb.b + colorB.value.rgb.b) / 2);
  return rgbToHex({ r, g, b }).toUpperCase();
});

const transitionColors = computed(() => {
  const colors = [];
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const r = Math.round(colorA.value.rgb.r + (colorB.value.rgb.r - colorA.value.rgb.r) * t);
    const g = Math.round(colorA.value.rgb.g + (colorB.value.rgb.g - colorA.value.rgb.g) * t);
    const b = Math.round(colorA.value.rgb.b + (colorB.value.rgb.b - colorA.value.rgb.b) * t);
    colors.push(rgbToHex({ r, g, b }).toUpperCase());
  }
  return colors;
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  diffColorA.value = q.color;
  diffColorB.value = q.colorB;
  adjustHue.value = q.hue;
  adjustSaturation.value = q.sat;
  adjustLightness.value = q.light;
  gradientDirection.value = q.direction;
  gradientStops.value = q.stops;
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  return rgb ? gcc(rgb) : '#000000';
}

function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label, 'success');
}

watch(() => route.query, () => {
  applyRouteQuery();
});

onMounted(() => {
  applyRouteQuery();
});
</script>

<template>
  <div class="color-detail">
    <ColorToolsDetailShell
      current-module="difference"
      :color="diffColorA"
      :query-state="shellQueryState"
      @update:color="diffColorA = $event"
    >
      <template #main>
        <div class="color-picker-group">
          <span class="color-label">颜色 A</span>
          <ColorPicker v-model="diffColorA" />
        </div>
      </template>
      <template #extra>
        <div class="color-picker-group">
          <span class="color-label">颜色 B</span>
          <ColorPicker v-model="diffColorB" />
        </div>
      </template>
    </ColorToolsDetailShell>

    <section class="panel">
      <div class="diff-workbench">
        <div class="diff-visual-col">
          <div class="diff-compare">
            <div class="diff-color-info">
              <div class="diff-color-label">颜色 A: {{ diffColorA }}</div>
              <div class="diff-color-rgb">RGB: {{ colorA.rgb.r }}, {{ colorA.rgb.g }}, {{ colorA.rgb.b }}</div>
              <div class="diff-color-hsl">HSL: {{ colorA.hsl.h }}°, {{ colorA.hsl.s }}%, {{ colorA.hsl.l }}%</div>
            </div>
            <div class="diff-compare-gap"></div>
            <div class="diff-color-info">
              <div class="diff-color-label">颜色 B: {{ diffColorB }}</div>
              <div class="diff-color-rgb">RGB: {{ colorB.rgb.r }}, {{ colorB.rgb.g }}, {{ colorB.rgb.b }}</div>
              <div class="diff-color-hsl">HSL: {{ colorB.hsl.h }}°, {{ colorB.hsl.s }}%, {{ colorB.hsl.l }}%</div>
            </div>
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
        </div>

        <div class="diff-data-col">
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

          <div class="diff-hint">
            💡 行业标准提示：ΔE &lt; 1 人眼几乎无法分辨；1-3 轻微差异，专业设计可接受；3-6 中等差异；&gt;6 明显差异。
          </div>
        </div>
      </div>

      <ColorStripSection title="A → B 过渡色（10 阶）" :columns="10">
        <ColorStripCard
          v-for="(color, idx) in transitionColors"
          :key="color"
          :color="color"
          :label="Math.round(idx / 9 * 100) + '%'"
          :copy-label="color"
          :favorite-name="'过渡色 ' + Math.round(idx / 9 * 100) + '%'"
        />
      </ColorStripSection>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.color-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
  min-width: 0;
}
.color-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  .color-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    flex-shrink: 0;
  }
  :deep(.color-picker) { flex: 1; min-width: 0; }
}
.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 20px 0 12px; }
.diff-workbench {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(320px, 1.2fr);
  gap: 16px;
  margin-bottom: 20px;
}
.diff-visual-col,
.diff-data-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.diff-visual-col {
  padding: 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  justify-content: center;
}
.diff-compare {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: auto auto auto;
  gap: 12px;
  align-items: stretch;
  margin-bottom: 0;
}
.diff-compare-gap { width: 24px; }
.diff-swatch-mix { grid-column: 1 / -1; }
.diff-color-info {
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  min-width: 0;
}
.diff-color-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.diff-color-rgb, .diff-color-hsl { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.diff-swatch, .diff-swatch-mix {
  min-height: 100px;
  height: 100%;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-primary);
}
.diff-swatch { font-size: 24px; font-weight: 700; }
.diff-swatch-mix { font-size: 16px; font-weight: 600; min-height: 72px; }
.diff-arrow { font-size: 24px; text-align: center; color: var(--text-tertiary); }
.diff-data-col .diff-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 0;
}
.diff-result-card {
  padding: 14px; background: var(--bg-muted); border-radius: var(--radius-md);
  text-align: center; border: 1px solid var(--border-primary);
}
.diff-result-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.diff-result-value { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.diff-result-value.excellent { color: var(--success); }
.diff-result-value.good { color: var(--accent); }
.diff-result-value.medium { color: var(--warning); }
.diff-result-value.poor { color: var(--error); }
.diff-result-status { font-size: 11px; color: var(--text-tertiary); }
.diff-hint {
  padding: 12px 16px; background: var(--accent-soft); border-radius: var(--radius-md);
  font-size: 12px; color: var(--accent);
}
@media (max-width: 1024px) {
  .diff-workbench { grid-template-columns: 1fr; }
  .diff-compare {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }
  .diff-compare-gap { display: none; }
  .diff-compare > .diff-color-info:nth-child(1) { grid-column: 1; grid-row: 1; }
  .diff-compare > .diff-color-info:nth-child(3) { grid-column: 2; grid-row: 1; }
  .diff-compare > .diff-swatch:nth-child(4) { grid-column: 1; grid-row: 2; }
  .diff-compare > .diff-swatch:nth-child(6) { grid-column: 2; grid-row: 2; }
  .diff-arrow { display: none; }
  .diff-swatch-mix { grid-column: 1 / -1; grid-row: 3; }
  .diff-data-col .diff-results { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .diff-compare {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
  .diff-compare > .diff-color-info:nth-child(1),
  .diff-compare > .diff-color-info:nth-child(3),
  .diff-compare > .diff-swatch:nth-child(4),
  .diff-compare > .diff-swatch:nth-child(6),
  .diff-swatch-mix {
    grid-column: 1;
    grid-row: auto;
  }
  .diff-data-col .diff-results { grid-template-columns: 1fr; }
}
</style>
