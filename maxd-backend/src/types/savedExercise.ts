import { z } from 'zod'
import { SetSchema } from '@/validators/exercise'

export type SetInput = z.infer<typeof SetSchema>

export interface SavedExercise {
  id: number
  user_id: string
  name: string
  type: 'weights' | 'cardio' | 'bodyweight'
  sets: SetInput[]
  created_at: string
}
