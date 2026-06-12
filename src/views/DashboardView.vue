<template>
  <div class="page-shell">
    <AppHeader
      :title="headerTitle"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
      @perfil="router.push({ name: 'meu-perfil' })"
    >
      <template #actions>
        <button class="header-action" type="button" @click="reload">Atualizar</button>
      </template>
    </AppHeader>

    <div v-if="offline" class="offline-banner">
      <span>Você está offline. O app mostra o último cache local disponível.</span>
      <span v-if="efluenteStore.pendingCount > 0" class="offline-badge">{{ efluenteStore.pendingCount }} aguardando envio</span>
      <button class="btn-retry-sync" type="button" @click="refreshOnlineState">Verificar conexão</button>
    </div>
    <div v-if="efluenteStore.syncing" class="sync-banner">
      <span class="sync-spinner" />
      <span class="sync-banner-msg">
        {{ efluenteStore.cancelRequested ? 'Cancelando — aguardando item atual terminar...' : `Enviando inspeções para o servidor (${efluenteStore.pendingCount} pendente(s))` }}
      </span>
      <button v-if="!efluenteStore.cancelRequested" class="btn-cancel-sync" type="button" @click="efluenteStore.cancelSync()">Cancelar envio</button>
    </div>

    <main class="screen-grid dashboard-grid">
      <!-- Hero / ações -->
      <section class="card hero-panel">
        <div class="dashboard-copy">
          <span class="eyebrow">CPTM X FATEC</span>
          <h1>Central operacional de inspeção ambiental ferroviária.</h1>
          <p class="section-subtitle">Abra uma nova coleta, acompanhe os efluentes recentes e mantenha o fluxo de campo alinhado ao Oracle.</p>
        </div>
        <div class="action-grid">
          <AppButton icon="/inspecao.png" label="Nova inspeção" @click="openCreate" />
          <AppButton icon="/historico.png" label="Histórico completo" @click="router.push({ name: 'historico' })" />
          <AppButton v-if="authStore.isAdmin" icon="/admin.jpg" label="Área admin" @click="router.push({ name: 'admin-users' })" />
        </div>
      </section>

      <!-- Rascunhos locais -->
      <section v-if="allDrafts.length" class="card drafts-panel">
        <div class="section-head">
          <div>
            <h2 class="section-title">Rascunhos locais</h2>
            <p class="section-subtitle">Formulários salvos no dispositivo, ainda não enviados.</p>
          </div>
        </div>
        <div class="draft-list">
          <article
            v-for="draft in allDrafts"
            :key="draft.pkCdMeioAmbienteCptm || draft._queueId || draft._draftKey"
            class="draft-card"
            :class="{ 'draft-card--syncing': draft._ghost || isSendingCard(draft) }"
          >
            <div class="draft-info">
              <span v-if="isSendingCard(draft)" class="card-spinner" aria-hidden="true" />
              <div class="draft-text">
                <span class="draft-name">{{ draft.txNmElementoMonitoramento || draft.txNrElementoMonitoramento || 'Sem nome' }}</span>
                <span v-if="isSendingCard(draft)" class="draft-meta syncing-text">
                  {{ draft._ghost ? 'Confirmando envio...' : draft._status === 'AGUARDANDO_SINCRONIZACAO' ? 'Na fila de envio...' : efluenteStore.cancelRequested ? 'Cancelando, aguarde...' : 'Enviando para o servidor...' }}
                </span>
                <template v-else>
                  <span class="draft-meta">{{ formatDate(draft.dtDataDoCadastramento) }} {{ draft.hrHorasDoCadastramento || '' }}</span>
                  <span v-if="draft.txViaCptm || draft.txEstacaoCptm" class="draft-meta">{{ [draft.txViaCptm, draft.txEstacaoCptm].filter(Boolean).join(' · ') }}</span>
                </template>
              </div>
              <StatusChip :status="isSendingCard(draft) ? 'SINCRONIZANDO' : draft._status" />
            </div>
            <div class="draft-actions">
              <!-- Enviando agora: ghost (já enviado, aguardando confirm.) -->
              <template v-if="draft._ghost">
                <span class="card-spinner" aria-hidden="true" />
                <span class="draft-meta syncing-text">Confirmando envio...</span>
              </template>
              <!-- Na fila ou enviando agora: Visualizar · Cancelar -->
              <template v-else-if="isSendingCard(draft)">
                <button class="btn btn-ghost" type="button" @click="viewDraft(draft)">Visualizar</button>
                <button
                  v-if="draft._queueId"
                  class="btn btn-danger"
                  type="button"
                  :disabled="efluenteStore.cancelRequested && draft._status === 'SINCRONIZANDO'"
                  @click="draft._status === 'SINCRONIZANDO' ? efluenteStore.cancelSync() : cancelQueuedItem(draft)"
                >{{ efluenteStore.cancelRequested && draft._status === 'SINCRONIZANDO' ? 'Cancelando...' : 'Cancelar' }}</button>
              </template>
              <!-- RASCUNHO: Continuar · Visualizar · Excluir -->
              <template v-else-if="draft._status === 'RASCUNHO'">
                <button class="btn btn-secondary" type="button" @click="openEditDraft(draft)">Continuar</button>
                <button class="btn btn-ghost" type="button" @click="viewDraft(draft)">Visualizar</button>
                <button class="btn btn-danger" type="button" @click="discardDraft(draft)">Excluir</button>
              </template>
              <!-- PRONTO_PARA_ENVIO: Continuar · Visualizar · Enviar · Excluir -->
              <template v-else-if="draft._status === 'PRONTO_PARA_ENVIO'">
                <button class="btn btn-secondary" type="button" @click="openEditDraft(draft)">Continuar</button>
                <button class="btn btn-ghost" type="button" @click="viewDraft(draft)">Visualizar</button>
                <button class="btn btn-primary" type="button" :disabled="efluenteStore.saving" @click="sendDraft(draft)">Enviar</button>
                <button class="btn btn-danger" type="button" @click="discardDraft(draft)">Excluir</button>
              </template>
            </div>
          </article>
        </div>
      </section>

      <!-- Inspeções recentes (máx 10) -->
      <EfluenteList
        :items="efluenteStore.recentSynced"
        :loading="efluenteStore.loading"
        :selected-id="selectedId"
        :is-admin="authStore.isAdmin"
        title="Inspeções recentes"
        subtitle="Últimas 10 inspeções sincronizadas com o servidor."
        @new="openCreate"
        @select="selectItem"
        @edit="openEdit"
        @remove="removeItem"
      />

      <!-- Mapa -->
      <section class="card map-panel">
        <h2 class="section-title">Mapa</h2>
        <p class="section-subtitle">Visualização rápida dos registros recentes.</p>
        <EfluenteMap :items="efluenteStore.recentSynced" :selected-id="selectedId" />
      </section>
    </main>

    <div v-if="showForm" class="modal-backdrop">
      <div class="modal-panel">
        <EfluenteForm
          :model-value="formDraft"
          :submitting="efluenteStore.saving"
          :initial-step="formInitialStep"
          :view-only="formViewOnly"
          @save="saveItem"
          @cancel="closeForm"
        />
      </div>
    </div>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import AppHeader from '@/components/AppHeader.vue'
