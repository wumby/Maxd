import { useState, useCallback, lazy, Suspense, useMemo } from 'react'
import { YStack, Text, Button, Spinner } from 'tamagui'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { ScreenContainer } from '@/components/ScreenContainer'
import { WorkoutCardsBottom } from '@/components/workouts/WorkoutCardsBottom'
import NewWorkout from '@/components/workouts/NewWorkout'
import { fetchWorkouts } from '@/services/workoutService'
import { WorkoutCardsTop } from '@/components/workouts/WorkoutCardsTop'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'

export default function WorkoutsTab() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { saved: savedWorkouts } = useSavedWorkouts()
  const { savedExercises } = useSavedExercises()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWorkouts(token!)
      setWorkouts(data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useFocusEffect(
    useCallback(() => {
      fetchData()
      return () => {}
    }, [fetchData])
  )

  const lastWorkout = workouts[0]

  if (loading) {
    return (
      <ScreenContainer>
        <YStack f={1} jc="center" ai="center"></YStack>
      </ScreenContainer>
    )
  }

  return (
    <>
      {!loading && (
        <ScreenContainer>
          <TabTransitionWrapper tabPosition={2}>
            <YStack f={1} jc="space-evenly" gap="$4">
              <WorkoutCardsTop
                workouts={workouts}
                savedWorkoutsCount={savedWorkouts.length}
                savedExercisesCount={savedExercises.length}
                onFavoritesPress={() => {}}
                onVolumePress={() => {}}
              />

              <YStack ai="center" gap="$6">
                <Text fontSize="$9" fontWeight="700">
                  Last: {lastWorkout?.title || 'None'}
                </Text>
                <Button size="$5" onPress={() => router.push('/tabs/workouts/newWorkout')}>
                  Log New Workout
                </Button>
              </YStack>

              <WorkoutCardsBottom
                key={workouts.length}
                workouts={workouts}
                onWorkoutsPress={() => router.push('/tabs/workouts/workoutHistory')}
                onExercisesPress={() => router.push('/tabs/workouts/exercisesHistory')}
              />
            </YStack>
          </TabTransitionWrapper>
        </ScreenContainer>
      )}
    </>
  )
}
