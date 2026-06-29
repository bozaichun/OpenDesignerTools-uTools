<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import ColorStripCard from '../../components/ColorStripCard.vue';
import ColorStripSection from '../../components/ColorStripSection.vue';
import ColorToolsDetailShell from './ColorToolsDetailShell.vue';
import { parseColor, rgbToHsl, getContrastColor as gcc } from '../../utils/colorUtils';
import {
  computeAdjustedColor,
  computeAdjustedShades,
  readDetailQuery,
  DEFAULT_GRADIENT_STOPS,
  DEFAULT_GRADIENT_DIRECTION
} from './colorToolsUtils';

const route = useRoute();

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

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  return rgb ? gcc(rgb) : '#000000';
}

watch(() => route.query, () => {
  applyRouteQuery();
});

applyRouteQuery();
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
              <div class="adjust-compare-swatch adjust-compare-swatch-with-action" :style="{ background: adjustedColor }">
                <span :style="{ color: getContrastColor(adjustedColor) }">结果</span>
                <ColorActionGroup
                  :value="adjustedColor"
                  copy-label="调整后色值"
                  favorite-name="调整后色值"
                  variant="on-color"
                  class="adjust-swatch-action-group"
                />
              </div>
              <span class="adjust-compare-hex">{{ adjustedColor }}</span>
            </div>
          </div>

          <div class="adjust-meta-row">
            <span>HSL: {{ adjustHue }}° / {{ adjustSaturation }}% / {{ adjustLightness }}%</span>
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

      <ColorStripSection title="同色系 9 阶色卡" :columns="9">
        <ColorStripCard
          v-for="shade in adjustedShades"
          :key="shade.level"
          :color="shade.color"
          :label="String(shade.level)"
          :copy-label="shade.color"
          :favorite-name="'色阶 ' + shade.level"
        />
      </ColorStripSection>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.color-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  min-width: 0;
}
.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 20px 0 12px; }
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
.adjust-compare-swatch-with-action {
  position: relative;
}
.adjust-swatch-action-group {
  position: absolute;
  top: 4px;
  right: 4px;
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
.adjust-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 999px;
  border: 1px solid var(--border-primary);
  background: #ffffff;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -6px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }

  &::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: #ffffff;
    border: none;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background: var(--accent);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }

  &.hue {
    background: linear-gradient(
      to right,
      #ff0000 0%,
      #ffff00 17%,
      #00ff00 33%,
      #00ffff 50%,
      #0000ff 67%,
      #ff00ff 83%,
      #ff0000 100%
    );
  }

  &.sat {
    background: linear-gradient(to right, #808080, var(--accent));
  }

  &.light {
    background: linear-gradient(to right, #000000, #ffffff);
  }
}
@media (max-width: 1024px) {
  .adjust-workbench { grid-template-columns: 1fr; }
}
</style>
