import { useState } from 'react'
import {
  YStack,
  Text,
  Button,
  XStack,
  Input,
  Separator,
} from 'tamagui'
import {
  Modal,
  ScrollView,
  View,
  Keyboard,
} from 'react-native'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'



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
  const [feedback, setFeedback] = useState('')
  const [tab, setTab] = useState<'new' | 'saved'>('new')
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null)
  const [exercises, setExercises] = useState<any[]>([
    { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
  ])
const { saved, setSaved, loading } = useSavedWorkouts()
const { savedExercises, setSavedExercises, loading: loadingSavedExercises } = useSavedExercises()
const [isFavorite, setIsFavorite] = useState(false)

  const { token } = useAuth()

  const handleLoadTemplate = (template: any) => {
  setTitle(template.title)
  setExercises(template.exercises)
  setTab('new')
  setIsFavorite(true)
  setFeedback('')
}


  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
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
    setFeedback('')
    if (!title.trim()) {
      setMissingTitle(true)
      setFeedback('Workout title is required')
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
      setFeedback('Add at least one valid exercise')
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
      resetForm()
      onClose()
    } catch (err) {
      console.error('Workout save failed', err)
      setFeedback('Error saving workout')
    }
  }

  const resetForm = () => {
    setMissingTitle(false)
    setFeedback('')
    setTitle('')
    setIsFavorite(false);
    setExercises([
      { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
    ])
  }
const handleSaveTemplate = async () => {
  setFeedback('')
  if (!title.trim()) {
    setMissingTitle(true)
    setFeedback('Workout title is required to save as favorite')
    return
  }
  const alreadyFavorited = saved.some(
  (w) => w.title.toLowerCase().trim() === title.toLowerCase().trim()
)

if (alreadyFavorited) {
  setFeedback('This workout name is already in your favorites')
  return
}

  
  

  const payload = exercises
    .filter(ex => ex.name.trim() && ex.sets.length > 0)
    .map(ex => ({
      name: ex.name.trim(),
      type: ex.type,
      sets: ex.sets.map((set: any) => ({
        reps: set.reps || null,
        weight: set.weight || null,
        duration: set.duration || null,
        distance: set.distance || null,
      })),
    }))
    .filter(ex => ex.sets.length > 0)

  if (payload.length === 0) {
    setFeedback('Add at least one valid exercise to favorite')
    return
  }

  try {
    const res = await fetch(`${API_URL}/saved-workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: title.trim(), exercises: payload }),
    })

    if (!res.ok) throw new Error()

    const newFavorite = await res.json()
    setSaved(prev => [newFavorite, ...prev]) // ✅ update list immediately
    setIsFavorite(true)
  } catch (err) {
    console.error('Save template failed', err)
    setFeedback('Error saving favorite')
  }
}

const [showExerciseDropdown, setShowExerciseDropdown] = useState(false)

// Example favorite exercises — replace with real data later


const handleAddFavoriteExercise = (exercise: { name: string; type: string; sets: { reps: string; weight: string; duration: string; distance: string }[] }) => {
  setExercises(prev => [...prev, { ...exercise }])
}
const handleSaveExercise = async (exercise: any) => {
  const name = exercise.name.trim()
  if (!name) return

  const alreadyExists = savedExercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())
  if (alreadyExists) return

  try {
    const res = await fetch(`${API_URL}/saved-exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        type: exercise.type,
        sets: exercise.sets,
      }),
    })

    if (!res.ok) throw new Error()
    const saved = await res.json()
    setSavedExercises(prev => [saved, ...prev])
  } catch (err) {
    console.error('Error saving exercise', err)
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
      <YStack w="100%" maxWidth={400} br="$4" overflow="hidden">
        {/* Tabs */}
        <XStack bg="$gray3" borderTopEndRadius="$4" overflow="hidden">
          {[
            { key: 'new', label: 'New Workout' },
            { key: 'saved', label: 'Favorites' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              onPress={() => setTab(key as 'new' | 'saved')}
              flex={1}
              borderRadius="0"
              bg={tab === key ? '$background' : 'transparent'}
              paddingVertical="$3"
              paddingHorizontal="$3"
              justifyContent="center"
            >
              <Text
                fontSize="$5"
                textAlign="center"
                fontWeight="600"
                color={tab === key ? '$color' : '$gray10'}
              >
                {label}
              </Text>
            </Button>
          ))}
        </XStack>

        {/* Content */}
        <YStack bg="$background" p="$4" gap="$4">
          {tab === 'saved' ? (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <YStack gap="$3">
                {loading && <Text>Loading...</Text>}
                {!loading && saved.length === 0 && (
                  <Text color="$gray10" fontSize="$4" textAlign="center">
                    No saved workouts yet.
                  </Text>
                )}
                {!loading && saved.length > 0 && (
                  <YStack>
                  <Text fontSize="$7" textAlign="left" mb={'$3'}>
                    Select a Favorite
                  </Text>
                    <Text fontSize="$3" color="$gray10" textAlign="left">
                  Selecting will use that workout as a template
                </Text>
                  </YStack>
                )}
                {saved.map((template) => (
                  <Button
                    key={template.id}
                    onPress={() => handleLoadTemplate(template)}
                  >
                    {template.title}
                  </Button>
                ))}
              </YStack>
            </ScrollView>
          ) : (
            <>
              {/* Header */}
              <XStack jc="space-between" ai="center">
                <Text fontSize="$6" fontWeight="700">
                  {title.trim() ? ` ${title.trim()}` : ''}
                </Text>
                {(title.trim() || exercises.length > 1 || exercises[0].name.trim()) && (
                  <Button chromeless size="$2" onPress={resetForm}>
                    Reset
                  </Button>
                )}
              </XStack>

              {/* Title input + Star */}
              <XStack ai="center" gap="$2">
                <Input
                  flex={1}
                  placeholder="Workout title"
                  value={title}
                  onChangeText={text => {
                    setTitle(text)
                    if (text.trim()) {
                      setMissingTitle(false)
                      setFeedback('')
                    }
                  }}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  maxLength={20}
                />
                {title.trim().length > 0 && (
                  <Button
                    chromeless
                    size="$4"
                    icon={() => <Text fontSize="$6">{isFavorite ? '★' : '☆'}</Text>}
                    onPress={isFavorite ? undefined : handleSaveTemplate}
                    disabled={isFavorite}
                    accessibilityLabel="Favorite workout"
                  />
                )}
              </XStack>

              {title.trim().length === 0 && (
                <Text fontSize="$4" color="$gray10" textAlign="center">
                  Enter new workout title or select workout template from favorites
                </Text>
              )}

              {feedback !== '' && (
                <Text color="$red10" fontSize="$4" textAlign="center">
                  {feedback}
                </Text>
              )}

              {title.trim().length > 0 && (
                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  <YStack gap="$6" pb="$8">
                    {exercises.map((exercise, exerciseIndex) => (
                      <YStack key={exerciseIndex} gap="$3">
                       <XStack jc="space-between" ai="center">
  <Text fontWeight="600" fontSize="$6">
    Exercise {exerciseIndex + 1}
  </Text>
  <XStack gap="$2" ai="center">
    <Button
  chromeless
  size="$2"
  onPress={() => handleSaveExercise(exercises[exerciseIndex])}
  icon={() => (
    <Text fontSize="$5">
      {savedExercises.some(
        (ex) =>
          ex.name.toLowerCase() === exercises[exerciseIndex].name.trim().toLowerCase()
      )
        ? '★'
        : '☆'}
    </Text>
  )}
/>

    <Button
      chromeless
      size="$2"
      onPress={() => handleRemoveExercise(exerciseIndex)}
    >
      Remove
    </Button>
  </XStack>
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

                   <XStack gap="$2" jc="space-between" flexWrap="wrap" alignItems='center'>
  <Button onPress={handleAddExercise}>
    + Add Exercise
  </Button>
  <Text>or</Text>
  <YStack>
    <Button onPress={() => setShowExerciseDropdown(!showExerciseDropdown)}>
      + From Favorites
    </Button>

    {showExerciseDropdown && (
      <YStack
        mt="$2"
        bg="$background"
        borderWidth={1}
        borderColor="$gray6"
        borderRadius="$3"
        p="$2"
        gap="$2"
        maxHeight={200}
        overflow="scroll"
        zIndex={100}
      >
       {loadingSavedExercises ? (
  <Text>Loading...</Text>
) : savedExercises.length > 0 ? (
  savedExercises.map((ex, i) => (
    <Button
      key={i}
      size="$2"
      chromeless
      onPress={() => {
        handleAddFavoriteExercise(ex)
        setShowExerciseDropdown(false)
      }}
    >
      {ex.name}
    </Button>
  ))
) : (
  <Text color="$gray10" fontSize="$4" textAlign="center">
    No favorites yet.
  </Text>
)}

      </YStack>
    )}
  </YStack>
</XStack>

                  </YStack>
                </ScrollView>
              )}
            </>
          )}

          {/* Final Actions */}
          {tab === 'new' && (
  <XStack gap="$2">
            <Button flex={1} onPress={onClose}>
              Cancel
            </Button>
            <Button flex={1} onPress={handleSubmit} theme="active">
              Submit
            </Button>
          </XStack>
          )}
        
        </YStack>
      </YStack>
    </View>
  </Modal>
)

}
