import { Sheet, YStack, Text, Button } from 'tamagui'
import { Pencil, Trash2 } from '@tamagui/lucide-icons'

export function WeightActionSheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  dateLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  dateLabel?: string
}) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[70]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="700" ta="center" mb="$4">
            {dateLabel || 'Weight Entry'}
          </Text>

          <Button size="$5" onPress={onEdit} icon={Pencil}>
            Edit Entry
          </Button>

          <Button size="$5" theme="red" onPress={onDelete} icon={Trash2}>
            Delete Entry
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
