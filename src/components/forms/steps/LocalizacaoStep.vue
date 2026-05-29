<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 1</span>
        <h3 class="section-title">Localização do Efluente</h3>
        <p class="section-subtitle">Informe e confirme a localização exata onde o efluente foi identificado.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Em qual município o efluente foi identificado?</span>
        <span class="field-help">Origem: API domínio municípios. Destino Oracle: PT_EFLUENTE.ID_MUNICIPIO.</span>
        <select v-model="form.idMunicipio" class="select" :class="{ 'is-invalid': errors.idMunicipio }" :disabled="loading">
          <option :value="null">Selecione o município</option>
          <option v-for="option in domains.municipios" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idMunicipio" class="field-error">{{ errors.idMunicipio }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Qual linha da CPTM pertence o local?</span>
        <span class="field-help">Origem: API domínio linhas. Destino Oracle: PT_EFLUENTE.ID_LINHA.</span>
        <select v-model="form.idLinha" class="select" :class="{ 'is-invalid': errors.idLinha }" :disabled="loading">
          <option :value="null">Selecione a linha</option>
          <option v-for="option in domains.linhas" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idLinha" class="field-error">{{ errors.idLinha }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Qual via ferroviária?</span>
        <span class="field-help">Origem: API domínio vias. Destino Oracle: PT_EFLUENTE.ID_VIA.</span>
        <select v-model="form.idVia" class="select" :class="{ 'is-invalid': errors.idVia }" :disabled="loading">
          <option :value="null">Selecione a via</option>
          <option v-for="option in domains.vias" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idVia" class="field-error">{{ errors.idVia }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Qual trecho/sentido?</span>
        <span class="field-help">Origem: API domínio trechos. Destino Oracle: PT_EFLUENTE.ID_TRECHO.</span>
        <select v-model="form.idTrecho" class="select" :class="{ 'is-invalid': errors.idTrecho }" :disabled="loading">
          <option :value="null">Selecione o trecho/sentido</option>
          <option v-for="option in domains.trechos" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idTrecho" class="field-error">{{ errors.idTrecho }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Qual o KM/Poste do local?</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_KM_POSTE.</span>
        <input v-model="form.txKmPoste" class="input" :class="{ 'is-invalid': errors.txKmPoste }" type="text" placeholder="Ex.: KM 12+300 / Poste 44" :disabled="loading" />
        <small v-if="errors.txKmPoste" class="field-error">{{ errors.txKmPoste }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Qual o endereço aproximado?</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_ENDERECO.</span>
        <input v-model="form.txEndereco" class="input" :class="{ 'is-invalid': errors.txEndereco }" type="text" placeholder="Rua, ponto de referência ou acesso operacional" :disabled="loading" />
        <small v-if="errors.txEndereco" class="field-error">{{ errors.txEndereco }}</small>
      </label>
    </div>

    <div class="helper-box">
      <div>
        <strong>Modo de geolocalização</strong>
        <p>Use GPS, digite as coordenadas manualmente ou clique no mapa. Todos os modos sincronizam em tempo real.</p>
      </div>
      <div class="radio-grid">
        <label class="radio-option">
          <input v-model="modeProxy" type="radio" value="gps" />
          <span>
            <strong>Usar localização atual</strong>
            <small>Preenche latitude e longitude com o GPS do dispositivo.</small>
          </span>
        </label>

        <label class="radio-option">
          <input v-model="modeProxy" type="radio" value="manual" />
          <span>
            <strong>Informar latitude e longitude manualmente</strong>
            <small>Permite edição direta dos campos numéricos.</small>
          </span>
        </label>

        <label class="radio-option">
          <input v-model="modeProxy" type="radio" value="map" />
          <span>
            <strong>Selecionar ponto no mapa</strong>
            <small>Toque no mapa para mover o pin e atualizar as coordenadas.</small>
          </span>
        </label>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Latitude</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_COORDENADA_Y.</span>
        <input v-model.number="form.txCoordenadaY" class="input" :class="{ 'is-invalid': errors.txCoordenadaY }" type="number" step="any" inputmode="decimal" placeholder="-23.550520" :disabled="loading" @input="setManualMode" />
        <small v-if="errors.txCoordenadaY" class="field-error">{{ errors.txCoordenadaY }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Longitude</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_COORDENADA_X.</span>
        <input v-model.number="form.txCoordenadaX" class="input" :class="{ 'is-invalid': errors.txCoordenadaX }" type="number" step="any" inputmode="decimal" placeholder="-46.633308" :disabled="loading" @input="setManualMode" />
        <small v-if="errors.txCoordenadaX" class="field-error">{{ errors.txCoordenadaX }}</small>
      </label>
    </div>

    <div class="location-panel">
      <div class="location-panel-head">
        <div>
          <span class="field-label">Mapa operacional</span>
          <p class="location-help">Origem: coordenadas do GPS, do mapa ou dos campos manuais. Destino Oracle: PT_EFLUENTE.TX_COORDENADA_X / TX_COORDENADA_Y e PT_EFLUENTE.TX_LINK_MAPA.</p>
        </div>
        <div class="location-actions">
          <button class="btn btn-secondary" type="button" :disabled="loading" @click="useGps">
            Usar GPS
          </button>
          <a v-if="mapLink" class="btn btn-ghost" :href="mapLink" target="_blank" rel="noreferrer">Abrir no mapa</a>
        </div>
      </div>

      <p v-if="feedback" class="location-message">{{ feedback }}</p>

      <LocationPickerMap :latitude="latitude" :longitude="longitude" :zoom="15" @pick="handlePick" />
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import LocationPickerMap from '@/components/LocationPickerMap.vue'

const props = defineProps({
  form: {
    type: Object,
    default: () => ({}),
  },
  domains: {
    type: Object,
    default: () => ({ municipios: [], linhas: [], vias: [], trechos: [] }),
  },
  locationMode: {
    type: String,
    default: 'manual',
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:locationMode', 'pick-location'])

const feedback = ref('')

const latitude = computed(() => (Number.isFinite(Number(props.form.txCoordenadaY)) ? Number(props.form.txCoordenadaY) : null))
const longitude = computed(() => (Number.isFinite(Number(props.form.txCoordenadaX)) ? Number(props.form.txCoordenadaX) : null))
const mapLink = computed(() => (latitude.value !== null && longitude.value !== null ? `https://www.google.com/maps?q=${latitude.value},${longitude.value}` : ''))

const modeProxy = computed({
  get: () => props.locationMode,
  set: (value) => emit('update:locationMode', value),
})

function setManualMode() {
  emit('update:locationMode', 'manual')
}

function handlePick(payload) {
  emit('pick-location', payload)
  emit('update:locationMode', 'map')
  feedback.value = `Coordenada definida em ${payload.latitude.toFixed(6)}, ${payload.longitude.toFixed(6)}.`
}

function useGps() {
  feedback.value = 'Capturando a posição do dispositivo...'

  if (!navigator.geolocation) {
    feedback.value = 'Geolocalização não suportada neste dispositivo.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      handlePick({
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      })
      emit('update:locationMode', 'gps')
    },
    () => {
      feedback.value = 'Não foi possível capturar a localização atual.'
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}
</script>
