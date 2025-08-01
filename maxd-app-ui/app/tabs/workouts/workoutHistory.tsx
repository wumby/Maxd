import { useRouter } from 'expo-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Spinner, YStack } from 'tamagui'
import { fetchWorkouts } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'
import { Fallback } from '@/components/Fallback'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'))

export default function WorkoutHistoryScreen() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkouts(token!)
        setWorkouts(data)
      } catch (err) {
        console.error('Failed to fetch workouts:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  if (loading) {
    return <Fallback />
  }

  return (
    <Suspense fallback={<Fallback />}>
      <WorkoutHistory workouts={workouts} onClose={() => router.back()} setWorkouts={setWorkouts} />
    </Suspense>
  )
}
