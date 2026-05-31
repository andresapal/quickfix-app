// ─── API CLIENT MÓVIL ─────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'https://api.servicehub.app/api/v1' // ← cambiar por tu URL real

const token = {
  async getAccess()  { return AsyncStorage.getItem('sh_access') },
  async getRefresh() { return AsyncStorage.getItem('sh_refresh') },
  async set(access, refresh) {
    await AsyncStorage.setItem('sh_access', access)
    if (refresh) await AsyncStorage.setItem('sh_refresh', refresh)
  },
  async clear() {
    await AsyncStorage.multiRemove(['sh_access','sh_refresh','sh_user'])
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message); this.status = status; this.name = 'ApiError'
  }
}

let isRefreshing = false
let refreshQueue = []

async function doRefresh() {
  try {
    const refreshToken = await token.getRefresh()
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) throw new Error('Refresh failed')
    const { data } = await res.json()
    await token.set(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    await token.clear()
    return null
  }
}

async function request(path, options = {}, appId = null) {
  const url = `${API_URL}${path}`
  const accessToken = await token.getAccess()

  const makeHeaders = (t) => ({
    'Content-Type': 'application/json',
    ...(t && { Authorization: `Bearer ${t}` }),
    ...(appId && { 'X-App-Id': appId.toUpperCase() }),
    ...options.headers
  })

  let res = await fetch(url, { ...options, headers: makeHeaders(accessToken) })

  if (res.status === 401) {
    const refreshToken = await token.getRefresh()
    if (refreshToken) {
      if (isRefreshing) {
        await new Promise(resolve => refreshQueue.push(resolve))
      } else {
        isRefreshing = true
        const newToken = await doRefresh()
        isRefreshing = false
        refreshQueue.forEach(r => r()); refreshQueue = []
        if (!newToken) throw new ApiError('Sesión expirada', 401)
        res = await fetch(url, { ...options, headers: makeHeaders(newToken) })
      }
    }
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(json.message || `Error ${res.status}`, res.status)
  return json.data !== undefined ? json.data : json
}

export const api = {
  get:    (path, appId)       => request(path, { method:'GET' }, appId),
  post:   (path, body, appId) => request(path, { method:'POST',   body:JSON.stringify(body) }, appId),
  put:    (path, body, appId) => request(path, { method:'PUT',    body:JSON.stringify(body) }, appId),
  delete: (path, appId)       => request(path, { method:'DELETE' }, appId),
}

export { token, ApiError }
