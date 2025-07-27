import { Card, Text, XStack, YStack } from 'tamagui'
import { Expand, Heart } from '@tamagui/lucide-icons'
import { useMemo } from 'react'

interface Props {
  workouts?: {
    created_at: string
    exercises?: {
      sets?: { weight?: number; reps?: number }[]
    }[]
  }[]
  savedWorkoutsCount: number
  savedExercisesCount: number
  onFavoritesPress: () => void
  onVolumePress: () => void
}

export function WorkoutCardsTop({
  workouts = [],
  savedWorkoutsCount,
  savedExercisesCount,
  onFavoritesPress,
  onVolumePress,
}: Props) {
  const totalVolume = useMemo(() => {
    return workouts.reduce((total, w) => {
      const workoutVolume = (w.exercises || []).reduce((wVol, ex) => {
        return (
          wVol +
          (ex.sets || []).reduce((sVol, set) => {
            const weight = set.weight || 0
            const reps = set.reps || 0
            return sVol + weight * reps
          }, 0)
        )
      }, 0)
      return total + workoutVolume
    }, 0)
  }, [workouts])

  return (
    <XStack w="100%" gap="$4" jc="center" fw="wrap" mb="$4">
      {/* Volume Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        mih={160}
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onVolumePress}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Volume
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          <YStack ai="center" jc="center" f={1}>
            <Text fontSize="$8" fontWeight="900">
              {Math.round(totalVolume).toLocaleString()}
            </Text>
            <Text fontSize="$3" color="$gray10">
              total lbs lifted
            </Text>
          </YStack>
        </YStack>
      </Card>

      {/* Favorites Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        mih={160}
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onFavoritesPress}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Favorites
            </Text>
            <Heart size="$1" color="$gray9" />
          </XStack>

          <YStack gap="$2">
            <XStack jc="space-between">
              <Text fontSize="$3">Saved Workouts</Text>
              <Text fontSize="$3" fontWeight="700">
                {savedWorkoutsCount}
              </Text>
            </XStack>
            <XStack jc="space-between">
              <Text fontSize="$3">Saved Exercises</Text>
              <Text fontSize="$3" fontWeight="700">
                {savedExercisesCount}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </XStack>
  )
}
