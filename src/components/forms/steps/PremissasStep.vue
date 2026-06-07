<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 1 de 7</span>
        <h3 class="section-title">Premissas Contratuais</h3>
        <p class="section-subtitle">Empresa contratada, supervisora, área gestora e representante responsável pelo escopo.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Empresa contratada (PJ)</span>
        <input v-model="form.txNomePjDaContratada" class="input" :class="{ 'is-invalid': errors.txNomePjDaContratada }" type="text" placeholder="Nome da empresa contratada" :disabled="loading" />
        <small v-if="errors.txNomePjDaContratada" class="field-error">{{ errors.txNomePjDaContratada }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Número do contrato (contratada)</span>
        <input v-model="form.txNrContratoContratada" class="input" :class="{ 'is-invalid': errors.txNrContratoContratada }" type="text" placeholder="Ex.: CT-2024-0042" :disabled="loading" />
        <small v-if="errors.txNrContratoContratada" class="field-error">{{ errors.txNrContratoContratada }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Local do escopo contratual</span>
        <input v-model="form.txNmLocalEscopoContratual" class="input" type="text" placeholder="Ex.: Pátio Lapa" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Representante (PF)</span>
        <input v-model="form.txNomePfDaRepresentante" class="input" type="text" placeholder="Nome completo do representante" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Sigla do depto. de meio ambiente</span>
        <select v-model="form.txSiglaDeptomMeioAmbiente" class="select" :class="{ 'is-invalid': errors.txSiglaDeptomMeioAmbiente }" :disabled="loading">
          <option value="">Selecione a sigla</option>
          <option v-for="opt in domains.departamentos" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txSiglaDeptomMeioAmbiente" class="field-error">{{ errors.txSiglaDeptomMeioAmbiente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Área gestora CPTM</span>
        <select v-model="form.txNmAreaGestoraCptm" class="select" :disabled="loading">
          <option value="">Selecione a área gestora</option>
          <option v-for="opt in domains.areasGestoras" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="field-stack">
        <span class="field-label">ID da área gestora CPTM</span>
        <input v-model="form.txIdAreaGestoraCptm" class="input" type="text" placeholder="ID da área gestora" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Sigla da área gestora CPTM</span>
        <input v-model="form.txSiglaAreaGestoraCptm" class="input" type="text" placeholder="Ex.: GEA.DEAE" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Empresa supervisora (PJ)</span>
        <input v-model="form.txNomePjDaSupervisora" class="input" type="text" placeholder="Nome da empresa supervisora" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Número do contrato (supervisora)</span>
        <input v-model="form.txNrContratoSupervisora" class="input" type="text" placeholder="Ex.: CT-2024-0099" :disabled="loading" />
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
