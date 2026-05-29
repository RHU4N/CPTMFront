export function createEmptyEfluente() {
  return {
    pkCdMeioAmbienteCptm: '',
    idDeptoCampoAmbiente: null,
    idStatusDesvio: null,
    idStatusRegistro: null,
    idMunicipio: null,
    idLinha: null,
    idVia: null,
    idTrecho: null,
    idTipoEfluente: null,
    txNrElementoMonitoramento: '',
    txNmElementoMonitoramento: '',
    txKmPoste: '',
    txEndereco: '',
    txCoordenadaX: null,
    txCoordenadaY: null,
    dtRegistro: new Date().toISOString(),
    dtAtualizacao: null,
    txNomeTecnicoResponsavel: '',
    txEmailTecnicoResponsavel: '',
    txTelefoneTecnicoResponsavel: '',
    txEmpresaContratada: '',
    txNumeroContrato: '',
    txProcessoAmbiental: '',
    txOrigemEfluente: '',
    txDestinacaoEfluente: '',
    txVolumeEfluente: null,
    txUnidadeVolume: 'L',
    txCorEfluente: '',
    txOdorEfluente: '',
    txPh: null,
    txTemperatura: null,
    txObservacao: '',
    txLinkMapa: '',
    txNomeFoto01: '',
    txNomeFoto02: '',
    txNomeFoto03: '',
    txNomeFoto04: '',
  }
}

export function normalizeEfluente(item = {}) {
  return {
    ...createEmptyEfluente(),
    ...item,
    txCoordenadaX: item.txCoordenadaX ?? null,
    txCoordenadaY: item.txCoordenadaY ?? null,
    txVolumeEfluente: item.txVolumeEfluente ?? null,
    txPh: item.txPh ?? null,
    txTemperatura: item.txTemperatura ?? null,
    attachments: item.attachments ?? [],
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