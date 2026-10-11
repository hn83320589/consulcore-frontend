import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RoleCode } from '@/types'

// 記錄路由守衛的現行行為（characterization）：Phase 3 抽成純函式時以此為安全網。
// 使用真實的 router 與全部路由，順便確認所有頁面模組都能被載入。
// authStore 在 setup 內呼叫 useRouter()（測試中不在元件內，inject 取不到），只替換這個函式
vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/services/authService', () => ({
  default: { login: vi.fn(), getMe: vi.fn(), changePassword: vi.fn() },
}))

const { default: authService } = await import('@/services/authService')
const { default: router } = await import('@/router')
const { useAuthStore } = await import('@/stores/authStore')

interface AuthState {
  token?: string | null
  roles?: string[]
  activeRole?: RoleCode | null
  permissions?: string[]
  mustChangePassword?: boolean
}

function signIn(state: AuthState) {
  const store = useAuthStore()
  store.token = state.token === undefined ? 'jwt-token' : state.token
  store.roles = state.roles ?? (state.activeRole ? [state.activeRole] : [])
  store.activeRole = state.activeRole ?? null
  store.permissions = state.permissions ?? ['client.view']
  store.mustChangePassword = state.mustChangePassword ?? false
  return store
}

async function navigate(path: string) {
  await router.push(path)
  return router.currentRoute.value.path
}

describe('路由守衛', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // 每個案例從未登入的登入頁開始，避免前一個案例的位置影響結果
    signIn({ token: null })
    await router.replace('/login')
  })

  it('未登入進後台 → 登入頁', async () => {
    expect(await navigate('/admin/dashboard')).toBe('/login')
  })

  it('未登入進個案端 → 登入頁', async () => {
    expect(await navigate('/client/appointments')).toBe('/login')
  })

  it('未知路徑 → 登入頁', async () => {
    expect(await navigate('/no-such-page')).toBe('/login')
  })

  it('已登入且已選角色時進登入頁 → 該角色 dashboard', async () => {
    signIn({ activeRole: 'therapist' })
    await navigate('/admin/clients')

    expect(await navigate('/login')).toBe('/admin/dashboard')
  })

  it('需要改密碼時，任何受保護頁都導向改密碼頁', async () => {
    signIn({ activeRole: 'client', mustChangePassword: true })

    expect(await navigate('/client/dashboard')).toBe('/change-password')
  })

  it('多角色尚未選角色 → 選角色頁', async () => {
    signIn({ roles: ['therapist', 'client'], activeRole: null })

    expect(await navigate('/admin/clients')).toBe('/select-role')
  })

  it('機構角色可進後台頁面', async () => {
    signIn({ activeRole: 'owner' })

    expect(await navigate('/admin/clients')).toBe('/admin/clients')
  })

  it('個案進後台 → 個案端 dashboard', async () => {
    signIn({ activeRole: 'client' })

    expect(await navigate('/admin/staff')).toBe('/client/dashboard')
  })

  it('機構角色進個案端 → 後台 dashboard', async () => {
    signIn({ activeRole: 'therapist' })

    expect(await navigate('/client/appointments')).toBe('/admin/dashboard')
  })

  it('重整後權限為空時，先向 /me 補抓權限再放行', async () => {
    vi.mocked(authService.getMe).mockResolvedValue({
      id: 1,
      username: 'owner1',
      email: 'o@test.local',
      displayName: '王所長',
      organizationId: 1,
      organizationName: '全心諮商所',
      roles: ['owner'],
      permissions: ['client.view', 'staff.manage'],
    })
    const store = signIn({ activeRole: 'owner', permissions: [] })

    expect(await navigate('/admin/clients')).toBe('/admin/clients')
    expect(authService.getMe).toHaveBeenCalledOnce()
    expect(store.permissions).toContain('staff.manage')
  })

  // 現況：路由只檢查角色、不檢查權限碼（側欄隱藏不等於擋網址）。
  // Phase 2 的 F4 會改為依權限擋下，屆時此案例要跟著改成「導回 dashboard」。
  it('現況：沒有 audit.view 權限的治療師仍可直接用網址進入稽核頁', async () => {
    signIn({ activeRole: 'therapist', permissions: ['client.view'] })

    expect(await navigate('/admin/audit-log')).toBe('/admin/audit-log')
  })

  it('設定頁面標題', async () => {
    signIn({ activeRole: 'owner' })
    await navigate('/admin/clients')

    expect(document.title).toBe('諮心管理 — 個案管理')
  })
})
