import api from '@/api/api'

function unwrap(response) {
  return response.data
}

function unwrapCollection(response) {
  const data = response.data
  if (Array.isArray(data)) return data
  return data?.dados ?? data?.data ?? []
}

export async function listUsuarios() {
  const response = await api.get('/api/TB_USUARIO')
  return unwrapCollection(response)
}

export async function getUsuario(id) {
  const response = await api.get(`/api/TB_USUARIO/${id}`)
  return unwrap(response)
}

export async function createUsuario(payload) {
  const response = await api.post('/api/TB_USUARIO', payload)
  return unwrap(response)
}

export async function updateUsuario(id, payload) {
  const response = await api.put(`/api/TB_USUARIO/${id}`, payload)
  return unwrap(response)
}

export async function desativarUsuario(id) {
  const response = await api.patch(`/api/TB_USUARIO/${id}/desativar`)
  return unwrap(response)
}

export async function reativarUsuario(id) {
  const response = await api.patch(`/api/TB_USUARIO/${id}/reativar`)
  return unwrap(response)
}

export async function trocarSenha(payload) {
  const response = await api.post('/api/TB_USUARIO/trocar-senha', payload)
  return unwrap(response)
}

export async function atualizarMeuPerfil(payload) {
  const response = await api.patch('/api/TB_USUARIO/meu-perfil', payload)
  return unwrap(response)
}

export async function redefinirSenha(id) {
  const response = await api.patch(`/api/TB_USUARIO/${id}/redefinir-senha`)
  return unwrap(response)
}

export async function trocarLoginUsuario(id, novoLogin) {
  const response = await api.patch(`/api/TB_USUARIO/${id}/trocar-login`, { novoLogin })
  return unwrap(response)
}

export async function listPerfis() {
  const response = await api.get('/api/TB_PERFIL_USUARIO')
  return unwrapCollection(response)
}
