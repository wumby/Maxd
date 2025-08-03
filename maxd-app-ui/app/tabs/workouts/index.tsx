import { useCallback, useRef } from 'react'
import { YStack, Text, Button } from 'tamagui'
import { useFocusEffect, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { ScreenContainer } from '@/components/ScreenContainer'
import { WorkoutCardsBottom } from '@/components/workouts/WorkoutCardsBottom'
import { WorkoutCardsTop } from '@/components/workouts/WorkoutCardsTop'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { useWorkouts } from '@/hooks/useWorkouts'
import { Fallback } from '@/components/Fallback'

export default function WorkoutsTab() {
  const router = useRouter()
  const { token } = useAuth()
  const { saved: savedWorkouts } = useSavedWorkouts()
  const { savedExercises } = useSavedExercises()
  const { workouts, loading, refreshWorkouts } = useWorkouts()
  const shouldRefresh = useRef(true)

  useFocusEffect(
    useCallback(() => {
      if (!token || !shouldRefresh.current) return
      refreshWorkouts()
      shouldRefresh.current = false
    }, [token, refreshWorkouts])
  )

  const lastWorkout = workouts[0]

  if (loading) {
    return (
      <ScreenContainer>
        <Fallback />
      </ScreenContainer>
    )
  }

  return (
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
  )
}
