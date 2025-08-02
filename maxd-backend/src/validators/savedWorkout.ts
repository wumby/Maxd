import { z } from 'zod'
import { SetSchema } from './exercise'

export const SavedWorkoutSchema = z.object({
  title: z.string().min(1),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(['weights', 'cardio', 'bodyweight']),
        sets: z.array(SetSchema),
      })
    )
    .min(1),
})

export type SavedWorkoutInput = z.infer<typeof SavedWorkoutSchema>
