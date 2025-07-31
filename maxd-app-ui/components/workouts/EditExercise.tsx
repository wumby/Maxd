import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { AddExerciseCard } from './AddExerciseCard' 
import { ScrollView } from 'react-native'
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
}) {const normalizeSets = (sets: any[], type: string, weightUnit: 'lb' | 'kg') =>
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

const { token } = useAuth();
  const {showToast} = useToast()

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
    console.log('Submitting edit for ID:', editedExercise.id)
    await editExercise(token, editedExercise.id, {
      name: editedExercise.name,
      type: editedExercise.type,
      sets: editedExercise.sets,
    })
    showToast('Exercise updated')
    onSubmit(editedExercise)
  } catch (err) {
    console.error('Error updating exercise:', err)
    showToast('Failed to update exercise', 'warn')
  }
}


  return (
    <ScreenContainer>
  <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <YStack px="$4" pt="$4" gap="$4">
        {/* Back header */}
        <XStack ai="center" jc="space-between" position="relative" w="100%" mb={'$5'}>
  <Button
    chromeless
    circular
    bg="transparent"
    onPress={onCancel}
  >
    <ChevronLeft size={28} />
  </Button>

  <Text
    fontSize="$8"
    fontWeight="600"
    color="$color"
    position="absolute"
    left="50%"
    style={{ transform: [{ translateX: -50 + '%' }] }}
  >
    Edit Exercise
  </Text>

  <YStack w={40} /> {/* Spacer to balance the right side */}
</XStack>


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
        <XStack gap="$2">
          <Button flex={1} onPress={onCancel}>
            Cancel
          </Button>
          <Button flex={1} theme="active" onPress={handleSave}>
            Save
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
    </ScreenContainer>
  
  )
}
