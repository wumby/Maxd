import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Get weights for logged-in user
router.get('/', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId

  const result = await db.query(
    'SELECT * FROM weights WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )

  res.json(result.rows)
  return
})

router.post('/', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const { value, date } = req.body

  if (typeof value !== 'number') {
    res.status(400).json({ error: 'Invalid weight value' })
    return
  }

  const createdAt = date ? new Date(date) : new Date()
  if (isNaN(createdAt.getTime())) {
    res.status(400).json({ error: 'Invalid date format' })
    return
  }

  const year = createdAt.getFullYear()
  const month = String(createdAt.getMonth() + 1).padStart(2, '0')
  const day = String(createdAt.getDate()).padStart(2, '0')
  const dateOnly = `${year}-${month}-${day}`

  const existing = await db.query(
    `SELECT 1 FROM weights 
     WHERE user_id = $1 AND DATE(created_at) = $2`,
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
})



// Update a weight entry
router.put('/:id', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const { id } = req.params
  const { value } = req.body

  if (typeof value !== 'number') {
    res.status(400).json({ error: 'Invalid weight value' })
    return
  }

 const result = await db.query(
  'UPDATE weights SET value = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
  [value, id, userId]
)

if (result.rowCount === 0) {
  res.status(404).json({ error: 'Weight not found' })
  return
}

res.json(result.rows[0])

  return
})

// Delete a weight entry
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const { id } = req.params

  const result = await db.query(
    'DELETE FROM weights WHERE id = $1 AND user_id = $2',
    [id, userId]
  )

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Weight not found' })
    return
  }

  res.json({ message: 'Weight deleted' })
  return
})

export default router
