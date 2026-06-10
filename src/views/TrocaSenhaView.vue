<template>
  <div class="page-shell troca-shell">
    <header class="troca-header">
      <span class="brand">CPTM</span>
    </header>

    <main class="troca-main">
      <div class="troca-card">
        <div class="troca-icon">🔒</div>
        <h1 class="troca-title">Troca de Senha Obrigatória</h1>
        <p class="troca-subtitle">
          Este é seu primeiro acesso. Por segurança, defina uma nova senha antes de continuar.
        </p>

        <form class="troca-form" @submit.prevent="submit">
          <label>
            <span class="field-label">Senha Atual</span>
            <input
              v-model="form.dsSenhaAtual"
              type="password"
              class="field"
              placeholder="Senha temporária recebida"
              required
              autocomplete="current-password"
            />
          </label>

          <label>
            <span class="field-label">Nova Senha</span>
            <input
              v-model="form.dsNovaSenha"
              type="password"
              class="field"
              placeholder="Mínimo 8 caracteres com letras e números"
              required
              autocomplete="new-password"
            />
          </label>

          <label>
            <span class="field-label">Confirmar Nova Senha</span>
            <input
              v-model="form.dsNovaSenhaConfirm"
              type="password"
              class="field"
              placeholder="Repita a nova senha"
              required
              autocomplete="new-password"
            />
          </label>

          <p v-if="erro" class="erro-msg">{{ erro }}</p>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Nova Senha' }}
          </button>
        </form>
      </div>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { trocarSenha } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const erro = ref('')

const form = reactive({
  dsSenhaAtual: '',
  dsNovaSenha: '',
  dsNovaSenhaConfirm: '',
})

async function submit() {
  erro.value = ''

  if (!form.dsSenhaAtual || !form.dsNovaSenha || !form.dsNovaSenhaConfirm) {
    erro.value = 'Preencha todos os campos.'
    return
  }

  if (form.dsNovaSenha !== form.dsNovaSenhaConfirm) {
    erro.value = 'As senhas não conferem.'
    return
  }

  if (form.dsNovaSenha.length < 8) {
    erro.value = 'A nova senha deve ter no mínimo 8 caracteres.'
    return
  }

  if (!/[a-zA-Z]/.test(form.dsNovaSenha) || !/[0-9]/.test(form.dsNovaSenha)) {
    erro.value = 'A nova senha deve conter letras e números.'
    return
  }

  loading.value = true
  try {
    await trocarSenha({ ...form })
    authStore.clearPrimeiroAcesso()
    uiStore.pushToast('Senha alterada com sucesso! Bem-vindo ao sistema.', 'success')
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    erro.value = error.message || 'Erro ao trocar a senha. Verifique a senha atual.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.troca-shell {
  min-height: 100svh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.troca-header {
  background: #ea191f;
  color: white;
  padding: 16px 24px;
  font-size: 1.2rem;
  font-weight: bold;
}

.brand {
  letter-spacing: 2px;
}

.troca-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.troca-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding: 40px 32px;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.troca-icon {
  font-size: 2.5rem;
  text-align: center;
}

.troca-title {
  margin: 0;
  font-size: 1.4rem;
  text-align: center;
  color: #222;
}

.troca-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.5;
}

.troca-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 4px;
}

.field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
}

.field:focus {
  outline: none;
  border-color: #ea191f;
  box-shadow: 0 0 0 2px rgba(234, 25, 31, 0.15);
}

.erro-msg {
  margin: 0;
  color: #ea191f;
  font-size: 0.9rem;
  background: #fff0f0;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(234, 25, 31, 0.3);
}

.submit-btn {
  padding: 13px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
