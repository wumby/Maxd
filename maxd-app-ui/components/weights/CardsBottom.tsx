import { Card, Text, XStack, YStack } from 'tamagui'
import { Expand } from '@tamagui/lucide-icons'
import { useMemo } from 'react'

interface Props {
  onHistoryPress: () => void
  onMonthlyPress: () => void
  weights?: { value: number; created_at: string }[]
  extras?: {
    allTimeDelta?: number
    avg7Days?: number
  }
}

export function CardsBottom({ onHistoryPress, onMonthlyPress, weights = [], extras }: Props) {
  const latestThree = weights.slice(0, 3)
  const monthlyAverages = useMemo(() => {
    const map = new Map<string, number[]>()

    weights.forEach(({ created_at, value }) => {
      const date = new Date(created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(Number(value))
    })

    return Array.from(map.entries())
      .map(([key, values]) => {
        const [year, month] = key.split('-').map(Number)
        return {
          year,
          month: month - 1,
          average: values.reduce((sum, v) => sum + v, 0) / values.length,
        }
      })
      .sort((a, b) => b.year - a.year || b.month - a.month)
  }, [weights])

  return (
    <XStack w="100%" gap="$4" jc="center" fw="wrap">
      {/* Chart Card */}
      <Card
        elevate
        p="$4"
        width="45%"
        mih={160}
        br="$5"
        bg="$background"
        pressStyle={{ scale: 0.98 }}
        onPress={onHistoryPress}
      >
        <YStack gap="$3">
          <XStack jc="space-between" ai="center">
            <Text fontWeight="800" fontSize="$7">
              History
            </Text>
            <Expand size="$1" color="$gray9" />
          </XStack>

          <YStack gap="$2" width="100%">
            <XStack jc="space-between">
              <Text fontSize="$2" color="$gray10">
                Date
              </Text>
              <Text fontSize="$2" color="$gray10">
                Weight
              </Text>
            </XStack>

            {latestThree.map((w, i) => {
              const date = new Date(w.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
              return (
                <XStack jc="space-between" key={i}>
                  <Text fontSize="$3">{date}</Text>
                  <Text fontSize="$3">{w.value} lb</Text>
                </XStack>
              )
            })}
          </YStack>
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
            <XStack jc="space-between">
              <Text fontSize="$2" color="$gray10">
                Month
              </Text>
              <Text fontSize="$2" color="$gray10">
                Avg
              </Text>
            </XStack>

            {monthlyAverages.slice(0, 3).map((entry, i) => (
              <XStack jc="space-between" key={`preview-${entry.year}-${entry.month}-${i}`}>
                <Text fontSize="$3">
                  {new Date(entry.year, entry.month).toLocaleDateString('en-US', {
                    month: 'short',
                  })}
                  , {entry.year}
                </Text>
                <Text fontSize="$3">{entry.average.toFixed(1)} lb</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </Card>
    </XStack>
  )
}
