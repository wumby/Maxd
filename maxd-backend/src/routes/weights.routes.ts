import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import {
  WeightEntrySchema,
  WeightUpdateSchema,
  WeightEntryInput,
  WeightUpdateInput,
} from '../validators/weights'
import z from 'zod'

const router = Router()

// Get weights for logged-in user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId

  try {
    const result = await db.query(
      'SELECT * FROM weights WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    res.json(result.rows)
    return
  } catch (err) {
    console.error('Failed to fetch weights:', err)

    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// Create new weight entry
router.post('/', requireAuth, async (req: Request<{}, {}, WeightEntryInput>, res: Response) => {
  const userId = req.user?.userId
  const parsed = WeightEntrySchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: z.treeifyError(parsed.error) })
    return
  }

  const { value, date } = parsed.data
  const createdAt = date ?? new Date()

  const year = createdAt.getFullYear()
  const month = String(createdAt.getMonth() + 1).padStart(2, '0')
  const day = String(createdAt.getDate()).padStart(2, '0')
  const dateOnly = `${year}-${month}-${day}`

  try {
    const existing = await db.query(
      'SELECT 1 FROM weights WHERE user_id = $1 AND DATE(created_at) = $2',
      [userId, dateOnly]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: 'You already logged weight for this day' })
      return
    }

    const result = await db.query(
      'INSERT INTO weights (user_id, value, created_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, value, createdAt]
    )

    res.status(201).json(result.rows[0])
    return
  } catch (err) {
    console.error('Failed to save weight:', err)

    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

// Update a weight entry
router.put(
  '/:id',
  requireAuth,
  async (req: Request<{ id: string }, {}, WeightUpdateInput>, res: Response) => {
    const userId = req.user?.userId
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' })
      return
    }

    const parsed = WeightUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: z.treeifyError(parsed.error) })
      return
    }

    try {
      const result = await db.query(
        'UPDATE weights SET value = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [parsed.data.value, id, userId]
      )

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Weight not found' })
        return
      }

      res.json(result.rows[0])
      return
    } catch (err) {
      console.error('Failed to update weight:', err)

      res.status(500).json({ error: 'Internal server error' })
      return
    }
  }
)

// Delete a weight entry
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid ID' })
    return
  }

  try {
    const result = await db.query('DELETE FROM weights WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ])

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Weight not found' })
      return
    }

    res.json({ message: 'Weight deleted' })
    return
  } catch (err) {
    console.error('Failed to delete weight:', err)

    res.status(500).json({ error: 'Internal server error' })
    return
  }
})

export default router
