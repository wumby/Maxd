import { useEffect, useState } from 'react'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'

export function useSavedWorkouts() {
  const { token } = useAuth()
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchWorkouts = async () => {
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
    }

    fetchWorkouts()
  }, [token])

  return { saved, setSaved, loading }
}
