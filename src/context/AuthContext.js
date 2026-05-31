import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, token } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('sh_user')
        const access = await token.getAccess()
        if (stored && access) setUser(JSON.parse(stored))
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const login = async ({ email, password }) => {
    const data = await api.post('/auth/login', { email, password })
    await token.set(data.accessToken, data.refreshToken)
    await AsyncStorage.setItem('sh_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const data = await api.post('/auth/register', formData)
    await token.set(data.accessToken, data.refreshToken)
    await AsyncStorage.setItem('sh_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try { await api.post('/auth/logout', { refreshToken: await token.getRefresh() }) } finally {
      await token.clear(); setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout,
      isLoggedIn:!!user, isClient:user?.role==='CLIENT', isExpert:user?.role==='EXPERT', isAdmin:user?.role==='ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
