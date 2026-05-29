import api from '@/api/api'
import {
  DEPTO_OPTIONS,
  LINHA_OPTIONS,
  MUNICIPIO_OPTIONS,
  STATUS_DESVIO_OPTIONS,
  STATUS_REGISTRO_OPTIONS,
  TIPO_EFLUENTE_OPTIONS,
  TRECHO_OPTIONS,
  VIA_OPTIONS,
} from '@/models/lookupData'

const DOMAIN_CACHE_KEY = 'cptm.front.dominios.v2'

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.dados ?? payload?.data?.dados ?? payload?.items ?? []
}

function toOptions(items = []) {
  return items.map((item) => ({
    value: Number(item.id),
    label: item.descricao,
  }))
}

function buildFallbackCatalog() {
  return {
    municipios: MUNICIPIO_OPTIONS,
    linhas: LINHA_OPTIONS,
    vias: VIA_OPTIONS,
    trechos: TRECHO_OPTIONS,
    tiposEfluente: TIPO_EFLUENTE_OPTIONS,
    departamentos: DEPTO_OPTIONS,
    statusDesvio: STATUS_DESVIO_OPTIONS,
    statusRegistro: STATUS_REGISTRO_OPTIONS,
  }
}

function readCache() {
  try {
    const raw = localStorage.getItem(DOMAIN_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(DOMAIN_CACHE_KEY, JSON.stringify(value))
  } catch {
    // Ignore cache write failures.
  }
}

export async function loadDomainCatalog() {
  const fallback = buildFallbackCatalog()

  try {
    const [municipios, linhas, vias, trechos, tiposEfluente, departamentos, statusDesvio, statusRegistro] = await Promise.all([
      api.get('/api/dominio/municipios'),
      api.get('/api/dominio/linhas'),
      api.get('/api/dominio/vias'),
      api.get('/api/dominio/trechos'),
      api.get('/api/dominio/tipos-efluente'),
      api.get('/api/dominio/departamentos'),
      api.get('/api/dominio/status-desvio'),
      api.get('/api/dominio/status-registro'),
    ])

    const catalog = {
      municipios: toOptions(unwrapCollection(municipios.data)),
      linhas: toOptions(unwrapCollection(linhas.data)),
      vias: toOptions(unwrapCollection(vias.data)),
      trechos: toOptions(unwrapCollection(trechos.data)),
      tiposEfluente: toOptions(unwrapCollection(tiposEfluente.data)),
      departamentos: toOptions(unwrapCollection(departamentos.data)),
      statusDesvio: toOptions(unwrapCollection(statusDesvio.data)),
      statusRegistro: toOptions(unwrapCollection(statusRegistro.data)),
    }

    writeCache(catalog)
    return catalog
  } catch {
    return readCache() || fallback
  }
}
