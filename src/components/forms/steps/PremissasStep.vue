<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 1 de 8</span>
        <h3 class="section-title">Premissas Institucionais</h3>
        <p class="section-subtitle">Empresa contratada, supervisora, área gestora e representante responsável pelo escopo contratual.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Nome (PJ) da Contratada</span>
        <small class="field-help">Inserir o nome e sigla da Contratada, separados por " - ". A sigla pode ter até 10 caracteres.</small>
        <input v-model="form.txNomePjDaContratada" class="input" :class="{ 'is-invalid': errors.txNomePjDaContratada }" type="text" placeholder="Ex.: Companhia Paulista de Trens Metropolitanos - CPTM" :disabled="loading" />
        <small v-if="errors.txNomePjDaContratada" class="field-error">{{ errors.txNomePjDaContratada }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nº do Contrato (da Contratada)</span>
        <small class="field-help">Inserir o identificador do contrato da Contratada, se aplicável. Máximo 12 caracteres, sem espaços.</small>
        <input v-model="form.txNrContratoContratada" class="input" :class="{ 'is-invalid': errors.txNrContratoContratada }" type="text" placeholder="Ex.: AR01234-56" :disabled="loading" />
        <small v-if="errors.txNrContratoContratada" class="field-error">{{ errors.txNrContratoContratada }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Local do Escopo Contratual (Pseudônimo)</span>
        <small class="field-help">Indicar um nome genérico (pseudônimo) para o local do escopo contratual ou área/trecho da CPTM.</small>
        <input v-model="form.txNmLocalEscopoContratual" class="input" type="text" placeholder="Ex.: Pátio Capuava" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Representante (PF) da Contratada e/ou Área Gestora da CPTM</span>
        <small class="field-help">Inserir o nome do responsável interlocutor da Contratada e/ou da Área Gestora da CPTM para assuntos de meio ambiente.</small>
        <input v-model="form.txNomePfDaRepresentante" class="input" type="text" placeholder="Ex.: Pessoa 1 / Pessoa 2" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Sigla da Área de Meio Ambiente</span>
        <small class="field-help">Escolher a sigla do departamento interlocutor da Gerência de Meio Ambiente - GEA.</small>
        <select v-model="form.txSiglaDeptomMeioAmbiente" class="select" :class="{ 'is-invalid': errors.txSiglaDeptomMeioAmbiente }" :disabled="loading">
          <option value="">Selecione a sigla do departamento</option>
          <option v-for="opt in domains.departamentos" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txSiglaDeptomMeioAmbiente" class="field-error">{{ errors.txSiglaDeptomMeioAmbiente }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Nome da Área Gestora CPTM</span>
        <small class="field-help">Escolher a área gestora da CPTM responsável pelo contrato, se aplicável.</small>
        <select v-model="form.txNmAreaGestoraCptm" class="select" :disabled="loading">
          <option value="">Selecione a área gestora</option>
          <option v-for="opt in domains.areasGestoras" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <!-- Campos automáticos - visível: não (Excel: ID 55 e 56) -->
      <input type="hidden" v-model="form.txIdAreaGestoraCptm" />
      <input type="hidden" v-model="form.txSiglaAreaGestoraCptm" />

      <label class="field-stack field-stack--full">
        <span class="field-label">Nome (PJ) da Supervisora Ambiental</span>
        <small class="field-help">Inserir o nome e sigla da Supervisora Ambiental. Quando for a própria CPTM, repetir a gerência e departamento ambiental informados anteriormente.</small>
        <input v-model="form.txNomePjDaSupervisora" class="input" type="text" placeholder="Ex.: Empresa de Supervisão Ambiental Ltda. - ESA" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Nº do Contrato (da Supervisora)</span>
        <small class="field-help">Inserir o identificador do contrato da Supervisora Ambiental, se aplicável.</small>
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
