<template>
  <div class="page-shell">
    <AppHeader title="Novo Usuário" @home="router.push({ name: 'dashboard' })" @logout="logout" @perfil="router.push({ name: 'meu-perfil' })" />

    <main class="screen-grid">
      <section class="card form-card">
        <div class="form-header">
          <span class="eyebrow">Administração › Usuários</span>
          <h1 class="section-title">Novo Usuário</h1>
          <p class="section-subtitle">Preencha os dados para cadastrar um novo usuário no sistema.</p>
        </div>

        <form class="user-form" @submit.prevent="submit">
          <div class="form-row">
            <label class="form-field">
              <span class="field-label">Nome Completo *</span>
              <input v-model="form.nmUsuario" type="text" class="input" required placeholder="Nome completo do usuário" />
            </label>

            <label class="form-field">
              <span class="field-label">Login *</span>
              <input v-model="form.dsLogin" type="text" class="input" required placeholder="Login de acesso" autocomplete="off" />
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">
              <span class="field-label">E-mail</span>
              <input v-model="form.dsEmail" type="email" class="input" placeholder="email@cptm.gov.br" />
            </label>

            <label class="form-field">
              <span class="field-label">Perfil *</span>
              <select v-model.number="form.idPerfil" class="select" required>
                <option value="" disabled>Selecione o perfil</option>
                <option v-for="perfil in perfis" :key="perfil.idPerfil" :value="perfil.idPerfil">
                  {{ perfil.dsPerfil }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">
              <span class="field-label">Senha Temporária *</span>
              <input v-model="form.dsSenha" type="password" class="input" required placeholder="Mínimo 8 caracteres com letras e números" autocomplete="new-password" />
            </label>

            <label class="form-field form-field--check">
              <span class="field-label">Ativo</span>
              <label class="toggle-wrap">
                <input v-model="form.flAtivo" type="checkbox" class="toggle-input" />
                <span class="toggle-label">{{ form.flAtivo ? 'Ativo' : 'Inativo' }}</span>
              </label>
            </label>
          </div>

          <p v-if="erro" class="erro-msg">{{ erro }}</p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'admin-users' })">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Criar Usuário' }}
            </button>
          </div>
        </form>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { createUsuario, listPerfis } from '@/services/usuarioService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const erro = ref('')
const perfis = ref([])

const form = reactive({
  nmUsuario: '',
  dsLogin: '',
  dsEmail: '',
  idPerfil: '',
  dsSenha: '',
  flAtivo: true,
})

onMounted(async () => {
  try {
    perfis.value = await listPerfis()
  } catch {
    uiStore.pushToast('Falha ao carregar perfis.', 'error')
  }
})

async function submit() {
  erro.value = ''

  if (!form.nmUsuario.trim() || !form.dsLogin.trim() || !form.dsSenha.trim() || !form.idPerfil) {
    erro.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  if (form.dsSenha.length < 8) {
    erro.value = 'A senha deve ter no mínimo 8 caracteres.'
    return
  }

  if (!/[a-zA-Z]/.test(form.dsSenha) || !/[0-9]/.test(form.dsSenha)) {
    erro.value = 'A senha deve conter letras e números.'
    return
  }

  loading.value = true
  try {
    await createUsuario({ ...form })
    uiStore.pushToast('Usuário criado com sucesso!', 'success')
    router.push({ name: 'admin-users' })
  } catch (error) {
    erro.value = error.message || 'Erro ao criar usuário.'
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  display: grid;
  gap: 6px;
  margin-bottom: 24px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field--check {
  justify-content: flex-end;
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: #fafafa;
}

.toggle-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ea191f;
}

.toggle-label {
  font-size: 0.95rem;
  color: #333;
}

.erro-msg {
  color: #ea191f;
  font-size: 0.9rem;
  background: #fff0f0;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid rgba(234, 25, 31, 0.3);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
