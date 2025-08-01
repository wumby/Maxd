import React, { useState, useMemo, useCallback, useRef } from 'react'
import { YStack, Text, ScrollView, XStack, Card, Separator, useTheme, useThemeName } from 'tamagui'
import { ChevronDown, ChevronUp, ChevronLeft, Ellipsis } from '@tamagui/lucide-icons'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YearFilterItem } from '../weights/YearFilterItem'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { deleteWorkout, fetchWorkouts } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'
import { createSavedWorkout, deleteSavedWorkout } from '@/services/savedWorkoutsService'
import { useToast } from '@/contexts/ToastContextProvider'
import { ConfirmDeleteSheet } from '../ConfirmDeleteSheet'
import { WorkoutActionSheet } from './WorkoutActionSheet'
import { useFocusEffect, useRouter } from 'expo-router'

export default function WorkoutHistory({
  workouts,
  onClose,
  setWorkouts,
}: {
  workouts: any[]
  onClose: () => void
  setWorkouts: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null)
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const insets = useSafeAreaInsets()
  const bgColor = theme.background.val
  const { token } = useAuth()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')
  const shouldRefresh = useRef(false);
useFocusEffect(
  useCallback(() => {
    if (!shouldRefresh.current) return
    if (token) {
      console.log('hji')
      fetchWorkouts(token)
        .then(setWorkouts)
        .catch(err => {
          console.error('Failed to refresh workouts', err)
        })
    }
  }, [token])
)
  const years = useMemo(() => {
    const uniqueYears = new Set(workouts.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [workouts])

  const rangeCutoff = useMemo(() => {
    const selected = workouts.filter(w => {
      const date = new Date(w.created_at)
      return filter === 'All Years' || date.getFullYear().toString() === filter
    })

    if (selected.length === 0 || range === 'all') return null

    const latestDate = new Date(Math.max(...selected.map(w => new Date(w.created_at).getTime())))
    const cutoff = new Date(latestDate)
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    else if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)

    return cutoff
  }, [workouts, filter, range])

  const filtered = useMemo(() => {
    return workouts.filter(w => {
      const date = new Date(w.created_at)
      const matchYear = filter === 'All Years' || date.getFullYear().toString() === filter
      const matchRange = !rangeCutoff || date >= rangeCutoff
      return matchYear && matchRange
    })
  }, [filter, workouts, rangeCutoff])

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }

  const confirmDelete = async () => {
    if (!confirmId) return
    try {
      await deleteWorkout(token, confirmId)
      setWorkouts(prev => prev.filter(w => w.id !== confirmId))
      showToast('Workout deleted ')
    } catch (err) {
      console.error('Failed to delete workout:', err)
      showToast('Failed to delete workout ', 'warn')
    } finally {
      setConfirmId(null)
    }
  }

  const handleToggleFavorite = async (workout: any) => {
    if (!token) return
    try {
      const newFavorite = !workout.favorite

      if (newFavorite) {
        await createSavedWorkout(token, {
          title: workout.title,
          exercises: workout.exercises,
        })
        showToast(`${workout.title || 'Workout'} added to favorites`)
      } else {
        await deleteSavedWorkout(token, workout.title)
        showToast(`${workout.title || 'Workout'} removed from favorites`)
      }

      setWorkouts(prev =>
        prev.map(w => (w.id === workout.id ? { ...w, favorite: newFavorite } : w))
      )
    } catch (err) {
      console.error('Failed to toggle favorite workout:', err)
      showToast('Error updating favorite')
    }
  }

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={100}
      bg={bgColor}
      paddingTop={insets.top}
    >
      {/* Header */}
      <YStack px="$4" pt="$4" pb="$2">
        <XStack jc="space-between" ai="center" mb="$3">
          <Pressable onPress={onClose} hitSlop={10}>
            <XStack fd="row" ai="center" gap="$2">
              <ChevronLeft size={20} color={theme.color.val} />
              <Text fontSize="$5" fontWeight="600" color="$color">
                Back
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
            Workouts
          </Text>
        </Animated.View>

        {/* Year Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" mb="$3" px="$4">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={filter === val}
                onPress={() => setFilter(val)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        {/* Range Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" mb="$4" px="$4">
            {[
              { label: 'All Days', val: 'all' },
              { label: 'Last 3 Months', val: '3mo' },
              { label: 'Last 30 Days', val: '30d' },
            ].map(opt => (
              <YearFilterItem
                key={opt.val}
                val={opt.label}
                selected={range === opt.val}
                onPress={() => setRange(opt.val as any)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
          Showing {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of {filter === 'All Years' ? 'all years' : filter}
        </Text>
      </YStack>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={12}
        removeClippedSubviews
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: workout, index }) => {
          const isOpen = expanded === workout.id
          const workoutDate = new Date(workout.created_at).toLocaleDateString()

          return (
            <Animated.View entering={FadeInUp.duration(300).delay(index * 30)}>
              <Card elevate bg="$color2" p="$4" gap="$3" br="$6" my="$2">
                <XStack ai="center" jc="space-between">
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
                  <Pressable onPress={() => setSelectedWorkout(workout)} hitSlop={10}>
                    <Text fontSize="$8"><Ellipsis size={26} /></Text>
                  </Pressable>
                </XStack>

                {isOpen && (
                  <YStack gap="$4" mt="$3">
                    {workout.exercises.map((ex: any, i: number) => (
                      <YStack key={i} gap="$2">
                        <Text fontSize="$5" fontWeight="700">
                          {ex.name}
                        </Text>
                        <YStack ml="$2" gap="$1">
                          {ex.sets?.map((set: any, j: number) => (
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

      <WorkoutActionSheet
        open={!!selectedWorkout}
        onOpenChange={() => setSelectedWorkout(null)}
         onEdit={() => {
    if (selectedWorkout) {
      shouldRefresh.current = true;
      router.push({
        pathname: '/tabs/workouts/newWorkout',
        params: { workoutId: selectedWorkout.id },
      })
    }
    setSelectedWorkout(null)
  }}
        onDelete={() => {
          setConfirmId(selectedWorkout?.id)
          setSelectedWorkout(null)
        }}
        onToggleFavorite={() => {
          if (selectedWorkout) handleToggleFavorite(selectedWorkout)
          setSelectedWorkout(null)
        }}
        workoutTitle={selectedWorkout?.title}
        isFavorite={selectedWorkout?.favorite}
      />

      <ConfirmDeleteSheet
        open={confirmId !== null}
        onOpenChange={() => setConfirmId(null)}
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
      />
    </YStack>
  )
}

function renderSetLine(type: string, set: any, unit: 'kg' | 'lb') {
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
      const duration = formatDuration(set.duration || set.durationSeconds)
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