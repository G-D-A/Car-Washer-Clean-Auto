import { Schema, model } from 'mongoose'

const bookingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    comment: { type: String, default: '', trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true },
)

export const BookingModel = model('Booking', bookingSchema)
