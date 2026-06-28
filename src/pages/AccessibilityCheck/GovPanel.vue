<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { runGovCheck } from './accessibilityCheckUtils';

const govColor = defineModel('govColor', { type: String, default: '#1677FF' });

const govChecks = ref([]);
const govPassedCount = ref(0);

const govSuggestedColors = computed(() => {
  const set = new Set();
  govChecks.value.forEach((c) => {
    if (c.suggestions) c.suggestions.forEach((s) => set.add(s));
  });
  return [...set];
});

function executeGovCheck() {
  const result = runGovCheck(govColor.value);
  govChecks.value = result.checks;
  govPassedCount.value = result.passedCount;
}

watch(govColor, () => executeGovCheck());
onMounted(() => executeGovCheck());
</script>

<template>
  <section class="panel">
    <div class="gov-body">
      <aside class="gov-summary">
        <div class="gov-summary-stat">
          <strong>合规汇总</strong>
          <span>{{ govPassedCount }}/{{ govChecks.length }} 项符合标准</span>
        </div>
        <div v-if="govSuggestedColors.length" class="gov-summary-suggest">
          <span class="gov-summary-label">推荐优化色</span>
          <div class="gov-suggest-list">
            <span
              v-for="c in govSuggestedColors"
              :key="c"
              class="gov-suggest-chip"
              @click="govColor = c"
            >
              <span class="gov-swatch" :style="{ background: c }"></span>{{ c }}
            </span>
          </div>
        </div>
      </aside>

      <div class="gov-check-grid">
        <div v-for="c in govChecks" :key="c.title" class="gov-check-card" :class="c.pass ? 'pass' : 'warn'">
          <div class="gov-check-head">
            <span class="gov-check-icon">{{ c.pass ? '✓' : '!' }}</span>
            <span class="gov-check-title">{{ c.title }}</span>
          </div>
          <div class="gov-check-desc">{{ c.desc }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use './accessibilityPanels.scss' as *;
</style>
