import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { registerAuthProvider } from '@/services/httpService'
import { resetUserData } from './resetUserData'
import { dashboardPathFor } from '@/router/navigation'
import type { User, RoleCode, LoginRequest } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // ── State ──────────────────────────────────
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)
    const roles = ref<string[]>([])
    const activeRole = ref<RoleCode | null>(null)
    const permissions = ref<string[]>([])
    const mustChangePassword = ref(false)
    // 個案端查自己資料用；僅來自 /me，userId ≠ clientProfileId
    const clientProfileId = ref<number | null>(null)

    // 讓 httpService 攔截器直接讀當下狀態（避免 localStorage 非同步落後）
    registerAuthProvider(() => ({ token: token.value, activeRole: activeRole.value }))

    // ── Getters ────────────────────────────────
    const isAuthenticated = computed(() => !!token.value)
    const hasMultipleRoles = computed(() => roles.value.length > 1)
    const activeOrganizationId = computed(() => user.value?.organizationId ?? null)

    // ── Actions ────────────────────────────────
    // 只管登入狀態，不負責導航：回傳下一步該去的路徑，由呼叫端（useAuthActions / 路由守衛）跳轉
    async function login(payload: LoginRequest): Promise<string> {
      const res = await authService.login(payload)
      token.value = res.token
      // LoginResponse 為扁平結構，由欄位組出 user
      user.value = {
        id: res.userId,
        username: res.username,
        displayName: res.displayName,
        email: res.email,
        organizationId: res.organizationId,
        organizationName: res.organizationName,
      }
      roles.value = res.roles
      mustChangePassword.value = res.mustChangePassword
      // 單角色時直接設為作用中角色（權限之後由 fetchMe 補）
      activeRole.value = res.roles.length === 1 ? (res.roles[0] as RoleCode) : null
      // 登入回應「不含」permissions，清空以待 fetchMe
      permissions.value = []

      if (res.mustChangePassword) return '/change-password'
      if (!activeRole.value) return '/select-role'
      return (await fetchMe()) ? getDashboardPath(activeRole.value) : '/login'
    }

    /** 取得目前使用者與權限；失敗時清除登入狀態並回傳 false */
    async function fetchMe(): Promise<boolean> {
      try {
        const res = await authService.getMe()
        user.value = {
          id: res.id,
          username: res.username,
          displayName: res.displayName,
          email: res.email,
          phone: res.phone,
          organizationId: res.organizationId,
          organizationName: res.organizationName,
        }
        roles.value = res.roles
        permissions.value = res.permissions // /me 是 permissions 唯一來源
        clientProfileId.value = res.clientProfileId ?? null
        return true
      } catch {
        logout()
        return false
      }
    }

    function logout() {
      // 契約無 /auth/logout 端點，登出為純前端清除狀態
      token.value = null
      user.value = null
      roles.value = []
      activeRole.value = null
      permissions.value = []
      mustChangePassword.value = false
      clientProfileId.value = null
      resetUserData()
    }

    async function switchRole(role: RoleCode): Promise<string> {
      activeRole.value = role
      // 另一個身份不應看到前一個身份載入的資料（例如治療師的個案清單）
      resetUserData()
      // 切換角色後重新取得該角色的權限
      return (await fetchMe()) ? getDashboardPath(role) : '/login'
    }

    async function changePassword(currentPassword: string, newPassword: string) {
      await authService.changePassword({ currentPassword, newPassword })
      // 契約要求改密碼後重新登入才換發新 token
      logout()
    }

    function hasPermission(code: string): boolean {
      return permissions.value.includes(code)
    }

    function getDashboardPath(role: RoleCode): string {
      return dashboardPathFor(role)
    }

    return {
      token,
      user,
      roles,
      activeRole,
      permissions,
      mustChangePassword,
      clientProfileId,
      isAuthenticated,
      hasMultipleRoles,
      activeOrganizationId,
      login,
      fetchMe,
      logout,
      switchRole,
      changePassword,
      hasPermission,
      getDashboardPath,
    }
  },
  {
    persist: {
      pick: ['token', 'user', 'roles', 'activeRole', 'mustChangePassword'],
    },
  },
)
