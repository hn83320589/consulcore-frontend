import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, RoleCode } from '@/types'

/**
 * 需要「改登入狀態 + 換頁」的操作。authStore 只管狀態（不在 store 內導航），
 * 換頁統一在這裡處理，頁面與元件呼叫這些函式即可。
 */
export function useAuthActions() {
  const authStore = useAuthStore()
  const router = useRouter()

  return {
    async login(payload: LoginRequest) {
      await router.push(await authStore.login(payload))
    },
    async logout() {
      authStore.logout()
      await router.push('/login')
    },
    async switchRole(role: RoleCode) {
      await router.push(await authStore.switchRole(role))
    },
    /** 改密碼後需重新登入才會換發 token（契約 4.4） */
    async changePassword(currentPassword: string, newPassword: string) {
      await authStore.changePassword(currentPassword, newPassword)
      await router.push('/login')
    },
  }
}
