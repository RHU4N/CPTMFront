<template>
  <div class="page-shell">
    <AppHeader
      title="Histórico de Inspeções"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
      @perfil="router.push({ name: 'meu-perfil' })"
    >
      <template #actions>
        <button class="header-action" type="button" @click="reload">Atualizar</button>
      </template>
    </AppHeader>

    <main class="screen-grid historico-grid">
      <section class="card">
        <div class="historico-head">
          <div>
            <span class="eyebrow">Histórico</span>
            <h1 class="section-title">Todas as inspeções</h1>
            <p class="section-subtitle">Pesquise, filtre e acesse qualquer registro sincronizado com o servidor.</p>
          </div>
          <button class="btn btn-primary" type="button" @click="router.push({ name: 'dashboard' })">Voltar</button>
        </div>

        <!-- Filtros -->
        <div class="filters-grid">
          <label>
            <span class="field-label">Buscar</span>
            <input v-model="search" class="input" type="text" placeholder="ID, nome, município..." />
          </label>

          <label>
            <span class="field-label">Status desvio</span>
            <select v-model="filters.status" class="select">
              <option value="">Todos</option>
              <option v-for="opt in STATUS_DESVIO_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Município</span>
            <select v-model="filters.municipio" class="select">
              <option value="">Todos</option>
              <option v-for="opt in MUNICIPIO_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Linha</span>
            <select v-model="filters.linha" class="select">
              <option value="">Todas</option>
              <option v-for="opt in LINHA_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Data inicial</span>
            <input v-model="filters.dateFrom" class="input" type="date" />
          </label>

          <label>
            <span class="field-label">Data final</span>
            <input v-model="filters.dateTo" class="input" type="date" />
          </label>
        </div>

        <div class="results-meta">
          <span v-if="!loading">{{ filteredItems.length }} registro(s) encontrado(s)</span>
          <button v-if="hasActiveFilters" class="btn-clear" type="button" @click="clearFilters">Limpar filtros</button>
        </div>

        <!-- Lista -->
        <div v-if="loading" class="loading-state">Carregando inspeções...</div>

        <div v-else-if="!filteredItems.length" class="empty-state">
          Nenhuma inspeção encontrada com os filtros atuais.
        </div>

        <div v-else class="hist-list">
          <article
            v-for="item in pageItems"
            :key="item.pkCdMeioAmbienteCptm"
            class="hist-card"
            @click="goToDetail(item)"
          >
            <div class="hist-card-top">
              <div class="hist-card-id">{{ item.pkCdMeioAmbienteCptm }}</div>
              <StatusChip :status="item._status || 'SINCRONIZADO'" />
            </div>

            <div class="hist-card-body">
              <span class="hist-card-name">{{ item.txNmElementoMonitoramento || item.txNrElementoMonitoramento || 'Sem nome' }}</span>

              <div class="hist-card-meta">
                <span v-if="item.dtDataDoCadastramento">{{ formatDate(item.dtDataDoCadastramento) }}{{ item.hrHorasDoCadastramento ? ' · ' + item.hrHorasDoCadastramento : '' }}</span>
                <span v-if="item.txViaCptm">{{ item.txViaCptm }}</span>
                <span v-if="item.txEstacaoCptm">{{ item.txEstacaoCptm }}</span>
                <span v-if="item.txMunicipio">{{ item.txMunicipio }}</span>
                <span v-if="item.txLinhaCptm">{{ item.txLinhaCptm }}</span>
              </div>

              <span v-if="isAdmin && item.txAutorPfDoCadastro" class="hist-card-author">
                Por: {{ item.txAutorPfDoCadastro }}
              </span>
            </div>

            <div v-if="item.nrLatGrauDecimalWgs84 && item.nrLongGrauDecimalWgs84" class="hist-card-coords">
              <span class="coords-badge">
                {{ formatCoord(item.nrLatGrauDecimalWgs84) }}, {{ formatCoord(item.nrLongGrauDecimalWgs84) }}
              </span>
            </div>
          </article>
        </div>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="page === 1" @click="page = 1">«</button>
          <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
          <span class="page-info">{{ page }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
          <button class="page-btn" :disabled="page === totalPages" @click="page = totalPages">»</button>
        </div>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import StatusChip from '@/components/StatusChip.vue'
import ToastStack from '@/components/ToastStack.vue'
import { STATUS_DESVIO_OPTIONS, LINHA_OPTIONS, MUNICIPIO_OPTIONS } from '@/models/lookupData'
import { useAuthStore } from '@/stores/auth'
import { useEfluenteStore } from '@/stores/efluente'
import { useUiStore } from '@/stores/ui'

const PAGE_SIZE = 10

const router = useRouter()
const authStore = useAuthStore()
const efluenteStore = useEfluenteStore()
const uiStore = useUiStore()

const isAdmin = computed(() => authStore.isAdmin)
const loading = computed(() => efluenteStore.loading)

const search = ref('')
const page = ref(1)
const filters = reactive({ status: '', municipio: '', linha: '', dateFrom: '', dateTo: '' })

const hasActiveFilters = computed(() =>
  search.value.trim() || filters.status || filters.municipio || filters.linha || filters.dateFrom || filters.dateTo
)

function getItemTime(item) {
  if (!item.dtDataDoCadastramento) return 0
  const datePart = String(item.dtDataDoCadastramento).substring(0, 10)
  const time = item.hrHorasDoCadastramento ? `T${item.hrHorasDoCadastramento}:00` : 'T00:00:00'
  const d = new Date(`${datePart}${time}`)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  return efluenteStore.syncedItems.filter((item) => {
    if (q) {
      const haystack = [
        item.pkCdMeioAmbienteCptm,
        item.txNmElementoMonitoramento,
        item.txNrElementoMonitoramento,
        item.txMunicipio,
        item.txEstacaoCptm,
        item.txAutorPfDoCadastro,
      ].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.status && item.txStatusDoDesvioAmbiental !== filters.status) return false
    if (filters.municipio && item.txMunicipio !== filters.municipio) return false
    if (filters.linha && item.txLinhaCptm !== filters.linha) return false
    const dt = item.dtDataDoCadastramento ? new Date(item.dtDataDoCadastramento) : null
    if (filters.dateFrom && dt && dt < new Date(`${filters.dateFrom}T00:00:00`)) return false
    if (filters.dateTo && dt && dt > new Date(`${filters.dateTo}T23:59:59`)) return false
    return true
  }).sort((a, b) => getItemTime(b) - getItemTime(a))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)))

const pageItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredItems.value.slice(start, start + PAGE_SIZE)
})

watch([search, filters], () => { page.value = 1 })

function clearFilters() {
  search.value = ''
  Object.assign(filters, { status: '', municipio: '', linha: '', dateFrom: '', dateTo: '' })
}

function formatDate(value) {
  if (!value) return ''
  try { return new Intl.DateTimeFormat('pt-BR').format(new Date(value)) } catch { return String(value) }
}

function formatCoord(v) {
  return typeof v === 'number' ? v.toFixed(6) : v
}

function goToDetail(item) {
  router.push({ name: 'inspecao-detail', params: { id: item.pkCdMeioAmbienteCptm } })
}

async function reload() {
  await efluenteStore.loadItems()
  uiStore.pushToast('Lista atualizada.', 'success')
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}

onMounted(async () => {
  if (!efluenteStore.items.length) await efluenteStore.loadItems()
})
</script>

<style scoped>
.historico-grid {
  display: grid;
  gap: 18px;
}

.historico-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(234, 25, 31, 0.12);
  color: #ea191f;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.results-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 12px;
}

.btn-clear {
  background: none;
  border: none;
  color: #ea191f;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.hist-list {
  display: grid;
  gap: 10px;
}

.hist-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
  display: grid;
  gap: 8px;
}

.hist-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-color: #ccc;
}

.hist-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.hist-card-id {
  font-size: 0.78rem;
  color: #999;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.hist-card-body {
  display: grid;
  gap: 4px;
}

.hist-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #222;
}

.hist-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.82rem;
  color: #666;
}

.hist-card-meta span::after {
  content: '·';
  margin-left: 6px;
}

.hist-card-meta span:last-child::after {
  content: '';
}

.hist-card-author {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

.hist-card-coords {
  display: flex;
}

.coords-badge {
  font-size: 0.75rem;
  background: #f5f5f5;
  color: #555;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 7px 13px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-info {
  font-size: 0.88rem;
  color: #555;
  min-width: 60px;
  text-align: center;
}

.header-action {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .historico-head {
    flex-direction: column;
    align-items: stretch;
  }

  .hist-card-top {
    flex-wrap: wrap;
  }
}
</style>
