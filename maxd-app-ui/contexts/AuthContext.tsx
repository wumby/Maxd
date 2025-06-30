import { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { API_URL } from '@/env'

type User = {
  name: string
  email: string
}

type AuthContextType = {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authLoaded: boolean
  updateUser: (newUser: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await SecureStore.getItemAsync('token')
      if (!storedToken) {
        setAuthLoaded(true)
        return
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })

        if (!res.ok) throw new Error('Token invalid or user missing')

        const validatedUser = await res.json()
        setToken(storedToken)
        setUser(validatedUser)
      } catch {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('user')
        setToken(null)
        setUser(null)
      } finally {
        setAuthLoaded(true)
      }
    }

    loadAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      throw new Error('Invalid login')
    }

    const data = await res.json()

    await SecureStore.setItemAsync('token', data.token)
    await SecureStore.setItemAsync('user', JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('user')
    setToken(null)
    setUser(null)
    router.replace('/signup')
  }

  const updateUser = async (newUser: User) => {
    setUser(newUser)
    await SecureStore.setItemAsync('user', JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authLoaded, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
