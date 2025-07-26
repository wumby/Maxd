import { API_URL } from "@/env"


export async function deleteExercise(token: string | null, exerciseId: number) {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Delete failed:', res.status, errorText)
    throw new Error('Failed to delete exercise')
  }
}
