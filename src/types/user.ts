import type { Schemas } from './schema'

// 使用者 User（契約 7.1，/api/users）
// ID 一律 number；多角色 roles: string[]

export type UserResponse = Schemas['UserResponseDto']

export type CreateUserRequest = Schemas['CreateUserDto']

export type UpdateUserRequest = Schemas['UpdateUserDto']

export type ResetPasswordRequest = Schemas['ResetPasswordDto']

// GET /api/therapists：心理師下拉選單（只有 id 與姓名）
export type TherapistOption = Schemas['TherapistOptionDto']
