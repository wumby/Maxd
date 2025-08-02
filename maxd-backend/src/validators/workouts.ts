// validators/workouts.ts
import { z } from 'zod'

export const SetSchema = z.object({
  reps: z.number().int().nonnegative().nullable().optional(),
  weight: z.number().nonnegative().nullable().optional(),
  duration: z.number().nonnegative().nullable().optional(),
  distance: z.number().nonnegative().nullable().optional(),
  distance_unit: z.enum(['mi', 'km', 'm', 'steps']).nullable().optional(),
})

export const ExerciseSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['weights', 'cardio', 'bodyweight']),
  sets: z.array(SetSchema),
})

export const WorkoutCreateSchema = z.object({
  title: z.string().optional(),
  created_at: z.coerce.date().optional(),
  exercises: z.array(ExerciseSchema),
})

export const WorkoutUpdateSchema = WorkoutCreateSchema

// Types
export type SetInput = z.infer<typeof SetSchema>
export type ExerciseInput = z.infer<typeof ExerciseSchema>
export type WorkoutCreateInput = z.infer<typeof WorkoutCreateSchema>
export type WorkoutUpdateInput = z.infer<typeof WorkoutUpdateSchema>
