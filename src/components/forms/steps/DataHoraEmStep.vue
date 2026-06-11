<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 4 de 8</span>
        <h3 class="section-title">Data, Hora e Elemento de Monitoramento</h3>
        <p class="section-subtitle">Data e hora do cadastro, identificação e nome do elemento de monitoramento ambiental.</p>
      </div>
    </div>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Data e hora do cadastro</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Data do Cadastramento</span>
          <small class="field-help">Inserir a data do cadastramento da informação. Padrão: dd/mm/aaaa</small>
          <input v-model="form.dtDataDoCadastramento" class="input" :class="{ 'is-invalid': errors.dtDataDoCadastramento }" type="date" :disabled="loading" />
          <small v-if="errors.dtDataDoCadastramento" class="field-error">{{ errors.dtDataDoCadastramento }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Hora do Cadastramento</span>
          <small class="field-help">Inserir a hora do cadastramento da informação. Padrão: hh:mm</small>
          <input v-model="form.hrHorasDoCadastramento" class="input" type="time" :disabled="loading" />
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Identificação do Elemento de Monitoramento</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack field-stack--full">
          <span class="field-label">Chave Primária - Meio Ambiente</span>
          <small class="field-help">Campo automático — código único do elemento de monitoramento de Meio Ambiente da CPTM.</small>
          <input v-model="form.pkCdMeioAmbienteCptm" class="input" type="text" placeholder="Preenchido automaticamente" readonly :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Elemento de Monitoramento - Número</span>
          <small class="field-help">Inserir o número do elemento monitorado. De 1 a 999.999, sequencial e único com seis dígitos.</small>
          <input v-model="form.txNrElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNrElementoMonitoramento }" type="text" placeholder="Ex.: N.000001" :disabled="loading" />
          <small v-if="errors.txNrElementoMonitoramento" class="field-error">{{ errors.txNrElementoMonitoramento }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Elemento de Monitoramento - Nome</span>
          <small class="field-help">Indicar um nome genérico (pseudônimo) para o elemento de monitoramento. Ex.: "Caçamba A", "Banheiro Químico B".</small>
          <input v-model="form.txNmElementoMonitoramento" class="input" :class="{ 'is-invalid': errors.txNmElementoMonitoramento }" type="text" placeholder="Ex.: Plataforma 1" :disabled="loading" />
          <small v-if="errors.txNmElementoMonitoramento" class="field-error">{{ errors.txNmElementoMonitoramento }}</small>
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Status e referências</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Status do Desvio Ambiental</span>
          <small class="field-help">Indica se o desvio ambiental está regularizado ou não regularizado.</small>
          <select v-model="form.txStatusDoDesvioAmbiental" class="select" :class="{ 'is-invalid': errors.txStatusDoDesvioAmbiental }" :disabled="loading">
            <option value="">Selecione o status do desvio</option>
            <option v-for="opt in domains.statusDesvio" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <small v-if="errors.txStatusDoDesvioAmbiental" class="field-error">{{ errors.txStatusDoDesvioAmbiental }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Status do Registro no Banco de Dados</span>
          <small class="field-help">Indica se o registro no banco de dados permanece ativo ou foi inativado.</small>
          <select v-model="form.txStatusDoRegistroNoBd" class="select" :disabled="loading">
            <option value="">Selecione o status do registro</option>
            <option v-for="opt in domains.statusRegistro" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Chave Primária no Último RRA</span>
          <small class="field-help">Referência ao código do ponto já existente no último Relatório de Rastreamento Ambiental.</small>
          <input v-model="form.pkCdCodigoNoUltimoRra" class="input" type="text" placeholder="Código RRA vinculado" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Chave Primária - Centro de Documentação (CEDOC)</span>
          <small class="field-help">Chave primária do Centro de Documentação da CPTM.</small>
          <input v-model="form.pkCdCedoc" class="input" type="text" placeholder="Código CEDOC" :disabled="loading" />
        </label>
      </div>
    </fieldset>
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
