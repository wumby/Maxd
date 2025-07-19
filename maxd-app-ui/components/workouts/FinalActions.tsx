import { useState } from 'react'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { XStack, YStack, Button, Text, Sheet, Separator, useThemeName } from 'tamagui'
import { Calendar, X } from '@tamagui/lucide-icons'

export function FinalActions({
  onCancel,
  onSubmit,
  workoutDate,
  setWorkoutDate,
}: {
  onCancel: () => void
  onSubmit: () => void
  workoutDate: Date
  setWorkoutDate: (date: Date) => void
}) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState(workoutDate)
  const theme = useThemeName()

  const handleConfirm = () => {
    console.log(tempDate)
    setWorkoutDate(tempDate)
    setShowDatePicker(false)
  }

  return (
    <YStack gap="$4" mt="$5" w="100%">
      {/* Date Picker Button */}
      <YStack w="100%">
        <Text fontSize="$2" color="$gray10" pb="$1">
          Workout Date
        </Text>
        <Button
          icon={Calendar}
          justifyContent="flex-start"
          onPress={() => {
            setTempDate(workoutDate)
            setShowDatePicker(true)
          }}
          chromeless
          borderWidth={1}
          borderColor="$gray5"
          borderRadius="$3"
          px="$3"
          py="$2"
        >
          <Text fontSize="$4">
            {workoutDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </Button>
      </YStack>

      {/* Submit / Cancel Buttons */}
      <XStack gap="$2">
        <Button flex={1} onPress={onCancel}>
          Cancel
        </Button>
        <Button flex={1} onPress={onSubmit} theme="active">
          Submit
        </Button>
      </XStack>

      {/* Date Picker Sheet */}
      <Sheet
        open={showDatePicker}
        onOpenChange={setShowDatePicker}
        snapPoints={[40]}
        dismissOnSnapToBottom
        modal
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" bg={'$background'}>
          <XStack jc="space-between" ai="center" mb="$3">
            <Button chromeless icon={X} onPress={() => setShowDatePicker(false)}>
              Cancel
            </Button>
            <Button onPress={handleConfirm}>Save</Button>
          </XStack>

          <Separator mb="$3" />

          <YStack f={1} ai="center" jc="center">
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
             onChange={(_, selectedDate) => {
              console.log(selectedDate)
  if (selectedDate) {
    setTempDate(selectedDate)
  }
}}

              maximumDate={new Date()}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}
