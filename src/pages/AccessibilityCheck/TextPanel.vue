<script lang="ts" setup>
import { computed } from 'vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import ColorStripCard from '../../components/ColorStripCard.vue';
import ColorStripSection from '../../components/ColorStripSection.vue';
import { computeTextSuggestions, computeSimilarStackColors } from './accessibilityCheckUtils';

const textBgColor = defineModel('textBgColor', { type: String, default: '#2563EB' });
const textSuggestions = computed(() => computeTextSuggestions(textBgColor.value));
const stackColors = computed(() => computeSimilarStackColors(textBgColor.value));
</script>

<template>
  <section class="panel panel--text">
    <!-- 叠字推荐 / 叠字预览 -->
    <div class="stack-layout">
      <div class="stack-col stack-col--recommend">
        <ColorStripSection title="叠字推荐" :columns="3" :divider="false">
          <ColorStripCard
            v-for="(color, idx) in stackColors"
            :key="color + idx"
            :color="color"
            :copy-label="'叠色 ' + (idx + 1)"
            :favorite-name="'叠色 ' + (idx + 1)"
          />
        </ColorStripSection>
      </div>

      <div class="stack-col stack-col--preview">
        <div class="stack-color-title">叠字预览</div>
        <div class="text-preview-grid">
          <div
            v-for="rec in textSuggestions"
            :key="rec.name"
            class="text-suggest-card"
            :class="rec.qualified ? 'ok' : 'warn'"
            :style="{ background: textBgColor, color: rec.color }"
          >
            <div class="text-suggest-card-top">
              <span class="text-status-badge" :class="rec.qualified ? 'ok' : 'warn'">
                {{ rec.qualified ? '合格' : '不合格' }}
              </span>
              <ColorActionGroup
                :value="rec.color"
                :copy-label="rec.name"
                :favorite-name="rec.name"
                variant="on-color"
                class="text-suggest-actions"
              />
            </div>
            <div class="text-suggest-row-1">{{ rec.name }}</div>
            <div class="text-suggest-row-2">推荐文字色：{{ rec.color }}</div>
            <div class="text-suggest-row-3">对比度 {{ rec.ratio.toFixed(2) }}:1 · {{ rec.level }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use './accessibilityPanels.scss' as *;
</style>
