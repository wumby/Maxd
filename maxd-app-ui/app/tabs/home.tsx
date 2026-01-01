import { useCallback, useMemo } from 'react'
import { Button, Text, XStack, Card, YStack } from 'tamagui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useAuth } from '@/contexts/AuthContext'
import { useFocusEffect, useRouter } from 'expo-router'
import { Dumbbell, Scale } from '@tamagui/lucide-icons'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { useFetch } from '@/hooks/useFetch'
import { fetchWeights } from '@/services/weightService'
import { WeightEntry } from '@/types/Weight'
import { useWorkouts } from '@/hooks/useWorkouts'

export default function HomeTab() {
  const { user } = useAuth()
  const router = useRouter()
  const { weightUnit } = usePreferences()
  const {
    data: weights = [],
    execute: loadWeights,
    loading: weightsLoading,
  } = useFetch<WeightEntry[]>(fetchWeights, [])
  const { workouts, loading: workoutsLoading } = useWorkouts('30d')

  useFocusEffect(
    useCallback(() => {
      loadWeights().catch(err => console.error('Failed to load weights', err))
    }, [loadWeights])
  )

  const convertWeight = useCallback(
    (value?: number | null) => {
      if (value === undefined || value === null || Number.isNaN(value)) return null
      return weightUnit === 'lb' ? WeightUtil.kgToLbs(value) : value
    },
    [weightUnit]
  )

  const currentWeightValue = useMemo(
    () => convertWeight(weights[0]?.value),
    [weights, convertWeight]
  )
  const previousWeightValue = useMemo(
    () => convertWeight(weights[1]?.value),
    [weights, convertWeight]
  )

  const currentWeightLabel =
    currentWeightValue !== null ? `${currentWeightValue.toFixed(1)} ${weightUnit}` : 'Log your first weight'

  const weightDelta =
    currentWeightValue !== null && previousWeightValue !== null
      ? currentWeightValue - previousWeightValue
      : null

  const weightDeltaLabel =
    weightDelta === null
      ? 'Add another entry to see change'
      : weightDelta === 0
      ? 'No change since last entry'
      : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} ${weightUnit}`

  const lastWeightDate = weights[0]?.created_at ? formatDate(weights[0].created_at) : '---'

  const { workoutsThisWeek, weeklyVolume } = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    let count = 0
    let volume = 0

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.created_at)
      if (Number.isNaN(workoutDate.getTime())) return
      if (workoutDate >= sevenDaysAgo) {
        count += 1
        volume += calculateWorkoutVolume(workout)
      }
    })

    return { workoutsThisWeek: count, weeklyVolume: volume }
  }, [workouts])

  const lastWorkout = workouts[0]
  const lastWorkoutTitle = lastWorkout?.title || 'No workouts logged yet'
  const lastWorkoutDate = lastWorkout?.created_at ? formatDate(lastWorkout.created_at) : '---'
  const lastWorkoutExerciseCount = lastWorkout?.exercises?.length ?? 0
  const lastWorkoutSets =
    lastWorkout?.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) ?? 0

  const workoutsSummary = workoutsLoading
    ? 'Loading...'
    : `${workoutsThisWeek} in the last 7 days`
  const volumeSummary = workoutsLoading
    ? '--'
    : `${Math.round(weeklyVolume).toLocaleString()} lbs`

  const goalSummary = useMemo(() => {
    if (!user?.goal_mode) return 'No goal set'
    switch (user.goal_mode) {
      case 'lose':
        return 'Cutting'
      case 'gain':
        return 'Bulking'
      default:
        return 'Maintaining'
    }
  }, [user])

  const goalDetail =
    goalSummary === 'No goal set'
      ? 'Set a goal in your profile to track progress.'
      : goalSummary === 'Cutting'
      ? 'Focus on calorie deficit and consistent cardio.'
      : goalSummary === 'Bulking'
      ? 'Increase intake and hit progressive overload.'
      : 'Keep logging to stay on track.'

  return (
    <ScreenContainer>
      <TabTransitionWrapper tabPosition={0}>
        <YStack gap="$5" pb="$6">
          <YStack ai="center" gap="$2" mt="$4">
            <Text fontSize="$10" fontWeight="900" color="$accentColor">
              Maxd
            </Text>
            <Text fontSize="$6" ta="center" color="$color">
              {user?.name ? `Welcome, ${user.name}` : 'Let’s get stronger.'}
            </Text>
          </YStack>

          <YStack px="$4" gap="$3">
            <XStack w="100%" gap="$4" jc="center" fw="wrap">
              <Card width="45%" p="$4" elevate br="$5" minHeight={190}>
                <YStack f={1} gap="$2" jc="space-between">
                  <YStack gap="$1">
                    <Text fontSize="$3" color="$gray10">
                      Current Weight
                    </Text>
                    <Text fontSize="$7" fontWeight="800">
                      {weightsLoading ? 'Loading...' : currentWeightLabel}
                    </Text>
                  </YStack>
                  <Text fontSize="$3" color="$gray10" numberOfLines={2}>
                    {weightDeltaLabel}
                  </Text>
                  <Text fontSize="$2" color="$gray9">
                    Last logged: {lastWeightDate}
                  </Text>
                </YStack>
              </Card>

              <Card width="45%" p="$4" elevate br="$5" minHeight={190}>
                <YStack f={1} gap="$2" jc="space-between">
                  <YStack gap="$1">
                    <Text fontSize="$3" color="$gray10">
                      Workouts
                    </Text>
                    <Text fontSize="$7" fontWeight="800">
                      {workoutsSummary}
                    </Text>
                  </YStack>
                  <Text fontSize="$3" color="$gray10">
                    Volume: {volumeSummary}
                  </Text>
                  <Text fontSize="$2" color="$gray9">
                    Last workout: {lastWorkoutDate}
                  </Text>
                </YStack>
              </Card>
            </XStack>

            <XStack gap="$3" mt="$4" mb="$2">
              <Button
                flex={1}
                size="$4"
                onPress={() => router.push('/tabs/weight/newWeight')}
                icon={<Scale size={18} />}
              >
                New Weight
              </Button>
              <Button
                flex={1}
                size="$4"
                onPress={() => router.push('/tabs/workouts/newWorkout')}
                icon={<Dumbbell size={18} />}
              >
                New Workout
              </Button>
            </XStack>

            <XStack w="100%" gap="$4" jc="center" fw="wrap" mt="$2">
              <Card width="45%" p="$4" elevate br="$5" minHeight={190}>
                <YStack f={1} gap="$2" jc="space-between">
                  <YStack gap="$1">
                    <Text fontSize="$3" color="$gray10">
                      Last Workout
                    </Text>
                    <Text fontSize="$6" fontWeight="700" numberOfLines={2}>
                      {lastWorkoutTitle}
                    </Text>
                  </YStack>
                  <Text fontSize="$3" color="$gray10" numberOfLines={3}>
                    {lastWorkout
                      ? `${lastWorkoutExerciseCount} exercises • ${lastWorkoutSets} sets on ${lastWorkoutDate}`
                      : 'Start logging workouts to see more detail.'}
                  </Text>
                </YStack>
              </Card>

              <Card width="45%" p="$4" elevate br="$5" minHeight={190}>
                <YStack f={1} gap="$2" jc="space-between">
                  <YStack gap="$1">
                    <Text fontSize="$3" color="$gray10">
                      Upcoming Goals
                    </Text>
                    <Text fontSize="$6" fontWeight="700">
                      {goalSummary}
                    </Text>
                  </YStack>
                  <Text fontSize="$3" color="$gray10">
                    {goalDetail}
                  </Text>
                </YStack>
              </Card>
            </XStack>
          </YStack>
        </YStack>
      </TabTransitionWrapper>
    </ScreenContainer>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function calculateWorkoutVolume(workout: any) {
  return (workout.exercises || []).reduce((total: number, exercise: any) => {
    if (exercise.type === 'cardio') return total
    if (exercise.type === 'bodyweight') {
      const reps = (exercise.sets || []).reduce(
        (sum: number, set: any) => sum + (Number(set.reps) || 0),
        0
      )
      return total + reps
    }
    const volume = (exercise.sets || []).reduce((sum: number, set: any) => {
      const weight = Number(set.weight) || 0
      const reps = Number(set.reps) || 0
      return sum + weight * reps
    }, 0)
    return total + volume
  }, 0)
}
