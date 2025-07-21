import React, { useState } from 'react'
import { YStack, Text, XStack, ScrollView, Button } from 'tamagui'
import { useAuth } from '@/contexts/AuthContext'
import { useSavedWorkouts } from '@/hooks/useSavedWorkouts'
import { useSavedExercises } from '@/hooks/useSavedExercises'
import { AddExerciseCard } from './AddExerciseCard'
import { WorkoutTitleHeader } from './WorkoutTitleHeader'
import { FinalActions } from './FinalActions'
import { WorkoutModeChooser } from './WorkoutModeChooser'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { FavoriteWorkoutSheet } from './FavoriteWorkoutSheet'
import { ExerciseTypeSheet } from './ExerciseTypeSheet'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { Pressable } from 'react-native'
import { ScreenContainer } from '../ScreenContainer'
import { FavoriteExerciseSheet } from './FavoriteExerciseSheet'
import { createWorkout, createSavedWorkout, createSavedExercise } from '@/services/workoutService'

export default function NewWorkout({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: () => void
}) {
  const [step, setStep] = useState<'choose' | 'form'>('choose')
  const [title, setTitle] = useState('')
  const [, setMissingTitle] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [exercises, setExercises] = useState<any[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)
  const [exerciseErrors, setExerciseErrors] = useState<Record<number, string>>({})
  const [workoutDate, setWorkoutDate] = useState(new Date())
  const [showFavoritesSheet, setShowFavoritesSheet] = useState(false)
  const [showExerciseSheet, setShowExerciseSheet] = useState(false)
  const [showTypeSheet, setShowTypeSheet] = useState(false)
  const { saved, setSaved } = useSavedWorkouts()
  const { savedExercises, setSavedExercises } = useSavedExercises()
  const { token } = useAuth()
  const { weightUnit } = usePreferences()

  const resetForm = () => {
    setMissingTitle(false)
    setFeedback('')
    setTitle('')
    setExercises([])
    setExpandedIndex(0)
    setStep('choose')
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index))
  }

  const handleAddExerciseOfType = (type: 'weights' | 'cardio' | 'bodyweight') => {
    setExercises(prev => {
      const updated = [
        ...prev,
        { name: '', type, sets: [{ reps: '', weight: '', duration: '', distance: '' }] },
      ]
      setExpandedIndex(updated.length - 1)
      return updated
    })
    setShowTypeSheet(false)
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (expandedIndex === index) setExpandedIndex(null)
      else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
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

  const buildPayload = () => {
    return exercises
      .filter(ex => ex.name.trim() && ex.sets.length > 0)
      .map(ex => ({
        name: ex.name.trim(),
        type: ex.type,
        sets: ex.sets.map((set: any) => {
          const raw = parseFloat(set.weight)
          const weightInKg = isNaN(raw) ? null : weightUnit === 'lb' ? WeightUtil.lbsToKg(raw) : raw
          console.log('distance_unit:', set.distance_unit)

          return {
            reps: parseInt(set.reps) || null,
            weight: weightInKg,
            duration: set.duration || null,
            distance: set.distance || null,
            distance_unit: set.distance_unit || null,
          }
        }),
      }))
      .filter(ex => ex.sets.length > 0)
  }

  // In your React Native NewWorkout component where you call createWorkout:

  const handleSubmit = async () => {
    setFeedback('')
    if (!title.trim()) {
      setMissingTitle(true)
      setFeedback('Workout title is required')
      return
    }

    const payload = buildPayload()
    if (payload.length === 0) {
      setFeedback('Add at least one valid exercise')
      return
    }

    try {
      await createWorkout(token, {
        title: title.trim(),
        created_at: workoutDate.toISOString(),
        exercises: payload,
      })
      resetForm()
      onSubmit()
    } catch (err) {
      console.error('Workout save failed', err)

      if (err instanceof Error && err.message.includes('Limit of 3 workouts per day reached')) {
        setFeedback('You have already logged 3 workouts today.')
      } else {
        setFeedback('Error saving workout')
      }
    }
  }

  const alreadyFavorited = saved.some(
    w => w.title.toLowerCase().trim() === title.toLowerCase().trim()
  )

  const handleSaveWorkout = async () => {
    setFeedback('')
    if (!title.trim()) {
      setMissingTitle(true)
      setFeedback('Workout title is required to save as favorite')
      return
    }

    if (alreadyFavorited) {
      setFeedback('This workout name is already in your favorites')
      return
    }

    const payload = buildPayload()
    if (payload.length === 0) {
      setFeedback('Add at least one valid exercise to favorite')
      return
    }

    try {
      const newFavorite = await createSavedWorkout(token, {
        title: title.trim(),
        exercises: payload,
      })
      setSaved(prev => [newFavorite, ...prev])
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
      const saved = await createSavedExercise(token, {
        name,
        type: exercise.type,
        sets: exercise.sets,
      })
      setSavedExercises(prev => [saved, ...prev])
    } catch (err) {
      console.error('Error saving exercise', err)
      setExerciseErrors(prev => ({
        ...prev,
        [index]: 'Server error saving this exercise.',
      }))
    }
  }
const handleLoadTemplate = (template: any) => {
  const mappedExercises = template.exercises.map((ex: any) => ({
    name: ex.name,
    type: ex.type,
    sets: ex.sets.map((set: any) => {
      const rawWeight = set.weight ?? null
      const displayWeight =
        weightUnit === 'lb' && rawWeight != null
          ? Math.round(WeightUtil.kgToLbs(rawWeight))
          : rawWeight != null
          ? Math.round(rawWeight)
          : null

      return {
        reps: set.reps?.toString() ?? '',
        weight: displayWeight?.toString() ?? '',
        duration: set.durationSeconds?.toString?.() ?? '',
        distance: set.distance?.toString() ?? '',
        distance_unit: set.distance_unit ?? 'mi',
      }
    }),
  }))

  setTitle(template.title)
  setExercises(mappedExercises)
  setStep('form')
  setFeedback('')
  setExpandedIndex(0)
}



const handleAddFavoriteExercise = (exercise: any) => {
  const mapped = {
    ...exercise,
    sets: exercise.sets.map((set: any) => {
      const rawWeight = set.weight ?? null
      const displayWeight =
        weightUnit === 'lb' && rawWeight != null
          ? Math.round(WeightUtil.kgToLbs(rawWeight))
          : rawWeight != null
          ? Math.round(rawWeight)
          : null
      return {
        reps: set.reps?.toString() ?? '',
        weight: displayWeight?.toString() ?? '',
        duration: set.durationSeconds?.toString?.() ?? '',
        distance: set.distance?.toString() ?? '',
        distance_unit: set.distance_unit ?? 'mi',
      }
    }),
  }
  setExercises(prev => [...prev, mapped])
  setExpandedIndex(exercises.length)
}




  return (
    <ScreenContainer>
      <XStack jc="space-between" ai="center" mb="$3">
        <Pressable onPress={onCancel} hitSlop={10}>
          <XStack fd="row" ai="center" gap="$2">
            <ChevronLeft size={20} />
            <Text fontSize="$5" fontWeight="600" color="$color">
              Back
            </Text>
          </XStack>
        </Pressable>
        <Text />
      </XStack>

      <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
        New Workout
      </Text>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {step === 'choose' ? (
          <WorkoutModeChooser
            onChooseNew={() => {
              setExercises([])
              setTitle('')
              setFeedback('')
              setMissingTitle(false)
              setExerciseErrors({})
              setExpandedIndex(0)
              setStep('form')
            }}
            onChooseFavorite={() => {
              if (saved.length > 0) setShowFavoritesSheet(true)
              else setFeedback('No saved workouts available.')
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

            <YStack gap="$6" py="$4">
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
                  onSave={exercise => handleSaveExercise(exercise, index)}
                  error={exerciseErrors[index]}
                  isSaved={savedExercises.some(
                    ex => ex.name.toLowerCase() === exercise.name.trim().toLowerCase()
                  )}
                />
              ))}

              <XStack gap="$2" jc="space-between" flexWrap="wrap" alignItems="center">
                <Button onPress={() => setShowTypeSheet(true)}>+ New Exercise</Button>
                <Text>or</Text>
                <Button onPress={() => setShowExerciseSheet(true)}>★ From Favorites</Button>
              </XStack>

              {feedback !== '' && (
                <Text color="$red10" fontSize="$4" textAlign="center">
                  {feedback}
                </Text>
              )}

              <FinalActions
                onCancel={onCancel}
                onSubmit={handleSubmit}
                workoutDate={workoutDate}
                setWorkoutDate={setWorkoutDate}
              />
            </YStack>
          </>
        )}
      </ScrollView>

      <FavoriteWorkoutSheet
        open={showFavoritesSheet}
        onOpenChange={setShowFavoritesSheet}
        favorites={saved}
        onSelect={handleLoadTemplate}
      />

      <ExerciseTypeSheet
        open={showTypeSheet}
        onOpenChange={setShowTypeSheet}
        onSelect={handleAddExerciseOfType}
      />

      <FavoriteExerciseSheet
        open={showExerciseSheet}
        onOpenChange={setShowExerciseSheet}
        favorites={savedExercises}
        onSelect={handleAddFavoriteExercise}
      />
    </ScreenContainer>
  )
}
