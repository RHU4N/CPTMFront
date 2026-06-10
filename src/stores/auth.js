import { defineStore } from 'pinia'
import { login as loginRequest, logout as logoutRequest, refreshToken, register as registerRequest } from '@/services/authService'
import { getCurrentRole, readAuthSession, saveAuthSession } from '@/utils/authStorage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: readAuthSession(),
    hydrated: false,
    refreshState: 'idle',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.token),
    isAdmin: (state) => Number(state.session?.idPerfil) === 1,
    primeiroAcesso: (state) => Boolean(state.session?.primeiroAcesso),
    role: () => getCurrentRole(),
    userLabel: (state) => state.session?.nmUsuario || state.session?.dsLogin || 'Usuário',
  },
  actions: {
    hydrate() {
      this.session = readAuthSession()
      this.hydrated = true
    },
    async login(payload) {
      this.session = await loginRequest(payload)
      return this.session
    },
    async register(payload) {
      const session = await registerRequest(payload)
      this.session = session?.token ? session : null
      return session
    },
    async tryRefresh() {
      this.refreshState = 'loading'
      try {
        const session = await refreshToken()
        if (session) {
          this.session = session
        }
        this.refreshState = 'done'
        return session
      } catch (error) {
        this.refreshState = 'error'
        throw error
      }
    },
    logout() {
      logoutRequest()
      this.session = null
    },
    replaceSession(session) {
      this.session = saveAuthSession(session)
    },
    clearPrimeiroAcesso() {
      if (this.session) {
        this.session = { ...this.session, primeiroAcesso: false }
        saveAuthSession(this.session)
      }
    },
  },
})
