import { Sheet, YStack, Text, Button } from 'tamagui'
import { widgetRegistry, WidgetType } from '@/components/WidgetRegistry'

type Props = {
  visible: boolean
  onClose: () => void
  onAdd: (type: WidgetType) => void
  existingTypes: WidgetType[]
}

export function AddWidgetModal({ visible, onClose, onAdd, existingTypes }: Props) {
  const available = Object.keys(widgetRegistry).filter(
    (type) => !existingTypes.includes(type as WidgetType)
  ) as WidgetType[]

  return (
    <Sheet
      open={visible}
      onOpenChange={(open: any) => {
        if (!open) onClose()
      }}
      snapPoints={[50]}
      dismissOnSnapToBottom
      modal
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" gap="$4">
        <Text fontSize="$6" fontWeight="700">
          Add Widget
        </Text>
        <YStack gap="$3">
          {available.length === 0 && (
            <Text color="$gray10">All available widgets are already added.</Text>
          )}
          {available.map((type) => (
            <Button
              key={type}
              onPress={() => onAdd(type)}
              size="$4"
              br="$4"
            >
              Add {type}
            </Button>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
