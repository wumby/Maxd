// routes/users.routes.ts
import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.delete('/me', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  try {
    await db.query('DELETE FROM users WHERE id = $1', [userId])
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId;

  try {
    const result = await db.query(
      'SELECT id, name, email, goal_mode FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
router.patch('/me', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const { name, email, goal_mode } = req.body

  if (
    goal_mode &&
    !['lose', 'gain', 'track'].includes(goal_mode)
  ) {
    res.status(400).json({ error: 'Invalid goal_mode' })
    return 
  }

  const fields = [
    name && { column: 'name', value: name },
    email && { column: 'email', value: email },
    goal_mode && { column: 'goal_mode', value: goal_mode },
  ].filter(Boolean) as { column: string; value: any }[]

  if (fields.length === 0) {
     res.status(400).json({ error: 'No valid fields to update' })
     return 
  }

  const setClause = fields
    .map((field, index) => `${field.column} = $${index + 1}`)
    .join(', ')

  const values = fields.map(f => f.value)

  try {
    const result = await db.query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING id, name, email, goal_mode`,
      [...values, userId]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' })
      return 
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})


export default router
