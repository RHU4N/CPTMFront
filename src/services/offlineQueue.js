const QUEUE_KEY = 'cptm.front.offline.queue.v1'

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch { /* ignore storage failures */ }
}

export function enqueue(payload, files = []) {
  const queue = readQueue()
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    files, // serialized: [{ name, type, dataUrl }]
    queuedAt: new Date().toISOString(),
  })
  writeQueue(queue)
}

export function dequeueFirst() {
  const queue = readQueue()
  if (!queue.length) return null
  const [first, ...rest] = queue
  writeQueue(rest)
  return first
}

export function queueSize() {
  return readQueue().length
}

export function peekQueue() {
  return readQueue()
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
