// components/weights/WeightFilterControls.tsx
import { ScrollView, XStack, Text } from 'tamagui'
import { YearFilterItem } from './YearFilterItem'

interface WeightFilterControlsProps {
  years: number[]
  filter: string
  setFilter: (val: string) => void
  range: 'all' | '30d' | '3mo'
  setRange: (val: 'all' | '30d' | '3mo') => void
  isDark: boolean
}

export function WeightFilterControls({
  years,
  filter,
  setFilter,
  range,
  setRange,
  isDark,
}: WeightFilterControlsProps) {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <XStack gap="$2" mb="$3">
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
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
        of {filter === 'All Years' ? 'all years' : filter}
      </Text>
    </>
  )
}
