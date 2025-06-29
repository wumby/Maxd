import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'

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
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <XStack gap="$2" jc="space-between" flexWrap="wrap" alignItems="center">
      <Button onPress={onAddExercise}>+ Add Exercise</Button>
      <Text>or</Text>

      <YStack>
        <Button onPress={() => setShowDropdown(!showDropdown)}>+ From Favorites</Button>

        {showDropdown && (
          <YStack
            mt="$2"
            bg="$background"
            borderWidth={1}
            borderColor="$gray6"
            borderRadius="$3"
            p="$2"
            gap="$2"
            maxHeight={200}
            overflow="scroll"
            zIndex={100}
          >
            {loading ? (
              <Text>Loading...</Text>
            ) : savedExercises.length > 0 ? (
              savedExercises.map((ex, i) => (
                <Button
                  key={i}
                  size="$2"
                  chromeless
                  onPress={() => {
                    onAddFavoriteExercise(ex)
                    setShowDropdown(false)
                  }}
                >
                  {ex.name}
                </Button>
              ))
            ) : (
              <Text color="$gray10" fontSize="$4" textAlign="center">
                No favorites yet.
              </Text>
            )}
          </YStack>
        )}
      </YStack>
    </XStack>
  )
}
