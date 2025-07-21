import { useState, useCallback, lazy, Suspense, useMemo } from 'react'
import { YStack, Text, Button, Spinner } from 'tamagui'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { ScreenContainer } from '@/components/ScreenContainer'
import { WorkoutCardsBottom } from '@/components/workouts/WorkoutCardsBottom'
import NewWorkout from '@/components/workouts/NewWorkout'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'));
const ExerciseHistory = lazy(() => import('@/components/workouts/ExerciseHistory'));

export default function WorkoutsTab() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'new' | 'workouts' | 'exercises' | null>(null)
  const { token } = useAuth();
  const params = useLocalSearchParams()

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setWorkouts(data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useFocusEffect(
    useCallback(() => {
      if (params?.log === '1') {
        setViewMode('new')
        router.replace('/tabs/workouts')
      }
    }, [params?.log])
  )

  useFocusEffect(
    useCallback(() => {
      setViewMode(null)
      fetchWorkouts()

      return () => {
        setViewMode(null)
      }
    }, [fetchWorkouts])
  )

  const lastWorkout = workouts[0]
  const flattenedExercises = useMemo(() => {
    return workouts.flatMap(w =>
      (w.exercises || []).map((ex: any) => ({
        ...ex,
        created_at: w.created_at,
      }))
    )
  }, [workouts])

  if (loading) {
    return (
      <ScreenContainer>
        <YStack f={1} jc="center" ai="center">
        </YStack>
      </ScreenContainer>
    )
  }

  return (
    <>
      {(viewMode === null && !loading) && (
        <ScreenContainer>
          <YStack f={1} jc="space-evenly" gap="$4">
            <Text>I want my cards here</Text>

            <YStack ai="center" gap="$6">
              <Text fontSize="$9" fontWeight="700">
                Last: {lastWorkout?.title || 'None'}
              </Text>
              <Button size="$5" onPress={() => setViewMode('new')}>
                Log New Workout
              </Button>
            </YStack>

            <WorkoutCardsBottom
              key={workouts.length}
              workouts={workouts}
              onWorkoutsPress={() => setViewMode('workouts')}
              onExercisesPress={() => setViewMode('exercises')}
            />
          </YStack>
        </ScreenContainer>
      )}

    {viewMode === 'workouts' && (
  <ScreenContainer>
    <Suspense fallback={ <YStack
      f={1}
      minHeight="100%"
      px="$4"
      bg="$background"
      jc="center"
      ai="center"
    >
      <Spinner size="large" />
    </YStack>}>
      <WorkoutHistory workouts={workouts} onClose={() => setViewMode(null)} />
    </Suspense>
  </ScreenContainer>
)}



      {viewMode === 'exercises' && (
        <Suspense fallback={<YStack
      f={1}
      minHeight="100%"
      px="$4"
      bg="$background"
      jc="center"
      ai="center"
    >
      <Spinner size="large" />
    </YStack>}>
          <ExerciseHistory exercises={flattenedExercises} onClose={() => setViewMode(null)} />
        </Suspense>
      )}

      {viewMode === 'new' && (
        <Suspense fallback={<Text p="$4">Loading New Workout...</Text>}>
          <NewWorkout
            onCancel={() => setViewMode(null)}
            onSubmit={() => {
              setViewMode(null)
              fetchWorkouts()
            }}
          />
        </Suspense>
      )}
    </>
  )
}
