import { useState, useCallback } from 'react'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'

export function useSavedWorkouts() {
  const { token } = useAuth()
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/saved-workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSaved(data)
    } catch (err) {
      console.error('Failed to fetch saved workouts', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  return {
    saved,
    setSaved,
    loading,
    refreshSavedWorkouts: execute,
  }
}
