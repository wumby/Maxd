import { useMemo, useState } from 'react'
import { YStack, XStack, Text, Card, ScrollView, Button, Input, Separator } from 'tamagui'
import { Sheet } from '@tamagui/sheet'
import { useRouter } from 'expo-router'
import { ChevronLeft, Filter, X as CloseIcon } from '@tamagui/lucide-icons'
import { ScreenContainer } from '@/components/ScreenContainer'
import { Fallback } from '@/components/Fallback'
import { useWorkouts } from '@/hooks/useWorkouts'

type RangeFilter = 'all' | '3mo' | '30d'
type ExerciseCategory = 'weights' | 'bodyweight' | 'cardio'

function distanceToMiles(distance: number, unit?: string | null) {
  if (!distance || !unit) return 0
  switch (unit) {
    case 'km':
      return distance * 0.621371
    case 'm':
      return distance * 0.000621371
    default:
      return distance
  }
}

function formatDuration(seconds?: number) {
  if (!seconds || Number.isNaN(seconds)) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (!h && !m) parts.push(`${s}s`)
  return parts.join(' ')
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value)
}

function getRangeBoundary(range: RangeFilter) {
  const boundary = new Date()
  if (range === '3mo') {
    boundary.setMonth(boundary.getMonth() - 3)
  } else if (range === '30d') {
    boundary.setDate(boundary.getDate() - 30)
  }
  return boundary
}

