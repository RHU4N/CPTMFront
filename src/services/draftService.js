// Inspection status states:
// RASCUNHO              — form saved locally, incomplete (wizard in progress)
// PRONTO_PARA_ENVIO     — form saved locally, complete (reached review step), not yet sent
// AGUARDANDO_SINCRONIZACAO — submitted but queued (offline)
// SINCRONIZANDO         — currently being sent
// SINCRONIZADO          — saved on server
// ERRO                  — sync attempt failed

const DRAFT_PREFIX = 'cptm.front.efluente.wizard.'
const DRAFT_NEW_KEY = `${DRAFT_PREFIX}new`

export const STATUS = {
  RASCUNHO: 'RASCUNHO',
  PRONTO: 'PRONTO_PARA_ENVIO',
  AGUARDANDO: 'AGUARDANDO_SINCRONIZACAO',
  SINCRONIZANDO: 'SINCRONIZANDO',
  SINCRONIZADO: 'SINCRONIZADO',
  ERRO: 'ERRO',
}

function safeJsonParse(raw) {
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

export function listDrafts() {
  const drafts = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(DRAFT_PREFIX)) continue
    const data = safeJsonParse(localStorage.getItem(key))
    if (!data?.form) continue
    const form = data.form
    drafts.push({
      _draftKey: key,
      _status: data.failed ? STATUS.ERRO : (data.ready ? STATUS.PRONTO : STATUS.RASCUNHO),
      _stepIndex: data.stepIndex ?? 0,
      pkCdMeioAmbienteCptm: form.pkCdMeioAmbienteCptm || key,
      txNmElementoMonitoramento: form.txNmElementoMonitoramento || '',
      txNrElementoMonitoramento: form.txNrElementoMonitoramento || '',
      dtDataDoCadastramento: form.dtDataDoCadastramento || null,
      _savedAt: data.savedAt || null,
      hrHorasDoCadastramento: form.hrHorasDoCadastramento || '',
      txStatusDoDesvioAmbiental: form.txStatusDoDesvioAmbiental || '',
      txViaCptm: form.txViaCptm || '',
      txEstacaoCptm: form.txEstacaoCptm || '',
      txLinhaCptm: form.txLinhaCptm || '',
      txMunicipio: form.txMunicipio || '',
      txAutorPfDoCadastro: form.txAutorPfDoCadastro || '',
      nrLatGrauDecimalWgs84: form.nrLatGrauDecimalWgs84 ?? null,
      nrLongGrauDecimalWgs84: form.nrLongGrauDecimalWgs84 ?? null,
    })
  }
  return drafts
}

export function removeDraft(key) {
  localStorage.removeItem(key)
}

export function clearNewDraft() {
  localStorage.removeItem(DRAFT_NEW_KEY)
}

export function getDraftById(id) {
  const key = `${DRAFT_PREFIX}${id}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    return { ...data, _key: key }
  } catch {
    return null
  }
}
