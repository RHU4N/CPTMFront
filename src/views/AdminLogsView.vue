<template>
  <div class="page-shell">
    <AppHeader
      title="Logs do Sistema"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
      @perfil="router.push({ name: 'meu-perfil' })"
    />

    <main class="screen-grid admin-grid">
      <section class="card">
        <div class="admin-copy">
          <span class="eyebrow">Administração</span>
          <h1 class="section-title">Logs do Sistema</h1>
          <p class="section-subtitle">
            Histórico de ações dos usuários e sincronizações realizadas.
          </p>
        </div>

        <!-- Abas -->
        <div class="tab-bar">
          <button
            :class="['tab-btn', aba === 'acoes' && 'tab-btn--active']"
            @click="selecionarAba('acoes')"
          >
            Ações
          </button>
          <button
            :class="['tab-btn', aba === 'sync' && 'tab-btn--active']"
            @click="selecionarAba('sync')"
          >
            Sincronizações
          </button>
        </div>

        <!-- Filtros -->
        <div class="filters-grid">
          <label class="filter-field">
            <span class="field-label">Login do usuário</span>
            <input v-model="filtros.dsLogin" class="input" type="text" placeholder="Login..." />
          </label>

          <label v-if="aba === 'acoes'" class="filter-field">
            <span class="field-label">Ação</span>
            <input v-model="filtros.dsAcao" class="input" type="text" placeholder="Ex: CRIACAO..." />
          </label>

          <label v-if="aba === 'sync'" class="filter-field">
            <span class="field-label">Status</span>
            <select v-model="filtros.dsStatus" class="select">
              <option value="">Todos</option>
              <option value="INICIADA">Iniciada</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="FALHA">Falha</option>
            </select>
          </label>

          <label class="filter-field">
            <span class="field-label">Data início</span>
            <input v-model="filtros.dtInicio" class="input" type="date" />
          </label>

          <label class="filter-field">
            <span class="field-label">Data fim</span>
            <input v-model="filtros.dtFim" class="input" type="date" />
          </label>

          <div class="filter-actions">
            <button class="btn btn-primary" @click="buscar">Buscar</button>
            <button class="btn btn-secondary" @click="limparFiltros">Limpar</button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Carregando logs...</div>

        <template v-else>
          <!-- ============================================================
               ABA AÇÕES
          ============================================================ -->
          <template v-if="aba === 'acoes'">
            <div v-if="!dados.length" class="empty-state">Nenhum registro encontrado.</div>

            <!-- Tabela (desktop) -->
            <div v-else class="table-wrap">
              <table class="log-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Tabela</th>
                    <th>ID Registro</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in dados" :key="log.idLog">
                    <td class="col-date">{{ formatDateTime(log.dtAcao) }}</td>
                    <td>{{ log.dsLogin }}</td>
                    <td>
                      <span :class="['acao-badge', acaoBadgeClass(log.dsAcao)]">{{ log.dsAcao }}</span>
                    </td>
                    <td class="col-small">{{ log.nmTabela }}</td>
                    <td class="col-small">{{ log.idRegistro || '—' }}</td>
                    <td class="col-small">{{ log.dsIp || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cards (mobile) -->
            <div v-if="dados.length" class="log-cards">
              <div v-for="log in dados" :key="log.idLog" class="log-card">
                <div class="log-card-header">
                  <span class="log-card-date">{{ formatDateTime(log.dtAcao) }}</span>
                  <span :class="['acao-badge', acaoBadgeClass(log.dsAcao)]">{{ log.dsAcao }}</span>
                </div>
                <div class="log-card-body">
                  <div class="log-card-row">
                    <span class="log-card-label">Usuário</span>
                    <span>{{ log.dsLogin }}</span>
                  </div>
                  <div class="log-card-row">
                    <span class="log-card-label">Tabela</span>
                    <span>{{ log.nmTabela }}</span>
                  </div>
                  <div class="log-card-row">
                    <span class="log-card-label">ID Registro</span>
                    <span>{{ log.idRegistro || '—' }}</span>
                  </div>
                  <div class="log-card-row">
                    <span class="log-card-label">IP</span>
                    <span>{{ log.dsIp || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ============================================================
               ABA SINCRONIZAÇÕES
          ============================================================ -->
          <template v-if="aba === 'sync'">
            <div v-if="!dados.length" class="empty-state">Nenhum registro encontrado.</div>

            <!-- Tabela (desktop) -->
            <div v-else class="table-wrap">
              <table class="log-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Status</th>
                    <th>Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in dados" :key="log.idLog">
                    <td class="col-date">{{ formatDateTime(log.dtSincronizacao) }}</td>
                    <td>{{ log.dsLogin }}</td>
                    <td>
                      <span :class="['status-badge', statusBadgeClass(log.dsStatus)]">
                        {{ log.dsStatus }}
                      </span>
                    </td>
                    <td class="col-msg">{{ log.dsMensagem || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cards (mobile) -->
            <div v-if="dados.length" class="log-cards">
              <div v-for="log in dados" :key="log.idLog" class="log-card">
                <div class="log-card-header">
                  <span class="log-card-date">{{ formatDateTime(log.dtSincronizacao) }}</span>
                  <span :class="['status-badge', statusBadgeClass(log.dsStatus)]">{{ log.dsStatus }}</span>
                </div>
                <div class="log-card-body">
                  <div class="log-card-row">
                    <span class="log-card-label">Usuário</span>
                    <span>{{ log.dsLogin }}</span>
                  </div>
                  <div class="log-card-row log-card-row--msg">
                    <span class="log-card-label">Mensagem</span>
                    <span>{{ log.dsMensagem || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Paginação -->
          <div v-if="total > 0" class="pagination">
            <span class="pagination-info">Total: {{ total }} registro(s)</span>
            <div class="pagination-btns">
              <button
                class="btn btn-secondary"
                :disabled="pagina <= 1"
                @click="mudarPagina(pagina - 1)"
              >
                &lt; Anterior
              </button>
              <span class="pagina-info">Pág. {{ pagina }}</span>
              <button
                class="btn btn-secondary"
                :disabled="pagina * tamanhoPagina >= total"
                @click="mudarPagina(pagina + 1)"
              >
                Próxima &gt;
              </button>
            </div>
          </div>
        </template>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { listLogsAcao, listLogsSincronizacao } from '@/services/adminService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const aba = ref('acoes')
const loading = ref(false)
const dados = ref([])
const total = ref(0)
const pagina = ref(1)
const tamanhoPagina = 15

const filtros = reactive({
  dsLogin: '',
  dsAcao: '',
  dsStatus: '',
  dtInicio: '',
  dtFim: '',
})

function selecionarAba(nova) {
  aba.value = nova
  pagina.value = 1
  dados.value = []
  total.value = 0
  buscar()
}

async function buscar() {
  loading.value = true
  try {
    const params = {
      pagina: pagina.value,
      tamanhoPagina,
    }

    if (filtros.dsLogin.trim()) params.dsLogin = filtros.dsLogin.trim()
    if (filtros.dtInicio) params.dtInicio = filtros.dtInicio
    if (filtros.dtFim) params.dtFim = filtros.dtFim

    let resultado
    if (aba.value === 'acoes') {
      if (filtros.dsAcao.trim()) params.dsAcao = filtros.dsAcao.trim()
      resultado = await listLogsAcao(params)
    } else {
      if (filtros.dsStatus) params.dsStatus = filtros.dsStatus
      resultado = await listLogsSincronizacao(params)
    }

    dados.value = resultado.dados
    total.value = resultado.total
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar logs.', 'error')
  } finally {
    loading.value = false
  }
}

function limparFiltros() {
  filtros.dsLogin = ''
  filtros.dsAcao = ''
  filtros.dsStatus = ''
  filtros.dtInicio = ''
  filtros.dtFim = ''
  pagina.value = 1
  buscar()
}

function mudarPagina(novaPagina) {
  pagina.value = novaPagina
  buscar()
}

function formatDateTime(raw) {
  if (!raw) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

function acaoBadgeClass(acao) {
  const a = (acao || '').toUpperCase()
  if (a.includes('CRIACAO') || a.includes('CADASTRO')) return 'badge-create'
  if (a.includes('ATUALIZACAO') || a.includes('EDICAO') || a.includes('TROCA')) return 'badge-update'
  if (a.includes('EXCLUSAO') || a.includes('DESATIVACAO')) return 'badge-delete'
  if (a.includes('RESET') || a.includes('SENHA')) return 'badge-warn'
  if (a.includes('REATIVACAO')) return 'badge-reactivate'
  return 'badge-default'
}

function statusBadgeClass(status) {
  const s = (status || '').toUpperCase()
  if (s === 'CONCLUIDA') return 'status-ok'
  if (s === 'FALHA') return 'status-error'
  if (s === 'CANCELADA') return 'status-warn'
  return 'status-info'
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}

onMounted(buscar)
</script>

<style scoped>
.admin-grid {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.admin-copy {
  display: grid;
  gap: 6px;
  margin-bottom: 20px;
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
}

section.card {
  min-width: 0;
  overflow: hidden;
}

/* ── Tab bar ── */
.tab-bar {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s;
  text-align: center;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
}

.tab-btn--active {
  color: #ea191f;
  border-bottom-color: #ea191f;
}

.tab-btn:hover {
  color: #333;
}

/* ── Filtros — mobile-first: coluna única ── */
.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  width: 100%;
}

.filter-field input,
.filter-field select {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-actions .btn {
  flex: 1;
}

/* Desktop: grade multi-coluna */
@media (min-width: 641px) {
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    align-items: end;
  }

  .filter-actions {
    padding-top: 22px;
    align-items: flex-end;
  }

  .filter-actions .btn {
    flex: unset;
  }
}

/* ── Tabela (desktop) ── */
.table-wrap {
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.log-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  white-space: nowrap;
}

.log-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.log-table tbody tr:hover {
  background: #fafafa;
}

.col-date {
  white-space: nowrap;
  font-size: 0.82rem;
  color: #555;
}

.col-small {
  font-size: 0.82rem;
  color: #666;
}

.col-msg {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  color: #555;
}

/* ── Cards (mobile — hidden by default) ── */
.log-cards {
  display: none;
  flex-direction: column;
  gap: 10px;
}

.log-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.log-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8f8f8;
  border-bottom: 1px solid #e8e8e8;
  gap: 8px;
  flex-wrap: wrap;
}

.log-card-date {
  font-size: 0.8rem;
  color: #555;
}

.log-card-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-card-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 14px;
  border-bottom: 1px solid #f3f3f3;
  font-size: 0.88rem;
  gap: 12px;
}

.log-card-row:last-child {
  border-bottom: none;
}

.log-card-row--msg {
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
}

.log-card-row--msg span:last-child {
  word-break: break-word;
  color: #555;
  font-size: 0.82rem;
  line-height: 1.4;
}

.log-card-label {
  font-size: 0.76rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Badges ── */
.acao-badge,
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-create    { background: #e8f5e9; color: #2e7d32; }
.badge-update    { background: #e3f2fd; color: #1565c0; }
.badge-delete    { background: #ffebee; color: #c62828; }
.badge-warn      { background: #fff3e0; color: #e65100; }
.badge-reactivate{ background: #f3e5f5; color: #6a1b9a; }
.badge-default   { background: #f5f5f5; color: #555; }

.status-ok    { background: #e8f5e9; color: #2e7d32; }
.status-error { background: #ffebee; color: #c62828; }
.status-warn  { background: #fff3e0; color: #e65100; }
.status-info  { background: #e3f2fd; color: #1565c0; }

/* ── Estado vazio / carregando ── */
.empty-state {
  padding: 32px;
  text-align: center;
  color: #999;
}

.loading-state {
  padding: 24px;
  text-align: center;
  color: #888;
}

/* ── Paginação ── */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  font-size: 0.85rem;
  color: #888;
}

.pagination-btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagina-info {
  font-size: 0.88rem;
  color: #555;
}

/* ── Troca tabela por cards em tablets/celulares ── */
@media (max-width: 860px) {
  .table-wrap {
    display: none;
  }

  .log-cards {
    display: flex;
  }
}

/* ── Paginação empilhada no mobile ── */
@media (max-width: 640px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .pagination-btns {
    justify-content: center;
  }

  .pagination-btns .btn {
    flex: 1;
  }
}
</style>
