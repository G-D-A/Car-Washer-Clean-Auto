import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { contacts } from '../../data/contacts'
import { formatPrice, services } from '../../data/services'
import { useAuth } from '../../auth/AuthContext'
import {
  formatDate,
  getToday,
  timeSlots,
  validateBooking,
  type BookingErrors,
  type BookingInput,
} from '../../lib/booking'
import styles from './BookingForm.module.css'

type BookingFormProps = {
  serviceId: string
  onServiceChange: (serviceId: string) => void
}

type FormValues = Omit<BookingInput, 'serviceId'>
type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

const initialValues: FormValues = { name: '', phone: '', date: '', time: '', comment: '' }

const sendBooking = async (input: BookingInput) => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 400) {
    const data: { errors?: BookingErrors } = await response.json()
    return { errors: data.errors ?? {} }
  }
  if (!response.ok) throw new Error(`Booking request failed: ${response.status}`)
  return { errors: {} }
}

const inputClass = (hasError: boolean) => `${styles.input} ${hasError ? styles.inputError : ''}`

export function BookingForm({ serviceId, onServiceChange }: BookingFormProps) {
  const { user } = useAuth()
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const selectedService = services.find((service) => service.id === serviceId)

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleServiceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onServiceChange(event.target.value)
    setErrors((prev) => ({ ...prev, serviceId: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input: BookingInput = { ...values, serviceId }
    const clientErrors = validateBooking(input)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setStatus('sending')
    try {
      const { errors: serverErrors } = await sendBooking(input)
      setErrors(serverErrors)
      setStatus(Object.keys(serverErrors).length > 0 ? 'idle' : 'success')
    } catch {
      setStatus('error')
    }
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    onServiceChange('')
    setStatus('idle')
  }

  return (
    <section id="booking" className={styles.section}>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Запис</p>
          <h2 className={styles.title}>Запишіться онлайн за хвилину</h2>
          <p className={styles.text}>
            Залиште заявку, і адміністратор передзвонить протягом 15 хвилин, щоб підтвердити
            час. Зручніше в месенджері? Пишіть у Telegram:
          </p>
          <a
            href={contacts.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.phone}
          >
            {contacts.phone}
          </a>
        </div>

        <div className={styles.card}>
          {status === 'success' ? (
            <div className={styles.success} role="status">
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>Заявку прийнято!</h3>
              <p className={styles.successText}>
                {values.name.trim()}, чекаємо на вас {formatDate(values.date)} о{' '}
                {values.time} на послугу «{selectedService?.title}». Ми передзвонимо для
                підтвердження.
                {user && ' Запис збережено в розділі «Мої записи».'}
              </p>
              <button type="button" onClick={handleReset} className={styles.resetButton}>
                Новий запис
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className={styles.form}>
              <Field label="Ім'я" error={errors.name} htmlFor="name">
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Іван"
                  value={values.name}
                  onChange={handleChange}
                  className={inputClass(Boolean(errors.name))}
                />
              </Field>

              <Field label="Телефон" error={errors.phone} htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+38 (067) 123-45-67"
                  value={values.phone}
                  onChange={handleChange}
                  className={inputClass(Boolean(errors.phone))}
                />
              </Field>

              <Field label="Послуга" error={errors.serviceId} htmlFor="serviceId" wide>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={serviceId}
                  onChange={handleServiceChange}
                  className={inputClass(Boolean(errors.serviceId))}
                >
                  <option value="">Оберіть послугу</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title} — {formatPrice(service.price)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Дата" error={errors.date} htmlFor="date">
                <input
                  id="date"
                  name="date"
                  type="date"
                  min={getToday()}
                  value={values.date}
                  onChange={handleChange}
                  className={inputClass(Boolean(errors.date))}
                />
              </Field>

              <Field label="Час" error={errors.time} htmlFor="time">
                <select
                  id="time"
                  name="time"
                  value={values.time}
                  onChange={handleChange}
                  className={inputClass(Boolean(errors.time))}
                >
                  <option value="">Оберіть час</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Коментар" error={errors.comment} htmlFor="comment" wide>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  placeholder="Марка авто, побажання"
                  value={values.comment}
                  onChange={handleChange}
                  className={`${inputClass(Boolean(errors.comment))} ${styles.textarea}`}
                />
              </Field>

              {status === 'error' && (
                <p role="alert" className={styles.alert}>
                  Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.
                </p>
              )}

              <button type="submit" disabled={status === 'sending'} className={styles.submit}>
                {status === 'sending' ? 'Надсилаємо…' : 'Надіслати заявку'}
              </button>
              <p className={styles.note}>
                Натискаючи кнопку, ви погоджуєтеся на обробку персональних даних.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  htmlFor: string
  error?: string
  wide?: boolean
  children: ReactNode
}

function Field({ label, htmlFor, error, wide, children }: FieldProps) {
  return (
    <div className={wide ? styles.wide : undefined}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  )
}
