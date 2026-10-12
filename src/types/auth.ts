import type { Schemas } from './schema'

export type RoleCode = 'owner' | 'therapist' | 'admin' | 'client'

export interface User {
  id: number
  username: string
  displayName: string
  /** 個案帳號可能沒有 Email */
  email?: string | null
  phone?: string | null
  organizationId: number
  organizationName: string
}

export type LoginRequest = Schemas['LoginDto']

export type RegisterRequest = Schemas['RegisterDto']

// POST /auth/login 與 /auth/register 皆回傳扁平結構（契約 4.1）
export type LoginResponse = Schemas['LoginResponseDto']

// GET /auth/me 回傳（契約 4.4），permissions 唯一來源
export type CurrentUser = Schemas['CurrentUserDto']

export type ChangePasswordRequest = Schemas['ChangePasswordDto']
