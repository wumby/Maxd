import { useMemo, useState, useCallback, useEffect } from 'react'
import { YStack, Text, XStack, Card, Button, useTheme, useThemeName } from 'tamagui'
import { ChevronLeft, ChevronDown, ChevronUp, Ellipsis } from '@tamagui/lucide-icons'
import { Pressable, Modal, View, FlatList, ScrollView } from 'react-native'
import { YearFilterItem } from '../weights/YearFilterItem'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { ScreenContainer } from '../ScreenContainer'
import ExerciseFilterSheet from './ExerciseFilterSheet'
import { deleteExercise } from '@/services/exerciseService'
import { useAuth } from '@/contexts/AuthContext'
import { createSavedExercise, deleteSavedExercise } from '@/services/savedExerciseService'
import { useToast } from '@/contexts/ToastContextProvider'
import { EditExercise } from './EditExercise'
import { ExerciseActionSheet } from './ExerciseActionSheet'

interface ExerciseHistoryProps {
  exercises: any[]
  onClose: () => void
  setWorkouts: React.Dispatch<React.SetStateAction<any[]>>
  savedExercises: any[]
  setSavedExercises: React.Dispatch<React.SetStateAction<any[]>>
  showHeader?: boolean
  wrapInContainer?: boolean
  onEditingChange?: (isEditing: boolean) => void
  yearFilter?: string
  onYearFilterChange?: (year: string) => void
  rangeFilter?: 'all' | '30d' | '3mo'
  onRangeFilterChange?: (range: 'all' | '30d' | '3mo') => void
  onExerciseFilterChange?: (name: string | null) => void
}

