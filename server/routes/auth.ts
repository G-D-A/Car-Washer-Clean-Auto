import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { validateLogin, validateRegister, type User } from '../../client/lib/auth'
import { clearAuthCookie, findCurrentUser, getUserId, isAdminEmail, setAuthCookie } from '../auth'
import { UserModel } from '../models/User'

const asString = (value: unknown) => (typeof value === 'string' ? value : '')

const toPublicUser = (user: { _id: unknown; name: string; email: string }): User => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  isAdmin: isAdminEmail(user.email),
})

const isDuplicateKeyError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>
  const input = {
    name: asString(body.name).trim(),
    email: asString(body.email).trim().toLowerCase(),
    password: asString(body.password),
  }

  const errors = validateRegister(input)
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors })
    return
  }

  const emailTaken = { errors: { email: 'Цей email вже зареєстрований' } }
  if (await UserModel.exists({ email: input.email })) {
    res.status(409).json(emailTaken)
    return
  }

  try {
    const passwordHash = await bcrypt.hash(input.password, 10)
    const user = await UserModel.create({ name: input.name, email: input.email, passwordHash })
    setAuthCookie(res, String(user._id))
    res.status(201).json({ user: toPublicUser(user) })
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error
    res.status(409).json(emailTaken)
  }
})

authRouter.post('/login', async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>
  const input = {
    email: asString(body.email).trim().toLowerCase(),
    password: asString(body.password),
  }

  const errors = validateLogin(input)
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors })
    return
  }

  const user = await UserModel.findOne({ email: input.email })
  const isValid = user ? await bcrypt.compare(input.password, user.passwordHash) : false
  if (!user || !isValid) {
    res.status(401).json({ message: 'Невірний email або пароль' })
    return
  }

  setAuthCookie(res, String(user._id))
  res.json({ user: toPublicUser(user) })
})

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.status(204).end()
})

authRouter.get('/me', async (req, res) => {
  const user = await findCurrentUser(req)
  if (!user && getUserId(req)) clearAuthCookie(res)
  res.json({ user: user ? toPublicUser(user) : null })
})
