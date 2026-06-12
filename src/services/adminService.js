import api from '@/api/api'

// =====================================================
// CRUD de Domínios
// =====================================================

export async function listDominio(tipo) {
  const response = await api.get(`/api/dominio/${tipo}`)
  const data = response.data
  if (Array.isArray(data)) return data
  return data?.dados ?? data?.data ?? []
}

export async function createDominioItem(tipo, descricao) {
  const response = await api.post(`/api/dominio/${tipo}`, { descricao })
  return response.data
}

export async function updateDominioItem(tipo, id, descricao) {
  const response = await api.put(`/api/dominio/${tipo}/${id}`, { descricao })
  return response.data
}

export async function deleteDominioItem(tipo, id) {
  const response = await api.delete(`/api/dominio/${tipo}/${id}`)
  return response.data
}

// =====================================================
// Logs de Ação
// =====================================================

export async function listLogsAcao(params = {}) {
  const response = await api.get('/api/log/acoes', { params })
  const data = response.data
  return {
    dados: data?.dados ?? [],
    total: data?.total ?? 0,
    pagina: data?.pagina ?? 1,
    tamanhoPagina: data?.tamanhoPagina ?? 50,
  }
}

// =====================================================
// Logs de Sincronização
// =====================================================

export async function listLogsSincronizacao(params = {}) {
  const response = await api.get('/api/log/sincronizacoes', { params })
  const data = response.data
  return {
    dados: data?.dados ?? [],
    total: data?.total ?? 0,
    pagina: data?.pagina ?? 1,
    tamanhoPagina: data?.tamanhoPagina ?? 50,
  }
}

export async function registrarLogSync(dsStatus, dsMensagem = null) {
  try {
    const response = await api.post('/api/log/sincronizacoes', { dsStatus, dsMensagem })
    return response.data
  } catch {
    // Falha silenciosa — não deve impedir o fluxo principal
  }
}

// =====================================================
// Utilitário de validação de senha forte (RNF14)
// =====================================================

export function validarSenha(senha) {
  return (
    typeof senha === 'string' &&
    senha.length >= 8 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /[0-9]/.test(senha) &&
    /[^a-zA-Z0-9]/.test(senha)
  )
}

export function validarSenhaMensagem(senha) {
  if (!senha || senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.'
  if (!/[a-z]/.test(senha)) return 'A senha deve conter pelo menos uma letra minúscula.'
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos uma letra maiúscula.'
  if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.'
  if (!/[^a-zA-Z0-9]/.test(senha))
    return 'A senha deve conter pelo menos um caractere especial (ex: @, #, !, $).'
  return null
}