export default function ExerciseHistory({
  exercises,
  onClose,
  setWorkouts,
  savedExercises,
  setSavedExercises,
  showHeader = true,
  wrapInContainer = true,
  onEditingChange,
  yearFilter,
  onYearFilterChange,
  rangeFilter = '3mo',
  onRangeFilterChange,
  onExerciseFilterChange,
}: ExerciseHistoryProps) {
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const { token } = useAuth()

  const [filterExercise, setFilterExercise] = useState<string | null>(null)
  const [currentYearFilter, setCurrentYearFilter] = useState<'All Years' | string>(
    yearFilter || 'All Years'
  )
  const [currentRangeFilter, setCurrentRangeFilter] = useState<'all' | '30d' | '3mo'>(
    rangeFilter
  )
  const [showSheet, setShowSheet] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editingExercise, setEditingExercise] = useState<any | null>(null)
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'history' | 'edit'>('history')
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)
  const [actionExercise, setActionExercise] = useState<any | null>(null)
  const { showToast } = useToast()
  const isFavorited = (ex: any) =>
    savedExercises.some(saved => saved.name.toLowerCase() === ex.name.trim().toLowerCase())
  const toggleFavorite = async (ex: any) => {
    const name = ex.name.trim()
    const existing = savedExercises.find(saved => saved.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      try {
        await deleteSavedExercise(token, existing.id)
        setSavedExercises(prev => prev.filter(s => s.id !== existing.id))
        showToast(`${name} removed from favorites`)
      } catch (err) {
        console.error('Failed to remove favorite:', err)
        showToast('Error removing favorite')
      }
    } else {
      try {
        const saved = await createSavedExercise(token, {
          name,
          type: ex.type,
          sets: ex.sets,
        })
        setSavedExercises(prev => [saved, ...prev])
        showToast(`${name} added to favorites`)
      } catch (err) {
        console.error('Failed to add favorite:', err)
        showToast('Error adding favorite')
      }
    }
  }

  const years = useMemo(() => {
    const uniqueYears = new Set(exercises.map(e => new Date(e.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [exercises])

  const exerciseNames = useMemo(() => {
    const names = new Set(exercises.map(e => e.name.trim()))
    return Array.from(names).sort()
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter(e => !filterExercise || e.name.trim() === filterExercise)
  }, [exercises, filterExercise])

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      await deleteExercise(token, exerciseId)
      setWorkouts(prev =>
        prev.map(workout => ({
          ...workout,
          exercises: workout.exercises.filter((ex: any) => ex.id !== exerciseId),
        }))
      )
      setConfirmId(null)
    } catch (err) {
      console.error('Failed to delete exercise:', err)
    }
  }

  const handleEditSelectedExercise = () => {
    if (!actionExercise) return
    const current = actionExercise
    setEditingWorkoutId(current.workout_id)
    setEditingExercise(current)
    setViewMode('edit')
    setActionExercise(null)
  }

  const handleDeleteSelectedExercise = () => {
    if (!actionExercise) return
    const current = actionExercise
    setConfirmId(current.id)
    setActionExercise(null)
  }

  const handleToggleFavoriteSelected = () => {
    if (!actionExercise) return
    const current = actionExercise
    toggleFavorite(current).finally(() => setActionExercise(null))
  }

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const ex = item
      const isOpen = expandedExercise === ex.id
      const date = new Date(ex.created_at).toLocaleDateString()
      return (
        <Animated.View entering={FadeInUp.duration(300).delay(index * 20)}>
          <Card elevate bg="$color2" p="$4" gap="$3" br="$6" my="$2">
            <XStack jc="space-between" ai="center">
              <Pressable
                onPress={() =>
                  setExpandedExercise(prev => (prev === ex.id ? null : ex.id))
                }
                hitSlop={10}
              >
                <YStack>
                  <XStack ai="center" gap="$2">
                    <Text fontSize="$6" fontWeight="700">
                      {ex.name}
                    </Text>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </XStack>
                  <Text fontSize="$3" color="$gray10">
                    {date}
                  </Text>
                </YStack>
              </Pressable>

              <Pressable onPress={() => setActionExercise(ex)} hitSlop={10}>
                <Ellipsis size={26} color={theme.color.val} />
              </Pressable>
            </XStack>

            {isOpen && (
              <YStack mt="$3" gap="$2">
                {ex.sets?.map((set: any, j: number) => (
                  <Text key={j} fontSize="$4" color="$gray10">
                    {renderSetLine(ex.type, set, weightUnit)}
                  </Text>
                ))}
              </YStack>
            )}
          </Card>
        </Animated.View>
      )
    },
    [expandedExercise, weightUnit, theme]
  )

  useEffect(() => {
    if (yearFilter && yearFilter !== currentYearFilter) {
      setCurrentYearFilter(yearFilter)
    }
  }, [yearFilter])

  useEffect(() => {
    if (rangeFilter !== currentRangeFilter) {
      setCurrentRangeFilter(rangeFilter)
    }
  }, [rangeFilter])

  useEffect(() => {
    onEditingChange?.(viewMode === 'edit')
    return () => {
      onEditingChange?.(false)
    }
  }, [viewMode, onEditingChange])

  if (viewMode === 'edit' && editingExercise) {
    return (
      <EditExercise
        exercise={editingExercise}
        onCancel={() => {
          setEditingExercise(null)
          setViewMode('history')
        }}
        onSubmit={updated => {
          setWorkouts(prev => {
            const newWorkouts = prev.map(workout => {
              if (workout.id !== editingWorkoutId) return workout

              const updatedExercises = workout.exercises.map((ex: { id: any }) => {
                if (ex.id === updated.id) {
                  return {
                    ...ex,
                    name: updated.name,
                    type: updated.type,
                    sets: updated.sets,
                  }
                }
                return ex
              })

              return {
                ...workout,
                exercises: updatedExercises,
              }
            })
            return newWorkouts
          })

          showToast('Exercise updated')
          setEditingExercise(null)
          setViewMode('history')
        }}
      />
    )
  }

  const headerSection = showHeader ? (
    <XStack jc="space-between" ai="center" mb="$3">
      <Pressable onPress={onClose} hitSlop={10}>
        <XStack fd="row" ai="center" gap="$2">
          <ChevronLeft size={20} color={theme.color.val} />
          <Text fontSize="$5" fontWeight="600" color="$color">
            Back
          </Text>
        </XStack>
      </Pressable>
      <YStack w={48} />
    </XStack>
  ) : (
    <YStack h="$1" />
  )

  const content = (
    <>
      <YStack px="$4" pt={showHeader ? '$4' : '$2'} pb="$2">
        {headerSection}

        <Animated.View entering={FadeInUp.duration(300)}>
          <Pressable onPress={() => setShowSheet(true)}>
            <XStack jc="center" ai="center" gap="$2">
              <Text fontSize="$9" fontWeight="900" ta="center" color="$color">
                {filterExercise || 'All'}
              </Text>
              <ChevronDown size={20} color={theme.color.val} />
            </XStack>
          </Pressable>
        </Animated.View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" my="$3" px="$4">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={currentYearFilter === val}
                onPress={() => {
                  setCurrentYearFilter(val)
                  onYearFilterChange?.(val)
                }}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

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
                selected={currentRangeFilter === opt.val}
                onPress={() => {
                  const newRange = opt.val as 'all' | '30d' | '3mo'
                  setCurrentRangeFilter(newRange)
                  onRangeFilterChange?.(newRange)
                }}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
          Showing{' '}
          {currentRangeFilter === '30d'
            ? 'last 30 days'
            : currentRangeFilter === '3mo'
            ? 'last 3 months'
            : 'all days'}{' '}
          of {currentYearFilter === 'All Years' ? 'all years' : currentYearFilter}
        </Text>
      </YStack>

      {/* FlatList for exercises */}
      <FlatList
        data={filtered}
        keyExtractor={item => `${item.id}-${item.updated_at || ''}`}
        renderItem={renderItem}
        initialNumToRender={12}
        removeClippedSubviews
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
        windowSize={10}
      />

      <ExerciseFilterSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        selectedExercise={filterExercise}
        onSelect={name => {
          setFilterExercise(name)
          onExerciseFilterChange?.(name)
        }}
        exerciseNames={exerciseNames}
      />

      <ExerciseActionSheet
        open={!!actionExercise}
        onOpenChange={open => {
          if (!open) setActionExercise(null)
        }}
        exerciseName={actionExercise?.name}
        isFavorite={actionExercise ? isFavorited(actionExercise) : false}
        onToggleFavorite={handleToggleFavoriteSelected}
        onEdit={handleEditSelectedExercise}
        onDelete={handleDeleteSelectedExercise}
      />

      {/* Confirm Delete Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={confirmId !== null}
        onRequestClose={() => setConfirmId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
            <Text fontSize="$6" fontWeight="700" color="$color">
              Delete Exercise
            </Text>
            <Text color="$gray10">Are you sure you want to delete this exercise?</Text>
            <XStack gap="$2">
              <Button flex={1} onPress={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button theme="active" flex={1} onPress={() => handleDeleteExercise(confirmId!)}>
                Delete
              </Button>
            </XStack>
          </YStack>
        </View>
      </Modal>
    </>
  )

  return wrapInContainer ? <ScreenContainer>{content}</ScreenContainer> : content
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
