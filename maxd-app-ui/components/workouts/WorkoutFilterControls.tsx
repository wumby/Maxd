// components/workouts/WorkoutFilterControls.tsx

import { YStack, XStack, ScrollView, Button, Text, useThemeName } from 'tamagui'
import { ChevronDown } from '@tamagui/lucide-icons'
import { YearFilterItem } from '../weights/YearFilterItem'
import { useMemo } from 'react'

export function WorkoutFilterControls({
  workouts,
  year,
  setYear,
  range,
  setRange,
  selectedWorkoutName,
  onOpenNameFilter,
}: {
  workouts: any[]
  year: string | null
  setYear: (val: string | null) => void
  range: 'all' | '3mo' | '30d'
  setRange: (val: 'all' | '3mo' | '30d') => void
  selectedWorkoutName: string | null
  onOpenNameFilter: () => void
}) {
  const isDark = useThemeName() === 'dark'
  const currentYear = new Date().getFullYear().toString()

  const years = useMemo(() => {
    const unique = new Set(workouts.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(unique)
      .sort((a, b) => b - a)
      .map(String)
  }, [workouts])

  return (
    <YStack px="$4" pb="$2">
      <XStack jc="center">
        <Button
          size="$6"
          chromeless
          onPress={onOpenNameFilter}
          iconAfter={<ChevronDown size={16} />}
          br="$6"
          px="$3"
        >
          {selectedWorkoutName || 'All'}
        </Button>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" mb="$3">
          {['All Years', ...years].map(val => (
            <YearFilterItem
              key={val}
              val={val}
              selected={year === val || (val === 'All Years' && year === null)}
              onPress={() => setYear(val === 'All Years' ? null : val)}
              isDark={isDark}
            />
          ))}
        </XStack>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" mb="$4">
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
        Showing {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'}{' '}
        of {year || 'all years'}
        {selectedWorkoutName ? ` — ${selectedWorkoutName}` : ''}
      </Text>
    </YStack>
  )
}
