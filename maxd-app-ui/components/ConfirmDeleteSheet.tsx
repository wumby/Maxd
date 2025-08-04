import { Sheet, YStack, Text, XStack, Button } from 'tamagui'

export function ConfirmDeleteSheet({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = 'Delete',
  message = 'Are you sure you want to delete this item?',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
}) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[70]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="700" textAlign="center">
            {title}
          </Text>
          <Text color="$gray10" textAlign="center">
            {message}
          </Text>
          <XStack gap="$2" mt={'$4'}>
            <Button flex={1} onPress={onCancel}>
              Cancel
            </Button>
            <Button flex={1} theme="active" onPress={onConfirm}>
              Delete
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
