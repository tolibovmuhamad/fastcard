import { apiClient } from './client'
import type { Color } from '@/types/product'

export async function getColors(): Promise<Color[]> {
  const res = await apiClient.get<Color[]>('/Color/get-colors')
  return res.data
}
