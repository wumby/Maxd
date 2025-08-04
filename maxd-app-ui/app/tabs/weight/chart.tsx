import { useEffect, lazy, Suspense } from 'react'
import { fetchWeights } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'
import { useFetch } from '@/hooks/useFetch'

const ChartWebView = lazy(() => import('@/components/weights/ChartWebView'))

export default function ChartPage() {
  const { data: weights = [], execute: loadWeights } = useFetch(fetchWeights, [])

  useEffect(() => {
    loadWeights()
  }, [loadWeights])

  return (
    <Suspense fallback={<Fallback />}>
      <ChartWebView weights={weights} />
    </Suspense>
  )
}
