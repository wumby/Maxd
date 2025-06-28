import { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await SecureStore.getItemAsync('token')
      const storedUser = await SecureStore.getItemAsync('user')

      if (storedToken) setToken(storedToken)
      if (storedUser) setUser(JSON.parse(storedUser))

      setAuthLoaded(true)
    }

    loadAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('http://192.168.0.6:3001/auth/login', {
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
    router.replace('/signin')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authLoaded }}>
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
