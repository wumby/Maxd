// components/weights/WeightFilterControls.tsx
import { ScrollView, XStack, Text } from 'tamagui'
import { YearFilterItem } from './YearFilterItem'

interface WeightFilterControlsProps {
  years: number[]
  filter: string
  setFilter: (val: string) => void
  isDark: boolean
}

export function WeightFilterControls({
  years,
  filter,
  setFilter,
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

      <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
        Showing entries from {filter === 'All Years' ? 'all years' : filter}
      </Text>
    </>
  )
}
