<template>
  <div class="login-container">
    <LoadingScreen v-if="initializing" />

    <template v-else>
      <img :src="logo" class="logo" alt="Logo" />

      <div class="login-box">
        <label class="login-label" for="ds-login">Usuário</label>
        <input
          id="ds-login"
          v-model="form.dsLogin"
          type="text"
          placeholder="Digite seu usuário"
          autocomplete="username"
          @keyup.enter="focusPassword"
          @input="errorMsg = ''"
        />

        <label class="login-label" for="ds-senha">Senha</label>
        <input
          id="ds-senha"
          ref="passwordInput"
          v-model="form.dsSenha"
          type="password"
          placeholder="Digite sua senha"
          autocomplete="current-password"
          @keyup.enter="submit"
          @input="errorMsg = ''"
        />

        <p v-if="errorMsg" class="login-error" role="alert">{{ errorMsg }}</p>

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
const errorMsg = ref('')
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
  errorMsg.value = ''
  if (!form.dsLogin.trim() || !form.dsSenha.trim()) {
    errorMsg.value = 'Informe o usuário e a senha para continuar.'
    return
  }

  loading.value = true
  try {
    const session = await authStore.login({ dsLogin: form.dsLogin.trim(), dsSenha: form.dsSenha })

    if (session?.primeiroAcesso) {
      await router.replace({ name: 'trocar-senha' })
      return
    }

    await router.replace(route.query.redirect ? String(route.query.redirect) : { name: 'dashboard' })
  } catch (error) {
    errorMsg.value = error.message || 'Usuário ou senha incorretos. Tente novamente.'
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

.login-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  margin-bottom: -4px;
}

.login-error {
  margin: 0;
  padding: 10px 14px;
  background: #fff0f0;
  border: 1px solid rgba(234, 25, 31, 0.35);
  border-radius: 6px;
  color: #c62828;
  font-size: 0.88rem;
  text-align: center;
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
