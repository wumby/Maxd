import React, { useEffect, useState } from 'react'
import { YStack, Text, Button, XStack, Spacer, Sheet } from 'tamagui'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native'
import { API_URL } from '@/env'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { AddExerciseCard } from './AddExerciseCard'
import { WorkoutTitleHeader } from './WorkoutTitleHeader'
import { ExerciseControls } from './ExerciseControls'
import { FinalActions } from './FinalActions'
import { WorkoutModeChooser } from './WorkoutModeChooser'
import { X } from '@tamagui/lucide-icons'
import { FavoriteWorkoutSheet } from './FavoriteWorkoutSheet'
import { ScreenContainer } from '../ScreenContainer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExerciseTypeSheet } from './ExerciseTypeSheet'
import { DurationPickerSheet } from './DurationPickerSheet'

export default function NewWorkoutModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<'choose' | 'form'>('choose')
  const [title, setTitle] = useState('')
  const [missingTitle, setMissingTitle] = useState(false)
  const [feedback, setFeedback] = useState('')
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
    setStep('form')
    setFeedback('')
    setExpandedIndex(0)
  }

  const [showTypeSheet, setShowTypeSheet] = useState(false)

  const handleAddExercise = () => {
  setShowTypeSheet(true)
}


  const handleAddExerciseOfType  = (type: 'weights' | 'cardio' | 'bodyweight') => {
  setExercises(prev => {
    const updated = [
      ...prev,
      {
        name: '',
        type,
        sets: [{ reps: '', weight: '', duration: '', distance: '' }],
      },
    ]
    setExpandedIndex(updated.length - 1)
    return updated
  })
  setShowTypeSheet(false)
}


  const handleRemoveExercise = (index: number) => {
    setExercises(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (expandedIndex === index) {
        setExpandedIndex(null)
      } else if (expandedIndex !== null && expandedIndex > index) {
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
    setStep('choose')
  }

  const handleAddFavoriteExercise = (exercise: any) => {
    setExercises(prev => [...prev, { ...exercise }])
    setExpandedIndex(exercises.length)
  }

  const handleSaveWorkout = async () => {
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
    setSaved(prev => [newFavorite, ...prev]) // ✅ <-- This makes it available in `saved[0]`
  } catch (err) {
    console.error('Error saving favorite workout', err)
    setFeedback('Error saving workout to favorites')
  }
}


  const handleSaveExercise = async (exercise: any, index: number) => {
    const name = exercise.name.trim()
    const hasValidSet = exercise.sets.some(
      (set: any) => set.reps || set.weight || set.duration || set.distance
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


useEffect(() => {
  if (visible) {
    resetForm()
  }
}, [visible])

const [showFavoritesSheet, setShowFavoritesSheet] = useState(false)
const insets = useSafeAreaInsets()
  return (
  <>
    {visible && (
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={99999}
        bg="rgba(0,0,0,0.9)"
        ai="center"
        jc="flex-start"
        p="$4"
        pt={insets.top}
      >
        <YStack
          w="100%"
          maxWidth={400}
          br="$4"
          overflow="hidden"
          bg="$background"
          p="$4"
        >
          {/* Header */}
          <XStack w="100%" ai="center" jc="space-between" mb="$3">
            <Spacer size="$5" />
            <Text fontSize="$8" fontWeight="800" textAlign="center" flex={1}>
              New Workout
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <X size={20} color="gray" />
            </Pressable>
          </XStack>

          {/* Content */}
          {step === 'choose' ? (
            <WorkoutModeChooser
              onChooseNew={() => {
                setExercises([
                 
                ])
                setTitle('')
                setFeedback('')
                setMissingTitle(false)
                setExerciseErrors({})
                setExpandedIndex(0)
                setStep('form')
              }}
              onChooseFavorite={() => {
                if (saved.length > 0) {
                  setShowFavoritesSheet(true)
                } else {
                  setFeedback('No saved workouts available.')
                }
              }}
              feedback={feedback}
            />
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
                onFavorite={handleSaveWorkout}
              />

              {title.trim().length > 0 && (
                <ScrollView
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                >
                  <YStack gap="$6" py="$8">
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
                        onSave={exercise =>
                          handleSaveExercise(exercise, index)
                        }
                        error={exerciseErrors[index]}
                        isSaved={savedExercises.some(
                          ex =>
                            ex.name.toLowerCase() ===
                            exercise.name.trim().toLowerCase()
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

              {feedback !== '' && (
                <Text color="$red10" fontSize="$4" textAlign="center" mt="$5">
                  {feedback}
                </Text>
              )}

              <FinalActions onCancel={onClose} onSubmit={handleSubmit} />
            </>
          )}
        </YStack>
      </YStack>
    )}
   <FavoriteWorkoutSheet
  open={showFavoritesSheet}
  onOpenChange={setShowFavoritesSheet}
  favorites={saved}
  onSelect={(workout) => handleLoadTemplate(workout)}
/><ExerciseTypeSheet
  open={showTypeSheet}
  onOpenChange={setShowTypeSheet}
  onSelect={handleAddExerciseOfType}
/>



  </>
)

}
