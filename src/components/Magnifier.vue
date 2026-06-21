<template>
  <div class="magnifier">
    <div class="magnifier-title">放大镜预览</div>
    <canvas ref="magnifierCanvas" class="magnifier-canvas"></canvas>
    <div class="magnifier-color">
      <div
        class="magnifier-swatch"
        :style="{ background: hexColor }"
      ></div>
      <span class="magnifier-hex">{{ hexColor }}</span>
    </div>
  </div>
</template>

<script>
const MAGNIFIER_SIZE = 140;
const MAGNIFIER_ZOOM = 8;

export default {
  name: 'Magnifier',
  props: {
    imageData: {
      type: Object,
      required: true
    },
    naturalX: {
      type: Number,
      default: 0
    },
    naturalY: {
      type: Number,
      default: 0
    },
    hexColor: {
      type: String,
      default: '#000000'
    }
  },
  watch: {
    naturalX() {
      this.render();
    },
    naturalY() {
      this.render();
    },
    imageData: {
      deep: true,
      handler() {
        this.render();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.render();
    });
  },
  methods: {
    render() {
      const magCanvas = this.$refs.magnifierCanvas;
      if (!magCanvas || !this.imageData) return;
      if (magCanvas.width !== MAGNIFIER_SIZE) {
        magCanvas.width = MAGNIFIER_SIZE;
        magCanvas.height = MAGNIFIER_SIZE;
      }
      const magCtx = magCanvas.getContext('2d');
      const halfSrc = Math.floor((MAGNIFIER_SIZE / MAGNIFIER_ZOOM) / 2);

      magCtx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

      const srcX = Math.max(0, Math.min(this.imageData.width - halfSrc * 2, this.naturalX - halfSrc));
      const srcY = Math.max(0, Math.min(this.imageData.height - halfSrc * 2, this.naturalY - halfSrc));
      const srcSize = halfSrc * 2;

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

      magCtx.imageSmoothingEnabled = false;
      magCtx.drawImage(srcCanvas, 0, 0, srcSize, srcSize, 0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

      const centerOffsetX = (this.naturalX - srcX) / srcSize * MAGNIFIER_SIZE;
      const centerOffsetY = (this.naturalY - srcY) / srcSize * MAGNIFIER_SIZE;
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
    }
  }
};
</script>

<style lang="scss" scoped>
.magnifier {
  width: 160px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: 10px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
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
</style>
