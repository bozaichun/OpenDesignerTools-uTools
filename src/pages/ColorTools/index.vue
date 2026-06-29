<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Banner from "../../components/Banner.vue";
import LayoutContainer from "../../components/LayoutContainer.vue";
import GridLayout from "../../components/GridLayout.vue";
import ColorPicker from "../../components/ColorPicker.vue";
import { parseColor, rgbToHsl } from "../../utils/colorUtils";
import {
  DETAIL_MODULES,
  DEFAULT_DIFF_COLOR_B,
  DEFAULT_GRADIENT_DIRECTION,
  DEFAULT_GRADIENT_STOPS,
  buildHomeQuery,
  computeAdjustedColor,
  computeDeltaE76,
  computeGradientStyle,
  getDeltaEDescription,
  getDeltaEClass,
} from "./colorToolsUtils";

const DIRECTION_LABELS = {
  "to right": "从左到右",
  "to bottom": "从上到下",
  "to bottom right": "对角线",
  circle: "圆形辐射",
  "45deg": "45° 斜向",
  "135deg": "135° 斜向",
};

const router = useRouter();

const inputColor = ref("#1677FF");
const diffColorB = ref(DEFAULT_DIFF_COLOR_B);

const summaryHsl = computed(() => {
  const rgb = parseColor(inputColor.value);
  return rgb ? rgbToHsl(rgb) : { h: 215, s: 100, l: 54 };
});

const adjustedColor = computed(() => {
  return computeAdjustedColor(
    summaryHsl.value.h,
    summaryHsl.value.s,
    summaryHsl.value.l,
  );
});

const gradientStops = computed(() => {
  return DEFAULT_GRADIENT_STOPS.map((s, idx) =>
    idx === 0 ? { ...s, color: inputColor.value } : { ...s },
  );
});

const gradientStyle = computed(() => {
  return computeGradientStyle(gradientStops.value, DEFAULT_GRADIENT_DIRECTION);
});

const gradientDirectionLabel = computed(() => {
  return (
    DIRECTION_LABELS[DEFAULT_GRADIENT_DIRECTION] || DEFAULT_GRADIENT_DIRECTION
  );
});

const deltaE76 = computed(() => {
  return computeDeltaE76(inputColor.value, diffColorB.value);
});

const deltaEDescription = computed(() => {
  return getDeltaEDescription(deltaE76.value);
});

const deltaEStatusClass = computed(() => {
  return getDeltaEClass(deltaE76.value);
});

function goToDetail(moduleId) {
  const target = DETAIL_MODULES.find((m) => m.id === moduleId);
  if (!target) return;
  router.push({
    path: target.route,
    query: buildHomeQuery(inputColor.value),
  });
}
</script>

<template>
  <LayoutContainer variant="module" class="module-colortools">
    <Banner
      title="输入色值，三项调色分析一步完成"
      description="选择或输入颜色，同步查看色阶微调、渐变编辑、色差比对结果"
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/ColorAdjustmentTool.png"
    />

    <!-- 三项调色统一面板 -->
    <LayoutContainer variant="panel" tag="section" class="unified-panel">
      <div class="unified-input-row">
        <ColorPicker v-model="inputColor" />
      </div>

      <GridLayout class="summary-grid" :cols="3" :cols-tablet="1" :cols-mobile="1">
        <div class="summary-card">
          <div class="summary-label">色阶微调</div>
          <div
            class="summary-swatch"
            :style="{ background: adjustedColor }"
          ></div>
          <div class="summary-value">{{ adjustedColor }}</div>
          <div class="summary-status">
            HSL {{ summaryHsl.h }}° / {{ summaryHsl.s }}% / {{ summaryHsl.l }}%
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('adjust')">
              查看详情
            </button>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">渐变编辑</div>
          <div
            class="summary-swatch gradient-swatch"
            :style="gradientStyle"
          ></div>
          <div class="summary-value">{{ gradientStops.length }} 个节点</div>
          <div class="summary-status">{{ gradientDirectionLabel }}</div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('gradient')">
              查看详情
            </button>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">色差比对</div>
          <div class="summary-dual">
            <div
              class="summary-swatch small"
              :style="{ background: inputColor }"
            ></div>
            <span class="summary-dual-arrow">↔</span>
            <div
              class="summary-swatch small"
              :style="{ background: diffColorB }"
            ></div>
          </div>
          <div class="summary-value">ΔE {{ deltaE76.toFixed(2) }}</div>
          <div class="summary-status" :class="deltaEStatusClass">
            {{ deltaEDescription }}
          </div>
          <div class="summary-actions">
            <button class="sm-btn" @click="goToDetail('difference')">
              查看详情
            </button>
          </div>
        </div>
      </GridLayout>
    </LayoutContainer>
  </LayoutContainer>
</template>

<style lang="scss" scoped>
.module-colortools {
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
  &.excellent {
    color: var(--success);
  }
  &.good {
    color: var(--accent);
  }
  &.medium {
    color: var(--warning);
  }
  &.poor {
    color: var(--error);
  }
}

.summary-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  margin: 0 auto 6px;
  &.gradient-swatch {
    width: 100%;
    max-width: 120px;
    height: 32px;
  }
  &.small {
    width: 28px;
    height: 28px;
    margin: 0;
  }
}

.summary-dual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.summary-dual-arrow {
  font-size: 14px;
  color: var(--text-tertiary);
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
