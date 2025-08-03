import { Sheet, YStack, Text, Button, XStack } from 'tamagui'
import { Star, StarOff, Pencil, Trash2 } from '@tamagui/lucide-icons'

export function WorkoutActionSheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorite,
  workoutTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
  workoutTitle: string
}) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[60]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="700" ta="center" mb="$6">
            {workoutTitle || 'Workout'}
          </Text>

          <Button size="$5" onPress={onToggleFavorite} icon={isFavorite ? StarOff : Star}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>

          <Button size="$5" onPress={onEdit} icon={Pencil}>
            Edit Workout
          </Button>

          <Button size="$5" theme="red" onPress={onDelete} icon={Trash2}>
            Delete Workout
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
