export interface UserProfile {
  id: string
  userName: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phoneNumber: string | null
  dob: string | null
  image: string | null
  roles: string[]
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  dob?: string
  image?: File
}
