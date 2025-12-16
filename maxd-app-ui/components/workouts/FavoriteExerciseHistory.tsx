import { FlatList } from 'react-native'
import { Card, Text, YStack, XStack, Button } from 'tamagui'
import { Trash2 } from '@tamagui/lucide-icons'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'

interface SavedExercise {
  id: number
  name: string
  type: string
  sets?: any[]
  created_at?: string
}

interface FavoriteExerciseHistoryProps {
  exercises: SavedExercise[]
  onRemove?: (id: number) => void
}

export function FavoriteExerciseHistory({ exercises, onRemove }: FavoriteExerciseHistoryProps) {
  const { weightUnit } = usePreferences()

  if (exercises.length === 0) {
    return (
      <YStack f={1} jc="center" ai="center" px="$4">
        <Text color="$gray10" fontSize="$5" textAlign="center">
          No favorite exercises saved yet.
        </Text>
      </YStack>
    )
  }

  return (
    <FlatList
      data={exercises}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64, gap: 12 }}
      renderItem={({ item }) => (
        <Card elevate bg="$color2" p="$4" gap="$3" br="$6">
          <XStack jc="space-between" ai="center">
            <YStack>
              <Text fontSize="$6" fontWeight="700">
                {item.name}
              </Text>
              <Text fontSize="$3" color="$gray10">
                {item.type}
              </Text>
            </YStack>
            {onRemove && (
              <Button
                size="$3"
                icon={Trash2}
                chromeless
                onPress={() => onRemove(item.id)}
                accessibilityLabel={`Remove ${item.name} from favorites`}
              />
            )}
          </XStack>

          <YStack mt="$3" gap="$2">
            {item.sets?.map((set, index) => (
              <Text key={index} fontSize="$4" color="$gray10">
                {renderSetLine(item.type, set, weightUnit)}
              </Text>
            ))}
          </YStack>
        </Card>
      )}
    />
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
