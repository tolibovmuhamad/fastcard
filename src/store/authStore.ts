import axios from 'axios'
import { create } from 'zustand'

import { loginApi, registerApi } from '@/api/auth'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/api/tokenStorage'
import type { LoginDto, RegisterDto, UserInfo } from '@/types/auth'

interface AuthState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
}

// Claim-ключи роли — ASP.NET Core Identity использует длинный URI или короткий 'role'
const ROLE_CLAIMS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return {}
  }
}

function extractUserInfo(token: string): UserInfo {
  const p = decodeJwtPayload(token)

  const userName =
    (p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
    (p['unique_name'] as string) ||
    (p['name'] as string) ||
    (p['sub'] as string) ||
    ''

  const userId =
    (p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string) ||
    (p['nameid'] as string) ||
    (p['sub'] as string) ||
    undefined

  const email =
    (p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string) ||
    (p['email'] as string) ||
    undefined

  let roles: string[] = []
  for (const claim of ROLE_CLAIMS) {
    const val = p[claim]
    if (val !== undefined) {
      roles = Array.isArray(val) ? (val as string[]) : [val as string]
      break
    }
  }

  return { userName, userId, email, roles }
}

function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === 'string' && data.length < 300) return data
    if (data?.message) return String(data.message)
    if (data?.title) return String(data.title)
    if (data?.errors) {
      const messages = Object.values(data.errors as Record<string, string[]>).flat()
      return messages.join('. ')
    }
    if (err.response?.status === 401) return 'Неверный логин или пароль'
    if (err.response?.status === 400) return 'Проверьте введённые данные'
  }
  if (err instanceof Error) return err.message
  return 'Произошла ошибка. Попробуйте ещё раз.'
}

// Синхронная инициализация из localStorage при загрузке модуля
const _savedToken = getAccessToken()
const _savedUser = _savedToken ? extractUserInfo(_savedToken) : null

export const useAuthStore = create<AuthState>((set) => ({
  user: _savedUser,
  token: _savedToken,
  isAuthenticated: !!_savedToken,
  isAdmin: _savedUser?.roles.some((r) => r.toLowerCase() === 'admin') ?? false,
  isLoading: false,
  error: null,

  async login(dto) {
    set({ isLoading: true, error: null })
    try {
      const token = await loginApi(dto)
      setAccessToken(token)
      const user = extractUserInfo(token)
      set({
        token,
        user,
        isAuthenticated: true,
        isAdmin: user.roles.some((r) => r.toLowerCase() === 'admin'),
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, error: getApiError(err), isAuthenticated: false })
      throw err
    }
  },

  async register(dto) {
    set({ isLoading: true, error: null })
    try {
      await registerApi(dto)
      set({ isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: getApiError(err) })
      throw err
    }
  },

  logout() {
    clearAccessToken()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
    })
  },
}))
