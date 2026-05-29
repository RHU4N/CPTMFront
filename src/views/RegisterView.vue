<template>
  <div class="login-container">
    <img :src="logo" class="logo" alt="Logo" />

    <div class="login-box auth-box">
      <h1 class="auth-title">Crie o usuário inicial para operação.</h1>
      <p class="auth-subtitle">O backend final usa /api/Auth/register com confirmação de senha e perfil.</p>

      <form class="auth-form" @submit.prevent="submit">
        <label>
          <span class="field-label">Nome</span>
          <input v-model="form.nmUsuario" class="field" type="text" required />
        </label>

        <label>
          <span class="field-label">Login</span>
          <input v-model="form.dsLogin" class="field" type="text" required />
        </label>

        <label>
          <span class="field-label">E-mail</span>
          <input v-model="form.dsEmail" class="field" type="email" />
        </label>

        <label>
          <span class="field-label">Senha</span>
          <input v-model="form.dsSenha" class="field" type="password" required />
        </label>

        <label>
          <span class="field-label">Confirmar senha</span>
          <input v-model="form.dsSenhaConfirm" class="field" type="password" required />
        </label>

        <label>
          <span class="field-label">Perfil</span>
          <select v-model.number="form.idPerfil" class="field">
            <option :value="1">Administrador</option>
            <option :value="2">Usuário de Campo</option>
          </select>
        </label>

        <button class="submit-btn" type="submit" :disabled="loading">{{ loading ? 'Criando...' : 'Criar conta' }}</button>
        <RouterLink class="login-link" :to="{ name: 'login' }">Voltar ao login</RouterLink>
      </form>
    </div>

    <ToastStack />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

import logo from '/logo.png'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  nmUsuario: '',
  dsLogin: '',
  dsEmail: '',
  dsSenha: '',
  dsSenhaConfirm: '',
  idPerfil: 2,
})

async function submit() {
  if (form.dsSenha !== form.dsSenhaConfirm) {
    uiStore.pushToast('As senhas não conferem.', 'error')
    return
  }

  loading.value = true
  try {
    const session = await authStore.register({ ...form })
    uiStore.pushToast(session?.token ? 'Conta criada e autenticada com sucesso.' : 'Conta criada com sucesso. Faça login para continuar.', 'success')
    await router.replace({ name: session?.token ? 'dashboard' : 'login' })
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao registrar.', 'error')
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
  padding: 20px;
  background: #f5f5f5;
}

.logo {
  width: var(--brand-logo-size);
  max-width: 100%;
  margin-bottom: 30px;
}

.auth-box {
  max-width: 400px;
}

.auth-title {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.05;
  color: #333;
  text-align: center;
}

.auth-subtitle {
  margin: 0;
  color: #666;
  text-align: center;
}

.auth-form {
  display: grid;
  gap: 10px;
}

.field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

.submit-btn {
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}

.login-link {
  text-align: center;
  text-decoration: none;
  color: #ea191f;
}

@media (min-width: 768px) {
  .field,
  .submit-btn {
    padding: 14px;
    font-size: 18px;
  }
}
</style>