<script lang="ts" setup>
import { ref, computed, watch, provide, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarLayout from './layout/Sidebar/index.vue';
import HeaderLayout from './layout/Header/index.vue';
import MainContentLayout from './layout/MainConter/index.vue';
import ContentBodyLayout from './layout/ContentBody/index.vue';
import FooterLayout from './layout/Footer/index.vue';
import Toast from './components/Toast.vue';
import Dialog from './components/Dialog.vue';
import Drawer from './components/Drawer.vue';
import { NAV_MENU_ITEMS } from './data/navMenu.js';
import { TAB_BY_ROUTE, translate } from './config/i18n.js';
import { getDetailModuleDescription as getPrintDetailModuleDescription } from './pages/PrintTools/printToolsUtils.js';
import { getDetailModuleDescription as getColorDetailModuleDescription } from './pages/ColorTools/colorToolsUtils.js';

const route = useRoute();
const router = useRouter();

const sidebarCollapsed = ref(false);
const toasts = ref([]);
const headerActionButtons = ref([]);
const navDrawerVisible = ref(false);
const navMenuItems = NAV_MENU_ITEMS;
const settingVisible = ref(false);
const themeMode = ref('system');
const language = ref('zh-CN');
const themeOptions = [
  { value: 'system', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeSystem' },
  { value: 'light', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeLight' },
  { value: 'dark', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeDark' }
];
const languageOptions = [
  { value: 'zh-CN', icon: 'icon-Areality-ModeSwitching', labelKey: 'langZhCN' },
  { value: 'zh-TW', icon: 'icon-Areality-ModeSwitching', labelKey: 'langZhTW' },
  { value: 'en', icon: 'icon-Areality-ModeSwitching', labelKey: 'langEn' },
  { value: 'ja', icon: 'icon-Areality-ModeSwitching', labelKey: 'langJa' },
  { value: 'ko', icon: 'icon-Areality-ModeSwitching', labelKey: 'langKo' },
  { value: 'ru', icon: 'icon-Areality-ModeSwitching', labelKey: 'langRu' }
];

function t(key) {
  return translate(language.value, key);
}

const currentTab = computed(() => {
  return TAB_BY_ROUTE[route.path] || 'FunctionOverview';
});

const currentTabLabel = computed(() => {
  const map = {
    FunctionOverview: 'functionOverview',
    BasicKnowledge: 'basicKnowledge',
    ColorConversion: 'colorConversion',
    ImageColorSampling: 'imageSampling',
    PresetColors: 'presetColors',
    MyCollection: 'myCollection',
    AccessibilityCheck: 'accessibilityCheck',
    IntelligentColorMatching: 'intelligentMatching',
    PaletteManager: 'paletteManager',
    PrintTools: 'printTools',
    ColorTools: 'colorTools'
  };
  return t(map[currentTab.value] || 'functionOverview');
});

const pageTitle = computed(() => {
  if (route.path === '/ImageColorSampling/detailPage') {
    return t('analysisResult');
  }
  if (route.path === '/PaletteManager/viewGroupingDetail') {
    return route.query.name || '分组详情';
  }
  if (route.path === '/PrintTools/CmykDetail') return 'CMYK 校准';
  if (route.path === '/PrintTools/PantoneDetail') return '潘通匹配';
  if (route.path === '/PrintTools/OverprintPreviewDetail') return '叠印预览';
  if (route.path === '/PrintTools/ScreenTintConverDetail') return '网点换算';
  if (route.path === '/ColorTools/AdjustDetail') return '色阶微调';
  if (route.path === '/ColorTools/GradientDetail') return '渐变编辑';
  if (route.path === '/ColorTools/DifferenceDetail') return '色差比对';
  return currentTabLabel.value;
});

const pageSubtitle = computed(() => {
  if (route.path.startsWith('/PrintTools/')) {
    return getPrintDetailModuleDescription(route.path, route.query || {});
  }
  if (route.path.startsWith('/ColorTools/')) {
    return getColorDetailModuleDescription(route.path);
  }
  return '';
});

const isDetailRoute = computed(() => {
  return route.path === '/ImageColorSampling/detailPage'
    || route.path === '/PaletteManager/viewGroupingDetail'
    || route.path.startsWith('/PrintTools/')
    || route.path.startsWith('/ColorTools/');
});

provide('setHeaderActions', (buttons) => {
  headerActionButtons.value = buttons || [];
});

provide('clearHeaderActions', () => {
  headerActionButtons.value = [];
});

provide('t', (key) => {
  return t(key);
});

provide('currentTheme', () => themeMode.value);
provide('currentLanguage', () => language.value);

function handleTabChange(tabId) {
  router.push('/' + tabId);
}

function handleNavDrawerSelect(tabId) {
  navDrawerVisible.value = false;
  if (tabId !== currentTab.value) {
    handleTabChange(tabId);
  }
}

function handleBackFromDetail() {
  if (route.path === '/PaletteManager/viewGroupingDetail') {
    router.push('/PaletteManager');
    return;
  }
  if (route.path.startsWith('/PrintTools/')) {
    router.push('/PrintTools');
    return;
  }
  if (route.path.startsWith('/ColorTools/')) {
    router.push('/ColorTools');
    return;
  }
  router.push('/ImageColorSampling');
}

function changeTheme(mode) {
  themeMode.value = mode;
  applyTheme();
  persistSettings();
}

function changeLanguage(lang) {
  language.value = lang;
  persistSettings();
  document.documentElement.setAttribute('lang', lang);
}

function applyTheme() {
  const root = document.documentElement;
  if (themeMode.value === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', themeMode.value);
  }
}

function persistSettings() {
  try {
    localStorage.setItem('app.theme', themeMode.value);
    localStorage.setItem('app.language', language.value);
  } catch (err) {}
}

function loadSettings() {
  try {
    const theme = localStorage.getItem('app.theme');
    const lang = localStorage.getItem('app.language');
    if (theme) themeMode.value = theme;
    if (lang) language.value = lang;
  } catch (err) {}
  applyTheme();
  document.documentElement.setAttribute('lang', language.value);
}

function listenForSettings() {
  window.__openSettings__ = function() {
    settingVisible.value = true;
  };
}

watch(() => route.path, () => {
  headerActionButtons.value = [];
  navDrawerVisible.value = false;
});

onMounted(() => {
  loadSettings();
  listenForSettings();

  if (window.utools && typeof window.utools.onPluginEnter === 'function') {
    window.utools.onPluginEnter((action) => {
      const code = action && action.code;
      if (code === 'color_preset') {
        router.push('/PresetColors');
      } else if (code === 'color_knowledge') {
        router.push('/BasicKnowledge');
      } else if (code === 'color_convert') {
        router.push('/ColorConversion');
      } else if (code === 'color_image') {
        router.push('/ImageColorSampling');
      }
    });
  }

  window.__colorToast__ = function(msg, type) {
    const id = Date.now() + Math.random();
    toasts.value.push({ id, message: msg, type: type || 'success' });
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, 2000);
  };
});
</script>

<template>
  <div class="app-layout">
    <!-- 左侧导航 -->
    <sidebar-layout
      :current-tab="currentTab"
      :collapsed="sidebarCollapsed"
      @update:current-tab="handleTabChange"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- 右侧内容区 -->
    <main-content-layout>
      <!-- 页头 -->
      <header-layout
        :title="pageTitle"
        :subtitle="pageSubtitle"
        :is-detail="isDetailRoute"
        @back="handleBackFromDetail"
        @show-setting="settingVisible = true"
      >
        <template #extra>
          <div id="print-tools-header-slot" class="print-tools-header-slot"></div>
          <div id="color-tools-header-slot" class="color-tools-header-slot"></div>
        </template>
        <template #actions>
          <template v-for="(btn, idx) in headerActionButtons" :key="idx">
            <button
              class="header-action-btn"
              :class="{ secondary: btn.secondary, 'icon-only': btn.iconOnly }"
              @click="btn.onClick"
              :title="btn.label"
            >
              <span v-if="btn.icon" :class="['iconfont', btn.icon]"></span>
              <span v-if="!btn.iconOnly">{{ btn.label }}</span>
            </button>
          </template>
        </template>
        <template #mobile-expand>
          <button
            class="icon-btn header-expand-btn"
            @click="navDrawerVisible = true"
            title="展开导航"
          >
            <span class="iconfont icon-Expand"></span>
          </button>
        </template>
      </header-layout>

      <!-- 内容区 -->
      <content-body-layout>
        <router-view />
      </content-body-layout>

      <!-- 页脚 -->
      <footer-layout />
    </main-content-layout>

    <!-- Toast -->
    <div class="toast-container">
      <toast
        v-for="t in toasts"
        :key="t.id"
        :message="t.message"
        :type="t.type"
        :visible="true"
      />
    </div>

    <!-- 移动端导航抽屉 -->
    <Drawer
      v-model:visible="navDrawerVisible"
      title="导航菜单"
      placement="right"
      width="320px"
      @close="navDrawerVisible = false"
    >
      <div class="nav-drawer-menu-list">
        <div
          v-for="item in navMenuItems"
          :key="item.id"
          class="nav-drawer-menu-item"
          :class="{ active: currentTab === item.id }"
          @click="handleNavDrawerSelect(item.id)"
        >
          <span :class="['iconfont', item.icon]"></span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </Drawer>

    <!-- 设置 Dialog -->
    <Dialog
      :visible="settingVisible"
      :title="t('settings')"
      max-width="480px"
      @close="settingVisible = false"
    >
      <div class="setting-section">
        <div class="setting-label">{{ t('theme') }}</div>
        <div class="setting-options">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="setting-option"
            :class="{ active: themeMode === opt.value }"
            @click="changeTheme(opt.value)"
          >
            <span :class="['iconfont', opt.icon]"></span>
            <span>{{ t(opt.labelKey) }}</span>
          </button>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-label">{{ t('language') }}</div>
        <div class="setting-options">
          <button
            v-for="opt in languageOptions"
            :key="opt.value"
            class="setting-option"
            :class="{ active: language === opt.value }"
            @click="changeLanguage(opt.value)"
          >
            <span :class="['iconfont', opt.icon]"></span>
            <span>{{ t(opt.labelKey) }}</span>
          </button>
        </div>
      </div>

      <div class="setting-tip">{{ t('settingsSaved') }}</div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: var(--bg-primary);
}

.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.print-tools-header-slot,
.color-tools-header-slot {
  display: flex;
  align-items: center;

  :deep(.app-selector) {
    min-width: 148px;
  }

  :deep(.app-selector__trigger) {
    height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
}

.header-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  height: 30px;
  background: var(--accent);
  color: var(--text-invert);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 14px;
  }

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }

  &.secondary {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent-light);

    &:hover {
      background: var(--accent-light);
      color: var(--accent-hover);
      border-color: var(--accent);
    }
  }

  &.icon-only {
    width: 30px;
    padding: 0;
    gap: 0;

    .iconfont {
      font-size: 16px;
    }
  }
}

/* ============ 设置 Dialog 样式 ============ */
.setting-section {
  margin-bottom: 20px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.setting-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.setting-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;

  .iconfont {
    font-size: 14px;
  }

  &:hover {
    border-color: var(--border-strong);
    background: var(--bg-hover);
  }

  &.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 600;
  }
}

.setting-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

@media (max-width: 640px) {
  .setting-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .app-layout {
    flex-direction: column;
  }
}

.nav-drawer-menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-drawer-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-drawer-menu-item .iconfont {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.nav-drawer-menu-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-drawer-menu-item.active {
  background: var(--accent);
  color: var(--text-invert);
}

:deep(.header-expand-btn) {
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

:deep(.header-expand-btn .iconfont) {
  font-size: 16px;
  line-height: 1;
}

:deep(.header-expand-btn:hover) {
  background: var(--accent);
  color: var(--text-invert);
  border-color: var(--accent);
}
</style>
