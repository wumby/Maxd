import { Picker } from '@react-native-picker/picker'
import { Sheet, YStack, XStack, Button, Text } from 'tamagui'
import { useEffect, useState } from 'react'

export function DurationPickerSheet({
  open,
  onOpenChange,
  onConfirm,
  value = 0,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (totalSeconds: number) => void
  value?: number // new prop
}) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Set initial values from `value` when opening
  useEffect(() => {
    if (open) {
      const h = Math.floor(value / 3600)
      const m = Math.floor((value % 3600) / 60)
      const s = value % 60

      setHours(h)
      setMinutes(m)
      setSeconds(s)
    }
  }, [open, value])

  const handleConfirm = () => {
    const total = hours * 3600 + minutes * 60 + seconds
    onConfirm(total)
    onOpenChange(false)
  }

  const renderPickerItems = (range: number) =>
    Array.from({ length: range }, (_, i) => <Picker.Item key={i} label={`${i}`} value={i} />)

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[60]}
      dismissOnSnapToBottom
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="600" textAlign="center">
            Select Duration
          </Text>

          <XStack gap="$4" jc="space-between">
            <YStack flex={1}>
              <Text fontSize="$4" color="$gray10" textAlign="center">
                Hours
              </Text>
              <Picker
                selectedValue={hours}
                onValueChange={val => setHours(val)}
                style={{ color: 'white', backgroundColor: 'transparent' }}
              >
                {renderPickerItems(24)}
              </Picker>
            </YStack>

            <YStack flex={1}>
              <Text fontSize="$4" color="$gray10" textAlign="center">
                Minutes
              </Text>
              <Picker
                selectedValue={minutes}
                onValueChange={val => setMinutes(val)}
                style={{ color: 'white', backgroundColor: 'transparent' }}
              >
                {renderPickerItems(60)}
              </Picker>
            </YStack>

            <YStack flex={1}>
              <Text fontSize="$4" color="$gray10" textAlign="center">
                Seconds
              </Text>
              <Picker
                selectedValue={seconds}
                onValueChange={val => setSeconds(val)}
                style={{ color: 'white', backgroundColor: 'transparent' }}
              >
                {renderPickerItems(60)}
              </Picker>
            </YStack>
          </XStack>

          <Button onPress={handleConfirm}>Confirm</Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
