const KEY_STORE_KEY = 'cptm.crypto.key.v1'
let _cryptoKey = null

async function getKey() {
  if (_cryptoKey) return _cryptoKey

  const stored = localStorage.getItem(KEY_STORE_KEY)
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    _cryptoKey = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
    return _cryptoKey
  }

  _cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', _cryptoKey)
  const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)))
  localStorage.setItem(KEY_STORE_KEY, b64)
  return _cryptoKey
}

export async function initCrypto() {
  await getKey()
}

export async function encrypt(plaintext) {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return JSON.stringify({
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  })
}

export async function decrypt(cipherJSON) {
  try {
    const { iv: ivB64, data: dataB64 } = JSON.parse(cipherJSON)
    const key = await getKey()
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))
    const data = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0))
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(plaintext)
  } catch {
    return null
  }
}
