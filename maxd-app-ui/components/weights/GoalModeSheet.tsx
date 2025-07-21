import { Sheet } from '@tamagui/sheet'
import { Button, Text, YStack } from 'tamagui'
import { Alert } from 'react-native'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'

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
      if (!token) {
        console.warn('No token available')
        Alert.alert('Error', 'You are not logged in.')
        return
      }

      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal_mode: mode }),
      })

      const responseText = await res.text()
      console.log('PATCH /users/me', res.status, responseText)

      if (!res.ok) throw new Error(responseText)

      const updated = JSON.parse(responseText)
      await updateUser(updated)
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating goal_mode:', err)
      Alert.alert('Error', 'Could not update goal.')
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
