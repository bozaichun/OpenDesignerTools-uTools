<script lang="ts" setup>
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import ColorPicker from '../../components/ColorPicker.vue';
import Input from '../../components/Input.vue';
import Banner from '../../components/Banner.vue';
import {
  detectColorFormat, parseColor, formatRGBA, formatHSLA,
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../../utils/colorUtils';
import {
  isFavorite,
  toggleFavorite,
  normalizeFavoriteHex
} from '../../utils/favoriteStorage';

const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const currentRGB = ref({ r: 255, g: 255, b: 255, a: 1 });
const inputs = reactive({
  hex: '#FFFFFF',
  rgb: 'rgb(255, 255, 255)',
  hsl: 'hsl(0, 0%, 100%)',
  cmyk: 'cmyk(0%, 0%, 0%, 0%)',
  hsv: 'hsv(0, 0%, 100%)'
});
const alphaPercent = ref(100);
const invalidFormat = ref(null);
const errorMsg = ref('');
const isUpdating = ref(false);

const previewColor = computed(() => {
  const { r, g, b, a } = currentRGB.value;
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  return formatHEX({ r, g, b });
});

const textContrast = computed(() => {
  const { r, g, b } = currentRGB.value;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
});

function updateHeaderActions() {
  const hex = normalizeFavoriteHex(inputs.hex);
  const favorited = hex ? isFavorite(hex) : false;
  setHeaderActions([
    {
      label: favorited ? '已收藏' : '收藏',
      onClick: () => handleToggleFavorite(),
      secondary: favorited
    }
  ]);
}

function handleToggleFavorite() {
  const hex = normalizeFavoriteHex(inputs.hex);
  if (!hex) {
    showToast(null, '颜色格式无效，无法收藏', 'error');
    return;
  }
  const wasFavorited = isFavorite(hex);
  const result = toggleFavorite({ hex, name: hex });
  if (!result.ok) {
    showToast(null, result.message || '操作失败', 'error');
    return;
  }
  showToast(
    null,
    wasFavorited ? '已取消收藏' : `已将 “${hex}” 加入我的收藏`,
    'success'
  );
  updateHeaderActions();
}

function onInputChange(format) {
  if (isUpdating.value) return;
  isUpdating.value = true;

  const value = inputs[format].trim();
  if (!value) {
    invalidFormat.value = null;
    errorMsg.value = '';
    isUpdating.value = false;
    return;
  }

  const detected = detectColorFormat(value);
  const detectedFmt = detected ? detected.toLowerCase() : null;
  const normalizedFmt = (format === 'rgb' && detectedFmt === 'rgba') || (format === 'rgba' && detectedFmt === 'rgb')
    ? format
    : detectedFmt;
  if (!detected || normalizedFmt !== format) {
    invalidFormat.value = format;
    errorMsg.value = `无效的 ${format.toUpperCase()} 格式`;
    isUpdating.value = false;
    return;
  }

  const rgb = parseColor(value);
  if (!rgb) {
    invalidFormat.value = format;
    errorMsg.value = '无法解析此颜色';
    isUpdating.value = false;
    return;
  }

  invalidFormat.value = null;
  errorMsg.value = '';
  currentRGB.value = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
  alphaPercent.value = Math.round(rgb.a * 100);

  syncAllFromRGB(format);
  isUpdating.value = false;
}

function onColorPickerChange(hex) {
  if (isUpdating.value) return;
  isUpdating.value = true;
  const rgb = parseColor(hex);
  if (rgb) {
    currentRGB.value = { r: rgb.r, g: rgb.g, b: rgb.b, a: currentRGB.value.a };
    syncAllFromRGB();
  }
  isUpdating.value = false;
}

function onAlphaChange() {
  if (isUpdating.value) return;
  isUpdating.value = true;
  currentRGB.value = {
    ...currentRGB.value,
    a: alphaPercent.value / 100
  };
  syncAllFromRGB();
  isUpdating.value = false;
}

function syncAllFromRGB(skipFormat) {
  const rgba = currentRGB.value;
  const { a } = rgba;
  if (skipFormat !== 'hex') inputs.hex = formatHEX(rgba);
  if (skipFormat !== 'rgb') inputs.rgb = a < 1 ? formatRGBA(rgba) : formatRGB(rgba);
  if (skipFormat !== 'hsl') inputs.hsl = a < 1 ? formatHSLA(rgba) : formatHSL(rgba);
  if (skipFormat !== 'cmyk') inputs.cmyk = formatCMYK(rgba);
  if (skipFormat !== 'hsv') inputs.hsv = formatHSV(rgba);
}

function clearInputs() {
  currentRGB.value = { r: 255, g: 255, b: 255, a: 1 };
  alphaPercent.value = 100;
  invalidFormat.value = null;
  errorMsg.value = '';
  syncAllFromRGB();
}

function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, `已复制 ${label}: ${value}`, 'success');
}

let handleFavoritesChanged = null;

onMounted(() => {
  syncAllFromRGB();
  updateHeaderActions();
  handleFavoritesChanged = () => updateHeaderActions();
  window.addEventListener('color-favorites-changed', handleFavoritesChanged);
});

