import { useState, type FormEvent, type ReactNode } from 'react'
import { Heart, Search, ShoppingCart, User } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'

// Пункты меню по ТЗ 6.0. «Sign Up» ведёт на регистрацию.
// Состояние авторизации (выпадающее меню аккаунта) подключится на Этапе 2.
const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.contact, label: 'Contact' },
  { to: ROUTES.about, label: 'About' },
  { to: ROUTES.register, label: 'Sign Up' },
]

export default function Header() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  // Поиск (ТЗ 3.4) пока ведёт в каталог с query-параметром —
  // фактическая фильтрация будет реализована на Этапе 3.
  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(
      trimmed
        ? `${ROUTES.products}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.products
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:gap-8">
        <Link to={ROUTES.home} className="text-xl font-bold tracking-tight">
          fastcart
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'text-foreground/80 hover:text-foreground transition-colors',
                  isActive && 'text-foreground underline underline-offset-8'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="relative ml-auto hidden w-full max-w-xs sm:block"
          role="search"
        >
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What are you looking for?"
            aria-label="Поиск товаров"
            className="bg-muted/50 pr-9"
          />
          <button
            type="submit"
            aria-label="Найти"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
          >
            <Search className="size-4" />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <IconLink to={ROUTES.wishlist} label="Избранное" count={0}>
            <Heart className="size-5" />
          </IconLink>
          <IconLink to={ROUTES.cart} label="Корзина" count={0}>
            <ShoppingCart className="size-5" />
          </IconLink>
          <IconLink to={ROUTES.account} label="Аккаунт">
            <User className="size-5" />
          </IconLink>
        </div>
      </div>
    </header>
  )
}

function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: string
  label: string
  count?: number
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="hover:bg-accent relative inline-flex size-9 items-center justify-center rounded-md transition-colors"
    >
      {children}
      {/* Счётчики наполнятся из cartStore/favoritesStore (Этапы 4–5). */}
      {count !== undefined && count > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
