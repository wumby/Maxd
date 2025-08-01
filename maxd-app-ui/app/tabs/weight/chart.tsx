import { useEffect, useState, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { useRouter } from 'expo-router'
import { Fallback } from '@/components/Fallback'

const ChartWebView = lazy(() => import('@/components/weights/ChartWebView'))

export default function ChartPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [weights, setWeights] = useState<{ value: number; created_at: string }[]>([])

  useEffect(() => {
    if (!token) return
    const loadWeights = async () => {
      try {
        const data = await fetchWeights(token)
        setWeights(data)
      } catch (error) {
        console.error('Error loading weights:', error)
        setWeights([])
      }
    }
    loadWeights()
  }, [token])

  return (
    <Suspense fallback={<Fallback />}>
      <ChartWebView weights={weights} onBack={() => router.back()} />
    </Suspense>
  )
}
