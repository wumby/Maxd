import { useState, useEffect } from 'react'
import MonthlyHistory from '@/components/weights/MonthlyHistory'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { useRouter } from 'expo-router'

export default function MonthlyHistoryPage() {
  const { token } = useAuth()
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const router = useRouter()
  useEffect(() => {
    if (!token) return
    const loadWeights = async () => {
      try {
        const data = await fetchWeights(token)
        setWeights(data)
      } catch (err) {
        console.error('Error fetching weights:', err)
        setWeights([])
      }
    }
    loadWeights()
  }, [token])

  return <MonthlyHistory visible onClose={() => router.back()} weights={weights} />
}
