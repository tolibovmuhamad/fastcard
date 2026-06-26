import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { ROUTES } from '@/routes/paths'
import { selectTotalPrice, SHIPPING_COST, SHIPPING_THRESHOLD, useCartStore } from '@/store/cartStore'
import { useOrderStore } from '@/store/orderStore'
import type { BillingInfo } from '@/types/cart'

const BILLING_STORAGE_KEY = 'fastcart-billing'
const PAYMENT_METHODS = [
  { id: 'bank', labelKey: 'checkout.paymentBankLabel' },
  { id: 'cash', labelKey: 'checkout.paymentCashLabel' },
]

function loadSavedBilling(): Partial<BillingInfo> {
  try {
    const raw = localStorage.getItem(BILLING_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<BillingInfo>) : {}
  } catch {
    return {}
  }
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()
  const subtotal = useCartStore(selectTotalPrice)
  const placeOrder = useOrderStore((s) => s.placeOrder)

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping

  const saved = loadSavedBilling()
  const [firstName, setFirstName] = useState(saved.firstName ?? '')
  const [lastName, setLastName] = useState(saved.lastName ?? '')
  const [streetAddress, setStreetAddress] = useState(saved.streetAddress ?? '')
  const [apartment, setApartment] = useState(saved.apartment ?? '')
  const [city, setCity] = useState(saved.city ?? '')
  const [phone, setPhone] = useState(saved.phone ?? '')
  const [email, setEmail] = useState(saved.email ?? '')
  const [saveInfo, setSaveInfo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [placing, setPlacing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (items.length === 0) navigate(ROUTES.cart, { replace: true })
  }, [items.length, navigate])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const required = t('checkout.required')
    if (!firstName.trim()) errs.firstName = required
    if (!lastName.trim()) errs.lastName = required
    if (!streetAddress.trim()) errs.streetAddress = required
    if (!city.trim()) errs.city = required
    if (!phone.trim()) errs.phone = required
    if (!email.trim()) errs.email = required
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setPlacing(true)

    const billing: BillingInfo = {
      firstName,
      lastName,
      streetAddress,
      apartment: apartment || undefined,
      city,
      phone,
      email,
    }

    if (saveInfo) {
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(billing))
    }

    const order = placeOrder(items, billing, paymentMethod)
    clearCart()
    navigate(ROUTES.orderSuccess(order.id), { replace: true })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-sm text-muted-foreground mb-8">
        <Link to={ROUTES.products} className="hover:text-foreground transition-colors">{t('products.breadcrumb')}</Link>
        <span>/</span>
        <Link to={ROUTES.cart} className="hover:text-foreground transition-colors">{t('checkout.viewCart')}</Link>
        <span>/</span>
        <span className="text-foreground">{t('checkout.checkout')}</span>
      </nav>

      <form onSubmit={handlePlaceOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Left: Billing Details */}
          <section>
            <h2 className="text-2xl font-medium mb-6">{t('checkout.billingDetails')}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t('checkout.firstName')} error={fieldErrors.firstName}>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputCls(!!fieldErrors.firstName)}
                  placeholder={t('checkout.firstNamePlaceholder')}
                />
              </Field>

              <Field label={t('checkout.lastName')} error={fieldErrors.lastName}>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputCls(!!fieldErrors.lastName)}
                  placeholder={t('checkout.lastNamePlaceholder')}
                />
              </Field>

              <Field label={t('checkout.streetAddress')} error={fieldErrors.streetAddress} className="sm:col-span-2">
                <input
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className={inputCls(!!fieldErrors.streetAddress)}
                  placeholder={t('checkout.streetPlaceholder')}
                />
              </Field>

              <Field label={t('checkout.apartment')} className="sm:col-span-2">
                <input
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className={inputCls(false)}
                  placeholder={t('checkout.apartmentPlaceholder')}
                />
              </Field>

              <Field label={t('checkout.townCity')} error={fieldErrors.city}>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls(!!fieldErrors.city)}
                  placeholder={t('checkout.cityPlaceholder')}
                />
              </Field>

              <Field label={t('checkout.phone')} error={fieldErrors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls(!!fieldErrors.phone)}
                  placeholder={t('checkout.phonePlaceholder')}
                />
              </Field>

              <Field label={t('checkout.email')} error={fieldErrors.email} className="sm:col-span-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls(!!fieldErrors.email)}
                  placeholder={t('checkout.emailPlaceholder')}
                />
              </Field>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="accent-brand"
              />
              {t('checkout.saveInfo')}
            </label>
          </section>

          {/* Right: Order Summary */}
          <aside>
            <h2 className="text-2xl font-medium mb-6">{t('checkout.orderSummary')}</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const price =
                  item.product.hasDiscount && item.product.discountPrice != null
                    ? item.product.discountPrice
                    : item.product.price
                const image = item.product.images?.[0] ?? null
                return (
                  <div key={item.product.id} className="flex items-center gap-3 text-sm">
                    <div className="size-14 shrink-0 rounded bg-[#f5f5f5] overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={item.product.productName}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>
                    <span className="flex-1 line-clamp-2">{item.product.productName}</span>
                    <span className="shrink-0 font-medium">
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t('common.subtotal')}:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span>{t('common.shipping')}:</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? t('common.free') : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold text-base">
                <span>{t('common.total')}:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">{t('checkout.paymentMethod')}</p>
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="accent-brand"
                  />
                  {t(pm.labelKey)}
                </label>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-5 flex gap-2">
              <input
                type="text"
                placeholder={t('common.couponCode')}
                className="flex-1 rounded border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/50"
              />
              <button
                type="button"
                className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                {t('common.apply')}
              </button>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="mt-5 w-full rounded bg-brand py-3 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60 transition-colors"
            >
              {placing ? t('checkout.placingOrder') : t('checkout.placeOrder')}
            </button>
          </aside>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded border px-3 py-2 text-sm outline-none transition-colors',
    'focus:ring-2 focus:ring-brand/50',
    hasError ? 'border-destructive' : 'border-border',
  ].join(' ')
}
