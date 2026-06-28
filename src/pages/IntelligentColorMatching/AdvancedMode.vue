<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, toRaw } from 'vue';
import html2canvas from 'html2canvas';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import Input from '../../components/Input.vue';
import Textarea from '../../components/Textarea.vue';
import SemanticDesignSpecPreview from './SemanticDesignSpecPreview.vue';
import SemanticHistoryDrawer from './SemanticHistoryDrawer.vue';
import { parseColor, rgbToHex, rgbToHsl, hslToRgb, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';
import { sanitizeFileName } from '../../utils/codeGenerator';
import { ADVANCED_TABS } from './intelligentColorMatchingUtils.js';
import { buildSemanticAiMessages, finalizeSemanticAiResponse, tryParseSemanticAiResponsePartial } from './semanticColorAi.js';
import { buildSemanticDesignSpecMarkdown } from './semanticDesignSpec.js';
import { saveSemanticHistorySession } from './semanticHistoryStorage.js';

const activeTab = ref('semantic');
const moodOptions = [
  { key: 'warm', label: '温暖亲切' },
  { key: 'cool', label: '冷静专业' },
  { key: 'energetic', label: '活力动感' },
  { key: 'elegant', label: '优雅高贵' },
  { key: 'fresh', label: '清新自然' },
  { key: 'tech', label: '科技未来' }
];
const industryOptions = [
  { key: 'tech', label: '科技互联网' },
  { key: 'finance', label: '金融商务' },
  { key: 'medical', label: '医疗健康' },
  { key: 'education', label: '教育培训' },
  { key: 'retail', label: '零售电商' },
  { key: 'restaurant', label: '餐饮美食' },
  { key: 'beauty', label: '美妆时尚' }
];
const CUSTOM_OPTION = 'custom';
const selectedMood = ref('cool');
const selectedIndustry = ref('tech');
const moodIsCustom = ref(false);
const industryIsCustom = ref(false);
const customMoodText = ref('');
const customIndustryText = ref('');
const semanticKeywords = ref('');
const semanticResult = ref(null);
const isGenerating = ref(false);
const isPreviewRevealing = ref(false);
const semanticPreviewRef = ref(null);
const semanticPreviewContentRef = ref(null);

const SEMANTIC_HEADER_DESC = '输入关键词、行业风格或情绪调性，一键生成整套配色方案';
const SEMANTIC_PREVIEW_TIP = '温馨提示：可保存截图导出预览长图，或下载 Markdown 文档留存完整设计规范';
const SCROLL_BOTTOM_THRESHOLD = 48;

const stickToBottom = ref(true);
const showScrollBottomBtn = ref(false);
const historyDrawerVisible = ref(false);
let semanticAiRequest = null;
let semanticStreamFrame = null;

const monoColor = ref('#1677FF');
const monochromeShades = ref([]);
const analogousColors = ref([]);
const complementaryColors = ref([]);

const scenarioOptions = [
  { key: 'poster', label: '海报设计', emoji: '🎨', desc: '高对比度，视觉冲击' },
  { key: 'app', label: 'APP 首页', emoji: '📱', desc: '柔和舒适，层级清晰' },
  { key: 'ppt', label: 'PPT 演示', emoji: '📊', desc: '专业稳重，商务感强' },
  { key: 'social', label: '社交媒体', emoji: '📸', desc: '年轻活力，品牌突出' },
  { key: 'package', label: '产品包装', emoji: '📦', desc: '风格独特，记忆深刻' }
];
const selectedScenario = ref('');
const darkMode = ref(false);

const avoidIndustryOptions = [
  { key: 'tech', label: '科技行业' },
  { key: 'finance', label: '金融行业' },
  { key: 'ecommerce', label: '电商行业' },
  { key: 'food', label: '餐饮行业' }
];
const selectedAvoidIndustry = ref('tech');
const uniqueResult = ref(null);

const currentScenario = computed(() => {
  const data = {
    poster: {
      light: { primary: '#FF3D68', secondary: '#FFD93D', accent: '#6BCB77', text: '#1A1A2E', bg: '#FAFAFA' },
      dark: { primary: '#FF6B9D', secondary: '#FFE66D', accent: '#4ECDC4', text: '#F8F8F8', bg: '#1A1A2E' }
    },
    app: {
      light: { primary: '#1677FF', secondary: '#69B1FF', accent: '#FF7D00', text: '#1F2937', bg: '#F3F4F6' },
      dark: { primary: '#4096FF', secondary: '#69B1FF', accent: '#FAAD14', text: '#F3F4F6', bg: '#1F2937' }
    },
    ppt: {
      light: { primary: '#0F4C81', secondary: '#2E8BC0', accent: '#F28C28', text: '#1A1A2E', bg: '#FFFFFF' },
      dark: { primary: '#2E8BC0', secondary: '#4FC3F7', accent: '#FF9800', text: '#ECEFF1', bg: '#1A1A2E' }
    },
    social: {
      light: { primary: '#E91E63', secondary: '#9C27B0', accent: '#FFD700', text: '#212121', bg: '#FFF8F0' },
      dark: { primary: '#F48FB1', secondary: '#CE93D8', accent: '#FFEE58', text: '#FAFAFA', bg: '#212121' }
    },
    package: {
      light: { primary: '#2D5A27', secondary: '#8B4513', accent: '#D4AF37', text: '#1A1A1A', bg: '#F5F5DC' },
      dark: { primary: '#556B2F', secondary: '#8B7355', accent: '#FFD700', text: '#F5F5DC', bg: '#1A1A1A' }
    }
  };
  if (!selectedScenario.value || !data[selectedScenario.value]) return data.app.light;
  return darkMode.value ? data[selectedScenario.value].dark : data[selectedScenario.value].light;
});
const currentScenarioColors = computed(() => {
  const s = currentScenario.value;
  return [
    { name: '主色 Primary', color: s.primary },
    { name: '辅色 Secondary', color: s.secondary },
    { name: '点缀 Accent', color: s.accent },
    { name: '文字 Text', color: s.text },
    { name: '背景 BG', color: s.bg }
  ];
});
const avoidColors = computed(() => {
  const data = {
    tech: [
      { name: '科技蓝', color: '#1677FF' },
      { name: '渐变蓝', color: '#2563EB' },
      { name: '浅蓝', color: '#3B82F6' },
      { name: '紫蓝', color: '#6366F1' }
    ],
    finance: [
      { name: '金融红', color: '#DC2626' },
      { name: '金色', color: '#D97706' },
      { name: '稳重蓝', color: '#1E40AF' },
      { name: '深灰', color: '#374151' }
    ],
    ecommerce: [
      { name: '电商橙', color: '#F97316' },
      { name: '促销红', color: '#EF4444' },
      { name: '活力黄', color: '#FBBF24' },
      { name: '商城绿', color: '#10B981' }
    ],
    food: [
      { name: '食物红', color: '#E74C3C' },
      { name: '暖橙', color: '#F39C12' },
      { name: '嫩绿', color: '#27AE60' },
      { name: '咖啡棕', color: '#8B4513' }
    ]
  };
  return data[selectedAvoidIndustry.value] || data.tech;
});

function getContrastColor(hex) {
  const rgb = parseColor(hex);
  if (!rgb) return '#000000';
  return gcc(rgb);
}
const showPreviewActions = computed(() => !!semanticResult.value && !isGenerating.value && !isPreviewRevealing.value);
const isPreviewStreaming = computed(() => isGenerating.value || isPreviewRevealing.value);
const showPreviewScrollBtn = computed(() => showScrollBottomBtn.value && (isPreviewStreaming.value || !!semanticResult.value));
const semanticInSession = computed(() => !!semanticResult.value && !isGenerating.value);
const isSceneInputDisabled = computed(() => isGenerating.value || semanticInSession.value);

function isNearPreviewBottom(el) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_BOTTOM_THRESHOLD;
}

