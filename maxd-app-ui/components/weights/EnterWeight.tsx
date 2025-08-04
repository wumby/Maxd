import { useState } from 'react'
import { YStack, XStack, Button, Input, Text } from 'tamagui'
import { Keyboard } from 'react-native'
import { useRouter } from 'expo-router'
import { formatWeightInput } from '@/util/Weight'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useToast } from '@/contexts/ToastContextProvider'
import { useAuth } from '@/contexts/AuthContext'
import { logWeight } from '@/services/weightService'
import { DatePickerSheet } from '@/components/weights/DatePickerSheet'

export default function EnterWeight() {
  const router = useRouter()
  const { token } = useAuth()
  const { weightUnit } = usePreferences()
  const { showToast } = useToast()

  const [weight, setWeight] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tempDate, setTempDate] = useState(new Date())
  const [showDateSheet, setShowDateSheet] = useState(false)
  const handleSubmit = async () => {
    if (!weight.trim()) {
      setInputError('Please enter a weight.')
      return
    }

    const rawInput = parseFloat(weight)
    if (isNaN(rawInput) || rawInput <= 0) {
      setInputError('Invalid weight.')
      return
    }

    const weightInKg = weightUnit === 'lb' ? rawInput / 2.20462 : rawInput

    try {
      await logWeight({
        token: token!,
        weightInKg,
        date: selectedDate.toISOString(),
      })
      showToast('Weight logged!')
      router.push('/tabs/weight')
    } catch (err: any) {
      setInputError(err.message || 'Error logging weight')
    }
  }

  return (
    <>
      <YStack gap="$4" w="100%" maxWidth={400} alignSelf="center" px="$4" pt="$4">
        <Text fontSize="$8" fontWeight="700" textAlign="center">
          Enter New Weight
        </Text>

        <YStack>
          <Text fontSize="$2" color="$gray10" pb="$1">
            Weight
          </Text>
          <Input
            keyboardType="numeric"
            placeholder={weightUnit === 'lb' ? 'e.g. 175.5 (lb)' : 'e.g. 79.6 (kg)'}
            value={weight}
            onChangeText={val => {
              setWeight(formatWeightInput(val))
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
          <Button flex={1} onPress={() => router.back()}>
            Cancel
          </Button>
          <Button flex={1} onPress={handleSubmit} theme="active">
            Submit
          </Button>
        </XStack>
      </YStack>

      <DatePickerSheet
        open={showDateSheet}
        onOpenChange={setShowDateSheet}
        tempDate={tempDate}
        setTempDate={setTempDate}
        setSelectedDate={setSelectedDate}
      />
    </>
  )
}
