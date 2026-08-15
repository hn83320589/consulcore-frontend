export type RoleCode = 'owner' | 'therapist' | 'admin' | 'client'

export interface User {
  id: number
  username: string
  displayName: string
  email: string
  phone?: string | null
  organizationId: number
  organizationName: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  organizationName: string
  username: string
  email: string
  password: string
  displayName: string
  phone?: string | null
}

// POST /auth/login 與 /auth/register 皆回傳扁平結構（契約 4.1）
export interface LoginResponse {
  token: string
  userId: number
  username: string
  displayName: string
  email: string
  organizationId: number
  organizationName: string
  roles: string[] // 純角色碼字串陣列，如 ['owner', 'therapist']
  mustChangePassword: boolean
}

// GET /auth/me 回傳（契約 4.4），permissions 唯一來源
export interface CurrentUser {
  id: number
  username: string
  email: string
  displayName: string
  phone?: string | null
  organizationId: number
  organizationName: string
  roles: string[]
  activeRole?: string | null
  permissions: string[]
  // 若此帳號是個案，對應的 ClientProfile.id（個案端查自己資料用；userId ≠ clientProfileId）
  clientProfileId?: number | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
