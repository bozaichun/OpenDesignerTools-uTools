<template>
  <div class="module-detail">
    <!-- 空状态 -->
    <div v-if="!hasData" class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-text">没有分析数据，请先上传图片并分析</div>
      <button class="empty-action" @click="goBack">返回上传</button>
    </div>

    <!-- 分析结果内容 -->
    <div v-else>
      <!-- 图片预览 + 取色区 -->
      <div class="image-preview-section">
        <div class="image-container" ref="imageContainer">
          <canvas
            ref="canvas"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
          ></canvas>
          <div
            v-if="pickerPos"
            class="picker-indicator"
            :style="{ left: pickerPos.x + 'px', top: pickerPos.y + 'px' }"
          ></div>
        </div>
        <div class="image-tip">点击图片任意位置可获取该点颜色值</div>
      </div>

      <!-- 主色调结果 -->
      <div class="colors-result-section">
        <div class="section-header">
          <div class="section-title">图片主色调</div>
          <div class="section-subtitle">共提取 {{ mainColors.length }} 种主要颜色 · 点击色卡复制 HEX</div>
        </div>

        <div class="main-colors-grid">
          <div
            v-for="(color, idx) in mainColors"
            :key="idx"
            class="color-card"
          >
            <div
              class="color-swatch"
              :style="{ background: color.hex }"
              @click="copyValue(color.hex, 'HEX')"
            ></div>
            <div class="color-codes">
              <div class="code-row">
                <span class="code-label">HEX</span>
                <span class="code-value">{{ color.hex }}</span>
                <button class="code-copy" @click="copyValue(color.hex, 'HEX')" title="复制 HEX">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">RGB</span>
                <span class="code-value">{{ color.rgb }}</span>
                <button class="code-copy" @click="copyValue(color.rgb, 'RGB')" title="复制 RGB">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">HSL</span>
                <span class="code-value">{{ color.hsl }}</span>
                <button class="code-copy" @click="copyValue(color.hsl, 'HSL')" title="复制 HSL">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">CMYK</span>
                <span class="code-value">{{ color.cmyk || getColorFormat(color, 'cmyk') }}</span>
                <button class="code-copy" @click="copyValue(color.cmyk || getColorFormat(color, 'cmyk'), 'CMYK')" title="复制 CMYK">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">HSV</span>
                <span class="code-value">{{ color.hsv || getColorFormat(color, 'hsv') }}</span>
                <button class="code-copy" @click="copyValue(color.hsv || getColorFormat(color, 'hsv'), 'HSV')" title="复制 HSV">
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
            </div>
            <div class="color-actions">
              <button class="search-btn" @click="searchOnBaidu(color.hex)">
                <span class="iconfont icon-Copy"></span>
                百度搜索配色
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 吸管取色结果 -->
      <div v-if="pickedColor" class="picker-result-section">
        <div class="section-header">
          <div class="section-title">吸管取色结果</div>
          <div class="section-subtitle">点击图片任意位置可获取该点颜色值</div>
        </div>

        <div class="picker-result">
          <div
            class="picker-result-swatch"
            :style="{ background: pickedColor.hex }"
          ></div>
          <div class="picker-result-info">
            <div class="pr-row">
              <span class="pr-label">HEX</span>
              <span class="pr-value">{{ pickedColor.hex }}</span>
              <button class="pr-copy" @click="copyValue(pickedColor.hex, 'HEX')">复制</button>
              <button class="pr-search" @click="searchOnBaidu(pickedColor.hex)">搜索百度</button>
            </div>
            <div class="pr-row">
              <span class="pr-label">RGB</span>
              <span class="pr-value">{{ pickedColor.rgb }}</span>
              <button class="pr-copy" @click="copyValue(pickedColor.rgb, 'RGB')">复制</button>
            </div>
            <div class="pr-row">
              <span class="pr-label">HSL</span>
              <span class="pr-value">{{ pickedColor.hsl }}</span>
              <button class="pr-copy" @click="copyValue(pickedColor.hsl, 'HSL')">复制</button>
            </div>
            <div class="pr-row">
              <span class="pr-label">CMYK</span>
              <span class="pr-value">{{ pickedColor.cmyk }}</span>
              <button class="pr-copy" @click="copyValue(pickedColor.cmyk, 'CMYK')">复制</button>
            </div>
            <div class="pr-row">
              <span class="pr-label">HSV</span>
              <span class="pr-value">{{ pickedColor.hsv }}</span>
              <button class="pr-copy" @click="copyValue(pickedColor.hsv, 'HSV')">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../../utils/colorUtils';

const STORAGE_KEY = 'imageAnalysisData';

