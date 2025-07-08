import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { FavoriteExerciseSheet } from './FavoriteExerciseSheet'

export function ExerciseControls({
  savedExercises,
  loading,
  onAddExercise,
  onAddFavoriteExercise,
}: {
  savedExercises: any[]
  loading: boolean
  onAddExercise: () => void
  onAddFavoriteExercise: (exercise: any) => void
}) {
  const [showExerciseSheet, setShowExerciseSheet] = useState(false)

  return (
    <XStack gap="$2" jc="space-between" flexWrap="wrap" alignItems="center">
      <Button onPress={onAddExercise}>+ Add Exercise</Button>
      <Text>or</Text>
      <YStack>
        <Button onPress={() => setShowExerciseSheet(true)}>+ From Favorites</Button>

        <FavoriteExerciseSheet
          open={showExerciseSheet}
          onOpenChange={setShowExerciseSheet}
          favorites={savedExercises}
          onSelect={onAddFavoriteExercise}
        />
      </YStack>
    </XStack>
  )
}
