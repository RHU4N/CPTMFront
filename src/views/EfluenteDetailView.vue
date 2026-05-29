<template>
  <div class="page-shell">
    <AppHeader :title="item?.pkCdMeioAmbienteCptm || 'Detalhe do efluente'" @home="router.push({ name: 'dashboard' })" @logout="logout" />

    <main class="screen-grid detail-grid">
      <section v-if="loading" class="loading-state">Carregando detalhe do efluente...</section>
      <template v-else-if="item">
        <section class="card detail-hero">
          <div>
            <span class="eyebrow">Detalhe operacional</span>
            <h1>{{ item.pkCdMeioAmbienteCptm }}</h1>
            <p class="section-subtitle">{{ item.txEndereco || 'Sem endereço' }}</p>
          </div>

          <div class="detail-actions">
            <button class="btn btn-secondary" type="button" @click="router.push({ name: 'dashboard' })">Voltar</button>
            <button class="btn btn-primary" type="button" @click="loadAttachments">Recarregar fotos</button>
          </div>
        </section>

        <section class="card detail-meta">
          <div><strong>Linha</strong><span>{{ item.idLinha }}</span></div>
          <div><strong>Município</strong><span>{{ item.idMunicipio }}</span></div>
          <div><strong>Status</strong><span>{{ item.idStatusDesvio }}</span></div>
          <div><strong>Registro</strong><span>{{ formatDate(item.dtRegistro) }}</span></div>
        </section>

        <section class="card map-card">
          <h2 class="section-title">Mapa</h2>
          <EfluenteMap :items="[item]" :selected-id="item.pkCdMeioAmbienteCptm" />
        </section>

        <section class="grid-cards info-grid">
          <article class="card info-card"><strong>Observação</strong><p>{{ item.txObservacao || 'Sem observações' }}</p></article>
          <article class="card info-card"><strong>Coordenadas</strong><p>{{ item.txCoordenadaY }}, {{ item.txCoordenadaX }}</p></article>
          <article class="card info-card"><strong>Contato</strong><p>{{ item.txNomeTecnicoResponsavel || 'N/A' }}</p></article>
          <article class="card info-card"><strong>Contrato</strong><p>{{ item.txNumeroContrato || 'N/A' }}</p></article>
        </section>

        <section class="card">
          <h2 class="section-title">Fotos vinculadas</h2>
          <div v-if="attachments.length" class="attachment-grid">
            <article v-for="attachment in attachments" :key="attachment.attachmentId" class="attachment-card">
              <img v-if="attachment.previewUrl" :src="attachment.previewUrl" :alt="attachment.attName || `Anexo ${attachment.attachmentId}`" class="attachment-preview" />
              <div v-else class="attachment-placeholder">{{ attachment.contentType?.split('/')?.[0] === 'image' ? 'Imagem' : 'Arquivo' }}</div>

              <div class="attachment-meta">
                <strong>{{ attachment.attName || `Anexo ${attachment.attachmentId}` }}</strong>
                <small>{{ formatBytes(attachment.dataSize) }}</small>
                <a class="attachment-link" :href="attachmentUrl(attachment.attachmentId)" target="_blank" rel="noreferrer">Abrir arquivo</a>
              </div>
            </article>
          </div>
          <p v-else class="empty-state">Nenhum anexo localizado para este registro.</p>
        </section>
      </template>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EfluenteMap from '@/components/EfluenteMap.vue'
import ToastStack from '@/components/ToastStack.vue'
import { getAttachmentUrl, getEfluenteById, listAttachments } from '@/services/efluenteService'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const item = ref(null)
const attachments = ref([])

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('pt-BR')
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function attachmentUrl(id) {
  return getAttachmentUrl(id)
}

async function load() {
  loading.value = true
  try {
    item.value = await getEfluenteById(route.params.id)
    attachments.value = await listAttachments(route.params.id)
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar detalhe.', 'error')
  } finally {
    loading.value = false
  }
}

async function loadAttachments() {
  attachments.value = await listAttachments(route.params.id)
  uiStore.pushToast('Anexos atualizados.', 'success')
}

function logout() {
  authStore.logout()
  router.replace({ name: 'login' })
}

onMounted(load)
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-hero,
.detail-meta,
.map-card {
  background: #fff;
}

.detail-hero,
.detail-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.detail-hero h1 {
  margin: 8px 0 0;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(190, 30, 45, 0.16);
  color: #fecdd3;
  font-size: 0.8rem;
  font-weight: 800;
}

.detail-meta {
  flex-wrap: wrap;
}

.detail-meta div {
  display: grid;
  gap: 4px;
}

.detail-meta strong {
  font-size: 0.8rem;
  color: var(--muted);
}

.map-card {
  display: grid;
  gap: 12px;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.attachment-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--border);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
}

.attachment-preview,
.attachment-placeholder {
  width: 100%;
  height: 180px;
  border-radius: 14px;
  object-fit: cover;
}

.attachment-placeholder {
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  font-weight: 700;
}

.attachment-meta {
  display: grid;
  gap: 4px;
}

.attachment-link {
  color: #fecdd3;
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}

.info-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 860px) {
  .detail-hero,
  .detail-meta {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>