import { useEffect, useState } from 'react'
import { YStack, XStack, Text, Button, Input, Separator } from 'tamagui'
import { Trash2, ChevronDown } from '@tamagui/lucide-icons'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const EXERCISE_TYPES = ['weights', 'bodyweight', 'cardio'] as const

export function AddExerciseCard({
  exercise,
  index,
  expanded,
  onToggleExpand,
  onChangeName,
  onChangeType,
  onAddSet,
  onRemoveSet,
  onChangeSet,
  onRemove,
  onSave,
  isSaved,
  error,
}: {
  exercise: any
  index: number
  expanded: boolean
  onToggleExpand: (index: number) => void
  onChangeName: (index: number, name: string) => void
  onChangeType: (index: number, type: string) => void
  onAddSet: (index: number) => void
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void
  onChangeSet: (exerciseIndex: number, setIndex: number, field: string, value: string) => void
  onRemove: (index: number) => void
  onSave: (exercise: any) => void
  isSaved: boolean
  error?: string
}) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const rotation = useSharedValue(expanded ? 180 : 0)

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, { duration: 200 })
  }, [expanded])

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }))

  return (
    <YStack gap="$3">
      {/* Header with title, star, chevron, and delete */}
      <XStack jc="space-between" ai="center">
        <XStack ai="center" gap="$2" flex={1}>
          <Text fontWeight="600" fontSize="$6">
            {exercise.name.trim() || 'New Exercise'}
          </Text>
          <Button chromeless size="$2" onPress={() => onSave(exercise)}>
            <Text fontSize="$5">{isSaved ? '★' : '☆'}</Text>
          </Button>
          <Button chromeless size="$3" onPress={() => onToggleExpand(index)}>
            <Animated.View style={animatedChevronStyle}>
              <ChevronDown size={20} />
            </Animated.View>
          </Button>
        </XStack>

        <Button chromeless size="$2" icon={Trash2} onPress={() => onRemove(index)} />
      </XStack>

      {expanded && (
        <YStack gap="$3">
          {error && (
            <Text color="$red10" fontSize="$4">
              {error}
            </Text>
          )}

          {/* Exercise Name + Type Dropdown */}
          <XStack gap="$2">
            <Input
              flex={3}
              placeholder="Exercise name"
              value={exercise.name}
              onChangeText={text => onChangeName(index, text)}
              returnKeyType="done"
            />
            <Button flex={1} size="$3" onPress={() => setShowTypeDropdown(prev => !prev)}>
              {exercise.type}
            </Button>
          </XStack>

          {showTypeDropdown && (
            <YStack gap="$1">
              {EXERCISE_TYPES.map(type => (
                <Button
                  key={type}
                  chromeless
                  onPress={() => {
                    onChangeType(index, type)
                    setShowTypeDropdown(false)
                  }}
                >
                  {type}
                </Button>
              ))}
            </YStack>
          )}

          {/* Sets */}
          {exercise.sets.map((set: any, setIndex: number) => {
            const isLast = setIndex === exercise.sets.length - 1
            return (
              <XStack key={setIndex} gap="$2" flexWrap="wrap" ai="center">
                {['weights', 'bodyweight'].includes(exercise.type) ? (
                  <>
                    <Input
                      flex={1}
                      keyboardType="numeric"
                      placeholder="Reps"
                      value={set.reps}
                      onChangeText={val => onChangeSet(index, setIndex, 'reps', val)}
                      returnKeyType="done"
                    />
                    {exercise.type === 'weights' && (
                      <Input
                        flex={1}
                        keyboardType="numeric"
                        placeholder="Weight (lbs)"
                        value={set.weight}
                        onChangeText={val => onChangeSet(index, setIndex, 'weight', val)}
                        returnKeyType="done"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      flex={1}
                      placeholder="Duration (min)"
                      value={set.duration}
                      onChangeText={val => onChangeSet(index, setIndex, 'duration', val)}
                      returnKeyType="done"
                    />
                    <Input
                      flex={1}
                      placeholder="Distance (mi)"
                      value={set.distance}
                      onChangeText={val => onChangeSet(index, setIndex, 'distance', val)}
                      returnKeyType="done"
                    />
                  </>
                )}

                {!isLast && (
                  <Button
                    chromeless
                    size="$4"
                    icon={Trash2}
                    onPress={() => onRemoveSet(index, setIndex)}
                  />
                )}

                {isLast && (
                  <Button
                    chromeless
                    size="$4"
                    onPress={() => onAddSet(index)}
                    accessibilityLabel="Add Set"
                  >
                    <Text fontSize="$7" fontWeight="700">
                      +
                    </Text>
                  </Button>
                )}
              </XStack>
            )
          })}
        </YStack>
      )}

      <Separator />
    </YStack>
  )
}
