import { XStack, Text, Input, Button, YStack } from 'tamagui'
import { Keyboard } from 'react-native'

export function WorkoutTitleHeader({
  title,
  onChangeTitle,
  onReset,
}: {
  title: string
  onChangeTitle: (text: string) => void
  onReset: () => void
}) {
  return (
    <YStack gap="$3">
      {/* Top row: title preview + reset */}
      <XStack jc="space-between" ai="center">
        <Text fontSize="$6" fontWeight="700">
          {title.trim()}
        </Text>

        {title.trim() && (
          <Button chromeless size="$2" onPress={onReset}>
            Reset
          </Button>
        )}
      </XStack>

      {/* Labeled workout title input */}
      <YStack>
        <Text fontSize="$2" color="$gray10" pb="$1">
          Workout Title
        </Text>
        <XStack ai="center">
          <Input
            flex={1}
            placeholder="Workout title"
            value={title}
            onChangeText={onChangeTitle}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            maxLength={20}
          />
        </XStack>
      </YStack>
    </YStack>
  )
}
