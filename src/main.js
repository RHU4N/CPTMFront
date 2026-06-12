import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import './style.css'
import App from './App.vue'
import router from './router'
import { initStorage } from './utils/storageService'
import { hydrateAuth } from './utils/authStorage'
import { initDrafts } from './services/draftService'
import { initQueue } from './services/offlineQueue'

registerSW({ immediate: true })

async function boot() {
  await initStorage()
  await Promise.all([hydrateAuth(), initDrafts(), initQueue()])

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  window.addEventListener('cptm:unauthorized', () => {
    if (router.currentRoute.value.name !== 'login') {
      router.replace({ name: 'login' })
    }
  })

  app.mount('#app')
}

boot()
