import { useState, useCallback, lazy, Suspense, useEffect } from 'react'
import { YStack, Text, Button } from 'tamagui'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import NewWorkoutModal from '@/components/workouts/NewWorkoutModal'
import { ScreenContainer } from '@/components/ScreenContainer'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'))

export default function WorkoutsTab() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'new' | 'history' | null>(null)
  const { token } = useAuth()
  const [modalVisible, setModalVisible] = useState(false)
  const params = useLocalSearchParams()
  const shouldLog = params.log === '1'

  useEffect(() => {
    if (shouldLog) {
      setModalVisible(true)
      router.replace('/tabs/workouts')
    }
  }, [shouldLog])

  useFocusEffect(
    useCallback(() => {
      setViewMode(null)
      const fetchWorkouts = async () => {
        try {
          const res = await fetch(`${API_URL}/workouts`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          setWorkouts(data)
        } catch (err) {
          console.error('Failed to fetch workouts:', err)
        }
      }
      fetchWorkouts()
    }, [token])
  )
  const lastWorkout = workouts[0]
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
    
                <Text>I want my cards here</Text>
              </YStack>
  </ScreenContainer>
      )}

      <NewWorkoutModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {viewMode === 'history' && (
        <Suspense fallback={<Text p="$4">Loading workout history...</Text>}>
          <WorkoutHistory workouts={workouts} onClose={() => setViewMode(null)} />
        </Suspense>
      )}
    </>
  )
}
