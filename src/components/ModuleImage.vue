<template>
  <div class="module-image">
    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ dragging: isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">
        <span class="iconfont icon-Areality-ModeSwitching"></span>
      </div>
      <div class="upload-text">点击选择图片，或拖拽图片到此处</div>
      <div class="upload-hint">支持 PNG / JPG / WEBP / GIF</div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="handleFileSelect"
      />
    </div>

    <!-- 图片展示与分析结果 -->
    <div v-if="imageLoaded" class="image-display-area">
      <!-- 图片预览区域 -->
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
        <div class="image-actions">
          <button class="action-btn" @click="analyzeImage">
            <span class="iconfont icon-Areality-ModeSwitching"></span>
            一键分析
          </button>
          <button class="action-btn secondary" @click="clearImage">
            重新选择
          </button>
        </div>
      </div>

      <!-- 分析中状态 -->
      <div v-if="isAnalyzing" class="analyzing-state">
        <div class="spinner"></div>
        <div class="analyzing-text">正在分析图片中的颜色...</div>
      </div>

      <!-- 主色调分析结果 -->
      <div v-if="!isAnalyzing && mainColors.length > 0" class="colors-result-section">
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
                  <span class="iconfont icon-Success"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">RGB</span>
                <span class="code-value">{{ color.rgb }}</span>
                <button class="code-copy" @click="copyValue(color.rgb, 'RGB')" title="复制 RGB">
                  <span class="iconfont icon-Success"></span>
                </button>
              </div>
              <div class="code-row">
                <span class="code-label">HSL</span>
                <span class="code-value">{{ color.hsl }}</span>
                <button class="code-copy" @click="copyValue(color.hsl, 'HSL')" title="复制 HSL">
                  <span class="iconfont icon-Success"></span>
                </button>
              </div>
            </div>
            <div class="color-actions">
              <button class="search-btn" @click="searchOnBaidu(color.hex)">
                <span class="iconfont icon-Success"></span>
                百度搜索配色
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 吸管取色结果 -->
      <div v-if="pickedColor && !isAnalyzing" class="picker-result-section">
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

      <!-- 没有颜色结果 -->
      <div v-if="!isAnalyzing && mainColors.length === 0 && !pickedColor" class="empty-state">
        <div class="empty-icon">🎨</div>
        <div class="empty-text">暂未提取到颜色，请确保图片包含可见颜色</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../utils/colorUtils';

export default {
  name: 'ModuleImage',
  data() {
    return {
      imageLoaded: false,
      isDragging: false,
      isAnalyzing: false,
      imageData: null,
      mainColors: [],
      pickedColor: null,
      pickerPos: null,
      imageNaturalWidth: 0,
      imageNaturalHeight: 0,
      imageSrc: null
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) this.loadImage(file);
    },

    handleDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file);
      } else {
        showToast(this, '请拖入图片文件', 'error');
      }
    },

    loadImage(file) {
      const self = this;
      this.isAnalyzing = true;
      this.mainColors = [];
      this.pickedColor = null;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          self.imageSrc = e.target.result;
          self.imageLoaded = true;
          self.$nextTick(function() {
            self.renderCanvas(img);
            self.extractMainColors();
          });
        };
        img.onerror = function() {
          showToast(self, '图片加载失败', 'error');
          self.isAnalyzing = false;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    renderCanvas(img) {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.warn('renderCanvas: canvas ref not found');
        return;
      }
      const maxSize = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      this.imageNaturalWidth = width;
      this.imageNaturalHeight = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      this.imageData = ctx.getImageData(0, 0, width, height);
    },

    analyzeImage() {
      if (!this.imageData) {
        showToast(this, '请先上传图片', 'error');
        return;
      }
      this.isAnalyzing = true;
      this.mainColors = [];
      const self = this;
      this.$nextTick(function() {
        setTimeout(function() {
          self.extractMainColors();
        }, 100);
      });
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

    handleCanvasMove(e) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.pickerPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
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

    // 主色调提取：采样 + 量化 + 分桶
    extractMainColors() {
      if (!this.imageData) {
        this.mainColors = [];
        this.isAnalyzing = false;
        return;
      }

      try {
        const data = this.imageData.data;
        const step = 4;
        const buckets = {};
        const sampleRgb = {};

        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 50) continue;

          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = qr + ',' + qg + ',' + qb;

          if (!buckets[key]) {
            buckets[key] = { sumR: 0, sumG: 0, sumB: 0, count: 0 };
          }
          buckets[key].sumR += r;
          buckets[key].sumG += g;
          buckets[key].sumB += b;
          buckets[key].count++;
        }

        const sorted = Object.entries(buckets)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 12);

        const results = sorted.map(([, d]) => {
          const avgR = Math.round(d.sumR / d.count);
          const avgG = Math.round(d.sumG / d.count);
          const avgB = Math.round(d.sumB / d.count);
          return { r: avgR, g: avgG, b: avgB };
        });

        const unique = [];
        for (let i = 0; i < results.length; i++) {
          const c = results[i];
          let isSimilar = false;
          for (let j = 0; j < unique.length; j++) {
            const u = unique[j];
            if (Math.abs(u.r - c.r) < 30 && Math.abs(u.g - c.g) < 30 && Math.abs(u.b - c.b) < 30) {
              isSimilar = true;
              break;
            }
          }
          if (!isSimilar) unique.push(c);
        }

        this.mainColors = unique.slice(0, 8).map(c => {
          const rgba = { r: c.r, g: c.g, b: c.b, a: 1 };
          return {
            hex: formatHEX(rgba),
            rgb: formatRGB(rgba),
            hsl: formatHSL(rgba)
          };
        });

        showToast(this, '分析完成，共提取 ' + this.mainColors.length + ' 种颜色', 'success');
      } catch (err) {
        console.error('主色调提取失败', err);
        this.mainColors = [];
        showToast(this, '颜色提取失败', 'error');
      } finally {
        this.isAnalyzing = false;
      }
    },

    clearImage() {
      this.imageLoaded = false;
      this.mainColors = [];
      this.pickedColor = null;
      this.pickerPos = null;
      this.imageData = null;
      this.imageSrc = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },

    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, '已复制 ' + label + ': ' + value, 'success');
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
    }
  }
};
</script>

<style lang="scss" scoped>
.module-image {
  width: 100%;
  min-width: 0;
}

/* =============== 上传区域 =============== */
.upload-area {
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 48px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-muted);
  margin-bottom: 20px;

  &:hover,
  &.dragging {
    border-color: var(--accent);
    background: var(--accent-soft);
    transform: scale(1.01);
  }
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  line-height: 1;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;

  .iconfont {
    font-size: 56px;
  }
}

.upload-text {
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* =============== 图片展示区 =============== */
.image-display-area {
  margin-bottom: 20px;
}

.image-preview-section {
  margin-bottom: 20px;
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

.image-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 16px;
  }

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }

  &.secondary {
    background: var(--bg-muted);
    color: var(--text-secondary);
    border-color: var(--border-primary);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }
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

/* =============== 分析中状态 =============== */
.analyzing-state {
  text-align: center;
  padding: 30px 20px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  margin: 16px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--accent);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analyzing-text {
  font-size: 13px;
  color: var(--text-secondary);
}

/* =============== 分析结果 =============== */
.colors-result-section,
.picker-result-section {
  margin-top: 20px;
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

/* =============== 吸管取色结果 =============== */
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

/* =============== 空状态 =============== */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  margin-top: 16px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* =============== 响应式 =============== */
@media (max-width: 640px) {
  .upload-area {
    padding: 32px 16px;
  }

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
