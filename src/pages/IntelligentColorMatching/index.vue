<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import ColorPicker from '../../components/ColorPicker.vue';
import Selector from '../../components/Selector.vue';
import { parseColor, rgbToHex, rgbToHsl, hslToRgb, copyToClipboard, showToast, getContrastColor as gcc } from '../../utils/colorUtils';

const activeTab = ref('semantic');
const tabs = [
  { key: 'semantic', label: '语义 AI 配色' },
  { key: 'monochrome', label: '单色延展' },
  { key: 'scenario', label: '场景定向' },
  { key: 'unique', label: '去同质化' }
];
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
const selectedMood = ref('cool');
const selectedIndustry = ref('tech');
const semanticResult = ref(null);

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
function generateSemantic() {
  const presets = {
    'warm-tech': { name: '温暖科技风', description: '暖色调与科技感结合，打破冷硬印象', colors: [
      { name: '主色', color: '#FF6B6B' }, { name: '辅色', color: '#FFA07A' }, { name: '点缀', color: '#FFD93D' },
      { name: '文字', color: '#2C3E50' }, { name: '背景', color: '#FFF8F0' }
    ]},
    'cool-tech': { name: '冷静科技风', description: '蓝紫渐变，专业稳重，适合 B 端产品', colors: [
      { name: '主色', color: '#1677FF' }, { name: '辅色', color: '#6366F1' }, { name: '点缀', color: '#06B6D4' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#F8FAFC' }
    ]},
    'energetic-tech': { name: '活力科技风', description: '高饱和度配色，充满能量与创新感', colors: [
      { name: '主色', color: '#7C3AED' }, { name: '辅色', color: '#EC4899' }, { name: '点缀', color: '#22D3EE' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#FAF5FF' }
    ]},
    'elegant-tech': { name: '优雅科技风', description: '低饱和度，柔和优雅，高端品牌首选', colors: [
      { name: '主色', color: '#4A5568' }, { name: '辅色', color: '#718096' }, { name: '点缀', color: '#D69E2E' },
      { name: '文字', color: '#1A202C' }, { name: '背景', color: '#F7FAFC' }
    ]},
    'fresh-tech': { name: '清新科技风', description: '绿青色调，自然清新，环保友好品牌', colors: [
      { name: '主色', color: '#10B981' }, { name: '辅色', color: '#06B6D4' }, { name: '点缀', color: '#84CC16' },
      { name: '文字', color: '#1F2937' }, { name: '背景', color: '#F0FDF4' }
    ]},
    'tech-tech': { name: '未来科技风', description: '深蓝紫黑，赛博朋克感，游戏/AI产品', colors: [
      { name: '主色', color: '#6366F1' }, { name: '辅色', color: '#8B5CF6' }, { name: '点缀', color: '#06B6D4' },
      { name: '文字', color: '#E2E8F0' }, { name: '背景', color: '#0F172A' }
    ]}
  };
  const key = (selectedMood.value || 'warm') + '-' + (selectedIndustry.value || 'tech');
  semanticResult.value = presets[key] || presets['cool-tech'];
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
  generateSemantic();
  generateMonochrome();
  generateUnique();
});
</script>

<template>
  <div class="module-intelligent">
    <!-- 功能 Tab -->
    <div class="tab-row">
      <div class="tab-scroll">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <section v-if="activeTab === 'semantic'" class="panel">
      <div class="panel-header">
        <h3 class="panel-title">语义 AI 配色</h3>
        <span class="panel-sub">输入关键词、行业风格或情绪调性，一键生成整套配色方案</span>
      </div>

      <div class="semantic-input-row">
        <Selector v-model="selectedMood" :block="false" :flex="true">
          <option value="">请选择情绪调性</option>
          <option v-for="m in moodOptions" :key="m.key" :value="m.key">{{ m.label }}</option>
        </Selector>
        <Selector v-model="selectedIndustry" :block="false" :flex="true">
          <option value="">请选择行业场景</option>
          <option v-for="i in industryOptions" :key="i.key" :value="i.key">{{ i.label }}</option>
        </Selector>
        <button class="primary-btn" @click="generateSemantic">生成配色</button>
      </div>

      <div v-if="semanticResult" class="semantic-result">
        <div class="result-title">{{ semanticResult.name }}</div>
        <div class="result-desc">{{ semanticResult.description }}</div>
        <div class="color-grid-5">
          <div
            v-for="(c, idx) in semanticResult.colors"
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
.module-intelligent { width: 100%; min-width: 0; }

.tab-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.tab-scroll {
  display: flex; gap: 8px; flex-wrap: wrap; flex: 1 1 auto; min-width: 0;
}
.tab-btn {
  padding: 8px 16px; background: var(--bg-muted); color: var(--text-secondary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-md);
  cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease;
  flex-shrink: 0;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
  &.active { background: var(--accent); color: var(--text-invert); border-color: var(--accent); }
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
  &:hover { opacity: 0.9; }
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
  .color-grid-5, .color-grid-4, .color-grid-3, .scenario-grid { grid-template-columns: repeat(2, 1fr); }
  .color-grid-9 { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 640px) {
  .color-grid-5, .color-grid-4, .color-grid-3, .scenario-grid, .color-grid-9 { grid-template-columns: 1fr 1fr; }
}
</style>
