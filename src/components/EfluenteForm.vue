<template>
  <form class="card wizard-shell efluente-form" @submit.prevent="handlePrimaryAction">
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

    <div class="wizard-progress-shell">
      <div class="wizard-progress">
        <button
          v-for="(step, index) in steps"
          :key="step.id"
          class="wizard-step-pill"
          :class="{ 'is-active': index === currentStepIndex, 'is-complete': isStepComplete(step.id) }"
          type="button"
          @click="goToStep(index)"
        >
          <span class="wizard-step-number">{{ index + 1 }}</span>
          <span class="wizard-step-pill-text">{{ step.shortTitle }}</span>
        </button>
      </div>
      <div class="wizard-progress-bar"><span :style="{ width: progressWidth }"></span></div>
    </div>

    <div v-if="domainsLoading" class="loading-state">Carregando domínios operacionais, parâmetros de campo e catálogos dinâmicos...</div>

    <component
      :is="currentStep.component"
      v-else
      :form="form"
      :domains="domains"
      :location-mode="locationMode"
      :errors="currentErrors"
      :files="selectedFiles"
      :loading="busy"
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
        <button class="btn btn-ghost" type="button" :disabled="busy || currentStepIndex === 0" @click="previousStep">
          Voltar
        </button>
        <button v-if="!isLastStep" class="btn btn-primary" type="button" :disabled="busy" @click="nextStep">
          Próximo
        </button>
        <button v-else class="btn btn-primary" type="submit" :disabled="busy">
          {{ busy ? 'Salvando...' : 'Salvar inspeção' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import CaracteristicasStep from '@/components/forms/steps/CaracteristicasStep.vue'
import ClassificacaoStep from '@/components/forms/steps/ClassificacaoStep.vue'
import FotosStep from '@/components/forms/steps/FotosStep.vue'
import IdentificacaoStep from '@/components/forms/steps/IdentificacaoStep.vue'
import LocalizacaoStep from '@/components/forms/steps/LocalizacaoStep.vue'
import ObservacaoStep from '@/components/forms/steps/ObservacaoStep.vue'
import ResponsavelStep from '@/components/forms/steps/ResponsavelStep.vue'
import StatusStep from '@/components/forms/steps/StatusStep.vue'
import { createEmptyEfluente } from '@/models/efluente'
import { loadDomainCatalog } from '@/services/domainService'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => createEmptyEfluente(),
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive(createEmptyEfluente())
const selectedFiles = ref([])
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
  tiposEfluente: [],
  departamentos: [],
  statusDesvio: [],
  statusRegistro: [],
})

const isEditMode = computed(() => Boolean(props.modelValue?.pkCdMeioAmbienteCptm))
const busy = computed(() => props.submitting || domainsLoading.value)

const steps = [
  {
    id: 'localizacao',
    shortTitle: 'Localização',
    description: 'Confirma o ponto de campo, o eixo ferroviário e a georreferência do efluente.',
    component: LocalizacaoStep,
  },
  {
    id: 'identificacao',
    shortTitle: 'Identificação',
    description: 'Registra o código operacional, o elemento monitorado e o vínculo contratual.',
    component: IdentificacaoStep,
  },
  {
    id: 'classificacao',
    shortTitle: 'Classificação',
    description: 'Define o tipo de efluente, origem, destinação, volume e unidade operacional.',
    component: ClassificacaoStep,
  },
  {
    id: 'caracteristicas',
    shortTitle: 'Características',
    description: 'Consolida cor, odor, pH e temperatura observados em campo.',
    component: CaracteristicasStep,
  },
  {
    id: 'responsavel',
    shortTitle: 'Responsável',
    description: 'Atribui o técnico e o departamento ambiental responsável pelo acompanhamento.',
    component: ResponsavelStep,
  },
  {
    id: 'status',
    shortTitle: 'Status',
    description: 'Controla o status do desvio ambiental e o status do registro operacional.',
    component: StatusStep,
  },
  {
    id: 'observacao',
    shortTitle: 'Observação',
    description: 'Descreve o contexto, risco e evidências técnicas da inspeção.',
    component: ObservacaoStep,
  },
  {
    id: 'fotos',
    shortTitle: 'Fotos',
    description: 'Anexa até 4 evidências com ordenação operacional e upload multipart.',
    component: FotosStep,
  },
]

