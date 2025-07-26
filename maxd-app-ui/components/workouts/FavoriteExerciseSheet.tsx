import { Sheet } from '@tamagui/sheet'
import { useState } from 'react'
import { Button, Card, Input, ScrollView, Text, XStack, YStack } from 'tamagui'

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

  const filtered = favorites.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      dismissOnSnapToBottom
      zIndex={100000}
      disableDrag
    >
      <Sheet.Overlay />=
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="800" textAlign="center">
            Select a Favorite Exercise
          </Text>

          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$4"
            mb="$3"
          />

          <ScrollView>
  <YStack gap="$3">
    {filtered.map((exercise, i) => (
      <Button
        key={i}
        size="$5"
        onPress={() => {
          onSelect(exercise)
          onOpenChange(false)
        }}
        px="$4"
        py="$3"
        br="$4"
      >
        <XStack ai="center" jc="center" gap="$2" w="100%">
          <Text fontSize="$5" fontWeight="600">
            {exercise.name}
          </Text>
        </XStack>
      </Button>
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
