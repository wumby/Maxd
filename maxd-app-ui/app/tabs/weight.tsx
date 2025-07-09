import { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react'
import { Button, YStack, Text, Input, XStack, useThemeName, Separator, Sheet } from 'tamagui'
import { Modal, Platform, View } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/env'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import { CardsBottom } from '@/components/weights/CardsBottom'
import { useToast } from '@/contexts/ToastContextProvider'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CardsTop } from '@/components/weights/CardsTop'
import { useIsFocused } from '@react-navigation/native'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { X } from '@tamagui/lucide-icons'

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const History = lazy(() => import('@/components/weights/History'))
const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))
const ChartWebView = lazy(() => import('@/components/weights/ChartWebView'))
const MonthlyChartWebView = lazy(() => import('@/components/weights/MonthlyChartWebView'))

export default function WeightTab() {
  const { token } = useAuth()
  const [duplicateWarning, setDuplicateWarning] = useState(false)
  const [inputError, setInputError] = useState('')

  const { weightUnit } = usePreferences()

  const router = useRouter()
  const { showToast } = useToast()
  const [weight, setWeight] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const [viewMode, setViewMode] = useState<
    'chart' | 'monthlyChart' | 'history' | 'monthlyHistory' | null
  >(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const isFocused = useIsFocused()
  const params = useLocalSearchParams()
  const shouldLog = params.log === '1'
  const [showDateSheet, setShowDateSheet] = useState(false)
const [tempDate, setTempDate] = useState(selectedDate)


  useEffect(() => {
    if (shouldLog) {
      setModalVisible(true)
      router.replace('/tabs/weight')
    }
  }, [shouldLog])
  useFocusEffect(
    useCallback(() => {
      setViewMode(null)
      const fetchWeights = async () => {
        try {
          const res = await fetch(`${API_URL}/weights`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()

          if (res.status === 401 || data.error === 'Invalid or expired token') {
            console.warn('Token expired, logging out...')
            router.replace('/login')
            return
          }

          if (!Array.isArray(data)) {
            console.error('Bad weights response:', data)
            setWeights([])
            return
          }
          setWeights(
            data.map(w => ({
              ...w,
              value: typeof w.value === 'string' ? parseFloat(w.value) : w.value,
            }))
          )
        } catch (err) {
          console.error('Error fetching weights:', err)
          setWeights([])
        }
      }
      fetchWeights()
    }, [token])
  )

  const handleLogWeight = async () => {
    const rawInput = parseFloat(weight)

    if (isNaN(rawInput) || rawInput <= 0) {
      setInputError('Please enter a valid weight')
      return
    }

    const weightInKg = weightUnit === 'lb' ? WeightUtil.lbsToKg(rawInput) : rawInput
    try {
      const res = await fetch(`${API_URL}/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: weightInKg,
          date: selectedDate.toISOString(),
        }),
      })

      const created = await res.json()

      if (res.status === 409) {
        setDuplicateWarning(true)
        return
      }

      if (!res.ok) throw new Error(created.error || 'Failed to log weight')

      setDuplicateWarning(false)
      setInputError('')
      showToast('Weight added!')
      setWeight('')
      setSelectedDate(new Date())
      setModalVisible(false)
      setWeights(prev =>
        [...prev, created].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch (_e) {
      showToast('Error logging weight', 'warn')
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
      <AnimatedYStack
        f={1}
        backgroundColor="$background"
        p="$4"
        key={`weight-tab-${themeName}-${isFocused ? 'focused' : 'unfocused'}`}
        entering={FadeIn.duration(500)}
      >
        {viewMode === null && (
          <YStack f={1} jc="space-evenly" gap="$4">
            <CardsTop
              onChartPress={() => setViewMode('chart')}
              onMonthlyPress={() => setViewMode('monthlyChart')}
              weights={weights}
            />

            <YStack ai="center" gap="$6">
              <Text fontSize="$9" fontWeight="700">
                Current: {currentWeight}
              </Text>
              <Button size="$4" onPress={() => setModalVisible(true)}>
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
      </AnimatedYStack>
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
     <Sheet
  open={modalVisible}
  onOpenChange={setModalVisible}
  snapPoints={[85]}
  dismissOnSnapToBottom
  modal
>
  <Sheet.Handle />
  <Sheet.Overlay />
  <Sheet.Frame bg="$background" p="$4">
    <YStack gap="$4" w="100%" maxWidth={400}>
      <Text fontSize="$6" fontWeight="700">
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
  onChangeText={(val) => {
    setWeight(val)
    setDuplicateWarning(false)
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
            setTempDate(selectedDate)
            setShowDateSheet(true)
            setDuplicateWarning(false)
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

{duplicateWarning && (
  <Text color="$red10" textAlign="center" fontSize="$4">
    You’ve already logged a weight for this day!
  </Text>
)}

      <XStack gap="$2">
        <Button flex={1} onPress={() => setModalVisible(false)}>
          Cancel
        </Button>
        <Button flex={1} onPress={handleLogWeight} theme="active">
          Submit
        </Button>
      </XStack>
    </YStack>
  </Sheet.Frame>
</Sheet>
<Sheet
  open={showDateSheet}
  onOpenChange={setShowDateSheet}
  snapPoints={[50]}
  dismissOnSnapToBottom
  modal
>
  <Sheet.Handle />
  <Sheet.Overlay />
  <Sheet.Frame bg="$background" p="$4">
    
    <XStack jc="space-between" ai="center" mb="$3">
      <Button chromeless icon={X} onPress={() => setShowDateSheet(false)}>
        Cancel
      </Button>
      <Button
        onPress={() => {
          setSelectedDate(tempDate)
          setShowDateSheet(false)
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


    </>
  )
}
