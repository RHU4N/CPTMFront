import api from '@/api/api'
import { clearAuthSession, readAuthSession, saveAuthSession } from '@/utils/authStorage'

function normalizeAuthResponse(data) {
  return {
    sucesso: Boolean(data?.sucesso ?? data?.token),
    mensagem: data?.mensagem ?? '',
    token: data?.token ?? '',
    idUsuario: data?.idUsuario ?? null,
    nmUsuario: data?.nmUsuario ?? '',
    dsLogin: data?.dsLogin ?? '',
    idPerfil: data?.idPerfil ?? 0,
  }
}

function persistSessionIfAuthenticated(data) {
  const session = normalizeAuthResponse(data)

  if (!session.token) {
    return session
  }

  return saveAuthSession(session)
}

export async function login(payload) {
  const response = await api.post('/api/Auth/login', payload)
  return persistSessionIfAuthenticated(response.data)
}

export async function register(payload) {
  const response = await api.post('/api/Auth/register', payload)
  return persistSessionIfAuthenticated(response.data)
}

export async function refreshToken() {
  const session = readAuthSession()
  if (!session?.token) {
    return null
  }

  const response = await api.post('/api/Auth/refresh')
  return persistSessionIfAuthenticated(response.data)
}

export function logout() {
  clearAuthSession()
}