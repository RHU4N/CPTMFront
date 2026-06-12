<template>
  <form ref="formEl" class="card wizard-shell efluente-form" @submit.prevent="handlePrimaryAction">
    <header class="wizard-header">
      <div class="wizard-header-copy">
        <span class="eyebrow">CPTM | Inspeção ambiental</span>
        <h2 class="section-title">{{ isEditMode ? 'Atualização operacional do efluente' : 'Nova inspeção operacional de efluente' }}</h2>
        <p class="section-subtitle">Fluxo de coleta técnica com geolocalização, classificação ambiental, anexos e integração Oracle.</p>
      </div>
      <div class="wizard-header-actions">
        <button class="btn btn-ghost" type="button" @click="$emit('cancel')">Fechar</button>
      </div>
    </header>

    <div class="wizard-stepper-shell">
      <div class="wizard-stepper">
        <template v-for="(step, index) in steps" :key="step.id">
          <button
            type="button"
            class="wizard-stepper-node"
            :class="{
              'is-active': index === currentStepIndex,
              'is-complete': isStepComplete(step.id) && index !== currentStepIndex,
            }"
            :title="step.shortTitle"
            @click="goToStep(index)"
          >
            <span class="wizard-stepper-circle">
              <svg v-if="isStepComplete(step.id) && index !== currentStepIndex" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="wizard-stepper-label">{{ step.shortTitle }}</span>
          </button>
          <div v-if="index < steps.length - 1" class="wizard-stepper-track" :class="{ 'is-done': index < currentStepIndex }" />
        </template>
      </div>
    </div>

    <div v-if="domainsLoading" class="loading-state">Carregando domínios operacionais...</div>

    <component
      :is="currentStep.component"
      v-else
      :form="form"
      :domains="domains"
      :location-mode="locationMode"
      :errors="currentErrors"
      :files="selectedFiles"
      :loading="fieldsDisabled"
      @update:locationMode="locationMode = $event"
      @pick-location="applyPickedLocation"
      @update:files="selectedFiles = $event"
    />

    <div class="wizard-footer">
      <div class="wizard-footer-copy">
        <span class="field-help">Passo {{ currentStepIndex + 1 }} de {{ steps.length }} | {{ currentStep.shortTitle }}</span>
        <p>{{ currentStep.description }}</p>
      </div>
      <div class="wizard-footer-actions">
        <button class="btn btn-ghost" type="button" :disabled="busy || currentStepIndex === 0" @click="previousStep">Voltar</button>
        <button v-if="!isLastStep" class="btn btn-primary" type="button" :disabled="busy" @click="nextStep">Próximo</button>
        <button v-else-if="!viewOnly" class="btn btn-primary" type="submit" :disabled="busy">{{ busy ? 'Enviando...' : 'Enviar inspeção' }}</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PremissasStep from '@/components/forms/steps/PremissasStep.vue'
import CadastradorStep from '@/components/forms/steps/CadastradorStep.vue'
import FormularioStep from '@/components/forms/steps/FormularioStep.vue'
import DataHoraEmStep from '@/components/forms/steps/DataHoraEmStep.vue'
import LocalizacaoStep from '@/components/forms/steps/LocalizacaoStep.vue'
import CaracterizacaoStep from '@/components/forms/steps/CaracterizacaoStep.vue'
import FotosStep from '@/components/forms/steps/FotosStep.vue'
import ReviewStep from '@/components/forms/steps/ReviewStep.vue'
import { createEmptyEfluente } from '@/models/efluente'
import { loadDomainCatalog } from '@/services/domainService'
import { serializeFiles, deserializeFiles } from '@/services/offlineQueue'

const authStore = useAuthStore()

const formEl = ref(null)

