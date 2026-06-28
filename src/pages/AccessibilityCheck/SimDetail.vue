<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AccessibilityCheckDetailShell from './AccessibilityCheckDetailShell.vue';
import SimPanel from './SimPanel.vue';
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
  queryState.value = { fgColor: fgColor.value, bgColor: bgColor.value, simColor: simColor.value, govColor: govColor.value, textBgColor: textBgColor.value };
}

watch(() => route.query, applyRouteQuery, { deep: true });
onMounted(applyRouteQuery);
</script>

<template>
  <div class="access-detail">
    <AccessibilityCheckDetailShell current-module="sim" :query-state="queryState">
      <template #main>
        <ColorPicker v-model="simColor" />
      </template>
    </AccessibilityCheckDetailShell>
    <SimPanel v-model:sim-color="simColor" />
  </div>
</template>

<style lang="scss" scoped>
.access-detail { width: 100%; min-width: 0; }
</style>
