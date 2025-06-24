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

export function CardsTop({ onChartPress, onMonthlyPress, weights = [], extras }: Props) {
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
      .slice(-6) // only last 6 months

    return sorted.map(item => ({ value: Number(item.avg.toFixed(1)) }))
  }, [weights])

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
        <YStack gap="$3">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Graph
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>
          <MiniLineChart weights={weights} />
        </YStack>
      </Card>
      {/* History Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onMonthlyPress}
      >
        <YStack gap="$3">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              Monthly
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          <YStack gap="$2" width="100%">
            <MiniLineChart weights={monthlyAverages} />
          </YStack>
        </YStack>
      </Card>
    </XStack>
  )
}
