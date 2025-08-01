import { useState, useEffect } from 'react'
import MonthlyChartWebView from '@/components/weights/MonthlyChartWebView'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { useRouter } from 'expo-router'

export default function MonthlyChartPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [weights, setWeights] = useState<{ value: number; created_at: string }[]>([])

  useEffect(() => {
    if (!token) return
    const loadWeights = async () => {
      try {
        const data = await fetchWeights(token)
        setWeights(data)
      } catch (err) {
        console.error('Error loading weights:', err)
        setWeights([])
      }
    }
    loadWeights()
  }, [token])

  return <MonthlyChartWebView weights={weights} onBack={() => router.back()} />
}
