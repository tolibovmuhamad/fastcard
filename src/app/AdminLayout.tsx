import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'

import PageLoader from '@/components/PageLoader'
import { ROUTES } from '@/routes/paths'

// Каркас лейаута админки. Полноценная навигация и guard роли администратора —
// Этапы 6 и 2.7.
export default function AdminLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm">
          <span className="font-bold">fastcart · admin</span>
          <Link
            to={ROUTES.home}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← На витрину
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
