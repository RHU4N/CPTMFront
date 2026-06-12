import api from '@/api/api'
import { normalizeUser } from '@/models/efluente'
import { dequeueFirst, deserializeFiles, peekQueue } from './offlineQueue'

const CACHE_KEY = 'cptm.front.efluentes.cache.v1'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function unwrapCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload?.dados ?? payload?.data?.dados ?? payload?.items ?? []
}

function unwrapItem(payload) {
  if (!payload || Array.isArray(payload)) {
    return payload ?? null
  }

  return payload?.dados ?? payload?.data?.dados ?? payload
}

function normalizeAttachment(item = {}) {
  const contentType = item.contentType ?? ''
  const dataBase64 = item.data ?? item.dataBase64 ?? ''
  const isImage = contentType.startsWith('image/')

  return {
    ...item,
    attachmentId: Number(item.attachmentId ?? 0) || 0,
    dataSize: Number(item.dataSize ?? 0) || 0,
    contentType,
    attName: item.attName ?? '',
    dataBase64,
    previewUrl: isImage && dataBase64 ? `data:${contentType};base64,${dataBase64}` : '',
  }
}

function normalizeList(items) {
  return items.map((item) => ({
    ...item,
    txCoordenadaX: item.txCoordenadaX ?? null,
    txCoordenadaY: item.txCoordenadaY ?? null,
    attachments: item.attachments ?? [],
  }))
}

function cachedList() {
  return readJson(CACHE_KEY, [])
}

function setCachedList(items) {
  writeJson(CACHE_KEY, items)
}

export async function listEfluentes() {
  try {
    const response = await api.get('/api/PT_EFLUENTE')
    const items = normalizeList(unwrapCollection(response.data))
    setCachedList(items)
    return items
  } catch (error) {
    const fallback = cachedList()
    if (fallback.length) {
      return fallback
    }
    throw error
  }
}

export async function getEfluenteById(id) {
  const response = await api.get(`/api/PT_EFLUENTE/${id}`)
  return unwrapItem(response.data)
}

export function isNetworkFailure(error) {
  return !navigator.onLine || error?.code === 'ERR_NETWORK' || error?.message === 'Network Error'
}

export async function saveEfluente(payload) {
  const isNew = '_isNew' in payload ? !!payload._isNew : !payload.pkCdMeioAmbienteCptm
  const { _isNew, ...body } = payload
  const method = isNew ? 'post' : 'put'
  const url = isNew
    ? '/api/PT_EFLUENTE'
    : `/api/PT_EFLUENTE/${encodeURIComponent(body.pkCdMeioAmbienteCptm)}`

  const response = await api[method](url, body)
  return response.data?.dados ?? response.data
}

export async function flushOfflineQueue(cancelSignal = null, onItemStart = null, onItemSync = null) {
  const results = []
  let queue = peekQueue()
  while (queue.length > 0) {
    if (cancelSignal?.cancelled) break
    const item = queue[0]
    onItemStart?.(item.id)
    try {
      const saved = await saveEfluente(item.payload)
      const itemId = saved?.pkCdMeioAmbienteCptm || item.payload.pkCdMeioAmbienteCptm
      if (itemId && item.files?.length) {
        const files = deserializeFiles(item.files)
        for (const file of files) {
          await uploadAttachment(itemId, file)
        }
      }
      dequeueFirst()
      onItemSync?.(item)
      results.push({ id: item.id, status: 'synced', data: saved })
    } catch (error) {
      if (isNetworkFailure(error)) break
      dequeueFirst()
      results.push({
        id: item.payload?.pkCdMeioAmbienteCptm || item.id,
        queueId: item.id,
        payload: item.payload,
        files: item.files,
        status: 'failed',
        error: error.message,
      })
    }
    queue = peekQueue()
  }
  return results
}

export async function deleteEfluente(id) {
  const response = await api.delete(`/api/PT_EFLUENTE/${encodeURIComponent(id)}`)
  return unwrapItem(response.data)
}

export async function listAttachments(id) {
  const response = await api.get(`/api/RT_EFLUENTE/efluente/${encodeURIComponent(id)}`)
  return unwrapCollection(response.data).map(normalizeAttachment)
}

export function getAttachmentUrl(id) {
  return `${api.defaults.baseURL}/api/RT_EFLUENTE/download/${encodeURIComponent(id)}`
}

export function getAttachmentPreviewUrl(attachment) {
  if (!attachment) {
    return ''
  }

  if (attachment.previewUrl) {
    return attachment.previewUrl
  }

  if (attachment.contentType?.startsWith('image/') && attachment.dataBase64) {
    return `data:${attachment.contentType};base64,${attachment.dataBase64}`
  }

  return getAttachmentUrl(attachment.attachmentId)
}

export async function uploadAttachment(relObjectId, file) {
  const formData = new FormData()
  formData.append('relObjectId', relObjectId)
  formData.append('file', file)

  const response = await api.post('/api/RT_EFLUENTE/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function listUsers() {
  const response = await api.get('/api/TB_USUARIO')
  return unwrapCollection(response.data).map(normalizeUser)
}