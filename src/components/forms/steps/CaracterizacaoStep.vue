<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 6 de 8</span>
        <h3 class="section-title">Caracterização do Elemento de Monitoramento</h3>
        <p class="section-subtitle">Regulamentação ambiental, tipo de atividade, DRA, detalhamento operacional, efluente e observações.</p>
      </div>
    </div>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">7.1 Regulamentação Ambiental</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Tipo de Atividade (Listada)</span>
          <small class="field-help">Selecionar o tipo de atividade relacionada ao elemento de monitoramento.</small>
          <select v-model="form.txTipoAtividadeListada" class="select" :disabled="loading">
            <option value="">Selecione o tipo de atividade</option>
            <option v-for="opt in domains.tiposAtividade" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de Atividade (Não Listada)</span>
          <small class="field-help">Inserir o tipo de atividade não listada quando "Tipo de Atividade (Listada)" for "Outro(a)(s)".</small>
          <input v-model="form.txTipoAtividadeNListada" class="input" type="text" placeholder="Descrever a atividade não listada" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de DRA (Listado)</span>
          <small class="field-help">Selecionar o tipo de Documento de Regularidade Ambiental relacionado ao elemento de monitoramento.</small>
          <select v-model="form.txTipoDraListado" class="select" :disabled="loading">
            <option value="">Selecione o tipo de DRA</option>
            <option v-for="opt in domains.tiposDra" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de DRA (Não Listado)</span>
          <small class="field-help">Inserir o tipo de DRA não listado quando "Tipo de DRA (Listado)" for "Outro(a)(s)".</small>
          <input v-model="form.txTipoDraNListado" class="input" type="text" placeholder="Descrever o DRA não listado" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Código Identificador do DRA</span>
          <small class="field-help">Inserir o código identificador do Documento de Regularidade Ambiental.</small>
          <input v-model="form.txIdDra" class="input" type="text" placeholder="Ex.: DRF nº 123.456" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Data de Validade do DRA</span>
          <small class="field-help">Inserir a data de validade do DRA. Padrão: dd/mm/aaaa</small>
          <input v-model="form.dtValidadeDra" class="input" type="date" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Análise CPTM para Aprovação</span>
          <small class="field-help">Indica a análise da CPTM para aprovação do documento de regularidade ambiental.</small>
          <select v-model="form.txAnaliseCptmAprovacao" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.simNao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset class="wizard-fieldset">
      <legend class="wizard-legend">7.2 Detalhamento</legend>
      <div class="wizard-grid wizard-grid--2">
        <label class="field-stack">
          <span class="field-label">Tipo de Atividade na CPTM</span>
          <small class="field-help">Selecionar o tipo de atividade desenvolvida na CPTM.</small>
          <select v-model="form.txTipoAtividadeCptm" class="select" :disabled="loading">
            <option value="">Selecione o tipo de atividade</option>
            <option v-for="opt in domains.tiposAtivCptm" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Nome Edificação/Local da CPTM</span>
          <small class="field-help">Selecionar o nome da edificação ou local da CPTM onde ocorre a atividade.</small>
          <select v-model="form.txNmLocalAtiv" class="select" :disabled="loading">
            <option value="">Selecione o local</option>
            <option v-for="opt in domains.locaisAtividade" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack field-stack--full">
          <span class="field-label">Nome Edificação/Local (Complemento)</span>
          <small class="field-help">Inserir o complemento do nome da edificação/local na CPTM. Ex.: "Brás" para Estação Brás.</small>
          <input v-model="form.txNmLocalAtivComplemento" class="input" type="text" placeholder="Ex.: Brás" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Origem do Efluente</span>
          <small class="field-help">Selecionar a origem do efluente gerado.</small>
          <select v-model="form.txOrigemEfluente" class="select" :class="{ 'is-invalid': errors.txOrigemEfluente }" :disabled="loading">
            <option value="">Selecione a origem</option>
            <option v-for="opt in domains.origensEfluente" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <small v-if="errors.txOrigemEfluente" class="field-error">{{ errors.txOrigemEfluente }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Fonte Geradora do Efluente</span>
          <small class="field-help">Selecionar a fonte geradora do efluente.</small>
          <select v-model="form.txFonteGeradora" class="select" :disabled="loading">
            <option value="">Selecione a fonte geradora</option>
            <option v-for="opt in domains.fontesGeradoras" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Quantidade (Litros)</span>
          <small class="field-help">Inserir a quantidade em litros de efluente. Número com até 8 casas decimais.</small>
          <input v-model.number="form.nrQuantidadeL" class="input" :class="{ 'is-invalid': errors.nrQuantidadeL }" type="number" min="0" step="0.00000001" inputmode="decimal" placeholder="Ex.: 9,25" :disabled="loading" />
          <small v-if="errors.nrQuantidadeL" class="field-error">{{ errors.nrQuantidadeL }}</small>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de Destinação do Efluente</span>
          <small class="field-help">Selecionar o tipo de destinação do efluente gerado.</small>
          <select v-model="form.txTipoDestinacao" class="select" :disabled="loading">
            <option value="">Selecione o tipo de destinação</option>
            <option v-for="opt in domains.tiposDestinacao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Tipo de Veículo</span>
          <small class="field-help">Selecionar o tipo de veículo transportador do efluente.</small>
          <select v-model="form.txTipoVeiculo" class="select" :disabled="loading">
            <option value="">Selecione o tipo de veículo</option>
            <option v-for="opt in domains.tiposVeiculo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Identificador/Placa do Veículo</span>
          <small class="field-help">Inserir o identificador ou placa do veículo transportador do efluente.</small>
          <input v-model="form.txIdVeiculo" class="input" type="text" placeholder="Ex.: WAD 105D" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Código Identificador da Guia de Remessa</span>
          <small class="field-help">Inserir o código identificador da guia de remessa do efluente.</small>
          <input v-model="form.txIdGuiaRemessa" class="input" type="text" placeholder="Ex.: ID nº 10.456" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Distância da Via CPTM (Metros)</span>
          <small class="field-help">Inserir a distância em metros da via CPTM mais próxima em relação ao efluente. Padrão: "... ,00"</small>
          <input v-model.number="form.nrDistanciaDaViaM" class="input" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Ex.: 7,58" :disabled="loading" />
        </label>

        <label class="field-stack">
          <span class="field-label">Oferece Risco aos Sistemas da CPTM?</span>
          <small class="field-help">Indicação da possibilidade de risco aos Sistemas da CPTM, como a operação ferroviária.</small>
          <select v-model="form.txOfereceRiscoSistemaCptm" class="select" :disabled="loading">
            <option value="">Selecione</option>
            <option v-for="opt in domains.simNao" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack">
          <span class="field-label">Domínio Territorial (Proprietário)</span>
          <small class="field-help">Indica o domínio territorial no qual está localizado o efluente.</small>
          <select v-model="form.txProprietario" class="select" :disabled="loading">
            <option value="">Selecione o proprietário</option>
            <option v-for="opt in domains.proprietarios" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field-stack field-stack--full">
          <span class="field-label">Observações Gerais: Cadastramento</span>
          <small class="field-help">Inserir observações relevantes relativas ao cadastramento/caracterização, se necessário. Máximo 2000 caracteres.</small>
          <textarea v-model="form.txObsCadastramento" class="textarea" rows="4" maxlength="2000" placeholder="Descreva o contexto operacional, risco e evidências relevantes." :disabled="loading" />
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
