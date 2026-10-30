import { services } from '../data/services'

export type BookingInput = {
  name: string
  phone: string
  serviceId: string
  date: string
  time: string
  comment: string
}

export type BookingErrors = Partial<Record<keyof BookingInput, string>>

export const timeSlots = Array.from({ length: 27 }, (_, index) => {
  const minutes = 8 * 60 + index * 30
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  return `${hours}:${minutes % 60 === 0 ? '00' : '30'}`
})

export const getToday = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const isUkrainianPhone = (digits: string) =>
  (digits.length === 12 && digits.startsWith('380')) ||
  (digits.length === 10 && digits.startsWith('0'))

export const validateBooking = (input: BookingInput): BookingErrors => {
  const errors: BookingErrors = {}
  const phoneDigits = input.phone.replace(/\D/g, '')

  if (input.name.trim().length < 2) errors.name = "Вкажіть ім'я"
  if (!isUkrainianPhone(phoneDigits)) {
    errors.phone = 'Введіть телефон, наприклад +38 067 123-45-67'
  }
  if (!services.some((service) => service.id === input.serviceId)) {
    errors.serviceId = 'Оберіть послугу'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.date = 'Оберіть дату'
  else if (input.date < getToday()) errors.date = 'Дата не може бути в минулому'
  if (!timeSlots.includes(input.time)) errors.time = 'Оберіть час'
  if (input.comment.length > 500) errors.comment = 'Коментар до 500 символів'

  return errors
}
