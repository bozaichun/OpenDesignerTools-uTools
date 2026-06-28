<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AccessibilityCheckDetailShell from './AccessibilityCheckDetailShell.vue';
import WcagPanel from './WcagPanel.vue';
import ColorPicker from '../../components/ColorPicker.vue';
import { readDetailQuery } from './accessibilityCheckUtils';

const route = useRoute();

const fgColor = ref('#1677FF');
const bgColor = ref('#FFFFFF');
const simColor = ref('#FF5A5A');
const govColor = ref('#1677FF');
const textBgColor = ref('#2563EB');

const queryState = ref({});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  fgColor.value = q.fgColor;
  bgColor.value = q.bgColor;
  simColor.value = q.simColor;
  govColor.value = q.govColor;
  textBgColor.value = q.textBgColor;
  queryState.value = {
    fgColor: fgColor.value,
    bgColor: bgColor.value,
    simColor: simColor.value,
    govColor: govColor.value,
    textBgColor: textBgColor.value
  };
}

watch(() => route.query, applyRouteQuery, { deep: true });
onMounted(applyRouteQuery);
</script>

<template>
  <div class="access-detail">
    <AccessibilityCheckDetailShell current-module="wcag" :query-state="queryState">
      <template #main>
        <div class="wcag-top-pickers">
          <div class="wcag-top-item">
            <span class="wcag-top-label">前景色</span>
            <ColorPicker v-model="fgColor" />
          </div>
          <div class="wcag-top-item">
            <span class="wcag-top-label">背景色</span>
            <ColorPicker v-model="bgColor" />
          </div>
        </div>
      </template>
    </AccessibilityCheckDetailShell>
    <WcagPanel v-model:fg-color="fgColor" v-model:bg-color="bgColor" />
  </div>
</template>

<style lang="scss" scoped>
.access-detail { width: 100%; min-width: 0; }
.wcag-top-pickers {
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}
.wcag-top-item {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 10px;
  :deep(.color-picker) { flex: 1; min-width: 0; }
}
.wcag-top-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 42px;
}
</style>
