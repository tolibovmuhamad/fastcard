import { apiClient } from './client'
import type { Product, ProductsQueryParams } from '@/types/product'

export async function getProducts(params?: ProductsQueryParams): Promise<Product[]> {
  const res = await apiClient.get<Product[]>('/Product/get-products', { params })
  return res.data
}

export async function getProductById(id: number | string): Promise<Product> {
  const res = await apiClient.get<Product>('/Product/get-product-by-id', {
    params: { id },
  })
  return res.data
}