const currentStep = computed(() => steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)
const progressWidth = computed(() => `${((currentStepIndex.value + 1) / steps.length) * 100}%`)
const currentErrors = computed(() => (validationRequested.value ? validateStep(currentStep.value.id) : {}))

function normalizeNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function normalizeNullableString(value) {
  return value === null || value === undefined ? '' : String(value)
}

function validateRequired(value, message) {
  return value === null || value === undefined || String(value).trim() === '' ? message : ''
}

function validateCoordinates() {
  const errors = {}
  const latitude = normalizeNullableNumber(form.txCoordenadaY)
  const longitude = normalizeNullableNumber(form.txCoordenadaX)

  if (latitude === null) {
    errors.txCoordenadaY = 'Informe a latitude ou use GPS/mapa.'
  } else if (latitude < -90 || latitude > 90) {
    errors.txCoordenadaY = 'Latitude fora do intervalo esperado (-90 a 90).'
  }

  if (longitude === null) {
    errors.txCoordenadaX = 'Informe a longitude ou use GPS/mapa.'
  } else if (longitude < -180 || longitude > 180) {
    errors.txCoordenadaX = 'Longitude fora do intervalo esperado (-180 a 180).'
  }

  return errors
}

function validateStep(stepId) {
  const errors = {}

  if (stepId === 'localizacao') {
    Object.assign(errors, validateCoordinates())
    errors.idMunicipio = validateRequired(form.idMunicipio, 'Selecione o município.')
    errors.idLinha = validateRequired(form.idLinha, 'Selecione a linha.')
    errors.idVia = validateRequired(form.idVia, 'Selecione a via.')
    errors.idTrecho = validateRequired(form.idTrecho, 'Selecione o trecho/sentido.')
    errors.txKmPoste = validateRequired(form.txKmPoste, 'Informe o KM/Poste.')
    errors.txEndereco = validateRequired(form.txEndereco, 'Informe o endereço aproximado.')
  }

  if (stepId === 'identificacao') {
    errors.pkCdMeioAmbienteCptm = validateRequired(form.pkCdMeioAmbienteCptm, 'Informe o código operacional do registro.')
    errors.txNrElementoMonitoramento = validateRequired(form.txNrElementoMonitoramento, 'Informe o número do elemento monitorado.')
    errors.txNmElementoMonitoramento = validateRequired(form.txNmElementoMonitoramento, 'Informe o nome do elemento monitorado.')
    errors.txProcessoAmbiental = validateRequired(form.txProcessoAmbiental, 'Informe o processo ambiental relacionado.')
    errors.txNumeroContrato = validateRequired(form.txNumeroContrato, 'Informe o número do contrato.')
    errors.txEmpresaContratada = validateRequired(form.txEmpresaContratada, 'Informe a empresa contratada responsável.')
  }

  if (stepId === 'classificacao') {
    errors.idTipoEfluente = validateRequired(form.idTipoEfluente, 'Selecione o tipo de efluente.')
    errors.txOrigemEfluente = validateRequired(form.txOrigemEfluente, 'Descreva a origem do efluente.')
    errors.txDestinacaoEfluente = validateRequired(form.txDestinacaoEfluente, 'Descreva a destinação observada.')
    errors.txVolumeEfluente = validateRequired(form.txVolumeEfluente, 'Informe o volume estimado.')
    errors.txUnidadeVolume = validateRequired(form.txUnidadeVolume, 'Informe a unidade de medida.')
  }

  if (stepId === 'caracteristicas') {
    errors.txCorEfluente = validateRequired(form.txCorEfluente, 'Informe a cor predominante.')
    errors.txOdorEfluente = validateRequired(form.txOdorEfluente, 'Informe o odor identificado.')
    errors.txPh = validateRequired(form.txPh, 'Informe o pH medido.')
    const ph = normalizeNullableNumber(form.txPh)
    if (ph !== null && (ph < 0 || ph > 14)) {
      errors.txPh = 'O pH deve estar entre 0 e 14.'
    }
    errors.txTemperatura = validateRequired(form.txTemperatura, 'Informe a temperatura observada.')
  }

  if (stepId === 'responsavel') {
    errors.txNomeTecnicoResponsavel = validateRequired(form.txNomeTecnicoResponsavel, 'Informe o nome do técnico responsável.')
    errors.txEmailTecnicoResponsavel = validateRequired(form.txEmailTecnicoResponsavel, 'Informe o e-mail do responsável.')
    errors.txTelefoneTecnicoResponsavel = validateRequired(form.txTelefoneTecnicoResponsavel, 'Informe o telefone do responsável.')
    errors.idDeptoCampoAmbiente = validateRequired(form.idDeptoCampoAmbiente, 'Selecione o departamento responsável.')
  }

  if (stepId === 'status') {
    errors.idStatusDesvio = validateRequired(form.idStatusDesvio, 'Selecione o status do desvio ambiental.')
    errors.idStatusRegistro = validateRequired(form.idStatusRegistro, 'Selecione o status do registro.')
  }

  if (stepId === 'observacao') {
    errors.txObservacao = String(form.txObservacao || '').trim().length >= 10 ? '' : 'Descreva ao menos 10 caracteres de observação operacional.'
  }

  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value))
}

