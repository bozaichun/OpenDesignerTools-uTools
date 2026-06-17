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
      <div class="upload-icon">🖼️</div>
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

    <!-- 如果有图片：显示预览 + 取色 -->
    <div v-if="imageLoaded" class="image-display-area">
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

      <!-- 主色调 -->
      <div class="extracted-colors">
        <div class="section-label">图片主色调 (自动提取)</div>
        <div v-if="mainColors.length > 0" class="main-colors-grid">
          <div
            v-for="(color, idx) in mainColors"
            :key="idx"
            class="main-color-card"
          >
            <div
              class="mc-swatch"
              :style="{ background: color.hex }"
              @click="copyValue(color.hex, 'HEX')"
            ></div>
            <div class="mc-hex">{{ color.hex }}</div>
            <button class="mc-copy-btn" @click="copyValue(color.hex, 'HEX')">
              复制
            </button>
          </div>
        </div>
        <div v-else class="empty-state" style="padding: 20px;">
          正在分析图片...
        </div>
      </div>

      <!-- 吸管取色结果 -->
      <div v-if="pickedColor" class="extracted-colors">
        <div class="section-label">吸管取色结果</div>
        <div class="picker-result">
          <div
            class="picker-result-swatch"
            :style="{ background: pickedColor.hex }"
          ></div>
          <div class="picker-result-info">
            <div class="pr-hex">{{ pickedColor.hex }}</div>
            <div class="pr-detail">RGB: {{ pickedColor.rgb }}</div>
            <div class="pr-detail">HSL: {{ pickedColor.hsl }}</div>
            <div class="pr-detail" style="margin-top: 8px;">
              <button class="copy-btn" @click="copyValue(pickedColor.hex, 'HEX')" style="padding: 4px 10px; font-size: 11px;">复制 HEX</button>
              <button class="copy-btn" @click="copyValue(pickedColor.rgb, 'RGB')" style="padding: 4px 10px; font-size: 11px; margin-left: 6px;">复制 RGB</button>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <button @click="clearImage" class="clear-btn">重新选择图片</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatHEX, formatRGB, formatHSL, copyToClipboard, showToast
} from '../utils/colorUtils';

export default {
  name: 'ModuleImage',
  data() {
    return {
      imageLoaded: false,
      isDragging: false,
      imageData: null,
      mainColors: [],
      pickedColor: null,
      pickerPos: null,
      imageNaturalWidth: 0,
      imageNaturalHeight: 0
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.renderCanvas(img);
          this.imageLoaded = true;
          this.pickedColor = null;
          this.pickerPos = null;
          // 延迟执行颜色分析
          this.$nextTick(() => {
            this.extractMainColors();
          });
        };
        img.onerror = () => {
          showToast(this, '图片加载失败', 'error');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    renderCanvas(img) {
      const canvas = this.$refs.canvas;
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
      const rect = this.$refs.canvas.getBoundingClientRect();
      const scaleX = this.imageNaturalWidth / rect.width;
      const scaleY = this.imageNaturalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      this.pickerPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    },

    handleCanvasClick(e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      const scaleX = this.imageNaturalWidth / rect.width;
      const scaleY = this.imageNaturalHeight / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const pixel = this.getPixelAt(x, y);
      if (pixel) {
        const hex = formatHEX({ r: pixel.r, g: pixel.g, b: pixel.b });
        this.pickedColor = {
          hex,
          rgb: formatRGB({ r: pixel.r, g: pixel.g, b: pixel.b }),
          hsl: formatHSL({ r: pixel.r, g: pixel.g, b: pixel.b })
        };
        showToast(this, '已获取颜色: ' + hex, 'success');
      }
    },

    // K-means 简化版主色调提取
    extractMainColors() {
      if (!this.imageData) {
        this.mainColors = [];
        return;
      }

      try {
        const data = this.imageData.data;
        const step = 5; // 采样步长，加速计算
        const buckets = {};

        // 采样 + 分桶（简化量化）
        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // 跳过透明像素
          if (a < 50) continue;

          // 量化到 32 的倍数以减少颜色数
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;
          if (!buckets[key]) {
            buckets[key] = { sum: [r, g, b], count: 0 };
          }
          buckets[key].sum[0] += r;
          buckets[key].sum[1] += g;
          buckets[key].sum[2] += b;
          buckets[key].count++;
        }

        // 按计数排序，取前 6 个
        const sorted = Object.entries(buckets)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 6);

        const results = sorted.map(([, data]) => {
          const avgR = Math.round(data.sum[0] / data.count);
          const avgG = Math.round(data.sum[1] / data.count);
          const avgB = Math.round(data.sum[2] / data.count);
          return {
            hex: formatHEX({ r: avgR, g: avgG, b: avgB }),
            r: avgR, g: avgG, b: avgB
          };
        });

        // 去重（相似色合并）
        const unique = [];
        for (const c of results) {
          const isSimilar = unique.some(u => {
            return Math.abs(u.r - c.r) < 30 && Math.abs(u.g - c.g) < 30 && Math.abs(u.b - c.b) < 30;
          });
          if (!isSimilar) unique.push(c);
        }

        this.mainColors = unique.slice(0, 6);
      } catch (err) {
        console.error('主色调提取失败', err);
        this.mainColors = [];
      }
    },

    clearImage() {
      this.imageLoaded = false;
      this.mainColors = [];
      this.pickedColor = null;
      this.pickerPos = null;
      this.imageData = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },

    copyValue(value, label) {
      copyToClipboard(value);
      showToast(this, `已复制 ${label}: ${value}`, 'success');
    }
  }
};
</script>

<style lang="scss" scoped>
.module-image {
  width: 100%;
  min-width: 0;
}

.upload-area {
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-muted);
  margin-bottom: 20px;

  &:hover,
  &.dragging {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
}

.upload-icon {
  font-size: 42px;
  margin-bottom: 12px;
  line-height: 1;
}

.upload-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.image-display-area {
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
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

.extracted-colors {
  margin-top: 20px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  margin: 16px 0 10px 0;
  color: var(--text-primary);
}

.main-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.main-color-card {
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 10px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .mc-swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    border: 1px solid var(--border-primary);
    cursor: pointer;
  }

  .mc-hex {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'SF Mono', Consolas, Monaco, monospace;
    margin-bottom: 4px;
    word-break: break-all;
  }

  .mc-copy-btn {
    padding: 4px 10px;
    font-size: 11px;
    background: var(--accent);
    color: var(--text-invert);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    cursor: pointer;
    width: 100%;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
}

.picker-result {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.picker-result-swatch {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-strong);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.picker-result-info {
  flex: 1;
  min-width: 0;

  .pr-hex {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: 'SF Mono', Consolas, Monaco, monospace;
    margin-bottom: 4px;
  }

  .pr-detail {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 2px 0;
  }

  button {
    padding: 4px 10px;
    font-size: 11px;
    background: var(--accent);
    color: var(--text-invert);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
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

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 640px) {
  .upload-area {
    padding: 30px 16px;
  }

  .picker-result {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .picker-result-swatch {
    width: 100%;
    height: 60px;
  }
}
</style>
