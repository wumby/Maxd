import { useMemo, useState } from 'react'
import {
  YStack, Text, ScrollView, XStack, Card, Separator, Button, Sheet, useTheme, useThemeName
} from 'tamagui'
import { ChevronDown, ChevronUp, ChevronLeft, Filter } from '@tamagui/lucide-icons'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenContainer } from '../ScreenContainer'
import { YearFilterItem } from '../weights/YearFilterItem'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'

export default function ExerciseHistory({
  exercises,
  onClose,
}: {
  exercises: any[]
  onClose: () => void
}) {
  const { weightUnit } = usePreferences()
  const [expanded, setExpanded] = useState<number | null>(null)
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const insets = useSafeAreaInsets()
  const bgColor = theme.background.val

  const currentYear = new Date().getFullYear().toString()
  const [filterYear, setFilterYear] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')
  const [filterExercise, setFilterExercise] = useState<string | null>(null)
  const [showSheet, setShowSheet] = useState(false)

  const years = useMemo(() => {
    const uniqueYears = new Set(exercises.map(e => new Date(e.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [exercises])

  const exerciseNames = useMemo(() => {
    const names = new Set(exercises.map(e => e.name.trim()))
    return Array.from(names).sort()
  }, [exercises])

  const rangeCutoff = useMemo(() => {
    const selected = exercises.filter(e => {
      const date = new Date(e.created_at)
      return filterYear === 'All Years' || date.getFullYear().toString() === filterYear
    })

    if (selected.length === 0 || range === 'all') return null

    const latestDate = new Date(Math.max(...selected.map(e => new Date(e.created_at).getTime())))
    const cutoff = new Date(latestDate)
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    else if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)

    return cutoff
  }, [exercises, filterYear, range])

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const date = new Date(e.created_at)
      const matchYear = filterYear === 'All Years' || date.getFullYear().toString() === filterYear
      const matchRange = !rangeCutoff || date >= rangeCutoff
      const matchName = !filterExercise || e.name.trim() === filterExercise
      return matchYear && matchRange && matchName
    })
  }, [exercises, filterYear, rangeCutoff, filterExercise])

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index)
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
              <Text fontSize="$5" fontWeight="600" color="$color">Back</Text>
            </XStack>
          </Pressable>

          <Button size="$2" onPress={() => setShowSheet(true)} icon={Filter}>
            Filter
          </Button>
        </XStack>

        <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">Exercises</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" mb="$3" px="$4">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={filterYear === val}
                onPress={() => setFilterYear(val)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

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
          Showing {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
          {filterYear === 'All Years' ? 'all years' : filterYear}
        </Text>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" pb="$8" px="$4">
          {filtered.map((ex, i) => {
            const isOpen = expanded === i
            const date = new Date(ex.created_at).toLocaleDateString()

            return (
              <Card key={i} elevate bg="$color2" p="$4" gap="$3" br="$6">
  <YStack>
    <Text fontSize="$6" fontWeight="700">{ex.name}</Text>
    <Text fontSize="$3" color="$gray10">{date}</Text>
  </YStack>

  <YStack mt="$3" gap="$2">
    {ex.sets?.map((set: any, j: number) => (
      <Text key={j} fontSize="$4" color="$gray10">
        {renderSetLine(ex.type, set, weightUnit)}
      </Text>
    ))}
  </YStack>
</Card>

            )
          })}
        </YStack>
      </ScrollView>

      {/* Exercise Filter Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet} snapPoints={[50]}>
        <Sheet.Frame>
          <Sheet.Handle />
          <YStack gap="$3" p="$4">
            <Text fontSize="$6" fontWeight="700">Filter by Exercise</Text>
            <Button size="$3" chromeless onPress={() => setFilterExercise(null)}>
              All Exercises
            </Button>
            {exerciseNames.map(name => (
              <Button
                key={name}
                size="$3"
                chromeless
                onPress={() => {
                  setFilterExercise(name)
                  setShowSheet(false)
                }}
              >
                {name}
              </Button>
            ))}
          </YStack>
        </Sheet.Frame>
      </Sheet>
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
      const unitLabel = set.distance_unit || 'mi'
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
