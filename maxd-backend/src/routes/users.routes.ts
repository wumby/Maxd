// routes/users.routes.ts (or similar)
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
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return 
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/me', requireAuth, async (req, res) => {
  const userId = (req.user as any).userId
  const { name, email } = req.body

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required.' });
    return ;
  }

  try {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name, email, userId]
    )

    if (result.rowCount === 0) {
       res.status(404).json({ error: 'User not found.' })
      return 
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile.' })
  }
})

export default router
