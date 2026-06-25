import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { API_BASE_URL, API_TIMEOUT } from './config'
import { clearAccessToken, getAccessToken } from './tokenStorage'

/**
 * Единый axios-инстанс приложения.
 *
 * Интерсепторы (Этап 1.5 — каркас):
 *  - request: подставляет `Authorization: Bearer <token>`, если токен есть;
 *  - response: при `401` чистит токен и уводит на страницу входа.
 *
 * Refresh-ветки нет — в API отсутствует refresh-токен
 * (см. `docs/SOURCES_NOTES.md` §3). Полноценный logout через `authStore`
 * будет подключён на Этапе 2.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
})

// --- request: добавляем Bearer-токен ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// --- response: обработка 401 ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(error)
  }
)

/**
 * Реакция на `401`: сбрасываем токен и уводим на вход.
 * На Этапе 2 здесь будет вызов `authStore.logout()`.
 */
function handleUnauthorized(): void {
  clearAccessToken()

  const loginPath = '/login'
  if (typeof window !== 'undefined' && window.location.pathname !== loginPath) {
    window.location.assign(loginPath)
  }
}

/**
 * Нормализует любой ответ ASP.NET Core к T[].
 * Поддерживаемые форматы:
 *   - обычный массив:                  [...]
 *   - $values (PreserveReferences):    { "$id":"1", "$values": [...] }
 *   - обёртка data:                    { data: [...] }
 *   - обёртка result:                  { result: [...] }
 *   - обёртка items:                   { items: [...] }
 *   - вложенный $values в data:        { data: { "$values": [...] } }
 */
export function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const key of ['$values', 'data', 'result', 'items', 'value']) {
      const val = obj[key]
      if (Array.isArray(val)) return val as T[]
      // вложенный $values
      if (val && typeof val === 'object' && Array.isArray((val as Record<string, unknown>)['$values'])) {
        return (val as Record<string, unknown>)['$values'] as T[]
      }
    }
  }
  return []
}
