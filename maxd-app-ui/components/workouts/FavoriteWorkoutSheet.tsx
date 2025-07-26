import { Sheet } from '@tamagui/sheet'
import { useState } from 'react'
import { Button, Card, Input, ScrollView, Text, XStack, YStack } from 'tamagui'

interface FavoriteWorkout {
  id?: number
  title: string
  created_at?: string
  exercises: any[]
}

export function FavoriteWorkoutSheet({
  open,
  onOpenChange,
  favorites,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorites: FavoriteWorkout[]
  onSelect: (workout: FavoriteWorkout) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = favorites.filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()))

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
      <Sheet.Handle backgroundColor="$gray6" />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <Text fontSize="$8" fontWeight="800" textAlign="center">
            Select a Favorite Workout
          </Text>

          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$4"
            mb="$3"
          />

          <ScrollView>
  <YStack gap="$3">
    {filtered.map((workout, i) => (
   <Button
  key={i}
  size="$5"
  onPress={() => {
    onSelect(workout)
    onOpenChange(false)
  }}
  px="$4"
  py="$3"
  br="$4"
>
  <XStack ai="center" jc="center" gap="$2" w="100%">
    <Text fontSize="$5" fontWeight="600">
      {workout.title}
    </Text>
  </XStack>
</Button>


    ))}

    {filtered.length === 0 && (
      <Text fontSize="$4" color="$gray10" textAlign="center" mt="$2">
        No workouts found
      </Text>
    )}
  </YStack>
</ScrollView>

        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
