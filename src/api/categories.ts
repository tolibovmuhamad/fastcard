import { apiClient, toArray } from './client'
import type { Category, SubCategory } from '@/types/product'

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get('/Category/get-categories')
  return toArray<Category>(res.data)
}

export async function addCategory(formData: FormData): Promise<void> {
  await apiClient.post('/Category/add-category', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function updateCategory(formData: FormData): Promise<void> {
  await apiClient.put('/Category/update-category', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete('/Category/delete-category', { params: { id } })
}

export async function getSubCategories(): Promise<SubCategory[]> {
  const res = await apiClient.get('/SubCategory/get-sub-category')
  return toArray<SubCategory>(res.data)
}

export async function addSubCategory(dto: { subCategoryName: string; categoryId: number }): Promise<void> {
  await apiClient.post('/SubCategory/add-sub-category', dto)
}

export async function updateSubCategory(dto: {
  id: number
  subCategoryName: string
  categoryId: number
}): Promise<void> {
  await apiClient.put('/SubCategory/update-sub-category', dto)
}

export async function deleteSubCategory(id: number): Promise<void> {
  await apiClient.delete('/SubCategory/delete-sub-category', { params: { id } })
}
