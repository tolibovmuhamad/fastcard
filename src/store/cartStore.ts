import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { addToCartApi, clearCartApi, removeFromCartApi } from '@/api/cart'
import { getAccessToken } from '@/api/tokenStorage'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  syncOnLogin: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, quantity = 1, color, size) {
        set((state) => {
          const idx = state.items.findIndex((i) => i.product.id === product.id)
          if (idx >= 0) {
            return {
              items: state.items.map((item, i) =>
                i === idx ? { ...item, quantity: item.quantity + quantity } : item
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { product, quantity, selectedColor: color, selectedSize: size },
            ],
          }
        })
        if (getAccessToken()) {
          addToCartApi(product.id, quantity).catch(() => {})
        }
      },

      removeItem(productId) {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }))
        if (getAccessToken()) {
          removeFromCartApi(productId).catch(() => {})
        }
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
        if (getAccessToken()) {
          clearCartApi().catch(() => {})
        }
      },

      async syncOnLogin() {
        const localItems = get().items
        if (localItems.length === 0) return
        await Promise.allSettled(
          localItems.map((item) => addToCartApi(item.product.id, item.quantity))
        )
      },
    }),
    { name: 'fastcart-cart' }
  )
)

export const selectTotalItems = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((sum, i) => {
    const price =
      i.product.hasDiscount && i.product.discountPrice != null
        ? i.product.discountPrice
        : i.product.price
    return sum + price * i.quantity
  }, 0)

export const SHIPPING_THRESHOLD = 100
export const SHIPPING_COST = 10
