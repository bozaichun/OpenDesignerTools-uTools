<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Banner from '../../components/Banner.vue';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';
import ColorPicker from '../../components/ColorPicker.vue';
import {
  DETAIL_MODULES,
  DEFAULT_FG,
  DEFAULT_BG,
  DEFAULT_SIM,
  DEFAULT_GOV,
  DEFAULT_TEXT_BG,
  buildHomeQuery,
  computeWcagSummary,
  computeSimResults,
  runGovCheck,
  computeTextSuggestions
} from './accessibilityCheckUtils';

const router = useRouter();

const fgColor = ref(DEFAULT_FG);
const bgColor = ref(DEFAULT_BG);
const simColor = ref(DEFAULT_SIM);
const govColor = ref(DEFAULT_GOV);
const textBgColor = ref(DEFAULT_TEXT_BG);

const wcagSummary = computed(() => computeWcagSummary(fgColor.value, bgColor.value));
const simPreview = computed(() => computeSimResults(simColor.value));
const govSummary = computed(() => runGovCheck(govColor.value));
const textPreview = computed(() => computeTextSuggestions(textBgColor.value));

const bestTextColor = computed(() => {
  const sorted = [...textPreview.value].sort((a, b) => b.ratio - a.ratio);
  return sorted[0] || null;
});

function goToDetail(moduleId) {
  const target = DETAIL_MODULES.find((m) => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: buildHomeQuery(fgColor.value, bgColor.value, {
      sim: simColor.value,
      gov: govColor.value,
      textBg: textBgColor.value
    })
  });
}
</script>

<template>
  <LayoutContainer variant="module" class="module-access">
    <Banner
      title="输入色值，四项无障碍分析一步完成"
      description="选择或输入颜色，同步查看 WCAG 对比度、色弱模拟、政企合规、文字叠色推荐"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/ColorContrast.png"
    />

    <LayoutContainer variant="panel" tag="section" class="unified-panel">
      <div class="unified-input-row">
        <ColorPicker v-model="fgColor" />
        <ColorPicker v-model="bgColor" />
      </div>

      <GridLayout class="summary-grid" :cols="4" :cols-tablet="2" :cols-mobile="1">
        <div class="summary-card">
          <div class="summary-label">WCAG 对比度</div>
          <div class="summary-swatch" :style="{ background: fgColor, borderColor: bgColor }"></div>
          <div class="summary-value">{{ wcagSummary.ratio.toFixed(2) }}:1</div>
          <div class="summary-status" :class="wcagSummary.resultNormal.class">
            正文 AA · {{ wcagSummary.resultNormal.status }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('wcag')">查看详情</button>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">色弱色盲模拟</div>
          <div class="summary-swatch" :style="{ background: simColor }"></div>
          <div class="summary-value">{{ simPreview[0]?.hex || simColor }}</div>
          <div class="summary-status">5 种色觉类型预览</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('sim')">查看详情</button>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">政企合规</div>
          <div class="summary-swatch" :style="{ background: govColor }"></div>
          <div class="summary-value">{{ govSummary.passedCount }}/{{ govSummary.checks.length }}</div>
          <div class="summary-status" :class="govSummary.passedCount === govSummary.checks.length ? 'ok' : 'warn'">
            {{ govSummary.passedCount === govSummary.checks.length ? '全部通过' : '部分待优化' }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('gov')">查看详情</button>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">文字叠色推荐</div>
          <div
            class="summary-swatch"
            :style="{ background: textBgColor, color: bestTextColor?.color }"
          ></div>
          <div class="summary-value">{{ bestTextColor?.color || '—' }}</div>
          <div class="summary-status">{{ bestTextColor?.level || '—' }}</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('text')">查看详情</button>
          </div>
        </div>
      </GridLayout>
    </LayoutContainer>
  </LayoutContainer>
</template>

<style lang="scss" scoped>
.module-access { width: 100%; min-width: 0; }

.unified-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  :deep(.color-picker) { flex: 1; min-width: 200px; }
}

.summary-card {
  padding: 14px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  text-align: center;
  display: flex;
  flex-direction: column;
}
.summary-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.summary-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 4px;
}
.summary-status {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  &.ok { color: var(--success); }
  &.warn { color: var(--warning); }
  &.fail { color: var(--error); }
}
.summary-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border-primary);
  margin: 0 auto 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}
.summary-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: auto;
}
.sm-btn {
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  color: var(--text-primary);
  &:hover { border-color: var(--accent); color: var(--accent); }
}

</style>
