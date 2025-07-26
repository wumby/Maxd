import { Sheet, YStack, XStack, Button, Input, Text } from 'tamagui'
import { useState } from 'react'
import { Alert, Keyboard } from 'react-native'

export function EnterWeightSheet({
  open,
  onOpenChange,
  onSubmit,
  selectedDate,
  setShowDateSheet,
  setTempDate,
  inputError,
  setInputError,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  onSubmit: (weight: string) => void
  selectedDate: Date
  setShowDateSheet: (val: boolean) => void
  setTempDate: (val: Date) => void
  inputError: string
  setInputError: (msg: string) => void
}) {
  const [weight, setWeight] = useState('')
  const handleSubmit = () => {
  if (!weight.trim()) {
    setInputError('Please enter a weight.')
    return
  }

  // Let the parent handle submission and validation
  onSubmit(weight)
}


  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[85]} dismissOnSnapToBottom modal>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame bg="$background" p="$4">
        <YStack gap="$4" w="100%" maxWidth={400}>
          <Text fontSize="$8" fontWeight="700" textAlign="center">
            Enter New Weight
          </Text>

          <YStack>
            <Text fontSize="$2" color="$gray10" pb="$1">
              Weight
            </Text>
            <Input
              keyboardType="numeric"
              placeholder="e.g. 175.5"
              value={weight}
              onChangeText={val => {
                setWeight(val)
                setInputError('')
              }}
              returnKeyType="done"
            />
          </YStack>

          <YStack>
            <Text fontSize="$2" color="$gray10" pb="$1">
              Date
            </Text>
            <Button
              justifyContent="flex-start"
              chromeless
              borderWidth={1}
              borderColor="$gray5"
              borderRadius="$3"
              px="$3"
              py="$2"
              onPress={() => {
                Keyboard.dismiss()
                setTempDate(selectedDate)
                setShowDateSheet(true)
                setInputError('')
              }}
            >
              <Text fontSize="$4">
                {selectedDate.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Button>
          </YStack>

          {inputError !== '' && (
            <Text color="$red10" textAlign="center" fontSize="$4">
              {inputError}
            </Text>
          )}

          <XStack gap="$2">
            <Button flex={1} onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button flex={1} onPress={handleSubmit} theme="active">
              Submit
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
