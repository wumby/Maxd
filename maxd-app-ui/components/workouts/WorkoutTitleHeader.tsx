import { XStack, Text, Input, YStack } from 'tamagui'
import { Keyboard } from 'react-native'

export function WorkoutTitleHeader({
  title,
  onChangeTitle,
}: {
  title: string
  onChangeTitle: (text: string) => void
}) {
  return (
    <YStack gap="$3">
      {/* Top row: title preview + reset */}
      <XStack jc="space-between" ai="center">
        <Text fontSize="$6" fontWeight="700">
          {title.trim()}
        </Text>
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
