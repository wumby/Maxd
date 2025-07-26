import { API_URL } from '@/env'

export async function createWorkout(
  token: string | null,
  payload: {
    title: string
    created_at: string
    exercises: any[]
  }
) {
  if (!token) throw new Error('No token provided')

  const res = await fetch(`${API_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to save workout')
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

export async function createSavedExercise(
  token: string | null,
  payload: {
    name: string
    type: string
    sets: any[]
  }
) {
  if (!token) throw new Error('No token provided')

  const res = await fetch(`${API_URL}/saved-exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Failed to save favorite exercise')
  return await res.json()
}

export async function deleteWorkout(token: string | null, id: number) {
  if (!token) throw new Error('No token provided')

  const res = await fetch(`${API_URL}/workouts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to delete workout')
}

export async function fetchWorkouts(token: string) {
  const res = await fetch(`${API_URL}/workouts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch workouts')
  return await res.json()
}