import EfluenteForm from '@/components/EfluenteForm.vue'
import EfluenteList from '@/components/EfluenteList.vue'
import EfluenteMap from '@/components/EfluenteMap.vue'
import StatusChip from '@/components/StatusChip.vue'
import ToastStack from '@/components/ToastStack.vue'
import { createEmptyEfluente, normalizeEfluente } from '@/models/efluente'
import { removeDraft } from '@/services/draftService'
import { deserializeFiles } from '@/services/offlineQueue'
import { useAuthStore } from '@/stores/auth'
import { useEfluenteStore } from '@/stores/efluente'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const efluenteStore = useEfluenteStore()
const uiStore = useUiStore()

const offline = ref(!navigator.onLine)
const showForm = ref(false)
const sendingDraftId = ref(null)
const isCreating = ref(true)
const selectedId = ref(null)
const formDraft = reactive(createEmptyEfluente())
const formInitialStep = ref(0)
const formViewOnly = ref(false)

const headerTitle = computed(() => (authStore.isAdmin ? 'Bem-vindo, Admin' : 'Bem-vindo, Inspetor'))

// Combine local wizard drafts + offline queue, sorted by date desc, max 10 per section
const allDrafts = computed(() => {
  const syncingIds = new Set(efluenteStore.syncingItems.map((i) => i._queueId))
  const combined = [
    ...efluenteStore.draftItems,
    ...efluenteStore.queuedItems.filter((i) => !syncingIds.has(i._queueId)),
    ...efluenteStore.syncingItems,
  ]
  const getTime = (item) => {
    const d = item.dtDataDoCadastramento || item._queuedAt || item._savedAt
    return d ? new Date(d).getTime() : 0
  }
  return combined.sort((a, b) => getTime(b) - getTime(a)).slice(0, 10)
})

function formatDate(value) {
  if (!value) return ''
  try { return new Intl.DateTimeFormat('pt-BR').format(new Date(value)) } catch { return String(value) }
}

