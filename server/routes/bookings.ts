import { Router, type RequestHandler } from 'express'
import { validateBooking, type BookingInput } from '../../client/lib/booking'
import { BookingModel } from '../models/Booking'

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const toBookingInput = (body: unknown): BookingInput => {
  const data = (body ?? {}) as Record<string, unknown>
  return {
    name: asString(data.name),
    phone: asString(data.phone),
    serviceId: asString(data.serviceId),
    date: asString(data.date),
    time: asString(data.time),
    comment: asString(data.comment),
  }
}

const requireAdmin: RequestHandler = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN
  if (!token || req.header('x-admin-token') !== token) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  next()
}

export const bookingsRouter = Router()

bookingsRouter.post('/', async (req, res) => {
  const input = toBookingInput(req.body)
  const errors = validateBooking(input)

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors })
    return
  }

  const booking = await BookingModel.create(input)
  res.status(201).json(booking)
})

bookingsRouter.get('/', requireAdmin, async (_req, res) => {
  const bookings = await BookingModel.find().sort({ createdAt: -1 }).limit(100).lean()
  res.json(bookings)
})
