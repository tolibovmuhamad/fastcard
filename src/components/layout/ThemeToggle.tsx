import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '@/store/themeStore'

export default function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'
  const label = isDark ? t('header.themeLight') : t('header.themeDark')

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
