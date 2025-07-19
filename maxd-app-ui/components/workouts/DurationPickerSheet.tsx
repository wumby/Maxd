import { useState } from 'react'
import { Sheet, YStack, XStack, ScrollView, Text, Button } from 'tamagui'

export function DurationPickerSheet({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  onConfirm: (duration: { hours: number; minutes: number; seconds: number }) => void
}) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const range = (count: number) => Array.from({ length: count }, (_, i) => i)

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[60]} dismissOnSnapToBottom>
      <Sheet.Frame p="$4" bg="$background">
        <Sheet.Handle />

        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="800" textAlign="center">
            Select Duration
          </Text>

          <XStack jc="space-between" gap="$4">
            {/* Hours */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ height: 150 }}>
              {range(24).map(h => (
                <Button
                  key={h}
                  chromeless
                  onPress={() => setHours(h)}
                  backgroundColor={h === hours ? '$gray5' : 'transparent'}
                >
                  {h}h
                </Button>
              ))}
            </ScrollView>

            {/* Minutes */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ height: 150 }}>
              {range(60).map(m => (
                <Button
                  key={m}
                  chromeless
                  onPress={() => setMinutes(m)}
                  backgroundColor={m === minutes ? '$gray5' : 'transparent'}
                >
                  {m}m
                </Button>
              ))}
            </ScrollView>

            {/* Seconds */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ height: 150 }}>
              {range(60).map(s => (
                <Button
                  key={s}
                  chromeless
                  onPress={() => setSeconds(s)}
                  backgroundColor={s === seconds ? '$gray5' : 'transparent'}
                >
                  {s}s
                </Button>
              ))}
            </ScrollView>
          </XStack>

          <Button
            size="$4"
            onPress={() => {
              onConfirm({ hours, minutes, seconds })
              onOpenChange(false)
            }}
          >
            Confirm
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
