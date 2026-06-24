import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'
import {
  SHIPPING_COST,
  SHIPPING_THRESHOLD,
  selectTotalPrice,
  useCartStore,
} from '@/store/cartStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const subtotal = useCartStore(selectTotalPrice)
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: { pathname: ROUTES.checkout } } })
    } else {
      navigate(ROUTES.checkout)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Link
          to={ROUTES.products}
          className="inline-block rounded bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
        >
          Return To Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-sm text-muted-foreground mb-8">
        <Link to={ROUTES.home} className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Cart</span>
      </nav>

      {/* Cart table */}
      <div className="rounded-md border border-border overflow-hidden">
        {/* Header (desktop) */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 bg-muted/30 px-4 py-3 text-sm font-medium">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
          <span />
        </div>

        {/* Items */}
        <div className="divide-y divide-border">
          {items.map((item) => {
            const price =
              item.product.hasDiscount && item.product.discountPrice != null
                ? item.product.discountPrice
                : item.product.price
            const itemSubtotal = price * item.quantity
            const image = item.product.images?.[0] ?? null

            return (
              <div
                key={item.product.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-4"
              >
                {/* Product */}
                <div className="flex items-center gap-3">
                  <div className="size-16 shrink-0 rounded-md bg-[#f5f5f5] overflow-hidden">
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
                  <div className="min-w-0">
                    <Link
                      to={ROUTES.productDetails(item.product.id)}
                      className="text-sm font-medium line-clamp-2 hover:text-brand transition-colors"
                    >
                      {item.product.productName}
                    </Link>
                    {item.selectedColor && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Color: {item.selectedColor}
                      </p>
                    )}
                    {item.selectedSize && (
                      <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <span className="text-sm">
                  <span className="sm:hidden text-muted-foreground mr-1">Price:</span>
                  ${price.toFixed(2)}
                </span>

                {/* Quantity */}
                <div className="flex items-center gap-0 border border-border rounded overflow-hidden w-fit">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    aria-label="Уменьшить"
                    className="px-2 py-1 hover:bg-muted transition-colors"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-10 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    aria-label="Увеличить"
                    className="px-2 py-1 hover:bg-muted transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-sm font-semibold">
                  <span className="sm:hidden text-muted-foreground font-normal mr-1">Subtotal:</span>
                  ${itemSubtotal.toFixed(2)}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  aria-label="Удалить"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
        <Link
          to={ROUTES.products}
          className="rounded border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Return To Shop
        </Link>
        <button
          onClick={clearCart}
          className="rounded border border-destructive px-5 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          Remove all
        </button>
      </div>

      {/* Bottom: coupon + cart total */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Coupon */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Coupon Code"
            className="flex-1 rounded border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/50"
          />
          <button className="rounded bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors">
            Apply Coupon
          </button>
        </div>

        {/* Cart Total */}
        <div className="rounded-md border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Cart Total</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span>Shipping:</span>
              <span className={shipping === 0 ? 'text-green-600' : ''}>
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Free shipping on orders over ${SHIPPING_THRESHOLD}
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-base">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full rounded bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  )
}
