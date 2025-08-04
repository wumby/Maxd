import React, { useCallback, useMemo } from 'react'
import { YStack, Text, XStack, Card, useTheme } from 'tamagui'
import { Pressable, SectionList } from 'react-native'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { Ellipsis } from '@tamagui/lucide-icons'
import { WeightEntry } from '@/types/Weight'
import { useAuth } from '@/contexts/AuthContext'

interface HistoryProps {
  weights: WeightEntry[]
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>
  onEdit: (weight: WeightEntry) => void
  onDelete: (id: number) => void
}

export default function History({ weights, onEdit }: HistoryProps) {
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const { user } = useAuth()
  const goalMode = user?.goal_mode

  const convertWeight = useCallback(
    (val?: number | string) => {
      const num = typeof val === 'number' ? val : parseFloat(val!)
      if (isNaN(num)) return '--'
      const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(num) : num
      return converted.toFixed(1)
    },
    [weightUnit]
  )

  const { grouped, previousMap } = useMemo(() => {
    const sorted = [...weights].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const map = new Map<string, WeightEntry[]>()
    const prevMap = new Map<number, number>()

    for (let i = 0; i < sorted.length; i++) {
      const w = sorted[i]
      const label = new Date(w.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })

      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(w)

      if (i + 1 < sorted.length) {
        prevMap.set(w.id, sorted[i + 1].value)
      }
    }

    const grouped = Array.from(map.entries())
      .sort(
        (a, b) => new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime()
      )
      .map(([title, data]) => ({ title, data }))

    return { grouped, previousMap: prevMap }
  }, [weights])

  const getDeltaColor = useCallback(
    (delta: number) => {
      const mode = goalMode ?? 'track'
      if (mode === 'track') return theme.color.val
      if (delta === 0) return '$gray10'
      if (mode === 'lose') return delta < 0 ? 'green' : 'red'
      if (mode === 'gain') return delta > 0 ? 'green' : 'red'
      return '$gray10'
    },
    [goalMode, theme.color.val]
  )

  return (
    <YStack f={1} px="$4" pt="$2">
      <SectionList
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={5}
        sections={grouped}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 64 }}
        stickySectionHeadersEnabled={true}
        renderSectionHeader={({ section: { title } }) => (
          <Text fontSize="$6" fontWeight="700"  mb="$2" bg="$background">
            {title}
          </Text>
        )}
        renderItem={({ item }) => {
          const prevValue = previousMap.get(item.id)
          const delta = typeof prevValue === 'number' ? item.value - prevValue : null

          return (
            <WeightCard
              item={item}
              delta={delta!}
              convertWeight={convertWeight}
              weightUnit={weightUnit}
              onEdit={onEdit}
              getDeltaColor={getDeltaColor}
            />
          )
        }}
        ListEmptyComponent={
          <Text textAlign="center" fontSize="$5" color="$gray10" mt="$6">
            No entries
          </Text>
        }
      />
    </YStack>
  )
}

interface WeightCardProps {
  item: WeightEntry
  delta: number
  convertWeight: (val?: number | string) => string
  weightUnit: string
  onEdit: (entry: WeightEntry) => void
  getDeltaColor: (delta: number) => string
}

export const WeightCard = React.memo(function WeightCard({
  item,
  delta,
  convertWeight,
  weightUnit,
  onEdit,
  getDeltaColor,
}: WeightCardProps) {
  const theme = useTheme()

  return (
    <Card p="$4" mb="$4" elevate bg="$color2" br="$6">
      <XStack jc="space-between" ai="center">
        <YStack>
          <Text fontSize="$6" fontWeight="700" color="$color">
            {convertWeight(item.value)} {weightUnit}
          </Text>
          <Text fontSize="$3" color="$gray10">
            {new Date(item.created_at).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </YStack>

        <Pressable onPress={() => onEdit(item)} hitSlop={10}>
          <Ellipsis size={26} color={theme.color.val} />
        </Pressable>
      </XStack>

      {delta !== null && (
        <Text color={getDeltaColor(delta)} fontSize="$3" mt="$2">
          {delta === 0
            ? '±0'
            : `${delta > 0 ? '+' : '−'}${convertWeight(Math.abs(delta))} ${weightUnit}`}
        </Text>
      )}
    </Card>
  )
})
