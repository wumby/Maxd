import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const { title, exercises, created_at } = req.body

  const workoutDate = created_at ? new Date(created_at) : new Date()
  const startOfDay = new Date(workoutDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(workoutDate)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    // Count existing workouts for the day
    const countRes = await db.query(
      `SELECT COUNT(*) FROM workouts
       WHERE user_id = $1 AND created_at BETWEEN $2 AND $3`,
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    )

    const workoutCount = parseInt(countRes.rows[0].count)

    if (workoutCount >= 3) {
      res.status(400).json({ error: 'Limit of 3 workouts per day reached' })
      return 
    }

    // Insert workout
    const workoutRes = await db.query(
      'INSERT INTO workouts (user_id, title, created_at) VALUES ($1, $2, $3) RETURNING id',
      [userId, title || null, workoutDate.toISOString()]
    )

    const workoutId = workoutRes.rows[0].id

    for (const exercise of exercises) {
      const { name, type = 'weights', sets } = exercise

      const exerciseRes = await db.query(
        'INSERT INTO exercises (workout_id, name, type) VALUES ($1, $2, $3) RETURNING id',
        [workoutId, name, type]
      )

      const exerciseId = exerciseRes.rows[0].id

      for (const set of sets) {
        const reps = isFinite(parseInt(set.reps)) ? parseInt(set.reps) : null
        const weight = set.weight !== undefined ? parseFloat(set.weight) : null
        const duration = isFinite(parseInt(set.duration)) ? parseInt(set.duration) : null
        const distance = isFinite(parseFloat(set.distance)) ? parseFloat(set.distance) : null
        const distanceUnit = set.distance_unit || null

        await db.query(
          `INSERT INTO sets (exercise_id, user_id, reps, weight, duration, distance, distance_unit)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [exerciseId, userId, reps, weight, duration, distance, distanceUnit]
        )
      }
    }

    res.status(201).json({ message: 'Workout saved!' })
  } catch (err) {
    console.error('Error saving workout:', err)
    res.status(500).json({ error: 'Failed to save workout' })
  }
})




router.get('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId

  try {
    const result = await db.query(
      `SELECT w.id, w.created_at, w.title,
              json_agg(json_build_object(
                'name', e.name,
                'type', e.type,
                'sets', (
                  SELECT json_agg(json_build_object(
                    'reps', s.reps,
                    'weight', s.weight,
                    'duration', s.duration,
                    'distance', s.distance
                  ))
                  FROM sets s
                  WHERE s.exercise_id = e.id
                )
              )) AS exercises
       FROM workouts w
       LEFT JOIN exercises e ON e.workout_id = w.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.created_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (err) {
    console.error('Error fetching workouts:', err)
    res.status(500).json({ error: 'Failed to fetch workouts' })
  }
})



export default router
