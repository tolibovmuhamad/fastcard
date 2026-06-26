import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

// Системное предпочтение пользователя (используется при первом визите).
function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

// Применяет тему к <html> через класс `.dark` (см. @custom-variant в index.css).
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      setTheme(theme) {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme() {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'fastcart-theme',
      // На случай асинхронной гидратации — применяем сохранённую тему после неё.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)

// Применить тему как можно раньше (вызывается в main.tsx до первого рендера).
export function initTheme() {
  applyTheme(useThemeStore.getState().theme)
}
