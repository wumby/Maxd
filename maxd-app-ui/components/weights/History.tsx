import React from 'react'
import { YStack, Text, XStack, Card, useTheme } from 'tamagui'
import { FlatList, Pressable } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { Ellipsis } from '@tamagui/lucide-icons'
import { WeightEntry } from '@/types/Weight'
import { useAuth } from '@/contexts/AuthContext'

interface HistoryProps {
  visible: boolean
  onClose: () => void
  weights: WeightEntry[]
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>
  onEdit: (weight: WeightEntry) => void
  onDelete: (id: number) => void
}

export default function History({ visible, weights, onEdit }: HistoryProps) {
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const { user } = useAuth()
  const goalMode = user?.goal_mode
  if (!visible) return null

  return (
    <YStack f={1} px="$4" pt="$2">
      <FlatList
        data={weights}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 64 }}
        ListEmptyComponent={
          <Text textAlign="center" fontSize="$5" color="$gray10" mt="$6">
            No entries
          </Text>
        }
        renderItem={({ item, index }) => {
          const prev = weights[index + 1]
          const delta = prev ? item.value - prev.value : 0
          const convertWeight = (val?: number | string) => {
            const num = typeof val === 'number' ? val : parseFloat(val!)
            if (isNaN(num)) return '--'
            const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(num) : num
            return converted.toFixed(1)
          }

          const getDeltaColor = () => {
            if (!prev) return '$gray10'
            const mode = goalMode ?? 'track'

            if (mode === 'track') return theme.color.val
            if (delta === 0) return '$gray10'
            if (mode === 'lose') return delta < 0 ? 'green' : 'red'
            if (mode === 'gain') return delta > 0 ? 'green' : 'red'
            return '$gray10'
          }

          return (
            <Animated.View entering={FadeInUp.duration(300).delay(index * 40)} key={item.id}>
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

                {prev && (
                  <Text color={getDeltaColor()} fontSize="$3" mt="$2">
                    {delta === 0
                      ? '±0'
                      : `${delta > 0 ? '+' : '−'}${convertWeight(Math.abs(delta))} ${weightUnit}`}
                  </Text>
                )}
              </Card>
            </Animated.View>
          )
        }}
      />
    </YStack>
  )
}
