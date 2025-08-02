import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { User, PublicUser } from '../types/user'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET!

router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body as Partial<User>
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Missing name, email, or password' })
    return
  }
  try {
    const hash = await bcrypt.hash(password, 10)

    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, goal_mode',
      [name, email, hash]
    )

    const user: PublicUser = result.rows[0]
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(400).json({ error: 'Email may already be in use.' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' })
    return
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
    const user: User | undefined = result.rows[0]
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    const safeUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      goal_mode: user.goal_mode,
    }
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

export default router
