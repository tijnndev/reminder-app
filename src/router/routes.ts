import type { RouteRecordRaw } from 'vue-router';
import IndexPage from '../pages/IndexPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: IndexPage
      }
    ]
  }
];

export default routes;
