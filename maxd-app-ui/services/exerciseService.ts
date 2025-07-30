import { API_URL } from '@/env'

export async function deleteExercise(token: string | null, exerciseId: number) {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Delete failed:', res.status, errorText)
    throw new Error('Failed to delete exercise')
  }
}
export async function editExercise(token: string | null, id: number, data: any) {
  const cleanedSets = data.sets.map((set: any) => ({
    reps: isFinite(parseInt(set.reps)) ? parseInt(set.reps) : null,
    weight: isFinite(parseFloat(set.weight)) ? parseFloat(set.weight) : null,
    distance: isFinite(parseFloat(set.distance)) ? parseFloat(set.distance) : null,
    distance_unit: set.distance_unit || null,
    duration: isFinite(set.duration) ? set.duration : null,
  }))

  const payload = {
    name: data.name,
    type: data.type,
    sets: cleanedSets,
  }

  const res = await fetch(`${API_URL}/exercises/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('Edit failed:', res.status, error)
    throw new Error('Failed to edit exercise')
  }

  return await res.json()
}

