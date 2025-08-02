import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import { SavedWorkoutSchema, SavedWorkoutInput } from '../validators/savedWorkout'
import { SavedWorkout } from '../types'
import z from 'zod'

const router = Router()

router.post('/', requireAuth, async (req: Request<{}, {}, SavedWorkoutInput>, res: Response) => {
  const userId = req.user?.userId

  const parsed = SavedWorkoutSchema.safeParse(req.body)
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: 'Invalid input', details: z.treeifyError(parsed.error), status: 400 })
    return
  }

  const { title, exercises } = parsed.data

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM saved_workouts WHERE user_id = $1', [
      userId,
    ])
    const currentCount = parseInt(countResult.rows[0].count)
    const MAX_SAVED_WORKOUTS = 100

    if (currentCount >= MAX_SAVED_WORKOUTS) {
      res.status(403).json({
        error: `Limit of ${MAX_SAVED_WORKOUTS} saved workouts reached.`,
        status: 403,
      })
      return
    }

    const result = await db.query(
      `INSERT INTO saved_workouts (user_id, title, exercises)
         VALUES ($1, $2, $3)
         RETURNING *`,
      [userId, title, JSON.stringify(exercises)]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Failed to save workout', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  try {
    const result = await db.query(
      `SELECT * FROM saved_workouts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
    res.json(result.rows as SavedWorkout[])
  } catch (err) {
    console.error('Failed to fetch saved workouts', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

router.delete('/:title', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const title = decodeURIComponent(req.params.title)

  try {
    const result = await db.query(
      `DELETE FROM saved_workouts
       WHERE user_id = $1 AND LOWER(title) = LOWER($2)
       RETURNING *`,
      [userId, title]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Saved workout not found', status: 404 })
      return
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Failed to delete saved workout', err)
    res.status(500).json({ error: 'Internal server error', status: 500 })
  }
})

export default router
