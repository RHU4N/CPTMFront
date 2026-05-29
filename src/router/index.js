import { createRouter, createWebHistory } from 'vue-router'
import { readAuthSession } from '@/utils/authStorage'

const routes = [
  { path: '/', redirect: '/app' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { public: true },
  },
  {
    path: '/app',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/app/efluentes/:id',
    name: 'efluente-detail',
    component: () => import('@/views/EfluenteDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/usuarios',
    name: 'admin-users',
    component: () => import('@/views/AdminUsersView.vue'),
    meta: { requiresAuth: true, roles: [1] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

function hasRequiredRole(session, roles = []) {
  if (!roles.length) {
    return true
  }

  return roles.includes(Number(session?.idPerfil ?? 0))
}

router.beforeEach((to) => {
  const session = readAuthSession()

  if (to.meta.public && session?.token && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAuth && !session?.token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!hasRequiredRole(session, to.meta.roles)) {
    return { name: 'dashboard' }
  }

  return true
})

export default router