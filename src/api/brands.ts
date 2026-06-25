import { apiClient, toArray } from './client'
import type { Brand } from '@/types/product'

export async function getBrands(): Promise<Brand[]> {
  const res = await apiClient.get('/Brand/get-brands')
  return toArray<Brand>(res.data)
}

export async function addBrand(brandName: string): Promise<void> {
  await apiClient.post('/Brand/add-brand', { brandName })
}

export async function updateBrand(id: number, brandName: string): Promise<void> {
  await apiClient.put('/Brand/update-brand', { id, brandName })
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient.delete('/Brand/delete-brand', { params: { id } })
}
