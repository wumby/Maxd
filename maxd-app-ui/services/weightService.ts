import { API_URL } from '@/env'
import { WeightEntry } from '@/types/Weight'

export async function fetchWeights(token: string, _params: void): Promise<WeightEntry[]> {
  const res = await fetch(`${API_URL}/weights`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error?.error || 'Failed to fetch weights')
  }

  const data = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format')
  }

  return data.map(w => ({
    ...w,
    value: typeof w.value === 'string' ? parseFloat(w.value) : w.value,
  }))
}

export async function logWeight(
  token: string,
  { weightInKg, date }: { weightInKg: number; date: string }
) {
  const res = await fetch(`${API_URL}/weights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value: weightInKg, date }),
  })

  const data = await res.json()

  if (res.status === 409) {
    throw new Error('You already logged a weight for this date')
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to log weight')
  }

  return data
}

export async function updateGoalMode(token: string, goalMode: 'lose' | 'gain' | 'track') {
  if (!token) throw new Error('Missing token')

  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ goal_mode: goalMode }),
  })

  const text = await res.text()
  if (!res.ok) throw new Error(text)

  return JSON.parse(text)
}

export async function deleteWeightEntry(token: string, id: number) {
  const res = await fetch(`${API_URL}/weights/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error?.error || 'Failed to delete weight')
  }
}

export async function updateWeightEntry(token: string, id: number, value: number) {
  const res = await fetch(`${API_URL}/weights/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to update weight')
  }

  return data
}
