import jwt from 'jsonwebtoken'
import { User, PublicUser } from '../types/user'

const JWT_SECRET = process.env.JWT_SECRET!

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '365d' })
}

export function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user
  return publicUser
}
