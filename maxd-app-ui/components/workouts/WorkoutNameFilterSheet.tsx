// components/workouts/WorkoutNameFilterSheet.tsx
import { Sheet } from '@tamagui/sheet'
import { useState, useMemo } from 'react'
import { Button, Input, ScrollView, Text, XStack, YStack, Separator } from 'tamagui'
import { X } from '@tamagui/lucide-icons'

export function WorkoutNameFilterSheet({
  open,
  onOpenChange,
  names,
  selectedName,
  setSelectedName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  names: string[]
  selectedName: string | null
  setSelectedName: (name: string | null) => void
}) {
  const [search, setSearch] = useState('')

  const filteredNames = useMemo(() => {
    return names.filter(name => name.toLowerCase().includes(search.toLowerCase()))
  }, [names, search])

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={100_000}
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          {/* Header */}
          <XStack position="relative" ai="center" mb="$2" h={40} jc="center">
            <Button
              chromeless
              icon={X}
              onPress={() => onOpenChange(false)}
              position="absolute"
              left={0}
            >
              Cancel
            </Button>

            <Text fontSize="$8" fontWeight="800" textAlign="center">
              Filter by Name
            </Text>

            <XStack position="absolute" right={0} width={80} />
          </XStack>

          <Separator />

          {/* Search input */}
          <Input
            placeholder="Search workouts..."
            value={search}
            onChangeText={setSearch}
            size="$4"
          />

          {/* List */}
          <ScrollView>
            <YStack gap="$3" mt="$3">
              <Button
                size="$5"
                onPress={() => {
                  setSelectedName(null)
                  onOpenChange(false)
                }}
              >
                All Workouts
              </Button>

              {filteredNames.map((name, i) => (
                <Button
                  key={i}
                  size="$5"
                  onPress={() => {
                    setSelectedName(name)
                    onOpenChange(false)
                  }}
                >
                  {name}
                </Button>
              ))}

              {filteredNames.length === 0 && (
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
