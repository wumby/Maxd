import { useState } from 'react'
import { YStack, Text, Button, XStack } from 'tamagui'
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { AddExerciseCard } from './AddExerciseCard'
import { WorkoutTitleHeader } from './WorkoutTitleHeader'
import { FavoritesTab } from './FavoritesTab'
import { ExerciseControls } from './ExerciseControls'
import { FinalActions } from './FinalActions'

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
  const [exercises, setExercises] = useState<any[]>([
    { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
  ])
  const { saved, setSaved, loading } = useSavedWorkouts()
  const { savedExercises, setSavedExercises, loading: loadingSavedExercises } = useSavedExercises()
  const { token } = useAuth()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const [exerciseErrors, setExerciseErrors] = useState<Record<number, string>>({})


  const toggleExpand = (index: number) => {
  setExpandedIndex(prev => (prev === index ? null : index))
}


  const handleLoadTemplate = (template: any) => {
    setTitle(template.title)
    setExercises(template.exercises)
    setTab('new')
    setFeedback('')
    setExpandedIndex(0)
  }

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
    ])
    setExpandedIndex(exercises.length)
  }

  const handleRemoveExercise = (index: number) => {
  setExercises(prev => {
    const updated = prev.filter((_, i) => i !== index)
    // If the removed index was the expanded one, collapse it
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else if (expandedIndex !== null && expandedIndex > index) {
      // Adjust expandedIndex if it was after the removed one
      setExpandedIndex(expandedIndex - 1)
    }

    return updated
  })
}


  const handleChangeName = (index: number, newName: string) => {
  setExercises(prev => {
    const updated = [...prev]
    updated[index].name = newName
    return updated
  })
  setExerciseErrors(prev => {
    const next = { ...prev }
    delete next[index]
    return next
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
  setExerciseErrors(prev => {
    const next = { ...prev }
    delete next[exerciseIndex]
    return next
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
    setExercises([
      { name: '', type: 'weights', sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
    ])
    setExpandedIndex(0)
  }

  const handleSaveTemplate = async () => {
    setFeedback('')
    if (!title.trim()) {
      setMissingTitle(true)
      setFeedback('Workout title is required to save as favorite')
      return
    }

    const alreadyFavorited = saved.some(
      w => w.title.toLowerCase().trim() === title.toLowerCase().trim()
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
      setSaved(prev => [newFavorite, ...prev])
    } catch (err) {
      console.error('Save template failed', err)
      setFeedback('Error saving favorite')
    }
  }

  const handleAddFavoriteExercise = (exercise: any) => {
    setExercises(prev => [...prev, { ...exercise }])
    setExpandedIndex(exercises.length)
  }

  const handleSaveExercise = async (exercise: any, index: number) => {
  const name = exercise.name.trim()
  const hasValidSet = exercise.sets.some(
    (set: any) =>
      set.reps || set.weight || set.duration || set.distance
  )

  if (!name || !hasValidSet) {
    setExerciseErrors(prev => ({
      ...prev,
      [index]: 'Enter a name and at least one set to favorite this exercise.',
    }))
    return
  }

  setExerciseErrors(prev => {
    const updated = { ...prev }
    delete updated[index]
    return updated
  })

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
    setExerciseErrors(prev => ({
      ...prev,
      [index]: 'Server error saving this exercise.',
    }))
  }
}


  const alreadyFavorited = saved.some(
    w => w.title.toLowerCase().trim() === title.toLowerCase().trim()
  )

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 20,
          paddingTop:60
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
              <FavoritesTab saved={saved} loading={loading} onSelectTemplate={handleLoadTemplate} />
            ) : (
              <>
                <WorkoutTitleHeader
                  title={title}
                  onChangeTitle={text => {
                    setTitle(text)
                    if (text.trim()) {
                      setMissingTitle(false)
                      setFeedback('')
                    }
                  }}
                  onReset={resetForm}
                  isFavorited={alreadyFavorited}
                  onFavorite={handleSaveTemplate}
                />

                {title.trim().length === 0 && (
                  <Text fontSize="$4" color="$gray10" textAlign="center">
                    Enter new workout title or select workout template from favorites tab
                  </Text>
                )}

                

                {title.trim().length > 0 && (
                  
                  <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                    <YStack gap="$6" pb="$8">
                      {exercises.map((exercise, index) => (
                        <AddExerciseCard
                          key={index}
                          index={index}
                          exercise={exercise}
                          expanded={expandedIndex === index}

                          onToggleExpand={toggleExpand}
                          onChangeName={handleChangeName}
                          onChangeType={handleChangeType}
                          onAddSet={handleAddSet}
                          onRemoveSet={handleRemoveSet}
                          onChangeSet={handleChangeSet}
                          onRemove={handleRemoveExercise}
                           onSave={(exercise) => handleSaveExercise(exercise, index)}
  error={exerciseErrors[index]}
                          isSaved={savedExercises.some(
                            ex => ex.name.toLowerCase() === exercise.name.trim().toLowerCase()
                          )}
                        />
                      ))}

                      <ExerciseControls
                        savedExercises={savedExercises}
                        loading={loadingSavedExercises}
                        onAddExercise={handleAddExercise}
                        onAddFavoriteExercise={handleAddFavoriteExercise}
                      />
                    </YStack>
                  </ScrollView>
                )}
              </>
            )}
            {feedback !== '' && (
                  <Text color="$red10" fontSize="$4" textAlign="center">
                    {feedback}
                  </Text>
                )}
            {tab === 'new' && <FinalActions onCancel={onClose} onSubmit={handleSubmit} />}
          </YStack>
        </YStack>
      </View>
    </Modal>
  )
}
