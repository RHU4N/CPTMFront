<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 4</span>
        <h3 class="section-title">Características do Efluente</h3>
        <p class="section-subtitle">Registra os parâmetros sensoriais e de campo observados durante a inspeção.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Cor predominante</span>
        <span class="field-help">Descreva a cor predominante observada no efluente durante a vistoria.</span>
        <input v-model="form.txCorEfluente" class="input" :class="{ 'is-invalid': errors.txCorEfluente }" type="text" placeholder="Ex.: turva, escura, leitosa" :disabled="loading" />
        <small v-if="errors.txCorEfluente" class="field-error">{{ errors.txCorEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Odor identificado</span>
        <span class="field-help">Descreva o odor identificado no momento da vistoria (ex.: sem odor, químico, esgoto).</span>
        <input v-model="form.txOdorEfluente" class="input" :class="{ 'is-invalid': errors.txOdorEfluente }" type="text" placeholder="Ex.: forte odor químico / esgoto" :disabled="loading" />
        <small v-if="errors.txOdorEfluente" class="field-error">{{ errors.txOdorEfluente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">pH medido</span>
        <span class="field-help">Valor de 0 a 14. Utilize medidor de campo, se disponível.</span>
        <input v-model.number="form.txPh" class="input" :class="{ 'is-invalid': errors.txPh }" type="number" step="any" inputmode="decimal" placeholder="0 a 14" :disabled="loading" />
        <small v-if="errors.txPh" class="field-error">{{ errors.txPh }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Temperatura observada</span>
        <span class="field-help">Temperatura em graus Celsius observada no campo.</span>
        <input v-model.number="form.txTemperatura" class="input" :class="{ 'is-invalid': errors.txTemperatura }" type="number" step="any" inputmode="decimal" placeholder="Ex.: 27.4" :disabled="loading" />
        <small v-if="errors.txTemperatura" class="field-error">{{ errors.txTemperatura }}</small>
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
