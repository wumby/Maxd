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


export default router