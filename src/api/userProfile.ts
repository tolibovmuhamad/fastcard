import { apiClient } from './client'
import type { UpdateProfileDto, UserProfile } from '@/types/userProfile'

function parseProfile(raw: unknown): UserProfile {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    id: String(d.id ?? d.userId ?? ''),
    userName: (d.userName as string) ?? null,
    firstName: (d.firstName as string) ?? null,
    lastName: (d.lastName as string) ?? null,
    email: (d.email as string) ?? null,
    phoneNumber: (d.phoneNumber as string) ?? null,
    dob: (d.dob as string) ?? null,
    image: (d.image as string) ?? (d.imageUrl as string) ?? null,
    roles: Array.isArray(d.roles) ? (d.roles as string[]) : [],
  }
}

export async function getUserProfileApi(userId: string): Promise<UserProfile> {
  const res = await apiClient.get<unknown>('/UserProfile/get-user-profile-by-id', {
    params: { id: userId },
  })
  const raw = res.data
  if (raw && typeof raw === 'object') {
    const d = raw as Record<string, unknown>
    if (d.data) return parseProfile(d.data)
  }
  return parseProfile(raw)
}

export async function updateUserProfileApi(dto: UpdateProfileDto): Promise<void> {
  const form = new FormData()
  if (dto.firstName !== undefined) form.append('FirstName', dto.firstName)
  if (dto.lastName !== undefined) form.append('LastName', dto.lastName)
  if (dto.email !== undefined) form.append('Email', dto.email)
  if (dto.phoneNumber !== undefined) form.append('PhoneNumber', dto.phoneNumber)
  if (dto.dob !== undefined) form.append('Dob', dto.dob)
  if (dto.image) form.append('Image', dto.image)
  await apiClient.put('/UserProfile/update-user-profile', form)
}
