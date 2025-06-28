// routes/savedExercises.routes.ts
import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const { name, type, sets } = req.body

  if (!name || !type || !Array.isArray(sets)) {
    res.status(400).json({ error: 'Invalid input' });
    return 
  }

  try {
    const result = await db.query(
      `INSERT INTO saved_exercises (user_id, name, type, sets)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, type, JSON.stringify(sets)]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Failed to save exercise', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId

  try {
    const result = await db.query(
      `SELECT * FROM saved_exercises WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Failed to fetch saved exercises', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


export default router
