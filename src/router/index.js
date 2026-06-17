import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/knowledge'
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('../pages/Knowledge.vue'),
    meta: { title: '色彩知识库' }
  },
  {
    path: '/convert',
    name: 'convert',
    component: () => import('../pages/Convert.vue'),
    meta: { title: '颜色转换' }
  },
  {
    path: '/image',
    name: 'image',
    component: () => import('../pages/Image.vue'),
    meta: { title: '图片取色' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
