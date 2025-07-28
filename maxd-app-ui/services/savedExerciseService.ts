import { API_URL } from "@/env"

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


export async function deleteSavedExercise(token: string | null, id: number) {
  if (!token) throw new Error('No token provided')

  const res = await fetch(`${API_URL}/saved-exercises/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to delete favorite exercise')
  return true
}
