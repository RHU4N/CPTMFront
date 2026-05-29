import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import './style.css'
import App from './App.vue'
import router from './router'

registerSW({
	immediate: true,
})

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
