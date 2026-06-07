<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 6 de 7</span>
        <h3 class="section-title">Caracterização do Efluente</h3>
        <p class="section-subtitle">Regulamentação ambiental, tipo de atividade, DRA, origem, fonte, destinação e riscos.</p>
      </div>
    </div>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Regulamentação ambiental</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Tipo de atividade listada</span>
          <select v-model="form.txTipoAtividadeListada" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.tiposAtividade" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Atividade não listada (descrição)</span>
          <input v-model="form.txTipoAtividadeNListada" class="input" type="text" placeholder="Descreva se não listada" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de DRA listado</span>
          <select v-model="form.txTipoDraListado" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.tiposDra" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">DRA não listado (descrição)</span>
          <input v-model="form.txTipoDraNListado" class="input" type="text" placeholder="Descreva se não listado" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">ID/Número da DRA</span>
          <input v-model="form.txIdDra" class="input" type="text" placeholder="Ex.: DRA-2024-0015" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Validade da DRA</span>
          <input v-model="form.dtValidadeDra" class="input" type="date" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Análise CPTM / aprovação</span>
          <select v-model="form.txAnaliseCptmAprovacao" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.simNao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de atividade CPTM</span>
          <select v-model="form.txTipoAtividadeCptm" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.tiposAtivCptm" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Local da atividade</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Local da atividade</span>
          <select v-model="form.txNmLocalAtiv" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.locaisAtividade" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Complemento do local</span>
          <input v-model="form.txNmLocalAtivComplemento" class="input" type="text" placeholder="Informação adicional do local" :disabled="loading" />
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Caracterização do efluente</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Origem do efluente</span>
          <select v-model="form.txOrigemEfluente" class="select" :class="{ 'is-invalid': errors.txOrigemEfluente }" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.origensEfluente" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <small v-if="errors.txOrigemEfluente" class="field-error">{{ errors.txOrigemEfluente }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Fonte geradora</span>
          <select v-model="form.txFonteGeradora" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.fontesGeradoras" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Quantidade (L)</span>
          <input v-model.number="form.nrQuantidadeL" class="input" :class="{ 'is-invalid': errors.nrQuantidadeL }" type="number" min="0" step="0.001" inputmode="decimal" placeholder="Volume em litros" :disabled="loading" />
          <small v-if="errors.nrQuantidadeL" class="field-error">{{ errors.nrQuantidadeL }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de destinação</span>
          <select v-model="form.txTipoDestinacao" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.tiposDestinacao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de veículo</span>
          <select v-model="form.txTipoVeiculo" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.tiposVeiculo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Placa / ID do veículo</span>
          <input v-model="form.txIdVeiculo" class="input" type="text" placeholder="Ex.: ABC-1234" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Guia de remessa</span>
          <input v-model="form.txIdGuiaRemessa" class="input" type="text" placeholder="Número da guia de remessa" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Distância da via (m)</span>
          <input v-model.number="form.nrDistanciaDaViaM" class="input" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Distância em metros" :disabled="loading" />
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">Riscos e responsabilidade</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Oferece risco ao sistema CPTM?</span>
          <select v-model="form.txOfereceRiscoSistemaCptm" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.simNao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Proprietário</span>
          <select v-model="form.txProprietario" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.proprietarios" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack field-stack--full">
          <span class="field-label">Observações do cadastramento</span>
          <textarea v-model="form.txObsCadastramento" class="textarea" rows="4" maxlength="2000" placeholder="Descreva o contexto operacional, risco e evidências." :disabled="loading" />
          <small class="field-help">{{ (form.txObsCadastramento || '').length }} / 2000 caracteres</small>
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
