<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import Dialog from '../../components/Dialog.vue';
import ColorStripCard from '../../components/ColorStripCard.vue';
import ColorStripSection from '../../components/ColorStripSection.vue';
import ColorToolsDetailShell from './ColorToolsDetailShell.vue';
import { parseColor, rgbToHsl, copyToClipboard, showToast } from '../../utils/colorUtils';
import {
  computeGradientStyle,
  computeGradientCSS,
  computeExtractedGradientColors,
  readDetailQuery,
  DEFAULT_GRADIENT_STOPS,
  DEFAULT_GRADIENT_DIRECTION,
  MAX_GRADIENT_STOPS
} from './colorToolsUtils';

const route = useRoute();

const inputColor = ref('#1677FF');
const adjustHue = ref(215);
const adjustSaturation = ref(100);
const adjustLightness = ref(54);
const diffColorB = ref('#2563EB');
const gradientStops = ref(DEFAULT_GRADIENT_STOPS.map((s) => ({ ...s })));
const gradientDirection = ref(DEFAULT_GRADIENT_DIRECTION);
const cssDialogVisible = ref(false);
const propsPanelOpen = ref(false);
const previewPanelRef = ref(null);

const gradientDirectionOptions = [
  { value: 'to right', label: '从左到右' },
  { value: 'to bottom', label: '从上到下' },
  { value: 'to bottom right', label: '对角线' },
  { value: 'circle', label: '圆形辐射' },
  { value: '45deg', label: '45° 斜向' },
  { value: '135deg', label: '135° 斜向' }
];

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

const gradientStyle = computed(() => {
  return computeGradientStyle(gradientStops.value, gradientDirection.value);
});

const gradientCSS = computed(() => {
  return computeGradientCSS(gradientStops.value, gradientDirection.value);
});

const extractedGradientColors = computed(() => {
  return computeExtractedGradientColors(gradientStops.value);
});

const canAddStop = computed(() => {
  return gradientStops.value.length < MAX_GRADIENT_STOPS;
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  inputColor.value = q.color;
  adjustHue.value = q.hue;
  adjustSaturation.value = q.sat;
  adjustLightness.value = q.light;
  diffColorB.value = q.colorB;
  gradientDirection.value = q.direction;
  gradientStops.value = q.stops.map((s) => ({ ...s }));
}

function handleColorChange(val) {
  inputColor.value = val;
  if (gradientStops.value.length > 0) {
    gradientStops.value[0].color = val;
  }
  const rgb = parseColor(val);
  if (rgb) {
    const hsl = rgbToHsl(rgb);
    adjustHue.value = hsl.h;
    adjustSaturation.value = hsl.s;
    adjustLightness.value = hsl.l;
  }
}

function addStop() {
  if (gradientStops.value.length >= MAX_GRADIENT_STOPS) return;
  const lastPos = gradientStops.value.length > 0
    ? gradientStops.value[gradientStops.value.length - 1].position
    : 0;
  gradientStops.value.push({
    color: '#FFFFFF',
    position: Math.min(100, lastPos + 25)
  });
}

function removeStop(idx) {
  gradientStops.value.splice(idx, 1);
}

function togglePropsPanel() {
  propsPanelOpen.value = !propsPanelOpen.value;
}

function handlePropsClickOutside(event) {
  if (!previewPanelRef.value?.contains(event.target)) {
    propsPanelOpen.value = false;
  }
}

function handleGradientDirectionSelect(value) {
  gradientDirection.value = value;
  propsPanelOpen.value = false;
}

function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label, 'success');
}

watch(() => route.query, () => {
  applyRouteQuery();
});

watch(propsPanelOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', handlePropsClickOutside);
  } else {
    document.removeEventListener('pointerdown', handlePropsClickOutside);
  }
});

applyRouteQuery();

onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePropsClickOutside);
});
</script>

