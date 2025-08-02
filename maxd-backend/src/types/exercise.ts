import { ExerciseUpdateSchema, SetSchema } from 'src/validators/exercise'
import { z } from 'zod'
import { SetBase } from './workout'

export type ExerciseType = 'weights' | 'cardio' | 'bodyweight'

export interface Exercise {
  id: number
  workout_id: number
  user_id: string
  name: string
  type: ExerciseType
  order_index: number
  sets: SetBase[]
}
