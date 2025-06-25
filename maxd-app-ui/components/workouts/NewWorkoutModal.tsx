import { useState } from 'react'
import { YStack, Text, Button, XStack, Input, Separator } from 'tamagui'
import { Modal, ScrollView, View, Keyboard } from 'react-native'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContextProvider'

const EXERCISE_TYPES = ['weights', 'bodyweight', 'cardio'] as const

export default function NewWorkoutModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [missingTitle, setMissingTitle] = useState(false)
  const [exercises, setExercises] = useState<any[]>([
    {
      name: '',
      type: 'weights',
      sets: [{ reps: '', weight: '', duration: '', distance: '' }],
    },
  ])
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null)

  const { token } = useAuth()
  const { showToast } = useToast()

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        name: '',
        type: 'weights',
        sets: [{ reps: '', weight: '', duration: '', distance: '' }],
      },
    ])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleChangeName = (index: number, newName: string) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[index].name = newName
      return updated
    })
  }

  const handleChangeType = (index: number, newType: string) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[index].type = newType
      return updated
    })
  }

  const handleAddSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets.push({ reps: '', weight: '', duration: '', distance: '' })
      return updated
    })
  }

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets.splice(setIndex, 1)
      return updated
    })
  }

  const handleChangeSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string
  ) => {
    setExercises(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets[setIndex][field] = value
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setMissingTitle(true)
      return
    }

    const payload = exercises
      .filter(ex => ex.name.trim() && ex.sets.length > 0)
      .map(ex => ({
        name: ex.name.trim(),
        type: ex.type,
        sets: ex.sets.map((set: any) => ({
          reps: parseInt(set.reps) || null,
          weight: parseFloat(set.weight) || null,
          duration: set.duration || null,
          distance: set.distance || null,
        })),
      }))
      .filter(ex => ex.sets.length > 0)

    if (payload.length === 0) {
      showToast('Add at least one valid exercise', 'warn')
      return
    }

    try {
      const res = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), exercises: payload }),
      })
      if (!res.ok) throw new Error()
      setMissingTitle(false)
      showToast('Workout saved!')
      setTitle('')
      setExercises([
        { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
      ])
      onClose()
    } catch (err) {
      console.error('Workout save failed', err)
      showToast('Error saving workout', 'warn')
    }
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
          <XStack jc="space-between" ai="center">
            <Text fontSize="$7" fontWeight="800">
              New Workout
            </Text>
          </XStack>

          <Input
            placeholder="Workout title"
            value={title}
            onChangeText={text => {
              setTitle(text)
              if (text.trim()) setMissingTitle(false)
            }}
             returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            <YStack gap="$6" pb="$8">
              {exercises.map((exercise, exerciseIndex) => (
                <YStack key={exerciseIndex} gap="$3">
                  <XStack jc="space-between" ai="center">
                    <Text fontWeight="600" fontSize="$6">
                      Exercise {exerciseIndex + 1}
                    </Text>
                    <Button
                      chromeless
                      size="$2"
                      onPress={() => handleRemoveExercise(exerciseIndex)}
                    >
                      Remove
                    </Button>
                  </XStack>

                  <Input
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChangeText={text => handleChangeName(exerciseIndex, text)}
                     returnKeyType="done"
                  />

                  <YStack>
                    <Button
                      size="$3"
                      theme="blue"
                      onPress={() =>
                        setDropdownIndex(dropdownIndex === exerciseIndex ? null : exerciseIndex)
                      }
                    >
                      {exercise.type}
                    </Button>
                    {dropdownIndex === exerciseIndex && (
                      <YStack gap="$1" mt="$2">
                        {EXERCISE_TYPES.map(type => (
                          <Button
                            key={type}
                            chromeless
                            onPress={() => {
                              handleChangeType(exerciseIndex, type)
                              setDropdownIndex(null)
                            }}
                          >
                            {type}
                          </Button>
                        ))}
                      </YStack>
                    )}
                  </YStack>

                  {exercise.sets.map((set: any, setIndex: number) => (
                    <XStack key={setIndex} gap="$2" flexWrap="wrap" ai="center">
                      {exercise.type === 'weights' || exercise.type === 'bodyweight' ? (
                        <>
                          <Input
                            flex={1}
                            keyboardType="numeric"
                            placeholder="Reps"
                            value={set.reps}
                            onChangeText={val =>
                              handleChangeSet(exerciseIndex, setIndex, 'reps', val)
                            }
                            returnKeyType="done"
                          />
                          {exercise.type === 'weights' && (
                            <Input
                              flex={1}
                              keyboardType="numeric"
                              placeholder="Weight (lbs)"
                              value={set.weight}
                              onChangeText={val =>
                                handleChangeSet(exerciseIndex, setIndex, 'weight', val)
                              }
                              returnKeyType="done"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <Input
                            flex={1}
                            placeholder="Duration (min)"
                            value={set.duration}
                            onChangeText={val =>
                              handleChangeSet(exerciseIndex, setIndex, 'duration', val)
                            }
                            returnKeyType="done"
                          />
                          <Input
                            flex={1}
                            placeholder="Distance (mi)"
                            value={set.distance}
                            onChangeText={val =>
                              handleChangeSet(exerciseIndex, setIndex, 'distance', val)
                            }
                            returnKeyType="done"
                          />
                        </>
                      )}
                      <Button
                        chromeless
                        size="$2"
                        onPress={() => handleRemoveSet(exerciseIndex, setIndex)}
                      >
                        Remove
                      </Button>
                    </XStack>
                  ))}

                  <Button size="$2" onPress={() => handleAddSet(exerciseIndex)}>
                    + Add Set
                  </Button>

                  <Separator />
                </YStack>
              ))}

              <Button theme="blue" onPress={handleAddExercise}>
                + Add Exercise
              </Button>
            </YStack>
          </ScrollView>

          {missingTitle && (
            <Text color="$red10" textAlign="center" fontSize="$4">
              Workout title is required
            </Text>
          )}

          <XStack gap="$2">
            <Button flex={1} onPress={onClose}>
              Cancel
            </Button>
            <Button flex={1} onPress={handleSubmit} theme="active">
              Submit
            </Button>
          </XStack>
        </YStack>
      </View>
    </Modal>
  )
}
