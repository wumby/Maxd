export type Set = {
  reps?: number
  weight?: number
  distance?: number
  distance_unit?: 'mi' | 'km' | 'm' | 'steps'
  duration?: number
  durationSeconds?: number
}

export type Exercise = {
  id: number
  workout_id: number
  user_id: string
  type: 'weights' | 'bodyweight' | 'cardio'
  name: string
  order_index: number
  sets: Set[]
}

export type Workout = {
  id: number
  user_id: string
  title: string | null
  created_at: string
  exercises: Exercise[]
}
export interface FavoriteWorkout {
  id?: number
  title: string
  created_at?: string
  exercises: any[]
}