async function refreshOnlineState() {
  offline.value = !navigator.onLine
  if (navigator.onLine && efluenteStore.pendingCount > 0) {
    const results = await efluenteStore.flushQueue()
    const synced = results.filter((r) => r.status === 'synced').length
    const failed = results.filter((r) => r.status === 'failed').length
    if (synced > 0) uiStore.pushToast(`${synced} registro(s) sincronizado(s) com sucesso.`, 'success')
    if (failed > 0) uiStore.pushToast(`${failed} registro(s) não puderam ser sincronizados.`, 'error')
  }
}

async function syncNow() {
  const results = await efluenteStore.flushQueue()
  const synced = results.filter((r) => r.status === 'synced').length
  const failed = results.filter((r) => r.status === 'failed').length
  if (synced > 0) uiStore.pushToast(`${synced} registro(s) sincronizado(s).`, 'success')
  if (failed > 0) uiStore.pushToast(`${failed} registro(s) com erro.`, 'error')
}

async function reload() {
  await refreshOnlineState()
  await efluenteStore.loadItems()
  uiStore.pushToast('Lista atualizada.', 'success')
}

function openForm(draft, options = {}) {
  Object.assign(formDraft, { ...createEmptyEfluente(), ...draft })
  formInitialStep.value = options.initialStep ?? 0
  formViewOnly.value = options.viewOnly ?? false
  isCreating.value = !efluenteStore.items.some((item) => String(item.pkCdMeioAmbienteCptm) === String(draft.pkCdMeioAmbienteCptm))
  showForm.value = true
}

function isSendingCard(draft) {
  const id = draft.pkCdMeioAmbienteCptm || draft._draftKey
  return draft._status === 'SINCRONIZANDO'
    || draft._status === 'AGUARDANDO_SINCRONIZACAO'
    || sendingDraftId.value === id
}

function cancelQueuedItem(draft) {
  efluenteStore.restoreQueued(draft._queueId)
  uiStore.pushToast('Item removido da fila e restaurado como rascunho.', 'info')
}

function viewDraft(draft) {
  const id = draft.pkCdMeioAmbienteCptm || draft._draftKey
  const isQueued = draft._status === 'AGUARDANDO_SINCRONIZACAO'
  const source = isQueued ? 'queue' : 'draft'
  router.push({ name: 'inspecao-detail', params: { id }, query: { source } })
}

function discardQueued(draft) {
  if (!window.confirm('Excluir este item da fila de envio?')) return
  efluenteStore.removeQueued(draft._queueId)
  uiStore.pushToast('Item removido da fila.', 'info')
}

async function sendDraft(draft) {
  if (!window.confirm('Enviar esta inspeção para o servidor?')) return
  const key = draft._draftKey
  if (!key) return
  const cardId = draft.pkCdMeioAmbienteCptm || draft._draftKey
  sendingDraftId.value = cardId
  try {
    const raw = localStorage.getItem(key)
    if (!raw) { uiStore.pushToast('Rascunho não encontrado.', 'error'); return }
    const data = JSON.parse(raw)
    const formData = { ...data.form }
    const isNew = !efluenteStore.items.some((item) => String(item.pkCdMeioAmbienteCptm) === String(formData.pkCdMeioAmbienteCptm))
    const files = data.files?.length ? deserializeFiles(data.files) : []
    await efluenteStore.saveItem({ ...formData, _isNew: isNew }, files)
    localStorage.removeItem(key)
    efluenteStore.refreshDrafts()
    uiStore.pushToast('Inspeção enviada com sucesso!', 'success')
  } catch (error) {
    if (error.code === 'OFFLINE_QUEUED') {
      localStorage.removeItem(key)
      await nextTick()
      efluenteStore.refreshDrafts()
      uiStore.pushToast('Sem conexão — inspeção salva e enviada ao voltar online.', 'info')
    } else {
      uiStore.pushToast(error.message || 'Falha ao enviar.', 'error')
    }
  } finally {
    sendingDraftId.value = null
  }
}

function openCreate() {
  try {
    const raw = localStorage.getItem('cptm.front.efluente.wizard.new')
    if (raw) {
      const stored = JSON.parse(raw)
      const storedId = stored?.form?.pkCdMeioAmbienteCptm
      if (storedId && efluenteStore.items.some((item) => String(item.pkCdMeioAmbienteCptm) === String(storedId))) {
        localStorage.removeItem('cptm.front.efluente.wizard.new')
      }
    }
  } catch {}

  Object.assign(formDraft, createEmptyEfluente())
  formInitialStep.value = 0
  formViewOnly.value = false
  isCreating.value = true
  showForm.value = true
}

function openEdit(item) {
  Object.assign(formDraft, normalizeEfluente(item))
  formInitialStep.value = 0
  formViewOnly.value = false
  isCreating.value = false
  showForm.value = true
  selectedId.value = item.pkCdMeioAmbienteCptm
}

