import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  goal_mode: z.enum(['lose', 'gain', 'track']).optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
