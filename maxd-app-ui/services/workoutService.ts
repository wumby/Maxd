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

export async function fetchWorkouts(
  token: string,
  params?: { range?: string; year?: string | null; name?: string | null }
) {
  const query = new URLSearchParams()
  if (params?.range && params.range !== 'all') query.append('range', params.range)
  if (params?.year) query.append('year', params.year)
  if (params?.name) query.append('name', params.name)

  const url = `${API_URL}/workouts${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch workouts')
  return await res.json()
}

export async function fetchWorkoutById(token: string | null, id: number) {
  if (!token) throw new Error('No token provided')
  const res = await fetch(`${API_URL}/workouts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch workout')
  return await res.json()
}

export async function updateWorkout(
  token: string | null,
  id: number,
  payload: {
    title: string
    created_at: string
    exercises: any[]
  }
) {
  if (!token) throw new Error('No token provided')
  const res = await fetch(`${API_URL}/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update workout')
  return await res.json()
}
