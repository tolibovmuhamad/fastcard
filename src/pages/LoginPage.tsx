import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: { pathname: string }; registered?: boolean } | null
  const from = state?.from?.pathname ?? ROUTES.home
  const justRegistered = state?.registered === true

  const { login, isLoading, error, isAuthenticated } = useAuthStore()
  const syncOnLogin = useCartStore((s) => s.syncOnLogin)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    useAuthStore.setState({ error: null })
  }, [])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login({ userName, password })
      syncOnLogin().catch(() => {})
      navigate(from, { replace: true })
    } catch {
      // error set in authStore
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[430px]">
        <h1 className="text-4xl font-medium">{t('login.title')}</h1>
        <p className="mt-3 text-muted-foreground">{t('login.subtitle')}</p>

        {justRegistered && (
          <div className="mt-6 rounded-md border border-border bg-muted px-4 py-3 text-sm">
            {t('login.registeredNote')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="userName" className="text-sm">
              {t('login.username')}
            </label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('login.usernamePlaceholder')}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm">
              {t('login.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <span
              className="cursor-not-allowed text-sm text-brand opacity-50"
              title={t('login.featureUnavailable')}
            >
              {t('login.forgetPassword')}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {isLoading ? t('login.signingIn') : t('login.logIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link
            to={ROUTES.register}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {t('login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
