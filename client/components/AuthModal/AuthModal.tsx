import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { validateLogin, validateRegister, type AuthErrors, type RegisterInput } from '../../lib/auth'
import { Modal } from '../Modal'
import styles from './AuthModal.module.css'

type AuthMode = 'login' | 'register'

type AuthModalProps = {
  onClose: () => void
}

const initialValues: RegisterInput = { name: '', email: '', password: '' }

const inputClass = (hasError: boolean) => `${styles.input} ${hasError ? styles.inputError : ''}`

export function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [values, setValues] = useState<RegisterInput>(initialValues)
  const [errors, setErrors] = useState<AuthErrors>({})
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const isRegister = mode === 'register'

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setErrors({})
    setMessage('')
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = { ...values, email: values.email.trim() }
    const clientErrors = isRegister ? validateRegister(input) : validateLogin(input)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setIsSending(true)
    const result = isRegister ? await register(input) : await login(input)
    setIsSending(false)

    if (result.ok) {
      onClose()
      return
    }
    setErrors(result.errors)
    setMessage(result.message ?? '')
  }

  return (
    <Modal title={isRegister ? 'Реєстрація' : 'Вхід'} onClose={onClose}>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!isRegister}
          className={`${styles.tab} ${!isRegister ? styles.tabActive : ''}`}
          onClick={() => switchMode('login')}
        >
          Вхід
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isRegister}
          className={`${styles.tab} ${isRegister ? styles.tabActive : ''}`}
          onClick={() => switchMode('register')}
        >
          Реєстрація
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        {isRegister && (
          <div>
            <label htmlFor="auth-name" className={styles.label}>
              Ім'я
            </label>
            <input
              id="auth-name"
              name="name"
              autoComplete="name"
              placeholder="Іван"
              value={values.name}
              onChange={handleChange}
              className={inputClass(Boolean(errors.name))}
            />
            {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className={styles.label}>
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ivan@example.com"
            value={values.email}
            onChange={handleChange}
            className={inputClass(Boolean(errors.email))}
          />
          {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="auth-password" className={styles.label}>
            Пароль
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder={isRegister ? 'Щонайменше 8 символів' : ''}
            value={values.password}
            onChange={handleChange}
            className={inputClass(Boolean(errors.password))}
          />
          {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
        </div>

        {message && (
          <p role="alert" className={styles.alert}>
            {message}
          </p>
        )}

        <button type="submit" disabled={isSending} className={styles.submit}>
          {isSending ? 'Зачекайте…' : isRegister ? 'Створити акаунт' : 'Увійти'}
        </button>

        <p className={styles.switchText}>
          {isRegister ? 'Вже маєте акаунт?' : 'Ще немає акаунту?'}{' '}
          <button
            type="button"
            className={styles.switchButton}
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
          >
            {isRegister ? 'Увійти' : 'Зареєструватися'}
          </button>
        </p>
      </form>
    </Modal>
  )
}
