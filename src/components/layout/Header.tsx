import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Heart, LogOut, Menu, Search, ShoppingCart, User, UserCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router'

import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import { selectTotalItems, useCartStore } from '@/store/cartStore'
import { selectFavoritesCount, useFavoritesStore } from '@/store/favoritesStore'

const NAV_ITEMS_GUEST = [
  { to: ROUTES.home, labelKey: 'nav.home', end: true },
  { to: ROUTES.contact, labelKey: 'nav.contact' },
  { to: ROUTES.about, labelKey: 'nav.about' },
  { to: ROUTES.register, labelKey: 'nav.signUp' },
]

const NAV_ITEMS_AUTH = [
  { to: ROUTES.home, labelKey: 'nav.home', end: true },
  { to: ROUTES.contact, labelKey: 'nav.contact' },
  { to: ROUTES.about, labelKey: 'nav.about' },
]

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { isAuthenticated, user, logout } = useAuthStore()
  const cartCount = useCartStore(selectTotalItems)
  const favCount = useFavoritesStore(selectFavoritesCount)

  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!accountOpen) return
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [accountOpen])

  // Блокируем скролл пока открыто мобильное меню
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileNavOpen])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(
      trimmed
        ? `${ROUTES.products}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.products
    )
    setMobileNavOpen(false)
  }

  function handleLogout() {
    setAccountOpen(false)
    setMobileNavOpen(false)
    logout()
    navigate(ROUTES.home)
  }

  const navItems = isAuthenticated ? NAV_ITEMS_AUTH : NAV_ITEMS_GUEST

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:gap-8">
          <Link
            to={ROUTES.home}
            className="text-xl font-bold tracking-tight"
            onClick={() => setMobileNavOpen(false)}
          >
            fastcart
          </Link>

          {/* Десктоп-навигация */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to + item.labelKey}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'text-foreground/80 hover:text-foreground transition-colors',
                    isActive && 'text-foreground underline underline-offset-8'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          {/* Поиск (десктоп) */}
          <form
            onSubmit={handleSearch}
            className="relative ml-auto hidden w-full max-w-xs sm:block"
            role="search"
          >
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('common.searchPlaceholder')}
              aria-label={t('common.search')}
              className="bg-muted/50 pr-9"
            />
            <button
              type="submit"
              aria-label={t('common.search')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            >
              <Search className="size-4" />
            </button>
          </form>

          {/* Иконки */}
          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            {/* Язык и тема (десктоп/планшет — в мобильном они в меню) */}
            <div className="hidden items-center gap-1 sm:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <IconLink to={ROUTES.wishlist} label={t('header.wishlist')} count={favCount}>
              <Heart className="size-5" />
            </IconLink>
            <IconLink to={ROUTES.cart} label={t('header.cart')} count={cartCount}>
              <ShoppingCart className="size-5" />
            </IconLink>

            {isAuthenticated ? (
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-label={t('header.account')}
                  className={cn(
                    'hover:bg-accent relative inline-flex size-9 items-center justify-center rounded-md transition-colors',
                    accountOpen && 'bg-accent'
                  )}
                >
                  <UserCircle className="size-5" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-11 z-50 w-44 rounded-md border bg-background shadow-lg py-1">
                    <p className="px-3 py-1 text-xs text-muted-foreground truncate">
                      {user?.userName}
                    </p>
                    <div className="my-1 border-t" />
                    <Link
                      to={ROUTES.account}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <User className="size-4" />
                      {t('header.account')}
                    </Link>
                    <Link
                      to={ROUTES.account + '?tab=orders'}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <ShoppingCart className="size-4" />
                      {t('header.myOrder')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <LogOut className="size-4" />
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <IconLink to={ROUTES.login} label={t('header.login')}>
                <User className="size-5" />
              </IconLink>
            )}

            {/* Гамбургер (только мобильный) */}
            <button
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label={mobileNavOpen ? t('header.closeMenu') : t('header.openMenu')}
              className="hover:bg-accent inline-flex size-9 items-center justify-center rounded-md transition-colors md:hidden"
            >
              {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-background md:hidden" style={{ top: '57px' }}>
          {/* Поиск */}
          <div className="border-b px-4 py-3">
            <form onSubmit={handleSearch} className="relative" role="search">
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                aria-label={t('common.search')}
                className="bg-muted/50 pr-9"
                autoFocus
              />
              <button
                type="submit"
                aria-label={t('common.search')}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              >
                <Search className="size-4" />
              </button>
            </form>
          </div>

          {/* Язык и тема */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Навигация */}
          <nav className="flex flex-col divide-y overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to + item.labelKey}
                to={item.to}
                end={item.end}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-4 text-base transition-colors hover:bg-muted',
                    isActive && 'text-brand font-medium'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.account}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-base hover:bg-muted transition-colors"
                >
                  <User className="size-5" />
                  {t('header.account')}
                </Link>
                <Link
                  to={ROUTES.account + '?tab=orders'}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-base hover:bg-muted transition-colors"
                >
                  <ShoppingCart className="size-5" />
                  {t('header.myOrders')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-4 text-base text-destructive hover:bg-muted transition-colors text-left"
                >
                  <LogOut className="size-5" />
                  {t('header.logout')}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
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
