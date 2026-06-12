import { initCrypto, encrypt } from './cryptoService'

const DB_NAME = 'cptm_db'
const DB_VERSION = 1

export const STORE_AUTH = 'auth'
export const STORE_DRAFTS = 'drafts'
export const STORE_QUEUE = 'queue'
export const STORE_CACHE_EFLUENTES = 'cache_efluentes'
export const STORE_CACHE_DOMINIOS = 'cache_dominios'

const ALL_STORES = [STORE_AUTH, STORE_DRAFTS, STORE_QUEUE, STORE_CACHE_EFLUENTES, STORE_CACHE_DOMINIOS]

let _db = null

function openDb() {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      for (const store of ALL_STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' })
        }
      }
    }
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db) }
    req.onerror = (e) => reject(e.target.error)
  })
}

// Returns {id, payload} or null
export async function dbGet(storeName, id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

// Stores {id, payload: string}
export async function dbSet(storeName, id, payload) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).put({ id, payload })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function dbRemove(storeName, id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// Returns array of {id, payload}
export async function dbGetAll(storeName) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => reject(req.error)
  })
}

async function migrateFromLocalStorage() {
  // Auth session
  const authRaw = localStorage.getItem('cptm.front.auth.session.v1')
  if (authRaw) {
    const existing = await dbGet(STORE_AUTH, 'session')
    if (!existing) {
      await dbSet(STORE_AUTH, 'session', await encrypt(authRaw))
    }
    localStorage.removeItem('cptm.front.auth.session.v1')
  }

  // Drafts (pattern: cptm.front.efluente.wizard.*)
  const draftKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('cptm.front.efluente.wizard.')) draftKeys.push(key)
  }
  for (const key of draftKeys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    const draftId = key.replace('cptm.front.efluente.wizard.', '')
    const existing = await dbGet(STORE_DRAFTS, draftId)
    if (!existing) {
      await dbSet(STORE_DRAFTS, draftId, await encrypt(raw))
    }
    localStorage.removeItem(key)
  }

  // Offline queue
  const queueRaw = localStorage.getItem('cptm.front.offline.queue.v1')
  if (queueRaw) {
    const existing = await dbGet(STORE_QUEUE, 'queue')
    if (!existing) {
      await dbSet(STORE_QUEUE, 'queue', await encrypt(queueRaw))
    }
    localStorage.removeItem('cptm.front.offline.queue.v1')
  }

  // Efluentes cache (not sensitive, no encryption)
  const efluentesRaw = localStorage.getItem('cptm.front.efluentes.cache.v1')
  if (efluentesRaw) {
    const existing = await dbGet(STORE_CACHE_EFLUENTES, 'list')
    if (!existing) {
      await dbSet(STORE_CACHE_EFLUENTES, 'list', efluentesRaw)
    }
    localStorage.removeItem('cptm.front.efluentes.cache.v1')
  }

  // Domains cache (not sensitive, no encryption)
  const dominiosRaw = localStorage.getItem('cptm.front.dominios.v3')
  if (dominiosRaw) {
    const existing = await dbGet(STORE_CACHE_DOMINIOS, 'catalog')
    if (!existing) {
      await dbSet(STORE_CACHE_DOMINIOS, 'catalog', dominiosRaw)
    }
    localStorage.removeItem('cptm.front.dominios.v3')
  }
}

export async function initStorage() {
  await initCrypto()
  await openDb()
  await migrateFromLocalStorage()
}
