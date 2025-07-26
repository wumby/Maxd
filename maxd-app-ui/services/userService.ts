import { API_URL } from '@/env'

export async function updateUserProfile(token: string, name: string, email: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email }),
  })

  if (!res.ok) throw new Error('Failed to update profile')

  return await res.json()
}

export async function deleteUserProfile(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Failed to delete account')
}
