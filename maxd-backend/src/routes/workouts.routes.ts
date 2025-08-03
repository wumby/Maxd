import { Router, Request, Response } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'
import { WorkoutCreateInput, WorkoutCreateSchema } from '../validators/workouts'
import z from 'zod'
import { ExerciseInput, WorkoutResponse } from '../types'

const router = Router()

router.post('/', requireAuth, async (req: Request<{}, {}, WorkoutCreateInput>, res: Response) => {
  const parsed = WorkoutCreateSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid input',
      details: z.treeifyError(parsed.error),
    })
    return
  }

  const userId = req.user?.userId

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: missing user ID' })
    return
  }

  const { title, exercises, created_at } = parsed.data

  const workoutDate = created_at ? new Date(created_at) : new Date()
  const startOfDay = new Date(workoutDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(workoutDate)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const countRes = await db.query(
      `SELECT COUNT(*) FROM workouts
         WHERE user_id = $1 AND created_at BETWEEN $2 AND $3`,
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    )

    const workoutCount = parseInt(countRes.rows[0].count)

    if (workoutCount >= 3) {
      res.status(400).json({
        error: 'Limit of 3 workouts per day reached',
      })
      return
    }

    const workoutRes = await db.query(
      'INSERT INTO workouts (user_id, title, created_at) VALUES ($1, $2, $3) RETURNING id',
      [userId, title || null, workoutDate.toISOString()]
    )

    const workoutId = workoutRes.rows[0].id

    for (const exercise of exercises) {
      const { name, type = 'weights', sets } = exercise

      const exerciseRes = await db.query(
        'INSERT INTO exercises (workout_id, user_id, name, type) VALUES ($1, $2, $3, $4) RETURNING id',
        [workoutId, userId, name, type]
      )

      const exerciseId = exerciseRes.rows[0].id

      for (const set of sets) {
        const {
          reps = null,
          weight = null,
          duration = null,
          distance = null,
          distance_unit = null,
        } = set

        await db.query(
          `INSERT INTO sets (exercise_id, user_id, reps, weight, duration, distance, distance_unit)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [exerciseId, userId, reps, weight, duration, distance, distance_unit]
        )
      }
    }

    res.status(201).json({ message: 'Workout saved!' })
    return
  } catch {
    res.status(500).json({ error: 'Failed to save workout' })
    return
  }
})

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId

  try {
    const result = await db.query(
      `SELECT w.id, w.created_at, w.title,
                COALESCE(json_agg(json_build_object(
                  'id', e.id,
                  'name', e.name,
                  'type', e.type,
                  'sets', (
                    SELECT json_agg(json_build_object(
                      'reps', s.reps,
                      'weight', s.weight,
                      'duration', s.duration,
                      'distance', s.distance,
                      'distance_unit', s.distance_unit
                    ))
                    FROM sets s
                    WHERE s.exercise_id = e.id
                  )
                )) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercises
         FROM workouts w
         LEFT JOIN exercises e ON e.workout_id = w.id
         WHERE w.user_id = $1
         GROUP BY w.id
         ORDER BY w.created_at DESC`,
      [userId]
    )

    res.json(result.rows as WorkoutResponse[])
    return
  } catch (err) {
    console.error('Error fetching workouts:', err)

    res.status(500).json({ error: 'Failed to fetch workouts' })
    return
  }
})

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user?.userId
  const workoutId = parseInt(req.params.id)

  if (isNaN(workoutId)) {
    res.status(400).json({ error: 'Invalid workout ID' })
    return
  }

  try {
    // Check if the workout belongs to the user
    const workoutRes = await db.query('SELECT id FROM workouts WHERE id = $1 AND user_id = $2', [
      workoutId,
      userId,
    ])

    if (workoutRes.rowCount === 0) {
      res.status(404).json({ error: 'Workout not found' })
      return
    }

    // Delete associated sets → exercises → workout
    await db.query(
      `DELETE FROM sets WHERE exercise_id IN (
        SELECT id FROM exercises WHERE workout_id = $1
      )`,
      [workoutId]
    )

    await db.query('DELETE FROM exercises WHERE workout_id = $1', [workoutId])

    await db.query('DELETE FROM workouts WHERE id = $1 AND user_id = $2', [workoutId, userId])

    res.status(200).json({ message: 'Workout deleted' })
    return
  } catch (err) {
    console.error('Error deleting workout:', err)

    res.status(500).json({ error: 'Failed to delete workout' })
    return
  }
})

router.put(
  '/:id',
  requireAuth,
  async (req: Request, res: Response<WorkoutResponse | { error: string }>) => {
    const userId = req.user?.userId
    const workoutId = parseInt(req.params.id)
    const { title, exercises, created_at } = req.body as {
      title: string
      created_at: string
      exercises: ExerciseInput[]
    }

    if (isNaN(workoutId)) {
      res.status(400).json({ error: 'Invalid workout ID' })
      return
    }

    try {
      const workoutCheck = await db.query(
        'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
        [workoutId, userId]
      )

      if (workoutCheck.rowCount === 0) {
        res.status(404).json({ error: 'Workout not found' })
        return
      }

      await db.query(
        'UPDATE workouts SET title = $1, created_at = $2 WHERE id = $3 AND user_id = $4',
        [title || null, new Date(created_at).toISOString(), workoutId, userId]
      )

      await db.query(
        `DELETE FROM sets WHERE exercise_id IN (
        SELECT id FROM exercises WHERE workout_id = $1
      )`,
        [workoutId]
      )

      await db.query('DELETE FROM exercises WHERE workout_id = $1', [workoutId])

      for (const exercise of exercises) {
        const { name, type = 'weights', sets } = exercise

        const exerciseRes = await db.query(
          'INSERT INTO exercises (workout_id, user_id, name, type) VALUES ($1, $2, $3, $4) RETURNING id',
          [workoutId, userId, name, type]
        )

        const exerciseId = exerciseRes.rows[0].id

        for (const set of sets) {
          const reps = set.reps != null ? String(set.reps) : null
          const weight = set.weight != null ? String(set.weight) : null
          const duration = set.duration != null ? String(set.duration) : null
          const distance = set.distance != null ? String(set.distance) : null
          const distanceUnit = set.distance_unit ?? null

          await db.query(
            `INSERT INTO sets (exercise_id, user_id, reps, weight, duration, distance, distance_unit)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [exerciseId, userId, reps, weight, duration, distance, distanceUnit]
          )
        }
      }

      const updatedWorkout = await db.query<WorkoutResponse>(
        `
      SELECT 
        w.id,
        w.title,
        w.created_at,
        COALESCE(json_agg(
          json_build_object(
            'id', e.id,
            'name', e.name,
            'type', e.type,
            'sets', COALESCE(s.sets, '[]'::json)
          )
        ) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercises
      FROM workouts w
      LEFT JOIN exercises e ON w.id = e.workout_id
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'reps', s.reps,
          'weight', s.weight,
          'duration', s.duration,
          'distance', s.distance,
          'distance_unit', s.distance_unit
        )) AS sets
        FROM sets s
        WHERE s.exercise_id = e.id
      ) s ON true
      WHERE w.id = $1 AND w.user_id = $2
      GROUP BY w.id
      `,
        [workoutId, userId]
      )

      res.status(200).json(updatedWorkout.rows[0])
      return
    } catch (err) {
      console.error('Error updating workout:', err)

      res.status(500).json({ error: 'Failed to update workout' })
      return
    }
  }
)
router.get(
  '/:id',
  requireAuth,
  async (
    req: Request<{ id: string }, {}, {}, {}>,
    res: Response<WorkoutResponse | { error: string }>
  ) => {
    const userId = req.user?.userId
    const workoutId = parseInt(req.params.id)

    if (isNaN(workoutId)) {
      res.status(400).json({ error: 'Invalid workout ID' })
      return
    }

    try {
      const result = await db.query<WorkoutResponse>(
        `
        SELECT 
          w.id,
          w.title,
          w.created_at,
          COALESCE(json_agg(
            json_build_object(
              'id', e.id,
              'name', e.name,
              'type', e.type,
              'sets', COALESCE(s.sets, '[]'::json)
            )
          ) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercises
        FROM workouts w
        LEFT JOIN exercises e ON w.id = e.workout_id
        LEFT JOIN LATERAL (
          SELECT json_agg(json_build_object(
            'reps', s.reps,
            'weight', s.weight,
            'duration', s.duration,
            'distance', s.distance,
            'distance_unit', s.distance_unit
          )) AS sets
          FROM sets s
          WHERE s.exercise_id = e.id
        ) s ON true
        WHERE w.id = $1 AND w.user_id = $2
        GROUP BY w.id
        `,
        [workoutId, userId]
      )

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Workout not found' })
        return
      }

      res.json(result.rows[0])
      return
    } catch (err) {
      console.error('Error fetching workout:', err)
      res.status(500).json({ error: 'Failed to fetch workout' })
      return
    }
  }
)

export default router
