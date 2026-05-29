<template>
  <div class="page-shell">
    <AppHeader :title="'Gerenciamento de Usuários'" @home="router.push({ name: 'dashboard' })" @logout="logout" />

    <main class="screen-grid admin-grid">
      <section class="card">
        <div class="admin-copy">
          <span class="eyebrow">Admin</span>
          <h1 class="section-title">Usuários</h1>
          <p class="section-subtitle">Consulta do endpoint /api/TB_USUARIO com filtros locais.</p>
        </div>

        <div class="admin-head">
          <button class="btn btn-primary" type="button" @click="loadUsers">Recarregar</button>
        </div>

        <div class="filters-grid">
          <label>
            <span class="field-label">Perfil</span>
            <select v-model="filters.profile" class="select">
              <option value="">Todos</option>
              <option value="1">Administrador</option>
              <option value="2">Usuário de Campo</option>
            </select>
          </label>

          <label>
            <span class="field-label">Ativo</span>
            <select v-model="filters.active" class="select">
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>

          <label>
            <span class="field-label">Buscar</span>
            <input v-model="filters.search" class="input" type="text" placeholder="Login, nome ou e-mail" />
          </label>
        </div>

        <div v-if="loading" class="loading-state">Carregando usuários...</div>
        <div v-else-if="!filteredUsers.length" class="empty-state">Nenhum usuário corresponde aos filtros.</div>

        <div v-else class="users-list">
          <article v-for="user in filteredUsers" :key="user.idUsuario" class="user-card">
            <div>
              <strong>{{ user.nmUsuario }}</strong>
              <span>{{ user.dsLogin }}</span>
              <span>{{ user.dsEmail || 'Sem e-mail informado' }}</span>
            </div>

            <div class="user-meta">
              <span>{{ user.idPerfil === 1 ? 'Administrador' : 'Usuário de Campo' }}</span>
              <span :class="user.flAtivo ? 'ok' : 'danger'">{{ user.flAtivo ? 'Ativo' : 'Inativo' }}</span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { listUsers } from '@/services/efluenteService'
import { normalizeUser } from '@/models/efluente'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const users = ref([])
const filters = reactive({ profile: '', active: '', search: '' })

const filteredUsers = computed(() => {
  const search = filters.search.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesProfile = !filters.profile || String(user.idPerfil) === String(filters.profile)
    const matchesActive = filters.active === '' || String(user.flAtivo) === filters.active
    const matchesSearch = !search || [user.nmUsuario, user.dsLogin, user.dsEmail].some((value) => String(value || '').toLowerCase().includes(search))
    return matchesProfile && matchesActive && matchesSearch
  })
})

async function loadUsers() {
  loading.value = true
  try {
    users.value = (await listUsers()).map(normalizeUser)
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar usuários.', 'error')
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}

onMounted(loadUsers)
</script>

<style scoped>
.admin-grid {
  display: grid;
  gap: 16px;
}

.admin-copy {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.admin-head,
.filters-grid {
  display: grid;
  gap: 14px;
}

.filters-grid {
  grid-template-columns: 1fr 1fr 1.5fr auto;
}

.users-list {
  display: grid;
  gap: 10px;
}

.user-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 8px;
  background: #fafafa;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.user-card strong,
.user-card span {
  display: block;
}

.user-card strong {
  margin-bottom: 2px;
}

.user-card span {
  color: var(--muted);
}

.user-meta {
  display: grid;
  gap: 6px;
  justify-items: end;
  align-content: start;
}

.ok {
  color: var(--ok);
}

.danger {
  color: var(--danger);
}

@media (max-width: 980px) {
  .filters-grid,
  .user-card {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .user-meta {
    justify-items: start;
  }
}
</style>