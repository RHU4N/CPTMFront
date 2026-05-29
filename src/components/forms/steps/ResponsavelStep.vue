<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Step 5</span>
        <h3 class="section-title">Responsável Técnico</h3>
        <p class="section-subtitle">Define o técnico e o departamento ambiental responsáveis pelo registro.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Nome do técnico responsável</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_NOME_TECNICO_RESPONSAVEL.</span>
        <input v-model="form.txNomeTecnicoResponsavel" class="input" :class="{ 'is-invalid': errors.txNomeTecnicoResponsavel }" type="text" placeholder="Ex.: Maria Souza" :disabled="loading" />
        <small v-if="errors.txNomeTecnicoResponsavel" class="field-error">{{ errors.txNomeTecnicoResponsavel }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">E-mail do responsável</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_EMAIL_TECNICO_RESPONSAVEL.</span>
        <input v-model="form.txEmailTecnicoResponsavel" class="input" :class="{ 'is-invalid': errors.txEmailTecnicoResponsavel }" type="email" placeholder="tecnico@cptm.sp.gov.br" :disabled="loading" />
        <small v-if="errors.txEmailTecnicoResponsavel" class="field-error">{{ errors.txEmailTecnicoResponsavel }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Telefone do responsável</span>
        <span class="field-help">Destino Oracle: PT_EFLUENTE.TX_TELEFONE_TECNICO_RESPONSAVEL.</span>
        <input v-model="form.txTelefoneTecnicoResponsavel" class="input" :class="{ 'is-invalid': errors.txTelefoneTecnicoResponsavel }" type="tel" placeholder="(11) 99999-9999" :disabled="loading" />
        <small v-if="errors.txTelefoneTecnicoResponsavel" class="field-error">{{ errors.txTelefoneTecnicoResponsavel }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Departamento responsável</span>
        <span class="field-help">Origem: API domínio departamentos. Destino Oracle: PT_EFLUENTE.ID_DEPTO_MEIO_AMBIENTE.</span>
        <select v-model="form.idDeptoCampoAmbiente" class="select" :class="{ 'is-invalid': errors.idDeptoCampoAmbiente }" :disabled="loading">
          <option :value="null">Selecione o departamento</option>
          <option v-for="option in domains.departamentos" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <small v-if="errors.idDeptoCampoAmbiente" class="field-error">{{ errors.idDeptoCampoAmbiente }}</small>
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
    default: () => ({ departamentos: [] }),
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
