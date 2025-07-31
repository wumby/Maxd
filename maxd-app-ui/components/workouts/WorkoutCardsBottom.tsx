import { Card, Text, XStack, YStack } from 'tamagui'
import { Expand } from '@tamagui/lucide-icons'
import { useMemo } from 'react'

interface Props {
  onWorkoutsPress: () => void
  onExercisesPress: () => void
  workouts?: { name?: string; created_at: string; exercises?: { name: string }[] }[]
}

export function WorkoutCardsBottom({ onWorkoutsPress, onExercisesPress, workouts = [] }: Props) {
  const latestThreeWorkouts = workouts.slice(0, 3)
  const latestExercises = useMemo(() => {
    return workouts
      .flatMap(w =>
        (w.exercises || []).map(ex => ({
          name: ex.name,
          date: w.created_at,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }, [workouts])

  return (
    <XStack w="100%" gap="$4" jc="center" fw="wrap">
      {/* Workouts Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        mih={160}
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onWorkoutsPress}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Workouts
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          {latestThreeWorkouts.length === 0 ? (
            <Text ta="center" fontSize="$3">
              Not enough workouts yet.
            </Text>
          ) : (
            <YStack gap="$2" width="100%">
              <XStack jc="space-between">
                <Text fontSize="$2" color="$gray10">
                  Date
                </Text>
                <Text fontSize="$2" color="$gray10">
                  Title
                </Text>
              </XStack>

              {latestThreeWorkouts.map((w, i) => {
                const date = new Date(w.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <XStack jc="space-between" key={i}>
                    <Text fontSize="$3">{date}</Text>
                    <Text fontSize="$3" numberOfLines={1}>
                      {w.name || 'Workout'}
                    </Text>
                  </XStack>
                )
              })}
            </YStack>
          )}
        </YStack>
      </Card>

      {/* Exercises Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        br="$5"
        bg="$background"
        mih={160}
        pressStyle={{ scale: 0.98 }}
        onPress={onExercisesPress}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Exercises
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          {latestExercises.length === 0 ? (
            <Text ta="center" fontSize="$3">
              No exercises yet.
            </Text>
          ) : (
            <YStack gap="$2" width="100%">
              <XStack jc="space-between">
                <Text fontSize="$2" color="$gray10">
                  Date
                </Text>
                <Text fontSize="$2" color="$gray10">
                  Name
                </Text>
              </XStack>

              {latestExercises.map((ex, i) => {
                const date = new Date(ex.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <XStack jc="space-between" key={i}>
                    <Text fontSize="$3">{date}</Text>
                    <Text fontSize="$3" numberOfLines={1}>
                      {ex.name}
                    </Text>
                  </XStack>
                )
              })}
            </YStack>
          )}
        </YStack>
      </Card>
    </XStack>
  )
}