export default function VolumeScreen() {
  const router = useRouter()
  const { workouts, loading } = useWorkouts('all')

  const [view, setView] = useState<'workouts' | 'exercises'>('workouts')
  const [showTimeFilters, setShowTimeFilters] = useState(false)
  const [showWorkoutFilters, setShowWorkoutFilters] = useState(false)
  const [showExerciseFilters, setShowExerciseFilters] = useState(false)
  const [selectedWorkoutNames, setSelectedWorkoutNames] = useState<Set<string>>(new Set())
  const [selectedExerciseNames, setSelectedExerciseNames] = useState<Set<string>>(new Set())
  const [exerciseCategory, setExerciseCategory] = useState<ExerciseCategory>('weights')
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('3mo')
  const [yearFilter, setYearFilter] = useState<string | null>(null)

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      const workoutDate = toDate(workout.created_at)
      if (Number.isNaN(workoutDate.getTime())) return false
      if (yearFilter && workoutDate.getFullYear().toString() !== yearFilter) return false
      if (rangeFilter !== 'all') {
        const boundary = getRangeBoundary(rangeFilter)
        if (workoutDate < boundary) return false
      }
      return true
    })
  }, [workouts, rangeFilter, yearFilter])

  const yearOptions = useMemo(() => {
    const years = new Set(filteredWorkouts.map(workout => toDate(workout.created_at).getFullYear()))
    return Array.from(years)
      .filter(year => !Number.isNaN(year))
      .sort((a, b) => b - a)
      .map(String)
  }, [filteredWorkouts])

  const workoutNameOptions = useMemo(() => {
    const names = new Set<string>()
    filteredWorkouts.forEach(workout => {
      if (workout.title) names.add(workout.title)
    })
    return Array.from(names).sort()
  }, [filteredWorkouts])

  const exerciseNameOptions = useMemo(() => {
    const names = new Set<string>()
    filteredWorkouts.forEach(workout => {
      ;(workout.exercises || []).forEach((exercise: any) => {
        const label = exercise.name?.trim()
        if (label) names.add(label)
      })
    })
    return Array.from(names).sort()
  }, [filteredWorkouts])

  const totalWorkoutCounts = useMemo(() => {
    const counts = new Map<
      string,
      { count: number; first: Date; last: Date }
    >()

    filteredWorkouts.forEach(workout => {
      const name = workout.title || 'Workout'
      const date = toDate(workout.created_at)
      if (Number.isNaN(date.getTime())) return
      const existing = counts.get(name)
      if (existing) {
        existing.count += 1
        if (date < existing.first) existing.first = date
        if (date > existing.last) existing.last = date
      } else {
        counts.set(name, { count: 1, first: date, last: date })
      }
    })

    return Array.from(counts.entries()).map(([name, info]) => ({
      name,
      count: info.count,
      firstDate: info.first.toLocaleDateString(),
      lastDate: info.last.toLocaleDateString(),
    }))
  }, [filteredWorkouts])

  const filteredWorkoutCounts = useMemo(() => {
    if (selectedWorkoutNames.size === 0) return totalWorkoutCounts
    return totalWorkoutCounts.filter(workout => selectedWorkoutNames.has(workout.name))
  }, [selectedWorkoutNames, totalWorkoutCounts])

  const exerciseVolumes = useMemo(() => {
    const weightsMap = new Map<string, number>()
    const bodyweightMap = new Map<string, number>()
    const cardioMap = new Map<string, { distance: number; duration: number }>()

    filteredWorkouts.forEach(workout => {
      ;(workout.exercises || []).forEach((exercise: any) => {
        const name = exercise.name?.trim() || 'Exercise'
        switch (exercise.type) {
          case 'bodyweight': {
            const reps = (exercise.sets || []).reduce((setTotal: number, set: any) => {
              return setTotal + (Number(set.reps) || 0)
            }, 0)
            if (!reps) return
            bodyweightMap.set(name, (bodyweightMap.get(name) || 0) + reps)
            break
          }
          case 'cardio': {
            const totals = cardioMap.get(name) || { distance: 0, duration: 0 }
            ;(exercise.sets || []).forEach((set: any) => {
              const distance = Number(set.distance) || 0
              const duration = Number(set.duration || set.durationSeconds) || 0
              totals.distance += distanceToMiles(distance, set.distance_unit)
              totals.duration += duration
            })
            cardioMap.set(name, totals)
            break
          }
          default: {
            const volume = (exercise.sets || []).reduce((setTotal: number, set: any) => {
              const weight = Number(set.weight) || 0
              const reps = Number(set.reps) || 0
              return setTotal + weight * reps
            }, 0)
            if (!volume) return
            weightsMap.set(name, (weightsMap.get(name) || 0) + volume)
          }
        }
      })
    })

    return {
      weights: Array.from(weightsMap.entries())
        .map(([name, total]) => ({
          name,
          value: total,
          label: `${Math.round(total).toLocaleString()} lbs`,
        }))
        .sort((a, b) => b.value - a.value),
      bodyweight: Array.from(bodyweightMap.entries())
        .map(([name, reps]) => ({
          name,
          value: reps,
          label: `${Math.round(reps).toLocaleString()} reps`,
        }))
        .sort((a, b) => b.value - a.value),
      cardio: Array.from(cardioMap.entries())
        .map(([name, totals]) => ({
          name,
          value: totals.distance,
          label: `${totals.distance.toFixed(2)} mi in ${formatDuration(totals.duration)}`,
        }))
        .sort((a, b) => b.value - a.value),
    }
  }, [filteredWorkouts])

  const exerciseList = useMemo(() => {
    const list =
      exerciseCategory === 'bodyweight'
        ? exerciseVolumes.bodyweight
        : exerciseCategory === 'cardio'
        ? exerciseVolumes.cardio
        : exerciseVolumes.weights

    if (selectedExerciseNames.size === 0) return list
    return list.filter(exercise => selectedExerciseNames.has(exercise.name))
  }, [exerciseCategory, exerciseVolumes, selectedExerciseNames])

  const timeSummary =
    (rangeFilter === '30d'
      ? 'Last 30 days'
      : rangeFilter === '3mo'
      ? 'Last 3 months'
      : 'All days') + ` • ${yearFilter || 'All years'}`

  const workoutFilterSummary =
    selectedWorkoutNames.size === 0
      ? 'All workouts'
      : `${selectedWorkoutNames.size} selected`
  const exerciseFilterSummary =
    selectedExerciseNames.size === 0
      ? 'All exercises'
      : `${selectedExerciseNames.size} selected`

  if (loading) {
    return (
      <ScreenContainer>
        <Fallback />
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <YStack f={1} gap="$4">
        <XStack ai="center" jc="space-between">
          <Button
            size="$3"
            circular
            icon={ChevronLeft}
            onPress={() => router.back()}
            aria-label="Back"
          />
          <Text fontSize="$9" fontWeight="800">
            Volume
          </Text>
          <Button
            size="$3"
            circular
            icon={Filter}
            onPress={() => setShowTimeFilters(true)}
            aria-label="Time filters"
          />
        </XStack>

        <XStack gap="$2">
          {(['workouts', 'exercises'] as const).map(option => {
            return (
              <Button
                key={option}
                flex={1}
                size="$4"
                theme={view === option ? 'active' : undefined}
                onPress={() => setView(option)}
              >
                {option === 'workouts' ? 'Workouts' : 'Exercises'}
              </Button>
            )
          })}
        </XStack>

        <YStack gap="$2">
          <Text fontSize="$3" color="$gray10">
            {timeSummary}
          </Text>

          <XStack gap="$2" flexWrap="wrap">
            <Button
              size="$3"
              onPress={() => setShowTimeFilters(true)}
              iconAfter={<Filter size={16} />}
            >
              Time Filters
            </Button>

            {view === 'workouts' ? (
              <Button
                size="$3"
                onPress={() => setShowWorkoutFilters(true)}
                disabled={workoutNameOptions.length === 0}
              >
                {workoutFilterSummary}
              </Button>
            ) : (
              <Button
                size="$3"
                onPress={() => setShowExerciseFilters(true)}
                disabled={exerciseNameOptions.length === 0}
              >
                {exerciseFilterSummary}
              </Button>
            )}
          </XStack>
        </YStack>

        {view === 'exercises' && (
          <XStack gap="$2" flexWrap="wrap">
            {([
              { key: 'weights', label: 'Weights' },
              { key: 'bodyweight', label: 'Bodyweight' },
              { key: 'cardio', label: 'Cardio' },
            ] as { key: ExerciseCategory; label: string }[]).map(option => {
              return (
                <Button
                  key={option.key}
                  size="$3"
                  theme={exerciseCategory === option.key ? 'active' : undefined}
                  onPress={() => setExerciseCategory(option.key)}
                >
                  {option.label}
                </Button>
              )
            })}
          </XStack>
        )}

        <ScrollView>
          <YStack gap="$3" pb="$8">
            {view === 'workouts'
              ? filteredWorkoutCounts.map(workout => (
                  <Card key={workout.name} p="$4" bordered elevate>
                    <YStack gap="$2">
                      <XStack jc="space-between" ai="center">
                        <Text fontSize="$7" fontWeight="700">
                          {workout.name}
                        </Text>
                        <Text fontSize="$6" fontWeight="700">
                          {workout.count}x
                        </Text>
                      </XStack>
                      <Text fontSize="$3" color="$gray10">
                        First: {workout.firstDate} • Last: {workout.lastDate}
                      </Text>
                    </YStack>
                  </Card>
                ))
              : exerciseList.map(exercise => (
                  <Card key={exercise.name} p="$4" bordered elevate>
                    <YStack gap="$1">
                      <Text fontSize="$7" fontWeight="700">
                        {exercise.name}
                      </Text>
                      <Text fontSize="$5" color="$gray11">
                        {exercise.label}
                      </Text>
                    </YStack>
                  </Card>
                ))}

            {(view === 'workouts' && filteredWorkoutCounts.length === 0) ||
            (view === 'exercises' && exerciseList.length === 0) ? (
              <Text fontSize="$4" textAlign="center" color="$gray10" mt="$4">
                Nothing to show for the selected filters yet.
              </Text>
            ) : null}
          </YStack>
        </ScrollView>
      </YStack>

      <TimeFilterSheet
        open={showTimeFilters}
        onOpenChange={setShowTimeFilters}
        years={yearOptions}
        range={rangeFilter}
        onRangeChange={setRangeFilter}
        year={yearFilter}
        onYearChange={setYearFilter}
      />

      <MultiSelectSheet
        title="Filter Workouts"
        open={showWorkoutFilters}
        onOpenChange={setShowWorkoutFilters}
        options={workoutNameOptions}
        selected={selectedWorkoutNames}
        onToggle={name =>
          setSelectedWorkoutNames(prev => {
            const next = new Set(prev)
            if (next.has(name)) {
              next.delete(name)
            } else {
              next.add(name)
            }
            return next
          })
        }
        onClear={() => setSelectedWorkoutNames(new Set())}
      />

      <MultiSelectSheet
        title="Filter Exercises"
        open={showExerciseFilters}
        onOpenChange={setShowExerciseFilters}
        options={exerciseNameOptions}
        selected={selectedExerciseNames}
        onToggle={name =>
          setSelectedExerciseNames(prev => {
            const next = new Set(prev)
            if (next.has(name)) {
              next.delete(name)
            } else {
              next.add(name)
            }
            return next
          })
        }
        onClear={() => setSelectedExerciseNames(new Set())}
      />
    </ScreenContainer>
  )
}

