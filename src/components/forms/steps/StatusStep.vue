<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 6</span>
        <h3 class="section-title">Status Operacional</h3>
        <p class="section-subtitle">Define o estado do desvio ambiental e o status do registro no ciclo operacional.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Status do desvio ambiental</span>
        <span class="field-help">Selecione o status atual do desvio ambiental identificado.</span>
        <select v-model="form.idStatusDesvio" class="select" :class="{ 'is-invalid': errors.idStatusDesvio }" :disabled="loading">
          <option :value="null">Selecione o status</option>
          <option v-for="option in domains.statusDesvio" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idStatusDesvio" class="field-error">{{ errors.idStatusDesvio }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Status do registro</span>
        <span class="field-help">Selecione o status atual do registro no ciclo operacional.</span>
        <select v-model="form.idStatusRegistro" class="select" :class="{ 'is-invalid': errors.idStatusRegistro }" :disabled="loading">
          <option :value="null">Selecione o status</option>
          <option v-for="option in domains.statusRegistro" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idStatusRegistro" class="field-error">{{ errors.idStatusRegistro }}</small>
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
    default: () => ({ statusDesvio: [], statusRegistro: [] }),
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
