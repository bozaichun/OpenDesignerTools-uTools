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
    <div v-if="pickerPos && hoverColor" class="magnifier-wrap">
      <Magnifier
        :image-data="imageData"
        :natural-x="hoverNaturalX"
        :natural-y="hoverNaturalY"
        :hex-color="hoverColor.hex"
      />
    </div>
  </div>
</template>

<script>
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  showToast
} from '../utils/colorUtils';
import Magnifier from './Magnifier.vue';

export default {
  name: 'Straw',
  components: { Magnifier },
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
      hoverColor: null,
      hoverNaturalX: 0,
      hoverNaturalY: 0
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

      const scaleX = this.imageData ? canvas.width / rect.width : 1;
      const scaleY = this.imageData ? canvas.height / rect.height : 1;
      const naturalX = Math.floor(displayX * scaleX);
      const naturalY = Math.floor(displayY * scaleY);
      this.hoverNaturalX = naturalX;
      this.hoverNaturalY = naturalY;

      const pixel = this.getPixelAt(naturalX, naturalY);
      if (pixel) {
        const rgba = { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };
        this.hoverColor = { hex: formatHEX(rgba) };
      }
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

.magnifier-wrap {
  position: absolute;
  right: -180px;
  bottom: 0;
  z-index: 10;
}

@media (max-width: 900px) {
  .magnifier-wrap {
    right: 10px;
    bottom: 10px;
  }
}
</style>
