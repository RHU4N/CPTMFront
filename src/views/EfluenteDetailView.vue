<template>
  <div class="page-shell">
    <AppHeader :title="item?.pkCdMeioAmbienteCptm || 'Detalhe do efluente'" @home="router.push({ name: 'dashboard' })" @logout="logout" />

    <main class="screen-grid detail-grid">
      <section v-if="loading" class="loading-state">Carregando detalhe do efluente...</section>
      <template v-else-if="item">

        <!-- HERO -->
        <section class="card detail-hero">
          <div>
            <span class="eyebrow">Detalhe operacional</span>
            <h1>{{ item.pkCdMeioAmbienteCptm }}</h1>
            <p class="section-subtitle">{{ item.txNmElementoMonitoramento || item.txNrElementoMonitoramento || 'Sem elemento de monitoramento' }}</p>
          </div>
          <div class="detail-actions">
            <button class="btn btn-secondary" type="button" @click="router.push({ name: 'dashboard' })">Voltar</button>
            <button class="btn btn-primary" type="button" @click="loadAttachments">Recarregar fotos</button>
          </div>
        </section>

        <!-- RESUMO RÁPIDO -->
        <section class="card detail-meta">
          <div>
            <strong>Linha</strong>
            <span>{{ item.txLinhaCptm || '—' }}</span>
          </div>
          <div>
            <strong>Município</strong>
            <span>{{ item.txMunicipio || '—' }}</span>
          </div>
          <div>
            <strong>Status do desvio</strong>
            <span>{{ item.txStatusDoDesvioAmbiental || '—' }}</span>
          </div>
          <div>
            <strong>Data do cadastro</strong>
            <span>{{ formatDate(item.dtDataDoCadastramento) }}</span>
          </div>
          <div>
            <strong>Hora</strong>
            <span>{{ item.hrHorasDoCadastramento || '—' }}</span>
          </div>
          <div>
            <strong>KM / Poste</strong>
            <span>{{ item.txKmPoste || '—' }}</span>
          </div>
        </section>

        <!-- MAPA -->
        <section class="card map-card">
          <h2 class="section-title">Mapa</h2>
          <EfluenteMap :items="[item]" :selected-id="item.pkCdMeioAmbienteCptm" />
        </section>

        <!-- SEÇÕES DETALHADAS -->
        <div class="detail-sections">

          <!-- 1. PREMISSAS -->
          <section class="card detail-section">
            <h3 class="detail-section-title">Premissas Contratuais</h3>
            <dl class="detail-dl">
              <div><dt>Empresa contratada (PJ)</dt><dd>{{ val(item.txNomePjDaContratada) }}</dd></div>
              <div><dt>Nº contrato contratada</dt><dd>{{ val(item.txNrContratoContratada) }}</dd></div>
              <div><dt>Sigla depto. meio ambiente</dt><dd>{{ val(item.txSiglaDeptomMeioAmbiente) }}</dd></div>
              <div><dt>Representante (PF)</dt><dd>{{ val(item.txNomePfDaRepresentante) }}</dd></div>
              <div><dt>Área gestora CPTM</dt><dd>{{ val(item.txNmAreaGestoraCptm) }}</dd></div>
              <div><dt>Sigla área gestora</dt><dd>{{ val(item.txSiglaAreaGestoraCptm) }}</dd></div>
              <div><dt>Empresa supervisora (PJ)</dt><dd>{{ val(item.txNomePjDaSupervisora) }}</dd></div>
              <div><dt>Nº contrato supervisora</dt><dd>{{ val(item.txNrContratoSupervisora) }}</dd></div>
              <div><dt>Local do escopo contratual</dt><dd>{{ val(item.txNmLocalEscopoContratual) }}</dd></div>
            </dl>
          </section>

          <!-- 2. CADASTRADOR -->
          <section class="card detail-section">
            <h3 class="detail-section-title">Cadastrador / Responsável Técnico</h3>
            <dl class="detail-dl">
              <div><dt>PJ autor do cadastro</dt><dd>{{ val(item.txAutorPjDoCadastro) }}</dd></div>
              <div><dt>PF autor do cadastro</dt><dd>{{ val(item.txAutorPfDoCadastro) }}</dd></div>
              <div><dt>Nome responsável técnico</dt><dd>{{ val(item.txNmResponsavelCadastro) }}</dd></div>
              <div><dt>Registro profissional (RP)</dt><dd>{{ val(item.txRpResponsavelCadastro) }}</dd></div>
              <div><dt>DRT</dt><dd>{{ val(item.txDrtResponsavelCadastro) }}</dd></div>
            </dl>
          </section>

          <!-- 3. FORMULÁRIO PGA -->
          <section class="card detail-section">
            <h3 class="detail-section-title">Formulário PGA</h3>
            <dl class="detail-dl">
              <div><dt>Natureza do PGA</dt><dd>{{ val(item.txNaturezaDoPga) }}</dd></div>
              <div><dt>Tipo de formulário</dt><dd>{{ val(item.txTipoDeFormulario) }}</dd></div>
              <div><dt>Data de emissão</dt><dd>{{ formatDate(item.dtDataEmissaoFormulario) }}</dd></div>
              <div><dt>Nº do formulário</dt><dd>{{ valNum(item.nrNumeroDeFormulario) }}</dd></div>
              <div><dt>Autor PF do formulário</dt><dd>{{ val(item.txAutorPfDoFormulario) }}</dd></div>
              <div><dt>PJ executora</dt><dd>{{ val(item.txNomePjExecutora) }}</dd></div>
            </dl>
          </section>

          <!-- 4. LOCALIZAÇÃO -->
          <section class="card detail-section">
            <h3 class="detail-section-title">Localização</h3>
            <dl class="detail-dl">
              <div><dt>Município</dt><dd>{{ val(item.txMunicipio) }}</dd></div>
              <div><dt>Linha CPTM</dt><dd>{{ val(item.txLinhaCptm) }}</dd></div>
              <div><dt>Via CPTM</dt><dd>{{ val(item.txViaCptm) }}</dd></div>
              <div><dt>Trecho / Sentido</dt><dd>{{ val(item.txTrechoESentidoCptm) }}</dd></div>
              <div><dt>KM / Poste</dt><dd>{{ val(item.txKmPoste) }}</dd></div>
              <div><dt>Estação CPTM</dt><dd>{{ val(item.txEstacaoCptm) }}</dd></div>
              <div><dt>Latitude WGS84</dt><dd>{{ valCoord(item.nrLatGrauDecimalWgs84) }}</dd></div>
              <div><dt>Longitude WGS84</dt><dd>{{ valCoord(item.nrLongGrauDecimalWgs84) }}</dd></div>
              <div><dt>Latitude SIRGAS2000 (m)</dt><dd>{{ valCoord(item.nrLatMetrosSirgas2000) }}</dd></div>
              <div><dt>Longitude SIRGAS2000 (m)</dt><dd>{{ valCoord(item.nrLongMetrosSirgas2000) }}</dd></div>
            </dl>
          </section>

          <!-- 5. CARACTERIZAÇÃO -->
          <section class="card detail-section">
            <h3 class="detail-section-title">Caracterização do Efluente</h3>
            <dl class="detail-dl">
              <div><dt>Origem do efluente</dt><dd>{{ val(item.txOrigemEfluente) }}</dd></div>
              <div><dt>Fonte geradora</dt><dd>{{ val(item.txFonteGeradora) }}</dd></div>
              <div><dt>Quantidade (L)</dt><dd>{{ valNum(item.nrQuantidadeL) }}</dd></div>
              <div><dt>Tipo de destinação</dt><dd>{{ val(item.txTipoDestinacao) }}</dd></div>
              <div><dt>Tipo de veículo</dt><dd>{{ val(item.txTipoVeiculo) }}</dd></div>
              <div><dt>Placa / ID do veículo</dt><dd>{{ val(item.txIdVeiculo) }}</dd></div>
              <div><dt>Guia de remessa</dt><dd>{{ val(item.txIdGuiaRemessa) }}</dd></div>
              <div><dt>Distância da via (m)</dt><dd>{{ valNum(item.nrDistanciaDaViaM) }}</dd></div>
              <div><dt>Oferece risco ao sistema CPTM?</dt><dd>{{ val(item.txOfereceRiscoSistemaCptm) }}</dd></div>
              <div><dt>Proprietário</dt><dd>{{ val(item.txProprietario) }}</dd></div>
              <div><dt>Tipo atividade listada</dt><dd>{{ val(item.txTipoAtividadeListada) }}</dd></div>
              <div><dt>Tipo DRA listado</dt><dd>{{ val(item.txTipoDraListado) }}</dd></div>
              <div><dt>ID / Nº DRA</dt><dd>{{ val(item.txIdDra) }}</dd></div>
              <div><dt>Validade DRA</dt><dd>{{ formatDate(item.dtValidadeDra) }}</dd></div>
              <div class="detail-full"><dt>Observações</dt><dd>{{ val(item.txObsCadastramento) }}</dd></div>
            </dl>
          </section>

        </div>

        <!-- FOTOS -->
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
      <section v-else class="card">
        <p class="empty-state">Registro não encontrado.</p>
        <button class="btn btn-secondary" type="button" @click="router.push({ name: 'dashboard' })">Voltar ao painel</button>
      </section>
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

