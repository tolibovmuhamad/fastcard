import { apiClient } from './client'
import type { CartApiItem } from '@/types/cart'

function parseCartItems(raw: unknown): CartApiItem[] {
  if (Array.isArray(raw)) return raw as CartApiItem[]
  if (raw && typeof raw === 'object') {
    const d = (raw as Record<string, unknown>).data
    if (Array.isArray(d)) return d as CartApiItem[]
  }
  return []
}

export async function getCartApi(): Promise<CartApiItem[]> {
  const res = await apiClient.get<unknown>('/Cart/get-products-from-cart')
  return parseCartItems(res.data)
}

export async function addToCartApi(productId: number, count = 1): Promise<void> {
  await apiClient.post('/Cart/add-product-to-cart', { productId, count })
}

export async function increaseCartApi(productId: number): Promise<void> {
  await apiClient.put('/Cart/increase-product-in-cart', { productId })
}

export async function reduceCartApi(productId: number): Promise<void> {
  await apiClient.put('/Cart/reduce-product-in-cart', { productId })
}

export async function removeFromCartApi(productId: number): Promise<void> {
  await apiClient.delete('/Cart/delete-product-from-cart', { params: { productId } })
}

export async function clearCartApi(): Promise<void> {
  await apiClient.delete('/Cart/clear-cart')
}
