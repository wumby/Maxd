import { useRouter } from 'expo-router'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Spinner, YStack } from 'tamagui'
import { fetchWorkouts } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'

const ExerciseHistory = lazy(() => import('@/components/workouts/ExerciseHistory'))

export default function ExercisesPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkouts(token!)
        setWorkouts(data)
      } catch (err) {
        console.error('Failed to fetch workouts in ExercisesPage:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  const flattenedExercises = useMemo(() => {
    return workouts.flatMap(w =>
      (w.exercises || []).map((ex: any) => ({
        ...ex,
        created_at: w.created_at,
        workout_id: w.id,
      }))
    )
  }, [workouts])

  if (loading) {
    return (
      <YStack
        f={1}
        minHeight="100%"
        px="$4"
        bg="$background"
        jc="center"
        ai="center"
        position="relative"
      >
        <Spinner size="large" />
      </YStack>
    )
  }

  return (
    <Suspense
      fallback={
        <YStack
          f={1}
          minHeight="100%"
          px="$4"
          bg="$background"
          jc="center"
          ai="center"
          position="relative"
        >
          <Spinner size="large" />
        </YStack>
      }
    >
      <ExerciseHistory
        exercises={flattenedExercises}
        onClose={() => router.back()}
        setWorkouts={setWorkouts}
      />
    </Suspense>
  )
}
