import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'VkF3Np7xQ2sR9mYdL8wT4jB6hC0gZeUa'

export interface JWTPayload {
  sub: string // user id
  email: string
  name: string
  role: string
}

export function signJWT(payload: Omit<JWTPayload, 'role'>): string {
  return jwt.sign({ ...payload, role: 'app_user' }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function makePostgrestJWT(): string {
  return jwt.sign({ role: 'app_user' }, JWT_SECRET, { expiresIn: '1h' })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyJWT(authHeader.slice(7))
}
