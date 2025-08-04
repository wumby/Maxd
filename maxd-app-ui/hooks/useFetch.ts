import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type FetchFn<T> = (token: string) => Promise<T>

export function useFetch<T>(fetchFn: FetchFn<T>) {
  const { token } = useAuth()
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const execute = useCallback(async (): Promise<T | undefined> => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(token)
      setData(result)
      return result
    } catch (err) {
      console.error('useFetchResource failed:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, token])

  return {
    data,
    loading,
    error,
    execute,
    setData,
  }
}
