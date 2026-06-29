<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Banner from '../../components/Banner.vue';
import LayoutContainer from '../../components/LayoutContainer.vue';
import GridLayout from '../../components/GridLayout.vue';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import HalftoneChartDialog from './HalftoneChartDialog.vue';
import {
  DETAIL_MODULES,
  computeCmykResult,
  computePantoneResults,
  computeOverprintMixed,
  computeHalftoneLevels,
} from './printToolsUtils';

const router = useRouter();

const inputColor = ref('#1677FF');
const cmykProfile = ref('srgb');
const pantonePaperType = ref('coated');
const overprintColorB = ref('#FFFFFF');
const overprintOpacity = ref(70);
const halftoneChartVisible = ref(false);

const cmykResult = computed(() => {
  return computeCmykResult(inputColor.value);
});

const pantoneResults = computed(() => {
  return computePantoneResults(inputColor.value, pantonePaperType.value);
});

const topPantone = computed(() => {
  return pantoneResults.value.length > 0 ? pantoneResults.value[0] : null;
});

const overprintMixedHex = computed(() => {
  return computeOverprintMixed(
    inputColor.value,
    overprintColorB.value,
    overprintOpacity.value,
  ).hex;
});

const halftoneLevels = computed(() => {
  return computeHalftoneLevels(inputColor.value);
});

const halftoneMidLevel = computed(() => {
  return halftoneLevels.value.find((l) => l.percent === 50) || null;
});

function buildQuery(extra = {}) {
  return {
    color: inputColor.value,
    profile: cmykProfile.value,
    paper: pantonePaperType.value,
    colorB: overprintColorB.value,
    opacity: String(overprintOpacity.value),
    ...extra,
  };
}

function goToDetail(moduleId, extra = {}) {
  const target = DETAIL_MODULES.find((m) => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: buildQuery(extra),
  });
}
</script>

<template>
  <LayoutContainer variant="module" class="module-printtools">
    <Banner
      title="输入色值，四项印刷分析一步完成"
      description="选择或输入颜色，同步查看 CMYK 校准、潘通匹配、叠印预览、网点换算结果"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/PrintingTool.png"
    />
    <!-- 统一色值输入 -->
    <LayoutContainer variant="panel" tag="section" class="unified-panel">
      <div class="unified-input-row">
        <ColorPicker v-model="inputColor" />
        <Selector v-model="cmykProfile" :block="false" :flex="true">
          <option value="srgb">sRGB / 通用</option>
          <option value="cmyk_us">US Web Coated (SWOP) v2</option>
          <option value="cmyk_eu">Euroscale Coated v2</option>
          <option value="cmyk_jp">Japan Color 2001 Coated</option>
        </Selector>
        <Selector v-model="pantonePaperType" :block="false" :flex="true">
          <option value="coated">铜版纸 Coated</option>
          <option value="uncoated">胶版纸 Uncoated</option>
        </Selector>
      </div>

      <GridLayout class="summary-grid" :cols="4" :cols-tablet="2" :cols-mobile="1">
        <div class="summary-card">
          <div class="summary-label">CMYK 校准</div>
          <div class="summary-value">
            cmyk({{ cmykResult.c }}%, {{ cmykResult.m }}%, {{ cmykResult.y }}%,
            {{ cmykResult.k }}%)
          </div>
          <div
            class="summary-status"
            :class="cmykResult.outOfGamut ? 'warn' : 'ok'"
          >
            {{ cmykResult.outOfGamut ? "⚠ 溢色预警" : "✓ 色域正常" }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('cmyk')">查看详情</button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">潘通匹配</div>
          <div class="summary-value">
            {{ topPantone ? topPantone.code : "—" }}
          </div>
          <div class="summary-status">
            {{ topPantone ? "ΔE " + topPantone.deltaE.toFixed(2) : "—" }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('pantone')">
              查看详情
            </button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">叠印预览</div>
          <div
            class="summary-swatch"
            :style="{ background: overprintMixedHex }"
          ></div>
          <div class="summary-value">{{ overprintMixedHex }}</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('overprint')">
              查看详情
            </button>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">网点换算</div>
          <div
            class="summary-swatch"
            :style="{
              background: halftoneMidLevel
                ? halftoneMidLevel.color
                : 'transparent',
            }"
          ></div>
          <div class="summary-value">
            {{ halftoneMidLevel ? halftoneMidLevel.color : "—" }}
          </div>
          <div class="summary-status">50% 网点参考色</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('screenTint')">
              查看详情
            </button>
            <button class="sm-btn" @click="halftoneChartVisible = true">
              网点分布图
            </button>
          </div>
        </div>
      </GridLayout>
    </LayoutContainer>

    <HalftoneChartDialog
      v-model:visible="halftoneChartVisible"
      :levels="halftoneLevels"
    />
  </LayoutContainer>
</template>

<style lang="scss" scoped>
.module-printtools {
  width: 100%;
  min-width: 0;
}

.unified-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  :deep(.color-picker) {
    flex: 1;
    min-width: 200px;
  }
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
}
.summary-status.ok {
  color: var(--success);
}
.summary-status.warn {
  color: var(--warning);
}
.summary-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  margin: 0 auto 6px;
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
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
}

</style>
