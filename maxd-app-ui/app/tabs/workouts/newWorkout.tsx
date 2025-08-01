import { useRouter, useGlobalSearchParams } from 'expo-router'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Fallback } from '@/components/Fallback'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWorkoutById } from '@/services/workoutService'

const NewWorkout = lazy(() => import('@/components/workouts/NewWorkout'))

export default function NewWorkoutPage() {
  const router = useRouter()
  const { workoutId } = useGlobalSearchParams()
  const { token } = useAuth()
  const [workoutToEdit, setWorkoutToEdit] = useState<any | null>(null)

  useEffect(() => {
    const loadWorkout = async () => {
      if (workoutId && token) {
        try {
          const workout = await fetchWorkoutById(token, Number(workoutId))
          setWorkoutToEdit(workout)
        } catch (err) {
          console.error('Failed to fetch workout for edit', err)
          router.back()
        }
      }
    }

    loadWorkout()
  }, [workoutId, token])

  return (
    <Suspense fallback={<Fallback />}>
      <ScreenContainer>
        <TabTransitionWrapper tabPosition={2}>
          <NewWorkout
            workoutToEdit={workoutToEdit}
            onCancel={() => router.back()}
            onSubmit={() => router.back()}
          />
        </TabTransitionWrapper>
      </ScreenContainer>
    </Suspense>
  )
}
