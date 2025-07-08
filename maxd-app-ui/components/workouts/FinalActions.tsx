import { XStack, Button } from 'tamagui'

export function FinalActions({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <XStack gap="$2" mt="$5">
      <Button flex={1} onPress={onCancel}>
        Cancel
      </Button>
      <Button flex={1} onPress={onSubmit} theme="active">
        Submit
      </Button>
    </XStack>
  )
}