export default {
  name: 'ImageColorSamplingDetail',
  data() {
    return {
      imageSrc: null,
      imageNaturalWidth: 0,
      imageNaturalHeight: 0,
      imageData: null,
      mainColors: [],
      pickedColor: null,
      pickerPos: null
    };
  },
  computed: {
    hasData() {
      return this.imageSrc && this.mainColors.length > 0;
    }
  },
  mounted() {
    this.loadAnalysisData();
  },
  methods: {
    loadAnalysisData() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
          console.warn('没有找到分析数据');
          return;
        }
        const data = JSON.parse(raw);
        this.imageSrc = data.imageSrc;
        this.imageNaturalWidth = data.imageNaturalWidth;
        this.imageNaturalHeight = data.imageNaturalHeight;
        this.mainColors = data.mainColors || [];

        // 渲染 canvas 以支持取色
        this.$nextTick(() => {
          this.renderCanvas();
        });
      } catch (err) {
        console.error('读取分析数据失败', err);
        showToast(this, '数据读取失败', 'error');
      }
    },

    renderCanvas() {
      if (!this.imageSrc) return;
      const self = this;
      const img = new Image();
      img.onload = function() {
        const canvas = self.$refs.canvas;
        if (!canvas) return;
        const width = self.imageNaturalWidth || img.width;
        const height = self.imageNaturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;
        self.imageNaturalWidth = width;
        self.imageNaturalHeight = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        self.imageData = ctx.getImageData(0, 0, width, height);
      };
      img.src = this.imageSrc;
    },

    handleCanvasMove(e) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.pickerPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    },

    getPixelAt(x, y) {
      if (!this.imageData) return null;
      const data = this.imageData.data;
      const idx = (y * this.imageNaturalWidth + x) * 4;
      return {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3] / 255
      };
    },

    handleCanvasClick(e) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = this.imageNaturalWidth / rect.width;
      const scaleY = this.imageNaturalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const pixel = this.getPixelAt(x, y);
      if (pixel) {
        const rgba = { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };
        const hex = formatHEX(rgba);
        this.pickedColor = {
          hex,
          rgb: formatRGB(rgba),
          hsl: formatHSL(rgba),
          cmyk: formatCMYK(rgba),
          hsv: formatHSV(rgba)
        };
        showToast(this, '已获取颜色: ' + hex, 'success');
      }
    },

    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
    },

    getColorFormat(color, type) {
      if (!color || !color.hex) return '';
      const h = color.hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const rgba = { r, g, b, a: 1 };
      if (type === 'cmyk') return formatCMYK(rgba);
      if (type === 'hsv') return formatHSV(rgba);
      return '';
    },

    searchOnBaidu(hex) {
      const query = encodeURIComponent(hex + ' 颜色 配色方案 色彩搭配');
      const url = 'https://www.baidu.com/s?wd=' + query;
      if (window.utools && typeof window.utools.shellOpenExternal === 'function') {
        window.utools.shellOpenExternal(url);
      } else {
        window.open(url, '_blank');
      }
      showToast(this, '正在搜索 ' + hex + ' 的配色方案', 'success');
    },

    goBack() {
      this.$router.push('/ImageColorSampling');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-detail {
  width: 100%;
  min-width: 0;
}

/* ============ 空状态 ============ */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.empty-action {
  padding: 10px 24px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.88;
  }
}

/* ============ 图片预览区 ============ */
.image-preview-section {
  margin-bottom: 24px;
}

.image-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-primary);
  background:
    linear-gradient(45deg, var(--bg-muted) 25%, transparent 25%),
    linear-gradient(-45deg, var(--bg-muted) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--bg-muted) 75%),
    linear-gradient(-45deg, transparent 75%, var(--bg-muted) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, 10px 0;
  cursor: crosshair;

  canvas {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

.image-tip {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 10px;
}

.picker-indicator {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
}

/* ============ 结果通用样式 ============ */
.colors-result-section,
.picker-result-section {
  margin-top: 24px;
}

.section-header {
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* ============ 主色调卡片网格 ============ */
.main-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.color-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
    transform: translateY(-2px);
  }
}

.color-swatch {
  width: 100%;
  aspect-ratio: 2 / 1;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
}

.color-codes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.code-label {
  color: var(--text-tertiary);
  width: 38px;
  flex-shrink: 0;
}

.code-value {
  flex: 1;
  color: var(--text-primary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-copy {
  width: 22px;
  height: 22px;
  padding: 0;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);

    .iconfont {
      color: var(--text-invert);
    }
  }
}

.color-actions {
  padding-top: 10px;
  border-top: 1px dashed var(--border-primary);
}

.search-btn {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 12px;
  }

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

/* ============ 吸管取色结果 ============ */
.picker-result {
  display: flex;
  gap: 18px;
  padding: 18px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.picker-result-swatch {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
}

.picker-result-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.pr-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.pr-label {
  color: var(--text-tertiary);
  width: 44px;
  flex-shrink: 0;
  font-weight: 500;
}

.pr-value {
  flex: 1;
  color: var(--text-primary);
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pr-copy,
.pr-search {
  padding: 4px 12px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-invert);
  }
}

.pr-search {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
  }
}

/* ============ 响应式 ============ */
@media (max-width: 640px) {
  .main-colors-grid {
    grid-template-columns: 1fr;
  }

  .picker-result {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .picker-result-swatch {
    width: 100%;
    height: 80px;
    aspect-ratio: 4 / 1;
  }
}
</style>
