import { useState } from 'react'
import { YStack, Text, Button, ScrollView, XStack, Card, Separator, View } from 'tamagui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { ScreenContainer } from '../ScreenContainer'

export default function WorkoutHistory({
  workouts,
  onClose,
}: {
  workouts: any[]
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <ScreenContainer>
      <XStack ai="center" jc="space-between" mb="$2">
        <Button size="$3" onPress={onClose}>
          Back
        </Button>
        <Text fontSize="$8" fontWeight="800">
          Workout History
        </Text>
        <View w={60} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" pb="$8">
          {workouts.map(workout => {
            const isOpen = expanded === workout.id
            const workoutDate = new Date(workout.created_at).toLocaleDateString()

            return (
              <Card key={workout.id} elevate bg="$color2" p="$4" gap="$3" br="$6">
                <XStack jc="space-between" ai="center" onPress={() => toggleExpand(workout.id)}>
                  <Text fontSize="$5" fontWeight="700">
                    {workoutDate}
                  </Text>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </XStack>

                {isOpen && (
                  <YStack gap="$3" mt="$2">
                    {workout.exercises.map((ex: any, i: number) => (
                      <YStack key={i} gap="$1">
                        <Text fontSize="$4" fontWeight="600">
                          {ex.name}
                        </Text>
                        <YStack ml="$2" gap="$1">
                          {ex.sets?.map((set: any, j: number) => (
                            <Text key={j} fontSize="$3" color="$gray10">
                              {set.reps || '--'} reps @ {set.weight || '--'} lbs
                            </Text>
                          ))}
                        </YStack>
                        {i < workout.exercises.length - 1 && <Separator />}
                      </YStack>
                    ))}
                  </YStack>
                )}
              </Card>
            )
          })}
        </YStack>
      </ScrollView>
    </ScreenContainer>
  )
}
