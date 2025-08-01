import { Sheet, YStack, Text, Input, XStack, Button } from 'tamagui'

export function EditWeightSheet({
  open,
  onOpenChange,
  weightUnit,
  value,
  onChange,
  onCancel,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  weightUnit: 'lb' | 'kg'
  value: string
  onChange: (val: string) => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[80]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="700" textAlign="center">
            Edit Weight
          </Text>
          <Input
            keyboardType="numeric"
            placeholder={weightUnit === 'lb' ? 'e.g. 175.5 (lb)' : 'e.g. 79.6 (kg)'}
            value={value}
            onChangeText={onChange}
            returnKeyType="done"
          />
          <XStack gap="$2">
            <Button flex={1} onPress={onCancel}>
              Cancel
            </Button>
            <Button flex={1} theme="active" onPress={onSave}>
              Save
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
