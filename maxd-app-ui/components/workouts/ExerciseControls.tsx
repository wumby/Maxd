import { useState } from 'react'
import { YStack, XStack, Button, Text } from 'tamagui'
import { FavoriteExerciseSheet } from './FavoriteExerciseSheet'

export function ExerciseControls({
  savedExercises,
  loading,
  onAddExercise,
  onAddFavoriteExercise,
}: {
  savedExercises: any[]
  loading: boolean
  onAddExercise: () => void
  onAddFavoriteExercise: (exercise: any) => void
}) {
  return <></>
}
