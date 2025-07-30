import { useMemo, useState, useCallback, useEffect } from 'react'
import { YStack, Text, XStack, Card, Button, useTheme, useThemeName } from 'tamagui'
import { ChevronLeft, ChevronDown, Trash2, Pencil } from '@tamagui/lucide-icons'
import { Pressable, Modal, View, FlatList, ScrollView } from 'react-native'
import { YearFilterItem } from '../weights/YearFilterItem'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { ScreenContainer } from '../ScreenContainer'
import { ExerciseFilterSheet } from './ExerciseFilterSheet'
import { deleteExercise } from '@/services/exerciseService'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { createSavedExercise, deleteSavedExercise } from '@/services/savedExerciseService'
import { useToast } from '@/contexts/ToastContextProvider'
import { EditExercise } from './EditExercise'

export default function ExerciseHistory({
  exercises,
  onClose,
  setWorkouts,
}: {
  exercises: any[]
  onClose: () => void
  setWorkouts: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const { token } = useAuth()

  const currentYear = new Date().getFullYear().toString()
  const [filterYear, setFilterYear] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')
  const [filterExercise, setFilterExercise] = useState<string | null>(
  exercises.length > 0 ? exercises[0].name.trim() : null
)
  const [showSheet, setShowSheet] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
const { savedExercises, setSavedExercises } = useSavedExercises()
const [editingExercise, setEditingExercise] = useState<any | null>(null)
const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
const [viewMode, setViewMode] = useState<'history' | 'edit'>('history')
const { showToast } = useToast()
useEffect(() => {
  if (exercises.length > 0 && !filterExercise) {
    setFilterExercise(exercises[0].name.trim())
  }
}, [exercises])

const isFavorited = (ex: any) =>
  savedExercises.some(saved => saved.name.toLowerCase() === ex.name.trim().toLowerCase())
const toggleFavorite = async (ex: any) => {
  const name = ex.name.trim()
  const existing = savedExercises.find(
    saved => saved.name.toLowerCase() === name.toLowerCase()
  )

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

  const rangeCutoff = useMemo(() => {
    const selected = exercises.filter(e => {
      const date = new Date(e.created_at)
      return filterYear === 'All Years' || date.getFullYear().toString() === filterYear
    })

    if (selected.length === 0 || range === 'all') return null

    const latestDate = new Date(Math.max(...selected.map(e => new Date(e.created_at).getTime())))
    const cutoff = new Date(latestDate)
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    else if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)

    return cutoff
  }, [exercises, filterYear, range])

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const date = new Date(e.created_at)
      const matchYear = filterYear === 'All Years' || date.getFullYear().toString() === filterYear
      const matchRange = !rangeCutoff || date >= rangeCutoff
      const matchName = !filterExercise || e.name.trim() === filterExercise
      return matchYear && matchRange && matchName
    })
  }, [exercises, filterYear, rangeCutoff, filterExercise])

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

  const renderItem = useCallback(
  ({ item, index }: { item: any; index: number }) => {
    const ex = item
      const date = new Date(ex.created_at).toLocaleDateString()
      return (
        <Animated.View entering={FadeInUp.duration(300).delay(index * 20)}>
          <Card elevate bg="$color2" p="$4" gap="$3" br="$6" my="$2">
           <XStack jc="space-between" ai="center">
  <YStack>
    <Text fontSize="$6" fontWeight="700">
      {ex.name}
    </Text>
    <Text fontSize="$3" color="$gray10">
      {date}
    </Text>
  </YStack>

  {editMode && (
    <XStack gap="$6" ai="center">
      <Pressable onPress={() => toggleFavorite(ex)}>
        <Text fontSize="$7">{isFavorited(ex) ? '★' : '☆'}</Text>
      </Pressable>
    <Pressable
  onPress={() => {
    setEditingWorkoutId(ex.workout_id)
    setEditingExercise(ex)
    setViewMode('edit')
  }}
  hitSlop={10}
>
  <Pencil size={22} color={theme.color.val} />
</Pressable>


      <Pressable onPress={() => setConfirmId(ex.id)}>
        <Trash2 size={22} color="red" />
      </Pressable>
    </XStack>
  )}
</XStack>
            <YStack mt="$3" gap="$2">
              {ex.sets?.map((set: any, j: number) => (
                <Text key={j} fontSize="$4" color="$gray10">
                  {renderSetLine(ex.type, set, weightUnit)}
                </Text>
              ))}
            </YStack>
          </Card>
        </Animated.View>
      )
    },
    [editMode, weightUnit, savedExercises]
  )

 if (viewMode === 'edit' && editingExercise) {
  return (
    <EditExercise
      exercise={editingExercise}
      onCancel={() => {
        setEditingExercise(null)
        setViewMode('history')
      }}
    onSubmit={updated => {
  console.log('Received updated exercise:', updated)
  console.log('Editing workout ID:', editingWorkoutId)

  setWorkouts(prev => {
    const newWorkouts = prev.map(workout => {
      if (workout.id !== editingWorkoutId) return workout

      const updatedExercises = workout.exercises.map((ex: { id: any }) => {
        if (ex.id === updated.id) {
          console.log('Updating exercise in workout:', workout.id)
          return {
            ...ex,
            name: updated.name,
            type: updated.type,
            sets: updated.sets,
            updated_at: new Date().toISOString(), // ensure FlatList re-renders
          }
        }
        return ex
      })

      return {
        ...workout,
        exercises: updatedExercises,
      }
    })

    console.log('Updated workouts:', JSON.stringify(newWorkouts, null, 2))
    return newWorkouts
  })

  showToast('Exercise updated')
  setEditingExercise(null)
  setViewMode('history')
}}


    />
  )
}


  return (
    <ScreenContainer>
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

          <Button fontSize="$5" size="$2" onPress={() => setEditMode(prev => !prev)} chromeless>
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </XStack>

        <Animated.View entering={FadeInUp.duration(300)}>
          <Pressable onPress={() => setShowSheet(true)}>
            <XStack jc="center" ai="center" gap="$2">
              <Text fontSize="$9" fontWeight="900" ta="center" color="$color">
                {filterExercise || 'Exercises'}
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
                selected={filterYear === val}
                onPress={() => setFilterYear(val)}
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
                selected={range === opt.val}
                onPress={() => setRange(opt.val as any)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
          Showing{' '}
          {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
          {filterYear === 'All Years' ? 'all years' : filterYear}
        </Text>
      </YStack>

      {/* FlatList for exercises */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.id}-${item.updated_at || ''}`}
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
        onSelect={setFilterExercise}
        exerciseNames={exerciseNames}
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
    </ScreenContainer>
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
