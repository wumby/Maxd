import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { Button, YStack, Text, Input, XStack } from 'tamagui'
import { Modal, View } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/env'
import { useFocusEffect } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { CardsBottom } from '@/components/weights/CardsBottom'
import { useToast } from '@/contexts/ToastContextProvider'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CardsTop } from '@/components/weights/CardsTop'
import ChartWebView from '@/components/weights/ChartWebView'
import MonthlyChartWebView from '@/components/weights/MonthlyChartWebView'

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const History = lazy(() => import('@/components/weights/History'))
const MonthlyHistory = lazy(() => import('@/components/weights/MonthlyHistory'))

export default function WeightTab() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [weight, setWeight] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const [viewMode, setViewMode] = useState<
    'chart' | 'monthlyChart' | 'history' | 'monthlyHistory' | null
  >(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // main container animation
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(-20)

  // row fade-in
  const topOpacity = useSharedValue(0)
  const midOpacity = useSharedValue(0)
  const botOpacity = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
  const topStyle = useAnimatedStyle(() => ({ opacity: topOpacity.value }))
  const midStyle = useAnimatedStyle(() => ({ opacity: midOpacity.value }))
  const botStyle = useAnimatedStyle(() => ({ opacity: botOpacity.value }))

  useFocusEffect(
    useCallback(() => {
      // Reset initial states
      opacity.value = 0
      translateY.value = -20
      topOpacity.value = 0
      midOpacity.value = 0
      botOpacity.value = 0

      // Animate main container
      opacity.value = withTiming(1, { duration: 300 })
      translateY.value = withTiming(0, { duration: 300 })

      // Stagger manually
      setTimeout(() => {
        topOpacity.value = withTiming(1, { duration: 300 })
      }, 100)

      setTimeout(() => {
        midOpacity.value = withTiming(1, { duration: 300 })
      }, 250)

      setTimeout(() => {
        botOpacity.value = withTiming(1, { duration: 300 })
      }, 400)

      setViewMode(null)

      const fetchWeights = async () => {
        try {
          const res = await fetch(`${API_URL}/weights`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          setWeights(data)
        } catch (err) {
          console.error('Error fetching weights:', err)
        }
      }

      fetchWeights()
    }, [token])
  )

  useEffect(() => {
    if (viewMode === null) {
      opacity.value = 0
      translateY.value = -20
      topOpacity.value = 0
      midOpacity.value = 0
      botOpacity.value = 0
      opacity.value = withTiming(1, { duration: 300 })
      translateY.value = withTiming(0, { duration: 300 })
      setTimeout(() => {
        topOpacity.value = withTiming(1, { duration: 300 })
      }, 50)

      setTimeout(() => {
        midOpacity.value = withTiming(1, { duration: 300 })
      }, 150)

      setTimeout(() => {
        botOpacity.value = withTiming(1, { duration: 300 })
      }, 250)
    } else {
      opacity.value = withTiming(0, { duration: 300 })
      translateY.value = withTiming(20, { duration: 300 }) // slide down
    }
  }, [viewMode])

  const handleLogWeight = async () => {
    const numericWeight = parseFloat(weight)
    if (isNaN(numericWeight) || numericWeight <= 0) {
      showToast('Please enter a valid weight')
      return
    }

    try {
      const res = await fetch(`${API_URL}/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: numericWeight,
          date: selectedDate.toISOString(),
        }),
      })

      const created = await res.json()

      if (res.status === 409) {
        setModalVisible(false)
        setTimeout(() => {
          showToast('You’ve already logged a weight for this day!', 'warn')
        }, 200)
        return
      }

      if (!res.ok) throw new Error(created.error || 'Failed to log weight')

      showToast('Weight added!')
      setWeight('')
      setSelectedDate(new Date())
      setModalVisible(false)
     setWeights(prev =>
  [...prev, created].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
)

    } catch (err: any) {
      showToast('Error logging weight', 'warn')
    }
  }

  const currentWeight = useMemo(() => {
    if (weights.length === 0) return '--'
    const val = Number(weights[0].value)
    return isNaN(val) ? '--' : `${val.toFixed(1)} lb`
  }, [weights])

  return (
    <>
      <AnimatedYStack f={1} bg="$background" p="$4" style={animatedStyle}>
        {viewMode === null && (
          <YStack f={1} jc="space-evenly" gap="$4">
            <Animated.View style={topStyle}>
              <CardsTop
                onChartPress={() => setViewMode('chart')}
                onMonthlyPress={() => setViewMode('monthlyChart')}
                weights={weights}
              />
            </Animated.View>

            <Animated.View style={midStyle}>
              <YStack ai="center" gap="$6">
                <Text fontSize="$9" fontWeight="700">
                  Current: {currentWeight}
                </Text>
                <Button size="$4" onPress={() => setModalVisible(true)}>
                  Enter New Weight
                </Button>
              </YStack>
            </Animated.View>

            <Animated.View style={botStyle}>
              <CardsBottom
                onHistoryPress={() => setViewMode('history')}
                onMonthlyPress={() => setViewMode('monthlyHistory')}
                weights={weights}
              />
            </Animated.View>
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
