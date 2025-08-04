import { useEffect, lazy, Suspense } from 'react'
import { fetchWeights } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'
import { useFetch } from '@/hooks/useFetch'

const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))
export default function MonthlyHistoryPage() {
  const { data: weights = [], execute: loadWeights } = useFetch(fetchWeights, [])

  useEffect(() => {
    loadWeights()
  }, [loadWeights])

  return (
    <Suspense fallback={<Fallback />}>
      <MonthlyHistory weights={weights} />
    </Suspense>
  )
}