function openEditDraft(draft) {
  Object.assign(formDraft, { ...createEmptyEfluente(), ...draft })
  formInitialStep.value = 0
  formViewOnly.value = false
  isCreating.value = !efluenteStore.items.some((item) => String(item.pkCdMeioAmbienteCptm) === String(draft.pkCdMeioAmbienteCptm))
  showForm.value = true
}

function discardDraft(draft) {
  if (!window.confirm('Descartar este rascunho?')) return
  if (draft._draftKey) removeDraft(draft._draftKey)
  efluenteStore.refreshDrafts()
  uiStore.pushToast('Rascunho descartado.', 'info')
}

function closeForm() {
  showForm.value = false
  efluenteStore.refreshDrafts()
}

watch(showForm, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function selectItem(id) {
  selectedId.value = id
  router.push({ name: 'inspecao-detail', params: { id } })
}

async function saveItem(payload, files) {
  const enrichedPayload = { ...payload, _isNew: isCreating.value }
  try {
    const saved = await efluenteStore.saveItem(enrichedPayload, files)
    const savedId = saved?.pkCdMeioAmbienteCptm || enrichedPayload.pkCdMeioAmbienteCptm
    if (savedId) localStorage.removeItem(`cptm.front.efluente.wizard.${savedId}`)
    localStorage.removeItem('cptm.front.efluente.wizard.new')
    uiStore.pushToast('Inspeção salva com sucesso.', 'success')
    selectedId.value = savedId
    showForm.value = false
    efluenteStore.refreshDrafts()
  } catch (error) {
    if (error.code === 'OFFLINE_QUEUED') {
      const queuedId = enrichedPayload.pkCdMeioAmbienteCptm
      if (queuedId) localStorage.removeItem(`cptm.front.efluente.wizard.${queuedId}`)
      localStorage.removeItem('cptm.front.efluente.wizard.new')
      uiStore.pushToast('Sem conexão — registro salvo localmente e enviado ao voltar online.', 'info')
      showForm.value = false
      efluenteStore.refreshDrafts()
    } else {
      uiStore.pushToast(error.message || 'Falha ao salvar.', 'error')
    }
  }
}

async function removeItem(item) {
  if (!window.confirm(`Excluir a inspeção "${item.pkCdMeioAmbienteCptm}"?`)) return
  try {
    await efluenteStore.removeItem(item.pkCdMeioAmbienteCptm)
    uiStore.pushToast('Inspeção removida.', 'success')
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
  if (navigator.onLine && efluenteStore.pendingCount > 0) {
    await refreshOnlineState()
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('online', refreshOnlineState)
  window.removeEventListener('offline', refreshOnlineState)
})

watch(
  () => efluenteStore.items,
  (items) => {
    if (!selectedId.value && items.length) selectedId.value = items[0].pkCdMeioAmbienteCptm
  },
  { immediate: true },
)
</script>

<style scoped>
.offline-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 20px;
  background: #b71c1c;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}

.offline-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.78rem;
  font-weight: 700;
}

.btn-retry-sync {
  margin-left: auto;
  padding: 4px 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  background: transparent;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-retry-sync:hover {
  background: rgba(255, 255, 255, 0.18);
}

.sync-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(90deg, #1565c0 0%, #1976d2 100%);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.35);
}

.sync-banner-msg {
  flex: 1;
}

.sync-spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes syncing-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(21, 101, 192, 0.12); }
}


.btn-cancel-sync {
  padding: 5px 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  background: transparent;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-cancel-sync:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* Card no estado SINCRONIZANDO */
.draft-card--syncing {
  background: #e8f0fe;
  border-color: #1565c0;
  border-width: 2px;
  animation: syncing-pulse 1.6s ease-in-out infinite;
}

.card-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(21, 101, 192, 0.25);
  border-top-color: #1565c0;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}

.syncing-text {
  color: #1565c0 !important;
  font-weight: 600;
}

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

.hero-panel {
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

.map-panel {
  display: grid;
  gap: 18px;
  background: #fff;
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

/* Drafts panel */
.drafts-panel {
  display: grid;
  gap: 14px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
}

.draft-list {
  display: grid;
  gap: 10px;
}

.draft-card {
  background: #fffbf0;
  border: 1px solid #ffe082;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.draft-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 200px;
}

.draft-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.draft-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-meta {
  font-size: 0.8rem;
  color: #888;
}

.draft-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .action-grid {
    justify-content: center;
  }

  .action-grid :deep(.app-button) {
    flex: 1 1 120px;
    max-width: 160px;
    width: auto;
    height: 120px;
  }

  .action-grid :deep(.app-button__icon) {
    width: 44px;
    height: 44px;
  }

  .draft-card {
    flex-direction: column;
    align-items: stretch;
  }

  .draft-actions {
    justify-content: stretch;
  }

  .draft-actions .btn {
    flex: 1;
    text-align: center;
  }
}
</style>