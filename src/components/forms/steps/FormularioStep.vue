<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 3 de 7</span>
        <h3 class="section-title">Formulário PGA</h3>
        <p class="section-subtitle">Natureza do PGA, tipo de formulário, data de emissão, número e autor.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Natureza do PGA</span>
        <select v-model="form.txNaturezaDoPga" class="select" :class="{ 'is-invalid': errors.txNaturezaDoPga }" :disabled="loading">
          <option value="">Selecione a natureza</option>
          <option v-for="opt in domains.naturezasPga" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txNaturezaDoPga" class="field-error">{{ errors.txNaturezaDoPga }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Tipo de formulário</span>
        <input v-model="form.txTipoDeFormulario" class="input" type="text" placeholder="Ex.: Formulário de Inspeção" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Data de emissão do formulário</span>
        <input v-model="form.dtDataEmissaoFormulario" class="input" type="date" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Número do formulário</span>
        <input v-model.number="form.nrNumeroDeFormulario" class="input" type="number" min="0" placeholder="Ex.: 42" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Autor PF do formulário</span>
        <input v-model="form.txAutorPfDoFormulario" class="input" type="text" placeholder="Nome do autor do formulário" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">PJ executora</span>
        <input v-model="form.txNomePjExecutora" class="input" type="text" placeholder="Empresa executora do formulário" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Nome do arquivo FDC relacionado</span>
        <input v-model="form.txNmArquivoFdcRelacionado" class="input" type="text" placeholder="Preenchido automaticamente" readonly :disabled="loading" />
        <small class="field-help">Campo somente leitura — vinculado automaticamente ao FDC.</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Código do arquivo FDC</span>
        <input v-model="form.pkCdArquivoFdcRelacionado" class="input" type="text" placeholder="Preenchido automaticamente" readonly :disabled="loading" />
        <small class="field-help">Campo somente leitura — código interno CEDOC do FDC.</small>
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
