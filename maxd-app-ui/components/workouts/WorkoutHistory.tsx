import { useState, useMemo } from 'react'
import {
  YStack,
  Text,
  ScrollView,
  XStack,
  Card,
  Separator,
  View,
  Button,
  useTheme,
  useThemeName,
} from 'tamagui'
import { ChevronDown, ChevronUp, ChevronLeft, Pencil, Trash2 } from '@tamagui/lucide-icons'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YearFilterItem } from '../weights/YearFilterItem'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { deleteWorkout } from '@/services/workoutService'
import { useAuth } from '@/contexts/AuthContext'
export default function WorkoutHistory({
  workouts,
  onClose,
  setWorkouts,
}: {
  workouts: any[]
  onClose: () => void
  setWorkouts: React.Dispatch<React.SetStateAction<any[]>>
}) 
 {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const isDark = useThemeName() === 'dark'
  const insets = useSafeAreaInsets()
  const bgColor = theme.background.val
const [editMode, setEditMode] = useState(false)
const { token } = useAuth()
const [confirmId, setConfirmId] = useState<number | null>(null)
  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')

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

  const handleEdit = (workout: any) => {
  // Your logic for editing the workout
  console.log('Edit', workout)
}

const handleDelete = (workout: any) => {
  setConfirmId(workout.id)
}

const confirmDelete = async () => {
  if (!confirmId) return
  try {
    await deleteWorkout(token, confirmId)
    setWorkouts(prev => prev.filter(w => w.id !== confirmId))
  } catch (err) {
    console.error('Failed to delete workout:', err)
  } finally {
    setConfirmId(null)
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
  
            <Pressable onPress={() => setEditMode(!editMode)} hitSlop={10}>
              <Text fontSize="$5" fontWeight="600" color="$color">
                {editMode ? 'Done' : 'Edit'}
              </Text>
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

  {/* Filter Description */}
  <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
    Showing{' '}
    {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
    {filter === 'All Years' ? 'all years' : filter}
  </Text>
</YStack>


      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" pb="$8" px="$4">
          {filtered.map((workout, index) => {
            const isOpen = expanded === workout.id
            const workoutDate = new Date(workout.created_at).toLocaleDateString()

            return (
              <Animated.View
                key={workout.id}
                entering={FadeInUp.duration(300).delay(index * 40)}
              >
                <Card elevate bg="$color2" p="$4" gap="$3" br="$6">
               <XStack
  jc="space-between"
  ai="center"
  onPress={() => {
    if (!editMode) toggleExpand(workout.id)
  }}
>

  <YStack>
    <Text fontSize="$6" fontWeight="700">
      {workout.title || 'Untitled Workout'}
    </Text>
    <Text fontSize="$3" color="$gray10">
      {workoutDate}
    </Text>
  </YStack>

  <XStack gap="$2" ai="center">
  {editMode ? (
    <XStack gap="$4" ai="center">
      <Pressable onPress={() => handleEdit(workout)}>
        <Pencil size={18} color={theme.color.val} />
      </Pressable>
      <Pressable onPress={() => handleDelete(workout)}>
        <Trash2 size={18} color="red" />
      </Pressable>
    </XStack>
  ) : (
    isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />
  )}
</XStack>

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
          })}
        </YStack>
      </ScrollView>
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
        Delete Workout
      </Text>
      <Text color="$gray10">Are you sure you want to delete this workout?</Text>
      <XStack gap="$2">
        <Button flex={1} onPress={() => setConfirmId(null)}>
          Cancel
        </Button>
        <Button theme="active" flex={1} onPress={confirmDelete}>
          Delete
        </Button>
      </XStack>
    </YStack>
  </View>
</Modal>

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
