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
    path: '/trocar-senha',
    name: 'trocar-senha',
    component: () => import('@/views/TrocaSenhaView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/meu-perfil',
    name: 'meu-perfil',
    component: () => import('@/views/MeuPerfilView.vue'),
    meta: { requiresAuth: true },
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
  {
    path: '/admin/usuarios/novo',
    name: 'usuario-create',
    component: () => import('@/views/UsuarioCreateView.vue'),
    meta: { requiresAuth: true, roles: [1] },
  },
  {
    path: '/admin/usuarios/:id',
    name: 'usuario-details',
    component: () => import('@/views/UsuarioDetailsView.vue'),
    meta: { requiresAuth: true, roles: [1] },
  },
  {
    path: '/admin/usuarios/:id/editar',
    name: 'usuario-edit',
    component: () => import('@/views/UsuarioEditView.vue'),
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
  if (!roles.length) return true
  return roles.includes(Number(session?.idPerfil ?? 0))
}

router.beforeEach((to) => {
  const session = readAuthSession()

  // Redireciona usuarios ja autenticados para fora do login/register
  if (to.meta.public && session?.token && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  // Requer autenticacao
  if (to.meta.requiresAuth && !session?.token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Usuario autenticado com primeiro acesso pendente:
  // Redireciona para /trocar-senha exceto se já estiver lá
  if (session?.token && session?.primeiroAcesso && to.name !== 'trocar-senha') {
    return { name: 'trocar-senha' }
  }

  // Verifica permissao de perfil
  if (!hasRequiredRole(session, to.meta.roles)) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
