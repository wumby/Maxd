import { useMemo, useState } from 'react'
import { YStack, Text, XStack, Card, useThemeName, useTheme } from 'tamagui'
import { Pressable, ScrollView, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

interface WeightEntry {
  id: number
  value: number
  created_at: string
}

const SCREEN_WIDTH = Dimensions.get('window').width

export default function MonthlySummary({
  visible,
  onClose,
  weights,
}: {
  visible: boolean
  onClose: () => void
  weights: WeightEntry[]
}) {
  const insets = useSafeAreaInsets()
  const isDark = useThemeName() === 'dark'
  const theme = useTheme()

  const allYears = useMemo(() => {
    const years = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [weights])

  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState<'all' | string>(
    allYears.includes(Number(currentYear)) ? currentYear : 'all'
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return weights
    return weights.filter(w => new Date(w.created_at).getFullYear().toString() === filter)
  }, [filter, weights])

  const monthlyAverages = useMemo(() => {
    if (filtered.length === 0) return []

    const map = new Map<string, number[]>()

    filtered.forEach(({ created_at, value }) => {
      const date = new Date(created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // e.g., "2025-06"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(Number(value))
    })

    const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a)) // descending

    return keys.map(key => {
      const [year, month] = key.split('-').map(Number)
      const values = map.get(key)!
      const average = values.reduce((sum, v) => sum + v, 0) / values.length
      return {
        year,
        month: month - 1, // JS Date uses 0-based months
        average,
        count: values.length,
      }
    })
  }, [filtered])

  const formatMonth = (year: number, month: number) =>
    new Date(year, month).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

  const YearFilterItem = ({
    val,
    selected,
    onPress,
  }: {
    val: string
    selected: boolean
    onPress: () => void
  }) => {
    const scale = useSharedValue(1)
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))

    const bgColor = selected ? (isDark ? theme.gray5.val : '#e5e7eb') : 'transparent'
    const textColor = selected ? (isDark ? '#fff' : '#000') : theme.gray10.val
    const border = selected ? theme.gray8.val : theme.gray5.val

    return (
      <Pressable
        onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
        onPress={onPress}
      >
        <Animated.View style={animatedStyle}>
          <Card px="$4" py="$2" br="$10" bg={bgColor} borderWidth={1} borderColor={border}>
            <Text fontWeight="600" fontSize="$3" color={textColor}>
              {val === 'all' ? 'All' : val}
            </Text>
          </Card>
        </Animated.View>
      </Pressable>
    )
  }

  if (!visible) return null

  return (
    <YStack
      position="absolute"
      top={insets.top}
      left={0}
      right={0}
      bottom={0}
      zIndex={100}
      bg="$background"
    >
      <YStack px="$4" pt="$4" pb="$2">
        <XStack jc="space-between" ai="center" mb="$3">
          <Pressable onPress={onClose} hitSlop={10}>
            <XStack fd="row" ai="center" gap="$2">
              <ChevronLeft size={20} color={theme.color.val} />
              <Text fontSize="$5" fontWeight="600" color="$color">
                Back
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        <Animated.View entering={FadeInUp.duration(300)}>
          <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
            Monthly Averages
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <XStack gap="$2" mb="$4">
            {['all', ...allYears.map(String)].map(val => (
              <YearFilterItem
                key={`year-${val}`}
                val={val}
                selected={filter === val}
                onPress={() => setFilter(val)}
              />
            ))}
          </XStack>
        </ScrollView>
      </YStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {monthlyAverages.length === 0 ? (
          <Text textAlign="center" fontSize="$5" color="$gray10" mt="$6">
            No data yet
          </Text>
        ) : (
          monthlyAverages.map((entry, index) => {
            const prev = monthlyAverages[index + 1]
            const delta =
              prev && typeof prev.average === 'number' ? entry.average - prev.average : null

            return (
              <Animated.View
                key={`month-${entry.year}-${entry.month}`}
                entering={FadeInUp.duration(300).delay(index * 40)}
              >
                <Card
                  p="$3"
                  mb="$2"
                  elevate
                  bordered
                  bg="$background"
                  borderRadius={0}
                  width={SCREEN_WIDTH - 32}
                >
                  <XStack jc="space-between" ai="center">
                    <YStack>
                      <Text fontSize="$5" fontWeight="700" color="$color">
                        {entry.average.toFixed(1)} lb
                      </Text>
                      <Text fontSize="$2" color="$gray10">
                        {formatMonth(entry.year, entry.month)} • {entry.count} weight
                        {entry.count > 1 ? 's' : ''}
                      </Text>
                    </YStack>

                    {delta !== null && !isNaN(delta) ? (
                      <Text color={delta > 0 ? 'red' : 'green'} fontSize="$3">
                        {delta > 0 ? '+' : ''}
                        {delta.toFixed(1)} lb
                      </Text>
                    ) : null}
                  </XStack>
                </Card>
              </Animated.View>
            )
          })
        )}
      </ScrollView>
    </YStack>
  )
}
