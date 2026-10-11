import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/services/authService', () => ({
  default: {
    login: vi.fn().mockResolvedValue({
      token: 't', userId: 1, username: 'u', displayName: 'U', email: 'u@x', organizationId: 1,
      organizationName: 'O', roles: ['therapist', 'client'], mustChangePassword: false,
    }),
    getMe: vi.fn().mockResolvedValue({ roles: ['therapist', 'client'], permissions: [] }),
    changePassword: vi.fn().mockResolvedValue(undefined),
  },
}))

const { useAuthActions } = await import('@/composables/useAuthActions')
const { useAuthStore } = await import('@/stores/authStore')

// R12：「改狀態 + 跳頁」由 composable 負責，store 只管狀態
describe('useAuthActions', () => {
  beforeEach(() => {
    setUpTestPinia()
    vi.clearAllMocks()
  })

  it('登入後前往 store 決定的下一步', async () => {
    await useAuthActions().login({ username: 'u', password: 'p' })

    expect(push).toHaveBeenCalledWith('/select-role')
  })

  it('登出後回到登入頁', async () => {
    useAuthStore().token = 't'

    await useAuthActions().logout()

    expect(useAuthStore().token).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('切換角色後前往該角色的首頁', async () => {
    useAuthStore().token = 't'

    await useAuthActions().switchRole('client')

    expect(push).toHaveBeenCalledWith('/client/dashboard')
  })

  it('改密碼後要求重新登入', async () => {
    useAuthStore().token = 't'

    await useAuthActions().changePassword('old', 'new-pass-1')

    expect(useAuthStore().token).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
  })
})
