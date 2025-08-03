import { YStack, Text } from 'tamagui'
import WorkoutHistory from './WorkoutHistory'

export default function FavoriteWorkoutHistory({
  workouts,
  onSelectWorkout,
}: {
  workouts: any[]
  onSelectWorkout: (w: any) => void
}) {
  return workouts.length === 0 ? (
    <YStack f={1} jc="center" ai="center" px="$4">
      <Text color="$gray10" fontSize="$5" textAlign="center">
        No favorite workouts found.
      </Text>
    </YStack>
  ) : (
    <WorkoutHistory workouts={workouts} onSelectWorkout={onSelectWorkout} />
  )
}
