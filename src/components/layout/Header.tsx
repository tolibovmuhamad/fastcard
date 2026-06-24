import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Heart, LogOut, Search, ShoppingCart, User, UserCircle } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import { selectTotalItems, useCartStore } from '@/store/cartStore'
import { selectFavoritesCount, useFavoritesStore } from '@/store/favoritesStore'

const NAV_ITEMS_GUEST = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.contact, label: 'Contact' },
  { to: ROUTES.about, label: 'About' },
  { to: ROUTES.register, label: 'Sign Up' },
]

const NAV_ITEMS_AUTH = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.contact, label: 'Contact' },
  { to: ROUTES.about, label: 'About' },
]

export default function Header() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { isAuthenticated, user, logout } = useAuthStore()
  const cartCount = useCartStore(selectTotalItems)
  const favCount = useFavoritesStore(selectFavoritesCount)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(
      trimmed
        ? `${ROUTES.products}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.products
    )
  }

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate(ROUTES.home)
  }

  const navItems = isAuthenticated ? NAV_ITEMS_AUTH : NAV_ITEMS_GUEST

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:gap-8">
        <Link to={ROUTES.home} className="text-xl font-bold tracking-tight">
          fastcart
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to + item.label}
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
          <IconLink to={ROUTES.wishlist} label="Избранное" count={favCount}>
            <Heart className="size-5" />
          </IconLink>
          <IconLink to={ROUTES.cart} label="Корзина" count={cartCount}>
            <ShoppingCart className="size-5" />
          </IconLink>

          {isAuthenticated ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Аккаунт"
                className={cn(
                  'hover:bg-accent relative inline-flex size-9 items-center justify-center rounded-md transition-colors',
                  menuOpen && 'bg-accent'
                )}
              >
                <UserCircle className="size-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 w-44 rounded-md border bg-background shadow-lg py-1">
                  <p className="px-3 py-1 text-xs text-muted-foreground truncate">
                    {user?.userName}
                  </p>
                  <div className="my-1 border-t" />
                  <Link
                    to={ROUTES.account}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="size-4" />
                    Account
                  </Link>
                  <Link
                    to={ROUTES.account + '?tab=orders'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <ShoppingCart className="size-4" />
                    My Order
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <IconLink to={ROUTES.login} label="Войти">
              <User className="size-5" />
            </IconLink>
          )}
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
      {count !== undefined && count > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
