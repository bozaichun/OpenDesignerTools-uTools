<script lang="ts" setup>
import { computed } from 'vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import { computeTextSuggestions, computeSimilarStackColors } from './accessibilityCheckUtils';

const textBgColor = defineModel('textBgColor', { type: String, default: '#2563EB' });
const textSuggestions = computed(() => computeTextSuggestions(textBgColor.value));
const stackColors = computed(() => computeSimilarStackColors(textBgColor.value));
</script>

<template>
  <section class="panel">
    <div class="text-suggest-grid">
      <div
        v-for="rec in textSuggestions"
        :key="rec.name"
        class="text-suggest-card"
        :class="rec.qualified ? 'ok' : 'warn'"
        :style="{ background: textBgColor, color: rec.color }"
      >
        <ColorActionGroup
          :value="rec.color"
          :copy-label="rec.name"
          :favorite-name="rec.name"
          variant="on-color"
          class="text-suggest-actions"
        />
        <span class="text-status-badge" :class="rec.qualified ? 'ok' : 'warn'">
          {{ rec.qualified ? '合格' : '不合格' }}
        </span>
        <div class="text-suggest-row-1">{{ rec.name }}</div>
        <div class="text-suggest-row-2">推荐文字色：{{ rec.color }}</div>
        <div class="text-suggest-row-3">对比度 {{ rec.ratio.toFixed(2) }}:1 · {{ rec.level }}</div>
      </div>
    </div>

    <!-- 叠字推荐 -->
    <div class="stack-color-section">
      <div class="stack-color-title">叠字推荐</div>
      <div class="stack-color-grid">
        <div
          v-for="(color, idx) in stackColors"
          :key="color + idx"
          class="stack-color-item"
        >
          <div class="stack-color-swatch-wrap">
            <span class="stack-color-swatch" :style="{ background: color }"></span>
            <ColorActionGroup
              :value="color"
              :copy-label="'叠色 ' + (idx + 1)"
              :favorite-name="'叠色 ' + (idx + 1)"
              variant="on-color"
              class="stack-color-actions"
            />
          </div>
          <span class="stack-color-hex">{{ color }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use './accessibilityPanels.scss' as *;
</style>
