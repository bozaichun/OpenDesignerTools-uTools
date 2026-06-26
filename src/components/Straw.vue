<script lang="ts" setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  showToast
} from '../utils/colorUtils';
import Magnifier from './Magnifier.vue';

const props = defineProps({
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
});

const emit = defineEmits(['pick']);

const imageContainer = ref(null);
const canvas = ref(null);
const pickerPos = ref(null);
const imageData = ref(null);
const hoverColor = ref(null);
const hoverNaturalX = ref(0);
const hoverNaturalY = ref(0);

const renderCanvas = () => {
  if (!props.imageSrc) return;
  const img = new Image();
  img.onload = function() {
    const canvasEl = canvas.value;
    if (!canvasEl) return;
    const width = props.naturalWidth || img.width;
    const height = props.naturalHeight || img.height;
    canvasEl.width = width;
    canvasEl.height = height;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    imageData.value = ctx.getImageData(0, 0, width, height);
  };
  img.src = props.imageSrc;
};

const handleCanvasLeave = () => {
  pickerPos.value = null;
  hoverColor.value = null;
};

const getPixelAt = (x, y) => {
  if (!imageData.value) return null;
  const data = imageData.value.data;
  const width = imageData.value.width;
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3] / 255
  };
};

const handleCanvasMove = (e) => {
  const canvasEl = canvas.value;
  if (!canvasEl) return;
  const rect = canvasEl.getBoundingClientRect();
  const displayX = e.clientX - rect.left;
  const displayY = e.clientY - rect.top;
  pickerPos.value = { x: displayX, y: displayY };

  const scaleX = imageData.value ? canvasEl.width / rect.width : 1;
  const scaleY = imageData.value ? canvasEl.height / rect.height : 1;
  const naturalX = Math.floor(displayX * scaleX);
  const naturalY = Math.floor(displayY * scaleY);
  hoverNaturalX.value = naturalX;
  hoverNaturalY.value = naturalY;

  const pixel = getPixelAt(naturalX, naturalY);
  if (pixel) {
    const rgba = { r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a };
    hoverColor.value = { hex: formatHEX(rgba) };
  }
};

const handleCanvasClick = (e) => {
  const canvasEl = canvas.value;
  if (!canvasEl) return;
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = imageData.value ? canvasEl.width / rect.width : 1;
  const scaleY = imageData.value ? canvasEl.height / rect.height : 1;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  const pixel = getPixelAt(x, y);
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
    emit('pick', colorInfo);
    showToast(null, '已获取颜色: ' + hex, 'success');
  }
};

watch(() => props.imageSrc, () => {
  nextTick(() => {
    renderCanvas();
  });
});

onMounted(() => {
  nextTick(() => {
    renderCanvas();
  });
});
</script>

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
