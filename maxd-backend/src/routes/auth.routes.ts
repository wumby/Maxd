import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { db } from '../db'
import { User } from '../types/user'
import { generateToken, toPublicUser } from '../utils/auth'

const router = express.Router()

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 6
}

router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body as Partial<User>

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' })
    return
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Invalid email format' })
    return
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hash]
    )

    const user = result.rows[0] as User
    const token = generateToken(user.id)
    res.status(201).json({ user: toPublicUser(user), token })
    return
  } catch (err: any) {
    console.error('Signup error:', err)
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email is already in use' })
    } else {
      res.status(500).json({ error: 'Something went wrong during signup' })
    }
    return
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
    const user = result.rows[0] as User
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = generateToken(user.id)
    res.json({ user: toPublicUser(user), token })
    return
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong' })
    return
  }
})

export default router
