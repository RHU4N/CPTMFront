import axios from 'axios'
import { clearAuthSession, getAccessToken } from '@/utils/authStorage'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const baseURL = configuredBaseUrl ?? 'http://localhost:5000'

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message =
      error?.response?.data?.mensagem ||
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.message ||
      'Falha ao comunicar com a API.'

    if (status === 401) {
      clearAuthSession()
      window.dispatchEvent(new CustomEvent('cptm:unauthorized'))
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler(error)
      }
    }

    return Promise.reject(new Error(message))
  },
)

export default api