export function createEmptyEfluente() {
  return {
    // Chave primária
    pkCdMeioAmbienteCptm: '',
    // Elemento de monitoramento
    txNrElementoMonitoramento: '',
    txNmElementoMonitoramento: '',
    // GEA - Seção 1: Premissas
    txSiglaDeptomMeioAmbiente: '',
    txStatusDoDesvioAmbiental: '',
    txStatusDoRegistroNoBd: '',
    // GEA - Localização
    txMunicipio: '',
    txLinhaCptm: '',
    txViaCptm: '',
    txTrechoESentidoCptm: '',
    txKmPoste: '',
    txEstacaoCptm: '',
    // Coordenadas WGS84
    nrLatGrauDecimalWgs84: null,
    nrLongGrauDecimalWgs84: null,
    // Coordenadas SIRGAS2000
    nrLatMetrosSirgas2000: null,
    nrLongMetrosSirgas2000: null,
    // GEA - Premissas contratuais
    txNmLocalEscopoContratual: '',
    // Formulário PGA
    txTipoDeFormulario: '',
    dtDataEmissaoFormulario: null,
    nrNumeroDeFormulario: null,
    txAutorPfDoFormulario: '',
    txNaturezaDoPga: '',
    txNomePjExecutora: '',
    // Atividade - listada e não listada
    txTipoAtividadeListada: '',
    txTipoAtividadeNListada: '',
    txTipoDraListado: '',
    txTipoDraNListado: '',
    txIdDra: '',
    dtValidadeDra: null,
    txAnaliseCptmAprovacao: '',
    // Efluente - Caracterização
    txTipoAtividadeCptm: '',
    txNmLocalAtiv: '',
    txNmLocalAtivComplemento: '',
    txOrigemEfluente: '',
    txFonteGeradora: '',
    nrQuantidadeL: null,
    txTipoDestinacao: '',
    txTipoVeiculo: '',
    txIdVeiculo: '',
    txIdGuiaRemessa: '',
    nrDistanciaDaViaM: null,
    txOfereceRiscoSistemaCptm: '',
    txProprietario: '',
    txObsCadastramento: '',
    // Data e hora do cadastro
    dtDataDoCadastramento: null,
    hrHorasDoCadastramento: '',
    // Cadastrador (PF/PJ)
    txAutorPjDoCadastro: '',
    txAutorPfDoCadastro: '',
    txNmResponsavelCadastro: '',
    txRpResponsavelCadastro: '',
    txDrtResponsavelCadastro: '',
    // Empresa contratada
    txNomePjDaContratada: '',
    txNrContratoContratada: '',
    // Área gestora CPTM
    txNmAreaGestoraCptm: '',
    txIdAreaGestoraCptm: '',
    txSiglaAreaGestoraCptm: '',
    // Representante e supervisora
    txNomePfDaRepresentante: '',
    txNomePjDaSupervisora: '',
    txNrContratoSupervisora: '',
    // Arquivos relacionados
    txNmArquivoFdcRelacionado: '',
    pkCdArquivoFdcRelacionado: '',
    txNmArquivoRvtRelacionado: '',
    pkCdElementoDeMonitorRvt: '',
    txNmArquivoDacRelacionado: '',
    pkCdElementoDeMonitorDac: '',
    txNmArquivoCncRelacionado: '',
    pkCdElementoDeMonitorCnc: '',
    // Referências
    pkCdCodigoNoUltimoRra: '',
    pkCdCedoc: '',
    // Fotos (nomes dos arquivos; o BLOB fica em RT_EFLUENTE)
    txNomeFoto01: '',
    txNomeFoto02: '',
    txNomeFoto03: '',
    txNomeFoto04: '',
  }
}

export function normalizeEfluente(item = {}) {
  const base = createEmptyEfluente()
  return {
    ...base,
    ...item,
    nrLatGrauDecimalWgs84: item.nrLatGrauDecimalWgs84 ?? null,
    nrLongGrauDecimalWgs84: item.nrLongGrauDecimalWgs84 ?? null,
    nrLatMetrosSirgas2000: item.nrLatMetrosSirgas2000 ?? null,
    nrLongMetrosSirgas2000: item.nrLongMetrosSirgas2000 ?? null,
    nrQuantidadeL: item.nrQuantidadeL ?? null,
    nrDistanciaDaViaM: item.nrDistanciaDaViaM ?? null,
    nrNumeroDeFormulario: item.nrNumeroDeFormulario ?? null,
    dtDataEmissaoFormulario: item.dtDataEmissaoFormulario ?? null,
    dtValidadeDra: item.dtValidadeDra ?? null,
    dtDataDoCadastramento: item.dtDataDoCadastramento ?? null,
  }
}

export function normalizeUser(item = {}) {
  return {
    idUsuario: item.idUsuario,
    nmUsuario: item.nmUsuario,
    dsLogin: item.dsLogin,
    dsEmail: item.dsEmail,
    idPerfil: item.idPerfil,
    flAtivo: item.flAtivo,
    dtCadastro: item.dtCadastro,
  }
}
