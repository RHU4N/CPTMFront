<template>
  <div class="page-shell">
    <AppHeader
      :title="headerTitle"
      @home="router.push({ name: 'dashboard' })"
      @logout="logout"
      @perfil="router.push({ name: 'meu-perfil' })"
    />

    <main class="screen-grid detail-grid">
      <section v-if="loading" class="loading-state">Carregando...</section>

      <template v-else-if="item">

        <!-- HERO -->
        <section class="card detail-hero">
          <div>
            <div class="hero-top-row">
              <StatusChip :status="itemStatus" />
              <span class="eyebrow">{{ sourceLabel }}</span>
            </div>
            <h1>{{ item.pkCdMeioAmbienteCptm || 'Sem identificador' }}</h1>
            <p class="section-subtitle">{{ item.txNmElementoMonitoramento || item.txNrElementoMonitoramento || 'Sem elemento de monitoramento' }}</p>
          </div>
          <div class="detail-actions">
            <button class="btn btn-secondary" type="button" @click="router.back()">Voltar</button>
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
            <strong>Status desvio</strong>
            <span>{{ item.txStatusDoDesvioAmbiental || '—' }}</span>
          </div>
          <div>
            <strong>Data</strong>
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

        <!-- MAPA (se tiver coordenadas) -->
        <section v-if="item.nrLatGrauDecimalWgs84 && item.nrLongGrauDecimalWgs84" class="card map-card">
          <h2 class="section-title">Localização</h2>
          <EfluenteMap :items="[item]" :selected-id="item.pkCdMeioAmbienteCptm" />
        </section>

        <!-- SEÇÕES DETALHADAS -->
        <div class="detail-sections">

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
              <div><dt>Local escopo contratual</dt><dd>{{ val(item.txNmLocalEscopoContratual) }}</dd></div>
            </dl>
          </section>

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

          <section class="card detail-section">
            <h3 class="detail-section-title">Formulário PGA</h3>
            <dl class="detail-dl">
              <div><dt>Natureza do PGA</dt><dd>{{ val(item.txNaturezaDoPga) }}</dd></div>
              <div><dt>Tipo de formulário</dt><dd>{{ val(item.txTipoDeFormulario) }}</dd></div>
              <div><dt>Data de emissão</dt><dd>{{ formatDate(item.dtDataEmissaoFormulario) }}</dd></div>
              <div><dt>Nº do formulário</dt><dd>{{ val(item.nrNumeroDeFormulario) }}</dd></div>
              <div><dt>Autor PF do formulário</dt><dd>{{ val(item.txAutorPfDoFormulario) }}</dd></div>
              <div><dt>PJ executora</dt><dd>{{ val(item.txNomePjExecutora) }}</dd></div>
            </dl>
          </section>

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
            </dl>
          </section>

          <section class="card detail-section">
            <h3 class="detail-section-title">Caracterização do Efluente</h3>
            <dl class="detail-dl">
              <div><dt>Origem do efluente</dt><dd>{{ val(item.txOrigemEfluente) }}</dd></div>
              <div><dt>Fonte geradora</dt><dd>{{ val(item.txFonteGeradora) }}</dd></div>
              <div><dt>Quantidade (L)</dt><dd>{{ val(item.nrQuantidadeL) }}</dd></div>
              <div><dt>Tipo de destinação</dt><dd>{{ val(item.txTipoDestinacao) }}</dd></div>
              <div><dt>Tipo de veículo</dt><dd>{{ val(item.txTipoVeiculo) }}</dd></div>
              <div><dt>ID do veículo</dt><dd>{{ val(item.txIdVeiculo) }}</dd></div>
              <div><dt>Guia de remessa</dt><dd>{{ val(item.txIdGuiaRemessa) }}</dd></div>
              <div><dt>Distância da via (m)</dt><dd>{{ val(item.nrDistanciaDaViaM) }}</dd></div>
              <div><dt>Oferece risco ao sistema?</dt><dd>{{ val(item.txOfereceRiscoSistemaCptm) }}</dd></div>
              <div><dt>Proprietário</dt><dd>{{ val(item.txProprietario) }}</dd></div>
              <div><dt>ID / Nº DRA</dt><dd>{{ val(item.txIdDra) }}</dd></div>
              <div><dt>Validade DRA</dt><dd>{{ formatDate(item.dtValidadeDra) }}</dd></div>
              <div class="detail-full"><dt>Observações</dt><dd>{{ val(item.txObsCadastramento) }}</dd></div>
            </dl>
          </section>

        </div>

        <!-- FOTOS -->
        <section class="card">
          <h2 class="section-title">Fotos vinculadas</h2>
          <div v-if="photos.length" class="attachment-grid">
            <article v-for="(photo, idx) in photos" :key="idx" class="attachment-card">
              <img v-if="photo.previewUrl" :src="photo.previewUrl" :alt="photo.name || `Foto ${idx + 1}`" class="attachment-preview" />
              <div v-else class="attachment-placeholder">Imagem</div>
              <div class="attachment-meta">
                <strong>{{ photo.name || `Foto ${idx + 1}` }}</strong>
              </div>
            </article>
          </div>
          <p v-else class="empty-state">Nenhuma foto disponível para este registro.</p>
        </section>

      </template>

      <section v-else class="card">
        <p class="empty-state">Registro não encontrado.</p>
        <button class="btn btn-secondary" type="button" @click="router.back()">Voltar</button>
      </section>
    </main>

    <ToastStack />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import EfluenteMap from '@/components/EfluenteMap.vue'
