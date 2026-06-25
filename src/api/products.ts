import { apiClient, toArray } from './client'
import type { Product, ProductsQueryParams } from '@/types/product'

const IMAGE_BASE = 'https://store-api.softclub.tj/images'

function buildImageUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  if (filename.startsWith('http')) return filename
  return `${IMAGE_BASE}/${filename}`
}

function normalizeListProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as number,
    productName: raw.productName as string,
    description: raw.description as string | undefined,
    code: raw.code as string | undefined,
    price: raw.price as number,
    discountPrice: (raw.discountPrice as number) ?? null,
    hasDiscount: raw.hasDiscount as boolean,
    quantity: raw.quantity as number,
    color: (raw.color as string) ?? null,
    categoryId: raw.categoryId as number | undefined,
    categoryName: raw.categoryName as string | undefined,
    productInMyCart: raw.productInMyCart as boolean | undefined,
    images: buildImageUrl(raw.image as string) ? [buildImageUrl(raw.image as string)!] : [],
  }
}

function normalizeDetailProduct(raw: Record<string, unknown>): Product {
  const rawImages = raw.images as Array<{ id: number; images: string }> | undefined
  const images = (rawImages ?? [])
    .map((img) => buildImageUrl(img.images))
    .filter(Boolean) as string[]

  return {
    id: raw.id as number,
    productName: raw.productName as string,
    description: raw.description as string | undefined,
    code: raw.code as string | undefined,
    price: raw.price as number,
    discountPrice: (raw.discountPrice as number) ?? null,
    hasDiscount: raw.hasDiscount as boolean,
    quantity: raw.quantity as number,
    weight: raw.weight as string | null | undefined,
    size: raw.size as string | null | undefined,
    brand: (raw.brand as string) ?? null,
    color: (raw.color as string) ?? null,
    subCategoryId: raw.subCategoryId as number | undefined,
    productInMyCart: raw.productInMyCart as boolean | undefined,
    images,
  }
}

export async function getProducts(params?: ProductsQueryParams): Promise<Product[]> {
  const res = await apiClient.get('/Product/get-products', { params })
  // API: { data: { products: [...], colors: [...], brands: [...] }, ... }
  const raw = res.data?.data?.products
  if (Array.isArray(raw)) return raw.map(normalizeListProduct)
  return toArray<Product>(res.data)
}

export async function getProductById(id: number | string): Promise<Product> {
  const res = await apiClient.get('/Product/get-product-by-id', { params: { id } })
  // API: { data: { id, productName, images: [...], ... }, ... }
  const raw = res.data?.data ?? res.data
  return normalizeDetailProduct(raw as Record<string, unknown>)
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
