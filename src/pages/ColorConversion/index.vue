<script lang="ts" setup>
import { ref, reactive, computed, inject, onMounted, onUnmounted } from 'vue';
import ColorPicker from '../../components/ColorPicker.vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import Input from '../../components/Input.vue';
import Banner from '../../components/Banner.vue';
import {
  detectColorFormat, parseColor, formatRGBA, formatHSLA,
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../../utils/colorUtils';

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

const alphaSliderStyle = computed(() => {
  const { r, g, b } = currentRGB.value;
  return {
    background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgb(${r}, ${g}, ${b}))`
  };
});

function handleInputChange(format) {
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

function handleColorPickerChange(hex) {
  if (isUpdating.value) return;
  isUpdating.value = true;
  const rgb = parseColor(hex);
  if (rgb) {
    currentRGB.value = { r: rgb.r, g: rgb.g, b: rgb.b, a: currentRGB.value.a };
    syncAllFromRGB();
  }
  isUpdating.value = false;
}

function handleAlphaChange() {
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

onMounted(() => {
  syncAllFromRGB();
  clearHeaderActions();
});

onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-convert">
    <Banner
      mode="url"
      image-url="https://zblogphp-serverless-code-ap-beijing-1304983928.cos.ap-beijing.myqcloud.com/banner/icon/ColorConversion.png"
      title="任输一个色值，五种格式同步转换"
      description="在 HEX / RGB / HSL / CMYK / HSV 任一格式框输入颜色，其余四栏自动同步换算结果"
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
              @change="handleColorPickerChange"
              @clear-all="clearInputs"
            />
            <ColorActionGroup
              :value="inputs.hex"
              copy-label="HEX"
              :favorite-name="inputs.hex"
              variant="default"
              class="input-action-group"
            />
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
              @input="handleInputChange('rgb')"
            />
            <ColorActionGroup
              :value="inputs.rgb"
              copy-label="RGB"
              :show-favorite="false"
              variant="default"
              class="input-action-group"
            />
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
              @input="handleInputChange('hsl')"
            />
            <ColorActionGroup
              :value="inputs.hsl"
              copy-label="HSL"
              :show-favorite="false"
              variant="default"
              class="input-action-group"
            />
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
              @input="handleInputChange('cmyk')"
            />
            <ColorActionGroup
              :value="inputs.cmyk"
              copy-label="CMYK"
              :show-favorite="false"
              variant="default"
              class="input-action-group"
            />
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
              @input="handleInputChange('hsv')"
            />
            <ColorActionGroup
              :value="inputs.hsv"
              copy-label="HSV"
              :show-favorite="false"
              variant="default"
              class="input-action-group"
            />
          </div>

          <div class="alpha-row">
            <label>Alpha</label>
            <div class="alpha-slider-wrap">
              <input
                type="range"
                class="alpha-slider"
                min="0"
                max="100"
                v-model.number="alphaPercent"
                :style="alphaSliderStyle"
                @input="handleAlphaChange"
              />
            </div>
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

  :deep(.color-picker) {
    flex: 1;
    min-width: 0;
  }
}

.input-action-group {
  flex-shrink: 0;

  :deep(.copy-icon-btn),
  :deep(.color-action-group__favorite.favorite-btn) {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);

    .iconfont,
    .favorite-icon {
      font-size: 16px;
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
    flex-shrink: 0;
  }

  .alpha-slider-wrap {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    height: 24px;
    padding: 0 2px;
    overflow: visible;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 10px;
      border-radius: 999px;
      border: 1px solid var(--border-primary);
      background-color: #fff;
      background-image:
        linear-gradient(45deg, #ddd 25%, transparent 25%),
        linear-gradient(-45deg, #ddd 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ddd 75%),
        linear-gradient(-45deg, transparent 75%, #ddd 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
      pointer-events: none;
      z-index: 0;
    }
  }

  .alpha-slider {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 10px;
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    border-radius: 999px;
    outline: none;
    cursor: pointer;
    display: block;
    background: transparent;

    &::-webkit-slider-runnable-track {
      height: 10px;
      border-radius: 999px;
      background: transparent;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      margin-top: -3px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      background: var(--accent);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      cursor: pointer;
    }

    &::-moz-range-track {
      height: 10px;
      border-radius: 999px;
      background: transparent;
      border: none;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      background: var(--accent);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      cursor: pointer;
    }
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
  background: var(--error-bg);
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
  .input-action-group {
    :deep(.copy-icon-btn),
    :deep(.color-action-group__favorite.favorite-btn) {
      width: 36px;
      height: 36px;

      .iconfont,
      .favorite-icon {
        font-size: 14px;
      }
    }
  }
}
</style>