function validateAllSteps() {
  return steps.reduce((accumulator, step) => ({
    ...accumulator,
    ...validateStep(step.id),
  }), {})
}

function isStepComplete(stepId) {
  return Object.keys(validateStep(stepId)).length === 0
}

function sanitizePayload() {
  const latitude = normalizeNullableNumber(form.txCoordenadaY)
  const longitude = normalizeNullableNumber(form.txCoordenadaX)

  return {
    ...form,
    pkCdMeioAmbienteCptm: normalizeNullableString(form.pkCdMeioAmbienteCptm).trim(),
    txNrElementoMonitoramento: normalizeNullableString(form.txNrElementoMonitoramento).trim(),
    txNmElementoMonitoramento: normalizeNullableString(form.txNmElementoMonitoramento).trim(),
    txKmPoste: normalizeNullableString(form.txKmPoste).trim(),
    txEndereco: normalizeNullableString(form.txEndereco).trim(),
    txCoordenadaX: longitude,
    txCoordenadaY: latitude,
    txNomeTecnicoResponsavel: normalizeNullableString(form.txNomeTecnicoResponsavel).trim(),
    txEmailTecnicoResponsavel: normalizeNullableString(form.txEmailTecnicoResponsavel).trim(),
    txTelefoneTecnicoResponsavel: normalizeNullableString(form.txTelefoneTecnicoResponsavel).trim(),
    txEmpresaContratada: normalizeNullableString(form.txEmpresaContratada).trim(),
    txNumeroContrato: normalizeNullableString(form.txNumeroContrato).trim(),
    txProcessoAmbiental: normalizeNullableString(form.txProcessoAmbiental).trim(),
    txOrigemEfluente: normalizeNullableString(form.txOrigemEfluente).trim(),
    txDestinacaoEfluente: normalizeNullableString(form.txDestinacaoEfluente).trim(),
    txUnidadeVolume: normalizeNullableString(form.txUnidadeVolume).trim(),
    txCorEfluente: normalizeNullableString(form.txCorEfluente).trim(),
    txOdorEfluente: normalizeNullableString(form.txOdorEfluente).trim(),
    txObservacao: normalizeNullableString(form.txObservacao).trim(),
    txLinkMapa: latitude !== null && longitude !== null ? `https://www.google.com/maps?q=${latitude},${longitude}` : '',
    dtRegistro: form.dtRegistro ? new Date(form.dtRegistro).toISOString() : new Date().toISOString(),
    idDeptoCampoAmbiente: normalizeNullableNumber(form.idDeptoCampoAmbiente),
    idStatusDesvio: normalizeNullableNumber(form.idStatusDesvio),
    idStatusRegistro: normalizeNullableNumber(form.idStatusRegistro),
    idMunicipio: normalizeNullableNumber(form.idMunicipio),
    idLinha: normalizeNullableNumber(form.idLinha),
    idVia: normalizeNullableNumber(form.idVia),
    idTrecho: normalizeNullableNumber(form.idTrecho),
    idTipoEfluente: normalizeNullableNumber(form.idTipoEfluente),
    txVolumeEfluente: normalizeNullableNumber(form.txVolumeEfluente),
    txPh: normalizeNullableNumber(form.txPh),
    txTemperatura: normalizeNullableNumber(form.txTemperatura),
  }
}

