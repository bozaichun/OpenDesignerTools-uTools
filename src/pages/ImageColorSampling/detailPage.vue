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
            :key="idx"
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
      <div class="palette-dialog-footer">
        <button class="palette-btn secondary" @click="paletteDialogVisible = false">取消</button>
        <button class="palette-btn" @click="downloadPalette">下载色卡</button>
      </div>
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
            <div
              class="picker-result-swatch"
              :style="{ background: pickedColor.hex }"
            ></div>
            <div class="picker-result-info">
              <div class="pr-row">
                <span class="pr-label">HEX</span>
                <span class="pr-value">{{ pickedColor.hex }}</span>
                <button
                  class="code-copy"
                  title="复制 HEX"
                  @click="copyValue(pickedColor.hex, 'HEX')"
                >
                  <span class="iconfont icon-Copy"></span>
                </button>
                <button class="pr-search" @click="searchOnBaidu(pickedColor.hex)">色彩搭配</button>
              </div>
              <div class="pr-row">
                <span class="pr-label">RGB</span>
                <span class="pr-value">{{ pickedColor.rgb }}</span>
                <button
                  class="code-copy"
                  title="复制 RGB"
                  @click="copyValue(pickedColor.rgb, 'RGB')"
                >
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="pr-row">
                <span class="pr-label">HSL</span>
                <span class="pr-value">{{ pickedColor.hsl }}</span>
                <button
                  class="code-copy"
                  title="复制 HSL"
                  @click="copyValue(pickedColor.hsl, 'HSL')"
                >
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="pr-row">
                <span class="pr-label">CMYK</span>
                <span class="pr-value">{{ pickedColor.cmyk }}</span>
                <button
                  class="code-copy"
                  title="复制 CMYK"
                  @click="copyValue(pickedColor.cmyk, 'CMYK')"
                >
                  <span class="iconfont icon-Copy"></span>
                </button>
              </div>
              <div class="pr-row">
                <span class="pr-label">HSV</span>
                <span class="pr-value">{{ pickedColor.hsv }}</span>
                <button
                  class="code-copy"
                  title="复制 HSV"
                  @click="copyValue(pickedColor.hsv, 'HSV')"
                >
                  <span class="iconfont icon-Copy"></span>
                </button>
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
                <span class="iconfont icon-Query"></span>
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

<script>
import {
  formatHEX, formatRGB, formatHSL, formatCMYK, formatHSV,
  copyToClipboard, showToast
} from '../../utils/colorUtils';
import {
  isFavorite,
  toggleFavorite,
  normalizeFavoriteHex
} from '../../utils/favoriteStorage';
import ModuleTitle from '../../components/ModuleTitle.vue';
import Dialog from '../../components/Dialog.vue';
import Straw from '../../components/Straw.vue';
import Loading from '../../components/Loading.vue';

const STORAGE_KEY = 'imageAnalysisData';

