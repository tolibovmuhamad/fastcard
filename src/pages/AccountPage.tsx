import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Camera, Heart, Package, User as UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { getUserProfileApi, updateUserProfileApi } from '@/api/userProfile'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore } from '@/store/orderStore'
import type { Order } from '@/types/cart'
import type { UpdateProfileDto, UserProfile } from '@/types/userProfile'

type Tab = 'profile' | 'orders'

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AccountPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab | null) ?? 'profile'

  function switchTab(tab: Tab) {
    setSearchParams({ tab })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex gap-2 text-sm text-muted-foreground mb-8">
        <Link to={ROUTES.home} className="hover:text-foreground transition-colors">
          {t('nav.home')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('account.myAccount')}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar */}
        <aside>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3 mb-2">
            {t('account.manageAccount')}
          </p>
          <nav className="space-y-1">
            <SidebarBtn
              active={activeTab === 'profile'}
              onClick={() => switchTab('profile')}
              icon={<UserIcon className="size-4" />}
              label={t('account.myProfile')}
            />
            <SidebarBtn
              active={activeTab === 'orders'}
              onClick={() => switchTab('orders')}
              icon={<Package className="size-4" />}
              label={t('account.myOrders')}
            />
            <Link
              to={ROUTES.wishlist}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            >
              <Heart className="size-4" />
              {t('account.myWishlist')}
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main>
          {activeTab === 'profile' ? <ProfileTab /> : <OrdersTab />}
        </main>
      </div>
    </div>
  )
}

function SidebarBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-brand text-white' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dob, setDob] = useState('')

  useEffect(() => {
    if (!user?.userId) {
      setEmail(user?.email ?? '')
      return
    }
    setLoading(true)
    getUserProfileApi(user.userId)
      .then((p) => {
        setProfile(p)
        setFirstName(p.firstName ?? '')
        setLastName(p.lastName ?? '')
        setEmail(p.email ?? user.email ?? '')
        setPhoneNumber(p.phoneNumber ?? '')
        setDob(p.dob ? p.dob.split('T')[0] : '')
      })
      .catch(() => {
        setEmail(user.email ?? '')
      })
      .finally(() => setLoading(false))
  }, [user?.userId, user?.email])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleCancel() {
    setFirstName(profile?.firstName ?? '')
    setLastName(profile?.lastName ?? '')
    setEmail(profile?.email ?? user?.email ?? '')
    setPhoneNumber(profile?.phoneNumber ?? '')
    setDob(profile?.dob ? profile.dob.split('T')[0] : '')
    setImageFile(null)
    setImagePreview(null)
    setSaveError(null)
    setSaveSuccess(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const dto: UpdateProfileDto = {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        dob: dob || undefined,
        image: imageFile ?? undefined,
      }
      await updateUserProfileApi(dto)
      setSaveSuccess(true)
      setImageFile(null)
    } catch {
      setSaveError(t('account.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = imagePreview ?? profile?.image ?? null

  if (loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-medium mb-6 text-brand">{t('account.editProfile')}</h2>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 rounded-full overflow-hidden bg-muted">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserIcon className="size-8 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={t('account.changeAvatar')}
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-brand text-white shadow"
            >
              <Camera className="size-3.5" />
            </button>
          </div>
          <div>
            <p className="font-medium">{user?.userName}</p>
            <p className="text-sm text-muted-foreground">{email || user?.email}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('account.firstName')}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('account.firstNamePlaceholder')}
              className={inputCls}
            />
          </Field>
          <Field label={t('account.lastName')}>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('account.lastNamePlaceholder')}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('account.email')}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('account.emailPlaceholder')}
              className={inputCls}
            />
          </Field>
          <Field label={t('account.phone')}>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('account.phonePlaceholder')}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Date of Birth */}
        <Field label={t('account.dob')}>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className={inputCls}
          />
        </Field>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {saveSuccess && (
          <p className="text-sm text-green-600">{t('account.saveSuccess')}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60 transition-colors"
          >
            {saving ? t('account.saving') : t('account.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const { t } = useTranslation()
  const orders = useOrderStore((s) => s.orders)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h2 className="text-lg font-medium mb-2">{t('account.noOrdersTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t('account.noOrdersDesc')}
        </p>
        <Link
          to={ROUTES.products}
          className="inline-block rounded bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          {t('account.startShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-6 text-brand">{t('account.myOrders')}</h2>
      <div className="space-y-3">
        {orders.map((order) => {
          const isOpen = expandedId === order.id
          return (
            <div key={order.id} className="rounded-lg border border-border overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isOpen ? null : order.id)}
                className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                    {' · '}
                    {t('account.itemsCount', { count: order.items.length })}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                >
                  {t(`order.status.${order.status}`)}
                </span>
                <span className="shrink-0 text-sm font-semibold">${order.total.toFixed(2)}</span>
                <span className="text-muted-foreground text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const price =
                        item.product.hasDiscount && item.product.discountPrice != null
                          ? item.product.discountPrice
                          : item.product.price
                      const image = item.product.images?.[0] ?? null
                      return (
                        <div key={item.product.id} className="flex items-center gap-3 text-sm">
                          <div className="size-10 shrink-0 rounded bg-[#f5f5f5] overflow-hidden">
                            {image ? (
                              <img
                                src={image}
                                alt={item.product.productName}
                                className="h-full w-full object-contain p-0.5"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted" />
                            )}
                          </div>
                          <Link
                            to={ROUTES.productDetails(item.product.id)}
                            className="flex-1 line-clamp-1 hover:text-brand transition-colors"
                          >
                            {item.product.productName}
                          </Link>
                          <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                          <span className="shrink-0 font-medium">
                            ${(price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('account.shipTo')}</p>
                      <p>
                        {order.billing.firstName} {order.billing.lastName}
                      </p>
                      <p className="text-muted-foreground">
                        {order.billing.streetAddress}, {order.billing.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t('account.payment')}</p>
                      <p>{order.paymentMethod === 'bank' ? t('order.paymentBank') : t('order.paymentCash')}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">{t('common.total')}</p>
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      {order.shipping === 0 && (
                        <p className="text-xs text-green-600">{t('account.freeShipping')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/50 transition-colors'