function applyPickedLocation({ latitude, longitude }) {
  form.txCoordenadaY = latitude
  form.txCoordenadaX = longitude
}

function persistDraft() {
  if (!autosaveReady.value || !draftKey.value) {
    return
  }

  try {
    localStorage.setItem(
      draftKey.value,
      JSON.stringify({
        form: sanitizePayload(),
        locationMode: locationMode.value,
        stepIndex: currentStepIndex.value,
      }),
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

  if (!files.length) {
    if (!photosTouched.value) {
      return
    }

    slots.forEach((slot) => {
      form[slot] = ''
    })
    return
  }

  photosTouched.value = true

  slots.forEach((slot, index) => {
    form[slot] = files[index]?.name || ''
  })
}

function initializeForm(value = null) {
  autosaveReady.value = false
  draftKey.value = `cptm.front.efluente.wizard.${value?.pkCdMeioAmbienteCptm || 'new'}`
  const stored = restoreDraft(draftKey.value)

  Object.assign(form, createEmptyEfluente(), value || {})

  if (stored?.form) {
    Object.assign(form, createEmptyEfluente(), stored.form)
    locationMode.value = stored.locationMode || 'manual'
    currentStepIndex.value = Number.isFinite(Number(stored.stepIndex)) ? Number(stored.stepIndex) : 0
  } else {
    locationMode.value = 'manual'
    currentStepIndex.value = 0
  }

  selectedFiles.value = []
  photosTouched.value = false
  validationRequested.value = false

  nextTick(() => {
    autosaveReady.value = true
  })
}

async function loadDomains() {
  domainsLoading.value = true
  domains.value = await loadDomainCatalog()
  domainsLoading.value = false
}

async function goToStep(index) {
  if (index === currentStepIndex.value) {
    return
  }

  if (index > currentStepIndex.value) {
    validationRequested.value = true
    if (Object.keys(validateStep(currentStep.value.id)).length) {
      return
    }
  }

  currentStepIndex.value = index
}

async function nextStep() {
  validationRequested.value = true
  if (Object.keys(validateStep(currentStep.value.id)).length) {
    return
  }

  if (!isLastStep.value) {
    currentStepIndex.value += 1
  }
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value -= 1
  }
}

function submitPayload() {
  validationRequested.value = true
  const errors = validateAllSteps()
  if (Object.keys(errors).length) {
    const firstInvalidIndex = steps.findIndex((step) => Object.keys(validateStep(step.id)).length > 0)
    if (firstInvalidIndex >= 0) {
      currentStepIndex.value = firstInvalidIndex
    }

    return
  }

  emit('save', sanitizePayload(), [...selectedFiles.value])
}

function handlePrimaryAction() {
  submitPayload()
}

watch(
  () => props.modelValue,
  (value) => {
    initializeForm(value)
  },
  { immediate: true, deep: true },
)

watch(
  () => [form.txCoordenadaX, form.txCoordenadaY],
  () => {
    if (Number.isFinite(Number(form.txCoordenadaX)) && Number.isFinite(Number(form.txCoordenadaY))) {
      form.txLinkMapa = `https://www.google.com/maps?q=${Number(form.txCoordenadaY)},${Number(form.txCoordenadaX)}`
    } else {
      form.txLinkMapa = ''
    }
  },
  { immediate: true },
)

watch(
  selectedFiles,
  (files) => {
    syncPhotoNames(files)
    persistDraft()
  },
  { deep: true },
)

watch(
  [form, locationMode, currentStepIndex],
  () => {
    persistDraft()
  },
  { deep: true },
)

onMounted(async () => {
  await loadDomains()
})
</script>
