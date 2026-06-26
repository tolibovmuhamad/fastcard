import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES } from '@/i18n'
import { cn } from '@/lib/utils'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function choose(code: string) {
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('header.language')}
        title={t('header.language')}
        className={cn(
          'inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium hover:bg-accent transition-colors',
          open && 'bg-accent'
        )}
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{current.short}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-36 rounded-md border bg-background py-1 shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => choose(lang.code)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              {lang.label}
              {lang.code === current.code && <Check className="size-4 text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
