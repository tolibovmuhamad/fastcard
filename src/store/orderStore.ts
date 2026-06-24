import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { BillingInfo, CartItem, Order } from '@/types/cart'
import { SHIPPING_COST, SHIPPING_THRESHOLD } from './cartStore'

interface OrderState {
  orders: Order[]
  placeOrder: (items: CartItem[], billing: BillingInfo, paymentMethod: string) => Order
  getOrderById: (id: string) => Order | undefined
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder(items, billing, paymentMethod) {
        const subtotal = items.reduce((sum, i) => {
          const price =
            i.product.hasDiscount && i.product.discountPrice != null
              ? i.product.discountPrice
              : i.product.price
          return sum + price * i.quantity
        }, 0)
        const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
        const order: Order = {
          id: `ORD-${Date.now()}`,
          items,
          billing,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: 'pending',
          paymentMethod,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },

      getOrderById(id) {
        return get().orders.find((o) => o.id === id)
      },
    }),
    { name: 'fastcart-orders' }
  )
)
