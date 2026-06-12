import { defineStore } from 'pinia'
import { deleteEfluente, flushOfflineQueue, isNetworkFailure, listAttachments, listEfluentes, saveEfluente, uploadAttachment } from '@/services/efluenteService'
import { createEmptyEfluente, normalizeEfluente } from '@/models/efluente'
import { enqueue, peekQueue, queueSize, removeById, serializeFiles } from '@/services/offlineQueue'
import { STATUS, listDrafts } from '@/services/draftService'

function markStatus(item, status) {
  return { ...item, _status: status }
}

export const useEfluenteStore = defineStore('efluente', {
  state: () => ({
    items: [],
    drafts: [],
    failedIds: [],
    attachmentsById: {},
    selectedId: null,
    loading: false,
    saving: false,
    syncing: false,
    cancelRequested: false,
    currentlySyncingId: null,
    syncingItems: [],
    error: '',
    pendingCount: queueSize(),
  }),
  getters: {
    selectedItem: (state) => state.items.find((item) => String(item.pkCdMeioAmbienteCptm) === String(state.selectedId)) || null,

    // Server items with SINCRONIZADO status
    syncedItems: (state) => state.items.map((item) => {
      const failed = state.failedIds.includes(String(item.pkCdMeioAmbienteCptm))
      return markStatus(item, failed ? STATUS.ERRO : STATUS.SINCRONIZADO)
    }),

    // Queue items — SINCRONIZANDO for the item currently processing, AGUARDANDO for the rest.
    // void state.pendingCount forces reactivity: getter recomputes whenever the queue size changes.
    queuedItems: (state) => {
      void state.pendingCount
      return peekQueue().map((entry) => ({
        ...createEmptyEfluente(),
        ...entry.payload,
        _queueId: entry.id,
        _status: (state.syncing || state.currentlySyncingId === entry.id)
          ? STATUS.SINCRONIZANDO
          : STATUS.AGUARDANDO,
        _queuedAt: entry.queuedAt,
      }))
    },

    // Local wizard drafts
    draftItems: (state) => state.drafts,

    // All synced items sorted by date+time descending (paginated at component level)
    recentSynced() {
      const getTime = (item) => {
        if (!item.dtDataDoCadastramento) return 0
        const datePart = String(item.dtDataDoCadastramento).substring(0, 10)
        const time = item.hrHorasDoCadastramento ? `T${item.hrHorasDoCadastramento}:00` : 'T00:00:00'
        const d = new Date(`${datePart}${time}`)
        return isNaN(d.getTime()) ? 0 : d.getTime()
      }
      return this.syncedItems.slice().sort((a, b) => getTime(b) - getTime(a))
    },
  },
  actions: {
    refreshDrafts() {
      this.drafts = listDrafts()
    },
    async loadItems() {
      this.loading = true
      this.error = ''
      try {
        const data = await listEfluentes()
        this.items = data.map(normalizeEfluente)
      } catch (error) {
        this.error = error.message || 'Falha ao carregar efluentes'
      } finally {
        this.loading = false
        this.refreshDrafts()
        this.pendingCount = queueSize()
      }
    },
    selectItem(id) {
      this.selectedId = id
    },
    newItem() {
      return createEmptyEfluente()
    },
    async loadAttachments(id) {
      if (!id) return []
      const attachments = await listAttachments(id)
      this.attachmentsById[id] = attachments
      return attachments
    },
    async saveItem(payload, files = []) {
      this.saving = true
      this.error = ''
      try {
        const saved = await saveEfluente(payload)
        const itemId = saved?.pkCdMeioAmbienteCptm || payload.pkCdMeioAmbienteCptm

        if (itemId && files.length) {
          for (const file of files) {
            try {
              await uploadAttachment(itemId, file)
            } catch (uploadErr) {
              console.warn('[efluente] upload de anexo falhou (registro salvo):', uploadErr?.message)
            }
          }
        }

        // Remove from failed list if retry succeeded
        this.failedIds = this.failedIds.filter((id) => id !== String(itemId))
        await this.loadItems()
        return saved
      } catch (error) {
        if (isNetworkFailure(error)) {
          const serializedFiles = files.length ? await serializeFiles(files) : []
          enqueue(payload, serializedFiles)
          this.pendingCount = queueSize()
          const queued = new Error('OFFLINE_QUEUED')
          queued.code = 'OFFLINE_QUEUED'
          throw queued
        }
        this.error = error.message || 'Falha ao salvar efluente'
        throw error
      } finally {
        this.saving = false
      }
    },
    async flushQueue() {
      this.syncing = true
      this.cancelRequested = false
      this.currentlySyncingId = null
      this.syncingItems = []
      const cancelSignal = { cancelled: false }
      this._activeCancelSignal = cancelSignal
      try {
        const results = await flushOfflineQueue(
          cancelSignal,
          (id) => { this.currentlySyncingId = id },
          (item) => {
            // Item foi enviado e removido da fila — mantém card visível até loadItems confirmar
            this.syncingItems = [...this.syncingItems, {
              ...createEmptyEfluente(),
              ...item.payload,
              _queueId: item.id,
              _status: STATUS.SINCRONIZANDO,
              _ghost: true,
            }]
          },
        )
        const failedResults = results.filter((r) => r.status === 'failed')
        // Save failed items back to localStorage so they remain visible as ERRO drafts
        for (const r of failedResults) {
          const pid = r.payload?.pkCdMeioAmbienteCptm
          if (pid) {
            try {
              localStorage.setItem(`cptm.front.efluente.wizard.${pid}`, JSON.stringify({
                form: r.payload,
                files: r.files || [],
                stepIndex: 7,
                ready: true,
                failed: true,
                failError: r.error,
              }))
            } catch { /* ignore */ }
          }
        }
        const failed = failedResults.map((r) => String(r.id))
        this.failedIds = [...new Set([...this.failedIds, ...failed])]
        const synced = results.filter((r) => r.status === 'synced').length
        if (synced > 0) await this.loadItems()
        this.syncingItems = []
        this.pendingCount = queueSize()
        return results
      } finally {
        this.syncing = false
        this.currentlySyncingId = null
        this.syncingItems = []
        if (this.cancelRequested) {
          // Restaura os itens que ainda estão na fila de volta para rascunhos locais
          for (const entry of peekQueue()) {
            const draftKey = `cptm.front.efluente.wizard.${entry.payload.pkCdMeioAmbienteCptm}`
            try {
              localStorage.setItem(draftKey, JSON.stringify({
                form: entry.payload,
                files: entry.files || [],
                stepIndex: 7,
                ready: true,
              }))
              removeById(entry.id)
            } catch { /* ignore */ }
          }
          this.cancelRequested = false
        }
        this._activeCancelSignal = null
        this.pendingCount = queueSize()
        this.refreshDrafts()
      }
    },
    cancelSync() {
      this.cancelRequested = true
      if (this._activeCancelSignal) this._activeCancelSignal.cancelled = true
    },
    async removeItem(id) {
      this.saving = true
      try {
        await deleteEfluente(id)
        await this.loadItems()
      } finally {
        this.saving = false
      }
    },
    removeQueued(queueId) {
      removeById(queueId)
      this.pendingCount = queueSize()
    },
    restoreQueued(queueId) {
      const entry = peekQueue().find((e) => e.id === queueId)
      if (!entry) return
      const draftKey = `cptm.front.efluente.wizard.${entry.payload.pkCdMeioAmbienteCptm}`
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          form: entry.payload,
          files: entry.files || [],
          stepIndex: 7,
          ready: true,
        }))
      } catch { /* ignore */ }
      removeById(queueId)
      this.pendingCount = queueSize()
      this.refreshDrafts()
    },
  },
})