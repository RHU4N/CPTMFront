import { defineStore } from 'pinia'
import { deleteEfluente, flushOfflineQueue, isNetworkFailure, listAttachments, listEfluentes, saveEfluente, uploadAttachment } from '@/services/efluenteService'
import { createEmptyEfluente, normalizeEfluente } from '@/models/efluente'
import { enqueue, queueSize, serializeFiles } from '@/services/offlineQueue'

export const useEfluenteStore = defineStore('efluente', {
  state: () => ({
    items: [],
    attachmentsById: {},
    selectedId: null,
    loading: false,
    saving: false,
    syncing: false,
    error: '',
    pendingCount: queueSize(),
  }),
  getters: {
    selectedItem: (state) => state.items.find((item) => String(item.pkCdMeioAmbienteCptm) === String(state.selectedId)) || null,
  },
  actions: {
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
      }
    },
    selectItem(id) {
      this.selectedId = id
    },
    newItem() {
      return createEmptyEfluente()
    },
    async loadAttachments(id) {
      if (!id) {
        return []
      }

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
      try {
        const results = await flushOfflineQueue()
        this.pendingCount = queueSize()
        const synced = results.filter((r) => r.status === 'synced').length
        if (synced > 0) await this.loadItems()
        return results
      } finally {
        this.syncing = false
      }
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
  },
})