function scrollPreviewToBottom(instant = true) {
  const el = semanticPreviewRef.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
}

function syncPreviewScrollState() {
  const el = semanticPreviewRef.value;
  if (!el || (!isPreviewStreaming.value && !semanticResult.value)) {
    showScrollBottomBtn.value = false;
    return;
  }
  const nearBottom = isNearPreviewBottom(el);
  stickToBottom.value = nearBottom;
  showScrollBottomBtn.value = !nearBottom;
}

function handlePreviewScroll() {
  syncPreviewScrollState();
}

function handlePreviewScrollToBottom() {
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  scrollPreviewToBottom(true);
}

function schedulePreviewScrollToBottom() {
  if (!stickToBottom.value) return;
  nextTick(() => scrollPreviewToBottom(true));
}

function getSpecBaseName() {
  return sanitizeFileName(semanticResult.value?.name?.slice(0, 24) || 'UI设计规范');
}

function formatDownloadTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function getSpecDownloadFileName() {
  return `${getSpecBaseName()}${formatDownloadTimestamp()}.md`;
}

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    || (document.documentElement.getAttribute('data-theme') !== 'light'
      && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function saveTextFile({ content, fileName, dialogTitle, filterName, extensions, mimeType = 'text/plain;charset=utf-8' }) {
  if (!content.trim()) return false;

  if (window.utools?.showSaveDialog && window.services?.writeTextToPath) {
    const defaultPath = window.services.getDefaultSavePath?.(fileName) || fileName;
    const savePath = window.utools.showSaveDialog({
      title: dialogTitle,
      defaultPath,
      buttonLabel: '保存',
      filters: [{ name: filterName, extensions }]
    });
    if (!savePath) return false;
    try {
      window.services.writeTextToPath(content, savePath);
      showToast(null, '文件已保存', 'success');
      return true;
    } catch {
      showToast(null, '文件保存失败，请重试', 'error');
      return false;
    }
  }

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: filterName, accept: { [mimeType.split(';')[0]]: extensions.map((ext) => `.${ext}`) } }]
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      showToast(null, '文件已保存', 'success');
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
    }
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  showToast(null, '文件已下载', 'success');
  return true;
}

async function handleDownloadDesignSpec() {
  const content = buildSemanticDesignSpecMarkdown(semanticResult.value);
  await saveTextFile({
    content,
    fileName: getSpecDownloadFileName(),
    dialogTitle: '保存 Markdown 文档',
    filterName: 'Markdown 文档',
    extensions: ['md'],
    mimeType: 'text/markdown;charset=utf-8'
  });
}

const SCREENSHOT_OUTER_PADDING = 24;

