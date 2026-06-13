<template>
  <section class="wizard-step card">
    <div class="wizard-step-head">
      <div>
        <span class="eyebrow">Passo 8 de 8</span>
        <h3 class="section-title">Revisão do Cadastro</h3>
        <p class="section-subtitle">Confira todos os dados antes de salvar. Volte a qualquer passo para corrigir.</p>
      </div>
    </div>

    <div class="review-sections">

      <!-- PASSO 1: PREMISSAS -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">1</span>
          Premissas Contratuais
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Empresa contratada (PJ)</dt><dd>{{ val(form.txNomePjDaContratada) }}</dd></div>
          <div class="review-row"><dt>Nº contrato (contratada)</dt><dd>{{ val(form.txNrContratoContratada) }}</dd></div>
          <div class="review-row"><dt>Local do escopo contratual</dt><dd>{{ val(form.txNmLocalEscopoContratual) }}</dd></div>
          <div class="review-row"><dt>Representante (PF)</dt><dd>{{ val(form.txNomePfDaRepresentante) }}</dd></div>
          <div class="review-row"><dt>Sigla depto. meio ambiente</dt><dd>{{ val(form.txSiglaDeptomMeioAmbiente) }}</dd></div>
          <div class="review-row"><dt>Área gestora CPTM</dt><dd>{{ val(form.txNmAreaGestoraCptm) }}</dd></div>
          <div class="review-row"><dt>ID área gestora</dt><dd>{{ val(form.txIdAreaGestoraCptm) }}</dd></div>
          <div class="review-row"><dt>Sigla área gestora</dt><dd>{{ val(form.txSiglaAreaGestoraCptm) }}</dd></div>
          <div class="review-row"><dt>Empresa supervisora (PJ)</dt><dd>{{ val(form.txNomePjDaSupervisora) }}</dd></div>
          <div class="review-row"><dt>Nº contrato (supervisora)</dt><dd>{{ val(form.txNrContratoSupervisora) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 2: CADASTRADOR -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">2</span>
          Cadastrador e RT
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>PJ autor do cadastro</dt><dd>{{ val(form.txAutorPjDoCadastro) }}</dd></div>
          <div class="review-row"><dt>PF autor do cadastro</dt><dd>{{ val(form.txAutorPfDoCadastro) }}</dd></div>
          <div class="review-row"><dt>Nome responsável técnico</dt><dd>{{ val(form.txNmResponsavelCadastro) }}</dd></div>
          <div class="review-row"><dt>Registro profissional (RP)</dt><dd>{{ val(form.txRpResponsavelCadastro) }}</dd></div>
          <div class="review-row"><dt>Doc. de Responsabilidade Técnica (DRT)</dt><dd>{{ val(form.txDrtResponsavelCadastro) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 3: FORMULÁRIO -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">3</span>
          Formulário PGA
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Natureza do PGA</dt><dd>{{ val(form.txNaturezaDoPga) }}</dd></div>
          <div class="review-row"><dt>Tipo de formulário</dt><dd>{{ val(form.txTipoDeFormulario) }}</dd></div>
          <div class="review-row"><dt>Data de emissão</dt><dd>{{ valDate(form.dtDataEmissaoFormulario) }}</dd></div>
          <div class="review-row"><dt>Número do formulário</dt><dd>{{ valNum(form.nrNumeroDeFormulario) }}</dd></div>
          <div class="review-row"><dt>Autor PF do formulário</dt><dd>{{ val(form.txAutorPfDoFormulario) }}</dd></div>
          <div class="review-row"><dt>PJ executora</dt><dd>{{ val(form.txNomePjExecutora) }}</dd></div>
          <div class="review-row"><dt>Arquivo FDC relacionado</dt><dd>{{ val(form.txNmArquivoFdcRelacionado) }}</dd></div>
          <div class="review-row"><dt>Código FDC</dt><dd>{{ val(form.pkCdArquivoFdcRelacionado) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 4: DATA / EM -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">4</span>
          Data, Hora e Elemento de Monitoramento
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Código do registro (PK)</dt><dd>{{ val(form.pkCdMeioAmbienteCptm) }}</dd></div>
          <div class="review-row"><dt>Data do cadastro</dt><dd>{{ valDate(form.dtDataDoCadastramento) }}</dd></div>
          <div class="review-row"><dt>Hora do cadastro</dt><dd>{{ val(form.hrHorasDoCadastramento) }}</dd></div>
          <div class="review-row"><dt>Status do desvio ambiental</dt><dd>{{ val(form.txStatusDoDesvioAmbiental) }}</dd></div>
          <div class="review-row"><dt>Status do registro no BD</dt><dd>{{ val(form.txStatusDoRegistroNoBd) }}</dd></div>
          <div class="review-row"><dt>Número do EM</dt><dd>{{ val(form.txNrElementoMonitoramento) }}</dd></div>
          <div class="review-row"><dt>Nome do EM</dt><dd>{{ val(form.txNmElementoMonitoramento) }}</dd></div>
          <div class="review-row"><dt>Código último RRA</dt><dd>{{ val(form.pkCdCodigoNoUltimoRra) }}</dd></div>
          <div class="review-row"><dt>Código CEDOC</dt><dd>{{ val(form.pkCdCedoc) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 5: LOCALIZAÇÃO -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">5</span>
          Localização
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Município</dt><dd>{{ val(form.txMunicipio) }}</dd></div>
          <div class="review-row"><dt>Linha CPTM</dt><dd>{{ val(form.txLinhaCptm) }}</dd></div>
          <div class="review-row"><dt>Estação CPTM</dt><dd>{{ val(form.txEstacaoCptm) }}</dd></div>
          <div class="review-row"><dt>Via CPTM</dt><dd>{{ val(form.txViaCptm) }}</dd></div>
          <div class="review-row"><dt>Trecho / Sentido</dt><dd>{{ val(form.txTrechoESentidoCptm) }}</dd></div>
          <div class="review-row"><dt>KM / Poste</dt><dd>{{ val(form.txKmPoste) }}</dd></div>
          <div class="review-row"><dt>Latitude WGS84</dt><dd>{{ valCoord(form.nrLatGrauDecimalWgs84) }}</dd></div>
          <div class="review-row"><dt>Longitude WGS84</dt><dd>{{ valCoord(form.nrLongGrauDecimalWgs84) }}</dd></div>
          <div class="review-row"><dt>Latitude SIRGAS2000 (m)</dt><dd>{{ valCoord(form.nrLatMetrosSirgas2000) }}</dd></div>
          <div class="review-row"><dt>Longitude SIRGAS2000 (m)</dt><dd>{{ valCoord(form.nrLongMetrosSirgas2000) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 6: CARACTERIZAÇÃO -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">6</span>
          Caracterização do Efluente
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Tipo de atividade listada</dt><dd>{{ val(form.txTipoAtividadeListada) }}</dd></div>
          <div class="review-row"><dt>Atividade não listada</dt><dd>{{ val(form.txTipoAtividadeNListada) }}</dd></div>
          <div class="review-row"><dt>Tipo de DRA listado</dt><dd>{{ val(form.txTipoDraListado) }}</dd></div>
          <div class="review-row"><dt>DRA não listado</dt><dd>{{ val(form.txTipoDraNListado) }}</dd></div>
          <div class="review-row"><dt>ID / Número da DRA</dt><dd>{{ val(form.txIdDra) }}</dd></div>
          <div class="review-row"><dt>Validade da DRA</dt><dd>{{ valDate(form.dtValidadeDra) }}</dd></div>
          <div class="review-row"><dt>Análise CPTM / aprovação</dt><dd>{{ val(form.txAnaliseCptmAprovacao) }}</dd></div>
          <div class="review-row"><dt>Tipo de atividade CPTM</dt><dd>{{ val(form.txTipoAtividadeCptm) }}</dd></div>
          <div class="review-row"><dt>Local da atividade</dt><dd>{{ val(form.txNmLocalAtiv) }}</dd></div>
          <div class="review-row"><dt>Complemento do local</dt><dd>{{ val(form.txNmLocalAtivComplemento) }}</dd></div>
          <div class="review-row"><dt>Origem do efluente</dt><dd>{{ val(form.txOrigemEfluente) }}</dd></div>
          <div class="review-row"><dt>Fonte geradora</dt><dd>{{ val(form.txFonteGeradora) }}</dd></div>
          <div class="review-row"><dt>Quantidade (L)</dt><dd>{{ valNum(form.nrQuantidadeL) }}</dd></div>
          <div class="review-row"><dt>Tipo de destinação</dt><dd>{{ val(form.txTipoDestinacao) }}</dd></div>
          <div class="review-row"><dt>Tipo de veículo</dt><dd>{{ val(form.txTipoVeiculo) }}</dd></div>
          <div class="review-row"><dt>Placa / ID do veículo</dt><dd>{{ val(form.txIdVeiculo) }}</dd></div>
          <div class="review-row"><dt>Guia de remessa</dt><dd>{{ val(form.txIdGuiaRemessa) }}</dd></div>
          <div class="review-row"><dt>Distância da via (m)</dt><dd>{{ valNum(form.nrDistanciaDaViaM) }}</dd></div>
          <div class="review-row"><dt>Oferece risco ao sistema CPTM?</dt><dd>{{ val(form.txOfereceRiscoSistemaCptm) }}</dd></div>
          <div class="review-row"><dt>Proprietário</dt><dd>{{ val(form.txProprietario) }}</dd></div>
          <div class="review-row review-row--full"><dt>Observações</dt><dd class="review-obs">{{ val(form.txObsCadastramento) }}</dd></div>
        </dl>
      </div>

      <!-- PASSO 7: FOTOS -->
      <div class="review-section">
        <h4 class="review-section-title">
          <span class="review-step-badge">7</span>
          Registro Fotográfico
        </h4>
        <dl class="review-grid">
          <div class="review-row"><dt>Foto 1</dt><dd>{{ valFoto(form.txNomeFoto01, files, 0) }}</dd></div>
          <div class="review-row"><dt>Foto 2</dt><dd>{{ valFoto(form.txNomeFoto02, files, 1) }}</dd></div>
          <div class="review-row"><dt>Foto 3</dt><dd>{{ valFoto(form.txNomeFoto03, files, 2) }}</dd></div>
          <div class="review-row"><dt>Foto 4</dt><dd>{{ valFoto(form.txNomeFoto04, files, 3) }}</dd></div>
        </dl>
      </div>

    </div>

    <div class="helper-box helper-box--compact review-confirm-box">
      <div>
        <strong>Tudo certo?</strong>
        <p>Clique em <strong>Enviar inspeção</strong> para registrar. As fotos serão enviadas junto com o formulário.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  form: { type: Object, default: () => ({}) },
  files: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function val(v) {
  if (v === null || v === undefined || String(v).trim() === '') return '—'
  return String(v)
}

function valNum(v) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function valDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleDateString('pt-BR')
  } catch {
    return String(v)
  }
}

function valCoord(v) {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(6) : String(v)
}

function valFoto(name, files, index) {
  if (files && files[index]) return files[index].name
  if (name && name.trim() !== '') return name
  return '—'
}
</script>

<style scoped>
.review-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-section {
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 0.5rem;
  overflow: hidden;
}

.review-section-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.625rem 1rem;
  margin: 0;
  background: var(--color-surface-raised, #f8fafc);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text, #1e293b);
}

.review-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: var(--color-primary, #2563eb);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0;
  padding: 0.25rem 0;
}

.review-row {
  display: contents;
}

.review-row dt,
.review-row dd {
  padding: 0.4rem 1rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border-subtle, #f1f5f9);
  margin: 0;
}

.review-row dt {
  color: var(--color-text-muted, #64748b);
  font-weight: 500;
}

.review-row dd {
  color: var(--color-text, #1e293b);
  font-weight: 400;
  word-break: break-word;
}

.review-row--full {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.review-row--full dt,
.review-row--full dd {
  display: block;
}

.review-obs {
  white-space: pre-wrap;
}

.review-confirm-box {
  margin-top: 1rem;
}

@media (max-width: 600px) {
  .review-grid {
    grid-template-columns: 1fr;
  }

  .review-row--full {
    grid-template-columns: 1fr;
  }
}
</style>
