import { useEffect, useState } from 'react'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'

export function useSavedExercises() {
  const { token } = useAuth()
  const [savedExercises, setSavedExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const fetchSavedExercises = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/saved-exercises`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error('Failed to load saved exercises')
        const data = await res.json()
        setSavedExercises(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSavedExercises()
  }, [token])

  return { savedExercises, setSavedExercises, loading, error }
}
