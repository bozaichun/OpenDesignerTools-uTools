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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
