import { Card, Text } from 'tamagui'

export function LastWorkoutWidget() {
  return (
    <Card p="$4" mb="$3" br="$5">
      <Text fontSize="$6" fontWeight="700">Last Workout</Text>
      <Text fontSize="$8" fontWeight="800">182.4 lb</Text>
    </Card>
  )
}
