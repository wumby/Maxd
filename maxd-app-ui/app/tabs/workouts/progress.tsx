import { useEffect, useMemo, useState } from 'react'
import { YStack, Text, Button, Card, ScrollView, XStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { ScreenContainer } from '@/components/ScreenContainer'
import { Fallback } from '@/components/Fallback'
import { useWorkouts } from '@/hooks/useWorkouts'
import ExerciseFilterSheet from '@/components/workouts/ExerciseFilterSheet'
import { MiniLineChart } from '@/components/weights/MiniLineChart'

type EntryType = 'weights' | 'bodyweight' | 'cardio'

export default function ProgressScreen() {
  const router = useRouter()
  const { workouts, loading } = useWorkouts('all')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const exerciseNames = useMemo(() => {
    const names = new Set<string>()
    workouts.forEach(workout => {
      ;(workout.exercises || []).forEach((exercise: any) => {
        const name = exercise.name?.trim()
        if (name) names.add(name)
      })
    })
    return Array.from(names).sort()
  }, [workouts])

  useEffect(() => {
    if (exerciseNames.length === 0) {
      if (selectedExercise) setSelectedExercise(null)
      return
    }
    if (!selectedExercise || !exerciseNames.includes(selectedExercise)) {
      setSelectedExercise(exerciseNames[0])
    }
  }, [exerciseNames, selectedExercise])

  const activeExercise =
    selectedExercise && exerciseNames.includes(selectedExercise)
      ? selectedExercise
      : exerciseNames[0] || null

  const entries = useMemo(() => {
    if (!activeExercise) return []

    const results: { date: Date; value: number; type: EntryType }[] = []

    workouts.forEach(workout => {
      const date = new Date(workout.created_at)
      let total = 0
      let entryType: EntryType | null = null

      ;(workout.exercises || []).forEach((exercise: any) => {
        if (exercise.name?.trim() !== activeExercise) return
        entryType = (exercise.type as EntryType) || 'weights'

        switch (entryType) {
          case 'bodyweight': {
            const reps = (exercise.sets || []).reduce((sum: number, set: any) => {
              return sum + (Number(set.reps) || 0)
            }, 0)
            total += reps
            break
          }
          case 'cardio': {
            const distance = (exercise.sets || []).reduce((sum: number, set: any) => {
              const raw = Number(set.distance) || 0
              return sum + distanceToMiles(raw, set.distance_unit)
            }, 0)
            total += distance
            break
          }
          default: {
            const volume = (exercise.sets || []).reduce((sum: number, set: any) => {
              const weight = Number(set.weight) || 0
              const reps = Number(set.reps) || 0
              return sum + weight * reps
            }, 0)
            total += volume
          }
        }
      })

      if (total > 0 && entryType) {
        results.push({ date, value: total, type: entryType })
      }
    })

    return results.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [activeExercise, workouts])

  const chartData = entries.map(entry => ({ value: entry.value }))
  const latest = entries.at(-1)
  const best = entries.reduce(
    (top, entry) => (top && top.value >= entry.value ? top : entry),
    latest || null
  )

  const unit =
    latest?.type === 'cardio' ? 'mi' : latest?.type === 'bodyweight' ? 'reps' : 'lbs'
  const summaryUnit = best?.type === 'cardio' ? 'mi' : best?.type === 'bodyweight' ? 'reps' : 'lbs'

  if (loading) {
    return (
      <ScreenContainer>
        <Fallback />
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <YStack gap="$4" f={1}>
        <XStack ai="center" jc="space-between">
          <Button
            size="$3"
            circular
            icon={ChevronLeft}
            onPress={() => router.back()}
            aria-label="Back"
          />
          <Text fontSize="$9" fontWeight="800">
            Progress
          </Text>
          <XStack width={40} />
        </XStack>

        <Card p="$4" bordered elevate>
          <YStack gap="$3">
            <Text fontSize="$3" color="$gray10">
              Exercise
            </Text>
            <Text fontSize="$7" fontWeight="700">
              {activeExercise || 'None selected'}
            </Text>
            <Button
              onPress={() => setSheetOpen(true)}
              disabled={exerciseNames.length === 0}
              size="$3"
            >
              Choose Exercise
            </Button>

            {entries.length >= 2 ? (
              <MiniLineChart weights={chartData} width={260} height={120} />
            ) : (
              <Text fontSize="$3" color="$gray10">
                Need at least two sessions for a chart. Keep logging!
              </Text>
            )}

            {latest && (
              <XStack jc="space-between">
                <YStack>
                  <Text fontSize="$2" color="$gray10">
                    Last Session
                  </Text>
                  <Text fontSize="$6" fontWeight="700">
                    {latest.value.toFixed(1)} {unit}
                  </Text>
                </YStack>
                {best && (
                  <YStack ai="flex-end">
                    <Text fontSize="$2" color="$gray10">
                      Best Session
                    </Text>
                    <Text fontSize="$6" fontWeight="700">
                      {best.value.toFixed(1)} {summaryUnit}
                    </Text>
                  </YStack>
                )}
              </XStack>
            )}
          </YStack>
        </Card>

        <Text fontSize="$5" fontWeight="700">
          Session History
        </Text>
        <ScrollView>
          <YStack gap="$3" pb="$8">
            {entries
              .slice()
              .reverse()
              .map((entry, index) => (
                <Card key={`${entry.date.toISOString()}-${index}`} p="$3" bordered>
                  <XStack jc="space-between" ai="center">
                    <Text fontSize="$4">
                      {entry.date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text fontSize="$4" fontWeight="700">
                      {entry.value.toFixed(1)} {getUnit(entry.type)}
                    </Text>
                  </XStack>
                </Card>
              ))}
            {entries.length === 0 && (
              <Text fontSize="$4" color="$gray10" textAlign="center">
                No logs for this exercise yet.
              </Text>
            )}
          </YStack>
        </ScrollView>
      </YStack>

      <ExerciseFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedExercise={activeExercise}
        onSelect={name => {
          setSelectedExercise(name)
          setSheetOpen(false)
        }}
        exerciseNames={exerciseNames}
      />
    </ScreenContainer>
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

function getUnit(type: EntryType) {
  switch (type) {
    case 'cardio':
      return 'mi'
    case 'bodyweight':
      return 'reps'
    default:
      return 'lbs'
  }
}
