<template>
  <div class="page-shell">
    <AppHeader title="Meu Perfil" @home="router.push({ name: 'dashboard' })" @logout="logout" />

    <main class="perfil-main">
      <div class="perfil-card">

        <!-- Seção: Dados da Conta -->
        <section class="perfil-section">
          <h2 class="section-title">Dados da Conta</h2>

          <form class="perfil-form" @submit.prevent="salvarPerfil">
            <label>
              <span class="field-label">Nome</span>
              <input v-model="perfil.nmUsuario" type="text" class="field" placeholder="Seu nome" required />
            </label>

            <label>
              <span class="field-label">Login</span>
              <input v-model="perfil.dsNovoLogin" type="text" class="field" placeholder="Seu login de acesso" autocomplete="username" />
            </label>

            <label>
              <span class="field-label">E-mail</span>
              <input v-model="perfil.dsEmail" type="email" class="field" placeholder="seu@email.com" autocomplete="email" />
            </label>

            <p v-if="errosPerfil" class="erro-msg">{{ errosPerfil }}</p>
            <p v-if="sucessoPerfil" class="sucesso-msg">{{ sucessoPerfil }}</p>

            <button type="submit" class="btn-primary" :disabled="loadingPerfil">
              {{ loadingPerfil ? 'Salvando...' : 'Salvar Dados' }}
            </button>
          </form>
        </section>

        <hr class="divider" />

        <!-- Seção: Alterar Senha -->
        <section class="perfil-section">
          <h2 class="section-title">Alterar Senha</h2>

          <form class="perfil-form" @submit.prevent="salvarSenha">
            <label>
              <span class="field-label">Senha Atual</span>
              <input v-model="senha.dsSenhaAtual" type="password" class="field" placeholder="Sua senha atual" autocomplete="current-password" required />
            </label>

            <label>
              <span class="field-label">Nova Senha</span>
              <input v-model="senha.dsNovaSenha" type="password" class="field" placeholder="Mínimo 8 caracteres com letras e números" autocomplete="new-password" required />
            </label>

            <label>
              <span class="field-label">Confirmar Nova Senha</span>
              <input v-model="senha.dsNovaSenhaConfirm" type="password" class="field" placeholder="Repita a nova senha" autocomplete="new-password" required />
            </label>

            <p v-if="errosSenha" class="erro-msg">{{ errosSenha }}</p>
            <p v-if="sucessoSenha" class="sucesso-msg">{{ sucessoSenha }}</p>

            <button type="submit" class="btn-primary" :disabled="loadingSenha">
              {{ loadingSenha ? 'Salvando...' : 'Alterar Senha' }}
            </button>
          </form>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { atualizarMeuPerfil, trocarSenha } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()

const perfil = reactive({ nmUsuario: '', dsEmail: '', dsNovoLogin: '' })
const senha = reactive({ dsSenhaAtual: '', dsNovaSenha: '', dsNovaSenhaConfirm: '' })

const loadingPerfil = ref(false)
const loadingSenha = ref(false)
const errosPerfil = ref('')
const sucessoPerfil = ref('')
const errosSenha = ref('')
const sucessoSenha = ref('')

onMounted(() => {
  const s = authStore.session
  if (s) {
    perfil.nmUsuario = s.nmUsuario || ''
    perfil.dsEmail = s.dsEmail || ''
    perfil.dsNovoLogin = s.dsLogin || ''
  }
})

async function salvarPerfil() {
  errosPerfil.value = ''
  sucessoPerfil.value = ''
  if (!perfil.nmUsuario.trim()) {
    errosPerfil.value = 'Nome não pode ser vazio.'
    return
  }
  loadingPerfil.value = true
  try {
    const res = await atualizarMeuPerfil({
      nmUsuario: perfil.nmUsuario.trim(),
      dsEmail: perfil.dsEmail.trim() || null,
      dsNovoLogin: perfil.dsNovoLogin.trim() || null,
    })
    authStore.replaceSession({
      ...authStore.session,
      nmUsuario: res.nmUsuario,
      dsLogin: res.dsLogin,
      dsEmail: res.dsEmail,
    })
    sucessoPerfil.value = 'Dados atualizados com sucesso!'
  } catch (error) {
    errosPerfil.value = error.message || 'Erro ao salvar dados.'
  } finally {
    loadingPerfil.value = false
  }
}

async function salvarSenha() {
  errosSenha.value = ''
  sucessoSenha.value = ''
  if (!senha.dsSenhaAtual || !senha.dsNovaSenha || !senha.dsNovaSenhaConfirm) {
    errosSenha.value = 'Preencha todos os campos.'
    return
  }
  if (senha.dsNovaSenha !== senha.dsNovaSenhaConfirm) {
    errosSenha.value = 'As senhas não conferem.'
    return
  }
  if (senha.dsNovaSenha.length < 8) {
    errosSenha.value = 'A nova senha deve ter no mínimo 8 caracteres.'
    return
  }
  if (!/[a-zA-Z]/.test(senha.dsNovaSenha) || !/[0-9]/.test(senha.dsNovaSenha)) {
    errosSenha.value = 'A nova senha deve conter letras e números.'
    return
  }
  loadingSenha.value = true
  try {
    await trocarSenha({ ...senha })
    authStore.clearPrimeiroAcesso()
    senha.dsSenhaAtual = ''
    senha.dsNovaSenha = ''
    senha.dsNovaSenhaConfirm = ''
    sucessoSenha.value = 'Senha alterada com sucesso!'
  } catch (error) {
    errosSenha.value = error.message || 'Erro ao alterar senha.'
  } finally {
    loadingSenha.value = false
  }
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.perfil-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 24px 16px;
}

.perfil-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 32px 28px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.perfil-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
}

.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 24px 0;
}

.perfil-form {
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
  padding: 11px 13px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field:focus {
  outline: none;
  border-color: #ea191f;
  box-shadow: 0 0 0 2px rgba(234, 25, 31, 0.12);
}

.btn-primary {
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.sucesso-msg {
  margin: 0;
  color: #1a7a3c;
  font-size: 0.9rem;
  background: #f0fff4;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(26, 122, 60, 0.3);
}
</style>
