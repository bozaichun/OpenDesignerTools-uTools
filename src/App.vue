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

<script>
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
import { I18N_DICT, TAB_BY_ROUTE, translate } from './config/i18n.js';
import { getDetailModuleDescription as getPrintDetailModuleDescription } from './pages/PrintTools/printToolsUtils.js';
import { getDetailModuleDescription as getColorDetailModuleDescription } from './pages/ColorTools/colorToolsUtils.js';

export default {
  name: 'App',
  components: {
    SidebarLayout,
    HeaderLayout,
    MainContentLayout,
    ContentBodyLayout,
    FooterLayout,
    Toast,
    Dialog,
    Drawer
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  },
  data() {
    return {
      sidebarCollapsed: false,
      toasts: [],
      headerActionButtons: [],
      navDrawerVisible: false,
      navMenuItems: NAV_MENU_ITEMS,
      settingVisible: false,
      themeMode: 'system',
      language: 'zh-CN',
      themeOptions: [
        { value: 'system', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeSystem' },
        { value: 'light', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeLight' },
        { value: 'dark', icon: 'icon-Areality-ModeSwitching', labelKey: 'themeDark' }
      ],
      languageOptions: [
        { value: 'zh-CN', icon: 'icon-Areality-ModeSwitching', labelKey: 'langZhCN' },
        { value: 'zh-TW', icon: 'icon-Areality-ModeSwitching', labelKey: 'langZhTW' },
        { value: 'en', icon: 'icon-Areality-ModeSwitching', labelKey: 'langEn' },
        { value: 'ja', icon: 'icon-Areality-ModeSwitching', labelKey: 'langJa' },
        { value: 'ko', icon: 'icon-Areality-ModeSwitching', labelKey: 'langKo' },
        { value: 'ru', icon: 'icon-Areality-ModeSwitching', labelKey: 'langRu' }
      ]
    };
  },
  computed: {
    currentTab() {
      return TAB_BY_ROUTE[this.route.path] || 'FunctionOverview';
    },
    currentTabLabel() {
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
      return this.t(map[this.currentTab] || 'functionOverview');
    },
    pageTitle() {
      if (this.route.path === '/ImageColorSampling/detailPage') {
        return this.t('analysisResult');
      }
      if (this.route.path === '/PaletteManager/viewGroupingDetail') {
        return this.route.query.name || '分组详情';
      }
      if (this.route.path === '/PrintTools/CmykDetail') return 'CMYK 校准';
      if (this.route.path === '/PrintTools/PantoneDetail') return '潘通匹配';
      if (this.route.path === '/PrintTools/OverprintPreviewDetail') return '叠印预览';
      if (this.route.path === '/PrintTools/ScreenTintConverDetail') return '网点换算';
      if (this.route.path === '/ColorTools/AdjustDetail') return '色阶微调';
      if (this.route.path === '/ColorTools/GradientDetail') return '渐变编辑';
      if (this.route.path === '/ColorTools/DifferenceDetail') return '色差比对';
      return this.currentTabLabel;
    },
    pageSubtitle() {
      if (this.route.path.startsWith('/PrintTools/')) {
        return getPrintDetailModuleDescription(this.route.path, this.route.query || {});
      }
      if (this.route.path.startsWith('/ColorTools/')) {
        return getColorDetailModuleDescription(this.route.path);
      }
      return '';
    },
    isDetailRoute() {
      return this.route.path === '/ImageColorSampling/detailPage'
        || this.route.path === '/PaletteManager/viewGroupingDetail'
        || this.route.path.startsWith('/PrintTools/')
        || this.route.path.startsWith('/ColorTools/');
    }
  },
  provide() {
    const self = this;
    return {
      setHeaderActions(buttons) {
        self.headerActionButtons = buttons || [];
      },
      clearHeaderActions() {
        self.headerActionButtons = [];
      },
      t(key) {
        return self.t(key);
      },
      currentTheme: () => self.themeMode,
      currentLanguage: () => self.language
    };
  },
  methods: {
    t(key) {
      return translate(this.language, key);
    },
    handleTabChange(tabId) {
      this.router.push('/' + tabId);
    },
    handleNavDrawerSelect(tabId) {
      this.navDrawerVisible = false;
      if (tabId !== this.currentTab) {
        this.handleTabChange(tabId);
      }
    },
    handleBackFromDetail() {
      if (this.route.path === '/PaletteManager/viewGroupingDetail') {
        this.router.push('/PaletteManager');
        return;
      }
      if (this.route.path.startsWith('/PrintTools/')) {
        this.router.push('/PrintTools');
        return;
      }
      if (this.route.path.startsWith('/ColorTools/')) {
        this.router.push('/ColorTools');
        return;
      }
      this.router.push('/ImageColorSampling');
    },
    changeTheme(mode) {
      this.themeMode = mode;
      this.applyTheme();
      this.persistSettings();
    },
    changeLanguage(lang) {
      this.language = lang;
      this.persistSettings();
      document.documentElement.setAttribute('lang', lang);
    },
    applyTheme() {
      const root = document.documentElement;
      if (this.themeMode === 'system') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', this.themeMode);
      }
    },
    persistSettings() {
      try {
        localStorage.setItem('app.theme', this.themeMode);
        localStorage.setItem('app.language', this.language);
      } catch (err) {}
    },
    loadSettings() {
      try {
        const theme = localStorage.getItem('app.theme');
        const lang = localStorage.getItem('app.language');
        if (theme) this.themeMode = theme;
        if (lang) this.language = lang;
      } catch (err) {}
      this.applyTheme();
      document.documentElement.setAttribute('lang', this.language);
    },
    listenForSettings() {
      const self = this;
      window.__openSettings__ = function() {
        self.settingVisible = true;
      };
    }
  },
  watch: {
    '$route.path'() {
      this.headerActionButtons = [];
      this.navDrawerVisible = false;
    }
  },
  mounted() {
    this.loadSettings();
    this.listenForSettings();

    if (window.utools && typeof window.utools.onPluginEnter === 'function') {
      const self = this;
      window.utools.onPluginEnter((action) => {
        const code = action && action.code;
        if (code === 'color_preset') {
          self.router.push('/PresetColors');
        } else if (code === 'color_knowledge') {
          self.router.push('/BasicKnowledge');
        } else if (code === 'color_convert') {
          self.router.push('/ColorConversion');
        } else if (code === 'color_image') {
          self.router.push('/ImageColorSampling');
        }
      });
    }

    const self = this;
    window.__colorToast__ = function(msg, type) {
      const id = Date.now() + Math.random();
      self.toasts.push({ id, message: msg, type: type || 'success' });
      setTimeout(() => {
        self.toasts = self.toasts.filter(t => t.id !== id);
      }, 2000);
    };
  }
};
</script>

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
