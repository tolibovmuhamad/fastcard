import { CheckCircle2, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { ROUTES } from '@/routes/paths'
import { useOrderStore } from '@/store/orderStore'
import type { Order } from '@/types/cart'

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrderSuccessPage() {
  const { t } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const getOrderById = useOrderStore((s) => s.getOrderById)
  const order = orderId ? getOrderById(orderId) : undefined

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold mb-2">{t('orderSuccess.notFoundTitle')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('orderSuccess.notFoundDesc')}
        </p>
        <Link
          to={ROUTES.products}
          className="inline-block rounded bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          {t('orderSuccess.continueShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-green-500" />
        <h1 className="text-2xl font-semibold">{t('orderSuccess.successTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('orderSuccess.successDesc')}
        </p>
        <p className="mt-1 text-sm">
          {t('orderSuccess.orderId')} <span className="font-medium text-foreground">{order.id}</span>
        </p>
      </div>

      <div className="rounded-lg border border-border p-6 space-y-5">
        {/* Items */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t('orderSuccess.itemsOrdered')}
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => {
              const price =
                item.product.hasDiscount && item.product.discountPrice != null
                  ? item.product.discountPrice
                  : item.product.price
              const image = item.product.images?.[0] ?? null
              return (
                <div key={item.product.id} className="flex items-center gap-3 text-sm">
                  <div className="size-12 shrink-0 rounded bg-[#f5f5f5] overflow-hidden">
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
                  <span className="flex-1 line-clamp-1 font-medium">
                    {item.product.productName}
                  </span>
                  <span className="shrink-0 text-muted-foreground">×{item.quantity}</span>
                  <span className="shrink-0 font-medium">
                    ${(price * item.quantity).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Pricing */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('common.subtotal')}</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('common.shipping')}</span>
            <span className={order.shipping === 0 ? 'text-green-600' : ''}>
              {order.shipping === 0 ? t('common.free') : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
            <span>{t('common.total')}</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('orderSuccess.payment')}</p>
            <p>{order.paymentMethod === 'bank' ? t('order.paymentBank') : t('order.paymentCash')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('orderSuccess.status')}</p>
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
            >
              {t(`order.status.${order.status}`)}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('orderSuccess.date')}</p>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('orderSuccess.shipTo')}</p>
            <p className="line-clamp-1">
              {order.billing.firstName} {order.billing.lastName}, {order.billing.city}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          to={ROUTES.products}
          className="flex-1 rounded border border-border px-5 py-2.5 text-center text-sm font-medium hover:bg-muted transition-colors"
        >
          {t('orderSuccess.continueShopping')}
        </Link>
        <Link
          to={`${ROUTES.account}?tab=orders`}
          className="flex-1 rounded bg-brand px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          {t('orderSuccess.viewMyOrders')}
        </Link>
      </div>
    </div>
  )
}