function TimeFilterSheet({
  open,
  onOpenChange,
  years,
  year,
  onYearChange,
  range,
  onRangeChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  years: string[]
  year: string | null
  onYearChange: (value: string | null) => void
  range: RangeFilter
  onRangeChange: (value: RangeFilter) => void
}) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4">
          <SheetHeader title="Time Filters" onClose={() => onOpenChange(false)} />
          <Separator />

          <YStack gap="$3">
            <Text fontSize="$6" fontWeight="700">
              Year
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              <FilterChip
                label="All Years"
                selected={!year}
                onPress={() => onYearChange(null)}
              />
              {years.map(option => (
                <FilterChip
                  key={option}
                  label={option}
                  selected={year === option}
                  onPress={() => onYearChange(option)}
                />
              ))}
            </XStack>
          </YStack>

          <Separator />

          <YStack gap="$3">
            <Text fontSize="$6" fontWeight="700">
              Range
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {[
                { label: 'All Days', value: 'all' },
                { label: 'Last 3 Months', value: '3mo' },
                { label: 'Last 30 Days', value: '30d' },
              ].map(option => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  selected={range === option.value}
                  onPress={() => onRangeChange(option.value as RangeFilter)}
                />
              ))}
            </XStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

function MultiSelectSheet({
  title,
  open,
  onOpenChange,
  options,
  selected,
  onToggle,
  onClear,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return options.filter(option => option.toLowerCase().includes(search.toLowerCase()))
  }, [options, search])

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      disableDrag
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" bg="$background">
        <YStack gap="$4" f={1}>
          <SheetHeader title={title} onClose={() => onOpenChange(false)} />
          <Separator />

          <Input placeholder="Search..." value={search} onChangeText={setSearch} />

          <ScrollView>
            <YStack gap="$2" mt="$3">
              <Button onPress={onClear}>Show All</Button>
              {filtered.map(option => {
                const active = selected.has(option)
                return (
                  <Button
                    key={option}
                    onPress={() => onToggle(option)}
                    backgroundColor={active ? '$color9' : 'transparent'}
                    color={active ? '$color1' : '$color11'}
                    borderWidth={1}
                    borderColor="$color8"
                  >
                    {active ? '✓ ' : ''}
                    {option}
                  </Button>
                )
              })}

              {filtered.length === 0 && (
                <Text fontSize="$4" color="$gray10" textAlign="center" mt="$4">
                  No matches found
                </Text>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <XStack position="relative" ai="center" jc="center" h={40}>
      <Button
        chromeless
        icon={CloseIcon}
        onPress={onClose}
        position="absolute"
        left={0}
        aria-label="Close"
      >
        Close
      </Button>
      <Text fontSize="$8" fontWeight="800">
        {title}
      </Text>
      <XStack position="absolute" right={0} width={60} />
    </XStack>
  )
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Button
      onPress={onPress}
      size="$3"
      backgroundColor={selected ? '$color9' : 'transparent'}
      color={selected ? '$color1' : '$color11'}
      borderWidth={1}
      borderColor="$color8"
    >
      {label}
    </Button>
  )
}
