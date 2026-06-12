import api from '@/api/api'
import {
  AREA_GESTORA_OPTIONS,
  DEPTO_OPTIONS,
  ESTACAO_OPTIONS,
  FONTE_GERADORA_OPTIONS,
  LINHA_OPTIONS,
  LOCAL_ATIVIDADE_OPTIONS,
  MUNICIPIO_OPTIONS,
  NATUREZA_PGA_OPTIONS,
  ORIGEM_EFLUENTE_OPTIONS,
  PROPRIETARIO_OPTIONS,
  SIM_NAO_OPTIONS,
  STATUS_DESVIO_OPTIONS,
  STATUS_REGISTRO_OPTIONS,
  TIPO_ATIV_CPTM_OPTIONS,
  TIPO_ATIVIDADE_OPTIONS,
  TIPO_DESTINACAO_OPTIONS,
  TIPO_DRA_OPTIONS,
  TIPO_VEICULO_OPTIONS,
  TRECHO_OPTIONS,
  VIA_OPTIONS,
} from '@/models/lookupData'
import { dbGet, dbSet, STORE_CACHE_DOMINIOS } from '@/utils/storageService'

function unwrapCollection(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.dados ?? payload?.data?.dados ?? payload?.items ?? []
}

// PT_EFLUENTE armazena TEXT, portanto value = descricao (nunca int id)
function toOptions(items = []) {
  return items.map((item) => ({
    value: item.descricao,
    label: item.descricao,
  }))
}

function buildFallbackCatalog() {
  return {
    municipios: MUNICIPIO_OPTIONS,
    linhas: LINHA_OPTIONS,
    vias: VIA_OPTIONS,
    trechos: TRECHO_OPTIONS,
    estacoes: ESTACAO_OPTIONS,
    departamentos: DEPTO_OPTIONS,
    statusDesvio: STATUS_DESVIO_OPTIONS,
    statusRegistro: STATUS_REGISTRO_OPTIONS,
    naturezasPga: NATUREZA_PGA_OPTIONS,
    areasGestoras: AREA_GESTORA_OPTIONS,
    proprietarios: PROPRIETARIO_OPTIONS,
    simNao: SIM_NAO_OPTIONS,
    tiposAtividade: TIPO_ATIVIDADE_OPTIONS,
    tiposDra: TIPO_DRA_OPTIONS,
    tiposAtivCptm: TIPO_ATIV_CPTM_OPTIONS,
    locaisAtividade: LOCAL_ATIVIDADE_OPTIONS,
    origensEfluente: ORIGEM_EFLUENTE_OPTIONS,
    fontesGeradoras: FONTE_GERADORA_OPTIONS,
    tiposDestinacao: TIPO_DESTINACAO_OPTIONS,
    tiposVeiculo: TIPO_VEICULO_OPTIONS,
  }
}

async function readCache() {
  try {
    const record = await dbGet(STORE_CACHE_DOMINIOS, 'catalog')
    return record ? JSON.parse(record.payload) : null
  } catch {
    return null
  }
}

async function writeCache(value) {
  try {
    await dbSet(STORE_CACHE_DOMINIOS, 'catalog', JSON.stringify(value))
  } catch {
    // Ignore cache write failures silently.
  }
}

export async function loadDomainCatalog() {
  const fallback = buildFallbackCatalog()

  try {
    const [
      municipios,
      linhas,
      vias,
      trechos,
      estacoes,
      departamentos,
      statusDesvio,
      statusRegistro,
      naturezasPga,
      areasGestoras,
      proprietarios,
      simNao,
      tiposAtividade,
      tiposDra,
      tiposAtivCptm,
      locaisAtividade,
      origensEfluente,
      fontesGeradoras,
      tiposDestinacao,
      tiposVeiculo,
    ] = await Promise.all([
      api.get('/api/dominio/municipios'),
      api.get('/api/dominio/linhas'),
      api.get('/api/dominio/vias'),
      api.get('/api/dominio/trechos'),
      api.get('/api/dominio/estacoes'),
      api.get('/api/dominio/departamentos'),
      api.get('/api/dominio/status-desvio'),
      api.get('/api/dominio/status-registro'),
      api.get('/api/dominio/naturezas-pga'),
      api.get('/api/dominio/areas-gestoras'),
      api.get('/api/dominio/proprietarios'),
      api.get('/api/dominio/sim-nao'),
      api.get('/api/dominio/tipos-atividade'),
      api.get('/api/dominio/tipos-dra'),
      api.get('/api/dominio/tipos-ativ-cptm'),
      api.get('/api/dominio/locais-atividade'),
      api.get('/api/dominio/origens-efluente'),
      api.get('/api/dominio/fontes-geradoras'),
      api.get('/api/dominio/tipos-destinacao'),
      api.get('/api/dominio/tipos-veiculo'),
    ])

    const catalog = {
      municipios: toOptions(unwrapCollection(municipios.data)),
      linhas: toOptions(unwrapCollection(linhas.data)),
      vias: toOptions(unwrapCollection(vias.data)),
      trechos: toOptions(unwrapCollection(trechos.data)),
      estacoes: toOptions(unwrapCollection(estacoes.data)),
      departamentos: toOptions(unwrapCollection(departamentos.data)),
      statusDesvio: toOptions(unwrapCollection(statusDesvio.data)),
      statusRegistro: toOptions(unwrapCollection(statusRegistro.data)),
      naturezasPga: toOptions(unwrapCollection(naturezasPga.data)),
      areasGestoras: toOptions(unwrapCollection(areasGestoras.data)),
      proprietarios: toOptions(unwrapCollection(proprietarios.data)),
      simNao: toOptions(unwrapCollection(simNao.data)),
      tiposAtividade: toOptions(unwrapCollection(tiposAtividade.data)),
      tiposDra: toOptions(unwrapCollection(tiposDra.data)),
      tiposAtivCptm: toOptions(unwrapCollection(tiposAtivCptm.data)),
      locaisAtividade: toOptions(unwrapCollection(locaisAtividade.data)),
      origensEfluente: toOptions(unwrapCollection(origensEfluente.data)),
      fontesGeradoras: toOptions(unwrapCollection(fontesGeradoras.data)),
      tiposDestinacao: toOptions(unwrapCollection(tiposDestinacao.data)),
      tiposVeiculo: toOptions(unwrapCollection(tiposVeiculo.data)),
    }

    await writeCache(catalog)
    return catalog
  } catch {
    return await readCache() || fallback
  }
}
