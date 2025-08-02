import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { AddExerciseCard } from './AddExerciseCard'
import { Pressable, ScrollView } from 'react-native'
import { ScreenContainer } from '../ScreenContainer'
import { editExercise } from '@/services/exerciseService'
import { useToast } from '@/contexts/ToastContextProvider'
import { useAuth } from '@/contexts/AuthContext'
import WeightUtil from '@/util/weightConversion'
import { usePreferences } from '@/contexts/PreferencesContext'

export function EditExercise({
  exercise,
  onCancel,
  onSubmit,
}: {
  exercise: any
  onCancel: () => void
  onSubmit: (updated: any) => void
}) {
  const normalizeSets = (sets: any[], type: string, weightUnit: 'lb' | 'kg') =>
    sets.map(set => {
      if (type === 'weights') {
        const rawWeight = set.weight ?? ''
        const convertedWeight =
          weightUnit === 'lb' && rawWeight !== ''
            ? String(WeightUtil.kgToLbs(rawWeight).toFixed(1))
            : String(rawWeight)

        return {
          reps: set.reps != null ? String(set.reps) : '',
          weight: convertedWeight,
        }
      } else if (type === 'bodyweight') {
        return {
          reps: set.reps != null ? String(set.reps) : '',
        }
      } else if (type === 'cardio') {
        return {
          distance: set.distance != null ? String(set.distance) : '',
          distance_unit: set.distance_unit ?? 'mi',
          duration: set.duration != null ? String(set.duration) : '',
        }
      } else {
        return set
      }
    })

  const { weightUnit } = usePreferences()

  const [editedExercise, setEditedExercise] = useState(() => ({
    ...exercise,
    sets: normalizeSets(exercise.sets ?? [], exercise.type, weightUnit),
  }))

  const { token } = useAuth()
  const { showToast } = useToast()

  const handleChangeName = (i: number, name: string) => {
    setEditedExercise((prev: any) => ({ ...prev, name }))
  }

  const handleChangeType = (i: number, type: string) => {
    setEditedExercise((prev: any) => ({ ...prev, type }))
  }

  const handleChangeSet = (i: number, setIndex: number, field: string, value: string) => {
    const sets = [...editedExercise.sets]
    sets[setIndex] = { ...sets[setIndex], [field]: value }
    setEditedExercise((prev: any) => ({ ...prev, sets }))
  }

  const handleAddSet = () => {
    const { type } = editedExercise
    let newSet: any = {}
    if (type === 'weights') {
      newSet = { reps: '', weight: '' }
    } else if (type === 'bodyweight') {
      newSet = { reps: '' }
    } else if (type === 'cardio') {
      newSet = { distance: '', distance_unit: 'mi', duration: '' }
    }
    setEditedExercise((prev: { sets: any }) => ({ ...prev, sets: [...prev.sets, newSet] }))
  }

  const handleRemoveSet = (i: number, setIndex: number) => {
    const newSets = [...editedExercise.sets]
    newSets.splice(setIndex, 1)
    setEditedExercise((prev: any) => ({ ...prev, sets: newSets }))
  }

  const handleSave = async () => {
  try {
    const cleanedSets = editedExercise.sets.map((set: any) => {
      const cleaned: any = {}

      if ('reps' in set)
        cleaned.reps = set.reps === '' ? null : parseInt(set.reps)

      if ('weight' in set)
        cleaned.weight = set.weight === '' ? null : parseFloat(set.weight)

      if ('duration' in set)
        cleaned.duration = set.duration === '' ? null : parseInt(set.duration)

      if ('distance' in set)
        cleaned.distance = set.distance === '' ? null : parseFloat(set.distance)

      if ('distance_unit' in set)
        cleaned.distance_unit = set.distance_unit || null

      return cleaned
    })

    await editExercise(token, editedExercise.id, {
      name: editedExercise.name,
      type: editedExercise.type,
      sets: cleanedSets,
    })

    showToast('Exercise updated')
    onSubmit({
      ...editedExercise,
      sets: cleanedSets,
    })
  } catch (err) {
    console.error('Error updating exercise:', err)
    showToast('Failed to update exercise', 'warn')
  }
}


  return (
    <ScreenContainer>
      
        <YStack  pt="$4" gap="$4">
        <XStack jc="space-between" ai="center" mb="$3">
               <Pressable onPress={onCancel} hitSlop={10}>
                 <XStack fd="row" ai="center" gap="$2">
                   <ChevronLeft size={20} />
                   <Text fontSize="$5" fontWeight="600" color="$color">
                     Back
                   </Text>
                 </XStack>
               </Pressable>
             </XStack>
  <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
        Edit Exercise
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
         <YStack padding="$4" pb="$8">
          {/* Reuse AddExerciseCard */}
          <AddExerciseCard
            exercise={editedExercise}
            index={0}
            expanded
            onToggleExpand={() => {}}
            onChangeName={handleChangeName}
            onChangeType={handleChangeType}
            onChangeSet={handleChangeSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
          />

          {/* Save/Cancel */}
          <XStack gap="$2" mt="$6">
            <Button flex={1} onPress={onCancel}>
              Cancel
            </Button>
            <Button flex={1} theme="active" onPress={handleSave}>
              Save
            </Button>
          </XStack>
          </YStack>
          </ScrollView>
        </YStack>
      
    </ScreenContainer>
  )
}
