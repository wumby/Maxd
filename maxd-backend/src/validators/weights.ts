import { z } from 'zod'

export const WeightEntrySchema = z.object({
  value: z.number().positive(),
  date: z.coerce.date().optional(),
})

export const WeightUpdateSchema = z.object({
  value: z.number().positive(),
})

export type WeightEntryInput = z.infer<typeof WeightEntrySchema>
export type WeightUpdateInput = z.infer<typeof WeightUpdateSchema>
