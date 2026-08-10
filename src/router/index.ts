import MainaLayout from '@/layouts/maina-layout.vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    component: MainaLayout,
    children: [
      {
        path: '',
        name: 'record',
        component: () => import('@/pages/record-page.vue'),
      },
      {
        path: 'compare',
        name: 'compare',
        component: () => import('@/pages/compare-page.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/pages/history-page.vue'),
      },
      {
        path: 'history/:id',
        name: 'history-detail',
        component: () => import('@/pages/audio-detail-page.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/settings-page.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
