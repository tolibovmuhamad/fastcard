/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый адрес API (см. `.env.example`). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
