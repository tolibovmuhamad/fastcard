import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'

const GOOGLE_ICON = (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, isLoading, error, isAuthenticated } = useAuthStore()
  const [form, setForm] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldError, setFieldError] = useState<string | null>(null)

  useEffect(() => {
    useAuthStore.setState({ error: null })
  }, [])

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setFieldError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setFieldError(t('register.passwordsMismatch'))
      return
    }
    try {
      await register({
        userName: form.userName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      navigate(ROUTES.login, { state: { registered: true } })
    } catch {
      // error set in authStore
    }
  }

  const displayError = fieldError ?? error

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-[430px]">
        <h1 className="text-4xl font-medium">{t('register.title')}</h1>
        <p className="mt-3 text-muted-foreground">{t('register.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <Input
            value={form.userName}
            onChange={handleChange('userName')}
            placeholder={t('register.namePlaceholder')}
            required
            autoComplete="username"
          />
          <Input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder={t('register.emailPlaceholder')}
            required
            autoComplete="email"
          />
          <Input
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            placeholder={t('register.phonePlaceholder')}
            required
            autoComplete="tel"
          />
          <Input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder={t('register.passwordPlaceholder')}
            required
            autoComplete="new-password"
          />
          <Input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            required
            autoComplete="new-password"
          />

          {displayError && <p className="text-sm text-destructive">{displayError}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {isLoading ? t('register.creating') : t('register.createAccount')}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full"
            title={t('register.oauthUnavailable')}
          >
            {GOOGLE_ICON}
            {t('register.signUpGoogle')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('register.haveAccount')}{' '}
          <Link
            to={ROUTES.login}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {t('register.logIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
