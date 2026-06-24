import { apiClient } from './client'
import type { Category } from '@/types/product'

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/Category/get-categories')
  return res.data
}
