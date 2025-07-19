import { Sheet, YStack, Button, Text } from 'tamagui'

const DISTANCE_UNITS = ['mi', 'km', 'm', 'steps']

export function DistanceUnitSheet({
  open,
  onOpenChange,
  onSelect,
  current,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (unit: string) => void
  current?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[50]} dismissOnSnapToBottom modal>
      <Sheet.Handle />
      <Sheet.Overlay />
      <Sheet.Frame bg="$background" p="$4">
        <YStack gap="$3">
          <Text fontSize="$7" fontWeight="600" ta="center" mb="$3">
            Select Distance Unit
          </Text>
          {DISTANCE_UNITS.map(unit => (
            <Button
              key={unit}
              size="$4"
              onPress={() => {
                onSelect(unit)
                onOpenChange(false)
              }}
            >
              {unit}
            </Button>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
