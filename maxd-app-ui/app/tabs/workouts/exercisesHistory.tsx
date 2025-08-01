import { useRouter } from 'expo-router'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { fetchWorkouts } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'
import { Fallback } from '@/components/Fallback'

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
    return <Fallback />
  }

  return (
    <Suspense fallback={<Fallback />}>
      <ExerciseHistory
        exercises={flattenedExercises}
        onClose={() => router.back()}
        setWorkouts={setWorkouts}
      />
    </Suspense>
  )
}
