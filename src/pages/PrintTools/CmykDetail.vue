<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Selector from '../../components/Selector.vue';
import FavoriteButton from '../../components/FavoriteButton.vue';
import PrintToolsDetailShell from './PrintToolsDetailShell.vue';
import { parseColor, getContrastColor as gcc } from '../../utils/colorUtils';
import { computeCmykResult, computeCmykConvertedHex, readDetailQuery } from './printToolsUtils';

const route = useRoute();

const inputColor = ref('#1677FF');
const profile = ref('srgb');

const shellQueryExtra = computed(() => {
  return { profile: profile.value, paper: 'coated' };
});

const cmykResult = computed(() => {
  return computeCmykResult(inputColor.value);
});

const cmykConvertedHex = computed(() => {
  return computeCmykConvertedHex(cmykResult.value);
});

function applyRouteQuery() {
  const q = readDetailQuery(route);
  inputColor.value = q.color;
  profile.value = q.profile;
}

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}

watch(() => route.query, () => {
  applyRouteQuery();
});

onMounted(() => {
  applyRouteQuery();
});
</script>

<template>
  <div class="print-detail">
    <!-- 印刷详情壳层 -->
    <PrintToolsDetailShell
      current-module="cmyk"
      :color="inputColor"
      :query-extra="shellQueryExtra"
      @update:color="inputColor = $event"
    >
      <template #extra>
        <Selector v-model="profile" :block="false" :flex="true">
          <option value="srgb">sRGB / 通用</option>
          <option value="cmyk_us">US Web Coated (SWOP) v2</option>
          <option value="cmyk_eu">Euroscale Coated v2</option>
          <option value="cmyk_jp">Japan Color 2001 Coated</option>
        </Selector>
      </template>
    </PrintToolsDetailShell>

    <section class="panel module-panel">
      <div class="cmyk-preview">
        <div class="cmyk-preview-item">
          <div class="cmyk-preview-swatch cmyk-preview-swatch-with-action" :style="{ background: inputColor }">
            <span class="cmyk-preview-text" :style="{ color: getContrastColor(inputColor) }">屏幕色</span>
            <FavoriteButton
              :hex="inputColor"
              name="屏幕色"
              class="cmyk-swatch-favorite-btn"
            />
          </div>
          <div class="cmyk-preview-label">原始 RGB</div>
          <div class="cmyk-preview-value">{{ inputColor }}</div>
        </div>
        <div class="cmyk-arrow">→</div>
        <div class="cmyk-preview-item">
          <div class="cmyk-preview-swatch" :style="{ background: cmykConvertedHex }">
            <span class="cmyk-preview-text" :style="{ color: getContrastColor(cmykConvertedHex) }">印刷色</span>
          </div>
          <div class="cmyk-preview-label">CMYK 模拟</div>
          <div class="cmyk-preview-value">cmyk({{ cmykResult.c }}%, {{ cmykResult.m }}%, {{ cmykResult.y }}%, {{ cmykResult.k }}%)</div>
        </div>
      </div>

      <div class="cmyk-result-grid">
        <div class="result-card" :class="cmykResult.outOfGamut ? 'warn' : 'ok'">
          <div class="result-label">色域检测</div>
          <div class="result-value">{{ cmykResult.outOfGamut ? '⚠ 溢色' : '✓ 正常' }}</div>
          <div class="result-status">超出 CMYK 色域的颜色印刷后会变暗</div>
        </div>
        <div class="result-card">
          <div class="result-label">C 青色</div>
          <div class="result-value">{{ cmykResult.c }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill c" :style="{ width: cmykResult.c + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">M 品红</div>
          <div class="result-value">{{ cmykResult.m }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill m" :style="{ width: cmykResult.m + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">Y 黄色</div>
          <div class="result-value">{{ cmykResult.y }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill y" :style="{ width: cmykResult.y + '%' }"></div></div>
        </div>
        <div class="result-card">
          <div class="result-label">K 黑色</div>
          <div class="result-value">{{ cmykResult.k }}%</div>
          <div class="cmyk-bar"><div class="cmyk-bar-fill k" :style="{ width: cmykResult.k + '%' }"></div></div>
        </div>
      </div>

      <div v-if="cmykResult.outOfGamut" class="warning-box">
        ⚠ 此颜色超出 CMYK 印刷色域，实际印刷效果可能与屏幕显示有明显差异。建议降低饱和度后使用。
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.print-detail { width: 100%; min-width: 0; }
.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.cmyk-preview {
  display: flex; align-items: center; justify-content: center; gap: 24px;
  padding: 24px; background: var(--bg-muted); border-radius: var(--radius-md); margin-bottom: 20px;
}
.cmyk-preview-item { text-align: center; }
.cmyk-preview-swatch {
  width: 120px; height: 120px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px; border: 1px solid var(--border-primary);
}
.cmyk-preview-swatch-with-action {
  position: relative;
}
:deep(.cmyk-swatch-favorite-btn.favorite-btn) {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  background: var(--chip-on-color-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  .favorite-icon {
    font-size: 12px;
  }
}
.cmyk-preview-text { font-size: 14px; font-weight: 600; }
.cmyk-preview-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
.cmyk-preview-value { font-size: 11px; font-family: monospace; color: var(--text-tertiary); }
.cmyk-arrow { font-size: 24px; color: var(--text-tertiary); }
.cmyk-result-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px;
}
.result-card {
  padding: 14px; border-radius: var(--radius-md); text-align: center;
  border: 1px solid var(--border-primary); background: var(--bg-muted);
  &.ok { border-color: var(--success); background: var(--success-bg); }
  &.warn { border-color: var(--warning); background: var(--warning-bg); }
}
.result-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.result-value { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.result-status { font-size: 11px; color: var(--text-tertiary); }
.cmyk-bar {
  height: 8px; background: var(--border-primary); border-radius: 4px; overflow: hidden; margin-top: 8px;
}
.cmyk-bar-fill {
  height: 100%; border-radius: 4px;
  &.c { background: #00AEEF; }
  &.m { background: #EC008C; }
  &.y { background: #FFF200; }
  &.k { background: #231F20; }
}
.warning-box {
  padding: 14px 18px; background: var(--warning-bg);
  border: 1px solid var(--warning); border-radius: var(--radius-md);
  font-size: 13px; color: var(--warning-active);
}
@media (max-width: 1024px) {
  .cmyk-result-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .cmyk-result-grid { grid-template-columns: 1fr; }
  .cmyk-preview { flex-direction: column; }
}
</style>
