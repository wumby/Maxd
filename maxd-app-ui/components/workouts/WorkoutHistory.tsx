import { useState } from 'react'
import { YStack, Text, Button, ScrollView, XStack } from 'tamagui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'

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
    <YStack f={1} bg="$background" p="$4" gap="$4">
      <Button size="$3" onPress={onClose}>
        Back
      </Button>
      <Text fontSize="$7" fontWeight="bold">
        Workout History
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" pb="$8">
          {workouts.map(workout => {
            const isOpen = expanded === workout.id
            return (
              <YStack key={workout.id} bg="$color1" p="$4" br="$4" gap="$2">
                <XStack jc="space-between" ai="center" onPress={() => toggleExpand(workout.id)}>
                  <Text fontWeight="600">{new Date(workout.created_at).toLocaleDateString()}</Text>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </XStack>

                {isOpen &&
                  workout.exercises.map((ex: any, i: number) => (
                    <YStack key={i} mt="$2" ml="$2">
                      <Text fontWeight="500">{ex.name}</Text>
                      {ex.sets?.map((set: any, j: number) => (
                        <Text key={j} color="$gray10" fontSize="$3" ml="$2">
                          {set.reps} reps @ {set.weight} lbs
                        </Text>
                      ))}
                    </YStack>
                  ))}
              </YStack>
            )
          })}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
