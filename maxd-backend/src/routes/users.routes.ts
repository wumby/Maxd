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

export default router