<template>
  <div class="color-detail">
    <ColorToolsDetailShell
      current-module="gradient"
      :color="inputColor"
      :query-state="shellQueryState"
      @update:color="handleColorChange"
    />

    <section class="panel">
      <div class="gradient-workbench">
        <div class="gradient-control-col">
          <div class="gradient-color-inputs">
            <div v-for="(stop, idx) in gradientStops" :key="'stop-' + idx" class="gradient-stop-input">
              <label>节点 {{ idx + 1 }}</label>
              <ColorPicker v-model="stop.color" />
              <input v-model="stop.position" type="range" min="0" max="100" class="gradient-pos-slider" />
              <span>{{ stop.position }}%</span>
              <button v-if="gradientStops.length > 2" class="sm-btn danger" @click="removeStop(idx)">×</button>
            </div>
          </div>
          <button
            v-if="canAddStop"
            class="secondary-btn gradient-add-btn"
            @click="addStop"
          >+ 添加节点</button>
        </div>

        <div class="gradient-preview-col">
          <div ref="previewPanelRef" class="gradient-preview-wrap">
            <div class="gradient-preview-large" :style="gradientStyle">
              <span class="gradient-preview-text">渐变预览</span>
            </div>
            <div class="gradient-preview-toolbar">
              <button
                type="button"
                class="gradient-preview-tool-btn"
                title="查看 CSS 代码"
                @click.stop="cssDialogVisible = true"
              >
                <span class="iconfont icon-Areality-Code"></span>
              </button>
              <button
                type="button"
                class="gradient-preview-tool-btn"
                title="属性调整"
                :class="{ active: propsPanelOpen }"
                @click.stop="togglePropsPanel"
              >
                <span class="iconfont icon-Areality-Setting"></span>
              </button>
            </div>
            <Transition name="gradient-props-panel">
              <div v-if="propsPanelOpen" class="gradient-props-panel">
                <ul class="gradient-direction-list">
                  <li
                    v-for="opt in gradientDirectionOptions"
                    :key="opt.value"
                    class="gradient-direction-item"
                    :class="{ 'is-selected': gradientDirection === opt.value }"
                    @click="handleGradientDirectionSelect(opt.value)"
                  >
                    {{ opt.label }}
                  </li>
                </ul>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <ColorStripSection title="自动提取的 8 个节点色值" :columns="8">
        <ColorStripCard
          v-for="(color, idx) in extractedGradientColors"
          :key="color"
          :color="color"
          :copy-label="color"
          :favorite-name="'渐变节点 ' + (idx + 1)"
        />
      </ColorStripSection>
    </section>

    <Dialog
      :visible="cssDialogVisible"
      title="CSS 渐变代码"
      max-width="560px"
      @update:visible="cssDialogVisible = $event"
      @close="cssDialogVisible = false"
    >
      <pre class="code-block"><code>{{ gradientCSS }}</code></pre>
      <div class="css-dialog-footer">
        <button class="primary-btn" @click="copyValue(gradientCSS, 'CSS 渐变代码')">复制 CSS 代码</button>
      </div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.color-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
  min-width: 0;
}
.primary-btn, .secondary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { opacity: 0.9; }
}
.secondary-btn {
  background: var(--bg-muted); color: var(--text-primary); border-color: var(--border-primary);
}
.gradient-add-btn {
  width: 100%;
  &:hover {
    opacity: 1; background: var(--accent-soft); border-color: var(--accent); color: var(--accent);
  }
  &:active {
    background: var(--accent-light); border-color: var(--accent-hover); color: var(--accent-hover);
  }
}
.sm-btn {
  padding: 6px 12px; background: var(--bg-card);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  font-size: 12px; cursor: pointer; color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
  &.danger:hover { border-color: var(--error); color: var(--error); }
}
.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 20px 0 12px; }
.gradient-workbench {
  display: grid; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  gap: 16px; margin-bottom: 20px;
}
.gradient-control-col, .gradient-preview-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.gradient-color-inputs {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px; background: var(--bg-muted); border-radius: var(--radius-md);
  border: 1px solid var(--border-primary); flex: 1;
}
.gradient-stop-input {
  display: flex; align-items: center; gap: 10px;
  label { font-size: 12px; color: var(--text-secondary); min-width: 60px; flex-shrink: 0; }
  :deep(.color-picker) { flex: 1; min-width: 0; }
  > span { font-size: 12px; color: var(--text-tertiary); min-width: 36px; text-align: right; flex-shrink: 0; }
}
.gradient-pos-slider { flex: 1; min-width: 60px; }
.gradient-preview-wrap {
  position: relative;
  flex: 1;
  min-height: 160px;
  display: flex;
}
.gradient-preview-large {
  flex: 1; width: 100%; min-height: 160px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-primary);
}
.gradient-preview-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.gradient-preview-tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--chip-on-color-bg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  .iconfont { font-size: 14px; line-height: 1; }
  &:hover, &.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}
.gradient-props-panel {
  position: absolute;
  top: 42px;
  right: 8px;
  z-index: 3;
  min-width: 148px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.gradient-direction-list {
  margin: 0;
  padding: 4px 0;
  list-style: none;
}
.gradient-direction-item {
  padding: 8px 12px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
  &.is-selected { color: var(--accent); font-weight: 500; background: var(--bg-hover); }
}
.gradient-props-panel-enter-active,
.gradient-props-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.gradient-props-panel-enter-from,
.gradient-props-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.gradient-preview-text { font-size: 14px; font-weight: 600; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.code-block {
  background: #1e1e2e; color: #cdd6f4; padding: 20px; border-radius: var(--radius-md);
  font-family: 'SF Mono', monospace; font-size: 13px; line-height: 1.6; overflow-x: auto; margin: 0;
  code { white-space: pre; display: block; }
}
.css-dialog-footer {
  display: flex; justify-content: flex-end; margin-top: 16px;
  padding-top: 16px; border-top: 1px solid var(--border-primary);
}
@media (max-width: 1024px) {
  .gradient-workbench { grid-template-columns: 1fr; }
}
</style>
