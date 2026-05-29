<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 7</span>
        <h3 class="section-title">Observações</h3>
        <p class="section-subtitle">Descreva as evidências e o contexto operacional observado durante a inspeção.</p>
      </div>
    </div>

    <label class="field-stack">
      <span class="field-label">Descreva observações relevantes identificadas durante a inspeção</span>
      <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_OBSERVACAO.</span>
      <textarea v-model="form.txObservacao" class="textarea" :class="{ 'is-invalid': errors.txObservacao }" rows="7" placeholder="Detalhe condições do local, indícios, risco ambiental, acionamentos e recomendações." :disabled="loading" />
      <small v-if="errors.txObservacao" class="field-error">{{ errors.txObservacao }}</small>
    </label>
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
