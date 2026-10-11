import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setUpTestPinia } from '@/stores/__tests__/testPinia'
import type { ClientProfile } from '@/types'

// F5：登出或切換角色後，上一位使用者（或上一個角色）的個案、晤談紀錄、收費資料
// 原本仍留在記憶體中的各 store；共用電腦上下一位登入者可能短暫看到
vi.mock('@/services/authService', () => ({
  default: { getMe: vi.fn().mockResolvedValue({ roles: ['therapist', 'client'], permissions: [] }) },
}))

const { useAuthStore } = await import('@/stores/authStore')
const { useClientStore } = await import('@/stores/clientStore')
const { useSessionNoteStore } = await import('@/stores/sessionNoteStore')
const { useUiStore } = await import('@/stores/uiStore')

function fillUserData() {
  useClientStore().clients = [{ id: 1, name: '王小明' } as ClientProfile]
  useClientStore().currentClient = { id: 1, name: '王小明' } as ClientProfile
  useSessionNoteStore().notes = [{ id: 9 }] as never
}

describe('登出 / 切換角色時清除使用者資料', () => {
  beforeEach(() => {
    setUpTestPinia()
    vi.clearAllMocks()
  })

  it('$reset 讓 setup store 回到初始狀態', () => {
    fillUserData()

    useClientStore().$reset()

    expect(useClientStore().clients).toEqual([])
    expect(useClientStore().currentClient).toBeNull()
  })

  it('登出清空其他 store 的資料', () => {
    fillUserData()

    useAuthStore().logout()

    expect(useClientStore().clients).toEqual([])
    expect(useSessionNoteStore().notes).toEqual([])
  })

  it('切換角色也清空，避免另一個身份看到前一個身份的資料', async () => {
    fillUserData()
    const auth = useAuthStore()
    auth.token = 'jwt'

    await auth.switchRole('client')

    expect(useClientStore().clients).toEqual([])
    expect(useClientStore().currentClient).toBeNull()
  })

  it('不清除介面狀態（例如側欄收合）', () => {
    useUiStore().sidebarCollapsed = true

    useAuthStore().logout()

    expect(useUiStore().sidebarCollapsed).toBe(true)
  })
})
