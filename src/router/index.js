import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/BasicKnowledge'
  },
  {
    path: '/BasicKnowledge',
    name: 'BasicKnowledge',
    component: () => import('../pages/BasicKnowledge/index.vue'),
    meta: { title: '基础知识' }
  },
  {
    path: '/ColorConversion',
    name: 'ColorConversion',
    component: () => import('../pages/ColorConversion/index.vue'),
    meta: { title: '颜色转换' }
  },
  {
    path: '/ImageColorSampling',
    name: 'ImageColorSampling',
    component: () => import('../pages/ImageColorSampling/index.vue'),
    meta: { title: '图片取色' }
  },
  {
    path: '/ImageColorSampling/detailPage',
    name: 'ImageColorSamplingDetail',
    component: () => import('../pages/ImageColorSampling/detailPage.vue'),
    meta: { title: '图片取色详情' }
  },
  {
    path: '/PresetColors',
    name: 'PresetColors',
    component: () => import('../pages/PresetColors/index.vue'),
    meta: { title: '预置颜色' }
  },
  {
    path: '/AccessibilityCheck',
    name: 'AccessibilityCheck',
    component: () => import('../pages/AccessibilityCheck/index.vue'),
    meta: { title: '色彩对比' }
  },
  {
    path: '/IntelligentColorMatching',
    name: 'IntelligentColorMatching',
    component: () => import('../pages/IntelligentColorMatching/index.vue'),
    meta: { title: '智能配色' }
  },
  {
    path: '/PaletteManager',
    name: 'PaletteManager',
    component: () => import('../pages/PaletteManager/index.vue'),
    meta: { title: '色板管理' }
  },
  {
    path: '/CodeExporter',
    name: 'CodeExporter',
    component: () => import('../pages/CodeExporter/index.vue'),
    meta: { title: '代码导出' }
  },
  {
    path: '/PrintTools',
    name: 'PrintTools',
    component: () => import('../pages/PrintTools/index.vue'),
    meta: { title: '印刷工具' }
  },
  {
    path: '/ColorTools',
    name: 'ColorTools',
    component: () => import('../pages/ColorTools/index.vue'),
    meta: { title: '调色工具' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
