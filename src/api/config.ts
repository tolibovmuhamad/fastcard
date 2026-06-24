/**
 * Конфигурация API-слоя.
 *
 * Базовый адрес берётся из переменной окружения `VITE_API_BASE_URL`
 * (см. `.env` / `.env.example`); по умолчанию — подтверждённый в Этапе 0
 * адрес бэкенда softclub. Меняется через `.env`, не редактируй URL в коде.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://store-api.softclub.tj'

/** Таймаут запросов по умолчанию (мс). */
export const API_TIMEOUT = 15000
