import { SetBase } from './workout'

export interface SavedWorkout {
  id: number
  user_id: string
  title: string
  exercises: {
    name: string
    type: 'weights' | 'cardio' | 'bodyweight'
    sets: SetBase[]
  }[]
  created_at: string
}

export interface SavedWorkoutInput {
  title: string
  exercises: SavedWorkout['exercises']
}
