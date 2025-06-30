import { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react'
import { Button, YStack, Text, Input, XStack, useThemeName } from 'tamagui'
import { Modal, View } from 'react-native'
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

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const History = lazy(() => import('@/components/weights/History'))
const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))
const ChartWebView = lazy(() => import('@/components/weights/ChartWebView'))
const MonthlyChartWebView = lazy(() => import('@/components/weights/MonthlyChartWebView'))

export default function WeightTab() {
  const { token } = useAuth()
  const [duplicateWarning, setDuplicateWarning] = useState(false)
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
      showToast('Please enter a valid weight')
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

      {/* Log Weight Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
            <Text fontSize="$6" fontWeight="700">
              Enter New Weight
            </Text>

            <Input
              keyboardType="numeric"
              placeholder="e.g. 175.5"
              value={weight}
              onChangeText={setWeight}
              returnKeyType="done"
            />

            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (date) setSelectedDate(date)
              }}
            />
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
        </View>
      </Modal>
    </>
  )
}
