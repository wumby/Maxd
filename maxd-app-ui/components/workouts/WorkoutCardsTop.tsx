import { useMemo } from 'react'
import { Card, Text, XStack, YStack } from 'tamagui'
import { Expand } from '@tamagui/lucide-icons'
import { MiniLineChart } from '../weights/MiniLineChart'

interface Props {
  workouts?: {
    created_at: string
    exercises?: {
      name?: string
      type?: 'weights' | 'bodyweight' | 'cardio'
      sets?: {
        weight?: number
        reps?: number
        distance?: number
        distance_unit?: string
      }[]
    }[]
  }[]
  onVolumePress: () => void
  onProgressPress: () => void
}

export function WorkoutCardsTop({ workouts = [], onVolumePress, onProgressPress }: Props) {
  const totalVolume = useMemo(() => {
    return workouts.reduce((total, w) => {
      const workoutVolume = (w.exercises || []).reduce((wVol, ex) => {
        return (
          wVol +
          (ex.sets || []).reduce((sVol, set) => {
            const weight = Number(set.weight) || 0
            const reps = Number(set.reps) || 0
            return sVol + weight * reps
          }, 0)
        )
      }, 0)
      return total + workoutVolume
    }, 0)
  }, [workouts])

  const exerciseOptions = useMemo(() => {
    const names = new Set<string>()
    workouts.forEach(workout => {
      ;(workout.exercises || []).forEach(exercise => {
        const name = exercise.name?.trim()
        if (name) names.add(name)
      })
    })
    return Array.from(names).sort()
  }, [workouts])

  const activeExercise = exerciseOptions[0] || null

  const exerciseSeries = useMemo(() => {
    if (!activeExercise) return []
    const entries: { date: Date; value: number }[] = []

    workouts.forEach(workout => {
      const date = new Date(workout.created_at)
      let total = 0

      ;(workout.exercises || []).forEach(exercise => {
        if (exercise.name?.trim() !== activeExercise) return
        if (exercise.type === 'bodyweight') {
          const reps = (exercise.sets || []).reduce(
            (sum, set) => sum + (Number(set.reps) || 0),
            0
          )
          total += reps
        } else if (exercise.type === 'cardio') {
          const distance = (exercise.sets || []).reduce((sum, set) => {
            const raw = Number(set.distance) || 0
            return sum + distanceToMiles(raw, set.distance_unit)
          }, 0)
          total += distance
        } else {
          const volume = (exercise.sets || []).reduce((sum, set) => {
            const weight = Number(set.weight) || 0
            const reps = Number(set.reps) || 0
            return sum + weight * reps
          }, 0)
          total += volume
        }
      })

      if (total > 0) {
        entries.push({ date, value: total })
      }
    })

    return entries
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(entry => ({ value: entry.value }))
  }, [activeExercise, workouts])

  return (
    <>
      <XStack w="100%" gap="$4" jc="center" fw="wrap" mb="$4">
        {/* Volume Card */}
        <Card
          elevate
          p="$4"
          width="45%"
          mih={160}
          br="$5"
          bg="$background"
          pressStyle={{ scale: 0.98 }}
          onPress={onVolumePress}
        >
          <YStack gap="$3" f={1} jc="space-between">
            <XStack jc="space-between" ai="center">
              <Text fontWeight="800" fontSize="$7">
                Volume
              </Text>
              <Expand size="$1" color="$gray9" />
            </XStack>

            <YStack ai="center" jc="center" f={1}>
              <Text fontSize="$8" fontWeight="900">
                {Math.round(totalVolume).toLocaleString()}
              </Text>
              <Text fontSize="$3" color="$gray10">
                total lbs lifted
              </Text>
            </YStack>
          </YStack>
        </Card>

        {/* Progress Card */}
        <Card
          elevate
          p="$4"
          width="45%"
          mih={160}
          br="$5"
          bg="$background"
          pressStyle={{ scale: 0.98 }}
          onPress={onProgressPress}
        >
          <YStack gap="$3" f={1} jc="space-between">
            <XStack jc="space-between" ai="center">
              <Text fontWeight="800" fontSize="$7">
                Progress
              </Text>
              <Expand size="$1" color="$gray9" />
            </XStack>

            {exerciseSeries.length >= 2 ? (
              <YStack ai="center" jc="center" f={1}>
                <MiniLineChart weights={exerciseSeries.slice(-6)} width={160} height={100} />
              </YStack>
            ) : (
              <YStack ai="center" jc="center" f={1}>
                <Text fontSize="$3" color="$gray10">
                  Keep logging this exercise to see progress.
                </Text>
              </YStack>
            )}
          </YStack>
        </Card>
      </XStack>

    </>
  )
}

function distanceToMiles(distance: number, unit?: string | null) {
  if (!distance || !unit) return distance
  switch (unit) {
    case 'km':
      return distance * 0.621371
    case 'm':
      return distance * 0.000621371
    default:
      return distance
  }
}
