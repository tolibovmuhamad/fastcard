import { Suspense } from 'react'
import { Link, Navigate, Outlet } from 'react-router'

import PageLoader from '@/components/PageLoader'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'

export default function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore()

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  if (!isAdmin) return <Navigate to={ROUTES.home} replace />

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
