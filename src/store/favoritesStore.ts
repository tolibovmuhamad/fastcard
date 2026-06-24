import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Product } from '@/types/product'

interface FavoritesState {
  items: Product[]
  toggleItem: (product: Product) => void
  removeItem: (productId: number) => void
  isInFavorites: (productId: number) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem(product) {
        const exists = get().items.some((i) => i.id === product.id)
        set((state) => ({
          items: exists
            ? state.items.filter((i) => i.id !== product.id)
            : [...state.items, product],
        }))
      },

      removeItem(productId) {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }))
      },

      isInFavorites(productId) {
        return get().items.some((i) => i.id === productId)
      },
    }),
    { name: 'fastcart-favorites' }
  )
)

export const selectFavoritesCount = (state: FavoritesState) => state.items.length
