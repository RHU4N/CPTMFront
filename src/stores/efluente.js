import { defineStore } from 'pinia'
import { deleteEfluente, listAttachments, listEfluentes, saveEfluente, uploadAttachment } from '@/services/efluenteService'
import { createEmptyEfluente, normalizeEfluente } from '@/models/efluente'

export const useEfluenteStore = defineStore('efluente', {
  state: () => ({
    items: [],
    attachmentsById: {},
    selectedId: null,
    loading: false,
    saving: false,
    error: '',
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
            await uploadAttachment(itemId, file)
          }
        }

        await this.loadItems()
        return saved
      } catch (error) {
        this.error = error.message || 'Falha ao salvar efluente'
        throw error
      } finally {
        this.saving = false
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