import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0, behavior: 'instant' },
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { public: true, depth: 0 },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Сегодня', depth: 0 },
    },
    {
      path: '/archive',
      name: 'archive',
      component: () => import('@/views/ArchiveView.vue'),
      meta: { title: 'Дни', depth: 1 },
    },
    {
      path: '/archive/:dayId',
      name: 'archive-day',
      component: () => import('@/views/ArchiveDayView.vue'),
      props: (route) => ({ dayId: Number(route.params.dayId) }),
      meta: { title: 'Дни', depth: 2 },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'Профиль', depth: 1 },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: 'О приложении', public: true, depth: 1 },
    },
  ],
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'auth' }
  }

  if (to.name === 'auth' && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // One navigation language: deeper = content enters from the right,
  // shallower = from the left, same level = a quick crossfade.
  const toDepth = to.meta.depth ?? 0
  const fromDepth = from.meta.depth ?? 0
  uiStore.setPageTransition(toDepth > fromDepth ? 'page-forward' : toDepth < fromDepth ? 'page-back' : 'page-fade')

  return true
})

export default router