onUnmounted(() => {
  clearHeaderActions();
  window.removeEventListener('color-favorites-changed', handleFavoritesChanged);
});

watch(() => inputs.hex, () => {
  updateHeaderActions();
});
</script>

<template>
  <div class="module-convert">
    <Banner
      title="任输一个色值，五种格式同步转换"
      description="在 HEX / RGB / HSL / CMYK / HSV 任一格式框输入颜色，其余四栏自动同步换算结果"
      icon="icon-Areality-ColorConversion"
    />
    <div class="convert-layout">
      <!-- 左：颜色预览 -->
      <div class="col col-preview">
        <div
          class="color-preview"
          :style="{
            background: previewColor,
            color: textContrast
          }"
        >
          {{ previewColor }}
        </div>
      </div>

      <!-- 中：输入区域 -->
      <div class="col col-input">
        <div class="convert-section">
          <div class="input-row">
            <span class="input-label">HEX</span>
            <ColorPicker
              v-model="inputs.hex"
              @change="onColorPickerChange"
              @clear-all="clearInputs"
            />
            <button
              class="copy-icon-btn"
              @click="copyValue(inputs.hex, 'HEX')"
              title="复制 HEX"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>

          <div class="input-row">
            <span class="input-label">RGB</span>
            <Input
              v-model="inputs.rgb"
              :block="false"
              :flex="true"
              :clearable="false"
              :invalid="invalidFormat === 'rgb'"
              placeholder="rgb(r, g, b)"
              @input="onInputChange('rgb')"
            />
            <button
              class="copy-icon-btn"
              @click="copyValue(inputs.rgb, 'RGB')"
              title="复制 RGB"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>

          <div class="input-row">
            <span class="input-label">HSL</span>
            <Input
              v-model="inputs.hsl"
              :block="false"
              :flex="true"
              :clearable="false"
              :invalid="invalidFormat === 'hsl'"
              placeholder="hsl(h, s%, l%)"
              @input="onInputChange('hsl')"
            />
            <button
              class="copy-icon-btn"
              @click="copyValue(inputs.hsl, 'HSL')"
              title="复制 HSL"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>

          <div class="input-row">
            <span class="input-label">CMYK</span>
            <Input
              v-model="inputs.cmyk"
              :block="false"
              :flex="true"
              :clearable="false"
              :invalid="invalidFormat === 'cmyk'"
              placeholder="cmyk(c%, m%, y%, k%)"
              @input="onInputChange('cmyk')"
            />
            <button
              class="copy-icon-btn"
              @click="copyValue(inputs.cmyk, 'CMYK')"
              title="复制 CMYK"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>

          <div class="input-row">
            <span class="input-label">HSV</span>
            <Input
              v-model="inputs.hsv"
              :block="false"
              :flex="true"
              :clearable="false"
              :invalid="invalidFormat === 'hsv'"
              placeholder="hsv(h, s%, v%)"
              @input="onInputChange('hsv')"
            />
            <button
              class="copy-icon-btn"
              @click="copyValue(inputs.hsv, 'HSV')"
              title="复制 HSV"
            >
              <span class="iconfont icon-Copy"></span>
            </button>
          </div>

          <div class="alpha-row">
            <label>Alpha</label>
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="alphaPercent"
              @input="onAlphaChange"
            />
            <span class="alpha-value">{{ alphaPercent }}%</span>
          </div>

          <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.module-convert {
  width: 100%;
  min-width: 0;
}

.convert-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.5fr;
  gap: 20px;
  min-width: 0;

  .col {
    display: flex;
    flex-direction: column;
  }
}

.col-preview {
  min-width: 0;
  align-items: center;
}

.col-input {
  min-width: 0;
}

.color-preview {
  width: 100%;
  aspect-ratio: 3 / 1;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.col-preview .color-preview {
  aspect-ratio: 1 / 1;
  width: 70%;
  margin-bottom: 0;
}

.convert-section {
  margin-bottom: 20px;
}

.col-input .convert-section {
  margin-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.convert-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;

  .input-label {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 80px;
  }

  :deep(.app-input-wrap) {
    flex: 1;
    min-width: 0;
  }

  input[type="color"] {
    width: 48px;
    height: 40px;
    padding: 2px;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: var(--bg-card);
  }

  .copy-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: var(--bg-muted);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;

    .iconfont {
      font-size: 16px;
      line-height: 1;
    }

    &:hover {
      background: var(--accent);
      color: var(--text-invert);
      border-color: var(--accent);
    }
  }
}

.alpha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);

  label {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 80px;
  }

  input[type="range"] {
    flex: 1;
    accent-color: var(--accent);
  }

  .alpha-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    min-width: 40px;
    text-align: right;
    font-family: 'SF Mono', Consolas, Monaco, monospace;
  }
}

.error-message {
  color: var(--text-error);
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.08);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--text-error);
}

@media (max-width: 960px) {
  .convert-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .col-preview .color-preview {
    aspect-ratio: 3 / 1;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .input-row {
    .copy-icon-btn {
      width: 36px;
      height: 36px;
    }

    .copy-icon-btn .iconfont {
      font-size: 14px;
    }
  }
}
</style>
