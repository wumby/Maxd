import { useEffect, lazy, Suspense } from 'react'
import { fetchWeights } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'
import { useFetch } from '@/hooks/useFetch'

const MonthlyChartWebView = lazy(() => import('@/components/weights/MonthlyChartWebView'))
export default function MonthlyChartPage() {
  const { data: weights = [], execute: loadWeights } = useFetch(fetchWeights, [])

  useEffect(() => {
    loadWeights()
  }, [loadWeights])

  return (
    <Suspense fallback={<Fallback />}>
      <MonthlyChartWebView weights={weights} />
    </Suspense>
  )
}
