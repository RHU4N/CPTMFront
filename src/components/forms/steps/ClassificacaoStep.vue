<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 3</span>
        <h3 class="section-title">Classificação do Efluente</h3>
        <p class="section-subtitle">Classifica o material observado com os domínios operacionais da CPTM.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Tipo de efluente</span>
        <span class="field-help">Origem: API domínio tipos de efluente. Destino Oracle: PT_EFLUENTE.ID_TIPO_EFLUENTE.</span>
        <select v-model="form.idTipoEfluente" class="select" :class="{ 'is-invalid': errors.idTipoEfluente }" :disabled="loading">
          <option :value="null">Selecione o tipo</option>
          <option v-for="option in domains.tiposEfluente" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idTipoEfluente" class="field-error">{{ errors.idTipoEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Origem do efluente</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_ORIGEM_EFLUENTE.</span>
        <input v-model="form.txOrigemEfluente" class="input" :class="{ 'is-invalid': errors.txOrigemEfluente }" type="text" placeholder="Ex.: Drenagem superficial / vazamento pontual" :disabled="loading" />
        <small v-if="errors.txOrigemEfluente" class="field-error">{{ errors.txOrigemEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Destinação observada do efluente</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_DESTINACAO_EFLUENTE.</span>
        <input v-model="form.txDestinacaoEfluente" class="input" :class="{ 'is-invalid': errors.txDestinacaoEfluente }" type="text" placeholder="Ex.: Solo, canaleta, rede de drenagem, corpo hídrico" :disabled="loading" />
        <small v-if="errors.txDestinacaoEfluente" class="field-error">{{ errors.txDestinacaoEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Volume estimado</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_VOLUME_EFLUENTE.</span>
        <input v-model.number="form.txVolumeEfluente" class="input" :class="{ 'is-invalid': errors.txVolumeEfluente }" type="number" step="any" inputmode="decimal" placeholder="Ex.: 12.5" :disabled="loading" />
        <small v-if="errors.txVolumeEfluente" class="field-error">{{ errors.txVolumeEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Unidade de medida</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_UNIDADE_VOLUME.</span>
        <input v-model="form.txUnidadeVolume" class="input" :class="{ 'is-invalid': errors.txUnidadeVolume }" type="text" list="unidade-volume-options" placeholder="L, m³, L/min..." :disabled="loading" />
        <datalist id="unidade-volume-options">
          <option value="L" />
          <option value="m³" />
          <option value="L/min" />
          <option value="m³/h" />
        </datalist>
        <small v-if="errors.txUnidadeVolume" class="field-error">{{ errors.txUnidadeVolume }}</small>
      </label>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  form: {
    type: Object,
    default: () => ({}),
  },
  domains: {
    type: Object,
    default: () => ({ tiposEfluente: [] }),
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
</script>
