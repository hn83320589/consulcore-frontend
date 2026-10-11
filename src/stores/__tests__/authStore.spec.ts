import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import type { CurrentUser, LoginResponse } from '@/types'

// R12：store 只管狀態，不再自己跳頁；login / switchRole 回傳下一步路徑，由呼叫端導航

vi.mock('@/services/authService', () => ({
  default: { login: vi.fn(), getMe: vi.fn(), changePassword: vi.fn() },
}))

const { default: authService } = await import('@/services/authService')
const { useAuthStore } = await import('@/stores/authStore')

function loginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    token: 'jwt-token',
    userId: 7,
    username: 'ther_a',
    displayName: '陳心理師',
    email: 'a@test.local',
    organizationId: 1,
    organizationName: '全心諮商所',
    roles: ['therapist'],
    mustChangePassword: false,
    ...overrides,
  }
}

function me(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: 7,
    username: 'ther_a',
    email: 'a@test.local',
    displayName: '陳心理師',
    organizationId: 1,
    organizationName: '全心諮商所',
    roles: ['therapist'],
    permissions: ['client.view', 'session.view'],
    ...overrides,
  }
}

describe('authStore', () => {
  beforeEach(() => {
    setUpTestPinia()
    vi.clearAllMocks()
  })

  it('單一角色登入：自動設為作用中角色、向 /me 取權限並進入該角色的 dashboard', async () => {
    vi.mocked(authService.login).mockResolvedValue(loginResponse())
    vi.mocked(authService.getMe).mockResolvedValue(me())
    const store = useAuthStore()

    const next = await store.login({ username: 'ther_a', password: 'x' })

    expect(store.token).toBe('jwt-token')
    expect(store.activeRole).toBe('therapist')
    expect(store.permissions).toEqual(['client.view', 'session.view'])
    expect(next).toBe('/admin/dashboard')
  })

  it('多角色登入：不自動選角色，導向選角色頁，也不先抓 /me', async () => {
    vi.mocked(authService.login).mockResolvedValue(loginResponse({ roles: ['therapist', 'client'] }))
    const store = useAuthStore()

    const next = await store.login({ username: 'ther_a', password: 'x' })

    expect(store.activeRole).toBeNull()
    expect(store.hasMultipleRoles).toBe(true)
    expect(authService.getMe).not.toHaveBeenCalled()
    expect(next).toBe('/select-role')
  })

  it('預設密碼登入：導向改密碼頁，不抓 /me', async () => {
    vi.mocked(authService.login).mockResolvedValue(
      loginResponse({ roles: ['client'], mustChangePassword: true }),
    )
    const store = useAuthStore()

    const next = await store.login({ username: 'client_1', password: 'x' })

    expect(store.mustChangePassword).toBe(true)
    expect(authService.getMe).not.toHaveBeenCalled()
    expect(next).toBe('/change-password')
  })

  it('個案角色進入個案端 dashboard', async () => {
    vi.mocked(authService.login).mockResolvedValue(loginResponse({ roles: ['client'] }))
    vi.mocked(authService.getMe).mockResolvedValue(me({ roles: ['client'], clientProfileId: 42 }))
    const store = useAuthStore()

    const next = await store.login({ username: 'client_1', password: 'x' })

    expect(store.clientProfileId).toBe(42)
    expect(next).toBe('/client/dashboard')
  })

  it('/me 失敗時清除登入狀態並回報失敗，由呼叫端決定去向', async () => {
    vi.mocked(authService.getMe).mockRejectedValue(new Error('network'))
    const store = useAuthStore()
    store.token = 'jwt-token'
    store.activeRole = 'therapist'

    const ok = await store.fetchMe()

    expect(ok).toBe(false)
    expect(store.token).toBeNull()
    expect(store.activeRole).toBeNull()
  })

  it('切換角色：更新作用中角色、重新取權限並進入新角色的 dashboard', async () => {
    vi.mocked(authService.getMe).mockResolvedValue(me({ roles: ['therapist', 'client'], permissions: [] }))
    const store = useAuthStore()
    store.token = 'jwt-token'

    const next = await store.switchRole('client')

    expect(store.activeRole).toBe('client')
    expect(authService.getMe).toHaveBeenCalledOnce()
    expect(next).toBe('/client/dashboard')
  })

  it('改密碼成功後登出，要求重新登入換發 token', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue()
    const store = useAuthStore()
    store.token = 'jwt-token'

    await store.changePassword('old-pass', 'new-pass-123')

    expect(authService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'old-pass',
      newPassword: 'new-pass-123',
    })
    expect(store.token).toBeNull()
  })

  it('hasPermission 只認 /me 回傳的權限碼', () => {
    const store = useAuthStore()
    store.permissions = ['client.view']

    expect(store.hasPermission('client.view')).toBe(true)
    expect(store.hasPermission('staff.manage')).toBe(false)
  })
})
