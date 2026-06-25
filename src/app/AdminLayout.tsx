import { Suspense, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { Menu, X } from 'lucide-react'

import PageLoader from '@/components/PageLoader'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Дашборд', to: ROUTES.admin },
  { label: 'Товары', to: ROUTES.adminProducts },
  { label: 'Категории', to: ROUTES.adminCategories },
  { label: 'Заказы', to: ROUTES.adminOrders },
]

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, logout } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  if (!isAdmin) return <Navigate to={ROUTES.home} replace />

  const navLinks = (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active =
          item.to === ROUTES.admin
            ? location.pathname === ROUTES.admin
            : location.pathname.startsWith(item.to)
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 text-sm">
          {/* Гамбургер (мобильный) */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Меню"
            className="hover:bg-accent inline-flex size-8 items-center justify-center rounded-md transition-colors md:hidden"
          >
            {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <span className="font-bold text-base">fastcart · admin</span>
          <div className="flex-1" />
          <Link
            to={ROUTES.home}
            className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            ← На витрину
          </Link>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4">
        {/* Сайдбар (десктоп) */}
        <nav className="hidden md:block w-48 shrink-0 border-r py-6 pr-4">
          {navLinks}
        </nav>

        {/* Сайдбар (мобильный — оверлей) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <nav className="absolute left-0 top-0 h-full w-56 bg-background shadow-xl py-6 px-4">
              <p className="text-sm font-bold mb-4 px-3">Навигация</p>
              {navLinks}
            </nav>
          </div>
        )}

        <main className="flex-1 py-6 md:pl-6 min-w-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
