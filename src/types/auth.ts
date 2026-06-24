export interface LoginDto {
  userName: string
  password: string
}

export interface RegisterDto {
  userName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword: string
}

export interface UserInfo {
  userName: string
  userId?: string
  email?: string
  roles: string[]
}

// Форма ответа POST /Account/login не задокументирована в Swagger (200: Success без схемы).
// Обрабатываем все типичные варианты ASP.NET Core JWT-ответов.
export type LoginResponse =
  | string
  | { token: string }
  | { accessToken: string }
  | { data: string | { token: string } | { accessToken: string } }
