import { XStack, Text, Input, Button } from 'tamagui'
import { Keyboard } from 'react-native'

export function WorkoutTitleHeader({
  title,
  onChangeTitle,
  onReset,
  isFavorited,
  onFavorite,
}: {
  title: string
  onChangeTitle: (text: string) => void
  onReset: () => void
  isFavorited: boolean
  onFavorite: () => void
}) {
  return (
    <>
      <XStack jc="space-between" ai="center">
        <XStack ai="center" gap="$2">
          <Text fontSize="$6" fontWeight="700">
            {title.trim() ? title.trim() : ''}
          </Text>
          {title.trim().length > 0 && (
            <Button
              chromeless
              size="$4"
              icon={() => <Text fontSize="$6">{isFavorited ? '★' : '☆'}</Text>}
              onPress={onFavorite}
              disabled={isFavorited}
              accessibilityLabel="Favorite workout"
            />
          )}
        </XStack>

        {title.trim() && (
          <Button chromeless size="$2" onPress={onReset}>
            Reset
          </Button>
        )}
      </XStack>

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
    </>
  )
}
