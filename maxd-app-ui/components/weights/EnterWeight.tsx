import { useState } from 'react'
import { YStack, XStack, Button, Input, Text } from 'tamagui'
import { Keyboard } from 'react-native'
import { useRouter } from 'expo-router'
import { formatWeightInput } from '@/util/Weight'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useToast } from '@/contexts/ToastContextProvider'
import { useAuth } from '@/contexts/AuthContext'
import { logWeight } from '@/services/weightService'
import { useFetch } from '@/hooks/useFetch'
import { ScreenHeader } from '../ScreenHeader'

export default function EnterWeight({
  setTempDate,
  selectedDate,
  setShowDateSheet,
}: {
  setTempDate: (date: Date) => void
  selectedDate: Date
  setShowDateSheet: (val: boolean) => void
}) {
  const router = useRouter()
  const { weightUnit } = usePreferences()
  const { showToast } = useToast()
  const [weight, setWeight] = useState('')
  const [inputError, setInputError] = useState('')

  const { execute: submitWeight } = useFetch(logWeight)

  const handleSubmit = async () => {
    console.log('--- handleSubmit START ---')

    if (!weight.trim()) {
      console.warn('No weight entered')
      setInputError('Please enter a weight.')
      return
    }

    const rawInput = parseFloat(weight)
    if (isNaN(rawInput) || rawInput <= 0) {
      console.warn('Invalid weight input:', weight)
      setInputError('Invalid weight.')
      return
    }

    const weightInKg = weightUnit === 'lb' ? parseFloat((rawInput / 2.20462).toFixed(2)) : rawInput

    const isoDate = selectedDate.toISOString()
    const dateOnly = isoDate.split('T')[0] // Ensure we're not sending a full timestamp if backend compares by date

    console.log('✅ Prepared data for logWeight:', {
      weightInKg,
      isoDate,
      dateOnly,
      weightUnit,
    })

    try {
      const result = await submitWeight({
        weightInKg,
        date: dateOnly, // changed from isoDate to avoid time conflicts
      })

      console.log('✅ Weight logged successfully:', result)
      showToast('Weight logged!')
      router.push('/tabs/weight')
    } catch (err: any) {
      console.error('❌ Error logging weight:', err)
      setInputError(err.message || 'Error logging weight')
    }
  }

  return (
    <YStack gap="$4" w="100%" maxWidth={400} alignSelf="center" pt="$4">
      <ScreenHeader title={'New Weight'} />

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
  )
}
