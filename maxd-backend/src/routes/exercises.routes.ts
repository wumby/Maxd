import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()


router.delete('/:id', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const exerciseId = parseInt(req.params.id)

  if (isNaN(exerciseId)) {
   res.status(400).json({ error: 'Invalid exercise ID' })
    return 
  }

  try {
    const check = await db.query(
      'SELECT id FROM exercises WHERE id = $1 AND user_id = $2',
      [exerciseId, userId]
    )

    if (check.rowCount === 0) {
       res.status(404).json({ error: 'Exercise not found or unauthorized' })
       return
    }

    await db.query('DELETE FROM exercises WHERE id = $1', [exerciseId])
    res.status(200).json({ message: 'Exercise deleted' })
  } catch (err) {
    console.error('Error deleting exercise:', err)
    res.status(500).json({ error: 'Failed to delete exercise' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const exerciseId = parseInt(req.params.id)

  if (isNaN(exerciseId)) {
     res.status(400).json({ error: 'Invalid exercise ID' })
     return
  }

  const { name, type, sets } = req.body

  if (!name || !type || !Array.isArray(sets)) {
     res.status(400).json({ error: 'Invalid input' })
     return
  }

  try {
    // Ensure the user owns the exercise via the workout
    const check = await db.query(
      `
      SELECT e.id
      FROM exercises e
      JOIN workouts w ON e.workout_id = w.id
      WHERE e.id = $1 AND w.user_id = $2
      `,
      [exerciseId, userId]
    )

    if (check.rowCount === 0) {
       res.status(404).json({ error: 'Exercise not found or unauthorized' })
       return
    }

    // Update exercise name/type
    await db.query(
      'UPDATE exercises SET name = $1, type = $2 WHERE id = $3',
      [name, type, exerciseId]
    )

    // Delete existing sets
    await db.query('DELETE FROM sets WHERE exercise_id = $1', [exerciseId])

    // Insert updated sets
    for (const set of sets) {
      const reps = isFinite(parseInt(set.reps)) ? parseInt(set.reps) : null
const weight = isFinite(parseFloat(set.weight)) ? parseFloat(set.weight) : null

      const distance = set.distance ?? null
      const distance_unit = set.distance_unit ?? null
      const duration = set.duration ?? set.durationSeconds ?? null

      await db.query(
        `INSERT INTO sets (exercise_id, reps, weight, distance, distance_unit, duration)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [exerciseId, reps, weight, distance, distance_unit, duration]
      )
    }

     res.status(200).json({
  id: exerciseId,
  name,
  type,
  sets 
})

     return
  } catch (err) {
    console.error('Error updating exercise:', err)
     res.status(500).json({ error: 'Failed to update exercise' })
     return
  }
})



export default router