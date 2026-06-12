import { encrypt, decrypt } from './cryptoService'
import { dbGet, dbSet, dbRemove, STORE_AUTH } from './storageService'

const AUTH_ID = 'session'
let _sessionCache = null

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padding = (4 - (normalized.length % 4)) % 4
    const json = atob(normalized + '='.repeat(padding))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeSession(session) {
  if (!session?.token) {
    return null
  }

  const payload = decodeJwtPayload(session.token)
  const expiresAtUtc = payload?.exp ? new Date(payload.exp * 1000).toISOString() : null

  const primeiroAcessoRaw = session.primeiroAcesso ?? payload?.primeiroAcesso
  const primeiroAcesso = primeiroAcessoRaw === true || primeiroAcessoRaw === 'true'

  return {
    ...session,
    expiresAtUtc,
    idPerfil: Number(session.idPerfil ?? payload?.idPerfil ?? 0) || 0,
    nmUsuario: session.nmUsuario ?? payload?.name ?? '',
    dsLogin: session.dsLogin ?? payload?.dsLogin ?? '',
    primeiroAcesso,
  }
}

// Called once at app boot (async) — populates in-memory cache from IndexedDB
export async function hydrateAuth() {
  try {
    const record = await dbGet(STORE_AUTH, AUTH_ID)
    if (!record) { _sessionCache = null; return null }

    const decrypted = await decrypt(record.payload)
    if (!decrypted) { _sessionCache = null; return null }

    const session = normalizeSession(JSON.parse(decrypted))
    if (!session?.token) { _sessionCache = null; return null }

    if (session.expiresAtUtc && Date.parse(session.expiresAtUtc) <= Date.now()) {
      await clearAuthSession()
      return null
    }

    _sessionCache = session
    return session
  } catch {
    _sessionCache = null
    return null
  }
}

// Synchronous — reads from in-memory cache (populated by hydrateAuth)
export function readAuthSession() {
  return _sessionCache
}

export async function saveAuthSession(session) {
  const normalized = normalizeSession(session)
  if (!normalized) {
    await clearAuthSession()
    return null
  }

  _sessionCache = normalized
  const encrypted = await encrypt(JSON.stringify(normalized))
  await dbSet(STORE_AUTH, AUTH_ID, encrypted)
  return normalized
}

export async function clearAuthSession() {
  _sessionCache = null
  await dbRemove(STORE_AUTH, AUTH_ID)
}

export function getAccessToken() {
  return _sessionCache?.token || ''
}

export function getCurrentRole() {
  return Number(_sessionCache?.idPerfil ?? 0) === 1 ? 'admin' : 'operator'
}
