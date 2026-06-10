const AUTH_SESSION_KEY = 'cptm.front.auth.session.v1'

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

  // primeiroAcesso pode vir do response body ou do claim JWT
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

export function readAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) {
      return null
    }

    const session = normalizeSession(JSON.parse(raw))
    if (!session?.token) {
      return null
    }

    if (session.expiresAtUtc && Date.parse(session.expiresAtUtc) <= Date.now()) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export function saveAuthSession(session) {
  const normalized = normalizeSession(session)
  if (!normalized) {
    clearAuthSession()
    return null
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized))
  return normalized
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}

export function getAccessToken() {
  return readAuthSession()?.token || ''
}

export function getCurrentRole() {
  return Number(readAuthSession()?.idPerfil ?? 0) === 1 ? 'admin' : 'operator'
}