function val(v) {
  if (v === null || v === undefined || String(v).trim() === '') return '—'
  return String(v)
}

function valNum(v) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function valCoord(v) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(6) : String(v)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR')
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
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

.detail-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-hero h1 {
  margin: 8px 0 0;
  font-size: 1.5rem;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(190, 30, 45, 0.16);
  color: #fecdd3;
  font-size: 0.78rem;
  font-weight: 800;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
  padding: 16px 20px;
}

.detail-meta > div {
  display: grid;
  gap: 4px;
}

.detail-meta strong {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-meta span {
  font-size: 0.95rem;
  font-weight: 600;
}

.map-card {
  display: grid;
  gap: 12px;
}

.detail-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 14px;
}

.detail-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.detail-dl {
  display: grid;
  gap: 0;
  margin: 0;
}

.detail-dl > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-dl > div:last-child {
  border-bottom: none;
}

.detail-full {
  grid-column: 1 / -1;
  grid-template-columns: 1fr !important;
}

.detail-dl dt {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 500;
}

.detail-dl dd {
  font-size: 0.85rem;
  margin: 0;
  word-break: break-word;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.attachment-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
}

.attachment-preview,
.attachment-placeholder {
  width: 100%;
  aspect-ratio: 3 / 4;
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
  font-size: 0.82rem;
}

.attachment-link:hover {
  text-decoration: underline;
}

.empty-state {
  color: var(--muted);
  text-align: center;
  padding: 24px;
}

@media (max-width: 640px) {
  .detail-hero {
    flex-direction: column;
  }

  .detail-sections {
    grid-template-columns: 1fr;
  }

  .detail-dl > div {
    grid-template-columns: 1fr;
  }
}
</style>
