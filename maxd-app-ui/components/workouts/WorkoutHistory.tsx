import { useState, useMemo } from 'react'
import {
  YStack,
  Text,
  Button,
  ScrollView,
  XStack,
  Card,
  Separator,
  View,
  useTheme,
  useThemeName,
} from 'tamagui'
import { ChevronDown, ChevronUp, ChevronLeft } from '@tamagui/lucide-icons'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenContainer } from '../ScreenContainer'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { YearFilterItem } from '../weights/YearFilterItem'

export default function WorkoutHistory({
  workouts,
  onClose,
}: {
  workouts: any[]
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const insets = useSafeAreaInsets()
  const bgColor = theme.background.val

  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')

  const years = useMemo(() => {
    const uniqueYears = new Set(workouts.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [workouts])

  const rangeCutoff = useMemo(() => {
    const selected = workouts.filter(w => {
      const date = new Date(w.created_at)
      return filter === 'All Years' || date.getFullYear().toString() === filter
    })

    if (selected.length === 0 || range === 'all') return null

    const latestDate = new Date(Math.max(...selected.map(w => new Date(w.created_at).getTime())))

    const cutoff = new Date(latestDate)
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    else if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)

    return cutoff
  }, [workouts, filter, range])

  const filtered = useMemo(() => {
    return workouts.filter(w => {
      const date = new Date(w.created_at)
      const matchYear = filter === 'All Years' || date.getFullYear().toString() === filter
      const matchRange = !rangeCutoff || date >= rangeCutoff
      return matchYear && matchRange
    })
  }, [filter, workouts, rangeCutoff])

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={100}
      bg={bgColor}
      paddingTop={insets.top}
    >
      {/* Header */}
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
          <View w={60} />
        </XStack>

        <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
          Workouts
        </Text>

        {/* Year Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" mb="$3" px="$4">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={filter === val}
                onPress={() => setFilter(val)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        {/* Range Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" mb="$4" px="$4">
            {[
              { label: 'All Days', val: 'all' },
              { label: 'Last 3 Months', val: '3mo' },
              { label: 'Last 30 Days', val: '30d' },
            ].map(opt => (
              <YearFilterItem
                key={opt.val}
                val={opt.label}
                selected={range === opt.val}
                onPress={() => setRange(opt.val as any)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
          Showing{' '}
          {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
          {filter === 'All Years' ? 'all years' : filter}
        </Text>
      </YStack>

      {/* Workout List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" pb="$8" px="$4">
          {filtered.map(workout => {
            const isOpen = expanded === workout.id
            const workoutDate = new Date(workout.created_at).toLocaleDateString()

            return (
              <Card key={workout.id} elevate bg="$color2" p="$4" gap="$3" br="$6">
                <XStack jc="space-between" ai="center" onPress={() => toggleExpand(workout.id)}>
                  <YStack>
                    <Text fontSize="$6" fontWeight="700">
                      {workout.title || 'Untitled Workout'}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {workoutDate}
                    </Text>
                  </YStack>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </XStack>

                {isOpen && (
                  <YStack gap="$4" mt="$3">
                    {workout.exercises.map((ex: any, i: number) => (
                      <YStack key={i} gap="$2">
                        <Text fontSize="$5" fontWeight="700">
                          {ex.name}
                        </Text>
                        <YStack ml="$2" gap="$1">
                          {ex.sets?.map((set: any, j: number) => (
                            <Text key={j} fontSize="$4" color="$gray10">
                              {renderSetLine(ex.type, set, weightUnit)}
                            </Text>
                          ))}
                        </YStack>
                        {i < workout.exercises.length - 1 && <Separator />}
                      </YStack>
                    ))}
                  </YStack>
                )}
              </Card>
            )
          })}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

function renderSetLine(type: string, set: any, unit: 'kg' | 'lb') {
  switch (type) {
    case 'weights': {
      const raw = set.weight ?? '--'
      const weight =
        raw !== '--'
          ? unit === 'lb'
            ? `${WeightUtil.kgToLbs(raw).toFixed(1)}`
            : `${Number(raw).toFixed(1)}`
          : '--'
      return `${set.reps || '--'} reps @ ${weight} ${unit}`
    }
    case 'bodyweight':
      return `${set.reps || '--'} reps`
    case 'cardio': {
      const distance = set.distance || '--'
      const unitLabel = set.distanceUnit || 'mi'
      const duration = formatDuration(set.duration || set.durationSeconds)
      return `${distance} ${unitLabel} in ${duration}`
    }
    default:
      return 'Unknown set'
  }
}

function formatDuration(seconds?: number) {
  if (!seconds) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}
