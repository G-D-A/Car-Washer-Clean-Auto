import express, { type ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { bookingsRouter } from './routes/bookings'

const port = Number(process.env.PORT ?? 3001)
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  throw new Error('MONGODB_URI is not set. Copy .env.example to .env')
}

const app = express()

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 })
})

app.use('/api/bookings', bookingsRouter)

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error?.status === 'number' ? error.status : 500
  if (status >= 500) console.error(error)
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : error.message })
}

app.use(errorHandler)

// Fail in 5 s instead of the default 30 s when the database container is not running.
await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
console.log('MongoDB connected')

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
