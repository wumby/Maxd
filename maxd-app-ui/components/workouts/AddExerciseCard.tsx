import { useEffect, useState } from 'react'
import { YStack, XStack, Text, Button, Input, Separator } from 'tamagui'
import { Trash2, ChevronDown, Clock } from '@tamagui/lucide-icons'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { ExerciseTypeSheet } from './ExerciseTypeSheet'
import { TimerPickerModal } from 'react-native-timer-picker'

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
  const [showTypeSheet, setShowTypeSheet] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null)

  const rotation = useSharedValue(expanded ? 180 : 0)

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, { duration: 200 })
  }, [expanded])

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }))

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : '', s > 0 ? `${s}s` : '']
      .filter(Boolean)
      .join(' ')
  }

  return (
    <YStack gap="$3">
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

          <XStack gap="$2">
            <Input
              flex={3}
              placeholder="Exercise name"
              value={exercise.name}
              onChangeText={text => onChangeName(index, text)}
              returnKeyType="done"
            />
            <Button flex={1} size="$3" onPress={() => setShowTypeSheet(true)}>
              {exercise.type}
            </Button>
          </XStack>

          <ExerciseTypeSheet
            open={showTypeSheet}
            onOpenChange={setShowTypeSheet}
            onSelect={type => {
              onChangeType(index, type)
              setShowTypeSheet(false)
            }}
          />

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
                ) : (<>
  <Button
    size="$3"
    icon={Clock}
    flex={1.2}
    onPress={() => {
      setShowDurationPicker(true)
      setActiveSetIndex(setIndex)
    }}
  >
    {set.durationSeconds
      ? formatDuration(Number(set.durationSeconds))
      : 'Pick Duration'}
  </Button>

  <Input
    flex={1}
    keyboardType="numeric"
    placeholder="Distance (mi)"
    value={set.distance || ''}
    onChangeText={val => onChangeSet(index, setIndex, 'distance', val)}
    returnKeyType="done"
  /></>

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

      <TimerPickerModal
        visible={showDurationPicker}
        onConfirm={({ hours, minutes, seconds }) => {
          if (activeSetIndex !== null) {
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            onChangeSet(index, activeSetIndex, 'durationSeconds', String(totalSeconds))
          }
          setShowDurationPicker(false)
        }}
        onCancel={() => setShowDurationPicker(false)}
        setIsVisible={setShowDurationPicker}
      />

      <Separator />
    </YStack>
  )
}
