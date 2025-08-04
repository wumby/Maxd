import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'

const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))
export default function MonthlyHistoryPage() {
  const { token } = useAuth()
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
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

  return (
    <Suspense fallback={<Fallback />}>
      <MonthlyHistory weights={weights} />
    </Suspense>
  )
}
