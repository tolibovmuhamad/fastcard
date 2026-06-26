import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/routes/paths'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <section className="flex flex-col items-center gap-8 py-16 text-center">
      {/* Визуальный блок 404 */}
      <div className="relative select-none">
        <p
          className="text-[10rem] sm:text-[14rem] font-extrabold leading-none tracking-tighter"
          style={{ color: 'transparent', WebkitTextStroke: '3px hsl(var(--foreground) / 0.15)' }}
          aria-hidden="true"
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-6xl sm:text-8xl font-extrabold text-foreground">404</p>
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('notFound.title')}</h1>
        <p className="text-muted-foreground">
          {t('notFound.desc')}
        </p>
      </div>

      <Button asChild size="lg">
        <Link to={ROUTES.home}>{t('notFound.backHome')}</Link>
      </Button>
    </section>
  )
}
