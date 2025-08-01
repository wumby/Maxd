import { useMemo, useState } from 'react'
import { YStack, Text, XStack, Card, useThemeName, useTheme } from 'tamagui'
import { Pressable, ScrollView } from 'react-native'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import WeightUtil from '@/util/weightConversion'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useAuth } from '@/contexts/AuthContext'
import { ScreenContainer } from '../ScreenContainer'

interface WeightEntry {
  id: number
  value: number
  created_at: string
}

export default function MonthlySummary({
  visible,
  onClose,
  weights,
}: {
  visible: boolean
  onClose: () => void
  weights: WeightEntry[]
}) {
  const isDark = useThemeName() === 'dark'
  const theme = useTheme()
  const { weightUnit } = usePreferences()
  const { user } = useAuth()
  const goalMode = user?.goal_mode
  const convertWeight = (val?: number) => {
    if (typeof val !== 'number' || isNaN(val)) return '--'
    const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(val) : val
    return converted.toFixed(1)
  }

  const getDeltaColor = (delta: number | null) => {
    if (delta === null || isNaN(delta)) return '$gray10'
    if (goalMode === 'track' || !goalMode) return theme.color.val
    if (goalMode === 'gain') return delta > 0 ? 'green' : 'red'
    if (goalMode === 'lose') return delta < 0 ? 'green' : 'red'
    return '$gray10'
  }

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
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(Number(value))
    })

    const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a))

    return keys.map(key => {
      const [year, month] = key.split('-').map(Number)
      const values = map.get(key)!
      const average = values.reduce((sum, v) => sum + v, 0) / values.length
      return {
        year,
        month: month - 1,
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
    <ScreenContainer>
      <YStack pt="$4" pb="$2">
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}>
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
                <Card elevate bg="$color2" p="$4" gap="$3" br="$6" mb="$4">
                  <XStack jc="space-between" ai="center">
                    <YStack>
                      <Text fontSize="$6" fontWeight="700">
                        {convertWeight(entry.average)} {weightUnit}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        {formatMonth(entry.year, entry.month)} • {entry.count} weight
                        {entry.count > 1 ? 's' : ''}
                      </Text>
                    </YStack>

                    {delta !== null && !isNaN(delta) ? (
                      <Text color={getDeltaColor(delta)} fontSize="$3">
                        {delta === 0
                          ? '±0'
                          : `${delta > 0 ? '+' : ''}${convertWeight(delta)} ${weightUnit}`}
                      </Text>
                    ) : null}
                  </XStack>
                </Card>
              </Animated.View>
            )
          })
        )}
      </ScrollView>
    </ScreenContainer>
  )
}
