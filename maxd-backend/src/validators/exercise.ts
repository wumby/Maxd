import { z } from 'zod'

export const SetSchema = z.object({
  reps: z.number().int().nonnegative().nullable().optional(),
  weight: z.number().nonnegative().nullable().optional(),
  duration: z.number().nonnegative().nullable().optional(),
  distance: z.number().nonnegative().nullable().optional(),
  distance_unit: z.enum(['mi', 'km', 'm', 'steps']).nullable().optional(),
})

export const ExerciseUpdateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['weights', 'cardio', 'bodyweight']),
  sets: z.array(SetSchema),
})

export type SetInput = z.infer<typeof SetSchema>
export type ExerciseUpdateInput = z.infer<typeof ExerciseUpdateSchema>
