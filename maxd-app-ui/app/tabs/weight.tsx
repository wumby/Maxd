import { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react'
import { Button, YStack, Text, XStack, useThemeName } from 'tamagui'
import { useAuth } from '@/contexts/AuthContext'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { CardsBottom } from '@/components/weights/CardsBottom'
import { useToast } from '@/contexts/ToastContextProvider'
import { CardsTop } from '@/components/weights/CardsTop'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { Pencil } from '@tamagui/lucide-icons'
import { ScreenContainer } from '@/components/ScreenContainer'
import { DatePickerSheet } from '@/components/weights/DatePickerSheet'
import { GoalModeSheet } from '@/components/weights/GoalModeSheet'
import { EnterWeightSheet } from '@/components/weights/EnterWeightSheet'
import { fetchWeights, logWeight } from '@/services/weightService'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'

const History = lazy(() => import('@/components/weights/History'))
const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))
const ChartWebView = lazy(() => import('@/components/weights/ChartWebView'))
const MonthlyChartWebView = lazy(() => import('@/components/weights/MonthlyChartWebView'))

export default function WeightTab() {
  const { weightUnit } = usePreferences()
  const router = useRouter()
  const { showToast } = useToast()
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const [viewMode, setViewMode] = useState<
    'chart' | 'monthlyChart' | 'history' | 'monthlyHistory' | null
  >(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [tempDate, setTempDate] = useState(selectedDate)
  const [goalModeSheetVisible, setGoalModeSheetVisible] = useState(false)
  const [showWeightSheet, setShowWeightSheet] = useState(false)
  const { user, token } = useAuth()
  const params = useLocalSearchParams()
  const shouldLog = params.log === '1'
  const [inputError, setInputError] = useState('')

  const goalLabel = useMemo(() => {
    if (!user) return null
    const mode = user.goal_mode || 'track'
    switch (mode) {
      case 'lose':
        return 'Goal: Lose weight'
      case 'gain':
        return 'Goal: Gain weight'
      case 'track':
      default:
        return 'Goal: Just tracking'
    }
  }, [user])

  useEffect(() => {
    if (shouldLog) {
      setShowWeightSheet(true)
      router.replace('/tabs/weight')
    }
  }, [shouldLog])

  useFocusEffect(
    useCallback(() => {
      if (!token) return
      setViewMode(null)
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
    const unitLabel = weightUnit
    return `${converted.toFixed(1)} ${unitLabel}`
  }, [weights])

  const themeName = useThemeName()
  if (!themeName) return null

  return (
    <>
      <ScreenContainer>
         <TabTransitionWrapper tabPosition={1}>
        {viewMode === null && (
          <YStack f={1} jc="space-evenly" gap="$4">
            <CardsTop
              onChartPress={() => setViewMode('chart')}
              onMonthlyPress={() => setViewMode('monthlyChart')}
              weights={weights}
            />

            <YStack ai="center" gap="$4">
              <Text fontSize="$9" fontWeight="700">
                Current: {currentWeight}
              </Text>

              {goalLabel && (
                <XStack ai="center" gap="$2">
                  <Text fontSize="$5" color="$gray10">
                    {goalLabel}
                  </Text>
                  <Button
                    chromeless
                    size="$2"
                    onPress={() => setGoalModeSheetVisible(true)}
                    icon={Pencil}
                  />
                </XStack>
              )}
            </YStack>

            <YStack ai="center">
              <Button size="$5" onPress={() => setShowWeightSheet(true)}>
                Enter New Weight
              </Button>
            </YStack>

            <CardsBottom
              onHistoryPress={() => setViewMode('history')}
              onMonthlyPress={() => setViewMode('monthlyHistory')}
              weights={weights}
            />
          </YStack>
        )}
        </TabTransitionWrapper>
      </ScreenContainer>

      <Suspense fallback={null}>
        {viewMode === 'chart' && (
          <ChartWebView onBack={() => setViewMode(null)} weights={weights} />
        )}
        {viewMode === 'monthlyChart' && (
          <MonthlyChartWebView onBack={() => setViewMode(null)} weights={weights} />
        )}
        {viewMode === 'history' && (
          <History
            visible
            onClose={() => setViewMode(null)}
            weights={weights}
            setWeights={setWeights}
          />
        )}
        {viewMode === 'monthlyHistory' && (
          <MonthlyHistory visible onClose={() => setViewMode(null)} weights={weights} />
        )}
      </Suspense>

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
