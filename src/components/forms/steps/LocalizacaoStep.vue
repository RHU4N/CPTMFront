<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 5 de 8</span>
        <h3 class="section-title">Localização do Elemento de Monitoramento</h3>
        <p class="section-subtitle">Município, eixo ferroviário, estação, via, trecho, KM/Poste e georreferência WGS84 do ponto de efluente.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Nome de Município</span>
        <small class="field-help">Selecionar o município onde está localizado o elemento monitorado no ato da vistoria, se aplicável.</small>
        <select v-model="form.txMunicipio" class="select" :class="{ 'is-invalid': errors.txMunicipio }" :disabled="loading">
          <option value="">Selecione o município</option>
          <option v-for="opt in domains.municipios" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txMunicipio" class="field-error">{{ errors.txMunicipio }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nome da Linha CPTM</span>
        <small class="field-help">Escolher o número da Linha CPTM mais próxima ao elemento monitorado.</small>
        <select v-model="form.txLinhaCptm" class="select" :class="{ 'is-invalid': errors.txLinhaCptm }" :disabled="loading">
          <option value="">Selecione a linha</option>
          <option v-for="opt in domains.linhas" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txLinhaCptm" class="field-error">{{ errors.txLinhaCptm }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nome da Estação CPTM</span>
        <small class="field-help">Selecionar a estação CPTM onde está localizado o elemento monitorado, se aplicável.</small>
        <select v-model="form.txEstacaoCptm" class="select" :disabled="loading">
          <option value="">Selecione a estação</option>
          <option v-for="opt in domains.estacoes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="field-stack">
        <span class="field-label">Número da Via da Linha CPTM</span>
        <small class="field-help">Selecionar a via na qual está localizado o elemento monitorado, se aplicável.</small>
        <select v-model="form.txViaCptm" class="select" :disabled="loading">
          <option value="">Selecione a via</option>
          <option v-for="opt in domains.vias" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="field-stack">
        <span class="field-label">Trecho e Sentido da Linha CPTM</span>
        <small class="field-help">Selecionar o trecho e sentido da via na qual está localizado o elemento monitorado, se aplicável.</small>
        <select v-model="form.txTrechoESentidoCptm" class="select" :disabled="loading">
          <option value="">Selecione o trecho/sentido</option>
          <option v-for="opt in domains.trechos" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="field-stack">
        <span class="field-label">Número do Quilômetro e Poste</span>
        <small class="field-help">Inserir o Km/Poste mais próximo do elemento monitorado, se aplicável. Padrão: "00/00" ou "000/000"</small>
        <input v-model="form.txKmPoste" class="input" :class="{ 'is-invalid': errors.txKmPoste }" type="text" placeholder="Ex.: 51/02" :disabled="loading" />
        <small v-if="errors.txKmPoste" class="field-error">{{ errors.txKmPoste }}</small>
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
            <strong>Usar localização atual (GPS)</strong>
            <small>Preenche lat/long WGS84 com o GPS do dispositivo.</small>
          </span>
        </label>
        <label class="radio-option">
          <input v-model="modeProxy" type="radio" value="manual" />
          <span>
            <strong>Informar manualmente</strong>
            <small>Permite edição direta dos campos numéricos.</small>
          </span>
        </label>
        <label class="radio-option">
          <input v-model="modeProxy" type="radio" value="map" />
          <span>
            <strong>Selecionar no mapa</strong>
            <small>Toque no mapa para mover o pin e atualizar as coordenadas.</small>
          </span>
        </label>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Latitude em Graus (Datum: WGS84)</span>
        <small class="field-help">Latitude em grau decimal, Datum WGS84. Valores negativos para hemisfério sul.</small>
        <input v-model.number="form.nrLatGrauDecimalWgs84" class="input" :class="{ 'is-invalid': errors.nrLatGrauDecimalWgs84 }" type="number" step="any" inputmode="decimal" placeholder="Ex.: -23,123456" :disabled="loading" @input="setManualMode" />
        <small v-if="errors.nrLatGrauDecimalWgs84" class="field-error">{{ errors.nrLatGrauDecimalWgs84 }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Longitude em Graus (Datum: WGS84)</span>
        <small class="field-help">Longitude em grau decimal, Datum WGS84. Valores negativos para oeste de Greenwich.</small>
        <input v-model.number="form.nrLongGrauDecimalWgs84" class="input" :class="{ 'is-invalid': errors.nrLongGrauDecimalWgs84 }" type="number" step="any" inputmode="decimal" placeholder="Ex.: -46,123456" :disabled="loading" @input="setManualMode" />
        <small v-if="errors.nrLongGrauDecimalWgs84" class="field-error">{{ errors.nrLongGrauDecimalWgs84 }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Latitude em Metros (Datum: SIRGAS2000)</span>
        <small class="field-help">Latitude em metros, Datum SIRGAS2000 (opcional).</small>
        <input v-model.number="form.nrLatMetrosSirgas2000" class="input" type="number" step="any" inputmode="decimal" placeholder="Ex.: 325.421" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Longitude em Metros (Datum: SIRGAS2000)</span>
        <small class="field-help">Longitude em metros, Datum SIRGAS2000 (opcional).</small>
        <input v-model.number="form.nrLongMetrosSirgas2000" class="input" type="number" step="any" inputmode="decimal" placeholder="Ex.: 7.456.589" :disabled="loading" />
      </label>
    </div>

    <div class="location-panel">
      <div class="location-panel-head">
        <div>
          <span class="field-label">Mapa operacional</span>
          <p class="location-help">Coordenadas WGS84 decimal degrees. Destino Oracle: NR_LAT_GRAU_DECIMAL_WGS84 / NR_LONG_GRAU_DECIMAL_WGS84.</p>
        </div>
        <div class="location-actions">
          <button class="btn btn-secondary" type="button" :disabled="loading" @click="useGps">Usar GPS</button>
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
  form: { type: Object, default: () => ({}) },
  domains: { type: Object, default: () => ({}) },
  locationMode: { type: String, default: 'manual' },
  errors: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:locationMode', 'pick-location'])

const feedback = ref('')

const latitude = computed(() => (Number.isFinite(Number(props.form.nrLatGrauDecimalWgs84)) ? Number(props.form.nrLatGrauDecimalWgs84) : null))
const longitude = computed(() => (Number.isFinite(Number(props.form.nrLongGrauDecimalWgs84)) ? Number(props.form.nrLongGrauDecimalWgs84) : null))
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
  feedback.value = 'Capturando posição do dispositivo...'
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
