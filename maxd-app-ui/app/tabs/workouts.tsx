import { useState, useCallback, lazy, Suspense, useEffect } from 'react'
import { YStack, Text, Button, XStack, Card } from 'tamagui'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Plus, History } from '@tamagui/lucide-icons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { useIsFocused } from '@react-navigation/native'
import NewWorkoutModal from '@/components/workouts/NewWorkoutModal'

const WorkoutHistory = lazy(() => import('@/components/workouts/WorkoutHistory'))
const AnimatedYStack = Animated.createAnimatedComponent(YStack)

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
  const isFocused = useIsFocused()

  return (
    <>
      {viewMode === null && (
        <AnimatedYStack
          f={1}
          bg="$background"
          p="$4"
          gap="$4"
          key={isFocused ? 'focused' : 'unfocused'}
          entering={FadeIn.duration(500)}
        >
          <XStack jc="space-between" ai="center">
            <Text fontSize="$9" fontWeight="900">
              Workouts
            </Text>
            <Button icon={Plus} size="$3" circular onPress={() => setViewMode('new')} />
          </XStack>

          {lastWorkout ? (
            <Card elevate p="$4" br="$6" bg="$color2" gap="$3">
              <XStack jc="space-between" ai="center" mb="$2">
                <Text fontSize="$6" fontWeight="700">
                  Last Workout
                </Text>
                <Text fontSize="$3" color="$gray10">
                  {new Date(lastWorkout.created_at).toLocaleDateString()}
                </Text>
              </XStack>

              {lastWorkout.exercises.slice(0, 2).map((ex: any, idx: number) => (
                <YStack key={idx} gap="$1">
                  <Text fontWeight="600" fontSize="$5">
                    {ex.name}
                  </Text>
                  {ex.sets?.map((set: any, i: number) => (
                    <Text key={i} color="$gray10" fontSize="$3">
                      {set.reps || '--'} reps @ {set.weight || '--'} lbs
                    </Text>
                  ))}
                </YStack>
              ))}

              {lastWorkout.exercises.length > 2 && (
                <Text fontSize="$3" color="$gray10">
                  + {lastWorkout.exercises.length - 2} more exercise
                  {lastWorkout.exercises.length - 2 > 1 ? 's' : ''}
                </Text>
              )}

              <Button
                mt="$2"
                size="$3"
                chromeless
                icon={History}
                theme="alt2"
                onPress={() => setViewMode('history')}
                alignSelf="flex-end"
              >
                View All
              </Button>
            </Card>
          ) : (
            <YStack ai="center" jc="center" f={1}>
              <Text color="$gray10" fontSize="$5" ta="center">
                No workouts logged yet.
              </Text>
            </YStack>
          )}

          <Button size="$4" icon={Plus} onPress={() => setModalVisible(true)}>
            Start New Workout
          </Button>
        </AnimatedYStack>
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
