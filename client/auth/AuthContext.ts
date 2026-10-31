import { createContext, useContext } from 'react'
import type { AuthErrors, LoginInput, RegisterInput, User } from '../lib/auth'

export type AuthResult = { ok: true } | { ok: false; errors: AuthErrors; message?: string }

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<AuthResult>
  register: (input: RegisterInput) => Promise<AuthResult>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
