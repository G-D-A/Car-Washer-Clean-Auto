export type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type LoginInput = Omit<RegisterInput, 'name'>

export type AuthErrors = Partial<Record<keyof RegisterInput, string>>

// bcrypt ignores everything after the 72nd byte, so longer passwords are rejected.
const PASSWORD_MAX_LENGTH = 72
const PASSWORD_MIN_LENGTH = 8

const isEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validateLogin = (input: LoginInput): AuthErrors => {
  const errors: AuthErrors = {}
  if (!isEmail(input.email)) errors.email = 'Введіть коректний email'
  if (!input.password) errors.password = 'Введіть пароль'
  return errors
}

export const validateRegister = (input: RegisterInput): AuthErrors => {
  const errors: AuthErrors = {}
  const name = input.name.trim()

  if (name.length < 2 || name.length > 60) errors.name = "Вкажіть ім'я (від 2 до 60 символів)"
  if (!isEmail(input.email)) errors.email = 'Введіть коректний email'
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Пароль має містити щонайменше ${PASSWORD_MIN_LENGTH} символів`
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Пароль має бути не довшим за ${PASSWORD_MAX_LENGTH} символи`
  }

  return errors
}
