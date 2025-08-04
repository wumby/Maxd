import { useState, useMemo, useCallback } from 'react'
import { Button, YStack, Text, XStack } from 'tamagui'
import { useRouter, useFocusEffect } from 'expo-router'
import { Pencil } from '@tamagui/lucide-icons'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { fetchWeights } from '@/services/weightService'
import { useFetch } from '@/hooks/useFetch'
import { GoalModeSheet } from '@/components/weights/GoalModeSheet'
import { CardsTop } from '@/components/weights/CardsTop'
import { CardsBottom } from '@/components/weights/CardsBottom'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { ScreenContainer } from '@/components/ScreenContainer'

export default function WeightIndex() {
  const { user } = useAuth()
  const { weightUnit } = usePreferences()
  const router = useRouter()
  const { data: weights = [], execute: fetchData } = useFetch(fetchWeights)
  const [goalModeSheetVisible, setGoalModeSheetVisible] = useState(false)

  useFocusEffect(
    useCallback(() => {
      const loadWeights = async () => {
        try {
          await fetchData()
        } catch (err: any) {
          if (err?.message === 'Invalid or expired token') {
            router.replace('/login')
          } else {
            console.error('Error fetching weights:', err)
          }
        }
      }

      loadWeights()
    }, [fetchData])
  )

  const currentWeight = useMemo(() => {
    if (weights.length === 0) return '--'
    const val = Number(weights[0].value)
    if (isNaN(val)) return '--'
    const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(val) : val
    return `${converted.toFixed(1)} ${weightUnit}`
  }, [weights, weightUnit])

  const goalLabel = useMemo(() => {
    if (!user) return null
    switch (user.goal_mode || 'track') {
      case 'lose':
        return 'Goal: Lose weight'
      case 'gain':
        return 'Goal: Gain weight'
      default:
        return 'Goal: Just tracking'
    }
  }, [user])

  return (
    <ScreenContainer>
      <TabTransitionWrapper tabPosition={1}>
        <YStack f={1} jc="space-evenly" gap="$4">
          <CardsTop
            onChartPress={() => router.push('/tabs/weight/chart')}
            onMonthlyPress={() => router.push('/tabs/weight/monthlyChart')}
            weights={weights}
          />

          <YStack ai="center" gap="$4">
            <Text fontSize="$9" fontWeight="700">
              Current: {currentWeight}
            </Text>

            {goalLabel && (
              <XStack ai="center" gap="$2">
                <Text fontSize="$6" color="$gray10">
                  {goalLabel}
                </Text>
                <Button
                  chromeless
                  size="$2"
                  onPress={() => setGoalModeSheetVisible(true)}
                  icon={<Pencil size={18} />}
                />
              </XStack>
            )}
          </YStack>

          <YStack ai="center">
            <Button size="$5" onPress={() => router.push('/tabs/weight/newWeight')}>
              Log New Weight
            </Button>
          </YStack>

          <CardsBottom
            onHistoryPress={() => router.push('/tabs/weight/history')}
            onMonthlyPress={() => router.push('/tabs/weight/monthlyHistory')}
            weights={weights}
          />
        </YStack>
      </TabTransitionWrapper>
      <GoalModeSheet open={goalModeSheetVisible} onOpenChange={setGoalModeSheetVisible} />
    </ScreenContainer>
  )
}
