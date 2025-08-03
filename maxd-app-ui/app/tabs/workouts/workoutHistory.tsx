import { useState, lazy, Suspense, useRef, useCallback, useEffect, useMemo } from 'react'
import { YStack, XStack, Button, Text, useTheme } from 'tamagui'
import { useFocusEffect, useRouter } from 'expo-router'
import { Fallback } from '@/components/Fallback'
import { useAuth } from '@/contexts/AuthContext'
import { deleteWorkout } from '@/services/workoutService'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useToast } from '@/contexts/ToastContextProvider'
import { WorkoutActionSheet } from '@/components/workouts/WorkoutActionSheet'
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { createSavedWorkout, deleteSavedWorkout } from '@/services/savedWorkoutsService'
import { useWorkouts } from '@/hooks/useWorkouts'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { WorkoutNameFilterSheet } from '@/components/workouts/WorkoutNameFilterSheet'
import { WorkoutFilterControls } from '@/components/workouts/WorkoutFilterControls'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'))
const FavoriteWorkoutHistory = lazy(() => import('@/components/workouts/FavoriteWorkoutHistory'))

export default function WorkoutHistoryScreen() {
  const [tab, setTab] = useState<'all' | 'favorites'>('all')
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedWorkoutName, setSelectedWorkoutName] = useState<string | null>(null)
  const { token } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const theme = useTheme()
  const [range, setRange] = useState<'all' | '3mo' | '30d'>('3mo')
  const [year, setYear] = useState<string | null>(null)

  const { saved: savedWorkouts, refreshSavedWorkouts } = useSavedWorkouts()
  const { workouts, setWorkouts, loading, refreshWorkouts } = useWorkouts(range, year)

  const shouldRefresh = useRef(false)
  const hasFetchedSaved = useRef(false)

  useFocusEffect(
    useCallback(() => {
      if (tab !== 'all' || !shouldRefresh.current || !token) return
      refreshWorkouts()
      shouldRefresh.current = false
    }, [tab, token, refreshWorkouts])
  )

  // Optional: initial fetch
  useEffect(() => {
    if (tab === 'all') {
      refreshWorkouts()
    }
  }, [])

  useEffect(() => {
    setSelectedWorkoutName(null)
  }, [tab])

  useEffect(() => {
    if (tab === 'favorites' && !hasFetchedSaved.current) {
      refreshSavedWorkouts()
      hasFetchedSaved.current = true
    }
  }, [tab, refreshSavedWorkouts])

  const handleDeleteWorkout = async () => {
    if (!confirmId || !token) return
    try {
      await deleteWorkout(token, confirmId)
      setWorkouts(prev => prev.filter(w => w.id !== confirmId))
      showToast('Workout deleted')
    } catch (err) {
      console.error('Delete failed:', err)
      showToast('Failed to delete workout', 'warn')
    } finally {
      setConfirmId(null)
    }
  }

  const handleToggleFavorite = async () => {
    if (!selectedWorkout || !token) return
    const isCurrentlySaved = savedWorkouts.some(w => w.title === selectedWorkout.title)
    try {
      if (isCurrentlySaved) {
        await deleteSavedWorkout(token, selectedWorkout.title)
        showToast('Removed from favorites')
      } else {
        await createSavedWorkout(token, {
          title: selectedWorkout.title,
          exercises: selectedWorkout.exercises,
        })
        showToast('Added to favorites')
      }
      refreshSavedWorkouts()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      showToast('Failed to update favorite', 'warn')
    } finally {
      setSelectedWorkout(null)
    }
  }

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => !selectedWorkoutName || w.title === selectedWorkoutName)
  }, [workouts, selectedWorkoutName])

  const filteredFavorites = useMemo(() => {
    return savedWorkouts.filter(w => !selectedWorkoutName || w.title === selectedWorkoutName)
  }, [savedWorkouts, selectedWorkoutName])

  return (
    <ScreenContainer>
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
            >
              <Text
                fontSize="$6"
                fontWeight="600"
                color={tab === t ? theme.color.val : theme.gray10.val}
              >
                {t === 'all' ? 'Workouts' : 'Favorites'}
              </Text>
            </Button>
          ))}
        </XStack>
        <YStack w={48} position="absolute" right={16} />
      </XStack>

      <WorkoutFilterControls
        workouts={tab === 'all' ? workouts : savedWorkouts}
        year={year}
        setYear={setYear}
        range={range}
        setRange={setRange}
        selectedWorkoutName={selectedWorkoutName}
        onOpenNameFilter={() => setFilterSheetOpen(true)}
      />

      <Suspense fallback={<Fallback />}>
        {tab === 'all' ? (
          <WorkoutHistory
            key="workouts"
            workouts={filteredWorkouts}
            onSelectWorkout={setSelectedWorkout}
          />
        ) : (
          <FavoriteWorkoutHistory
            key="favorites"
            workouts={filteredFavorites}
            onSelectWorkout={setSelectedWorkout}
          />
        )}
      </Suspense>

      <WorkoutActionSheet
        open={!!selectedWorkout}
        onOpenChange={() => setSelectedWorkout(null)}
        workoutTitle={selectedWorkout?.title}
        isFavorite={!!selectedWorkout && savedWorkouts.some(w => w.title === selectedWorkout.title)}
        onEdit={() => {
          if (selectedWorkout) {
            router.push({
              pathname: '/tabs/workouts/newWorkout',
              params: { workoutId: selectedWorkout.id },
            })
            setSelectedWorkout(null)
            shouldRefresh.current = true
          }
        }}
        onDelete={() => {
          setConfirmId(selectedWorkout?.id || null)
          setSelectedWorkout(null)
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      <ConfirmDeleteSheet
        open={confirmId !== null}
        onOpenChange={() => setConfirmId(null)}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDeleteWorkout}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
      />

      <WorkoutNameFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        names={
          tab === 'all'
            ? [...new Set(workouts.map(w => w.title).filter(Boolean))]
            : [...new Set(savedWorkouts.map(w => w.title).filter(Boolean))]
        }
        selectedName={selectedWorkoutName}
        setSelectedName={setSelectedWorkoutName}
      />
    </ScreenContainer>
  )
}
