import { Sheet } from '@tamagui/sheet'
import { Button, Text, YStack } from 'tamagui'

export type ExerciseType = 'weights' | 'bodyweight' | 'cardio'

export function ExerciseTypeSheet({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: ExerciseType) => void
}) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="800" textAlign="center">
            Select Exercise Type
          </Text>

          {(['weights', 'bodyweight', 'cardio'] as const).map(type => (
            <Button
              key={type}
              size="$4"
              onPress={() => {
                onSelect(type)
                onOpenChange(false)
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
