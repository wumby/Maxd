import { useEffect, useState, useCallback } from 'react'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'

type TimeRange = 'all' | '3mo' | '30d'

export function useWorkouts(
  initialRange: TimeRange = '3mo',
  initialYear: string | null = null,
  initialName: string | null = null
) {
  const { token } = useAuth()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<TimeRange>(initialRange)
  const [year, setYear] = useState<string | null>(initialYear)
  const [workoutNameFilter, setWorkoutNameFilter] = useState<string | null>(initialName)

  const fetchWorkouts = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (range !== 'all') query.append('range', range)
      if (year) query.append('year', year)
      if (workoutNameFilter) query.append('name', workoutNameFilter)

      const queryString = query.toString()
      const url = `${API_URL}/workouts${queryString ? `?${queryString}` : ''}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setWorkouts(data)
    } catch (err) {
      console.error('Failed to fetch workouts', err)
    } finally {
      setLoading(false)
    }
  }, [token, range, year, workoutNameFilter])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return {
    workouts,
    setWorkouts,
    loading,
    refreshWorkouts: fetchWorkouts,
    range,
    setRange,
    year,
    setYear,
    workoutNameFilter,
    setWorkoutNameFilter,
  }
}
