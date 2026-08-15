import { defineStore } from 'pinia'
import { ref } from 'vue'
import staffService from '@/services/staffService'
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  RoleResponse,
} from '@/types'

export const useStaffStore = defineStore('staff', () => {
  // ── State ──────────────────────────────────
  const users = ref<UserResponse[]>([])
  const roles = ref<RoleResponse[]>([])
  const loading = ref(false)

  // ── Users ──────────────────────────────────
  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await staffService.getUsers()
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: CreateUserRequest) {
    const created = await staffService.createUser(payload)
    users.value.push(created)
    return created
  }

  async function updateUser(id: number, payload: UpdateUserRequest) {
    const updated = await staffService.updateUser(id, payload)
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = updated
    return updated
  }

  async function toggleUserActive(id: number) {
    const updated = await staffService.toggleUserActive(id)
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = updated
    return updated
  }

  async function resetPassword(id: number, payload: ResetPasswordRequest) {
    await staffService.resetPassword(id, payload)
  }

  // ── Roles & Permissions ────────────────────
  async function fetchRoles() {
    roles.value = await staffService.getRoles()
  }

  async function updateRolePermissions(roleId: number, permissionCodes: string[]) {
    const updated = await staffService.updateRolePermissions(roleId, { permissionCodes })
    const idx = roles.value.findIndex((r) => r.id === roleId)
    if (idx !== -1) roles.value[idx] = updated
    return updated
  }

  return {
    users,
    roles,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserActive,
    resetPassword,
    fetchRoles,
    updateRolePermissions,
  }
})
