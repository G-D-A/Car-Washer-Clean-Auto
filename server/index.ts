import cookieParser from 'cookie-parser'
import express, { type ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { adminRouter } from './routes/admin'
import { authRouter } from './routes/auth'
import { bookingsRouter } from './routes/bookings'
import { ensureAdminUser } from './seedAdmin'

const port = Number(process.env.PORT ?? 3001)
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error('MONGODB_URI is not set. Copy .env.example to .env')
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Copy .env.example to .env')
}

const app = express()

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 })
})

app.use('/api/admin', adminRouter)
app.use('/api/auth', authRouter)
app.use('/api/bookings', bookingsRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error?.status === 'number' ? error.status : 500
  if (status >= 500) console.error(error)
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : error.message })
}

app.use(errorHandler)

// Fail in 5 s instead of the default 30 s when the database container is not running.
await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
console.log('MongoDB connected')
await ensureAdminUser()

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
