import { useEffect, useState } from 'react'
import { formatPrice, services } from '../../data/services'
import { formatDate, getToday } from '../../lib/booking'
import { Modal } from '../Modal'
import styles from './MyBookings.module.css'

type MyBooking = {
  _id: string
  serviceId: string
  date: string
  time: string
  comment: string
}

type LoadState = 'loading' | 'ready' | 'error'

type MyBookingsProps = {
  onClose: () => void
}

export function MyBookings({ onClose }: MyBookingsProps) {
  const [bookings, setBookings] = useState<MyBooking[]>([])
  const [state, setState] = useState<LoadState>('loading')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/bookings/my', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<MyBooking[]>
      })
      .then((data) => {
        setBookings(data)
        setState('ready')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState('error')
      })
    return () => controller.abort()
  }, [])

  const today = getToday()

  return (
    <Modal title="Мої записи" onClose={onClose}>
      {state === 'loading' && <p className={styles.muted}>Завантаження…</p>}

      {state === 'error' && (
        <p role="alert" className={styles.alert}>
          Не вдалося завантажити записи. Спробуйте пізніше.
        </p>
      )}

      {state === 'ready' && bookings.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.muted}>У вас ще немає записів.</p>
          <a href="#booking" onClick={onClose} className={styles.bookButton}>
            Записатися
          </a>
        </div>
      )}

      {state === 'ready' && bookings.length > 0 && (
        <ul className={styles.list}>
          {bookings.map((booking) => {
            const service = services.find((item) => item.id === booking.serviceId)
            const isUpcoming = booking.date >= today
            return (
              <li key={booking._id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.serviceTitle}>{service?.title ?? booking.serviceId}</h3>
                  <span className={`${styles.badge} ${isUpcoming ? styles.badgeUpcoming : ''}`}>
                    {isUpcoming ? 'Очікується' : 'Минулий'}
                  </span>
                </div>
                <p className={styles.meta}>
                  {formatDate(booking.date)} о {booking.time}
                  {service && ` · ${formatPrice(service.price)}`}
                </p>
                {booking.comment && <p className={styles.comment}>{booking.comment}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
