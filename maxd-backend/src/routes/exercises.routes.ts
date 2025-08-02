import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import { ExerciseUpdateInput, ExerciseUpdateSchema } from '../validators/exercise'
import format from 'pg-format'
import { SetBase } from '../types'
import z from 'zod'

const router = Router()

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const exerciseId = parseInt(req.params.id)

  if (!userId || isNaN(exerciseId)) {
    res.status(400).json({ error: 'Invalid exercise ID or user' })
    return
  }

  try {
    const check = await db.query('SELECT id FROM exercises WHERE id = $1 AND user_id = $2', [
      exerciseId,
      userId,
    ])

    if (check.rowCount === 0) {
      res.status(404).json({ error: 'Exercise not found or unauthorized' })
      return
    }

    await db.query('DELETE FROM exercises WHERE id = $1', [exerciseId])
    res.status(200).json({ message: 'Exercise deleted' })
    return
  } catch (err) {
    console.error('Error deleting exercise:', err)
    res.status(500).json({ error: 'Failed to delete exercise' })
    return
  }
})

router.put(
  '/:id',
  requireAuth,
  async (req: Request<{ id: string }, {}, ExerciseUpdateInput>, res: Response) => {
    const userId = req.user?.userId
    const exerciseId = parseInt(req.params.id)

    if (isNaN(exerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' })
      return
    }

    const parsed = ExerciseUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: z.treeifyError(parsed.error) })
      return
    }

    const { name, type, sets } = parsed.data

    try {
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

      await db.query('UPDATE exercises SET name = $1, type = $2 WHERE id = $3', [
        name,
        type,
        exerciseId,
      ])

      await db.query('DELETE FROM sets WHERE exercise_id = $1', [exerciseId])

      const values: [
        number,
        SetBase['reps'],
        SetBase['weight'],
        SetBase['duration'],
        SetBase['distance'],
        SetBase['distance_unit'],
      ][] = sets.map(set => [
        exerciseId,
        set.reps ?? null,
        set.weight ?? null,
        set.duration ?? null,
        set.distance ?? null,
        set.distance_unit ?? null,
      ])

      await db.query(
        format(
          `INSERT INTO sets (exercise_id, reps, weight, duration, distance, distance_unit)
         VALUES %L`,
          values
        )
      )

      res.status(200).json({ id: exerciseId, name, type, sets })
      return
    } catch (err) {
      console.error('Error updating exercise:', err)
      res.status(500).json({ error: 'Failed to update exercise' })
      return
    }
  }
)

export default router
