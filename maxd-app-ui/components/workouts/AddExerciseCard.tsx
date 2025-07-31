import React, { useEffect, useState } from 'react'
import { YStack, XStack, Text, Button, Input, Separator, Portal } from 'tamagui' // ✅ Portal here
import { Trash2, ChevronDown } from '@tamagui/lucide-icons'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { ExerciseTypeSheet } from './ExerciseTypeSheet'
import { DistanceUnitSheet } from './DistanceUnitSheet'
import { usePreferences } from '@/contexts/PreferencesContext'
import { DurationPickerSheet } from './DurationPickerSheet'

const distanceUnitLabels: Record<'mi' | 'km' | 'm' | 'steps', string> = {
  mi: 'Miles',
  km: 'Kilometers',
  m: 'Meters',
  steps: 'Steps',
}

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
  onRemove?: (index: number) => void
}) {
  const [showTypeSheet, setShowTypeSheet] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null)
  const [showDistanceUnitSheet, setShowDistanceUnitSheet] = useState(false)
  const [distanceUnitSetIndex, setDistanceUnitSetIndex] = useState<number | null>(null)
  const [initialDuration, setInitialDuration] = useState<number>(0)

  const rotation = useSharedValue(expanded ? 180 : 0)
  const { weightUnit } = usePreferences()

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
    <>
      <YStack gap="$3">
        <XStack jc="space-between" ai="center">
          <XStack ai="center" gap="$2" flex={1}>
            <Text fontWeight="600" fontSize="$6">
              {exercise.name.trim() || 'New Exercise'}
            </Text>
            {!!onRemove && (
              <Button chromeless size="$3" onPress={() => onToggleExpand(index)}>
                <Animated.View style={animatedChevronStyle}>
                  <ChevronDown size={20} />
                </Animated.View>
              </Button>
            )}
          </XStack>

          {!!onRemove && (
            <Button chromeless size="$5" icon={Trash2} onPress={() => onRemove(index)} />
          )}
        </XStack>

        {expanded && (
          <YStack gap="$3">
            <XStack gap="$2">
              <YStack flex={1.7}>
                <Text fontSize="$2" color="$gray10" pb="$1">
                  Exercise Name
                </Text>
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChangeText={text => onChangeName(index, text)}
                  returnKeyType="done"
                />
              </YStack>

              <YStack flex={1.3}>
                <Text fontSize="$2" color="$gray10" pb="$1">
                  Type
                </Text>
                <Button f={1} onPress={() => setShowTypeSheet(true)} iconAfter={ChevronDown}>
                  {exercise.type}
                </Button>
              </YStack>
            </XStack>

            {exercise.sets.map((set: any, setIndex: number) => {
              const isLast = setIndex === exercise.sets.length - 1
              return (
                <XStack
                  key={setIndex}
                  gap="$3"
                  flexWrap="wrap"
                  ai="flex-start"
                  w="100%"
                  jc="space-between"
                >
                  {['weights', 'bodyweight'].includes(exercise.type) ? (
                    <>
                      <YStack flex={1}>
                        <Text fontSize="$2" color="$gray10" pb="$1">
                          Reps
                        </Text>
                        <Input
                          keyboardType="numeric"
                          value={set.reps}
                          onChangeText={val => onChangeSet(index, setIndex, 'reps', val)}
                          returnKeyType="done"
                        />
                      </YStack>

                      {exercise.type === 'weights' && (
                        <YStack flex={1}>
                          <Text fontSize="$2" color="$gray10" pb="$1">
                            Weight ({weightUnit})
                          </Text>
                          <Input
                            keyboardType="numeric"
                            value={set.weight}
                            onChangeText={val => onChangeSet(index, setIndex, 'weight', val)}
                            returnKeyType="done"
                          />
                        </YStack>
                      )}
                    </>
                  ) : (
                    <XStack gap="$4" w="80%" ai="flex-start">
                      <YStack flex={1.5} gap="$2">
                        <Text fontSize="$2" color="$gray10">
                          Duration
                        </Text>
                        <Button
                          size="$4"
                          h={48}
                          onPress={() => {
                            setShowDurationPicker(true)
                            setInitialDuration(Number(set.duration) || 0)
                            setActiveSetIndex(setIndex)
                          }}
                          justifyContent="flex-start"
                          w="100%"
                        >
                          {set.duration ? formatDuration(Number(set.duration)) : 'Pick Duration'}
                        </Button>
                      </YStack>

                      <YStack flex={1.5} gap="$2">
                        <Text fontSize="$2" color="$gray10">
                          Distance
                        </Text>
                        <Input
                          keyboardType="numeric"
                          placeholder="e.g. 2.5"
                          value={set.distance !== undefined && set.distance !== null ? String(set.distance) : ''}
                          onChangeText={val => onChangeSet(index, setIndex, 'distance', val)}
                          returnKeyType="done"
                        />

                        <Button
                          size="$3"
                          onPress={() => {
                            setShowDistanceUnitSheet(true)
                            setDistanceUnitSetIndex(setIndex)
                          }}
                          iconAfter={ChevronDown}
                          justifyContent="space-between"
                        >
                          {distanceUnitLabels[
                            set.distance_unit as keyof typeof distanceUnitLabels
                          ] || 'Miles'}
                        </Button>
                      </YStack>
                    </XStack>
                  )}

                  <YStack ai="center" gap="$1">
                    <Text fontSize="$1" color="$gray10">
                      {isLast ? 'Add Set' : 'Remove'}
                    </Text>
                    <Button
                      chromeless
                      size="$4"
                      icon={!isLast ? Trash2 : undefined}
                      onPress={() =>
                        isLast ? onAddSet(index) : onRemoveSet(index, setIndex)
                      }
                      accessibilityLabel={isLast ? 'Add Set' : 'Remove Set'}
                    >
                      {isLast && (
                        <Text fontSize="$7" fontWeight="700">
                          +
                        </Text>
                      )}
                    </Button>
                  </YStack>
                </XStack>
              )
            })}
          </YStack>
        )}

        <Separator />
      </YStack>

      {/* ✅ Use Portals for overlays */}
      <Portal>
        <ExerciseTypeSheet
          open={showTypeSheet}
          onOpenChange={setShowTypeSheet}
          onSelect={type => {
            onChangeType(index, type)
            setShowTypeSheet(false)
          }}
        />
      </Portal>

      <Portal>
        <DurationPickerSheet
          open={showDurationPicker}
          onOpenChange={setShowDurationPicker}
          onConfirm={totalSeconds => {
            if (activeSetIndex !== null) {
              onChangeSet(index, activeSetIndex, 'duration', String(totalSeconds))
            }
          }}
          value={initialDuration}
        />
      </Portal>

      {distanceUnitSetIndex !== null && (
        <Portal>
          <DistanceUnitSheet
            open={showDistanceUnitSheet}
            onOpenChange={open => {
              setShowDistanceUnitSheet(open)
              if (!open) setDistanceUnitSetIndex(null)
            }}
            current={exercise.sets[distanceUnitSetIndex]?.distance_unit}
            onSelect={unit => {
              if (distanceUnitSetIndex !== null) {
                onChangeSet(index, distanceUnitSetIndex, 'distance_unit', unit)
              }
            }}
          />
        </Portal>
      )}
    </>
  )
}
