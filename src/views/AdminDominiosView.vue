<template>
  <div class="page-shell">
    <AppHeader
      title="Gerenciamento de Domínios"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
      @perfil="router.push({ name: 'meu-perfil' })"
    />

    <main class="screen-grid admin-grid">
      <section class="card">
        <div class="admin-copy">
          <span class="eyebrow">Administração</span>
          <h1 class="section-title">Domínios de Informação</h1>
          <p class="section-subtitle">
            Manutenção dos dados de domínio utilizados nos formulários. Apenas administradores têm
            acesso a esta área.
          </p>
        </div>

        <div class="tipo-selector">
          <label class="field-label">Selecione o domínio</label>
          <select v-model="tipoSelecionado" class="select" @change="carregarItens">
            <option value="">— Escolha um domínio —</option>
            <option v-for="t in tipos" :key="t.valor" :value="t.valor">{{ t.label }}</option>
          </select>
        </div>

        <template v-if="tipoSelecionado">
          <div class="toolbar">
            <button class="btn btn-primary" @click="abrirModalCriar">+ Novo Item</button>
            <button class="btn btn-secondary" @click="carregarItens">Atualizar</button>
          </div>

          <div class="search-wrap">
            <input
              v-model="busca"
              type="text"
              class="input"
              placeholder="Filtrar por descrição..."
            />
          </div>

          <div v-if="loading" class="loading-state">Carregando...</div>

          <div v-else-if="!itensFiltrados.length" class="empty-state">
            Nenhum item encontrado.
          </div>

          <div v-else class="table-wrap">
            <table class="dominio-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th class="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itensFiltrados" :key="item.id">
                  <td class="col-id">{{ item.id }}</td>
                  <td>{{ item.descricao }}</td>
                  <td class="col-actions">
                    <div class="actions-wrap">
                      <button class="action-btn action-edit" @click="abrirModalEditar(item)">Editar</button>
                      <button
                        class="action-btn action-delete"
                        :disabled="actionLoading === item.id"
                        @click="confirmarExcluir(item)"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="!loading && itens.length" class="total-label">
            Exibindo {{ itensFiltrados.length }} de {{ itens.length }} item(ns)
          </p>
        </template>

        <div v-else class="empty-state hint">Selecione um domínio acima para gerenciá-lo.</div>
      </section>
    </main>

    <!-- Modal Criar / Editar -->
    <div v-if="modal.open" class="modal-backdrop" @click.self="fecharModal">
      <div class="dominio-modal">
        <h3 class="modal-title">{{ modal.editando ? 'Editar Item' : 'Novo Item' }}</h3>
        <p class="modal-sub">{{ labelTipoSelecionado }}</p>

        <label class="field-stack">
          <span class="field-label">Descrição *</span>
          <input
            v-model="modal.descricao"
            class="input"
            type="text"
            placeholder="Descrição do item"
            maxlength="200"
            @keyup.enter="salvarModal"
          />
        </label>

        <p v-if="modal.erro" class="erro-msg">{{ modal.erro }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="fecharModal">Cancelar</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="modal.saving || !modal.descricao.trim()"
            @click="salvarModal"
          >
            {{ modal.saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Exclusão -->
    <div v-if="confirmDelete.open" class="modal-backdrop" @click.self="confirmDelete.open = false">
      <div class="dominio-modal">
        <h3 class="modal-title">Confirmar Exclusão</h3>
        <p class="modal-sub">
          Tem certeza que deseja excluir o item
          <strong>"{{ confirmDelete.item?.descricao }}"</strong>?
        </p>
        <p class="warn-msg">Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="confirmDelete.open = false">
            Cancelar
          </button>
          <button
            class="btn btn-danger"
            type="button"
            :disabled="confirmDelete.loading"
            @click="executarExcluir"
          >
            {{ confirmDelete.loading ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import {
  createDominioItem,
  deleteDominioItem,
  listDominio,
  updateDominioItem,
} from '@/services/adminService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const tipos = [
  { valor: 'municipios', label: 'Municípios' },
  { valor: 'linhas', label: 'Linhas CPTM' },
  { valor: 'vias', label: 'Vias CPTM' },
  { valor: 'trechos', label: 'Trechos e Sentidos' },
  { valor: 'estacoes', label: 'Estações CPTM' },
  { valor: 'departamentos', label: 'Departamentos Meio Ambiente' },
  { valor: 'status-registro', label: 'Status de Registro' },
  { valor: 'status-desvio', label: 'Status de Desvio Ambiental' },
  { valor: 'naturezas-pga', label: 'Naturezas PGA' },
  { valor: 'areas-gestoras', label: 'Áreas Gestoras CPTM' },
  { valor: 'proprietarios', label: 'Proprietários' },
  { valor: 'sim-nao', label: 'Sim / Não' },
  { valor: 'tipos-atividade', label: 'Tipos de Atividade' },
  { valor: 'tipos-dra', label: 'Tipos de DRA' },
  { valor: 'tipos-ativ-cptm', label: 'Tipos de Atividade CPTM' },
  { valor: 'locais-atividade', label: 'Locais de Atividade' },
  { valor: 'origens-efluente', label: 'Origens de Efluente' },
  { valor: 'fontes-geradoras', label: 'Fontes Geradoras' },
  { valor: 'tipos-destinacao', label: 'Tipos de Destinação' },
  { valor: 'tipos-veiculo', label: 'Tipos de Veículo' },
]

const tipoSelecionado = ref('')
const itens = ref([])
const loading = ref(false)
const actionLoading = ref(null)
const busca = ref('')

const modal = reactive({
  open: false,
  editando: false,
  itemId: null,
  descricao: '',
  saving: false,
  erro: '',
})

const confirmDelete = reactive({ open: false, item: null, loading: false })

const labelTipoSelecionado = computed(
  () => tipos.find((t) => t.valor === tipoSelecionado.value)?.label ?? '',
)

const itensFiltrados = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return itens.value
  return itens.value.filter((i) => i.descricao.toLowerCase().includes(q))
})

async function carregarItens() {
  if (!tipoSelecionado.value) return
  loading.value = true
  busca.value = ''
  try {
    itens.value = await listDominio(tipoSelecionado.value)
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar itens.', 'error')
  } finally {
    loading.value = false
  }
}

function abrirModalCriar() {
  modal.editando = false
  modal.itemId = null
  modal.descricao = ''
  modal.erro = ''
  modal.saving = false
  modal.open = true
}

function abrirModalEditar(item) {
  modal.editando = true
  modal.itemId = item.id
  modal.descricao = item.descricao
  modal.erro = ''
  modal.saving = false
  modal.open = true
}

function fecharModal() {
  modal.open = false
}

async function salvarModal() {
  if (!modal.descricao.trim()) return
  modal.erro = ''
  modal.saving = true
  try {
    if (modal.editando) {
      await updateDominioItem(tipoSelecionado.value, modal.itemId, modal.descricao.trim())
      const idx = itens.value.findIndex((i) => i.id === modal.itemId)
      if (idx !== -1) itens.value[idx].descricao = modal.descricao.trim()
      uiStore.pushToast('Item atualizado com sucesso.', 'success')
    } else {
      const res = await createDominioItem(tipoSelecionado.value, modal.descricao.trim())
      const novo = res?.dados ?? { id: res?.idLog, descricao: modal.descricao.trim() }
      if (novo) itens.value.push(novo)
      uiStore.pushToast('Item criado com sucesso.', 'success')
    }
    modal.open = false
  } catch (error) {
    modal.erro = error.response?.data?.mensagem || error.message || 'Erro ao salvar item.'
  } finally {
    modal.saving = false
  }
}

function confirmarExcluir(item) {
  confirmDelete.item = item
  confirmDelete.loading = false
  confirmDelete.open = true
}

async function executarExcluir() {
  if (!confirmDelete.item) return
  confirmDelete.loading = true
  try {
    await deleteDominioItem(tipoSelecionado.value, confirmDelete.item.id)
    itens.value = itens.value.filter((i) => i.id !== confirmDelete.item.id)
    uiStore.pushToast(`Item "${confirmDelete.item.descricao}" excluído.`, 'success')
    confirmDelete.open = false
  } catch (error) {
    uiStore.pushToast(
      error.response?.data?.mensagem || error.message || 'Erro ao excluir item.',
      'error',
    )
  } finally {
    confirmDelete.loading = false
  }
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.admin-grid {
  display: grid;
  gap: 16px;
}

.admin-copy {
  display: grid;
  gap: 6px;
  margin-bottom: 20px;
}

.tipo-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 400px;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.search-wrap {
  margin-bottom: 16px;
  max-width: 400px;
}

.table-wrap {
  overflow-x: auto;
}

.dominio-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.dominio-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  white-space: nowrap;
}

.dominio-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.dominio-table tbody tr:hover {
  background: #fafafa;
}

.col-id {
  width: 60px;
  color: #999;
  font-size: 0.82rem;
}

.col-actions {
  width: 130px;
}

.actions-wrap {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-edit {
  background: #f3e5f5;
  color: #6a1b9a;
}

.action-delete {
  background: #ffebee;
  color: #c62828;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.total-label {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #888;
  text-align: right;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #999;
  font-size: 0.95rem;
}

.hint {
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.loading-state {
  padding: 24px;
  color: #888;
  text-align: center;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dominio-modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 440px;
  display: grid;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.modal-sub {
  font-size: 0.88rem;
  color: #666;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.field-stack {
  display: grid;
  gap: 5px;
}

.erro-msg {
  color: #ea191f;
  font-size: 0.88rem;
  background: #fff0f0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(234, 25, 31, 0.3);
  margin: 0;
}

.warn-msg {
  color: #e65100;
  font-size: 0.88rem;
  margin: 0;
}

.btn-danger {
  background: #c62828;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
