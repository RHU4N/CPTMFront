<template>
  <div class="page-shell">
    <AppHeader title="Gerenciamento de Usuários" @home="router.push({ name: 'dashboard' })" @logout="logout" @perfil="router.push({ name: 'meu-perfil' })" />

    <main class="screen-grid admin-grid">
      <section class="card">
        <div class="admin-copy">
          <span class="eyebrow">Administração</span>
          <h1 class="section-title">Usuários</h1>
          <p class="section-subtitle">Gerencie os usuários do sistema. Apenas administradores têm acesso a esta área.</p>
        </div>

        <div class="admin-toolbar">
          <button class="btn btn-primary" @click="router.push({ name: 'usuario-create' })">+ Novo Usuário</button>
          <button class="btn btn-secondary" @click="loadUsers">Atualizar</button>
        </div>

        <div class="filters-grid">
          <label>
            <span class="field-label">Perfil</span>
            <select v-model="filters.profile" class="select">
              <option value="">Todos</option>
              <option v-for="p in perfis" :key="p.idPerfil" :value="String(p.idPerfil)">{{ p.dsPerfil }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Status</span>
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

        <div v-else-if="!filteredUsers.length" class="empty-state">
          Nenhum usuário corresponde aos filtros.
        </div>

        <!-- Desktop: tabela completa -->
        <div v-else class="table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Login</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Últ. Troca Senha</th>
                <th class="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.idUsuario">
                <td>
                  <span class="user-name">{{ user.nmUsuario }}</span>
                  <span v-if="user.flPrimeiroAcesso" class="badge-first">1º acesso</span>
                </td>
                <td>{{ user.dsLogin }}</td>
                <td>{{ user.dsEmail || '—' }}</td>
                <td>{{ user.dsPerfil || perfilLabel(user.idPerfil) }}</td>
                <td>
                  <span :class="['status-pill', user.flAtivo ? 'pill-ok' : 'pill-danger']">
                    {{ user.flAtivo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>{{ formatDate(user.dtCadastro) }}</td>
                <td>{{ user.dtUltimaTrocaSenha ? formatDate(user.dtUltimaTrocaSenha) : 'Nunca' }}</td>
                <td class="col-actions">
                  <div class="actions-wrap">
                    <button class="action-btn action-view" @click="router.push({ name: 'usuario-details', params: { id: user.idUsuario } })">Ver</button>
                    <button class="action-btn action-edit" @click="router.push({ name: 'usuario-edit', params: { id: user.idUsuario } })">Editar</button>
                    <button class="action-btn action-login" @click="openLoginModal(user)">Login</button>
                    <button v-if="user.flAtivo" class="action-btn action-deactivate" :disabled="actionLoading === user.idUsuario" @click="desativar(user)">Desativar</button>
                    <button v-else class="action-btn action-activate" :disabled="actionLoading === user.idUsuario" @click="reativar(user)">Reativar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: cards por usuário (CSS oculta no desktop) -->
        <div v-if="!loading && filteredUsers.length" class="user-cards">
          <div v-for="user in filteredUsers" :key="user.idUsuario" class="user-card">
            <div class="user-card-head">
              <div class="user-card-info">
                <span class="user-card-name">{{ user.nmUsuario }}</span>
                <span v-if="user.flPrimeiroAcesso" class="badge-first">1º acesso</span>
                <span class="user-card-sub">@{{ user.dsLogin }} · {{ user.dsPerfil || perfilLabel(user.idPerfil) }}</span>
                <span v-if="user.dsEmail" class="user-card-email">{{ user.dsEmail }}</span>
              </div>
              <span :class="['status-pill', user.flAtivo ? 'pill-ok' : 'pill-danger']">
                {{ user.flAtivo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="user-card-actions">
              <button class="action-btn action-view" @click="router.push({ name: 'usuario-details', params: { id: user.idUsuario } })">Ver</button>
              <button class="action-btn action-edit" @click="router.push({ name: 'usuario-edit', params: { id: user.idUsuario } })">Editar</button>
              <button class="action-btn action-login" @click="openLoginModal(user)">Login</button>
              <button v-if="user.flAtivo" class="action-btn action-deactivate" :disabled="actionLoading === user.idUsuario" @click="desativar(user)">Desativar</button>
              <button v-else class="action-btn action-activate" :disabled="actionLoading === user.idUsuario" @click="reativar(user)">Reativar</button>
            </div>
          </div>
        </div>

        <p class="total-label" v-if="!loading && filteredUsers.length">
          Exibindo {{ filteredUsers.length }} de {{ users.length }} usuário(s)
        </p>
      </section>
    </main>

    <!-- Modal trocar login -->
    <div v-if="loginModal.open" class="modal-backdrop" @click.self="loginModal.open = false">
      <div class="login-modal">
        <h3 class="modal-title">Trocar Login</h3>
        <p class="modal-sub">Usuário: <strong>{{ loginModal.user?.nmUsuario }}</strong></p>
        <label class="field-stack">
          <span class="field-label">Login atual</span>
          <input :value="loginModal.user?.dsLogin" class="input input--readonly" type="text" readonly />
        </label>
        <label class="field-stack">
          <span class="field-label">Novo login</span>
          <input
            v-model="loginModal.novoLogin"
            class="input"
            type="text"
            placeholder="Digite o novo login"
            @keyup.enter="confirmarTrocarLogin"
          />
        </label>
        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="loginModal.open = false">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="loginModal.saving || !loginModal.novoLogin.trim()" @click="confirmarTrocarLogin">
            {{ loginModal.saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { desativarUsuario, listPerfis, listUsuarios, reativarUsuario, trocarLoginUsuario } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const actionLoading = ref(null)
const users = ref([])
const perfis = ref([])
const filters = reactive({ profile: '', active: '', search: '' })
const loginModal = reactive({ open: false, user: null, novoLogin: '', saving: false })

const filteredUsers = computed(() => {
  const search = filters.search.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesProfile = !filters.profile || String(user.idPerfil) === filters.profile
    const matchesActive = filters.active === '' || String(user.flAtivo) === filters.active
    const matchesSearch =
      !search ||
      [user.nmUsuario, user.dsLogin, user.dsEmail].some((v) =>
        String(v || '').toLowerCase().includes(search),
      )
    return matchesProfile && matchesActive && matchesSearch
  })
})

async function loadUsers() {
  loading.value = true
  try {
    const [u, p] = await Promise.all([listUsuarios(), listPerfis()])
    users.value = u
    perfis.value = p
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar usuários.', 'error')
  } finally {
    loading.value = false
  }
}

async function desativar(user) {
  actionLoading.value = user.idUsuario
  try {
    await desativarUsuario(user.idUsuario)
    user.flAtivo = false
    uiStore.pushToast(`Usuário "${user.dsLogin}" desativado.`, 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Erro ao desativar.', 'error')
  } finally {
    actionLoading.value = null
  }
}

async function reativar(user) {
  actionLoading.value = user.idUsuario
  try {
    await reativarUsuario(user.idUsuario)
    user.flAtivo = true
    uiStore.pushToast(`Usuário "${user.dsLogin}" reativado.`, 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Erro ao reativar.', 'error')
  } finally {
    actionLoading.value = null
  }
}

function openLoginModal(user) {
  loginModal.user = user
  loginModal.novoLogin = ''
  loginModal.saving = false
  loginModal.open = true
}

async function confirmarTrocarLogin() {
  if (!loginModal.novoLogin.trim() || !loginModal.user) return
  loginModal.saving = true
  try {
    await trocarLoginUsuario(loginModal.user.idUsuario, loginModal.novoLogin.trim())
    loginModal.user.dsLogin = loginModal.novoLogin.trim()
    uiStore.pushToast(`Login alterado para "${loginModal.novoLogin.trim()}".`, 'success')
    loginModal.open = false
  } catch (error) {
    uiStore.pushToast(error.response?.data?.mensagem || error.message || 'Erro ao trocar login.', 'error')
  } finally {
    loginModal.saving = false
  }
}

function formatDate(raw) {
  if (!raw) return '-'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

function perfilLabel(id) {
  if (id === 1) return 'Administrador'
  if (id === 2) return 'Usuário de Campo'
  return `Perfil ${id}`
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
  gap: 6px;
  margin-bottom: 16px;
}

.admin-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 14px;
  margin-bottom: 20px;
}

.table-wrap {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  white-space: nowrap;
}

.users-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  white-space: nowrap;
}

.users-table tbody tr:hover {
  background: #fafafa;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #222;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-first {
  display: inline-block;
  font-size: 0.7rem;
  background: #fff3e0;
  color: #e65100;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 2px;
}

.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.pill-ok {
  background: #e8f5e9;
  color: #2e7d32;
}

.pill-danger {
  background: #ffebee;
  color: #c62828;
}

.col-actions {
  width: 220px;
}

.actions-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-view {
  background: #e3f2fd;
  color: #1565c0;
}

.action-login {
  background: #e8f5e9;
  color: #1b5e20;
}

.action-edit {
  background: #f3e5f5;
  color: #6a1b9a;
}

.action-deactivate {
  background: #ffebee;
  color: #c62828;
}

.action-activate {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.total-label {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #888;
  text-align: right;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 400px;
  display: grid;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.modal-sub {
  font-size: 0.88rem;
  color: #666;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.field-stack {
  display: grid;
  gap: 5px;
}

.input--readonly {
  background: #f5f5f5;
  color: #888;
  cursor: default;
}

@media (max-width: 980px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filters-grid label:last-child {
    grid-column: 1 / -1;
  }
}

/* Mobile cards — hidden on desktop */
.user-cards {
  display: none;
}

@media (max-width: 600px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    display: none;
  }

  .user-cards {
    display: grid;
    gap: 10px;
  }

  .user-card {
    background: #fafafa;
    border: 1px solid #ececec;
    border-radius: 10px;
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .user-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .user-card-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .user-card-name {
    font-weight: 700;
    font-size: 0.98rem;
    color: #222;
  }

  .user-card-sub {
    font-size: 0.82rem;
    color: #666;
  }

  .user-card-email {
    font-size: 0.8rem;
    color: #999;
  }

  .user-card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
