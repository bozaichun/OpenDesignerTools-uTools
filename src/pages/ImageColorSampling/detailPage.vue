<script lang="ts" setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../../utils/colorUtils';
import ModuleTitle from '../../components/ModuleTitle.vue';
import ColorActionGroup from '../../components/ColorActionGroup.vue';
import Dialog from '../../components/Dialog.vue';
import Straw from '../../components/Straw.vue';
import { openInUBrowser } from '../../utils/ubrowser.js';

const STORAGE_KEY = 'imageAnalysisData';

const router = useRouter();
const setHeaderActions = inject('setHeaderActions');
const clearHeaderActions = inject('clearHeaderActions');

const fileInput = ref(null);
const paletteCanvasBox = ref(null);

const imageSrc = ref(null);
const imageNaturalWidth = ref(0);
const imageNaturalHeight = ref(0);
const mainColors = ref([]);
const pickedColor = ref(null);
const isAnalyzing = ref(false);
const paletteDialogVisible = ref(false);

const pendingNaturalWidth = ref(0);
const pendingNaturalHeight = ref(0);
const pendingImageData = ref(null);

const hasData = computed(() => imageSrc.value && mainColors.value.length > 0);
const paletteCols = computed(() => {
  const total = mainColors.value.length;
  if (total <= 4) return 4;
  if (total <= 6) return 3;
  return 4;
});

