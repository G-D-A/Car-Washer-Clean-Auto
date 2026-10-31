import { useEffect, useState, type ReactNode } from 'react'
import type { AuthErrors, LoginInput, RegisterInput, User } from '../lib/auth'
import { AuthContext, type AuthResult } from './AuthContext'

type AuthResponse = { user?: User; errors?: AuthErrors; message?: string }

const postAuth = async (path: string, body: LoginInput | RegisterInput) => {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data: AuthResponse = await response.json()
  return { ok: response.ok, data }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json() as Promise<AuthResponse>)
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const authenticate = async (path: string, input: LoginInput | RegisterInput): Promise<AuthResult> => {
    try {
      const { ok, data } = await postAuth(path, input)
      if (ok && data.user) {
        setUser(data.user)
        return { ok: true }
      }
      return { ok: false, errors: data.errors ?? {}, message: data.message }
    } catch {
      return { ok: false, errors: {}, message: 'Не вдалося зʼєднатися з сервером. Спробуйте ще раз.' }
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: (input) => authenticate('login', input),
        register: (input) => authenticate('register', input),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
