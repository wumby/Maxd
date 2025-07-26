import { Sheet } from '@tamagui/sheet'
import { useState } from 'react'
import {
  Button,
  Input,
  ScrollView,
  Text,
  XStack,
  YStack,
  Separator,
} from 'tamagui'
import { X } from '@tamagui/lucide-icons'

export function ExerciseFilterSheet({
  open,
  onOpenChange,
  selectedExercise,
  onSelect,
  exerciseNames,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedExercise: string | null
  onSelect: (name: string | null) => void
  exerciseNames: string[]
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = exerciseNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      dismissOnSnapToBottom
      zIndex={100_000}
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          {/* Header */}
          <XStack position="relative" ai="center" mb="$2" h={40} jc="center">
  {/* Cancel button absolutely on the left */}
  <Button
    chromeless
    icon={X}
    onPress={() => onOpenChange(false)}
    position="absolute"
    left={0}
  >
    Cancel
  </Button>

  {/* Centered title */}
  <Text fontSize="$8" fontWeight="800" textAlign="center">
    Filter by Exercise
  </Text>

  {/* Spacer on right to balance Cancel button */}
  <XStack position="absolute" right={0} width={80} />
</XStack>


          <Separator />

          {/* Search and List */}
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            size="$4"
          />

          <ScrollView>
            <YStack gap="$3" mt="$3">
              <Button
                size="$5"
                onPress={() => {
                  onSelect(null)
                  onOpenChange(false)
                }}
              >
                All Exercises
              </Button>

              {filtered.map((name, i) => (
                <Button
                  key={i}
                  size="$5"
                  onPress={() => {
                    onSelect(name)
                    onOpenChange(false)
                  }}
                >
                  {name}
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
