import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { useRouter } from 'expo-router'
import { Fallback } from '@/components/Fallback'

const MonthlyChartWebView = lazy(() => import('@/components/weights/MonthlyChartWebView'))
export default function MonthlyChartPage() {
  const { token } = useAuth()
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

  return (
    <Suspense fallback={<Fallback />}>
      <MonthlyChartWebView weights={weights} />
    </Suspense>
  )
}
