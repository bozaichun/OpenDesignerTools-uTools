<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { runGovCheck } from './accessibilityCheckUtils';

const govColor = defineModel('govColor', { type: String, default: '#1677FF' });

const govChecks = ref([]);

function executeGovCheck() {
  const result = runGovCheck(govColor.value);
  govChecks.value = result.checks;
}

watch(govColor, () => executeGovCheck());
onMounted(() => executeGovCheck());
</script>

<template>
  <section class="panel">
    <div class="gov-body">
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
