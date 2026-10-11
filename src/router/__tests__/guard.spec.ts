import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import type { RoleCode } from '@/types'

// 記錄路由守衛的現行行為（characterization）：Phase 3 抽成純函式時以此為安全網。
// 使用真實的 router 與全部路由，順便確認所有頁面模組都能被載入。
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
    setUpTestPinia()
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

  // F4：路由依 meta.permission 擋下，不再只靠側欄隱藏
  it('沒有該頁權限時，直接輸入網址會被導回 dashboard', async () => {
    signIn({ activeRole: 'therapist', permissions: ['client.view'] })

    expect(await navigate('/admin/audit-log')).toBe('/admin/dashboard')
  })

  it('有該頁權限時可以進入', async () => {
    signIn({ activeRole: 'owner', permissions: ['audit.view'] })

    expect(await navigate('/admin/audit-log')).toBe('/admin/audit-log')
  })

  it('動態路由（個案詳情）同樣檢查權限', async () => {
    signIn({ activeRole: 'therapist', permissions: ['appointment.view'] })

    expect(await navigate('/admin/clients/3')).toBe('/admin/dashboard')
  })

  it('後台除了 dashboard，每一頁都必須宣告所需權限', () => {
    const admin = router.getRoutes().filter((r) => r.path.startsWith('/admin/'))
    const missing = admin.filter((r) => r.path !== '/admin/dashboard' && !r.meta.permission).map((r) => r.path)

    expect(admin.length).toBeGreaterThan(10)
    expect(missing).toEqual([])
  })

  it('補抓權限失敗時回到登入頁，不放行到受保護頁面', async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error('network'))
    signIn({ activeRole: 'owner', permissions: [] })

    expect(await navigate('/admin/clients')).toBe('/login')
  })

  it('設定頁面標題', async () => {
    signIn({ activeRole: 'owner' })
    await navigate('/admin/clients')

    expect(document.title).toBe('諮心管理 — 個案管理')
  })
})
