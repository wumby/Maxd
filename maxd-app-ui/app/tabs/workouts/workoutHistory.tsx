import { useRouter } from 'expo-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Spinner, YStack } from 'tamagui'
import { fetchWorkouts } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'

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
    return (
      <YStack f={1} jc="center" ai="center" bg={'$background'}>
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <Suspense fallback={ <YStack
      f={1}
      minHeight="100%"
      px="$4"
      bg="$background" // ✅ Important
      jc="center"
      ai="center"
      position="relative" // optional but helps anchor layout
    >
      <Spinner size="large" />
    </YStack>}>
      <WorkoutHistory
        workouts={workouts}
        onClose={() => router.back()}
        setWorkouts={setWorkouts}
      />
    </Suspense>
  )
}
