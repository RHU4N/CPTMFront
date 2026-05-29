import { defineStore } from 'pinia'

let toastCounter = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    loading: false,
  }),
  actions: {
    pushToast(message, type = 'info') {
      const id = ++toastCounter
      this.toasts.push({ id, message, type })
      window.setTimeout(() => this.removeToast(id), 3500)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    setLoading(value) {
      this.loading = Boolean(value)
    },
  },
})