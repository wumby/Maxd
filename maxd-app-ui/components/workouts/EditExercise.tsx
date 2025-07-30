import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { AddExerciseCard } from './AddExerciseCard' 
import { ScrollView } from 'react-native'
import { ScreenContainer } from '../ScreenContainer'
import { editExercise } from '@/services/exerciseService'
import { useToast } from '@/contexts/ToastContextProvider'
import { useAuth } from '@/contexts/AuthContext'

export function EditExercise({
  exercise,
  onCancel,
  onSubmit,
}: {
  exercise: any
  onCancel: () => void
  onSubmit: (updated: any) => void
}) {
  const [editedExercise, setEditedExercise] = useState(exercise)
  console.log('Exercise sets on load:', editedExercise.sets)
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

  const handleAddSet = (i: number) => {
    setEditedExercise((prev: { sets: any }) => ({
      ...prev,
      sets: [...prev.sets, {}],
    }))
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
        <XStack ai="center" gap="$2">
          <Button
            icon={ChevronLeft}
            size="$3"
            chromeless
            onPress={onCancel}
            circular
            bg="transparent"
          />
          <Text fontSize="$6" fontWeight="600" color="$color">
            Edit Exercise
          </Text>
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
