import { Sheet, XStack, YStack, Separator, Button } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

export function DatePickerSheet({
  open,
  onOpenChange,
  tempDate,
  setTempDate,
  setSelectedDate,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  tempDate: Date
  setTempDate: (date: Date) => void
  setSelectedDate: (date: Date) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[50]} dismissOnSnapToBottom modal>
      
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame bg="$background" p="$4">
        <XStack jc="space-between" ai="center" mb="$3">
          <Button chromeless icon={X} onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              setSelectedDate(tempDate)
              onOpenChange(false)
            }}
          >
            Done
          </Button>
        </XStack>

        <Separator mb="$3" />

        <YStack f={1} ai="center" jc="center">
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              if (date) setTempDate(date)
            }}
            style={{ width: 300 }}
            maximumDate={new Date()}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