function getScreenshotScale(contentWidth, contentHeight) {
  const MAX_CANVAS_SIDE = 8192;
  const paddedWidth = contentWidth + SCREENSHOT_OUTER_PADDING * 2;
  const paddedHeight = contentHeight + SCREENSHOT_OUTER_PADDING * 2;
  const preferred = Math.min(Math.max(window.devicePixelRatio, 2), 3);
  const limitByWidth = MAX_CANVAS_SIDE / Math.max(paddedWidth, 1);
  const limitByHeight = MAX_CANVAS_SIDE / Math.max(paddedHeight, 1);
  return Math.max(1, Math.min(preferred, limitByWidth, limitByHeight));
}

function composeScreenshotWithPadding(sourceCanvas, backgroundColor, scale) {
  const pad = SCREENSHOT_OUTER_PADDING * scale;
  const output = document.createElement('canvas');
  output.width = sourceCanvas.width + pad * 2;
  output.height = sourceCanvas.height + pad * 2;

  const ctx = output.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(sourceCanvas, pad, pad);
  return output;
}

function prepareScreenshotClone(_doc, clonedEl) {
  const nodes = [clonedEl];
  let node = clonedEl.parentElement;
  while (node && node !== _doc.body) {
    nodes.push(node);
    node = node.parentElement;
  }
  nodes.forEach((item) => {
    item.style.overflow = 'visible';
    item.style.maxHeight = 'none';
    item.style.height = 'auto';
    item.style.transform = 'none';
    item.style.animation = 'none';
    item.style.opacity = '1';
  });
}

