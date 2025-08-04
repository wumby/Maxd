import React, { useState } from 'react'
import { YStack, Text, XStack, Card, Separator } from 'tamagui'
import { ChevronDown, ChevronUp, Ellipsis } from '@tamagui/lucide-icons'
import { FlatList, Pressable } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { Workout, Set } from '@/types/Workout'

export default function WorkoutHistory({
  workouts,
  onSelectWorkout,
}: {
  workouts: Workout[]
  onSelectWorkout: (w: Workout) => void
}) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { weightUnit } = usePreferences()
  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }
  if (workouts.length === 0) {
    return (
      <YStack f={1} jc="center" ai="center" px="$4">
        <Text color="$gray10" fontSize="$5" textAlign="center">
          No workouts found.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack f={1}>
      <FlatList
        data={workouts}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={12}
        removeClippedSubviews
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: workout, index }) => {
          const isOpen = expanded === workout.id
          const workoutDate = new Date(workout.created_at).toLocaleDateString()

          return (
            <Animated.View entering={FadeInUp.duration(300).delay(index * 30)} key={workout.id}>
              <Card elevate bg="$color2" p="$4" gap="$3" br="$6" my="$2">
                <XStack ai="center" jc="space-between" onPress={() => toggleExpand(workout.id)}>
                  <Pressable onPress={() => toggleExpand(workout.id)} hitSlop={10}>
                    <YStack>
                      <XStack ai="center" gap="$2">
                        <Text fontSize="$6" fontWeight="700">
                          {workout.title || 'Untitled Workout'}
                        </Text>
                        {isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                      </XStack>
                      <Text fontSize="$3" color="$gray10">
                        {workoutDate}
                      </Text>
                    </YStack>
                  </Pressable>
                  <Pressable onPress={() => onSelectWorkout(workout)} hitSlop={10}>
                    <Text fontSize="$8">
                      <Ellipsis size={26} />
                    </Text>
                  </Pressable>
                </XStack>

                {isOpen && (
                  <YStack gap="$4" mt="$3">
                    {workout.exercises.map((ex, i) => (
                      <YStack key={ex.id} gap="$2">
                        <Text fontSize="$5" fontWeight="700">
                          {ex.name}
                        </Text>
                        <YStack ml="$2" gap="$1">
                          {ex.sets?.map((set, j) => (
                            <Text key={j} fontSize="$4" color="$gray10">
                              {renderSetLine(ex.type, set, weightUnit)}
                            </Text>
                          ))}
                        </YStack>
                        {i < workout.exercises.length - 1 && <Separator />}
                      </YStack>
                    ))}
                  </YStack>
                )}
              </Card>
            </Animated.View>
          )
        }}
      />
    </YStack>
  )
}

function renderSetLine(type: string, set: Set, unit: 'kg' | 'lb') {
  switch (type) {
    case 'weights': {
      const raw = set.weight ?? '--'
      const weight =
        raw !== '--'
          ? unit === 'lb'
            ? `${WeightUtil.kgToLbs(raw).toFixed(1)}`
            : `${Number(raw).toFixed(1)}`
          : '--'
      return `${set.reps || '--'} reps @ ${weight} ${unit}`
    }
    case 'bodyweight':
      return `${set.reps || '--'} reps`
    case 'cardio': {
      const distance = set.distance || '--'
      const unitLabel = set.distance_unit || 'mi'
      const duration = formatDuration(set.duration ?? set.durationSeconds)
      return `${distance} ${unitLabel} in ${duration}`
    }
    default:
      return 'Unknown set'
  }
}

function formatDuration(seconds?: number) {
  if (!seconds || isNaN(seconds)) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (!h && !m) parts.push(`${s}s`)
  return parts.join(' ')
}
