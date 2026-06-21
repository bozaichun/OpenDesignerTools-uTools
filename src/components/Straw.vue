<template>
  <div class="straw-container" ref="imageContainer">
    <canvas
      ref="canvas"
      @click="handleCanvasClick"
      @mousemove="handleCanvasMove"
      @mouseleave="handleCanvasLeave"
    ></canvas>
    <div
      v-if="pickerPos"
      class="picker-indicator"
      :style="{ left: pickerPos.x + 'px', top: pickerPos.y + 'px' }"
    ></div>

    <!-- 放大镜：右下角悬浮 -->
    <div v-if="pickerPos && hoverColor" class="magnifier">
      <div class="magnifier-title">放大镜预览</div>
      <canvas ref="magnifierCanvas" class="magnifier-canvas"></canvas>
      <div class="magnifier-color">
        <div
          class="magnifier-swatch"
          :style="{ background: hoverColor.hex }"
        ></div>
        <span class="magnifier-hex">{{ hoverColor.hex }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  showToast
} from '../utils/colorUtils';

const MAGNIFIER_SIZE = 140;
const MAGNIFIER_ZOOM = 8;

export default {
  name: 'Straw',
  props: {
    imageSrc: {
      type: String,
      required: true
    },
    naturalWidth: {
      type: Number,
      default: 0
    },
    naturalHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      pickerPos: null,
      imageData: null,
      hoverColor: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.renderCanvas();
    });
  },
  watch: {
    imageSrc() {
      this.$nextTick(() => {
        this.renderCanvas();
      });
    }
  },
  methods: {
    renderCanvas() {
      if (!this.imageSrc) return;
      const self = this;
      const img = new Image();
      img.onload = function() {
        const canvas = self.$refs.canvas;
        if (!canvas) return;
        const width = self.naturalWidth || img.width;
        const height = self.naturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        self.imageData = ctx.getImageData(0, 0, width, height);
      };
      img.src = this.imageSrc;
    },

    handleCanvasLeave() {
      this.pickerPos = null;
      this.hoverColor = null;
    },

    handleCanvasMove(e) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const displayX = e.clientX - rect.left;
      const displayY = e.clientY - rect.top;
      this.pickerPos = { x: displayX, y: displayY };

      // 计算实际图片中的像素坐标
      const scaleX = this.imageData ? canvas.width / rect.width : 1;
      const scaleY = this.imageData ? canvas.height / rect.height : 1;
      const naturalX = Math.floor(displayX * scaleX);
      const naturalY = Math.floor(displayY * scaleY);

      // 取色
      const pixel = this.getPixelAt(naturalX, naturalY);
      if (pixel) {
        const rgba = { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };
        this.hoverColor = { hex: formatHEX(rgba) };
        this.renderMagnifier(naturalX, naturalY);
      }
    },

    renderMagnifier(naturalX, naturalY) {
      const magCanvas = this.$refs.magnifierCanvas;
      if (!magCanvas || !this.imageData) return;
      if (magCanvas.width !== MAGNIFIER_SIZE) {
        magCanvas.width = MAGNIFIER_SIZE;
        magCanvas.height = MAGNIFIER_SIZE;
      }
      const magCtx = magCanvas.getContext('2d');
      const halfSrc = Math.floor((MAGNIFIER_SIZE / MAGNIFIER_ZOOM) / 2);

      // 先清空
      magCtx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

      // 从源 canvas 复制一块区域并放大
      const srcX = Math.max(0, Math.min(this.imageData.width - halfSrc * 2, naturalX - halfSrc));
      const srcY = Math.max(0, Math.min(this.imageData.height - halfSrc * 2, naturalY - halfSrc));
      const srcSize = halfSrc * 2;

      // 通过离屏 canvas 缩放绘制像素块
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = srcSize;
      srcCanvas.height = srcSize;
      const srcCtx = srcCanvas.getContext('2d');
      const srcImageData = srcCtx.createImageData(srcSize, srcSize);

      for (let y = 0; y < srcSize; y++) {
        for (let x = 0; x < srcSize; x++) {
          const srcIdx = ((srcY + y) * this.imageData.width + (srcX + x)) * 4;
          const dstIdx = (y * srcSize + x) * 4;
          srcImageData.data[dstIdx] = this.imageData.data[srcIdx];
          srcImageData.data[dstIdx + 1] = this.imageData.data[srcIdx + 1];
          srcImageData.data[dstIdx + 2] = this.imageData.data[srcIdx + 2];
          srcImageData.data[dstIdx + 3] = this.imageData.data[srcIdx + 3];
        }
      }
      srcCtx.putImageData(srcImageData, 0, 0);

      // 禁用平滑以获得清晰像素感
      magCtx.imageSmoothingEnabled = false;
      magCtx.drawImage(srcCanvas, 0, 0, srcSize, srcSize, 0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

      // 绘制十字准心（中心像素位置）
      const centerOffsetX = (naturalX - srcX) / srcSize * MAGNIFIER_SIZE;
      const centerOffsetY = (naturalY - srcY) / srcSize * MAGNIFIER_SIZE;
      const cx = Math.floor(centerOffsetX) + 0.5;
      const cy = Math.floor(centerOffsetY) + 0.5;

      magCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      magCtx.lineWidth = 2;
      magCtx.beginPath();
      magCtx.moveTo(cx - 10, cy);
      magCtx.lineTo(cx + 10, cy);
      magCtx.moveTo(cx, cy - 10);
      magCtx.lineTo(cx, cy + 10);
      magCtx.stroke();

      magCtx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      magCtx.lineWidth = 1;
      magCtx.beginPath();
      magCtx.moveTo(cx - 10, cy);
      magCtx.lineTo(cx + 10, cy);
      magCtx.moveTo(cx, cy - 10);
      magCtx.lineTo(cx, cy + 10);
      magCtx.stroke();
    },

    getPixelAt(x, y) {
      if (!this.imageData) return null;
      const data = this.imageData.data;
      const width = this.imageData.width;
      const idx = (y * width + x) * 4;
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
      const scaleX = this.imageData ? canvas.width / rect.width : 1;
      const scaleY = this.imageData ? canvas.height / rect.height : 1;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const pixel = this.getPixelAt(x, y);
      if (pixel) {
        const rgba = { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };
        const hex = formatHEX(rgba);
        const colorInfo = {
          hex,
          rgb: formatRGB(rgba),
          hsl: formatHSL(rgba),
          cmyk: formatCMYK(rgba),
          hsv: formatHSV(rgba)
        };
        this.$emit('pick', colorInfo);
        showToast(this, '已获取颜色: ' + hex, 'success');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.straw-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border-radius: var(--radius-md);
  overflow: visible;
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
    border-radius: var(--radius-md);
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
  z-index: 5;
}

/* 放大镜 */
.magnifier {
  position: absolute;
  right: -180px;
  bottom: 0;
  width: 160px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 10px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.magnifier-title {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  font-weight: 500;
}

.magnifier-canvas {
  width: 140px;
  height: 140px;
  display: block;
  margin: 0 auto;
  background: #111;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  image-rendering: pixelated;
}

.magnifier-color {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-muted);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.magnifier-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.magnifier-hex {
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

@media (max-width: 900px) {
  .magnifier {
    right: 10px;
    bottom: 10px;
  }
}
</style>
