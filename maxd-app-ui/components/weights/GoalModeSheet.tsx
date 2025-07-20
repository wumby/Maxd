import { Sheet, Text, Button, YStack, Card } from 'tamagui'
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
    <Sheet open={open} onOpenChange={onOpenChange} snapPoints={[60]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" gap="$4">
        <Text fontSize="$8" fontWeight="700" textAlign="center">
          Edit Goal
        </Text>

        <YStack gap="$3" mt="$2">
          <Card padded bordered elevate onPress={() => handleSelectGoal('lose')}>
            <Text fontSize="$5" fontWeight="600">
              Lose weight
            </Text>
          </Card>

          <Card padded bordered elevate onPress={() => handleSelectGoal('gain')}>
            <Text fontSize="$5" fontWeight="600">
              Gain weight
            </Text>
          </Card>

          <Card padded bordered elevate onPress={() => handleSelectGoal('track')}>
            <Text fontSize="$5" fontWeight="600">
              Just track
            </Text>
          </Card>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
