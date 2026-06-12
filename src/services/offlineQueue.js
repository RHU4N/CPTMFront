import { encrypt, decrypt } from '@/utils/cryptoService'
import { dbGet, dbSet, STORE_QUEUE } from '@/utils/storageService'

const QUEUE_ID = 'queue'

// In-memory cache (populated on boot via initQueue)
let _queueCache = []

// Called on boot — loads queue from IndexedDB into in-memory cache
export async function initQueue() {
  const record = await dbGet(STORE_QUEUE, QUEUE_ID)
  if (!record) { _queueCache = []; return }
  try {
    const decrypted = await decrypt(record.payload)
    _queueCache = decrypted ? JSON.parse(decrypted) : []
  } catch {
    _queueCache = []
  }
}

async function writeQueue(queue) {
  _queueCache = queue
  const encrypted = await encrypt(JSON.stringify(queue))
  await dbSet(STORE_QUEUE, QUEUE_ID, encrypted)
}

export async function enqueue(payload, files = []) {
  const queue = [..._queueCache]
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    files, // serialized: [{ name, type, dataUrl }]
    queuedAt: new Date().toISOString(),
  })
  await writeQueue(queue)
}

export async function dequeueFirst() {
  const [first, ...rest] = _queueCache
  if (!first) return null
  await writeQueue(rest)
  return first
}

// Synchronous — reads from in-memory cache
export function queueSize() {
  return _queueCache.length
}

// Synchronous — reads from in-memory cache
export function peekQueue() {
  return [..._queueCache]
}

export async function removeById(id) {
  await writeQueue(_queueCache.filter((entry) => entry.id !== id))
}

export function serializeFiles(files) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result })
          reader.onerror = () => reject(new Error(`Não foi possível ler o arquivo ${file.name}`))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

export function deserializeFiles(serialized = []) {
  return serialized.map(({ name, type, dataUrl }) => {
    const base64 = dataUrl.split(',')[1] ?? ''
    const byteString = atob(base64)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    return new File([ab], name, { type })
  })
}
