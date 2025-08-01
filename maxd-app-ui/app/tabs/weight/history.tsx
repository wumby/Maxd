import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWeights } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'
import { useRouter } from 'expo-router'

const History = lazy(() => import('@/components/weights/History'))

export default function HistoryPage() {
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

  return (
    <Suspense fallback={<Fallback />}>
      <History
        visible
        onClose={() => {
          router.back()
        }}
        weights={weights}
        setWeights={setWeights}
      />
    </Suspense>
  )
}
