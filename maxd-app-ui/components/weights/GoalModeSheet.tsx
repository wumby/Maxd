import { Sheet } from '@tamagui/sheet'
import { Button, Text, YStack } from 'tamagui'
import { Alert } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { updateGoalMode } from '@/services/weightService'

export function GoalModeSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
}) {
  const { token, updateUser } = useAuth()

  const handleSelectGoal = async (mode: 'lose' | 'gain' | 'track') => {
    try {
      if (!token) throw new Error('You are not logged in.')
      const updated = await updateGoalMode(token, mode)
      await updateUser(updated)
      onOpenChange(false)
    } catch (err: any) {
      console.error('Error updating goal_mode:', err)
      Alert.alert('Error', err.message || 'Could not update goal.')
    }
  }

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[70]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="800" textAlign="center">
            Select Your Goal
          </Text>

          {([
            { label: 'Lose Weight', value: 'lose' },
            { label: 'Gain Weight', value: 'gain' },
            { label: 'Just Track', value: 'track' },
          ] as const).map(goal => (
            <Button
              key={goal.value}
              size="$4"
              onPress={() => handleSelectGoal(goal.value)}
            >
              {goal.label}
            </Button>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
