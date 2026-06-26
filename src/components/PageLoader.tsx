import { useTranslation } from 'react-i18next'

/**
 * Фолбэк для ленивой загрузки маршрутов (Suspense).
 * Полноценные состояния загрузки страниц — задача Этапа 7.2.
 */
export default function PageLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="border-muted-foreground/30 border-t-foreground size-8 animate-spin rounded-full border-4"
        role="status"
        aria-label={t('common.loading')}
      />
    </div>
  )
}
