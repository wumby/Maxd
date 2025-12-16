import { Sheet } from '@tamagui/sheet'
import { Button, Text, YStack } from 'tamagui'
import { Pencil, Trash2, Star, StarOff } from '@tamagui/lucide-icons'

interface ExerciseActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
  exerciseName: string
}

export function ExerciseActionSheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorite,
  exerciseName,
}: ExerciseActionSheetProps) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[60]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="700" ta="center" mb="$6">
            {exerciseName || 'Exercise'}
          </Text>

          <Button size="$5" onPress={onToggleFavorite} icon={isFavorite ? StarOff : Star}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>

          <Button size="$5" onPress={onEdit} icon={Pencil}>
            Edit Exercise
          </Button>

          <Button size="$5" theme="red" onPress={onDelete} icon={Trash2}>
            Delete Exercise
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
