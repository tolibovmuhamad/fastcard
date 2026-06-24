import { apiClient } from './client'
import type { LoginDto, LoginResponse, RegisterDto } from '@/types/auth'

export async function loginApi(dto: LoginDto): Promise<string> {
  const { data } = await apiClient.post<LoginResponse>('/Account/login', dto)
  const token = extractToken(data)
  if (!token) throw new Error('Сервер не вернул токен авторизации')
  return token
}

export async function registerApi(dto: RegisterDto): Promise<void> {
  await apiClient.post('/Account/register', dto)
}

function extractToken(data: LoginResponse): string | null {
  if (typeof data === 'string') return data || null
  if ('token' in data && typeof data.token === 'string') return data.token
  if ('accessToken' in data && typeof data.accessToken === 'string') return data.accessToken
  if ('data' in data) {
    const inner = data.data
    if (typeof inner === 'string') return inner || null
    if (inner && typeof inner === 'object') {
      if ('token' in inner) return inner.token
      if ('accessToken' in inner) return inner.accessToken
    }
  }
  return null
}
