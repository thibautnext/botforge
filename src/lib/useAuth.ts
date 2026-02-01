'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string
}

const TOKEN_KEY = 'botforge_token'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }, [])

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getToken()
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      },
    })
  }, [getToken])

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    authFetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Invalid token')
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [getToken, authFetch])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return { user, loading, login, register, logout, authFetch, getToken }
}
