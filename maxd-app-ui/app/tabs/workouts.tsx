import { useState, useCallback, lazy, Suspense, useEffect, useMemo } from 'react'
import { YStack, Text, Button } from 'tamagui'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import NewWorkoutModal from '@/components/workouts/NewWorkoutModal'
import { ScreenContainer } from '@/components/ScreenContainer'
import { WorkoutCardsBottom } from '@/components/workouts/WorkoutCardsBottom'
import ExerciseHistory from '@/components/workouts/ExerciseHistory'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'))

export default function WorkoutsTab() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'new' | 'workouts' | 'exercises' | null>(null)
  const { token } = useAuth()
  const [modalVisible, setModalVisible] = useState(false)
  const params = useLocalSearchParams()
  const shouldLog = params.log === '1'

   const fetchWorkouts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setWorkouts(data)
    } catch (err) {
      console.error('Failed to fetch workouts:', err)
    }
  }, [token])

  useEffect(() => {
    if (shouldLog) {
      setModalVisible(true)
      router.replace('/tabs/workouts')
    }
  }, [shouldLog])

  useFocusEffect(
    useCallback(() => {
      setViewMode(null)
      fetchWorkouts()
    }, [fetchWorkouts])
  )
  const lastWorkout = workouts[0];
  const flattenedExercises = useMemo(() => {
  return workouts.flatMap(w =>
    (w.exercises || []).map((ex: any) => ({
      ...ex,
      created_at: w.created_at,
    }))
  )
}, [workouts])

  return (
    <>
      {viewMode === null && (
        <ScreenContainer>
     <YStack f={1} jc="space-evenly" gap="$4">
                <Text>I want my cards here</Text>
    
                <YStack ai="center" gap="$6">
                  <Text fontSize="$9" fontWeight="700">
                    Last: {lastWorkout?.title || 'None'}
                  </Text>
                  <Button size="$4" onPress={() => setModalVisible(true)}>
                    Log New Workout
                  </Button>
                </YStack>
    
               <WorkoutCardsBottom
               key={workouts.length}
  workouts={workouts}
  onWorkoutsPress={() => setViewMode('workouts')}
  onExercisesPress={() => setViewMode('exercises')}
/>

              </YStack>
  </ScreenContainer>
      )}

      <NewWorkoutModal visible={modalVisible}  onCancel={() => setModalVisible(false)}
  onSubmit={() => {
    setModalVisible(false)
    fetchWorkouts()
  }} />
      {viewMode === 'workouts' && (
        <Suspense fallback={<Text p="$4">Loading workout history...</Text>}>
          <WorkoutHistory workouts={workouts} onClose={() => setViewMode(null)} />
        </Suspense>
      )}

       {viewMode === 'exercises' && (
        <Suspense fallback={<Text p="$4">Loading workout history...</Text>}>
          <ExerciseHistory exercises={flattenedExercises} onClose={() => setViewMode(null)} />
        </Suspense>
      )}
    </>
  )
}
