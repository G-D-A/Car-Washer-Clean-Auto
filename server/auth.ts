import type { CookieOptions, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import { isValidObjectId } from 'mongoose'
import { UserModel } from './models/User'

const COOKIE_NAME = 'token'
const SESSION_DAYS = 7

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set. Copy .env.example to .env')
  return secret
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export const setAuthCookie = (res: Response, userId: string) => {
  const token = jwt.sign({}, getSecret(), {
    subject: userId,
    expiresIn: `${SESSION_DAYS}d`,
    algorithm: 'HS256',
  })
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 })
}

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(COOKIE_NAME, cookieOptions)
}

export const getUserId = (req: Request): string | null => {
  const token: unknown = req.cookies?.[COOKIE_NAME]
  if (typeof token !== 'string') return null

  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
    return typeof payload === 'object' && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}

export const getAdminEmail = () => (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()

export const isAdminEmail = (email: string) => {
  const adminEmail = getAdminEmail()
  return adminEmail !== '' && email.toLowerCase() === adminEmail
}

export const findCurrentUser = async (req: Request) => {
  const userId = getUserId(req)
  if (!userId || !isValidObjectId(userId)) return null
  return UserModel.findById(userId).lean()
}

// The role is checked against the database on every request, so changing ADMIN_EMAIL
// revokes access after a restart even for already issued tokens.
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const user = await findCurrentUser(req)
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  if (!isAdminEmail(user.email)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  next()
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const userId = getUserId(req)
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  res.locals.userId = userId
  next()
}
