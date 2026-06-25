import { apiClient, toArray } from './client'
import type { Color } from '@/types/product'

export async function getColors(): Promise<Color[]> {
  const res = await apiClient.get('/Color/get-colors')
  return toArray<Color>(res.data)
}

export async function addColor(colorName: string): Promise<void> {
  await apiClient.post('/Color/add-color', { colorName })
}

export async function updateColor(id: number, colorName: string): Promise<void> {
  await apiClient.put('/Color/update-color', { id, colorName })
}

export async function deleteColor(id: number): Promise<void> {
  await apiClient.delete('/Color/delete-color', { params: { id } })
}
