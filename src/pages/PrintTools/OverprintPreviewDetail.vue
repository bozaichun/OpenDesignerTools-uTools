<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ColorPicker from '../../components/ColorPicker.vue';
import PrintToolsDetailShell from './PrintToolsDetailShell.vue';
import {
  parseColor,
  copyToClipboard,
  showToast,
  getContrastColor as gcc,
} from '../../utils/colorUtils';
import {
  computeOverprintMixed,
  readDetailQuery,
} from './printToolsUtils';

const route = useRoute();

const setHeaderActions = inject('setHeaderActions', () => {});
const clearHeaderActions = inject('clearHeaderActions', () => {});

const inputColor = ref('#1677FF');
const colorB = ref('#FFFFFF');
const opacity = ref(70);

const printPanel = ref(null);
const printSwatch = ref(null);

const shellQueryExtra = computed(() => {
  return {
    colorB: colorB.value,
    opacity: String(opacity.value),
    profile: 'srgb',
    paper: 'coated',
  };
});

const overprintMixed = computed(() => {
  return computeOverprintMixed(
    inputColor.value,
    colorB.value,
    opacity.value,
  );
});

const overprintMixedStyle = computed(() => {
  return overprintMixed.value.style;
});

const overprintMixedHex = computed(() => {
  return overprintMixed.value.hex;
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  inputColor.value = q.color;
  colorB.value = q.colorB;
  opacity.value = q.opacity;
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label + ': ' + value, 'success');
}

function handlePrintOverprint() {
  const hex = overprintMixedHex.value;
  const colorA = inputColor.value;
  const colorBVal = colorB.value;
  const opacityVal = opacity.value;
  const textColor = getContrastColor(hex);
  const { width, height } = getPrintSwatchDimensions();
  const swatchDataUrl = buildOverprintSwatchImage(
    hex,
    textColor,
    '叠印效果',
    width,
    height,
  );

  let iframe = document.getElementById('overprint-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'overprint-print-frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
  }
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>叠印效果打印</title>' +
      '<style>' +
      '*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;}' +
      '@page{size:A4 portrait;margin:12mm;}' +
      'body{margin:0;padding:0;font-family:sans-serif;}' +
      '.print-card{width:' +
      width +
      'px;margin:0 auto;text-align:center;}' +
      '.swatch-img{display:block;width:' +
      width +
      'px;height:' +
      height +
      'px;border-radius:8px;border:1px solid #d1d5db;}' +
      '.hex-label{margin-top:8px;font-size:11px;font-family:monospace;color:#666;}' +
      '.meta{margin-top:20px;font-size:11px;line-height:1.7;color:#888;text-align:left;}' +
      '@media print{body{padding:0;}.print-card{page-break-inside:avoid;}}' +
      '</style></head><body>' +
      '<div class="print-card">' +
      '<img class="swatch-img" src="' +
      swatchDataUrl +
      '" alt="叠印效果 ' +
      hex +
      '" />' +
      '<div class="hex-label">' +
      hex +
      '</div>' +
      '<div class="meta">' +
      '<div>A ' +
      colorA +
      ' + B ' +
      colorBVal +
      '</div>' +
      '<div>透明度 ' +
      opacityVal +
      '%</div>' +
      '</div></div></body></html>',
  );
  doc.close();

  const win = iframe.contentWindow;
  const img = win.document.querySelector('.swatch-img');
  const doPrint = () => {
    win.focus();
    win.print();
    showToast(null, '已唤起打印，请选择打印机', 'success');
  };
  if (img && img.complete) {
    doPrint();
  } else if (img) {
    img.onload = doPrint;
    img.onerror = doPrint;
  } else {
    doPrint();
  }
}

function getPrintSwatchDimensions() {
  const swatchEl = printSwatch.value;
  const panelEl = printPanel.value;
  const fallback = { width: 120, height: 80 };

  const swatchRect = swatchEl?.getBoundingClientRect?.();
  const aspectRatio =
    swatchRect && swatchRect.width > 0
      ? swatchRect.height / swatchRect.width
      : fallback.height / fallback.width;

  if (!panelEl) {
    return swatchRect
      ? {
          width: Math.round(swatchRect.width),
          height: Math.round(swatchRect.height),
        }
      : fallback;
  }

  const panelStyle = window.getComputedStyle(panelEl);
  const paddingX =
    parseFloat(panelStyle.paddingLeft) + parseFloat(panelStyle.paddingRight);
  const width = Math.max(
    Math.round(panelEl.clientWidth - paddingX),
    fallback.width,
  );
  const height = Math.max(Math.round(width * aspectRatio), fallback.height);

  return { width, height };
}

