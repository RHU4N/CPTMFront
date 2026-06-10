<template>
  <div class="login-container">
    <LoadingScreen v-if="initializing" />

    <template v-else>
      <img :src="logo" class="logo" alt="Logo" />

      <div class="login-box">
        <input
          v-model="form.dsLogin"
          type="text"
          placeholder="Usuário"
          autocomplete="username"
          @keyup.enter="focusPassword"
        />

        <input
          ref="passwordInput"
          v-model="form.dsSenha"
          type="password"
          placeholder="Senha"
          autocomplete="current-password"
          @keyup.enter="submit"
        />

        <button type="button" :disabled="loading" @click="submit">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useAuthStore } from '@/stores/auth'

import logo from '/logo.png'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const initializing = ref(true)
const loading = ref(false)
const passwordInput = ref(null)
const form = reactive({ dsLogin: '', dsSenha: '' })

onMounted(() => {
  authStore.hydrate()

  if (authStore.isAuthenticated) {
    const dest = authStore.primeiroAcesso ? { name: 'trocar-senha' } : { name: 'dashboard' }
    router.replace(dest)
    return
  }

  setTimeout(() => {
    initializing.value = false
  }, 3000)
})

function focusPassword() {
  passwordInput.value?.focus()
}

async function submit() {
  if (!form.dsLogin.trim() || !form.dsSenha.trim()) {
    alert('Informe usuário e senha')
    return
  }

  loading.value = true
  try {
    const session = await authStore.login({ dsLogin: form.dsLogin.trim(), dsSenha: form.dsSenha })

    // Primeiro acesso: obriga troca de senha antes de qualquer outra ação
    if (session?.primeiroAcesso) {
      await router.replace({ name: 'trocar-senha' })
      return
    }

    await router.replace(route.query.redirect ? String(route.query.redirect) : { name: 'dashboard' })
  } catch (error) {
    alert(error.message || 'Usuário ou senha incorretos')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
}

.logo {
  width: var(--brand-logo-size);
  max-width: 100%;
  margin-bottom: 30px;
}

.login-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 280px;
  gap: 10px;
}

.login-box input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

.login-box button {
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}

.login-box button:hover {
  opacity: 0.9;
}

@media (min-width: 768px) {
  .login-box {
    max-width: 400px;
  }

  .login-box input {
    padding: 14px;
    font-size: 18px;
  }

  .login-box button {
    padding: 14px;
    font-size: 18px;
  }
}
</style>
