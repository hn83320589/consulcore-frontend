// 使用者 User（契約 7.1，/api/users）
// ID 一律 number；多角色 roles: string[]

export interface UserResponse {
  id: number
  username: string
  email: string
  displayName: string
  phone?: string | null
  isActive: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string // 必填, ≤50
  email: string // 必填, email, ≤200
  password: string // 必填, 8–100
  displayName: string // 必填, ≤50
  phone?: string | null
  roles: string[] // 必填, 至少 1 個角色名
}

export interface UpdateUserRequest {
  // 皆選填
  email?: string | null
  displayName?: string | null
  phone?: string | null
  roles?: string[] | null
}

export interface ResetPasswordRequest {
  newPassword: string // 8–100
}
