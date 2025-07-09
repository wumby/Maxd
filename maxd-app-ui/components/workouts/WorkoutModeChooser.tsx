import { Plus, Star, Calendar, X } from '@tamagui/lucide-icons'
import { Button, Text, XStack, YStack, Separator, Sheet } from 'tamagui'
import { useState } from 'react'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

export function WorkoutModeChooser({
  onChooseNew,
  onChooseFavorite,
  feedback,
  workoutDate,
  setWorkoutDate,
}: {
  onChooseNew: () => void
  onChooseFavorite: () => void
  feedback?: string
  workoutDate: Date
  setWorkoutDate: (date: Date) => void
}) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState(workoutDate)

  const handleConfirm = () => {
    setWorkoutDate(tempDate)
    setShowDatePicker(false)
  }

  return (
    <YStack gap="$5" ai="center" jc="center" p="$4" mt="$2">
      {/* Workout Date Selector */}
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

      {/* Action Buttons */}
      <XStack gap="$4" w="100%">
        <Button
          size="$5"
          flex={1}
          paddingVertical="$3"
          icon={Plus}
          iconAfter={false}
          onPress={onChooseNew}
        >
          New
        </Button>
        <Button
          size="$5"
          flex={1}
          paddingVertical="$3"
          icon={Star}
          iconAfter={false}
          onPress={onChooseFavorite}
        >
          Favorite
        </Button>
      </XStack>

      <Text fontSize="$4" color="$gray10" textAlign="center">
        Log new workout by selecting the date and creating a new one or select from favorites.
      </Text>

      {feedback && (
        <Text color="$red10" fontSize="$4" textAlign="center" mt="$3">
          {feedback}
        </Text>
      )}
    <Sheet
  open={showDatePicker}
  onOpenChange={setShowDatePicker}
  snapPoints={[40]} 
  dismissOnSnapToBottom
  modal
>
  <Sheet.Overlay />
  <Sheet.Frame padding="$4" bg="$background">
    <XStack jc="space-between" ai="center" mb="$3">
      <Button chromeless icon={X} onPress={() => setShowDatePicker(false)}>
        Cancel
      </Button>
      <Button onPress={handleConfirm}>Save</Button>
    </XStack>

    <Separator mb="$3" />

    {/* Centered Picker */}
    <YStack f={1} ai="center" jc="center">
      <DateTimePicker
        value={tempDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedDate) => {
          if (selectedDate) setTempDate(selectedDate)
        }}
        maximumDate={new Date()}
      />
    </YStack>
  </Sheet.Frame>
</Sheet>

    </YStack>
  )
}
