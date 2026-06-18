<template>
  <div class="module-convert">
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
            <input
              type="text"
              v-model="inputs.hex"
              @input="onInputChange('hex')"
              :class="{ invalid: invalidFormat === 'hex' }"
              placeholder="#RRGGBB 或 #RGB"
            />
            <input
              type="color"
              :value="inputs.hex || '#ffffff'"
              @input="onColorPicker"
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
            <input
              type="text"
              v-model="inputs.rgb"
              @input="onInputChange('rgb')"
              :class="{ invalid: invalidFormat === 'rgb' }"
              placeholder="rgb(r, g, b)"
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
            <input
              type="text"
              v-model="inputs.hsl"
              @input="onInputChange('hsl')"
              :class="{ invalid: invalidFormat === 'hsl' }"
              placeholder="hsl(h, s%, l%)"
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
            <input
              type="text"
              v-model="inputs.cmyk"
              @input="onInputChange('cmyk')"
              :class="{ invalid: invalidFormat === 'cmyk' }"
              placeholder="cmyk(c%, m%, y%, k%)"
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
            <input
              type="text"
              v-model="inputs.hsv"
              @input="onInputChange('hsv')"
              :class="{ invalid: invalidFormat === 'hsv' }"
              placeholder="hsv(h, s%, v%)"
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

          <div class="action-row">
            <button @click="clearInputs" class="clear-btn">清空输入</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {
  detectColorFormat, parseColor, formatRGBA, formatHSLA,
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../utils/colorUtils';

export default {
  name: 'ModuleConvert',
  data() {
    return {
      currentRGB: { r: 255, g: 255, b: 255, a: 1 },
      inputs: {
        hex: '#FFFFFF',
        rgb: 'rgb(255, 255, 255)',
        hsl: 'hsl(0, 0%, 100%)',
        cmyk: 'cmyk(0%, 0%, 0%, 0%)',
        hsv: 'hsv(0, 0%, 100%)'
      },
      alphaPercent: 100,
      invalidFormat: null,
      errorMsg: '',
      isUpdating: false
    };
  },
  computed: {
    previewColor() {
      const { r, g, b, a } = this.currentRGB;
      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
      }
      return formatHEX({ r, g, b });
    },
    textContrast() {
      const { r, g, b } = this.currentRGB;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    }
  },
  mounted() {
    this.syncAllFromRGB();
  },
  methods: {
    onInputChange(format) {
      if (this.isUpdating) return;
      this.isUpdating = true;

      const value = this.inputs[format].trim();
      if (!value) {
        this.invalidFormat = null;
        this.errorMsg = '';
        this.isUpdating = false;
        return;
      }

      const detected = detectColorFormat(value);
      // 统一为小写比较（支持 RGB/RGBA 视为同一种）
      const detectedFmt = detected ? detected.toLowerCase() : null;
      const normalizedFmt = (format === 'rgb' && detectedFmt === 'rgba') || (format === 'rgba' && detectedFmt === 'rgb')
        ? format
        : detectedFmt;
      if (!detected || normalizedFmt !== format) {
        this.invalidFormat = format;
        this.errorMsg = `无效的 ${format.toUpperCase()} 格式`;
        this.isUpdating = false;
        return;
      }

      const rgb = parseColor(value);
      if (!rgb) {
        this.invalidFormat = format;
        this.errorMsg = '无法解析此颜色';
        this.isUpdating = false;
        return;
      }

      this.invalidFormat = null;
      this.errorMsg = '';
      this.currentRGB = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
      this.alphaPercent = Math.round(rgb.a * 100);

      // 更新所有其他格式的输入框
      this.syncAllFromRGB(format);
      this.isUpdating = false;
    },

    onColorPicker(e) {
      const hex = e.target.value;
      if (this.isUpdating) return;
      this.isUpdating = true;
      const rgb = parseColor(hex);
      if (rgb) {
        this.currentRGB = { r: rgb.r, g: rgb.g, b: rgb.b, a: this.currentRGB.a };
        this.syncAllFromRGB();
      }
      this.isUpdating = false;
    },

    onAlphaChange() {
      if (this.isUpdating) return;
      this.isUpdating = true;
      this.currentRGB = {
        ...this.currentRGB,
        a: this.alphaPercent / 100
      };
      this.syncAllFromRGB();
      this.isUpdating = false;
    },

    syncAllFromRGB(skipFormat) {
      const rgba = this.currentRGB;
      const { a } = rgba;
      if (skipFormat !== 'hex') this.inputs.hex = formatHEX(rgba);
      if (skipFormat !== 'rgb') this.inputs.rgb = a < 1 ? formatRGBA(rgba) : formatRGB(rgba);
      if (skipFormat !== 'hsl') this.inputs.hsl = a < 1 ? formatHSLA(rgba) : formatHSL(rgba);
      if (skipFormat !== 'cmyk') this.inputs.cmyk = formatCMYK(rgba);
      if (skipFormat !== 'hsv') this.inputs.hsv = formatHSV(rgba);
    },

    clearInputs() {
      this.currentRGB = { r: 255, g: 255, b: 255, a: 1 };
      this.alphaPercent = 100;
      this.invalidFormat = null;
      this.errorMsg = '';
      this.syncAllFromRGB();
    },

    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, `已复制 ${label}: ${value}`, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-convert {
  width: 100%;
  min-width: 0;
}

.convert-layout {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 20px;
  min-width: 0;

  .col {
    display: flex;
    flex-direction: column;
  }
}

.col-preview {
  min-width: 0;
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
  aspect-ratio: 1 / 1.3;
  width: 100%;
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

  input[type="text"] {
    background: var(--bg-input);
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s ease;
    flex: 1;

    &:focus {
      border-color: var(--border-focus);
    }

    &.invalid {
      border-color: var(--text-error);
    }
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

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.clear-btn {
  padding: 8px 16px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

@media (max-width: 960px) {
  .convert-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .col-preview .color-preview {
    aspect-ratio: 3 / 1;
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
