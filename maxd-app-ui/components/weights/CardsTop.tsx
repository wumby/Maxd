import { Card, Text, XStack, YStack } from 'tamagui'
import { MiniLineChart } from './MiniLineChart'
import { Expand } from '@tamagui/lucide-icons'
import { useMemo } from 'react'

interface Props {
  onChartPress: () => void
  onMonthlyPress: () => void
  weights?: { value: number; created_at: string }[]
  extras?: {
    allTimeDelta?: number
    avg7Days?: number
  }
}

export function CardsTop({ onChartPress, onMonthlyPress, weights = [] }: Props) {
  const hasWeightData = weights.length >= 2

  const monthlyAverages = useMemo(() => {
    const map: Record<string, number[]> = {}

    for (const w of weights) {
      const date = new Date(w.created_at)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const key = `${year}-${month}`

      const value = Number(w.value)
      if (!isNaN(value)) {
        if (!map[key]) map[key] = []
        map[key].push(value)
      }
    }

    const sorted = Object.entries(map)
      .map(([month, values]) => ({
        month,
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime())
      .slice(-6)

    return sorted.map(item => ({ value: Number(item.avg.toFixed(1)) }))
  }, [weights])

  const hasMonthlyData = monthlyAverages.length >= 2

  return (
    <XStack w="100%" gap="$4" jc="center" fw="wrap">
      {/* Chart Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onChartPress}
        mih={160}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Graph
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          {hasWeightData ? (
            <MiniLineChart weights={weights} />
          ) : (
            <Text fontSize="$3" ta="center">
              Not enough weight entries yet.
            </Text>
          )}
        </YStack>
      </Card>

      {/* Monthly Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onMonthlyPress}
        mih={160}
      >
        <YStack gap="$3" f={1} jc="space-between">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Monthly
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          {hasMonthlyData ? (
            <MiniLineChart weights={monthlyAverages} />
          ) : (
            <Text fontSize="$3" ta="center">
              Not enough monthly data yet.
            </Text>
          )}
        </YStack>
      </Card>
    </XStack>
  )
}
