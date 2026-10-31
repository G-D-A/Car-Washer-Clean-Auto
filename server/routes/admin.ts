import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { requireAdmin } from '../auth'
import { BookingModel } from '../models/Booking'

export const adminRouter = Router()

adminRouter.use(requireAdmin)

adminRouter.get('/bookings', async (_req, res) => {
  const bookings = await BookingModel.find()
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean()
  res.json(bookings)
})

adminRouter.delete('/bookings/:id', async (req, res) => {
  const { id } = req.params
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid booking id' })
    return
  }

  const deleted = await BookingModel.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404).json({ message: 'Booking not found' })
    return
  }
  res.status(204).end()
})
