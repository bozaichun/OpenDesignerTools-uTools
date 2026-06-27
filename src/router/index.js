// 应用路由表：Hash 模式 + 页面懒加载
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/FunctionOverview'
  },
  {
    path: '/FunctionOverview',
    name: 'FunctionOverview',
    component: () => import('../pages/FunctionOverview/index.vue'),
    meta: { title: '功能概览' }
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
    path: '/MyCollection',
    name: 'MyCollection',
    component: () => import('../pages/MyCollection/index.vue'),
    meta: { title: '我的收藏' }
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
    path: '/PaletteManager/viewGroupingDetail',
    name: 'PaletteManagerDetail',
    component: () => import('../pages/PaletteManager/viewGroupingDetail.vue'),
    meta: { title: '色板分组详情' }
  },
  {
    path: '/PrintTools',
    name: 'PrintTools',
    component: () => import('../pages/PrintTools/index.vue'),
    meta: { title: '印刷工具' }
  },
  {
    path: '/PrintTools/CmykDetail',
    name: 'PrintToolsCmykDetail',
    component: () => import('../pages/PrintTools/CmykDetail.vue'),
    meta: { title: 'CMYK 校准' }
  },
  {
    path: '/PrintTools/PantoneDetail',
    name: 'PrintToolsPantoneDetail',
    component: () => import('../pages/PrintTools/PantoneDetail.vue'),
    meta: { title: '潘通匹配' }
  },
  {
    path: '/PrintTools/OverprintPreviewDetail',
    name: 'PrintToolsOverprintDetail',
    component: () => import('../pages/PrintTools/OverprintPreviewDetail.vue'),
    meta: { title: '叠印预览' }
  },
  {
    path: '/PrintTools/ScreenTintConverDetail',
    name: 'PrintToolsScreenTintDetail',
    component: () => import('../pages/PrintTools/ScreenTintConverDetail.vue'),
    meta: { title: '网点换算' }
  },
  {
    path: '/ColorTools',
    name: 'ColorTools',
    component: () => import('../pages/ColorTools/index.vue'),
    meta: { title: '调色工具' }
  },
  {
    path: '/ColorTools/AdjustDetail',
    name: 'ColorToolsAdjustDetail',
    component: () => import('../pages/ColorTools/AdjustDetail.vue'),
    meta: { title: '色阶微调' }
  },
  {
    path: '/ColorTools/GradientDetail',
    name: 'ColorToolsGradientDetail',
    component: () => import('../pages/ColorTools/GradientDetail.vue'),
    meta: { title: '渐变编辑' }
  },
  {
    path: '/ColorTools/DifferenceDetail',
    name: 'ColorToolsDifferenceDetail',
    component: () => import('../pages/ColorTools/DifferenceDetail.vue'),
    meta: { title: '色差比对' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
