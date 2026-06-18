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
        :title="currentTabLabel"
        @show-preset-modal="presetModalVisible = true"
      />

      <!-- 内容区 -->
      <content-body-layout>
        <router-view />
      </content-body-layout>
    </main-content-layout>

    <!-- 预设颜色表遮罩弹窗 -->
    <preset-modal :visible="presetModalVisible" @close="presetModalVisible = false">
      <module-preset />
    </preset-modal>

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
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import SidebarLayout from './layout/Sidebar/index.vue';
import HeaderLayout from './layout/Header/index.vue';
import MainContentLayout from './layout/MainConter/index.vue';
import ContentBodyLayout from './layout/ContentBody/index.vue';
import PresetModal from './components/PresetModal.vue';
import ModulePreset from './components/ModulePreset.vue';
import Toast from './components/Toast.vue';

const TAB_BY_ROUTE = {
  '/knowledge': 'knowledge',
  '/convert': 'convert',
  '/image': 'image'
};

const TAB_LABELS = {
  knowledge: '基础知识',
  convert: '颜色转换',
  image: '图片取色'
};

export default {
  name: 'App',
  components: {
    SidebarLayout,
    HeaderLayout,
    MainContentLayout,
    ContentBodyLayout,
    PresetModal,
    ModulePreset,
    Toast
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    return {
      route,
      router,
      TAB_BY_ROUTE,
      TAB_LABELS
    };
  },
  data() {
    return {
      sidebarCollapsed: false,
      presetModalVisible: false,
      toasts: []
    };
  },
  computed: {
    currentTab() {
      return this.TAB_BY_ROUTE[this.route.path] || 'knowledge';
    },
    currentTabLabel() {
      return this.TAB_LABELS[this.currentTab] || '';
    }
  },
  methods: {
    handleTabChange(tabId) {
      this.router.push('/' + tabId);
    }
  },
  mounted() {
    if (window.utools && typeof window.utools.onPluginEnter === 'function') {
      const self = this;
      window.utools.onPluginEnter((action) => {
        const code = action && action.code;
        if (code === 'color_preset') {
          self.presetModalVisible = true;
        } else if (code === 'color_knowledge') {
          self.router.push('/knowledge');
        } else if (code === 'color_convert') {
          self.router.push('/convert');
        } else if (code === 'color_image') {
          self.router.push('/image');
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

@media (max-width: 640px) {
  .app-layout {
    flex-direction: column;
  }
}
</style>
