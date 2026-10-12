import httpService from './httpService'
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  RoleResponse,
  UpdateRolePermissionsRequest,
  TherapistOption,
} from '@/types'

const staffService = {
  // ── Users（契約 7.1）────────────────────────────
  getUsers(): Promise<UserResponse[]> {
    return httpService.get<UserResponse[]>('/users')
  },
  getUser(id: number): Promise<UserResponse> {
    return httpService.get<UserResponse>(`/users/${id}`)
  },
  createUser(payload: CreateUserRequest): Promise<UserResponse> {
    return httpService.post<UserResponse>('/users', payload)
  },
  updateUser(id: number, payload: UpdateUserRequest): Promise<UserResponse> {
    return httpService.put<UserResponse>(`/users/${id}`, payload)
  },
  deleteUser(id: number): Promise<void> {
    return httpService.delete<void>(`/users/${id}`)
  },
  toggleUserActive(id: number): Promise<UserResponse> {
    return httpService.patch<UserResponse>(`/users/${id}/toggle-active`)
  },
  // 排班、預約、考核頁的心理師下拉選單（不需 staff.manage）
  getTherapistOptions(): Promise<TherapistOption[]> {
    return httpService.get<TherapistOption[]>('/therapists')
  },
  resetPassword(id: number, payload: ResetPasswordRequest): Promise<void> {
    return httpService.post<void>(`/users/${id}/reset-password`, payload)
  },

  // ── Roles & Permissions（契約 7.2）──────────────
  getRoles(): Promise<RoleResponse[]> {
    return httpService.get<RoleResponse[]>('/roles')
  },
  updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsRequest,
  ): Promise<RoleResponse> {
    return httpService.put<RoleResponse>(`/roles/${roleId}/permissions`, payload)
  },
}

export default staffService
