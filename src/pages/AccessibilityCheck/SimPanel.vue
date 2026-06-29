<script lang="ts" setup>
import { computed } from 'vue';
import { computeSimResults } from './accessibilityCheckUtils';

const simColor = defineModel('simColor', { type: String, default: '#FF5A5A' });
const simResults = computed(() => computeSimResults(simColor.value));
</script>

<template>
  <section class="panel panel--plain">
    <div class="sim-grid">
      <div v-for="sim in simResults" :key="sim.key" class="sim-card">
        <div class="sim-card-head">
          <div class="sim-title">{{ sim.label }}</div>
          <span class="sim-prompt iconfont icon-Prompt"></span>
          <span class="sim-prompt-tip">{{ sim.label }}：设计稿配色是否在该人群中清晰可辨？</span>
        </div>
        <div class="sim-colors">
          <div
            v-for="c in sim.colors"
            :key="c"
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
</template>

<style lang="scss" scoped>
@use './accessibilityPanels.scss' as *;
</style>
