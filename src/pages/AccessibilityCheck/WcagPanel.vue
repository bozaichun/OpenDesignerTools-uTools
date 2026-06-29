<script lang="ts" setup>
import { computed } from 'vue';
import { contrast, QUICK_PAIRS, buildContrastResult } from './accessibilityCheckUtils';

const fgColor = defineModel('fgColor', { type: String, default: '#1677FF' });
const bgColor = defineModel('bgColor', { type: String, default: '#FFFFFF' });

const contrastRatio = computed(() => contrast(fgColor.value, bgColor.value));
const contrastGaugePercent = computed(() => Math.min((contrastRatio.value / 21) * 100, 100));
const contrastGaugeMarks = computed(() => [
  { label: '3:1', left: (3 / 21) * 100, name: 'AA 大字号' },
  { label: '4.5:1', left: (4.5 / 21) * 100, name: 'AA 正文' },
  { label: '7:1', left: (7 / 21) * 100, name: 'AAA 正文' }
]);
const wcagQualified = computed(() => contrastRatio.value >= 4.5);
const resultNormal = computed(() => buildContrastResult(contrastRatio.value, 4.5));
const resultLarge = computed(() => buildContrastResult(contrastRatio.value, 3));
const resultNormalAAA = computed(() => buildContrastResult(contrastRatio.value, 7));
const resultLargeAAA = computed(() => buildContrastResult(contrastRatio.value, 4.5));
const quickPairs = computed(() =>
  QUICK_PAIRS.map((p) => ({ ...p, ratio: contrast(p.fg, p.bg) }))
);

function applyPair(p) {
  fgColor.value = p.fg;
  bgColor.value = p.bg;
}
</script>

<template>
  <section class="panel panel--plain wcag-panel">
    <!-- 对比度仪表盘 -->
    <div class="contrast-gauge-card wcag-gauge-full">
      <div class="gauge-head">
        <span class="gauge-title">对比度比值</span>
        <div class="gauge-head-right">
          <span class="wcag-status-badge" :class="wcagQualified ? 'ok' : 'warn'">
            {{ wcagQualified ? '合格' : '不合格' }}
          </span>
          <span class="gauge-value">{{ contrastRatio.toFixed(2) }}:1</span>
        </div>
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

    <!-- 预览块：文字预览 + 合规判定 -->
    <div class="wcag-preview-row">
      <div class="preview-block">
        <div class="preview-block-title">文字预览</div>
        <div class="contrast-preview compact" :style="{ background: bgColor, color: fgColor }">
          <div class="contrast-line-lg">大字号 24px</div>
          <div class="contrast-line-base">正文 14px</div>
          <div class="contrast-line-sm">辅助 12px</div>
        </div>
      </div>

      <div class="preview-block">
        <div class="preview-block-title">合规判定</div>
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

    <!-- 快速参考 -->
    <div class="quick-test-row">
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
  </section>
</template>

<style lang="scss" scoped>
@use './accessibilityPanels.scss' as *;
</style>
