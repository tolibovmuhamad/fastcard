/**
 * Хранилище access-токена (JWT) в localStorage.
 *
 * Вынесено отдельным модулем, чтобы и axios-интерсепторы, и `authStore`
 * (Этап 2) работали с токеном через единую точку. Refresh-токена в API нет
 * (см. `docs/SOURCES_NOTES.md` §3), поэтому храним только access-токен.
 */
const ACCESS_TOKEN_KEY = 'fastcart.accessToken'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.)
    return null
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // тихо игнорируем — токен останется только в памяти стора
  }
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // ignore
  }
}
