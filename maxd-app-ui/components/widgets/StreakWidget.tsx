import { Card, Text } from 'tamagui'

export function StreakWidget() {
  return (
    <Card p="$4" mb="$3" br="$5">
      <Text fontSize="$6" fontWeight="700">Current Streak</Text>
      <Text fontSize="$8" fontWeight="800">10 Days!</Text>
    </Card>
  )
}
