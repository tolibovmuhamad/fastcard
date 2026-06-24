/**
 * Barrel-экспорт API-слоя.
 * Запросы к конкретным эндпоинтам (Account, Product, Cart, …) добавляются
 * сюда по мере реализации соответствующих этапов.
 */
export { apiClient } from './client'
export { API_BASE_URL, API_TIMEOUT } from './config'
export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './tokenStorage'
