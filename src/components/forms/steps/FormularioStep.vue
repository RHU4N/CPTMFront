<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 3 de 8</span>
        <h3 class="section-title">Identificação do Formulário</h3>
        <p class="section-subtitle">Natureza do PGA, tipo de formulário, data de emissão, número e autor.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Natureza (do PGA)</span>
        <small class="field-help">Escolher a Natureza correspondente ao Programa de Gestão Ambiental.</small>
        <select v-model="form.txNaturezaDoPga" class="select" :class="{ 'is-invalid': errors.txNaturezaDoPga }" :disabled="loading">
          <option value="">Selecione a natureza do PGA</option>
          <option v-for="opt in domains.naturezasPga" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txNaturezaDoPga" class="field-error">{{ errors.txNaturezaDoPga }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Tipo de Formulário</span>
        <small class="field-help">Campo automático — preenchido conforme o tipo de formulário de cadastramento.</small>
        <input v-model="form.txTipoDeFormulario" class="input" type="text" readonly :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Data de Emissão do Formulário</span>
        <small class="field-help">Inserir a data de emissão do documento. Padrão: dd/mm/aaaa</small>
        <input v-model="form.dtDataEmissaoFormulario" class="input" type="date" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Número do Formulário</span>
        <small class="field-help">Inserir o número de identificação do formulário. Escolher de 1 a 999.999, sequencial e único com seis dígitos.</small>
        <input v-model.number="form.nrNumeroDeFormulario" class="input" type="number" min="1" max="999999" placeholder="Ex.: 1 (exibição: Nº 000001)" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Autor(a) (PF) do Formulário</span>
        <small class="field-help">Inserir o nome da pessoa física autora/elaboradora do formulário.</small>
        <input v-model="form.txAutorPfDoFormulario" class="input" type="text" placeholder="Ex.: Nome e Sobrenome" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Nome (PJ) Executora</span>
        <small class="field-help">Nome da empresa executora responsável pelo serviço registrado.</small>
        <input v-model="form.txNomePjExecutora" class="input" type="text" placeholder="Ex.: Companhia Paulista de Trens Metropolitanos - CPTM" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Nome do Arquivo FDC Relacionado</span>
        <small class="field-help">Campo automático — vinculado ao nome do arquivo FDC correspondente.</small>
        <input v-model="form.txNmArquivoFdcRelacionado" class="input" type="text" placeholder="Preenchido automaticamente" readonly :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Código do Arquivo FDC Relacionado</span>
        <small class="field-help">Campo automático — chave primária do arquivo FDC no sistema CEDOC.</small>
        <input v-model="form.pkCdArquivoFdcRelacionado" class="input" type="text" placeholder="Preenchido automaticamente" readonly :disabled="loading" />
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
