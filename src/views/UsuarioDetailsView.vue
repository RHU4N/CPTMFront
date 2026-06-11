<template>
  <div class="page-shell">
    <AppHeader title="Detalhes do Usuário" @home="router.push({ name: 'dashboard' })" @logout="logout" @perfil="router.push({ name: 'meu-perfil' })" />

    <main class="screen-grid">
      <section class="card detail-card">
        <div v-if="carregando" class="loading-state">Carregando...</div>

        <template v-else-if="usuario">
          <div class="detail-header">
            <span class="eyebrow">Administração › Usuários</span>
            <h1 class="section-title">{{ usuario.nmUsuario }}</h1>
            <span :class="['status-badge', usuario.flAtivo ? 'status-ativo' : 'status-inativo']">
              {{ usuario.flAtivo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <dl class="detail-grid">
            <div class="detail-item">
              <dt>Login</dt>
              <dd>{{ usuario.dsLogin }}</dd>
            </div>
            <div class="detail-item">
              <dt>E-mail</dt>
              <dd>{{ usuario.dsEmail || 'Não informado' }}</dd>
            </div>
            <div class="detail-item">
              <dt>Perfil</dt>
              <dd>{{ usuario.dsPerfil || perfilLabel(usuario.idPerfil) }}</dd>
            </div>
            <div class="detail-item">
              <dt>Primeiro Acesso</dt>
              <dd>
                <span :class="usuario.flPrimeiroAcesso ? 'badge-warn' : 'badge-ok'">
                  {{ usuario.flPrimeiroAcesso ? 'Pendente troca de senha' : 'Concluído' }}
                </span>
              </dd>
            </div>
            <div class="detail-item">
              <dt>Data de Cadastro</dt>
              <dd>{{ formatDate(usuario.dtCadastro) }}</dd>
            </div>
            <div class="detail-item">
              <dt>Última Troca de Senha</dt>
              <dd>{{ usuario.dtUltimaTrocaSenha ? formatDate(usuario.dtUltimaTrocaSenha) : 'Nunca' }}</dd>
            </div>
            <div class="detail-item">
              <dt>Última Atualização</dt>
              <dd>{{ formatDate(usuario.dtAtualizacao) }}</dd>
            </div>
          </dl>

          <div class="detail-actions">
            <button class="btn btn-secondary" @click="router.push({ name: 'admin-users' })">Voltar</button>
            <button class="btn btn-primary" @click="router.push({ name: 'usuario-edit', params: { id: usuario.idUsuario } })">Editar</button>
            <button class="btn btn-warn" :disabled="actionLoading" @click="confirmarReset">
              {{ actionLoading ? 'Aguarde...' : 'Redefinir Senha' }}
            </button>
            <button
              v-if="usuario.flAtivo"
              class="btn btn-danger"
              :disabled="actionLoading"
              @click="desativar"
            >
              {{ actionLoading ? 'Aguarde...' : 'Desativar' }}
            </button>
            <button
              v-else
              class="btn btn-success"
              :disabled="actionLoading"
              @click="reativar"
            >
              {{ actionLoading ? 'Aguarde...' : 'Reativar' }}
            </button>
          </div>

          <!-- Modal senha temporária -->
          <div v-if="senhaTemp" class="modal-overlay" @click.self="senhaTemp = null">
            <div class="modal-box">
              <h3 class="modal-title">Senha Redefinida</h3>
              <p class="modal-desc">Anote a senha temporária abaixo e entregue ao usuário. Na próxima entrada ele será obrigado a trocá-la.</p>
              <div class="senha-temp-box">{{ senhaTemp }}</div>
              <button class="btn btn-primary" style="width:100%" @click="senhaTemp = null">Fechar</button>
            </div>
          </div>
        </template>

        <div v-else class="empty-state">Usuário não encontrado.</div>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { desativarUsuario, getUsuario, reativarUsuario, redefinirSenha } from '@/services/usuarioService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const carregando = ref(true)
const actionLoading = ref(false)
const usuario = ref(null)
const senhaTemp = ref(null)

onMounted(async () => {
  try {
    usuario.value = await getUsuario(Number(route.params.id))
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar usuário.', 'error')
    router.push({ name: 'admin-users' })
  } finally {
    carregando.value = false
  }
})

async function desativar() {
  actionLoading.value = true
  try {
    await desativarUsuario(usuario.value.idUsuario)
    usuario.value = { ...usuario.value, flAtivo: false }
    uiStore.pushToast('Usuário desativado com sucesso.', 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Erro ao desativar.', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function confirmarReset() {
  if (!confirm(`Redefinir a senha de "${usuario.value.nmUsuario}"? Uma senha temporária será gerada.`)) return
  actionLoading.value = true
  try {
    const res = await redefinirSenha(usuario.value.idUsuario)
    senhaTemp.value = res.senhaTemporaria
    usuario.value = { ...usuario.value, flPrimeiroAcesso: true }
    uiStore.pushToast('Senha redefinida. Anote a senha temporária.', 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Erro ao redefinir senha.', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function reativar() {
  actionLoading.value = true
  try {
    await reativarUsuario(usuario.value.idUsuario)
    usuario.value = { ...usuario.value, flAtivo: true }
    uiStore.pushToast('Usuário reativado com sucesso.', 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Erro ao reativar.', 'error')
  } finally {
    actionLoading.value = false
  }
}

function formatDate(raw) {
  if (!raw) return '-'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
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
</script>

<style scoped>
.detail-card {
  max-width: 720px;
  margin: 0 auto;
}

.detail-header {
  display: grid;
  gap: 8px;
  margin-bottom: 28px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  width: fit-content;
}

.status-ativo {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-inativo {
  background: #ffebee;
  color: #c62828;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0 0 28px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ececec;
}

.detail-item dt {
  font-size: 0.78rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item dd {
  font-size: 0.98rem;
  color: #222;
  margin: 0;
}

.badge-warn {
  color: #e65100;
  font-weight: 600;
}

.badge-ok {
  color: #2e7d32;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-warn {
  background: #e65100;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-warn:hover:not(:disabled) {
  background: #bf360c;
}

.btn-warn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-box {
  background: white;
  border-radius: 12px;
  padding: 32px 28px;
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  color: #222;
}

.modal-desc {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
}

.senha-temp-box {
  background: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: #222;
  font-family: monospace;
}

.btn-danger {
  background: #c62828;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #b71c1c;
}

.btn-success {
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success:hover:not(:disabled) {
  background: #1b5e20;
}

.btn-danger:disabled,
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
