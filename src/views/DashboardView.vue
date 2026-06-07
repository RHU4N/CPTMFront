<template>
  <div class="page-shell">
    <AppHeader
      :title="headerTitle"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
    >
      <template #actions>
        <button class="header-action" type="button" @click="reload">Atualizar</button>
      </template>
    </AppHeader>

    <div v-if="offline" class="offline-banner">Você está offline. O app mostra o último cache local disponível.</div>

    <main class="screen-grid dashboard-grid">
      <section class="card filters-panel">
        <div class="dashboard-copy">
          <span class="eyebrow">CPTM X FATEC</span>
          <h1>Central operacional de inspeção ambiental ferroviária.</h1>
          <p class="section-subtitle">Abra uma nova coleta, acompanhe os efluentes recentes e mantenha o fluxo de campo alinhado ao Oracle.</p>
        </div>

        <div class="action-grid">
          <AppButton icon="/inspecao.png" label="Novo efluente" @click="openCreate">Efluente</AppButton>
          <AppButton icon="/historico.png" label="Atualizar lista" @click="reload">Histórico</AppButton>
          <AppButton v-if="authStore.isAdmin" icon="/admin.jpg" label="Área admin" @click="router.push({ name: 'admin-users' })">Admin</AppButton>
        </div>
      </section>

      <section class="card compact-filters">
        <div class="filters-head">
          <div>
            <h2 class="section-title">Filtros</h2>
            <p class="section-subtitle">Status, município, linha e período.</p>
          </div>
          <button class="btn btn-primary" type="button" @click="openCreate">Novo efluente</button>
        </div>

        <div class="filters-grid">
          <label>
            <span class="field-label">Status</span>
            <select v-model="filters.status" class="select">
              <option value="">Todos</option>
              <option v-for="option in STATUS_DESVIO_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Município</span>
            <select v-model="filters.municipio" class="select">
              <option value="">Todos</option>
              <option v-for="option in MUNICIPIO_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label>
            <span class="field-label">Linha</span>
            <select v-model="filters.linha" class="select">
              <option value="">Todas</option>
              <option v-for="option in LINHA_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
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
      </section>

      <EfluenteList
        :items="filteredItems"
        :loading="efluenteStore.loading"
        :selected-id="selectedId"
        :filters="filters"
        @new="openCreate"
        @select="selectItem"
        @edit="openEdit"
        @remove="removeItem"
      />

      <section class="card map-panel">
        <h2 class="section-title">Mapa</h2>
        <p class="section-subtitle">Visualização rápida dos registros selecionados.</p>
        <EfluenteMap :items="filteredItems" :selected-id="selectedId" />
      </section>
    </main>

    <div v-if="showForm" class="modal-backdrop">
      <div class="modal-panel">
        <EfluenteForm :model-value="draft" :submitting="efluenteStore.saving" @save="saveItem" @cancel="closeForm" />
      </div>
    </div>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import EfluenteForm from '@/components/EfluenteForm.vue'
import EfluenteList from '@/components/EfluenteList.vue'
import EfluenteMap from '@/components/EfluenteMap.vue'
import ToastStack from '@/components/ToastStack.vue'
import { STATUS_DESVIO_OPTIONS, LINHA_OPTIONS, MUNICIPIO_OPTIONS } from '@/models/lookupData'
import { createEmptyEfluente, normalizeEfluente } from '@/models/efluente'
import { useAuthStore } from '@/stores/auth'
import { useEfluenteStore } from '@/stores/efluente'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const efluenteStore = useEfluenteStore()
const uiStore = useUiStore()

const offline = ref(!navigator.onLine)
const showForm = ref(false)
const selectedId = ref(null)
const draft = reactive(createEmptyEfluente())

const filters = reactive({
  status: '',
  municipio: '',
  linha: '',
  dateFrom: '',
  dateTo: '',
})

const headerTitle = computed(() => (authStore.isAdmin ? 'Bem-vindo, Admin' : 'Bem-vindo, Inspetor'))

const filteredItems = computed(() => {
  return efluenteStore.items.filter((item) => {
    const matchesStatus = !filters.status || String(item.idStatusDesvio) === String(filters.status)
    const matchesMunicipio = !filters.municipio || String(item.idMunicipio) === String(filters.municipio)
    const matchesLinha = !filters.linha || String(item.idLinha) === String(filters.linha)
    const registro = item.dtRegistro ? new Date(item.dtRegistro) : null
    const matchesFrom = !filters.dateFrom || !registro || registro >= new Date(`${filters.dateFrom}T00:00:00`)
    const matchesTo = !filters.dateTo || !registro || registro <= new Date(`${filters.dateTo}T23:59:59`)
    return matchesStatus && matchesMunicipio && matchesLinha && matchesFrom && matchesTo
  })
})

function refreshOnlineState() {
  offline.value = !navigator.onLine
}

async function reload() {
  await efluenteStore.loadItems()
  uiStore.pushToast('Lista atualizada.', 'success')
}

function openCreate() {
  Object.assign(draft, createEmptyEfluente())
  showForm.value = true
}

function openEdit(item) {
  Object.assign(draft, normalizeEfluente(item))
  showForm.value = true
  selectedId.value = item.pkCdMeioAmbienteCptm
}

function closeForm() {
  showForm.value = false
}

watch(showForm, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function selectItem(id) {
  selectedId.value = id
  router.push({ name: 'efluente-detail', params: { id } })
}

async function saveItem(payload, files) {
  try {
    const saved = await efluenteStore.saveItem(payload, files)
    const savedId = saved?.pkCdMeioAmbienteCptm || payload.pkCdMeioAmbienteCptm

    if (savedId) {
      localStorage.removeItem(`cptm.front.efluente.wizard.${savedId}`)
    }

    localStorage.removeItem('cptm.front.efluente.wizard.new')
    uiStore.pushToast('Efluente salvo e sincronizado.', 'success')
    showForm.value = false
    selectedId.value = savedId
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao salvar.', 'error')
  }
}

async function removeItem(item) {
  if (!window.confirm(`Excluir ${item.pkCdMeioAmbienteCptm}?`)) {
    return
  }

  try {
    await efluenteStore.removeItem(item.pkCdMeioAmbienteCptm)
    uiStore.pushToast('Efluente removido.', 'success')
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao excluir.', 'error')
  }
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}

onMounted(async () => {
  authStore.hydrate()
  await efluenteStore.loadItems()
  window.addEventListener('online', refreshOnlineState)
  window.addEventListener('offline', refreshOnlineState)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('online', refreshOnlineState)
  window.removeEventListener('offline', refreshOnlineState)
})

watch(
  () => efluenteStore.items,
  (items) => {
    if (!selectedId.value && items.length) {
      selectedId.value = items[0].pkCdMeioAmbienteCptm
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 18px;
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.hero-panel,
.filters-panel {
  display: grid;
  gap: 18px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(234, 25, 31, 0.12);
  color: #ea191f;
  font-size: 0.8rem;
  font-weight: 800;
}

.dashboard-copy {
  display: grid;
  gap: 10px;
}

.filters-panel,
.compact-filters,
.map-panel {
  display: grid;
  gap: 18px;
  background: #fff;
}

.compact-filters .filters-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.filters-head,
.map-panel {
  display: grid;
  gap: 16px;
}

.filters-head {
  grid-template-columns: 1fr auto;
  align-items: end;
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

.compact-filters .filters-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

@media (max-width: 1080px) {
  .action-grid {
    justify-content: stretch;
  }

  .compact-filters .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-head {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}
</style>