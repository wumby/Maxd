import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type FetchFn<T, P = void> = (token: string, params: P) => Promise<T>
export function useFetch<T, P = void>(fetchFn: FetchFn<T, P>, initialData?: T) {
  const { token } = useAuth()
  const [data, setData] = useState<T>(initialData as T)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const execute = useCallback(
    async (params: P): Promise<T> => {
      if (!token) throw new Error('No token')
      setLoading(true)
      setError(null)
      try {
        const result = await fetchFn(token, params)
        setData(result)
        return result
      } catch (err) {
        console.error('useFetch failed:', err)
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchFn, token]
  )

  return {
    data,
    loading,
    error,
    execute,
    setData,
  }
}
