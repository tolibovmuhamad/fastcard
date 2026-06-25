import { apiClient, toArray } from './client'
import type { Product, ProductsQueryParams } from '@/types/product'

export async function getProducts(params?: ProductsQueryParams): Promise<Product[]> {
  const res = await apiClient.get('/Product/get-products', { params })
  return toArray<Product>(res.data)
}

export async function getProductById(id: number | string): Promise<Product> {
  const res = await apiClient.get<Product>('/Product/get-product-by-id', {
    params: { id },
  })
  return res.data
}

export async function addProduct(formData: FormData): Promise<void> {
  await apiClient.post('/Product/add-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function updateProduct(formData: FormData): Promise<void> {
  await apiClient.put('/Product/update-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete('/Product/delete-product', { params: { id } })
}
