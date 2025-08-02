export type SetBase = {
  reps?: number | null
  weight?: number | null
  duration?: number | null
  distance?: number | null
  distance_unit?: string | null
}

export type ExerciseType = 'weights' | 'cardio' | 'bodyweight'

export interface ExerciseInput {
  name: string
  type: ExerciseType
  sets: SetBase[]
}

export interface WorkoutInput {
  title: string
  created_at: string
  exercises: ExerciseInput[]
}

export interface ExerciseResponse extends ExerciseInput {
  id: number
}

export interface WorkoutResponse {
  id: number
  title: string | null
  created_at: string
  exercises: ExerciseResponse[]
}
