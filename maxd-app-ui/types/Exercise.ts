// types/Exercise.ts
export interface Exercise {
  id?: number
  name: string
  type: 'weights' | 'cardio' | 'bodyweight'
  sets: any[]
}
