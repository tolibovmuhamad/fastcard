import { apiClient } from './client'
import type { Brand } from '@/types/product'

export async function getBrands(): Promise<Brand[]> {
  const res = await apiClient.get<Brand[]>('/Brand/get-brands')
  return res.data
}
