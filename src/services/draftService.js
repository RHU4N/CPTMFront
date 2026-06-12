// Inspection status states:
// RASCUNHO              — form saved locally, incomplete (wizard in progress)
// PRONTO_PARA_ENVIO     — form saved locally, complete (reached review step), not yet sent
// AGUARDANDO_SINCRONIZACAO — submitted but queued (offline)
// SINCRONIZANDO         — currently being sent
// SINCRONIZADO          — saved on server
// ERRO                  — sync attempt failed

import { encrypt, decrypt } from '@/utils/cryptoService'
import { dbGet, dbSet, dbRemove, dbGetAll, STORE_DRAFTS } from '@/utils/storageService'

const DRAFT_PREFIX = 'cptm.front.efluente.wizard.'

export const STATUS = {
  RASCUNHO: 'RASCUNHO',
  PRONTO: 'PRONTO_PARA_ENVIO',
  AGUARDANDO: 'AGUARDANDO_SINCRONIZACAO',
  SINCRONIZANDO: 'SINCRONIZANDO',
  SINCRONIZADO: 'SINCRONIZADO',
  ERRO: 'ERRO',
}

// In-memory cache: id → data object (populated on boot via initDrafts)
const _cache = new Map()

function parseDraftRecord(id, data) {
  const form = data.form
  return {
    _draftKey: `${DRAFT_PREFIX}${id}`,
    _draftId: id,
    _status: data.failed ? STATUS.ERRO : (data.ready ? STATUS.PRONTO : STATUS.RASCUNHO),
    _stepIndex: data.stepIndex ?? 0,
    pkCdMeioAmbienteCptm: form.pkCdMeioAmbienteCptm || id,
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
  }
}

// Called on boot — loads all drafts from IndexedDB into in-memory cache
export async function initDrafts() {
  _cache.clear()
  const all = await dbGetAll(STORE_DRAFTS)
  for (const record of all) {
    try {
      const decrypted = await decrypt(record.payload)
      if (!decrypted) continue
      const data = JSON.parse(decrypted)
      if (data?.form) _cache.set(record.id, data)
    } catch { /* skip malformed records */ }
  }
}

// Synchronous — reads from in-memory cache (safe after initDrafts)
export function listDrafts() {
  const drafts = []
  for (const [id, data] of _cache) {
    if (!data?.form) continue
    drafts.push(parseDraftRecord(id, data))
  }
  return drafts
}

export async function saveDraft(id, data) {
  _cache.set(id, data)
  const encrypted = await encrypt(JSON.stringify(data))
  await dbSet(STORE_DRAFTS, id, encrypted)
}

export async function getDraftById(id) {
  if (_cache.has(id)) {
    const data = _cache.get(id)
    return { ...data, _key: `${DRAFT_PREFIX}${id}`, _id: id }
  }
  const record = await dbGet(STORE_DRAFTS, id)
  if (!record) return null
  try {
    const decrypted = await decrypt(record.payload)
    if (!decrypted) return null
    const data = JSON.parse(decrypted)
    if (data?.form) _cache.set(id, data)
    return { ...data, _key: `${DRAFT_PREFIX}${id}`, _id: id }
  } catch {
    return null
  }
}

// keyOrId can be the full key ("cptm.front.efluente.wizard.abc") or just the id ("abc")
export async function removeDraft(keyOrId) {
  const id = String(keyOrId).startsWith(DRAFT_PREFIX)
    ? String(keyOrId).slice(DRAFT_PREFIX.length)
    : String(keyOrId)
  _cache.delete(id)
  await dbRemove(STORE_DRAFTS, id)
}

export async function clearNewDraft() {
  await removeDraft('new')
}
