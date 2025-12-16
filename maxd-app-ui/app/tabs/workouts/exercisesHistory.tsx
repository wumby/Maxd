import { useRouter } from 'expo-router'
import { lazy, Suspense, useMemo, useState } from 'react'
import { YStack, XStack, Button, Text, useTheme } from 'tamagui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { ScreenContainer } from '@/components/ScreenContainer'
import { Fallback } from '@/components/Fallback'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { FavoriteExerciseHistory } from '@/components/workouts/FavoriteExerciseHistory'
import { deleteSavedExercise } from '@/services/savedExerciseService'
import { useToast } from '@/contexts/ToastContextProvider'
import { useWorkouts } from '@/hooks/useWorkouts'

const ExerciseHistory = lazy(() => import('@/components/workouts/ExerciseHistory'))

export default function ExercisesPage() {
  const router = useRouter()
  const { token } = useAuth()
  const theme = useTheme()
  const { showToast } = useToast()
  const [tab, setTab] = useState<'all' | 'favorites'>('all')
  const [editingExercise, setEditingExercise] = useState(false)
  const {
    workouts,
    setWorkouts,
    loading,
    range,
    setRange,
    year,
    setYear,
    workoutNameFilter,
    setWorkoutNameFilter,
  } = useWorkouts('3mo', null)
  const {
    savedExercises,
    setSavedExercises,
    loading: savedLoading,
  } = useSavedExercises()

  const flattenedExercises = useMemo(() => {
    return workouts.flatMap(w =>
      (w.exercises || []).map((ex: any) => ({
        ...ex,
        created_at: w.created_at,
        workout_id: w.id,
      }))
    )
  }, [workouts])

  const handleRemoveFavorite = async (exerciseId: number) => {
    if (!token) return
    try {
      await deleteSavedExercise(token, exerciseId)
      setSavedExercises(prev => prev.filter(ex => ex.id !== exerciseId))
      showToast('Removed from favorites')
    } catch (err) {
      console.error('Failed to remove saved exercise:', err)
      showToast('Failed to remove favorite', 'warn')
    }
  }

  const renderAllExercises = () => {
    if (loading) {
      return <Fallback />
    }

    return (
      <Suspense fallback={<Fallback />}>
        <ExerciseHistory
          exercises={flattenedExercises}
          onClose={() => router.back()}
          setWorkouts={setWorkouts}
          savedExercises={savedExercises}
          setSavedExercises={setSavedExercises}
          showHeader={false}
          wrapInContainer={false}
          onEditingChange={setEditingExercise}
          yearFilter={year ?? 'All Years'}
          onYearFilterChange={val => setYear(val === 'All Years' ? null : val)}
          rangeFilter={range}
          onRangeFilterChange={setRange}
          onExerciseFilterChange={setWorkoutNameFilter}
        />
      </Suspense>
    )
  }

  return (
    <ScreenContainer>
      {!editingExercise && (
        <XStack jc="center" ai="center" px="$4" pt="$4" pb="$1" position="relative">
          <Button
            position="absolute"
            left={16}
            size="$4"
            chromeless
            onPress={() => router.back()}
            px="$2"
            borderRadius="$6"
          >
            <XStack ai="center" gap="$2">
              <ChevronLeft size={24} color={theme.color.val} />
            </XStack>
          </Button>
          <XStack gap="$3">
            {(['all', 'favorites'] as const).map(t => (
              <Button
                key={t}
                size="$4"
                chromeless
                onPress={() => setTab(t)}
                bg={tab === t ? '$backgroundStrong' : 'transparent'}
                borderRadius="$6"
                px="$5"
                disabled={editingExercise}
              >
                <Text
                  fontSize="$6"
                  fontWeight="600"
                  color={tab === t ? theme.color.val : theme.gray10.val}
                >
                  {t === 'all' ? 'Exercises' : 'Favorites'}
                </Text>
              </Button>
            ))}
          </XStack>
          <YStack w={48} position="absolute" right={16} />
        </XStack>
      )}

      <YStack f={1}>
        {tab === 'all' ? (
          renderAllExercises()
        ) : savedLoading ? (
          <Fallback />
        ) : (
          <FavoriteExerciseHistory exercises={savedExercises} onRemove={handleRemoveFavorite} />
        )}
      </YStack>
    </ScreenContainer>
  )
}
