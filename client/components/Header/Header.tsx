import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/AuthContext'
import { contacts } from '../../data/contacts'
import styles from './Header.module.css'

type HeaderProps = {
  onLoginClick: () => void
  onMyBookingsClick: () => void
}

const navLinks = [
  { href: '#services', label: 'Послуги' },
  { href: '#booking', label: 'Запис' },
  { href: '#contacts', label: 'Контакти' },
]

export function Header({ onLoginClick, onMyBookingsClick }: HeaderProps) {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)
  const isSolid = isScrolled || isOpen

  const runAndClose = (action: () => void) => () => {
    closeMenu()
    action()
  }

  const accountActions = isLoading
    ? []
    : user
      ? [
          ...(user.isAdmin ? [{ label: 'Адмін-панель', onClick: runAndClose(() => navigate('/admin')) }] : []),
          { label: 'Мої записи', onClick: runAndClose(onMyBookingsClick) },
          { label: 'Вийти', onClick: runAndClose(() => void logout()) },
        ]
      : [{ label: 'Увійти', onClick: runAndClose(onLoginClick) }]

  return (
    <header className={`${styles.header} ${isSolid ? styles.solid : ''}`}>
      <div className={styles.inner}>
        <a href="#top" className={styles.logo} onClick={closeMenu}>
          <img src="/favicon.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>{contacts.brand}</span>
        </a>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
          {accountActions.map((action) => (
            <button key={action.label} type="button" onClick={action.onClick} className={styles.navLink}>
              {action.label}
            </button>
          ))}
          <a
            href={contacts.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.phoneButton}
          >
            {contacts.phone}
          </a>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={isOpen ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className={styles.menuIcon} fill="none" stroke="currentColor" strokeWidth={2}>
            {isOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav className={styles.mobileNav}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu} className={styles.mobileLink}>
              {link.label}
            </a>
          ))}
          {accountActions.map((action) => (
            <button key={action.label} type="button" onClick={action.onClick} className={styles.mobileLink}>
              {action.label}
            </button>
          ))}
          <a
            href={contacts.telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobilePhone}
          >
            {contacts.phone}
          </a>
        </nav>
      )}
    </header>
  )
}
