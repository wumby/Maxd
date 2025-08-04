import { API_URL } from '@/env'

export async function getSavedWorkouts(token: string) {
  const res = await fetch(`${API_URL}/saved-workouts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch saved workouts')
  return await res.json()
}

export async function createSavedWorkout(
  token: string | null,
  payload: {
    title: string
    exercises: any[]
  }
) {
  if (!token) throw new Error('No token provided')

  const res = await fetch(`${API_URL}/saved-workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to save favorite workout')
  return await res.json()
}

export async function deleteSavedWorkout(token: string, title: string) {
  const res = await fetch(`${API_URL}/saved-workouts/${encodeURIComponent(title)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to delete saved workout')
}
