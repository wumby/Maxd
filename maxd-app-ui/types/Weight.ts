export interface WeightEntry {
  id: number
  value: number
  created_at: string
}

export interface LogWeightParams {
  weightInKg: number
  date: string
}
