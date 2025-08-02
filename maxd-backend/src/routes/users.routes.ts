// routes/users.routes.ts
import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import { UpdateUserInput, UpdateUserSchema } from '../validators/users'
import { User } from '../types'
import z from 'zod'

const router = Router()

router.delete('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId

  try {
    await db.query('DELETE FROM users WHERE id = $1', [userId])
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Failed to delete account', status: 500 })
  }
})

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  try {
    const result = await db.query('SELECT id, name, email, goal_mode FROM users WHERE id = $1', [
      userId,
    ])

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found', status: 404 })
      return
    }

    res.json(result.rows[0] as User)
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Failed to fetch user', status: 500 })
  }
})
router.patch('/me', requireAuth, async (req: Request<{}, {}, UpdateUserInput>, res: Response) => {
  const userId = req.user?.userId
  const parsed = UpdateUserSchema.safeParse(req.body)

  if (!parsed.success) {
    res
      .status(400)
      .json({ error: 'Invalid input', details: z.treeifyError(parsed.error), status: 400 })
    return
  }

  const { name, email, goal_mode } = parsed.data
  const fields = [
    name && { column: 'name', value: name },
    email && { column: 'email', value: email },
    goal_mode && { column: 'goal_mode', value: goal_mode },
  ].filter(Boolean) as { column: string; value: string }[]

  if (fields.length === 0) {
    res.status(400).json({ error: 'No valid fields to update', status: 400 })
    return
  }

  const setClause = fields.map((f, i) => `${f.column} = $${i + 1}`).join(', ')
  const values = fields.map(f => f.value)

  try {
    const result = await db.query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}
         RETURNING id, name, email, goal_mode`,
      [...values, userId]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found', status: 404 })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ error: 'Failed to update profile', status: 500 })
  }
})

export default router