function buildOverprintSwatchImage(hex, textColor, label, width, height) {
  const canvas = document.createElement('canvas');
  const scale = 3;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(scale, scale);
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.max(13, Math.round(height * 0.16))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, width / 2, height / 2);
  return canvas.toDataURL('image/png');
}

function updateHeaderActions() {
  setHeaderActions([
    {
      label: '打印叠印',
      icon: 'icon-Areality-PrintingTool',
      iconOnly: true,
      onClick: () => handlePrintOverprint(),
    },
  ]);
}

watch(() => route.query, () => {
  applyRouteQuery();
});

onMounted(() => {
  applyRouteQuery();
  updateHeaderActions();
});

onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="print-detail">
    <PrintToolsDetailShell
      current-module="overprint"
      :color="inputColor"
      :query-extra="shellQueryExtra"
      @update:color="inputColor = $event"
    >
      <template #extra>
        <ColorPicker v-model="colorB" />
        <div class="opacity-control">
          <input
            type="range"
            v-model="opacity"
            min="10"
            max="100"
            class="opacity-slider"
          />
          <span>{{ opacity }}%</span>
        </div>
      </template>
    </PrintToolsDetailShell>

    <section ref="printPanel" class="panel module-panel">
      <div class="overprint-preview">
        <div class="overprint-item">
          <div
            class="overprint-swatch large"
            :style="{ background: inputColor }"
          >
            <span :style="{ color: getContrastColor(inputColor) }"
              >颜色 A</span
            >
          </div>
          <div class="overprint-label">{{ inputColor }}</div>
        </div>
        <div class="overprint-plus">+</div>
        <div class="overprint-item">
          <div
            class="overprint-swatch large"
            :style="{ background: colorB }"
          >
            <span :style="{ color: getContrastColor(colorB) }"
              >颜色 B</span
            >
          </div>
          <div class="overprint-label">{{ colorB }}</div>
        </div>
        <div class="overprint-equals">=</div>
        <div class="overprint-item overprint-result">
          <div
            ref="printSwatch"
            class="overprint-swatch large overprint-swatch-with-action"
            :style="overprintMixedStyle"
          >
            <span :style="{ color: getContrastColor(overprintMixedHex) }"
              >叠印效果</span
            >
            <button
              class="action-icon-btn swatch-copy-btn"
              title="复制颜色"
              @click="copyValue(overprintMixedHex, '叠印色')"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>
          <div class="overprint-label">{{ overprintMixedHex }}</div>
        </div>
      </div>

      <div class="overprint-description">
        <strong>印刷提示：</strong>
        叠印常用于在深色背景上印刷浅色文字或特殊工艺。
        实际印刷效果受纸张类型、油墨品牌、印刷压力等因素影响，建议先打样确认。
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.print-detail {
  width: 100%;
  min-width: 0;
}
.opacity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  span {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }
}
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}
.opacity-slider {
  flex: 1;
}
.overprint-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.overprint-item {
  text-align: center;
}
.overprint-swatch {
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--border-primary);
  margin-bottom: 8px;
  &.large {
    width: 120px;
    height: 80px;
  }
}
.overprint-label {
  font-size: 11px;
  font-family: monospace;
  color: var(--text-secondary);
}
.overprint-swatch-with-action {
  position: relative;
}
.swatch-copy-btn {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  .iconfont {
    font-size: 9px;
  }
}
.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  .iconfont {
    font-size: 12px;
    line-height: 1;
  }
  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}
.overprint-plus,
.overprint-equals {
  font-size: 28px;
  font-weight: 300;
  color: var(--text-tertiary);
}
.overprint-description {
  padding: 14px 18px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
@media (max-width: 640px) {
  .overprint-preview {
    flex-direction: column;
  }
}
</style>