async function handleSaveScreenshot() {
  await nextTick();

  const root = semanticPreviewContentRef.value;
  const el = root?.querySelector('.design-spec') || root;
  if (!el) return;

  const contentWidth = Math.ceil(el.scrollWidth || el.clientWidth);
  const contentHeight = Math.ceil(el.scrollHeight || el.clientHeight);
  if (!contentWidth || !contentHeight) {
    showToast(null, '截图失败，预览内容为空', 'warning');
    return;
  }

  const scale = getScreenshotScale(contentWidth, contentHeight);
  const backgroundColor = isDarkTheme() ? '#383838' : '#F9F9F9';

  try {
    const canvas = await html2canvas(el, {
      backgroundColor,
      scale,
      useCORS: true,
      logging: false,
      onclone: prepareScreenshotClone
    });

    if (!canvas.width || !canvas.height) {
      showToast(null, '截图失败，请重试', 'warning');
      return;
    }

    const outputCanvas = composeScreenshotWithPadding(canvas, backgroundColor, scale);

    outputCanvas.toBlob((blob) => {
      if (!blob) {
        showToast(null, '截图失败，请重试', 'warning');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${getSpecBaseName()}-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast(null, '预览截图已保存', 'success');
    }, 'image/png', 1);
  } catch {
    showToast(null, '截图失败，请重试', 'warning');
  }
}
function getMoodValue() {
  if (moodIsCustom.value) return customMoodText.value.trim();
  return moodOptions.find((item) => item.key === selectedMood.value)?.label || '';
}
function getIndustryValue() {
  if (industryIsCustom.value) return customIndustryText.value.trim();
  return industryOptions.find((item) => item.key === selectedIndustry.value)?.label || '';
}
function handleMoodBackToPreset() {
  moodIsCustom.value = false;
  if (selectedMood.value === CUSTOM_OPTION) selectedMood.value = 'cool';
}
function handleIndustryBackToPreset() {
  industryIsCustom.value = false;
  if (selectedIndustry.value === CUSTOM_OPTION) selectedIndustry.value = 'tech';
}

watch(selectedMood, (val) => {
  if (val === CUSTOM_OPTION) moodIsCustom.value = true;
});
watch(selectedIndustry, (val) => {
  if (val === CUSTOM_OPTION) industryIsCustom.value = true;
});

watch([semanticResult, isPreviewStreaming], () => {
  if (stickToBottom.value && (isPreviewStreaming.value || semanticResult.value)) {
    schedulePreviewScrollToBottom();
  }
}, { deep: true });

function flushSemanticStreamPreview(accumulated) {
  semanticStreamFrame = null;
  const parsed = tryParseSemanticAiResponsePartial(accumulated);
  if (parsed?.spec) semanticResult.value = parsed.spec;
  schedulePreviewScrollToBottom();
}

function scheduleSemanticStreamPreview(accumulated) {
  if (semanticStreamFrame) return;
  semanticStreamFrame = requestAnimationFrame(() => flushSemanticStreamPreview(accumulated));
}

function handleStopSemantic() {
  semanticAiRequest?.abort?.();
  isPreviewRevealing.value = false;
}

function handlePreviewRevealComplete() {
  isPreviewRevealing.value = false;
}

function handlePreviewRevealTick() {
  if (stickToBottom.value) schedulePreviewScrollToBottom();
}

function openHistoryDrawer() {
  historyDrawerVisible.value = true;
}

function applySemanticFormState({
  moodKey,
  moodIsCustom: isCustomMood,
  customMoodText: moodText,
  industryKey,
  industryIsCustom: isCustomIndustry,
  customIndustryText: industryText,
  keywords
}) {
  if (isCustomMood) {
    moodIsCustom.value = true;
    selectedMood.value = CUSTOM_OPTION;
    customMoodText.value = moodText || '';
  } else {
    moodIsCustom.value = false;
    selectedMood.value = moodKey || 'cool';
    customMoodText.value = '';
  }

  if (isCustomIndustry) {
    industryIsCustom.value = true;
    selectedIndustry.value = CUSTOM_OPTION;
    customIndustryText.value = industryText || '';
  } else {
    industryIsCustom.value = false;
    selectedIndustry.value = industryKey || 'tech';
    customIndustryText.value = '';
  }

  semanticKeywords.value = keywords || '';
}

function handleLoadSemanticHistory(session) {
  if (!session?.spec) return;

  if (isGenerating.value) {
    handleStopSemantic();
    isGenerating.value = false;
  }

  activeTab.value = 'semantic';
  applySemanticFormState(session);
  semanticResult.value = session.spec;
  stickToBottom.value = false;
  showScrollBottomBtn.value = false;

  nextTick(() => {
    semanticPreviewRef.value?.scrollTo({ top: 0, behavior: 'auto' });
  });
}

function handleNewSemanticSession() {
  if (isGenerating.value) {
    handleStopSemantic();
    isGenerating.value = false;
  }

  semanticResult.value = null;
  isPreviewRevealing.value = false;
  applySemanticFormState({
    moodKey: 'cool',
    moodIsCustom: false,
    customMoodText: '',
    industryKey: 'tech',
    industryIsCustom: false,
    customIndustryText: '',
    keywords: ''
  });
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;

  nextTick(() => {
    semanticPreviewRef.value?.scrollTo({ top: 0, behavior: 'auto' });
  });
}

function resolveSemanticGenerationResult(accumulated) {
  if (!accumulated?.trim()) {
    if (semanticResult.value?.name) return semanticResult.value;
    throw new Error('AI 返回内容为空');
  }
  return finalizeSemanticAiResponse(accumulated);
}

function completeSemanticGeneration(accumulated) {
  semanticResult.value = resolveSemanticGenerationResult(accumulated);
  isGenerating.value = false;
  persistSemanticHistory();
  schedulePreviewScrollToBottom();
}

function persistSemanticHistory() {
  const spec = toRaw(semanticResult.value);
  if (!spec?.name) return;

  saveSemanticHistorySession({
    moodKey: selectedMood.value,
    moodIsCustom: moodIsCustom.value,
    customMoodText: customMoodText.value,
    industryKey: selectedIndustry.value,
    industryIsCustom: industryIsCustom.value,
    customIndustryText: customIndustryText.value,
    keywords: semanticKeywords.value.trim(),
    spec
  });
}

async function handleGenerateSemantic() {
  if (isGenerating.value) {
    handleStopSemantic();
    return;
  }

  if (!window.utools?.ai) {
    showToast(null, '请在 uTools 环境中使用 AI 配色功能', 'warning');
    return;
  }

  const mood = getMoodValue();
  const industry = getIndustryValue();
  if (!mood) {
    showToast(null, moodIsCustom.value ? '请输入自定义情绪调性' : '请选择情绪调性', 'warning');
    return;
  }
  if (!industry) {
    showToast(null, industryIsCustom.value ? '请输入自定义行业场景' : '请选择行业场景', 'warning');
    return;
  }

  semanticAiRequest?.abort?.();
  isGenerating.value = true;
  isPreviewRevealing.value = true;
  semanticResult.value = null;
  stickToBottom.value = true;
  showScrollBottomBtn.value = false;
  nextTick(() => scrollPreviewToBottom(true));

  let accumulated = '';
  try {
    const messages = buildSemanticAiMessages({
      mood,
      industry,
      keywords: semanticKeywords.value.trim()
    });

    semanticAiRequest = window.utools.ai({ messages }, (chunk) => {
      if (!chunk?.content) return;
      accumulated += chunk.content;
      scheduleSemanticStreamPreview(accumulated);
    });
    await semanticAiRequest;

    if (semanticStreamFrame) {
      cancelAnimationFrame(semanticStreamFrame);
      semanticStreamFrame = null;
    }
    completeSemanticGeneration(accumulated);
  } catch (err) {
    if (semanticStreamFrame) {
      cancelAnimationFrame(semanticStreamFrame);
      semanticStreamFrame = null;
    }
    if (err?.name !== 'AbortError') {
      try {
        completeSemanticGeneration(accumulated);
        return;
      } catch {
        if (semanticResult.value?.name) {
          isGenerating.value = false;
          isPreviewRevealing.value = true;
          persistSemanticHistory();
          schedulePreviewScrollToBottom();
          return;
        }
        isPreviewRevealing.value = false;
        showToast(null, 'AI 配色生成失败，请重试', 'error');
      }
    } else {
      isPreviewRevealing.value = false;
    }
    isGenerating.value = false;
  } finally {
    semanticAiRequest = null;
  }
}
function generateMonochrome() {
  const rgb = parseColor(monoColor.value);
  if (!rgb) return;
  const hsl = rgbToHsl(rgb);

  const shades = [];
  for (let i = 0; i < 9; i++) {
    const l = 10 + i * 10;
    const newRgb = hslToRgb({ h: hsl.h, s: hsl.s, l, a: 1 });
    shades.push(rgbToHex(newRgb).toUpperCase());
  }
  monochromeShades.value = shades;

  const analogous = [];
  [-30, 0, 30].forEach((offset, idx) => {
    const h = (hsl.h + offset + 360) % 360;
    const newRgb = hslToRgb({ h, s: hsl.s, l: hsl.l, a: 1 });
    const hex = rgbToHex(newRgb).toUpperCase();
    const names = ['左侧邻近色', '主色', '右侧邻近色'];
    analogous.push({ name: names[idx], color: hex });
  });
  analogousColors.value = analogous;

  const complementary = [];
  [0, 180].forEach((offset, idx) => {
    const h = (hsl.h + offset) % 360;
    const newRgb = hslToRgb({ h, s: hsl.s, l: hsl.l, a: 1 });
    const hex = rgbToHex(newRgb).toUpperCase();
    const names = ['主色', '互补色'];
    complementary.push({ name: names[idx], color: hex });
  });
  [120, 240].forEach((offset, idx) => {
    const h = (hsl.h + offset) % 360;
    const newRgb = hslToRgb({ h, s: hsl.s, l: hsl.l, a: 1 });
    const hex = rgbToHex(newRgb).toUpperCase();
    const names = ['三等分色 1', '三等分色 2'];
    complementary.push({ name: names[idx], color: hex });
  });
  complementaryColors.value = complementary;
}
function handleScenarioSelect(key) {
  selectedScenario.value = key;
}
function getScenarioPreviewStyle() {
  return {
    background: currentScenario.value.bg,
    borderColor: currentScenario.value.primary
  };
}
function generateUnique() {
  const data = {
    tech: { name: '差异化科技配色', description: '规避常规蓝色，使用暖橙/琥珀/深绿等差异化配色', colors: [
      { name: '主色', color: '#F59E0B' }, { name: '辅色', color: '#10B981' }, { name: '点缀', color: '#8B5CF6' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#FFFBEB' }
    ]},
    finance: { name: '差异化金融配色', description: '打破红金传统，采用深紫/森林绿/深海蓝', colors: [
      { name: '主色', color: '#7C3AED' }, { name: '辅色', color: '#047857' }, { name: '点缀', color: '#0891B2' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#FAF5FF' }
    ]},
    ecommerce: { name: '差异化电商配色', description: '远离橙红黄，使用薄荷绿/粉紫/天青蓝', colors: [
      { name: '主色', color: '#14B8A6' }, { name: '辅色', color: '#A855F7' }, { name: '点缀', color: '#0EA5E9' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#F0FDFA' }
    ]},
    food: { name: '差异化餐饮配色', description: '跳出食物橙红，使用藏红花/橄榄绿/深陶土', colors: [
      { name: '主色', color: '#B45309' }, { name: '辅色', color: '#4D7C0F' }, { name: '点缀', color: '#BE123C' },
      { name: '文字', color: '#1C1917' }, { name: '背景', color: '#FEF3C7' }
    ]}
  };
  uniqueResult.value = data[selectedAvoidIndustry.value] || data.tech;
}
function getAvoidIndustryLabel() {
  const opt = avoidIndustryOptions.find(o => o.key === selectedAvoidIndustry.value);
  return opt ? opt.label : '';
}
function copyValue(value, label) {
  copyToClipboard(value);
  showToast(null, '已复制 ' + label + ': ' + value, 'success');
}

onMounted(() => {
  generateMonochrome();
  generateUnique();
});

onUnmounted(() => {
  if (semanticStreamFrame) cancelAnimationFrame(semanticStreamFrame);
  semanticAiRequest?.abort?.();
});
</script>

<template>
  <!-- 页头左侧： AI 配色说明 -->
  <Teleport v-if="activeTab === 'semantic'" to="#page-header-leading-slot">
    <span class="semantic-header-desc">{{ SEMANTIC_HEADER_DESC }}</span>
  </Teleport>

  <!-- 页头右侧：新会话 / 历史记录 / 专业模式模块切换 -->
  <Teleport to="#intelligent-color-matching-header-slot">
    <div class="icm-header-tools">
      <button
        v-if="activeTab === 'semantic' && semanticInSession"
        class="icm-new-session-btn"
        title="新会话"
        @click="handleNewSemanticSession"
      >
        新会话
      </button>
      <button
        class="icm-history-btn"
        title="历史记录"
        @click="openHistoryDrawer"
      >
        <span class="iconfont icon-Areality-HistoricalRecord"></span>
      </button>
      <Selector
        v-model="activeTab"
        class="header-module-selector"
        :block="false"
        :flex="false"
      >
        <option v-for="tab in ADVANCED_TABS" :key="tab.key" :value="tab.key">{{ tab.label }}</option>
      </Selector>
    </div>
  </Teleport>

  <SemanticHistoryDrawer
    v-model:visible="historyDrawerVisible"
    @select="handleLoadSemanticHistory"
  />

  <div class="advanced-mode">
    <section v-if="activeTab === 'semantic'" class="semantic-panel">
      <div class="semantic-layout">
        <!-- 场景区（左侧） -->
        <div class="semantic-column semantic-column--scene">
          <h3 class="semantic-column-title">场景</h3>
          <div class="semantic-input">
            <div class="semantic-input-block">
              <label class="semantic-input-label">情绪调性</label>
              <template v-if="moodIsCustom">
                <Input
                  v-model="customMoodText"
                  placeholder="请输入自定义情绪调性"
                  :disabled="isSceneInputDisabled"
                />
                <button
                  type="button"
                  class="custom-back-link"
                  :disabled="isSceneInputDisabled"
                  @click="handleMoodBackToPreset"
                >选择预设</button>
              </template>
              <Selector v-else v-model="selectedMood" :block="true" :disabled="isSceneInputDisabled">
                <option value="">请选择情绪调性</option>
                <option v-for="m in moodOptions" :key="m.key" :value="m.key">{{ m.label }}</option>
                <option :value="CUSTOM_OPTION">自定义</option>
              </Selector>
            </div>
            <div class="semantic-input-block">
              <label class="semantic-input-label">行业场景</label>
              <template v-if="industryIsCustom">
                <Input
                  v-model="customIndustryText"
                  placeholder="请输入自定义行业场景"
                  :disabled="isSceneInputDisabled"
                />
                <button
                  type="button"
                  class="custom-back-link"
                  :disabled="isSceneInputDisabled"
                  @click="handleIndustryBackToPreset"
                >选择预设</button>
              </template>
              <Selector v-else v-model="selectedIndustry" :block="true" :disabled="isSceneInputDisabled">
                <option value="">请选择行业场景</option>
                <option v-for="i in industryOptions" :key="i.key" :value="i.key">{{ i.label }}</option>
                <option :value="CUSTOM_OPTION">自定义</option>
              </Selector>
            </div>
            <div class="semantic-input-block">
              <label class="semantic-input-label">补充关键词</label>
              <Textarea
                v-model="semanticKeywords"
                placeholder="如：B 端后台、简约、高对比度…"
                :rows="3"
                resize="vertical"
                :disabled="isSceneInputDisabled"
              />
            </div>
            <!-- 操作区 -->
            <div class="semantic-action-row">
              <button
                class="primary-btn semantic-generate-btn"
                :class="{ 'semantic-generate-btn--stop': isGenerating }"
                :disabled="semanticInSession && !isGenerating"
                @click="handleGenerateSemantic"
              >
                {{ isGenerating ? '停止生成' : '生成配色' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 预览区（右侧） -->
        <div class="semantic-column semantic-column--preview">
          <div class="semantic-column-head">
            <h3 class="semantic-column-title">预览</h3>
            <div v-if="showPreviewActions" class="semantic-preview-toolbar">
              <p class="semantic-preview-tip">{{ SEMANTIC_PREVIEW_TIP }}</p>
              <div class="semantic-preview-actions">
                <button
                  type="button"
                  class="semantic-preview-action"
                  @click="handleSaveScreenshot"
                >保存截图</button>
                <button
                  type="button"
                  class="semantic-preview-action"
                  @click="handleDownloadDesignSpec"
                >下载文档</button>
              </div>
            </div>
          </div>
          <div class="semantic-preview-wrap">
            <div
              ref="semanticPreviewRef"
              class="semantic-preview"
              @scroll="handlePreviewScroll"
            >
              <div v-if="!semanticResult && !isGenerating" class="semantic-preview-empty">
                <span class="iconfont icon-Areality-AIMode semantic-preview-empty-icon"></span>
                <p class="semantic-preview-empty-title">配色预览区</p>
                <p class="semantic-preview-empty-desc">在左侧填写配色需求并点击「生成配色」，UI 设计规范将在此展示</p>
              </div>

              <div
                v-else
                ref="semanticPreviewContentRef"
                class="semantic-preview-content"
              >
                <SemanticDesignSpecPreview
                  v-if="semanticResult"
                  class="semantic-spec-preview"
                  :spec="semanticResult"
                  :streaming="isPreviewStreaming"
                  :ai-pending="isGenerating"
                  @reveal-complete="handlePreviewRevealComplete"
                  @reveal-tick="handlePreviewRevealTick"
                />
                <div v-else class="semantic-streaming-wait">
                  <span class="semantic-streaming-cursor">|</span>
                </div>
              </div>
            </div>
            <button
              v-if="showPreviewScrollBtn"
              type="button"
              class="semantic-scroll-bottom-btn"
              title="回到底部"
              @click="handlePreviewScrollToBottom"
            >
              <span class="iconfont icon-BackTop semantic-scroll-bottom-icon"></span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'monochrome'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">基于单色延展配色</h3>
        <span class="panel-sub">输入主色，自动生成互补色、邻近色、三等分色及同色系深浅色阶</span>
      </div>

      <div class="mono-input-row">
        <ColorPicker v-model="monoColor" />
        <button class="primary-btn" @click="generateMonochrome">生成延展</button>
      </div>

      <div class="mono-preview">
        <div class="mono-preview-main" :style="{ background: monoColor }">
          <span :style="{ color: getContrastColor(monoColor) }">主色 {{ monoColor }}</span>
        </div>
      </div>

      <div class="mono-section">
        <div class="section-title">同色系深浅色阶（9阶）</div>
        <div class="color-grid-9">
          <div
            v-for="(c, idx) in monochromeShades"
            :key="c"
            class="color-card-sm"
            :style="{ background: c }"
          >
            <span class="color-card-sm-hex" :style="{ color: getContrastColor(c) }">{{ c }}</span>
            <button class="copy-btn-xs" @click="copyValue(c, '色阶 ' + (idx + 1))">复制</button>
          </div>
        </div>
      </div>

      <div class="mono-section">
        <div class="section-title">邻近色（左右各 30°）</div>
        <div class="color-grid-3">
          <div
            v-for="(c, idx) in analogousColors"
            :key="c.name"
            class="color-card"
            :style="{ background: c.color }"
          >
            <div class="color-card-text" :style="{ color: getContrastColor(c.color) }">
              <div class="color-card-name">{{ c.name }}</div>
              <div class="color-card-hex">{{ c.color }}</div>
            </div>
            <button class="copy-btn-sm" @click="copyValue(c.color, c.name)">复制</button>
          </div>
        </div>
      </div>

      <div class="mono-section">
        <div class="section-title">互补色 / 三等分色 / 分裂互补色</div>
        <div class="color-grid-4">
          <div
            v-for="(c, idx) in complementaryColors"
            :key="c.name"
            class="color-card"
            :style="{ background: c.color }"
          >
            <div class="color-card-text" :style="{ color: getContrastColor(c.color) }">
              <div class="color-card-name">{{ c.name }}</div>
              <div class="color-card-hex">{{ c.color }}</div>
            </div>
            <button class="copy-btn-sm" @click="copyValue(c.color, c.name)">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'scenario'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">场景定向配色</h3>
        <span class="panel-sub">适配海报、APP、PPT、社交媒体封面等场景，区分深浅模式</span>
      </div>

      <div class="scenario-grid">
        <div
          v-for="s in scenarioOptions"
          :key="s.key"
          class="scenario-card"
          :class="{ active: selectedScenario === s.key }"
          @click="handleScenarioSelect(s.key)"
        >
          <div class="scenario-icon">{{ s.emoji }}</div>
          <div class="scenario-name">{{ s.label }}</div>
          <div class="scenario-desc">{{ s.desc }}</div>
        </div>
      </div>

      <div v-if="selectedScenario" class="scenario-result">
        <div class="mode-switch">
          <button
            :class="['mode-btn', { active: darkMode === false }]"
            @click="darkMode = false"
          >浅色模式</button>
          <button
            :class="['mode-btn', { active: darkMode === true }]"
            @click="darkMode = true"
          >深色模式</button>
        </div>

        <div class="scenario-preview" :style="getScenarioPreviewStyle()">
          <div class="scenario-preview-title">预览效果</div>
          <div class="scenario-preview-content">
            <div class="scenario-preview-primary" :style="{ background: currentScenario.primary }">
              <span :style="{ color: getContrastColor(currentScenario.primary) }">主色</span>
            </div>
            <div class="scenario-preview-secondary" :style="{ background: currentScenario.secondary }">
              <span :style="{ color: getContrastColor(currentScenario.secondary) }">辅色</span>
            </div>
            <div class="scenario-preview-accent" :style="{ background: currentScenario.accent }">
              <span :style="{ color: getContrastColor(currentScenario.accent) }">点缀</span>
            </div>
          </div>
        </div>

        <div class="color-grid-5">
          <div
            v-for="(c, idx) in currentScenarioColors"
            :key="c.name"
            class="color-card"
            :style="{ background: c.color }"
          >
            <div class="color-card-text" :style="{ color: getContrastColor(c.color) }">
              <div class="color-card-name">{{ c.name }}</div>
              <div class="color-card-hex">{{ c.color }}</div>
            </div>
            <button class="copy-btn-sm" @click="copyValue(c.color, c.name)">复制</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'unique'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">去同质化配色</h3>
        <span class="panel-sub">规避行业烂大街配色，输出差异化商业配色方案</span>
      </div>

      <div class="unique-input-row">
        <Selector v-model="selectedAvoidIndustry" :block="false" :flex="true">
          <option v-for="i in avoidIndustryOptions" :key="i.key" :value="i.key">{{ i.label }}</option>
        </Selector>
        <button class="primary-btn" @click="generateUnique">生成差异化配色</button>
      </div>

      <div v-if="uniqueResult" class="unique-result">
        <div class="result-title">{{ uniqueResult.name }}</div>
        <div class="result-desc">{{ uniqueResult.description }}</div>
        <div class="color-grid-5">
          <div
            v-for="(c, idx) in uniqueResult.colors"
            :key="c.name"
            class="color-card"
            :style="{ background: c.color }"
          >
            <div class="color-card-text" :style="{ color: getContrastColor(c.color) }">
              <div class="color-card-name">{{ c.name }}</div>
              <div class="color-card-hex">{{ c.color }}</div>
            </div>
            <button class="copy-btn-sm" @click="copyValue(c.color, c.name)">复制</button>
          </div>
        </div>
      </div>

      <div class="avoid-section">
        <div class="section-title">需要规避的典型配色（{{ getAvoidIndustryLabel() }}）</div>
        <div class="color-grid-4">
          <div
            v-for="(c, idx) in avoidColors"
            :key="c.name"
            class="color-card-sm"
            :style="{ background: c.color }"
          >
            <span class="color-card-sm-hex" :style="{ color: getContrastColor(c.color) }">
              {{ c.name }} {{ c.color }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.advanced-mode {
  width: 100%;
  min-width: 0;
  padding-top: var(--size-20);
}

.panel {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px;
}
.panel-header { margin-bottom: 16px; }
.panel-title { font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: var(--text-primary); }
.panel-sub { font-size: 12px; color: var(--text-tertiary); }

.primary-btn {
  padding: 8px 18px; background: var(--accent); color: var(--text-invert);
  border: 1px solid var(--accent); border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.semantic-panel {
  position: relative;
  min-width: 0;
}
.semantic-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  min-height: 360px;
}
.semantic-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.semantic-column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 28px;
}
.semantic-column-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  flex-shrink: 0;
}
.semantic-preview-wrap {
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.semantic-preview {
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-muted);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  max-height: calc(100vh - 56px - 36px - 80px);
  overflow-y: auto;
}
.semantic-preview-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1;
  flex-shrink: 1;
  min-width: 0;
}
.semantic-preview-tip {
  margin: 0 auto 0 0;
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.5;
  min-width: 0;
}
.semantic-preview-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.semantic-scroll-bottom-btn {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 20;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
}
.semantic-scroll-bottom-icon {
  display: inline-block;
  transform: rotate(180deg);
  font-size: 16px;
  line-height: 1;
}
.semantic-preview-action {
  padding: 0;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
  transition: color 0.15s ease;
  white-space: nowrap;
  &:hover {
    color: var(--accent-hover);
    text-decoration: underline;
  }
}
.semantic-preview-content {
  min-width: 0;
}

@media (max-width: 640px) {
  .semantic-column-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .semantic-preview-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
  .semantic-preview-tip {
    margin: 0;
  }
  .semantic-preview-actions {
    flex-wrap: wrap;
    gap: 12px;
  }
}

.semantic-spec-preview {
  animation: semanticSpecReveal 0.35s ease both;
}
@keyframes semanticSpecReveal {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.semantic-preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  text-align: center;
  padding: 24px;
}
.semantic-preview-empty-icon {
  font-size: 36px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}
.semantic-preview-empty-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.semantic-preview-empty-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-tertiary);
  max-width: 280px;
  line-height: 1.6;
}
.semantic-input {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}
.semantic-action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}
.semantic-input-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.semantic-input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.custom-back-link {
  align-self: flex-start;
  margin-top: 2px;
  padding: 0;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--accent);
  cursor: pointer;
  &:hover:not(:disabled) { text-decoration: underline; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.semantic-generate-btn {
  width: 100%;
  padding: 10px 18px;
}
.semantic-generate-btn--stop {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  &:hover {
    background: var(--bg-card);
    color: var(--text-primary);
  }
}
.semantic-streaming-wait {
  display: flex;
  align-items: flex-start;
  min-height: 120px;
  padding: 8px 4px;
}
.semantic-streaming-cursor {
  animation: semanticCursorBlink 1s step-end infinite;
  color: var(--accent);
  font-size: 16px;
  line-height: 1.5;
}
@keyframes semanticCursorBlink {
  50% { opacity: 0; }
}

.semantic-input-row, .mono-input-row, .unique-input-row {
  display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
}

.result-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.result-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

.color-grid-5 {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.color-grid-4 {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.color-grid-3 {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.color-grid-9 {
  display: grid; grid-template-columns: repeat(9, 1fr); gap: 6px;
}

.color-card {
  min-height: 140px; border-radius: var(--radius-md); padding: 14px;
  display: flex; flex-direction: column; justify-content: space-between;
  border: 1px solid var(--border-primary); position: relative;
}
.color-card-text {
  font-size: 12px; line-height: 1.6;
}
.color-card-name { font-weight: 600; margin-bottom: 2px; }
.color-card-hex { font-family: monospace; }

.color-card-sm {
  min-height: 80px; border-radius: var(--radius-sm); padding: 8px;
  display: flex; flex-direction: column; justify-content: space-between;
  border: 1px solid var(--border-primary);
}
.color-card-sm-hex { font-size: 11px; font-family: monospace; }

.copy-btn-sm, .copy-btn-xs {
  padding: 4px 10px; background: var(--chip-on-color-bg);
  border: 1px solid var(--chip-on-color-border); border-radius: var(--radius-sm);
  font-size: 11px; cursor: pointer; color: var(--chip-on-color-text);
  &:hover { background: var(--bg-card); }
}
.copy-btn-xs { padding: 2px 6px; font-size: 10px; }

.mono-preview { margin-bottom: 20px; }
.mono-preview-main {
  padding: 24px; border-radius: var(--radius-md); text-align: center;
  font-size: 16px; font-weight: 600;
}

.mono-section { margin-top: 20px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; }

.scenario-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;
}
.scenario-card {
  padding: 16px 12px; background: var(--bg-muted); border: 2px solid var(--border-primary);
  border-radius: var(--radius-md); cursor: pointer; text-align: center;
  transition: all 0.15s ease;
  &:hover { border-color: var(--accent); }
  &.active { border-color: var(--accent); background: var(--accent-soft); }
}
.scenario-icon { font-size: 28px; margin-bottom: 8px; }
.scenario-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.scenario-desc { font-size: 11px; color: var(--text-tertiary); }

.mode-switch {
  display: inline-flex; margin-bottom: 16px;
  background: var(--bg-muted); padding: 4px; border-radius: var(--radius-md);
}
.mode-btn {
  padding: 6px 14px; border: none; background: transparent;
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  &.active { background: var(--accent); color: var(--text-invert); }
}

.scenario-preview {
  padding: 24px; border: 2px solid; border-radius: var(--radius-md); margin-bottom: 16px;
}
.scenario-preview-title { font-size: 13px; font-weight: 600; margin-bottom: 16px; }
.scenario-preview-content {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.scenario-preview-primary, .scenario-preview-secondary, .scenario-preview-accent {
  padding: 20px; border-radius: var(--radius-sm); text-align: center;
  font-size: 13px; font-weight: 600;
}

.avoid-section { margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--border-primary); }

@media (max-width: 1024px) {
  .semantic-layout { grid-template-columns: 1fr; }
  .color-grid-5, .color-grid-4, .color-grid-3, .scenario-grid { grid-template-columns: repeat(2, 1fr); }
  .color-grid-9 { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 640px) {
  .color-grid-5, .color-grid-4, .color-grid-3, .scenario-grid, .color-grid-9 { grid-template-columns: 1fr 1fr; }
}
</style>
