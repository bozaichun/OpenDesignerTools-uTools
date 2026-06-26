<script lang="ts" setup>
import { ref, watch, inject, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  showToast
} from '../../utils/colorUtils';
import Loading from '../../components/Loading.vue';
import Banner from '../../components/Banner.vue';

const STORAGE_KEY = 'imageAnalysisData';

const router = useRouter();
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const fileInput = ref(null);
const imageContainer = ref(null);

const imageLoaded = ref(false);
const isDragging = ref(false);
const isAnalyzing = ref(false);
const imageData = ref(null);
const imageNaturalWidth = ref(0);
const imageNaturalHeight = ref(0);
const imageSrc = ref(null);
const mainColors = ref([]);

function updateHeaderActions() {
  if (imageLoaded.value) {
    setHeaderActions([
      { label: '重新选择', onClick: () => triggerFileInput(), secondary: true }
    ]);
  } else {
    clearHeaderActions();
  }
}
function triggerFileInput() {
  fileInput.value.click();
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadImage(file);
}
function handleDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  } else {
    showToast(null, '请拖入图片文件', 'error');
  }
}
function loadImage(file) {
  mainColors.value = [];

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      imageSrc.value = e.target.result;
      imageLoaded.value = true;
      nextTick(function() {
        parseImageData(img);
        analyzeImage();
      });
    };
    img.onerror = function() {
      showToast(null, '图片加载失败', 'error');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function parseImageData(img) {
  const maxSize = 600;
  let width = img.width;
  let height = img.height;

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  imageNaturalWidth.value = width;
  imageNaturalHeight.value = height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  imageData.value = ctx.getImageData(0, 0, width, height);
}
function analyzeImage() {
  if (!imageData.value) {
    showToast(null, '请先上传图片', 'error');
    return;
  }
  isAnalyzing.value = true;
  nextTick(function() {
    setTimeout(function() {
      extractMainColors();
    }, 2000);
  });
}
function extractMainColors() {
  if (!imageData.value) {
    mainColors.value = [];
    isAnalyzing.value = false;
    return;
  }

  try {
    const data = imageData.value.data;
    const step = 4;
    const buckets = {};

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

    mainColors.value = unique.slice(0, 8).map(c => {
      const rgba = { r: c.r, g: c.g, b: c.b, a: 1 };
      return {
        hex: formatHEX(rgba),
        rgb: formatRGB(rgba),
        hsl: formatHSL(rgba),
        cmyk: formatCMYK(rgba),
        hsv: formatHSV(rgba)
      };
    });

    saveAnalysisData();

    isAnalyzing.value = false;
    router.push('/ImageColorSampling/detailPage');
  } catch (err) {
    console.error('主色调提取失败', err);
    mainColors.value = [];
    isAnalyzing.value = false;
    showToast(null, '颜色提取失败', 'error');
  }
}
function saveAnalysisData() {
  try {
    const data = {
      imageSrc: imageSrc.value,
      imageNaturalWidth: imageNaturalWidth.value,
      imageNaturalHeight: imageNaturalHeight.value,
      mainColors: mainColors.value,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('数据存储失败', err);
    showToast(null, '数据存储失败，请重试', 'error');
  }
}
function clearImage() {
  imageLoaded.value = false;
  mainColors.value = [];
  imageData.value = null;
  imageSrc.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

watch(imageLoaded, () => {
  updateHeaderActions();
});

onMounted(() => {
  updateHeaderActions();
});
onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-image">
    <Banner
      v-if="!imageLoaded"
      title="上传图片，一键提取配色"
      description="支持拖拽或点击上传，自动分析主色调并生成完整色值报告"
      icon="icon-Areality-Picture"
    />

    <!-- 上传区域（图片已加载后隐藏） -->
    <div
      v-if="!imageLoaded"
      class="upload-area"
      :class="{ dragging: isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">
        <span class="iconfont icon-PictureAddition"></span>
      </div>
      <div class="upload-text">点击选择图片，或拖拽图片到此处</div>
      <div class="upload-hint">支持 PNG / JPG / WEBP / GIF</div>
    </div>

    <!-- 图片预览（图片已加载后显示） -->
    <div v-if="imageLoaded" class="image-preview-section">
      <div class="image-container" ref="imageContainer">
        <img :src="imageSrc" alt="preview" />
      </div>
    </div>

    <!-- 全局文件选择器 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none;"
      @change="handleFileSelect"
    />

    <!-- Loading 遮罩 -->
    <Loading :visible="isAnalyzing" text="正在分析图片中的颜色..." />
  </div>
</template>

<style lang="scss" scoped>
.module-image {
  width: 100%;
  min-width: 0;
}

/* =============== 上传区域 =============== */
.upload-area {
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 100px 20px;
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
    font-size: 44px;
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

/* =============== 图片预览区 =============== */
.image-preview-section {
  display: flex;
  justify-content: center;
  align-items: center;
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

  img {
    display: block;
    max-width: 100%;
    max-height: 600px;
    height: auto;
  }
}

/* =============== 响应式 =============== */
@media (max-width: 640px) {
  .upload-area {
    padding: 32px 16px;
  }
}
</style>