export default {
  name: 'ImageColorSamplingDetail',
  components: {
    ModuleTitle,
    Dialog,
    Straw,
    Loading
  },
  inject: ['setHeaderActions', 'clearHeaderActions'],
  data() {
    return {
      imageSrc: null,
      imageNaturalWidth: 0,
      imageNaturalHeight: 0,
      mainColors: [],
      pickedColor: null,
      isAnalyzing: false,
      paletteDialogVisible: false
    };
  },
  computed: {
    hasData() {
      return this.imageSrc && this.mainColors.length > 0;
    },
    paletteCols() {
      const total = this.mainColors.length;
      if (total <= 4) return 4;
      if (total <= 6) return 3;
      return 4;
    }
  },
  mounted() {
    this.loadAnalysisData();
    this.updateHeaderActions();
    this.handleFavoritesChanged = () => this.updateHeaderActions();
    window.addEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  unmounted() {
    this.clearHeaderActions();
    window.removeEventListener('color-favorites-changed', this.handleFavoritesChanged);
  },
  watch: {
    pickedColor() {
      this.updateHeaderActions();
    },
    mainColors: {
      deep: false,
      handler() {
        this.updateHeaderActions();
      }
    }
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
      } catch (err) {
        console.error('读取分析数据失败', err);
        showToast(this, '数据读取失败', 'error');
      }
    },

    handleStrawPick(colorInfo) {
      this.pickedColor = colorInfo;
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
    },

    updateHeaderActions() {
      if (this.mainColors.length === 0) {
        this.clearHeaderActions();
        return;
      }
      const hex = this.pickedColor?.hex;
      const favorited = hex ? isFavorite(hex) : false;
      this.setHeaderActions([
        {
          label: favorited ? '★ 已收藏' : '☆ 收藏',
          onClick: () => this.handleFavoritePicked(),
          secondary: true
        },
        { label: '重新选择', onClick: () => this.handleReselect(), secondary: true },
        { label: '生成色卡', onClick: () => this.openPaletteDialog() }
      ]);
    },
    handleFavoritePicked() {
      if (!this.pickedColor?.hex) {
        showToast(this, '请先在图片上取色', 'error');
        return;
      }
      const hex = normalizeFavoriteHex(this.pickedColor.hex) || this.pickedColor.hex;
      const wasFavorited = isFavorite(hex);
      const result = toggleFavorite({ hex, name: hex });
      if (!result.ok) {
        showToast(this, result.message || '操作失败', 'error');
        return;
      }
      showToast(
        this,
        wasFavorited ? '已取消收藏' : `已将 “${hex}” 加入我的收藏`,
        'success'
      );
      this.updateHeaderActions();
    },
    handleReselect() {
      this.$refs.fileInput.value = '';
      this.$refs.fileInput.click();
    },
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) this.loadImage(file);
    },
    loadImage(file) {
      const self = this;
      const MIN_LOADING_MS = 1000;
      const startTime = Date.now();
      this.isAnalyzing = true;
      this.pickedColor = null;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          self.parseImageData(img);
          self.extractMainColors(e.target.result, startTime, MIN_LOADING_MS);
        };
        img.onerror = function() {
          self.isAnalyzing = false;
          showToast(self, '图片加载失败', 'error');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    parseImageData(img) {
      const maxSize = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      this._pendingNaturalWidth = width;
      this._pendingNaturalHeight = height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      this._pendingImageData = ctx.getImageData(0, 0, width, height);
    },
    extractMainColors(newImageSrc, startTime, minLoadingMs) {
      const self = this;
      if (!this._pendingImageData) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingMs - elapsed);
        setTimeout(function() {
          self.isAnalyzing = false;
        }, remaining);
        return;
      }

      try {
        const data = this._pendingImageData.data;
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

        // 分析完成：确保 loading 达到最短展示时间后，再同时更新数据和关闭 loading
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingMs - elapsed);
        setTimeout(function() {
          self.imageSrc = newImageSrc;
          self.imageNaturalWidth = self._pendingNaturalWidth;
          self.imageNaturalHeight = self._pendingNaturalHeight;
          self.mainColors = newMainColors;
          self.saveAnalysisData();
          self.isAnalyzing = false;
        }, remaining);
      } catch (err) {
        console.error('主色调提取失败', err);
        this.isAnalyzing = false;
        showToast(this, '颜色提取失败', 'error');
      }
    },
    saveAnalysisData() {
      try {
        const data = {
          imageSrc: this.imageSrc,
          imageNaturalWidth: this.imageNaturalWidth,
          imageNaturalHeight: this.imageNaturalHeight,
          mainColors: this.mainColors,
          timestamp: Date.now()
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('数据存储失败', err);
        showToast(this, '数据存储失败，请重试', 'error');
      }
    },

    openPaletteDialog() {
      if (!this.mainColors.length) {
        showToast(this, '没有可用的颜色数据', 'error');
        return;
      }
      this.paletteDialogVisible = true;
    },

    // 根据颜色计算相对亮度，返回深色文字或浅色文字
    getContrastTextColor(hex) {
      const h = (hex || '').replace('#', '');
      if (h.length !== 6) return '#111111';
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 160 ? '#111111' : '#ffffff';
    },

    downloadPalette() {
      if (!this.mainColors.length) {
        showToast(this, '没有可下载的色卡数据', 'error');
        return;
      }
      try {
        const colors = this.mainColors.map(c => ({
          hex: c.hex,
          rgb: c.rgb,
          text: this.getContrastTextColor(c.hex)
        }));
        const cols = this.paletteCols;
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

        // 背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 标题
        ctx.fillStyle = '#111111';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText('色卡 Palette', padding, padding);

        ctx.fillStyle = '#888888';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText('共 ' + colors.length + ' 种主色调', padding, padding + 34);

        // 绘制色卡
        colors.forEach((color, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = padding + col * (cardW + gap);
          const y = padding + titleH + row * (cardH + gap);

          // 卡片背景
          ctx.fillStyle = '#f5f5f7';
          ctx.fillRect(x, y, cardW, cardH);

          // 色块
          ctx.fillStyle = color.hex;
          ctx.fillRect(x, y, cardW, swatchH);

          // 卡片底边分割线
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y + swatchH, cardW, cardH - swatchH);

          // HEX
          ctx.fillStyle = '#111111';
          ctx.font = 'bold 16px "SF Mono", Consolas, Monaco, monospace';
          ctx.fillText(color.hex, x + 16, y + swatchH + 18);

          // RGB
          ctx.fillStyle = '#555555';
          ctx.font = '12px "SF Mono", Consolas, Monaco, monospace';
          ctx.fillText(color.rgb, x + 16, y + swatchH + 44);
        });

        // 导出图片
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'palette-' + Date.now() + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(this, '色卡已开始下载', 'success');
      } catch (err) {
        console.error('下载色卡失败', err);
        showToast(this, '下载失败，请重试', 'error');
      }
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

/* ============ 顶部行：图片预览 + 吸管取色结果 ============ */
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

/* ============ 图片预览区 ============ */
.image-preview-section {
  margin-bottom: 24px;
}

.image-preview-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

/* ============ 结果通用样式 ============ */
.colors-result-section,
.picker-result-section {
  margin-top: 24px;
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

.pr-search {
  padding: 4px 12px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    background: var(--accent);
    color: var(--text-invert);
  }
}

/* ============ 响应式 ============ */
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

  .picker-result-swatch {
    width: 100%;
    height: 80px;
    aspect-ratio: 4 / 1;
  }
}

/* ============ 色卡弹框 ============ */
.palette-dialog-body {
  display: flex;
  flex-direction: column;
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
  padding: 12px 20px;
  margin: 0 -20px -24px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-muted);
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
