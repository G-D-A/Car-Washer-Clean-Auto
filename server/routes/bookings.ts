import { Router } from 'express'
import { validateBooking, type BookingInput } from '../../client/lib/booking'
import { getUserId, requireAuth } from '../auth'
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

export const bookingsRouter = Router()

bookingsRouter.post('/', async (req, res) => {
  const input = toBookingInput(req.body)
  const errors = validateBooking(input)

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors })
    return
  }

  const userId = getUserId(req)
  const booking = await BookingModel.create(userId ? { ...input, userId } : input)
  res.status(201).json(booking)
})

bookingsRouter.get('/my', requireAuth, async (_req, res) => {
  const bookings = await BookingModel.find({ userId: res.locals.userId })
    .select('serviceId date time comment createdAt')
    .sort({ date: -1, time: -1 })
    .limit(100)
    .lean()
  res.json(bookings)
})
