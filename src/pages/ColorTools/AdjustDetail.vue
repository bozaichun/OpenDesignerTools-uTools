<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import FavoriteButton from '../../components/FavoriteButton.vue';
import ColorToolsDetailShell from './ColorToolsDetailShell.vue';
import { parseColor, rgbToHsl, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import {
  computeAdjustedColor,
  computeAdjustedShades,
  readDetailQuery,
  DEFAULT_GRADIENT_STOPS,
  DEFAULT_GRADIENT_DIRECTION
} from './colorToolsUtils';

const route = useRoute();

const setHeaderActions = inject('setHeaderActions', () => {});
const clearHeaderActions = inject('clearHeaderActions', () => {});

const inputColor = ref('#1677FF');
const adjustHue = ref(215);
const adjustSaturation = ref(100);
const adjustLightness = ref(54);
const diffColorB = ref('#2563EB');
const gradientDirection = ref(DEFAULT_GRADIENT_DIRECTION);
const gradientStops = ref(DEFAULT_GRADIENT_STOPS.map((s) => ({ ...s })));

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

const adjustedColor = computed(() => {
  return computeAdjustedColor(adjustHue.value, adjustSaturation.value, adjustLightness.value);
});

const adjustedShades = computed(() => {
  return computeAdjustedShades(adjustHue.value, adjustSaturation.value);
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  inputColor.value = q.color;
  adjustHue.value = q.hue;
  adjustSaturation.value = q.sat;
  adjustLightness.value = q.light;
  diffColorB.value = q.colorB;
  gradientDirection.value = q.direction;
  gradientStops.value = q.stops;
}

function handleColorChange(val) {
  inputColor.value = val;
  const rgb = parseColor(val);
  if (rgb) {
    const hsl = rgbToHsl(rgb);
    adjustHue.value = hsl.h;
    adjustSaturation.value = hsl.s;
    adjustLightness.value = hsl.l;
  }
}

function resetAdjust() {
  adjustHue.value = 215;
  adjustSaturation.value = 100;
  adjustLightness.value = 54;
  inputColor.value = '#1677FF';
}

function updateHeaderActions() {
  setHeaderActions([
    {
      label: '重置',
      onClick: () => { resetAdjust(); }
    }
  ]);
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  return rgb ? gcc(rgb) : '#000000';
}

function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label, 'success');
}

function copyShadeHex(hex) {
  copyToClipboard(hex);
  showToast(null, '已复制 ' + hex, 'success');
}

watch(() => route.query, () => {
  applyRouteQuery();
});

applyRouteQuery();

onMounted(() => {
  updateHeaderActions();
});

onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="color-detail">
    <ColorToolsDetailShell
      current-module="adjust"
      :color="inputColor"
      :query-state="shellQueryState"
      @update:color="handleColorChange"
    />

    <section class="panel adjust-panel">
      <div class="adjust-workbench">
        <div class="adjust-visual-col">
          <div class="adjust-compare-row">
            <div class="adjust-compare-item">
              <div class="adjust-compare-swatch" :style="{ background: inputColor }">
                <span :style="{ color: getContrastColor(inputColor) }">原色</span>
              </div>
              <span class="adjust-compare-hex">{{ inputColor }}</span>
            </div>
            <div class="adjust-compare-arrow">→</div>
            <div class="adjust-compare-item">
              <div class="adjust-compare-swatch" :style="{ background: adjustedColor }">
                <span :style="{ color: getContrastColor(adjustedColor) }">结果</span>
              </div>
              <span class="adjust-compare-hex">{{ adjustedColor }}</span>
            </div>
          </div>

          <div class="adjust-meta-row">
            <span>HSL: {{ adjustHue }}° / {{ adjustSaturation }}% / {{ adjustLightness }}%</span>
            <button class="sm-btn" @click="copyValue(adjustedColor, '调整后色值')">复制结果</button>
          </div>
        </div>

        <div class="adjust-control-col">
          <div class="adjust-sliders compact">
            <div class="slider-item">
              <label>色相 Hue <strong>{{ adjustHue }}°</strong></label>
              <input v-model="adjustHue" type="range" min="0" max="360" class="adjust-slider hue" />
            </div>
            <div class="slider-item">
              <label>饱和度 Saturation <strong>{{ adjustSaturation }}%</strong></label>
              <input v-model="adjustSaturation" type="range" min="0" max="200" class="adjust-slider sat" />
            </div>
            <div class="slider-item">
              <label>明度 Lightness <strong>{{ adjustLightness }}%</strong></label>
              <input v-model="adjustLightness" type="range" min="0" max="100" class="adjust-slider light" />
            </div>
          </div>
        </div>
      </div>

      <div class="color-strip-section">
        <div class="section-title inline">同色系 9 阶色卡</div>
        <div class="color-strip-grid color-strip-grid--9">
          <div v-for="(shade, idx) in adjustedShades" :key="idx" class="color-strip-cell">
            <div class="color-strip-swatch" :style="{ background: shade.color }">
              <span class="color-strip-label" :style="{ color: getContrastColor(shade.color) }">{{ shade.level }}</span>
            </div>
            <div class="color-strip-meta">
              <span class="color-strip-hex">{{ shade.color }}</span>
              <div class="color-strip-actions">
                <FavoriteButton :hex="shade.color" :name="'色阶 ' + shade.level" class="color-strip-favorite-btn" />
                <button class="color-strip-icon-btn" :title="'复制 ' + shade.color" @click="copyShadeHex(shade.color)">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use './colorStripCard.scss' as *;

.color-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  min-width: 0;
}
.sm-btn {
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}
.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 20px 0 12px; }
.section-title.inline { margin: 0 0 10px; }
.adjust-panel { padding: 16px; }
.adjust-workbench {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(300px, 1.1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.adjust-visual-col, .adjust-control-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.adjust-compare-row {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 14px; background: var(--bg-muted); border: 1px solid var(--border-primary); border-radius: var(--radius-md);
}
.adjust-compare-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 0; }
.adjust-compare-swatch {
  width: 100%; max-width: 120px; height: 72px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border-primary);
}
.adjust-compare-hex { font-size: 11px; font-family: monospace; color: var(--text-tertiary); }
.adjust-compare-arrow { font-size: 22px; color: var(--text-tertiary); flex-shrink: 0; }
.adjust-meta-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 12px; background: var(--bg-muted); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary);
}
.adjust-sliders.compact {
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--bg-muted); border: 1px solid var(--border-primary); border-radius: var(--radius-md);
  height: 100%; justify-content: center;
}
.slider-item { display: flex; flex-direction: column; gap: 8px; }
.slider-item label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 500; color: var(--text-primary);
  strong { color: var(--accent); font-weight: 600; }
}
.adjust-slider { width: 100%; height: 6px; }
@media (max-width: 1024px) {
  .adjust-workbench { grid-template-columns: 1fr; }
}
</style>