import StatusChip from '@/components/StatusChip.vue'
import ToastStack from '@/components/ToastStack.vue'
import { createEmptyEfluente } from '@/models/efluente'
import { getEfluenteById, listAttachments } from '@/services/efluenteService'
import { STATUS, getDraftById } from '@/services/draftService'
import { peekQueue } from '@/services/offlineQueue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(true)
const item = ref(null)
const photos = ref([])

const source = computed(() => route.query.source || 'server')

const itemStatus = computed(() => {
  if (source.value === 'draft') return item.value?._ready ? STATUS.PRONTO : STATUS.RASCUNHO
  if (source.value === 'queue') return STATUS.AGUARDANDO
  return STATUS.SINCRONIZADO
})

const sourceLabel = computed(() => {
  if (source.value === 'draft') return 'Rascunho local'
  if (source.value === 'queue') return 'Aguardando sincronização'
  return 'Sincronizado'
})

const headerTitle = computed(() => {
  if (source.value === 'draft') return 'Visualizar Rascunho'
  if (source.value === 'queue') return 'Visualizar Inspeção (offline)'
  return 'Visualizar Inspeção'
})

function val(v) {
  if (v === null || v === undefined || String(v).trim() === '') return '—'
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

async function load() {
  loading.value = true
  try {
    const id = route.params.id

    if (source.value === 'draft') {
      const data = getDraftById(id)
      if (data?.form) {
        item.value = { ...createEmptyEfluente(), ...data.form, _ready: !!data.ready }
        photos.value = (data.files || [])
          .filter((f) => f.type?.startsWith('image/'))
          .map((f) => ({ name: f.name, previewUrl: f.dataUrl }))
      }
    } else if (source.value === 'queue') {
      const entry = peekQueue().find((e) => e.payload?.pkCdMeioAmbienteCptm === id)
      if (entry) {
        item.value = { ...createEmptyEfluente(), ...entry.payload }
        photos.value = (entry.files || [])
          .filter((f) => f.type?.startsWith('image/'))
          .map((f) => ({ name: f.name, previewUrl: f.dataUrl }))
      }
    } else {
      item.value = await getEfluenteById(id)
      const attachmentList = await listAttachments(id)
      photos.value = attachmentList
        .filter((a) => a.previewUrl)
        .map((a) => ({ name: a.attName, previewUrl: a.previewUrl }))
    }
  } catch (error) {
    uiStore.pushToast(error.message || 'Falha ao carregar.', 'error')
  } finally {
    loading.value = false
  }
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

.hero-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.detail-hero h1 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  word-break: break-all;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(234, 25, 31, 0.1);
  color: #ea191f;
  font-size: 0.75rem;
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
  font-size: 0.72rem;
  color: #888;
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
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 14px;
}

.detail-section-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
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
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-dl > div:last-child {
  border-bottom: none;
}

.detail-full {
  grid-column: 1 / -1;
  grid-template-columns: 1fr !important;
}

.detail-dl dt {
  font-size: 0.78rem;
  color: #888;
  font-weight: 500;
}

.detail-dl dd {
  font-size: 0.85rem;
  margin: 0;
  word-break: break-word;
  color: #222;
}

.attachment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.attachment-card {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.attachment-preview,
.attachment-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  object-fit: cover;
}

.attachment-placeholder {
  display: grid;
  place-items: center;
  background: #f5f5f5;
  color: #aaa;
  font-weight: 600;
  font-size: 0.85rem;
}

.attachment-meta {
  display: grid;
  gap: 2px;
}

.attachment-meta strong {
  font-size: 0.82rem;
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  .detail-meta {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
