<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 2 de 7</span>
        <h3 class="section-title">Cadastrador / Responsável Técnico</h3>
        <p class="section-subtitle">Identificação do autor do cadastro, registro profissional e DRT.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">PJ do cadastro</span>
        <input v-model="form.txAutorPjDoCadastro" class="input" type="text" placeholder="Empresa autora do cadastro" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">PF do cadastro</span>
        <input v-model="form.txAutorPfDoCadastro" class="input" :class="{ 'is-invalid': errors.txAutorPfDoCadastro }" type="text" placeholder="Nome do profissional autor" :disabled="loading" />
        <small v-if="errors.txAutorPfDoCadastro" class="field-error">{{ errors.txAutorPfDoCadastro }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nome do responsável pelo cadastro</span>
        <input v-model="form.txNmResponsavelCadastro" class="input" :class="{ 'is-invalid': errors.txNmResponsavelCadastro }" type="text" placeholder="Nome completo" :disabled="loading" />
        <small v-if="errors.txNmResponsavelCadastro" class="field-error">{{ errors.txNmResponsavelCadastro }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">RP (Registro Profissional)</span>
        <input v-model="form.txRpResponsavelCadastro" class="input" type="text" placeholder="Número do RP" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">DRT (Delegacia Regional do Trabalho)</span>
        <input v-model="form.txDrtResponsavelCadastro" class="input" type="text" placeholder="Ex.: DRT-SP" :disabled="loading" />
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps({
  form: { type: Object, default: () => ({}) },
  domains: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})
</script>
