import { useState, useMemo, useCallback } from 'react'
import { Button, YStack, Text, XStack } from 'tamagui'
import { useRouter, useFocusEffect } from 'expo-router'
import { Pencil } from '@tamagui/lucide-icons'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContextProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { fetchWeights, logWeight } from '@/services/weightService'
import { EnterWeightSheet } from '@/components/weights/EnterWeightSheet'
import { DatePickerSheet } from '@/components/weights/DatePickerSheet'
import { GoalModeSheet } from '@/components/weights/GoalModeSheet'
import { CardsTop } from '@/components/weights/CardsTop'
import { CardsBottom } from '@/components/weights/CardsBottom'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { ScreenContainer } from '@/components/ScreenContainer'

export default function WeightIndex() {
  const { user, token } = useAuth()
  const { weightUnit } = usePreferences()
  const { showToast } = useToast()
  const router = useRouter()
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [tempDate, setTempDate] = useState(selectedDate)
  const [goalModeSheetVisible, setGoalModeSheetVisible] = useState(false)
  const [showWeightSheet, setShowWeightSheet] = useState(false)
  const [inputError, setInputError] = useState('')

  useFocusEffect(
    useCallback(() => {
      if (!token) return
      const getData = async () => {
        try {
          const data = await fetchWeights(token)
          setWeights(data)
        } catch (err: any) {
          if (err.message === 'Invalid or expired token') {
            router.replace('/login')
          } else {
            console.error('Error fetching weights:', err)
            setWeights([])
          }
        }
      }
      getData()
    }, [token])
  )
  const handleLogWeight = async (entered: string) => {
    if (!token) return
    const rawInput = parseFloat(entered)
    if (isNaN(rawInput) || rawInput <= 0) {
      setInputError('Please enter a valid weight')
      return
    }
    const weightInKg = weightUnit === 'lb' ? WeightUtil.lbsToKg(rawInput) : rawInput
    try {
      const created = await logWeight({
        token,
        weightInKg,
        date: selectedDate.toISOString(),
      })

      setShowWeightSheet(false)
      showToast('Weight added!')
      setWeights(prev =>
        [...prev, created].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch (err: any) {
      setInputError(err.message || 'Error logging weight')
    }
  }

  const currentWeight = useMemo(() => {
    if (weights.length === 0) return '--'
    const val = Number(weights[0].value)
    if (isNaN(val)) return '--'
    const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(val) : val
    return `${converted.toFixed(1)} ${weightUnit}`
  }, [weights])

  const goalLabel = useMemo(() => {
    if (!user) return null
    switch (user.goal_mode || 'track') {
      case 'lose':
        return 'Goal: Lose weight'
      case 'gain':
        return 'Goal: Gain weight'
      default:
        return 'Goal: Just tracking'
    }
  }, [user])

  return (
    <>
      <ScreenContainer>
        <TabTransitionWrapper tabPosition={1}>
          <YStack f={1} jc="space-evenly" gap="$4">
            <CardsTop
              onChartPress={() => router.push('/tabs/weight/chart')}
              onMonthlyPress={() => router.push('tabs/weight/monthlyChart')}
              weights={weights}
            />
            <YStack ai="center" gap="$4">
              <Text fontSize="$9" fontWeight="700">
                Current: {currentWeight}
              </Text>
              {goalLabel && (
                <XStack ai="center" gap="$2">
                  <Text fontSize="$6" color="$gray10">
                    {goalLabel}
                  </Text>
                  <Button
                    chromeless
                    size="$2"
                    onPress={() => setGoalModeSheetVisible(true)}
                    icon={<Pencil size={18} />} // or 28, 32 etc.
                  />
                </XStack>
              )}
            </YStack>
            <YStack ai="center">
              <Button size="$5" onPress={() => router.push('/tabs/weight/newWeight')}>
                Enter New Weight
              </Button>
            </YStack>
            <CardsBottom
              onHistoryPress={() => router.push('/tabs/weight/history')}
              onMonthlyPress={() => router.push('/tabs/weight/monthlyHistory')}
              weights={weights}
            />
          </YStack>
        </TabTransitionWrapper>
      </ScreenContainer>
      <EnterWeightSheet
        open={showWeightSheet}
        onOpenChange={setShowWeightSheet}
        onSubmit={handleLogWeight}
        selectedDate={selectedDate}
        setShowDateSheet={setShowDateSheet}
        setTempDate={setTempDate}
        inputError={inputError}
        setInputError={setInputError}
      />
      <DatePickerSheet
        open={showDateSheet}
        onOpenChange={setShowDateSheet}
        tempDate={tempDate}
        setTempDate={setTempDate}
        setSelectedDate={setSelectedDate}
      />
      <GoalModeSheet open={goalModeSheetVisible} onOpenChange={setGoalModeSheetVisible} />
    </>
  )
}
