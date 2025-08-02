// routes/savedExercises.routes.ts
import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import { SavedExerciseInput, SavedExerciseSchema } from '../validators/savedExercise'
import { SavedExercise } from '../types'
import z from 'zod'

const router = Router()

router.post('/', requireAuth, async (req: Request<{}, {}, SavedExerciseInput>, res: Response) => {
  const userId = req.user?.userId
  const parsed = SavedExerciseSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid input',
      details: z.treeifyError(parsed.error),
      status: 400,
    })
    return
  }

  const { name, type, sets } = parsed.data

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM saved_exercises WHERE user_id = $1', [
      userId,
    ])
    const currentCount = parseInt(countResult.rows[0].count)
    const MAX_SAVED_EXERCISES = 100

    if (currentCount >= MAX_SAVED_EXERCISES) {
      res.status(403).json({
        error: `Limit of ${MAX_SAVED_EXERCISES} saved exercises reached.`,
        status: 403,
      })
      return
    }

    const result = await db.query(
      `INSERT INTO saved_exercises (user_id, name, type, sets)
         VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, type, JSON.stringify(sets)]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Failed to save exercise', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId

  try {
    const result = await db.query(
      `SELECT * FROM saved_exercises WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    res.json(result.rows as SavedExercise[])
  } catch (err) {
    console.error('Failed to fetch saved exercises', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const id = parseInt(req.params.id)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid ID', status: 400 })
    return
  }

  try {
    const result = await db.query(
      `DELETE FROM saved_exercises WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Exercise not found', status: 404 })
      return
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Failed to delete saved exercise', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

export default router
