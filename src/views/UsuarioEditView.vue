<template>
  <div class="page-shell">
    <AppHeader title="Editar Usuário" @home="router.push({ name: 'dashboard' })" @logout="logout" @perfil="router.push({ name: 'meu-perfil' })" />

    <main class="screen-grid">
      <section class="card form-card">
        <div class="form-header">
          <span class="eyebrow">Administração › Usuários</span>
          <h1 class="section-title">Editar Usuário</h1>
        </div>

        <div v-if="carregando" class="loading-state">Carregando dados...</div>

        <form v-else class="user-form" @submit.prevent="submit">
          <div class="form-row">
            <label class="form-field">
              <span class="field-label">Nome Completo *</span>
              <input v-model="form.nmUsuario" type="text" class="input" required />
            </label>

            <label class="form-field">
              <span class="field-label">E-mail</span>
              <input v-model="form.dsEmail" type="email" class="input" />
            </label>
          </div>

          <label class="form-field">
            <span class="field-label">Perfil *</span>
            <select v-model.number="form.idPerfil" class="select" required>
              <option v-for="perfil in perfis" :key="perfil.idPerfil" :value="perfil.idPerfil">
                {{ perfil.dsPerfil }}
              </option>
            </select>
          </label>

          <p v-if="erro" class="erro-msg">{{ erro }}</p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'admin-users' })">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
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
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { getUsuario, listPerfis, updateUsuario } from '@/services/usuarioService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const carregando = ref(true)
const loading = ref(false)
const erro = ref('')
const perfis = ref([])
const usuario = ref(null)

const form = reactive({
  nmUsuario: '',
  dsEmail: '',
  idPerfil: 0,
})

onMounted(async () => {
  try {
    const [dadosUsuario, dadosPerfis] = await Promise.all([
      getUsuario(Number(route.params.id)),
      listPerfis(),
    ])
    usuario.value = dadosUsuario
    perfis.value = dadosPerfis
    form.nmUsuario = dadosUsuario.nmUsuario ?? ''
    form.dsEmail = dadosUsuario.dsEmail ?? ''
    form.idPerfil = dadosUsuario.idPerfil ?? 0
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar usuário.', 'error')
    router.push({ name: 'admin-users' })
  } finally {
    carregando.value = false
  }
})

async function submit() {
  erro.value = ''

  if (!form.nmUsuario.trim() || !form.idPerfil) {
    erro.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  loading.value = true
  try {
    const id = Number(route.params.id)
    await updateUsuario(id, { nmUsuario: form.nmUsuario, dsEmail: form.dsEmail, idPerfil: form.idPerfil })
    uiStore.pushToast('Usuário atualizado com sucesso!', 'success')
    router.push({ name: 'admin-users' })
  } catch (error) {
    erro.value = error.response?.data?.mensagem || error.message || 'Erro ao atualizar usuário.'
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
  max-width: 700px;
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