function loadAnalysisData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.warn('没有找到分析数据');
      return;
    }
    const data = JSON.parse(raw);
    imageSrc.value = data.imageSrc;
    imageNaturalWidth.value = data.imageNaturalWidth;
    imageNaturalHeight.value = data.imageNaturalHeight;
    mainColors.value = data.mainColors || [];
  } catch (err) {
    console.error('读取分析数据失败', err);
    showToast(null, '数据读取失败', 'error');
  }
}
function handleStrawPick(colorInfo) {
  pickedColor.value = colorInfo;
}
function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label + ': ' + value, 'success');
}
function getColorFormat(color, type) {
  if (!color || !color.hex) return '';
  const h = color.hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const rgba = { r, g, b, a: 1 };
  if (type === 'cmyk') return formatCMYK(rgba);
  if (type === 'hsv') return formatHSV(rgba);
  return '';
}
function searchOnBaidu(hex) {
  const query = encodeURIComponent(hex + ' 颜色 配色方案 色彩搭配');
  const url = 'https://www.baidu.com/s?wd=' + query;
  openInUBrowser(url, { width: 1200, height: 800 });
  showToast(null, '正在搜索 ' + hex + ' 的配色方案', 'success');
}
function goBack() {
  router.push('/ImageColorSampling');
}
function updateHeaderActions() {
  if (mainColors.value.length === 0) {
    clearHeaderActions();
    return;
  }
  setHeaderActions([
    { label: '重新选择', onClick: () => handleReselect(), secondary: true },
    { label: '生成色卡', onClick: () => openPaletteDialog() }
  ]);
}
function handleReselect() {
  fileInput.value.value = '';
  fileInput.value.click();
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) loadImage(file);
}
function loadImage(file) {
  const MIN_LOADING_MS = 1000;
  const startTime = Date.now();
  isAnalyzing.value = true;
  pickedColor.value = null;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      parseImageData(img);
      extractMainColors(e.target.result, startTime, MIN_LOADING_MS);
    };
    img.onerror = function() {
      isAnalyzing.value = false;
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

  pendingNaturalWidth.value = width;
  pendingNaturalHeight.value = height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  pendingImageData.value = ctx.getImageData(0, 0, width, height);
}
function extractMainColors(newImageSrc, startTime, minLoadingMs) {
  if (!pendingImageData.value) {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadingMs - elapsed);
    setTimeout(function() {
      isAnalyzing.value = false;
    }, remaining);
    return;
  }

  try {
    const data = pendingImageData.value.data;
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

    const newMainColors = unique.slice(0, 8).map(c => {
      const rgba = { r: c.r, g: c.g, b: c.b, a: 1 };
      return {
        hex: formatHEX(rgba),
        rgb: formatRGB(rgba),
        hsl: formatHSL(rgba),
        cmyk: formatCMYK(rgba),
        hsv: formatHSV(rgba)
      };
    });

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadingMs - elapsed);
    setTimeout(function() {
      imageSrc.value = newImageSrc;
      imageNaturalWidth.value = pendingNaturalWidth.value;
      imageNaturalHeight.value = pendingNaturalHeight.value;
      mainColors.value = newMainColors;
      saveAnalysisData();
      isAnalyzing.value = false;
    }, remaining);
  } catch (err) {
    console.error('主色调提取失败', err);
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
function openPaletteDialog() {
  if (!mainColors.value.length) {
    showToast(null, '没有可用的颜色数据', 'error');
    return;
  }
  paletteDialogVisible.value = true;
}
function getContrastTextColor(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return '#111111';
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#111111' : '#ffffff';
}
function downloadPalette() {
  if (!mainColors.value.length) {
    showToast(null, '没有可下载的色卡数据', 'error');
    return;
  }
  try {
    const colors = mainColors.value.map(c => ({
      hex: c.hex,
      rgb: c.rgb,
      text: getContrastTextColor(c.hex)
    }));
    const cols = paletteCols.value;
    const cardW = 240;
    const cardH = 260;
    const swatchH = 180;
    const padding = 32;
    const gap = 20;
    const titleH = 56;

    const rows = Math.ceil(colors.length / cols);
    const canvas = document.createElement('canvas');
    const width = padding * 2 + cardW * cols + gap * (cols - 1);
    const height = padding * 2 + titleH + cardH * rows + gap * (rows - 1);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#111111';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('色卡 Palette', padding, padding);

    ctx.fillStyle = '#888888';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('共 ' + colors.length + ' 种主色调', padding, padding + 34);

    colors.forEach((color, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padding + col * (cardW + gap);
      const y = padding + titleH + row * (cardH + gap);

      ctx.fillStyle = '#f5f5f7';
      ctx.fillRect(x, y, cardW, cardH);

      ctx.fillStyle = color.hex;
      ctx.fillRect(x, y, cardW, swatchH);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + swatchH, cardW, cardH - swatchH);

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 16px "SF Mono", Consolas, Monaco, monospace';
      ctx.fillText(color.hex, x + 16, y + swatchH + 18);

      ctx.fillStyle = '#555555';
      ctx.font = '12px "SF Mono", Consolas, Monaco, monospace';
      ctx.fillText(color.rgb, x + 16, y + swatchH + 44);
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'palette-' + Date.now() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(null, '色卡已开始下载', 'success');
  } catch (err) {
    console.error('下载色卡失败', err);
    showToast(null, '下载失败，请重试', 'error');
  }
}

watch(pickedColor, () => {
  updateHeaderActions();
});
watch(mainColors, () => {
  updateHeaderActions();
});

onMounted(() => {
  loadAnalysisData();
  updateHeaderActions();
});
onUnmounted(() => {
  clearHeaderActions();
});
</script>

<template>
  <div class="module-detail">
    <!-- 隐藏文件选择器，用于「重新选择」按钮触发 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none;"
      @change="handleFileSelect"
    />

    <!-- 色卡弹框 -->
    <Dialog
      :visible="paletteDialogVisible"
      title="色卡预览"
      max-width="860px"
      @close="paletteDialogVisible = false"
    >
      <div class="palette-dialog-body" ref="paletteCanvasBox">
        <div v-if="!mainColors.length" class="palette-empty">暂无可用色卡数据</div>
        <div v-else class="palette-grid" :class="'palette-cols-' + paletteCols">
          <div
            v-for="(color, idx) in mainColors"
            :key="color.hex"
            class="palette-card"
          >
            <div
              class="palette-swatch"
              :style="{ background: color.hex }"
            ></div>
            <div class="palette-value">
              <span>{{ color.hex }}</span>
              <button
                class="palette-copy"
                @click.stop="copyValue(color.hex, 'HEX')"
                title="复制颜色值"
              >
                <span class="iconfont icon-Copy"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="palette-dialog-footer">
          <button class="palette-btn secondary" @click="paletteDialogVisible = false">取消</button>
          <button class="palette-btn" @click="downloadPalette">下载色卡</button>
        </div>
      </template>
    </Dialog>

    <!-- 分析结果内容（始终显示，重选时保留旧数据） -->
    <div>
      <!-- 图片预览 + 取色区 + 吸管取色结果 -->
      <div class="analysis-top-row">
        <div class="section-block image-preview-section">
          <ModuleTitle
            mode="section"
            title="图片取色"
            subtitle="点击图片任意位置可获取该点颜色值"
          />
          <div class="image-preview-wrap">
            <Straw
              v-if="imageSrc"
              :image-src="imageSrc"
              :natural-width="imageNaturalWidth"
              :natural-height="imageNaturalHeight"
              @pick="handleStrawPick"
            />
          </div>
        </div>

        <!-- 吸管取色结果 -->
        <div v-if="pickedColor" class="section-block picker-result-section">
          <ModuleTitle
            mode="section"
            title="吸管取色结果"
            subtitle="点击图片任意位置可获取该点颜色值"
          />

          <div class="picker-result">
            <div class="picker-result-visual">
              <div
                class="picker-result-swatch"
                :style="{ background: pickedColor.hex }"
                @click="copyValue(pickedColor.hex, 'HEX')"
              ></div>
              <button class="pr-search" @click="searchOnBaidu(pickedColor.hex)">色彩搭配</button>
            </div>
            <div class="picker-result-info">
              <div class="pr-row">
                <span class="pr-label">HEX</span>
                <span class="pr-value">{{ pickedColor.hex }}</span>
                <ColorActionGroup
                  :value="pickedColor.hex"
                  copy-label="HEX"
                  :favorite-name="pickedColor.hex"
                  variant="default"
                />
              </div>
              <div class="pr-row">
                <span class="pr-label">RGB</span>
                <span class="pr-value">{{ pickedColor.rgb }}</span>
                <ColorActionGroup
                  :value="pickedColor.rgb"
                  copy-label="RGB"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="pr-row">
                <span class="pr-label">HSL</span>
                <span class="pr-value">{{ pickedColor.hsl }}</span>
                <ColorActionGroup
                  :value="pickedColor.hsl"
                  copy-label="HSL"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="pr-row">
                <span class="pr-label">CMYK</span>
                <span class="pr-value">{{ pickedColor.cmyk }}</span>
                <ColorActionGroup
                  :value="pickedColor.cmyk"
                  copy-label="CMYK"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="pr-row">
                <span class="pr-label">HSV</span>
                <span class="pr-value">{{ pickedColor.hsv }}</span>
                <ColorActionGroup
                  :value="pickedColor.hsv"
                  copy-label="HSV"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 占位：未取色时显示空态提示 -->
        <div v-else class="section-block picker-result-section">
          <ModuleTitle
            mode="section"
            title="吸管取色结果"
            subtitle="点击图片任意位置可获取该点颜色值"
          />
          <div class="picker-result-empty">点击左侧图片开始取色</div>
        </div>
      </div>

      <!-- 主色调结果 -->
      <div class="section-block colors-result-section">
        <ModuleTitle
          mode="section"
          title="图片主色调"
          :subtitle="'共提取 ' + mainColors.length + ' 种主要颜色 · 点击色卡复制 HEX'"
        />

        <div class="main-colors-grid">
          <div
            v-for="(color, idx) in mainColors"
            :key="color.hex"
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
                <ColorActionGroup
                  :value="color.hex"
                  copy-label="HEX"
                  :favorite-name="color.hex"
                  variant="default"
                />
              </div>
              <div class="code-row">
                <span class="code-label">RGB</span>
                <span class="code-value">{{ color.rgb }}</span>
                <ColorActionGroup
                  :value="color.rgb"
                  copy-label="RGB"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="code-row">
                <span class="code-label">HSL</span>
                <span class="code-value">{{ color.hsl }}</span>
                <ColorActionGroup
                  :value="color.hsl"
                  copy-label="HSL"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="code-row">
                <span class="code-label">CMYK</span>
                <span class="code-value">{{ color.cmyk || getColorFormat(color, 'cmyk') }}</span>
                <ColorActionGroup
                  :value="color.cmyk || getColorFormat(color, 'cmyk')"
                  copy-label="CMYK"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
              <div class="code-row">
                <span class="code-label">HSV</span>
                <span class="code-value">{{ color.hsv || getColorFormat(color, 'hsv') }}</span>
                <ColorActionGroup
                  :value="color.hsv || getColorFormat(color, 'hsv')"
                  copy-label="HSV"
                  :show-favorite="false"
                  variant="default"
                />
              </div>
            </div>
            <div class="color-actions">
              <button class="search-btn" @click="searchOnBaidu(color.hex)">
                色彩搭配
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <Loading :visible="isAnalyzing" text="正在分析图片中的颜色..." />
  </div>
</template>

<style lang="scss" scoped>
.module-detail {
  width: 100%;
  min-width: 0;
  padding-bottom: 72px;
}

/* ============ 绌虹姸鎬?============ */
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

/* ============ 椤堕儴琛岋細鍥剧墖棰勮 + 鍚哥鍙栬壊缁撴灉 ============ */
.section-block {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.analysis-top-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.analysis-top-row .image-preview-section {
  flex: 1 1 400px;
  min-width: 0;
  margin-bottom: 0;
}

.analysis-top-row .picker-result-section {
  flex: 1 1 340px;
  min-width: 0;
  margin-top: 0;
}

.picker-result-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  background: var(--bg-muted);
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
}

/* ============ 鍥剧墖棰勮鍖?============ */
.image-preview-section {
  margin-bottom: 24px;
}

.image-preview-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

/* ============ 缁撴灉閫氱敤鏍峰紡 ============ */
.colors-result-section,
.picker-result-section {
  margin-top: 24px;
}

/* ============ 涓昏壊璋冨崱鐗囩綉鏍?============ */
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

/* ============ 鍚哥鍙栬壊缁撴灉 ============ */
.picker-result {
  display: flex;
  gap: 18px;
  padding: 18px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.picker-result-visual {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
  width: 100px;
}

.picker-result-swatch {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
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

.pr-search {
  width: 100%;
  padding: 8px 10px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  transition: all 0.15s ease;
  text-align: center;

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
  }
}

/* ============ 鍝嶅簲寮?============ */
@media (max-width: 640px) {
  .analysis-top-row {
    flex-direction: column;
  }

  .main-colors-grid {
    grid-template-columns: 1fr;
  }

  .picker-result {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .picker-result {
    flex-direction: column;
    align-items: stretch;
  }

  .picker-result-visual {
    width: 100%;
    flex-direction: row;
    align-items: center;
  }

  .picker-result-swatch {
    width: 80px;
    height: 80px;
    aspect-ratio: auto;
  }

  .pr-search {
    flex: 1;
    width: auto;
  }
}

/* ============ 鑹插崱寮规 ============ */
.palette-dialog-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: -16px -20px 0;
  padding: 0;
}

.palette-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.palette-grid {
  display: grid;
  gap: 12px;
  padding: 12px;
  max-height: min(52vh, 480px);
  overflow-y: auto;
}

.palette-grid.palette-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.palette-grid.palette-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.palette-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.palette-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.palette-swatch {
  width: 100%;
  aspect-ratio: 2 / 1;
  min-height: 80px;
}

.palette-value {
  padding: 10px 12px;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  background: var(--bg-muted);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.palette-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  padding: 0;

  &:hover {
    background: var(--accent);
    color: #ffffff;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.palette-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.palette-btn {
  min-width: 88px;
  height: 34px;
  padding: 0 18px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &.secondary {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent);

    &:hover {
      opacity: 0.88;
      background: var(--accent-soft);
    }
  }
}

@media (max-width: 640px) {
  .palette-grid.palette-cols-3,
  .palette-grid.palette-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .palette-dialog-footer {
    justify-content: center;
  }
}
</style>
