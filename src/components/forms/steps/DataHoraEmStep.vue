<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 4 de 7</span>
        <h3 class="section-title">Data, Hora e Elemento de Monitoramento</h3>
        <p class="section-subtitle">Código do registro, data e hora do cadastro, status e referência ao elemento monitorado.</p>
      </div>
    </div>

    <div class="wizard-grid wizard-grid--2">
      <label class="field-stack">
        <span class="field-label">Código do registro (PK)</span>
        <input v-model="form.pkCdMeioAmbienteCptm" class="input" :class="{ 'is-invalid': errors.pkCdMeioAmbienteCptm }" type="text" placeholder="Ex.: EF-2024-0001" :disabled="loading" />
        <small v-if="errors.pkCdMeioAmbienteCptm" class="field-error">{{ errors.pkCdMeioAmbienteCptm }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Data do cadastro</span>
        <input v-model="form.dtDataDoCadastramento" class="input" :class="{ 'is-invalid': errors.dtDataDoCadastramento }" type="date" :disabled="loading" />
        <small v-if="errors.dtDataDoCadastramento" class="field-error">{{ errors.dtDataDoCadastramento }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Hora do cadastro (HH:MM)</span>
        <input v-model="form.hrHorasDoCadastramento" class="input" type="time" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Status do desvio ambiental</span>
        <select v-model="form.txStatusDoDesvioAmbiental" class="select" :class="{ 'is-invalid': errors.txStatusDoDesvioAmbiental }" :disabled="loading">
          <option value="">Selecione o status</option>
          <option v-for="opt in domains.statusDesvio" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <small v-if="errors.txStatusDoDesvioAmbiental" class="field-error">{{ errors.txStatusDoDesvioAmbiental }}</small>
      </label>

      <label class="field-stack">
        <span class="field-label">Status do registro no BD</span>
        <select v-model="form.txStatusDoRegistroNoBd" class="select" :disabled="loading">
          <option value="">Selecione o status</option>
          <option v-for="opt in domains.statusRegistro" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>

      <label class="field-stack">
        <span class="field-label">Número do EM (elemento monitorado)</span>
        <input v-model="form.txNrElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNrElementoMonitoramento }" type="text" placeholder="Ex.: EM-0042" :disabled="loading" />
        <small v-if="errors.txNrElementoMonitoramento" class="field-error">{{ errors.txNrElementoMonitoramento }}</small>
      </label>

      <label class="field-stack field-stack--full">
        <span class="field-label">Nome do EM (elemento monitorado)</span>
        <input v-model="form.txNmElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNmElementoMonitoramento }" type="text" placeholder="Descrição do elemento monitorado" :disabled="loading" />
        <small v-if="errors.txNmElementoMonitoramento" class="field-error">{{ errors.txNmElementoMonitoramento }}</small>
      </label>
    </div>

    <div class="wizard-grid wizard-grid--2 mt-2">
      <label class="field-stack">
        <span class="field-label">Código no último RRA</span>
        <input v-model="form.pkCdCodigoNoUltimoRra" class="input" type="text" placeholder="Código RRA vinculado" :disabled="loading" />
      </label>

      <label class="field-stack">
        <span class="field-label">Código CEDOC</span>
        <input v-model="form.pkCdCedoc" class="input" type="text" placeholder="Código CEDOC" :disabled="loading" />
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