function scrollToTop() {
  nextTick(() => {
    formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => createEmptyEfluente(),
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  initialStep: {
    type: Number,
    default: 0,
  },
  viewOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive(createEmptyEfluente())
const selectedFiles = ref([])
const serializedFilesCache = ref([])
const locationMode = ref('manual')
const currentStepIndex = ref(0)
const validationRequested = ref(false)
const domainsLoading = ref(true)
const autosaveReady = ref(false)
const draftKey = ref('')
const photosTouched = ref(false)
const domains = ref({
  municipios: [],
  linhas: [],
  vias: [],
  trechos: [],
  estacoes: [],
  departamentos: [],
  statusDesvio: [],
  statusRegistro: [],
  naturezasPga: [],
  areasGestoras: [],
  proprietarios: [],
  simNao: [],
  tiposAtividade: [],
  tiposDra: [],
  tiposAtivCptm: [],
  locaisAtividade: [],
  origensEfluente: [],
  fontesGeradoras: [],
  tiposDestinacao: [],
  tiposVeiculo: [],
})

const isEditMode = computed(() => Boolean(props.modelValue?.pkCdMeioAmbienteCptm))
const busy = computed(() => props.submitting || domainsLoading.value)
const fieldsDisabled = computed(() => busy.value || props.viewOnly)

const steps = [
  {
    id: 'premissas',
    shortTitle: 'Premissas',
    description: 'Empresa contratada, supervisora, área gestora CPTM e representante responsável.',
    component: PremissasStep,
  },
  {
    id: 'cadastrador',
    shortTitle: 'Cadastrador',
    description: 'Autor do cadastro (PF/PJ), registro profissional e DRT.',
    component: CadastradorStep,
  },
  {
    id: 'formulario',
    shortTitle: 'Formulário',
    description: 'Natureza do PGA, tipo, data de emissão, número e autor do formulário.',
    component: FormularioStep,
  },
  {
    id: 'dataHoraEm',
    shortTitle: 'Data/EM',
    description: 'Código do registro, data e hora do cadastro, status e elemento monitorado.',
    component: DataHoraEmStep,
  },
  {
    id: 'localizacao',
    shortTitle: 'Localização',
    description: 'Município, linha, estação, via, trecho, KM/Poste e coordenadas WGS84.',
    component: LocalizacaoStep,
  },
  {
    id: 'caracterizacao',
    shortTitle: 'Caracterização',
    description: 'DRA, atividade, origem, fonte, quantidade, destinação e riscos ao sistema CPTM.',
    component: CaracterizacaoStep,
  },
  {
    id: 'fotos',
    shortTitle: 'Fotos',
    description: 'Até 4 evidências fotográficas com upload multipart para BLOB Oracle (RT_EFLUENTE).',
    component: FotosStep,
  },
  {
    id: 'revisao',
    shortTitle: 'Revisão',
    description: 'Confira todos os dados antes de salvar o cadastro.',
    component: ReviewStep,
  },
]

const currentStep = computed(() => steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
const currentErrors = computed(() => (validationRequested.value ? validateStep(currentStep.value.id) : {}))

function normalizeNullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeNullableString(value) {
  return value === null || value === undefined ? '' : String(value)
}

function validateRequired(value, message) {
  return value === null || value === undefined || String(value).trim() === '' ? message : ''
}

function validateStep(stepId) {
  const errors = {}

  if (stepId === 'premissas') {
    errors.txNomePjDaContratada = validateRequired(form.txNomePjDaContratada, 'Informe a empresa contratada.')
    errors.txNrContratoContratada = validateRequired(form.txNrContratoContratada, 'Informe o número do contrato.')
    errors.txSiglaDeptomMeioAmbiente = validateRequired(form.txSiglaDeptomMeioAmbiente, 'Selecione a sigla do depto. de meio ambiente.')
  }

  if (stepId === 'cadastrador') {
    errors.txAutorPfDoCadastro = validateRequired(form.txAutorPfDoCadastro, 'Informe o PF autor do cadastro.')
    errors.txNmResponsavelCadastro = validateRequired(form.txNmResponsavelCadastro, 'Informe o nome do responsável pelo cadastro.')
  }

  if (stepId === 'formulario') {
    errors.txNaturezaDoPga = validateRequired(form.txNaturezaDoPga, 'Selecione a natureza do PGA.')
  }

  if (stepId === 'dataHoraEm') {
    errors.pkCdMeioAmbienteCptm = validateRequired(form.pkCdMeioAmbienteCptm, 'Informe o código do registro.')
    errors.dtDataDoCadastramento = validateRequired(form.dtDataDoCadastramento, 'Informe a data do cadastro.')
    errors.txStatusDoDesvioAmbiental = validateRequired(form.txStatusDoDesvioAmbiental, 'Selecione o status do desvio ambiental.')
    errors.txNrElementoMonitoramento = validateRequired(form.txNrElementoMonitoramento, 'Informe o número do elemento monitorado.')
    errors.txNmElementoMonitoramento = validateRequired(form.txNmElementoMonitoramento, 'Informe o nome do elemento monitorado.')
  }

  if (stepId === 'localizacao') {
    errors.txMunicipio = validateRequired(form.txMunicipio, 'Selecione o município.')
    errors.txLinhaCptm = validateRequired(form.txLinhaCptm, 'Selecione a linha CPTM.')
    errors.txKmPoste = validateRequired(form.txKmPoste, 'Informe o KM/Poste.')
    const lat = normalizeNullableNumber(form.nrLatGrauDecimalWgs84)
    const lng = normalizeNullableNumber(form.nrLongGrauDecimalWgs84)
    if (lat === null) errors.nrLatGrauDecimalWgs84 = 'Informe a latitude WGS84 ou use GPS/mapa.'
    else if (lat < -90 || lat > 90) errors.nrLatGrauDecimalWgs84 = 'Latitude fora do intervalo esperado (-90 a 90).'
    if (lng === null) errors.nrLongGrauDecimalWgs84 = 'Informe a longitude WGS84 ou use GPS/mapa.'
    else if (lng < -180 || lng > 180) errors.nrLongGrauDecimalWgs84 = 'Longitude fora do intervalo esperado (-180 a 180).'
  }

  if (stepId === 'caracterizacao') {
    errors.txOrigemEfluente = validateRequired(form.txOrigemEfluente, 'Selecione a origem do efluente.')
  }

  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}

function validateAllSteps() {
  return steps.reduce((acc, step) => ({ ...acc, ...validateStep(step.id) }), {})
}

function isStepComplete(stepId) {
  return Object.keys(validateStep(stepId)).length === 0
}

function sanitizePayload() {
  return {
    ...form,
    pkCdMeioAmbienteCptm: normalizeNullableString(form.pkCdMeioAmbienteCptm).trim(),
    txNrElementoMonitoramento: normalizeNullableString(form.txNrElementoMonitoramento).trim(),
    txNmElementoMonitoramento: normalizeNullableString(form.txNmElementoMonitoramento).trim(),
    txKmPoste: normalizeNullableString(form.txKmPoste).trim(),
    txObsCadastramento: normalizeNullableString(form.txObsCadastramento).trim(),
    nrLatGrauDecimalWgs84: normalizeNullableNumber(form.nrLatGrauDecimalWgs84),
    nrLongGrauDecimalWgs84: normalizeNullableNumber(form.nrLongGrauDecimalWgs84),
    nrLatMetrosSirgas2000: normalizeNullableNumber(form.nrLatMetrosSirgas2000),
    nrLongMetrosSirgas2000: normalizeNullableNumber(form.nrLongMetrosSirgas2000),
    nrQuantidadeL: normalizeNullableNumber(form.nrQuantidadeL),
    nrDistanciaDaViaM: normalizeNullableNumber(form.nrDistanciaDaViaM),
    nrNumeroDeFormulario: normalizeNullableNumber(form.nrNumeroDeFormulario),
    dtDataDoCadastramento: form.dtDataDoCadastramento || null,
    dtDataEmissaoFormulario: form.dtDataEmissaoFormulario || null,
    dtValidadeDra: form.dtValidadeDra || null,
  }
}

function applyPickedLocation({ latitude, longitude }) {
  form.nrLatGrauDecimalWgs84 = latitude
  form.nrLongGrauDecimalWgs84 = longitude
}

function persistDraft() {
  if (!autosaveReady.value || !draftKey.value) return
  try {
    localStorage.setItem(
      draftKey.value,
      JSON.stringify({ form: sanitizePayload(), locationMode: locationMode.value, stepIndex: currentStepIndex.value, ready: currentStepIndex.value >= steps.length - 1, files: serializedFilesCache.value, savedAt: new Date().toISOString() }),
    )
  } catch {
    // Ignore storage failures.
  }
}

function restoreDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function syncPhotoNames(files) {
  const slots = ['txNomeFoto01', 'txNomeFoto02', 'txNomeFoto03', 'txNomeFoto04']
  photosTouched.value = files.length > 0
  // Clear slots beyond the current file count; keep user-typed descriptions for active slots
  slots.forEach((slot, index) => {
    if (index >= files.length) form[slot] = ''
  })
}

function initializeForm(value = null) {
  autosaveReady.value = false
  const isNew = !value?.pkCdMeioAmbienteCptm
  draftKey.value = `cptm.front.efluente.wizard.${value?.pkCdMeioAmbienteCptm || 'new'}`
  let stored = restoreDraft(draftKey.value)

  // Migra rascunhos criados como "new" que ainda não foram renomeados para UUID.
  // Ocorre quando o usuário abre "Continuar" num rascunho novo: o formDraft tem UUID,
  // mas o draft foi gravado sob a chave 'new'. Encontra, migra e apaga a chave antiga.
  if (!stored && !isNew) {
    const newKey = 'cptm.front.efluente.wizard.new'
    const newStored = restoreDraft(newKey)
    if (newStored?.form?.pkCdMeioAmbienteCptm === value.pkCdMeioAmbienteCptm) {
      stored = newStored
      try { localStorage.removeItem(newKey) } catch { /* ignore */ }
    }
  }

  Object.assign(form, createEmptyEfluente(), value || {})

  if (stored?.form) {
    Object.assign(form, createEmptyEfluente(), stored.form)
    locationMode.value = stored.locationMode || 'manual'
    currentStepIndex.value = Number.isFinite(Number(stored.stepIndex)) ? Number(stored.stepIndex) : 0
  } else {
    locationMode.value = 'manual'
    currentStepIndex.value = 0
  }

  if (props.initialStep > 0) {
    currentStepIndex.value = Math.min(props.initialStep, steps.length - 1)
  }

  // Tipo de formulário: campo automático conforme Excel (ID 18, Editável: Não)
  form.txTipoDeFormulario = 'Formulário de Cadastramento - FDC (FDC-EEA.EF)'

  // Pré-preenchimento automático apenas em novos registros
  if (isNew) {
    if (!form.pkCdMeioAmbienteCptm) {
      form.pkCdMeioAmbienteCptm = crypto.randomUUID()
    }
    const now = new Date()
    if (!form.dtDataDoCadastramento) {
      form.dtDataDoCadastramento = now.toISOString().slice(0, 10)
    }
    if (!form.hrHorasDoCadastramento) {
      form.hrHorasDoCadastramento = now.toTimeString().slice(0, 5)
    }
    const session = authStore.session
    if (session) {
      if (!form.txAutorPfDoCadastro && session.dsLogin) form.txAutorPfDoCadastro = session.dsLogin
      if (!form.txNmResponsavelCadastro && session.nmUsuario) form.txNmResponsavelCadastro = session.nmUsuario
    }
  }

  if (stored?.files?.length) {
    try {
      serializedFilesCache.value = stored.files
      selectedFiles.value = deserializeFiles(stored.files)
    } catch {
      serializedFilesCache.value = []
      selectedFiles.value = []
    }
  } else {
    serializedFilesCache.value = []
    selectedFiles.value = []
  }
  photosTouched.value = false
  validationRequested.value = false

  nextTick(() => { autosaveReady.value = true })
}

async function loadDomains() {
  domainsLoading.value = true
  domains.value = await loadDomainCatalog()
  domainsLoading.value = false
}

async function goToStep(index) {
  if (index === currentStepIndex.value) return
  if (index > currentStepIndex.value) {
    validationRequested.value = true
    if (Object.keys(validateStep(currentStep.value.id)).length) return
  }
  currentStepIndex.value = index
  scrollToTop()
}

async function nextStep() {
  validationRequested.value = true
  if (Object.keys(validateStep(currentStep.value.id)).length) return
  if (!isLastStep.value) {
    currentStepIndex.value += 1
    scrollToTop()
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value -= 1
    scrollToTop()
  }
}

function submitPayload() {
  validationRequested.value = true
  const errors = validateAllSteps()
  if (Object.keys(errors).length) {
    const firstInvalid = steps.findIndex((step) => Object.keys(validateStep(step.id)).length > 0)
    if (firstInvalid >= 0) currentStepIndex.value = firstInvalid
    return
  }
  emit('save', sanitizePayload(), [...selectedFiles.value])
}

function handlePrimaryAction() {
  submitPayload()
}

watch(
  () => props.modelValue,
  (value) => { initializeForm(value) },
  { immediate: true, deep: true },
)

watch(
  selectedFiles,
  async (files) => {
    syncPhotoNames(files)
    try {
      serializedFilesCache.value = files.length ? await serializeFiles(files) : []
    } catch {
      serializedFilesCache.value = []
    }
    persistDraft()
  },
  { deep: true },
)

watch(
  [form, locationMode, currentStepIndex],
  () => { persistDraft() },
  { deep: true },
)

onMounted(async () => {
  await loadDomains()
})
</script>
