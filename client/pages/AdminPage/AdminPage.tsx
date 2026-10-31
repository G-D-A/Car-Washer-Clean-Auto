import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/AuthContext'
import { AuthModal } from '../../components/AuthModal'
import { contacts } from '../../data/contacts'
import { services } from '../../data/services'
import { formatDate } from '../../lib/booking'
import styles from './AdminPage.module.css'

type AdminBooking = {
  _id: string
  name: string
  phone: string
  serviceId: string
  date: string
  time: string
  comment: string
  createdAt: string
  userId?: { _id: string; email: string } | null
}

type LoadState = 'loading' | 'ready' | 'error'

const formatCreatedAt = (iso: string) => {
  const date = new Date(iso)
  return {
    date: date.toLocaleDateString('uk-UA'),
    time: date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
  }
}

const toPhoneHref = (phone: string) => `tel:+${phone.replace(/\D/g, '').replace(/^0/, '380')}`

const fetchAdminBookings = async (): Promise<AdminBooking[]> => {
  const response = await fetch('/api/admin/bookings')
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

export function AdminPage() {
  const { user, isLoading, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const isAdmin = Boolean(user?.isAdmin)

  const loadBookings = useCallback(
    () =>
      fetchAdminBookings().then(
        (data) => {
          setBookings(data)
          setState('ready')
        },
        () => setState('error'),
      ),
    [],
  )

  useEffect(() => {
    if (isAdmin) void loadBookings()
  }, [isAdmin, loadBookings])

  const handleRefresh = () => {
    setState('loading')
    void loadBookings()
  }

  const handleDelete = async (booking: AdminBooking) => {
    const confirmed = window.confirm(
      `Видалити заявку «${booking.name}» на ${formatDate(booking.date)} о ${booking.time}?`,
    )
    if (!confirmed) return

    setDeletingId(booking._id)
    setActionError('')
    try {
      const response = await fetch(`/api/admin/bookings/${booking._id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 404) throw new Error(`Delete failed: ${response.status}`)
      setBookings((prev) => prev.filter((item) => item._id !== booking._id))
    } catch {
      setActionError('Не вдалося видалити заявку. Спробуйте ще раз.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link to="/" className={styles.logo}>
            <img src="/favicon.svg" alt="" className={styles.logoIcon} />
            <span>{contacts.brand}</span>
            <span className={styles.logoBadge}>Адмін</span>
          </Link>
          <div className={styles.topBarActions}>
            {user && <span className={styles.userEmail}>{user.email}</span>}
            <Link to="/" className={styles.topBarLink}>
              На сайт
            </Link>
            {user && (
              <button type="button" onClick={() => void logout()} className={styles.topBarLink}>
                Вийти
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <p className={styles.muted}>Завантаження…</p>
        ) : !user ? (
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>Вхід для адміністратора</h1>
            <p className={styles.muted}>Увійдіть в акаунт адміністратора, щоб побачити заявки.</p>
            <button type="button" onClick={() => setIsAuthOpen(true)} className={styles.primaryButton}>
              Увійти
            </button>
          </div>
        ) : !isAdmin ? (
          <div className={styles.notice}>
            <h1 className={styles.noticeTitle}>Немає доступу</h1>
            <p className={styles.muted}>Ця сторінка доступна лише адміністраторам.</p>
            <Link to="/" className={styles.primaryButton}>
              На головну
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.toolbar}>
              <div>
                <h1 className={styles.title}>Заявки</h1>
                {state === 'ready' && <p className={styles.muted}>Всього: {bookings.length}</p>}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={state === 'loading'}
                className={styles.secondaryButton}
              >
                Оновити
              </button>
            </div>

            {actionError && (
              <p role="alert" className={styles.alert}>
                {actionError}
              </p>
            )}

            {state === 'loading' && <p className={styles.muted}>Завантаження…</p>}
            {state === 'error' && (
              <p role="alert" className={styles.alert}>
                Не вдалося завантажити заявки.
              </p>
            )}
            {state === 'ready' && bookings.length === 0 && (
              <p className={styles.muted}>Заявок поки немає.</p>
            )}

            {state === 'ready' && bookings.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Створено</th>
                      <th>Клієнт</th>
                      <th>Послуга</th>
                      <th>Візит</th>
                      <th>Коментар</th>
                      <th>Акаунт</th>
                      <th aria-label="Дії" />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const service = services.find((item) => item.id === booking.serviceId)
                      const createdAt = formatCreatedAt(booking.createdAt)
                      return (
                        <tr key={booking._id}>
                          <td className={styles.nowrap}>
                            <div>{createdAt.date}</div>
                            <div className={styles.secondary}>{createdAt.time}</div>
                          </td>
                          <td>
                            <div className={styles.clientName}>{booking.name}</div>
                            <a href={toPhoneHref(booking.phone)} className={styles.phone}>
                              {booking.phone}
                            </a>
                          </td>
                          <td>{service?.title ?? booking.serviceId}</td>
                          <td className={styles.nowrap}>
                            <div className={styles.visitDate}>{formatDate(booking.date)}</div>
                            <div className={styles.secondary}>{booking.time}</div>
                          </td>
                          <td className={styles.comment}>{booking.comment || '—'}</td>
                          <td className={styles.account}>
                            {booking.userId ? (
                              booking.userId.email
                            ) : (
                              <span className={styles.guestBadge}>Гість</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => void handleDelete(booking)}
                              disabled={deletingId === booking._id}
                              aria-label={`Видалити заявку ${booking.name}`}
                              title="Видалити заявку"
                              className={styles.deleteButton}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  )
}
