import { Plus, Star } from '@tamagui/lucide-icons'
import { Button, Text, XStack, YStack } from 'tamagui'

export function WorkoutModeChooser({
  onChooseNew,
  onChooseFavorite,
  feedback,
}: {
  onChooseNew: () => void
  onChooseFavorite: () => void
  feedback?: string
}) {
  return (
    <YStack gap="$5" ai="center" jc="center" p="$4" mt="$2">
      {/* Action Buttons */}
      <XStack gap="$4" w="100%">
        <Button
          size="$5"
          flex={1}
          paddingVertical="$3"
          icon={Plus}
          iconAfter={false}
          onPress={onChooseNew}
        >
          New
        </Button>
        <Button
          size="$5"
          flex={1}
          paddingVertical="$3"
          icon={Star}
          iconAfter={false}
          onPress={onChooseFavorite}
        >
          Favorite
        </Button>
      </XStack>

      <Text fontSize="$4" color="$gray10" textAlign="center">
        Log a new workout by creating a new one or selecting from favorites.
      </Text>

      {feedback && (
        <Text color="$red10" fontSize="$4" textAlign="center" mt="$3">
          {feedback}
        </Text>
      )}
    </YStack>
  )
}
