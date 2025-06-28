// routes/savedWorkouts.routes.ts
import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Create a saved workout
router.post('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const { title, exercises } = req.body

  if (!title || !Array.isArray(exercises)) {
     res.status(400).json({ error: 'Invalid input' })
     return
  }

  try {
    const result = await db.query(
      `INSERT INTO saved_workouts (user_id, title, exercises)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, JSON.stringify(exercises)]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Failed to save workout', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all saved workouts for the user
router.get('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId

  try {
    const result = await db.query(
      `SELECT * FROM saved_workouts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Failed to fetch saved workouts', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
