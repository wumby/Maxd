import { Sheet } from '@tamagui/sheet'
import { useState } from 'react'
import {
  Card,
  Input,
  ScrollView,
  Text,
  YStack,
} from 'tamagui'

interface Exercise {
  id?: number
  name: string
  type: 'weights' | 'cardio' | 'bodyweight'
  sets: any[]
}

export function FavoriteExerciseSheet({
  open,
  onOpenChange,
  favorites,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorites: Exercise[]
  onSelect: (exercise: Exercise) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = favorites.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      dismissOnSnapToBottom
      zIndex={100_000}
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="800" textAlign="center">
            Select a Favorite Exercise
          </Text>

          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$4"
            mb="$3"
          />

          <ScrollView style={{ maxHeight: 300 }}>
            <YStack gap="$3">
              {filtered.map((exercise, i) => (
                <Card
                  key={i}
                  elevate
                  p="$4"
                  br="$4"
                  bg="$background"
                  pressStyle={{ scale: 0.98 }}
                  onPress={() => {
                    onSelect(exercise)
                    onOpenChange(false)
                  }}
                >
                  <YStack>
                    <Text fontSize="$5" fontWeight="600">
                      {exercise.name}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {exercise.type}
                    </Text>
                  </YStack>
                </Card>
              ))}
              {filtered.length === 0 && (
                <Text fontSize="$4" color="$gray10" textAlign="center" mt="$2">
                  No exercises found
                </Text>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
